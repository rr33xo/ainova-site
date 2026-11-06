// Booking and contact forms for VFM NOVA client websites. No customer details stay in the browser.
//   <div data-vfm-booking="client-id" data-fallback="Please call (555) 010-0142."></div>
//   <div data-vfm-message="client-id" data-fallback="Please call (555) 010-0142."></div>
// Optional: data-button-class="btn dark" uses the site's own button style.
(function () {
  var URL_ = 'https://script.google.com/macros/s/AKfycbz2uYeT74IwMLoOMVEetmizFSldE6y-jfiuzdmMKh6B4aaxl8losOblW8wt8281hQ_S/exec';
  var count = 0;

  function el(tag, props, kids) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') node.textContent = props[k];
      else if (k in node && k !== 'list') node[k] = props[k];
      else node.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (kid) { node.appendChild(kid); });
    return node;
  }

  function field(prefix, key, label, input) {
    count += 1;
    input.id = prefix + '-' + key + '-' + count;
    input.name = key;
    return el('div', { className: 'vfm-field' }, [el('label', { htmlFor: input.id, text: label }), input]);
  }

  function trap() {
    // Hidden from people. Bots that fill it in are ignored.
    var box = el('div', { 'aria-hidden': 'true', style: 'display:none' });
    box.appendChild(el('input', { name: 'company-site', tabIndex: -1, autocomplete: 'off' }));
    return box;
  }

  function post(values) {
    return fetch(URL_, { method: 'POST', body: new URLSearchParams(values), signal: AbortSignal.timeout(120000) }).then(function (r) { return r.json(); });
  }

  function get(values) {
    return fetch(URL_ + '?' + new URLSearchParams(values).toString(), { signal: AbortSignal.timeout(30000) }).then(function (r) { return r.json(); });
  }

  function values(form, extra) {
    var out = {};
    new FormData(form).forEach(function (v, k) { out[k] = v; });
    Object.keys(extra).forEach(function (k) { out[k] = extra[k]; });
    return out;
  }

  function say(box, text, isError) {
    box.textContent = text;
    box.hidden = false;
    box.className = 'vfm-status' + (isError ? ' vfm-status--error' : '');
    box.focus();
  }

  function newRequest() {
    var bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function cancelMessage(error, fallback) {
    if (error === 'too-late') return 'It is too close to your visit to cancel online. ' + fallback;
    if (error === 'not-found') return 'We could not find that booking. Please check the number and code, or it may already be cancelled. ' + fallback;
    return 'We could not cancel that booking. ' + fallback;
  }

  function stamp(iso) {
    return iso.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  }

  function buildBooking(root) {
    var client = root.getAttribute('data-vfm-booking');
    var fallback = root.getAttribute('data-fallback') || 'Please contact the business directly.';
    var buttonClass = root.getAttribute('data-button-class') || '';
    var status = el('div', { className: 'vfm-status', tabIndex: -1, role: 'status', hidden: true });
    root.appendChild(el('p', { className: 'vfm-loading', text: 'Loading times…' }));
    root.appendChild(status);

    get({ action: 'client-info', client: client }).then(function (info) {
      root.querySelector('.vfm-loading').remove();
      if (!info.ok) throw new Error('unavailable');
      var service = el('select', { required: true }, [el('option', { value: '', text: 'Choose a service' })]);
      info.services.forEach(function (s) {
        service.appendChild(el('option', { value: s.key, text: s.name + ', $' + s.price + ' (' + s.minutes + ' minutes)' }));
      });
      var day = el('select', { required: true, disabled: true }, [el('option', { value: '', text: 'Choose a service first' })]);
      var time = el('select', { required: true, disabled: true }, [el('option', { value: '', text: 'Choose a day first' })]);
      var times = [];
      var request = newRequest();
      var shown = null;
      var latest = 0;

      function showCancelled() {
        shown.box.innerHTML = '';
        shown.box.appendChild(el('p', {}, [el('strong', { text: 'Your booking is cancelled.' })]));
        var again = el('button', { type: 'button', className: buttonClass, text: 'Book another time' });
        shown.box.appendChild(el('p', {}, [again]));
        var box = shown.box;
        again.addEventListener('click', function () {
          box.remove();
          shown = null;
          status.hidden = true;
          form.reset();
          form.hidden = false;
          loadTimes();
        });
      }
      var form = el('form', { className: 'vfm-form' }, [
        field('vfm', 'service', 'Service', service),
        field('vfm', 'day', 'Day', day),
        field('vfm', 'start', 'Start time', time),
        field('vfm', 'name', 'Your name', el('input', { required: true, autocomplete: 'name', maxLength: 200 })),
        field('vfm', 'phone', 'Phone', el('input', { required: true, type: 'tel', autocomplete: 'tel', maxLength: 60 })),
        field('vfm', 'email', 'Email', el('input', { required: true, type: 'email', autocomplete: 'email', maxLength: 200 })),
      ]);
      info.questions.forEach(function (q) {
        var input = q.type === 'long' ? el('textarea', { rows: 4, maxLength: 1000 }) : el('input', q.type === 'number' ? { type: 'number', step: 'any', min: '0' } : { type: 'text', maxLength: 1000 });
        input.required = !!q.required;
        form.appendChild(field('vfm', 'q-' + q.key, q.label, input));
      });
      form.appendChild(trap());
      var send = el('button', { type: 'submit', className: buttonClass, text: 'Book this time' });
      form.appendChild(el('p', {}, [send]));
      root.insertBefore(form, status);

      var later = el('details', { className: 'vfm-cancel-later' });
      later.appendChild(el('summary', { text: 'Already booked? Cancel a booking' }));
      var laterSend = el('button', { type: 'submit', className: buttonClass, text: 'Cancel my booking' });
      var laterForm = el('form', {}, [
        field('vfm-c', 'booking', 'Booking number', el('input', { required: true, maxLength: 20 })),
        field('vfm-c', 'code', 'Cancel code', el('input', { required: true, maxLength: 40 })),
        el('p', {}, [laterSend]),
      ]);
      later.appendChild(laterForm);
      root.appendChild(later);
      laterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        laterSend.disabled = true;
        post(values(laterForm, { 'form-name': 'client-booking-cancel', client: client })).then(function (r) {
          laterSend.disabled = false;
          if (!r.ok) return say(status, cancelMessage(r.error, fallback), true);
          if (shown && shown.booking === String(values(laterForm, {}).booking).trim().toUpperCase()) showCancelled();
          laterForm.reset();
          say(status, 'Your booking is cancelled.');
        }).catch(function () {
          laterSend.disabled = false;
          say(status, 'We could not confirm your cancellation. Press the button again to check. ' + fallback, true);
        });
      });

      function fillTimes() {
        time.innerHTML = '';
        time.appendChild(el('option', { value: '', text: 'Choose a time' }));
        times.filter(function (t) { return t.date === day.value; }).forEach(function (t) {
          time.appendChild(el('option', { value: t.start, text: t.time }));
        });
        time.disabled = !day.value;
      }

      function loadTimes() {
        var ticket = ++latest;
        status.hidden = true;
        request = newRequest();
        day.disabled = true;
        time.disabled = true;
        day.innerHTML = '';
        day.appendChild(el('option', { value: '', text: service.value ? 'Loading days…' : 'Choose a service first' }));
        time.innerHTML = '';
        time.appendChild(el('option', { value: '', text: 'Choose a day first' }));
        if (!service.value) return Promise.resolve();
        return get({ action: 'client-times', client: client, service: service.value }).then(function (reply) {
          if (ticket !== latest) return;
          if (!reply.ok) throw new Error('times');
          times = reply.times;
          day.innerHTML = '';
          day.appendChild(el('option', { value: '', text: times.length ? 'Choose a day' : 'No open times right now' }));
          var seen = {};
          times.forEach(function (t) {
            if (seen[t.date]) return;
            seen[t.date] = true;
            day.appendChild(el('option', { value: t.date, text: t.day }));
          });
          day.disabled = !times.length;
        }).catch(function () {
          if (ticket !== latest) return;
          day.innerHTML = '';
          day.appendChild(el('option', { value: '', text: 'Times could not load' }));
          say(status, 'We could not load the times. ' + fallback, true);
        });
      }

      service.addEventListener('change', loadTimes);
      day.addEventListener('change', function () { request = newRequest(); fillTimes(); });
      time.addEventListener('change', function () { request = newRequest(); });

      function showBooked(reply) {
        form.hidden = true;
        request = newRequest();
        var added = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: reply.service + ', ' + reply.business, dates: stamp(reply.start) + '/' + stamp(reply.end) }).toString();
        var done = el('div', { className: 'vfm-booked' }, [
          el('p', {}, [el('strong', { text: 'You are booked.' })]),
          el('p', { text: reply.service + ', ' + reply.when + '.' }),
          el('p', { text: 'Your booking number is ' + reply.booking + ' and your cancel code is ' + reply.cancelCode + '. ' + (reply.emailed ? 'We also emailed these to you. Please check your spam folder if you do not see it.' : 'Please save both. You need them to cancel.') }),
          el('p', {}, [el('a', { href: added, target: '_blank', rel: 'noopener', text: 'Add to Google Calendar' })]),
        ]);
        var cancel = el('button', { type: 'button', className: buttonClass, text: 'Cancel this booking' });
        var note = reply.cancelHours ? 'You can cancel on this page up to ' + reply.cancelHours + ' hours before your visit.' : 'You can cancel on this page before your visit.';
        done.appendChild(el('p', { text: note }));
        done.appendChild(el('p', {}, [cancel]));
        cancel.addEventListener('click', function () {
          cancel.disabled = true;
          post({ 'form-name': 'client-booking-cancel', client: client, booking: reply.booking, code: reply.cancelCode }).then(function (r) {
            if (r.ok) {
              showCancelled();
              status.hidden = true;
            } else {
              cancel.disabled = false;
              say(status, cancelMessage(r.error, fallback), true);
            }
          }).catch(function () {
            cancel.disabled = false;
            say(status, 'We could not confirm your cancellation. Press the button again to check. ' + fallback, true);
          });
        });
        shown = { box: done, booking: reply.booking };
        root.insertBefore(done, status);
        status.hidden = true;
        done.scrollIntoView({ block: 'nearest' });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        send.disabled = true;
        send.textContent = 'Booking…';
        post(values(form, { 'form-name': 'client-booking', client: client, request: request })).then(function (reply) {
          send.disabled = false;
          send.textContent = 'Book this time';
          if (reply.ok) return showBooked(reply);
          if (reply.error === 'taken') {
            request = newRequest();
            say(status, 'Someone just took that time. Please choose another.', true);
            return loadTimes();
          }
          if (reply.error === 'too-many') return say(status, 'You already have several open bookings. ' + fallback, true);
          say(status, (reply.error === 'missing' ? 'Please check that everything is filled in correctly, including your phone number.' : 'We could not book that time. ' + fallback), true);
        }).catch(function () {
          send.disabled = false;
          send.textContent = 'Book this time';
          say(status, 'We could not confirm your booking. Press the button again to check. You will not be booked twice. ' + fallback, true);
        });
      });
    }).catch(function () {
      var loading = root.querySelector('.vfm-loading');
      if (loading) loading.remove();
      say(status, 'Online booking is not available right now. ' + fallback, true);
    });
  }

  function buildMessage(root) {
    var client = root.getAttribute('data-vfm-message');
    var fallback = root.getAttribute('data-fallback') || 'Please contact the business directly.';
    var status = el('div', { className: 'vfm-status', tabIndex: -1, role: 'status', hidden: true });
    var send = el('button', { type: 'submit', className: root.getAttribute('data-button-class') || '', text: 'Send message' });
    var request = newRequest();
    var form = el('form', { className: 'vfm-form' }, [
      field('vfm-m', 'name', 'Your name', el('input', { required: true, autocomplete: 'name', maxLength: 200 })),
      field('vfm-m', 'email', 'Your email', el('input', { required: true, type: 'email', autocomplete: 'email', maxLength: 200 })),
      field('vfm-m', 'message', 'Message', el('textarea', { required: true, rows: 5, maxLength: 5000 })),
      trap(),
      el('p', {}, [send]),
    ]);
    root.appendChild(form);
    root.appendChild(status);
    form.addEventListener('input', function () { request = newRequest(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send.disabled = true;
      post(values(form, { 'form-name': 'client-message', client: client, request: request })).then(function (reply) {
        send.disabled = false;
        if (!reply.ok) return say(status, 'Your message did not send. ' + fallback, true);
        form.reset();
        request = newRequest();
        say(status, 'Thanks, your message was sent.');
      }).catch(function () {
        send.disabled = false;
        say(status, 'We could not confirm your message was sent. Press the button again to check. It will not send twice. ' + fallback, true);
      });
    });
  }

  document.querySelectorAll('[data-vfm-booking]').forEach(buildBooking);
  document.querySelectorAll('[data-vfm-message]').forEach(buildMessage);
})();
