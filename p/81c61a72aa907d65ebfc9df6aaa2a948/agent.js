// Johnson's HVAC Service: booking assistant and page behavior.
// Bookings go to the VFM NOVA booking service (Client Sites row "johnsons-hvac").
(function () {
  // Joey's phone number. Leave empty to hide every Call button.
  var PHONE = '(209) 687-4693';
  var CLIENT = 'johnsons-hvac';
  var API = 'https://script.google.com/macros/s/AKfycbz2uYeT74IwMLoOMVEetmizFSldE6y-jfiuzdmMKh6B4aaxl8losOblW8wt8281hQ_S/exec';
  var FALLBACK = PHONE ? 'Please call ' + PHONE + '.' : 'Please try again in a few minutes.';
  var preview = !!document.querySelector('link[href*="preview-lock"]');
  if (preview) document.body.classList.add('is-preview');

  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
  document.querySelectorAll('[data-phone]').forEach(function (a) {
    if (!PHONE) return;
    a.href = 'tel:' + PHONE.replace(/[^\d+]/g, '');
    a.textContent = 'Call ' + PHONE;
    a.hidden = false;
  });

  var menu = document.querySelector('[data-menu]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
  });
  mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) { mobileNav.hidden = true; menu.setAttribute('aria-expanded', 'false'); } });

  var log = document.querySelector('[data-log]');
  var input = document.querySelector('[data-input]');
  var restart = document.querySelector('[data-restart]');
  var agentBox = document.querySelector('[data-agent]');
  var state = {};
  var run = 0;

  var ISSUES = {
    cooling: { label: "My AC isn't cooling", service: 'repair', note: 'AC not cooling' },
    heating: { label: "My heat isn't working", service: 'repair', note: 'Heat not working' },
    noise: { label: 'Strange noise, smell or leak', service: 'repair', note: 'Noise, smell or leak' },
    repair: { label: 'Something needs repair', service: 'repair', note: 'Repair' },
    tuneup: { label: 'I want a tune-up', service: 'tuneup', note: 'Tune-up' },
    estimate: { label: 'New system or replacement', service: 'estimate', note: 'New system estimate' },
    airq: { label: 'Thermostat, ducts or air quality', service: 'airq', note: 'Thermostat, ducts or air quality' },
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function me(text) { log.appendChild(el('div', 'msg msg--me', text)); scroll(); }
  function bot(content, cls, mine) {
    var id = mine;
    return new Promise(function (resolve) {
      var t = el('div', 'msg msg--bot');
      t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      log.appendChild(t); scroll();
      setTimeout(function () {
        if (id !== run) { t.remove(); return; }
        t.className = 'msg msg--bot' + (cls ? ' ' + cls : '');
        t.textContent = '';
        if (typeof content === 'string') t.textContent = content; else t.appendChild(content);
        scroll(); resolve();
      }, 420);
    });
  }
  function options(list, onPick, extraCls) {
    input.innerHTML = '';
    var box = el('div', 'opts' + (extraCls ? ' ' + extraCls : ''));
    list.forEach(function (o) {
      var b = el('button', 'opt' + (o.main ? ' opt--main' : ''), o.label);
      b.type = 'button';
      b.addEventListener('click', function () { input.innerHTML = ''; if (!o.silent) me(o.label); onPick(o.value); });
      box.appendChild(b);
    });
    input.appendChild(box);
  }
  function get(params) {
    return fetch(API + '?' + new URLSearchParams(params).toString(), { signal: AbortSignal.timeout(30000) }).then(function (r) { return r.json(); });
  }
  function post(values) {
    return fetch(API, { method: 'POST', body: new URLSearchParams(values), signal: AbortSignal.timeout(120000) }).then(function (r) { return r.json(); });
  }
  function newRequest() {
    var b = new Uint8Array(12); crypto.getRandomValues(b);
    return Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }

  function start(issueKey) {
    run += 1;
    var id = run;
    state = { request: newRequest() };
    log.innerHTML = '';
    input.innerHTML = '';
    restart.hidden = true;
    if (issueKey && ISSUES[issueKey]) return pickIssue(issueKey, id, true);
    bot("Hi! I'm Johnson's booking assistant. What's going on at your place?", '', id).then(function () {
      options(Object.keys(ISSUES).filter(function (k) { return k !== 'repair'; }).map(function (k) { return { label: ISSUES[k].label, value: k }; }), function (k) { pickIssue(k, id); });
    });
  }

  function pickIssue(key, id, fromButton) {
    state.issue = ISSUES[key];
    restart.hidden = false;
    var first = fromButton ? bot("Hi! I'm Johnson's booking assistant. Let's get you booked.", '', id) : Promise.resolve();
    if (fromButton) first = first.then(function () { me(state.issue.label); });
    first.then(function () {
      if (key === 'heating' || key === 'noise') return bot('Quick safety check: if you smell gas, leave the building and call your gas company or 911 from outside. Otherwise, let\'s keep going.', 'msg--warn', id);
    }).then(function () {
      return bot('Is this for a home or a business?', '', id);
    }).then(function () {
      options([{ label: 'Home', value: 'Home' }, { label: 'Business', value: 'Business' }], function (v) { state.place = v; loadTimes(id); });
    });
  }

  function loadTimes(id) {
    bot('Let me find the next open arrival times…', '', id).then(function () {
      return get({ action: 'client-times', client: CLIENT, service: state.issue.service });
    }).then(function (reply) {
      if (id !== run) return;
      if (!reply.ok) throw new Error('times');
      state.times = reply.times || [];
      if (!state.times.length) return bot('There are no open times online right now. ' + FALLBACK, 'msg--warn', id);
      pickDay(id);
    }).catch(function () {
      if (id !== run) return;
      bot('The schedule could not load. ' + FALLBACK, 'msg--warn', id).then(function () {
        options([{ label: 'Try again', value: 1, main: true }], function () { loadTimes(id); });
      });
    });
  }

  function pickDay(id) {
    var days = [];
    state.times.forEach(function (t) { if (days.indexOf(t.date) < 0) days.push(t.date); });
    days = days.slice(0, 8);
    bot('Which day works best?', '', id).then(function () {
      options(days.map(function (d) {
        var t = state.times.filter(function (x) { return x.date === d; })[0];
        return { label: t.day.replace(/^(\w{3})\w*, (\w{3})\w* /, '$1, $2 '), value: d };
      }), function (d) { state.day = d; pickTime(id); });
    });
  }

  function pickTime(id) {
    var list = state.times.filter(function (t) { return t.date === state.day; });
    bot('Here are the open arrival times. Pick one:', '', id).then(function () {
      var opts = list.map(function (t) { return { label: t.time, value: t }; });
      opts.push({ label: '← Another day', value: null });
      options(opts, function (t) {
        if (!t) return pickDay(id);
        state.time = t;
        state.request = newRequest();
        details(id);
      }, 'times');
    });
  }

  function field(label, name, type, attrs) {
    var l = el('label', '', label);
    var i = type === 'textarea' ? document.createElement('textarea') : type === 'select' ? document.createElement('select') : document.createElement('input');
    if (type !== 'textarea' && type !== 'select') i.type = type;
    i.name = name;
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'options') return; i.setAttribute(k, attrs[k]); });
    if (type === 'select') attrs.options.forEach(function (o) { var op = el('option', '', o || 'Not sure'); op.value = o; i.appendChild(op); });
    l.appendChild(i);
    return l;
  }

  function details(id) {
    bot(state.time.day + ' at ' + state.time.time + ' is open. Just a few details to lock it in.', '', id).then(function () {
      input.innerHTML = '';
      var form = el('form', 'form');
      form.noValidate = true;
      var row1 = el('div', 'row');
      row1.appendChild(field('Your name', 'name', 'text', { autocomplete: 'name', required: '' }));
      row1.appendChild(field('Phone', 'phone', 'tel', { autocomplete: 'tel', required: '', inputmode: 'tel' }));
      form.appendChild(row1);
      form.appendChild(field('Email', 'email', 'email', { autocomplete: 'email', required: '' }));
      form.appendChild(field('Service address', 'q-address', 'text', { autocomplete: 'street-address', required: '' }));
      form.appendChild(field('System type', 'q-system', 'select', { options: ['', 'Central AC', 'Furnace', 'Heat pump', 'Ductless mini-split', 'Boiler', 'Other'] }));
      form.appendChild(field('Anything else Joey should know? (optional)', 'q-issue-extra', 'textarea', { rows: '3', maxlength: '800' }));
      var trap = el('div'); trap.style.display = 'none'; trap.setAttribute('aria-hidden', 'true');
      var ti = document.createElement('input'); ti.name = 'company-site'; ti.tabIndex = -1; ti.autocomplete = 'off'; trap.appendChild(ti); form.appendChild(trap);
      var sum = el('div', 'summary');
      sum.innerHTML = '<b>' + escapeHtml(state.issue.note) + '</b> · ' + escapeHtml(state.place) + '<br>' + escapeHtml(state.time.day) + ', ' + escapeHtml(state.time.time) + ' arrival';
      form.appendChild(sum);
      var send = el('button', 'btn btn--hot', 'Confirm my booking'); send.type = 'submit';
      form.appendChild(send);
      var status = el('p', 'status'); status.setAttribute('role', 'status'); form.appendChild(status);
      input.appendChild(form);
      form.querySelector('input').focus({ preventScroll: true });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (preview) return;
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
        if (!data.name || !data.phone || !data.email || !data['q-address'] || !/^\S+@\S+\.\S+$/.test(data.email) || data.phone.replace(/\D/g, '').length < 10) {
          status.textContent = 'Please add your name, a 10-digit phone number, an email and the service address.';
          return;
        }
        data['q-issue'] = (state.issue.note + ' (' + state.place + ')' + (data['q-issue-extra'] ? '. ' + data['q-issue-extra'] : '')).slice(0, 1000);
        delete data['q-issue-extra'];
        data['form-name'] = 'client-booking'; data.client = CLIENT; data.service = state.issue.service; data.start = state.time.start; data.request = state.request;
        send.disabled = true; send.textContent = 'Booking…'; status.textContent = '';
        post(data).then(function (reply) {
          send.disabled = false; send.textContent = 'Confirm my booking';
          if (reply.ok) return booked(reply, id);
          if (reply.error === 'taken') { status.textContent = 'Someone just took that time. Pick another.'; input.innerHTML = ''; return loadTimes(id); }
          if (reply.error === 'too-many') { status.textContent = 'You already have several open bookings. ' + FALLBACK; return; }
          status.textContent = reply.error === 'missing' ? 'Please check that everything is filled in, including a 10-digit phone number.' : 'We could not book that time. ' + FALLBACK;
        }).catch(function () {
          send.disabled = false; send.textContent = 'Confirm my booking';
          status.textContent = 'We could not confirm your booking. Press the button again. You will not be booked twice.';
        });
      });
    });
  }

  function stamp(iso) { return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function booked(reply, id) {
    input.innerHTML = '';
    var card = el('div', 'booked');
    var cal = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: reply.service + ', ' + reply.business, dates: stamp(reply.start) + '/' + stamp(reply.end) }).toString();
    card.innerHTML = '<h4>You\'re booked! ✅</h4><p>' + escapeHtml(reply.service) + ', ' + escapeHtml(reply.when) + '.</p><p>Booking number <b>' + escapeHtml(reply.booking) + '</b>, cancel code <b>' + escapeHtml(reply.cancelCode) + '</b>. ' + (reply.emailed ? 'We emailed these to you too. Check your spam folder if you don\'t see it.' : 'Please save both. You need them to cancel.') + '</p>';
    var a = el('a', 'btn btn--dark', 'Add to Google Calendar'); a.href = cal; a.target = '_blank'; a.rel = 'noopener';
    var c = el('button', 'btn btn--ghost', 'Cancel this booking'); c.type = 'button';
    var row = el('div', 'opts'); row.appendChild(a); row.appendChild(c); card.appendChild(row);
    var note = el('p', 'status'); card.appendChild(note);
    c.addEventListener('click', function () {
      c.disabled = true;
      post({ 'form-name': 'client-booking-cancel', client: CLIENT, booking: reply.booking, code: reply.cancelCode }).then(function (r) {
        if (r.ok) { card.innerHTML = '<h4>Your booking is cancelled.</h4><p>Book a new time any time.</p>'; restart.hidden = false; }
        else { c.disabled = false; note.textContent = 'We could not cancel online. ' + FALLBACK; }
      }).catch(function () { c.disabled = false; note.textContent = 'We could not confirm the cancellation. Press the button again.'; });
    });
    bot(card, '', id);
  }

  restart.addEventListener('click', function () { start(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-start]');
    if (!b) return;
    document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
    start(b.getAttribute('data-start'));
  });
  start();
  void agentBox;
})();
