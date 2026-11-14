var VFM_TEMPLATE_TYPES = {"Ridgeline":"home","Bright Street":"health","Salt & Ember":"food","Fern":"beauty","Lantern":"property","Iron Hour":"fitness","Alder & Finch":"professional","Torque Lane":"home","Greenway":"home","Morning Loaf":"food","Thread & Fable":"retail","Good Boy":"pets","Quill & Compass":"professional","Hollis Reed":"creative","Solace House":"beauty","Maple Commons":"community","Copper Loft":"events","Tally & Tidy":"professional","Marlowe & Vale":"property","Tidy Wren":"home","Larkspur House":"events","Aurelle":"retail","Harrow":"health","Vane & Oak":"creative","Lucky Lime":"food","Little Acre":"food","Odd Job Otis":"home","Crumb & Clover":"food","Windowsill":"retail","Low Note":"creative"};

var VFM_TYPE_LABELS = {
  home: 'trades and home services', health: 'health and dental', food: 'food businesses', beauty: 'salons, spas and beauty',
  property: 'real estate', fitness: 'gyms and coaches', professional: 'law, finance and consulting', retail: 'shops',
  pets: 'pet care', creative: 'photographers, teachers and creatives', community: 'nonprofits and community groups', events: 'venues and stays'
};

var VFM_TYPE_WORDS = [
  ['pets', /\bpets?\b|dog (walk|train|sit|daycare|board)|groom(er|ing)|\bvet\b|kennel/],
  ['food', /restaurant|cafe|bak(e|er)|food|cater|coffee|truck|vend|taco|grill|bbq|pizza|kitchen|deli|juice|dessert|cake|farm|market stall|farmers market/],
  ['beauty', /salon|barber|hair|nail|spa\b|med ?spa|lash|beauty|tattoo|esthetic/],
  ['health', /dent|doctor|clinic|chiro|therap|medical|physio/],
  ['property', /real ?estate|realt|broker|property/],
  ['fitness', /gym|fitness|trainer|yoga|pilates|boxing|martial/],
  ['professional', /law|legal|attorney|account|bookkeep|consult|insurance|financ|tax/],
  ['retail', /shop|store|boutique|cloth|retail|jewel|gift|plant/],
  ['creative', /photo|music|lesson|tutor|artist|design studio|architect/],
  ['community', /nonprofit|non-profit|church|charity|club|community/],
  ['events', /venue|event|wedding|hotel|\binn\b|bnb|lodge/],
  ['home', /roof|plumb|electric|hvac|contract|landscap|lawn|clean|handyman|mechanic|auto|construction|paint|pool|pest/]
];

function vfmTypeFromWords(text) {
  var words = String(text || '').toLowerCase();
  for (var i = 0; i < VFM_TYPE_WORDS.length; i++) if (VFM_TYPE_WORDS[i][1].test(words)) return VFM_TYPE_WORDS[i][0];
  return '';
}

function vfmTemplateMismatch(template, industry, business) {
  var made = VFM_TEMPLATE_TYPES[template];
  var theirs = vfmTypeFromWords(industry) || vfmTypeFromWords(business);
  if (!made || !theirs || made === theirs) return null;
  return 'Adapt ' + template + ' (its sample is for ' + VFM_TYPE_LABELS[made] + ') to suit ' + VFM_TYPE_LABELS[theirs] + ': new words, pictures and sections.';
}

var VFM_FEATURE_NEEDS = [
  ['starter', 'starter-idea', 'Your business idea'],
  ['starter', 'starter-location', 'Where you will operate'],
  ['booking', 'booking-services', 'What people can book, and how long each takes'],
  ['booking', 'booking-times', 'When people can book'],
  ['assistant', 'assistant-questions', 'What customers ask you most'],
  ['store', 'store-products', 'What you sell'],
  ['store', 'store-delivery', 'How products reach customers'],
  ['crm', 'crm-current', 'Where you keep customer details now'],
  ['automations', 'automation-wishes', 'What should happen by itself'],
  ['search', 'search-goals', 'What people should find you for'],
  ['logo', 'logo-brief', 'What your logo should say and feel like'],
  ['domain', 'domain-choices', 'Web addresses you would like'],
  ['domain', 'domain-owner', 'Whose name the web address goes in'],
  ['folder', 'folder-address', 'Mailing address for your folder'],
  ['design-flyer', 'flyer-text', 'What your flyer should say'],
  ['design-card', 'card-text', 'What your business card should say']
];

function vfmBuildNeeds(get) {
  var needs = [];
  var value = function (name) { return String(get(name) || '').trim(); };
  var need = function (tab, field, label) { needs.push({ tab: tab, field: field, label: label }); };
  var site = value('site-type');
  var addons = value('addons').split(/,\s*/);
  var website = site === 'template' || site === 'custom';
  if (website) {
    if (!value('industry')) need('business', 'industry', 'What kind of business it is');
    if (!value('service-area')) need('business', 'service-area', 'Where you serve customers');
    if (!value('domain-status')) need('business', 'domain-status', 'Whether you have a web address');
    else if (value('domain-status') === 'Yes, I own one' && !value('domain-current')) need('business', 'domain-current', 'Your web address');
    if (site === 'template') {
      if (!value('template')) need('design', 'template', 'Choose a template');
    }
    if (site === 'custom' && !value('custom-style')) need('design', 'custom-style', 'Describe the look you want');
    if (!value('logo-status')) need('design', 'logo-status', 'Whether you have a logo');
    if (!value('photos-status')) need('design', 'photos-status', 'Whether you have images');
    else if (value('photos-status') === "Yes, I'll share links" && !value('photos-links')) need('design', 'photos-links', 'Links to your images');
    else if (value('photos-status') === "Yes, I'll upload them here" && !value('__uploads')) need('design', '__uploads', 'Upload your images, or choose another image option');
    if (!value('pages-wanted')) need('content', 'pages-wanted', 'Which pages you want');
    if (!value('services-list')) need('content', 'services-list', 'Your services or products');
    if (!value('business-different')) need('business', 'business-different', 'About your business: what you do and what makes you different');
    if (!value('business-hours')) need('content', 'business-hours', 'Your business hours');
    if (!value('public-contact')) need('content', 'public-contact', 'Contact details to show on the site');
    if (!value('words-status')) need('content', 'words-status', 'Who writes the words');
    else if (value('words-status') !== 'Please write them for me' && !value('words-text') && !value('files-link')) need('content', 'words-text', 'Your words, or a link to them');
  }
  for (var i = 0; i < VFM_FEATURE_NEEDS.length; i++) {
    var rule = VFM_FEATURE_NEEDS[i];
    if (addons.indexOf(rule[0]) >= 0 && !value(rule[1])) need('features', rule[1], rule[2]);
  }
  var socials = ['social-one', 'social-bundle', 'social-kit'].some(function (key) { return addons.indexOf(key) >= 0; });
  if (socials && !value('social-platforms')) need('service', 'social-platforms', 'Which social profiles you want');
  return needs;
}

const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.append(backdrop);
  const label = toggle.querySelector(".menu-toggle__text");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Close" : "Menu";
    else toggle.textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("menu-open", open);
  };
  backdrop.addEventListener("click", () => setMenu(false));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
  addEventListener("resize", () => { if (innerWidth > 960 && toggle.getAttribute("aria-expanded") === "true") setMenu(false); });
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setMenu(!open);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });
}

const money = (n) => "$" + n.toLocaleString("en-US");

const promoBanner = document.querySelector("[data-promo-until]");
if (promoBanner && Date.now() >= Date.parse(promoBanner.dataset.promoUntil)) promoBanner.hidden = true;

const COUPONS = {
  DESIGN: { percent: 30, cap: 750 },
  HOLIDAY: { percent: 15, until: "2027-01-02T08:00:00Z", terms: "For new customers, through January 1, 2027." },
};
const PARTNER_OFFER = { percent: 15 };
const PARTNER_CODES = new Set();
const privateOffers = new Map();
const partnerCache = new Map();
const checkPartner = async (value) => {
  const code = (value ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{4,20}$/.test(code) || COUPONS[code]) return false;
  if (PARTNER_CODES.has(code)) return true;
  if (!partnerCache.has(code)) {
    partnerCache.set(code, fetch(`${formEndpoint}?action=code&code=${encodeURIComponent(code)}`).then((reply) => reply.json()).then((reply) => {
      if (reply.valid && reply.percent) privateOffers.set(code, { percent: Number(reply.percent), everything: true });
      if (reply.valid && reply.flat) privateOffers.set(code, { percent: 0, flat: Number(reply.flat) });
      return Boolean(reply.valid);
    }).catch(() => false));
  }
  const valid = await partnerCache.get(code);
  if (valid) PARTNER_CODES.add(code);
  return valid;
};
const findOffer = (value) => {
  const code = (value ?? "").trim().toUpperCase();
  const coupon = COUPONS[code];
  if (coupon && !(coupon.until && Date.now() >= Date.parse(coupon.until))) return { code, partner: false, ...coupon };
  if (privateOffers.has(code)) return { code, partner: false, ...privateOffers.get(code) };
  if (PARTNER_CODES.has(code)) return { code, partner: true, ...PARTNER_OFFER };
  return null;
};
const offerSaving = (setup, offer) => {
  if (offer.flat) return Math.max(0, setup - offer.flat);
  const saving = Math.round((setup * offer.percent) / 100);
  return offer.cap ? Math.min(saving, offer.cap) : saving;
};
const offerText = (offer) => offer.flat ? `Code ${offer.code}: your setup total is ${money(offer.flat)}, with no delivery speed fee. It works for one order. Monthly plans stay at their normal price.` : `Code ${offer.code}: ${offer.percent}% off ${offer.everything ? "everything, including monthly plans" : "your setup"}${offer.cap ? `, up to $${offer.cap} off,` : ""}${offer.everything ? "" : ` and ${offer.percent}% off VFM Engine`}.${offer.terms ? ` ${offer.terms}` : ""} Codes can't be combined. We'll show it on your written quote.`;

const formEndpoint = document.querySelector('meta[name="form-endpoint"]')?.content;
const pendingUploads = [];
async function sendForm(target) {
  const combined = new Map();
  const unused = new Set(
    [...target.elements]
      .filter((field) => field.closest("[data-feature][hidden], [data-way][hidden], [data-show-for][hidden], [data-engine-fields][hidden], [data-when][hidden], [data-full-only][hidden], [data-website-only][hidden]"))
      .map((field) => field.name),
  );
  for (const [key, value] of new FormData(target)) {
    if (unused.has(key)) continue;
    combined.set(key, combined.has(key) ? `${combined.get(key)}, ${value}` : value);
  }
  if (target.matches("[data-project-form]") && pendingUploads.length) {
    combined.set("upload-files", JSON.stringify(pendingUploads.map(({ name, type, data }) => ({ name, type, data }))));
  }
  const body = new URLSearchParams([...combined]).toString();
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (formEndpoint) {
    const response = await fetch(formEndpoint, { method: "POST", headers, body });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "failed");
    return result;
  }
  const response = await fetch("/", { method: "POST", headers, body });
  if (!response.ok) throw new Error(String(response.status));
}

const scanName = new URLSearchParams(location.search).get("qr");
if (scanName && /^[a-z0-9-]{1,30}$/.test(scanName) && formEndpoint) {
  fetch(formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": "qr-scan", source: scanName, device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Phone" : "Computer" }).toString(),
    keepalive: true,
  }).catch(() => {});
  const cleanLink = new URL(location.href);
  cleanLink.searchParams.delete("qr");
  history.replaceState(null, "", cleanLink.pathname + cleanLink.search + cleanLink.hash);
}

let vfmTrack = () => {};
try {
  const here = new URL(location.href);
  if (here.searchParams.get("me") === "1") {
    localStorage.setItem("vfmnova-owner", "yes");
    here.searchParams.delete("me");
    history.replaceState(null, "", here.pathname + here.search + here.hash);
  }
  const counting = formEndpoint && !navigator.webdriver && !/bot|crawl|spider|preview|lighthouse/i.test(navigator.userAgent) && localStorage.getItem("vfmnova-owner") !== "yes";
  if (counting) {
    const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Phone" : "Computer";
    const send = (fields) => fetch(formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": "page-view", page: location.pathname, device, ...fields }).toString(),
      keepalive: true,
    }).catch(() => {});
    vfmTrack = (action) => send({ event: String(action).slice(0, 60) });
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    const first = localStorage.getItem("vfmnova-seen") === today ? "no" : "yes";
    localStorage.setItem("vfmnova-seen", today);
    let from = here.searchParams.get("utm_source") || "";
    try { if (!from && document.referrer) from = new URL(document.referrer).hostname; } catch {}
    if (from === location.hostname) from = "";
    const region = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").split("/").pop().replace(/_/g, " ");
    send({ first, from, region, campaign: here.searchParams.get("utm_campaign") || "" });
    document.addEventListener("click", (event) => {
      const target = event.target.closest("a, button");
      if (!target) return;
      const href = target.getAttribute("href") || "";
      const words = [...target.childNodes].filter((node) => !(node.classList && node.classList.contains("site-nav__hint"))).map((node) => node.textContent).join(" ").trim().replace(/\s+/g, " ").slice(0, 40);
      if (/buy\.stripe\.com|billing\.stripe\.com/.test(href)) vfmTrack("Pay button: " + words);
      else if (href.startsWith("tel:")) vfmTrack("Call button");
      else if (href.startsWith("mailto:")) vfmTrack("Email button");
      else if (/facebook\.com|linkedin\.com|instagram\.com/.test(href)) vfmTrack("Social link: " + new URL(href, location.href).hostname.replace(/^www\./, ""));
      else if (/book\.html/.test(href) && !location.pathname.endsWith("book.html")) vfmTrack("Start button: " + words);
      else if (target.classList.contains("ask-launcher")) vfmTrack("Opened Ask NOVA");
      else if (target.matches("[data-package-open]")) vfmTrack("Package details: " + target.dataset.packageOpen);
      else if (words) vfmTrack(`${target.tagName === "A" ? "Link" : "Button"}: ${words}`);
    }, true);
    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (form.matches("[data-calculator]")) return;
      const name = form.querySelector('[name="form-name"]')?.value || (form.closest(".ask, [class*=ask]") ? "Ask NOVA question" : form.id || "form");
      vfmTrack("Sent: " + name);
    }, true);
    setTimeout(() => { if (!document.hidden) vfmTrack("Stayed 30 seconds+"); }, 30000);
    let bottomSent = false;
    addEventListener("scroll", () => {
      if (bottomSent || innerHeight + scrollY < document.documentElement.scrollHeight - 300) return;
      bottomSent = true;
      vfmTrack("Scrolled to bottom");
    }, { passive: true });
  }
} catch {}

const detailsForm = document.querySelector("[data-details-form]");
if (detailsForm && formEndpoint) {
  const params = new URLSearchParams(location.search);
  const order = params.get("order") ?? "";
  const key = params.get("k") ?? "";
  const intro = document.querySelector("[data-details-intro]");
  const holder = detailsForm.querySelector("[data-details-fields]");
  const status = detailsForm.querySelector("[data-details-status]");
  const options = JSON.parse(document.querySelector("[data-details-options]").textContent);
  const longText = ["services-list", "words-text", "booking-services", "assistant-questions", "store-products", "automation-wishes", "logo-brief", "domain-choices", "folder-address", "flyer-text", "card-text", "starter-idea", "custom-style"];
  const make = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  const selectFor = (name, choices) => {
    const select = make("select", { name });
    select.append(make("option", { value: "", textContent: "Choose one" }), ...choices.map((choice) => make("option", { value: choice, textContent: choice })));
    return select;
  };
  const fieldFor = (item) => {
    if (item.field === "__uploads") {
      const box = make("div");
      const pick = make("label", { textContent: "Your images" });
      pick.append(selectFor("photos-status", options.selects["photos-status"].filter((choice) => !/upload/i.test(choice))));
      const links = make("label", { textContent: "Links to your images, if you chose to share links" });
      links.append(make("input", { name: "photos-links", inputMode: "url", placeholder: "Google Drive or Dropbox link" }));
      box.append(pick, links);
      return box;
    }
    const label = make("label", { textContent: item.label });
    if (options.checks[item.field]) {
      const set = make("fieldset", { className: "options options--grid" });
      set.append(make("legend", { textContent: item.label }), ...options.checks[item.field].map((choice) => {
        const option = make("label");
        option.append(make("input", { type: "checkbox", name: item.field, value: choice }), " ", make("span", { textContent: choice }));
        return option;
      }));
      return set;
    }
    if (options.selects[item.field]) label.append(selectFor(item.field, options.selects[item.field]));
    else if (item.field === "template") label.append(selectFor("template", options.templates));
    else if (longText.includes(item.field)) label.append(make("textarea", { name: item.field, rows: 4 }));
    else label.append(make("input", { name: item.field }));
    return label;
  };
  const show = (needs, business) => {
    if (!needs.length) {
      detailsForm.hidden = true;
      intro.textContent = "Your project details are complete.";
      document.querySelector("[data-details-done]").hidden = false;
      return;
    }
    if (business) intro.textContent = `We need ${needs.length === 1 ? "one more detail" : `${needs.length} more details`} to build the project for ${business.trim()}. Answer what you can and press Send.`;
    holder.replaceChildren(...needs.map(fieldFor));
    detailsForm.hidden = false;
  };
  fetch(`${formEndpoint}?${new URLSearchParams({ action: "order-needs", order, k: key })}`)
    .then((reply) => reply.json())
    .then((reply) => {
      if (!reply.ok) { intro.textContent = "We couldn't find that order link. Please use the link in your order email, or send us a ticket at ainova.to/support.html."; return; }
      show(reply.needs, reply.business);
    })
    .catch(() => { intro.textContent = "This page couldn't load. Please check your connection and reload."; });
  detailsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = new URLSearchParams({ "form-name": "order-details", order, k: key });
    const data = new FormData(detailsForm);
    [...new Set(data.keys())].forEach((name) => body.set(name, data.getAll(name).map(String).filter(Boolean).join(", ")));
    const button = detailsForm.querySelector("button[type=submit]");
    button.disabled = true;
    status.textContent = "Sending...";
    try {
      const reply = await fetch(formEndpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() }).then((r) => r.json());
      if (!reply.ok) throw new Error(reply.error);
      status.textContent = reply.needs.length ? "Thank you. Just these left:" : "";
      show(reply.needs, "");
      if (reply.needs.length) intro.textContent = `Almost done: ${reply.needs.length === 1 ? "one more detail" : `${reply.needs.length} more details`} to go.`;
    } catch {
      status.textContent = "That didn't send. Please try again in a minute.";
    } finally {
      button.disabled = false;
    }
  });
}

const REF_KEY = "vfmnova-ref";
function referralCode() {
  try {
    const saved = JSON.parse(localStorage.getItem(REF_KEY) ?? "null");
    return saved && saved.until > Date.now() ? saved.code : "";
  } catch {
    return "";
  }
}
const incomingRef = new URLSearchParams(location.search).get("ref");
if (incomingRef && /^[A-Za-z0-9_-]{2,30}$/.test(incomingRef)) {
  try {
    if (!referralCode()) localStorage.setItem(REF_KEY, JSON.stringify({ code: incomingRef, until: Date.now() + 60 * 864e5 }));
  } catch {
  }
}

const SITE = { template: 997, custom: 1695, engine: 0, unsure: 0 };
const DEPOSIT_PERCENT = 20;
const PREVIEW_DAYS = 2;
const previewFirstFor = (site, total) => hasWebsite(site) && total > 0;
const afterPreviewDue = (site, extras, total) => (isSystems(site, extras) ? Math.ceil(total / 2) : total);
const depositOf = (total) => Math.ceil((total * DEPOSIT_PERCENT) / 100);
const payingInFull = () => Boolean(document.querySelector('input[name="payment-choice"][value="Pay in full"]:checked'));
const PAGES = { 5: 0, 10: 300, 20: 800 };
const DEPOSIT_LINK = "https://buy.stripe.com/28E8wIaZjgZnfU0fg6bMQ00";
const inlinePay = {
  stripe: null, elements: null, element: null, mounted: false, due: 0, secret: "", paid: false,
  active() { return Boolean(this.stripe && this.due > 0); },
  sync(due) {
    this.due = due;
    const box = document.querySelector("[data-pay-box]");
    if (!box) return;
    box.hidden = !this.active();
    if (!this.active() || this.secret) return;
    const amount = Math.round(due * 100);
    if (!this.elements) {
      this.elements = this.stripe.elements({ mode: "payment", amount, currency: "usd", appearance: { theme: "stripe", variables: { colorPrimary: "#5b21d6", borderRadius: "10px" } } });
      this.element = this.elements.create("payment", { wallets: { link: "never" }, fields: { billingDetails: { name: "never", email: "never" } } });
      new IntersectionObserver((entries, watcher) => {
        if (entries.some((entry) => entry.isIntersecting) && !this.mounted) {
          this.mounted = true;
          this.element.mount("[data-pay-element]");
          watcher.disconnect();
        }
      }).observe(box);
    } else {
      this.elements.update({ amount });
    }
  },
  async start(endpoint) {
    const here = new URLSearchParams(location.search);
    const testKey = location.hostname === "localhost" ? here.get("payTestKey") : "";
    const publicKey = testKey || (await fetch(`${endpoint}?action=payconfig`).then((reply) => reply.json()).catch(() => ({}))).publicKey;
    if (!publicKey) return;
    await new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = "https://js.stripe.com/v3/";
      tag.onload = resolve;
      tag.onerror = reject;
      document.head.append(tag);
    });
    this.stripe = window.Stripe(publicKey);
  },
};
const payUrl = (link, dollars) => {
  const url = new URL(link);
  url.searchParams.set("__prefilled_amount", String(Math.round(dollars * 100)));
  return url.href;
};
const payTrust = () => {
  const box = document.createElement("div");
  box.className = "pay-trust";
  const note = document.createElement("p");
  note.className = "pay-trust__note";
  note.textContent = "Secure checkout powered by Stripe. Your payment is encrypted, and we never see your full card number.";
  const logos = document.createElement("img");
  logos.src = "/pay-badges.svg";
  logos.width = 412;
  logos.height = 34;
  logos.alt = "Accepted: Visa, Mastercard, American Express, Discover, Apple Pay, Cash App Pay and Klarna";
  const refunds = document.createElement("a");
  refunds.href = "/refunds.html";
  refunds.textContent = "See our refund policy";
  box.append(logos, note, refunds);
  return box;
};
const EXTRA = { logo: 49, booking: 150, assistant: 650, store: 995, crm: 1000, automations: 1500, starter: 495, domain: 99, folder: 99, search: 299, "social-one": 149, "social-discord": 299, "social-bundle": 349, "social-kit": 699, "design-flyer": 79, "design-card": 49 };
const EXTRA_LABEL = { logo: "Logo design", booking: "Online booking", assistant: "AI assistant (coming soon)", store: "Online store", crm: "Customer list", automations: "Reminders and follow-ups", starter: "Business Starter", domain: "Custom web address", folder: "Printed welcome folder", search: "Search Engine Setup", "social-one": "Single social or business setup", "social-discord": "Discord Pro setup", "social-bundle": "Social Bundle", "social-kit": "Full Launch Kit", "design-flyer": "Flyer design", "design-card": "Business card design" };
const SPEEDS = {
  standard: { label: "Standard", percent: 0, divide: 1 },
  rush: { label: "Rush", percent: 25, divide: 2 },
  expedited: { label: "Expedited", percent: 50, divide: 3 },
  emergency: { label: "Emergency", percent: 100, divide: 5 },
};
const speedDays = (days, speed) => Math.ceil(days / SPEEDS[speed].divide);
const daysText = (days) => `Up to ${days} business day${days === 1 ? "" : "s"}`;
const speedText = (days, speed) => `${daysText(speedDays(days, speed))}${SPEEDS[speed].percent ? `, +${SPEEDS[speed].percent}%` : ""}`;

const ADDON_INFO = {
  booking: "Lets customers pick a time on their own.",
  assistant: "Answers customer questions when you can't.",
  store: "Sell your products online.",
  crm: "Keeps every customer in one place.",
  automations: "Sends reminders and follow-ups for you.",
  starter: "Name, logo and setup help for a new business.",
  logo: "A simple, professional logo made for your business.",
  domain: "We buy your own web address, like yourbusiness.com, and set it all up.",
  folder: "Your documents in a printed folder, mailed to you.",
  search: "Gets your site set up for the top 5 search engines.",
  "design-flyer": "A print-ready flyer design. Printing isn't included.",
  "design-card": "A print-ready business card design. Printing isn't included.",
};
const ADDONS_FOR_TYPE = {
  home: ["booking", "search"], health: ["booking", "assistant"], food: ["booking", "store"], beauty: ["booking", "automations"], property: ["crm", "assistant"],
  fitness: ["booking", "automations"], professional: ["booking", "assistant"], retail: ["store", "search"], pets: ["booking", "automations"],
};
const ADDONS_WITH = {
  booking: ["automations", "assistant"], assistant: ["booking", "crm"], store: ["search", "assistant"], crm: ["automations", "booking"], automations: ["crm", "booking"],
  starter: ["domain", "search"], logo: ["domain", "folder"], domain: ["search", "logo"], search: ["domain"], folder: ["domain"],
};
const TYPE_WORDS = [
  ["home", /roof|plumb|electric|hvac|contract|landscap|lawn|clean|handyman|mechanic|auto|construction/],
  ["health", /dent|doctor|clinic|chiro|therap|medical/],
  ["food", /restaurant|cafe|bak|food|cater|coffee|truck/],
  ["beauty", /salon|barber|hair|nail|spa|lash|beauty|tattoo/],
  ["property", /real ?estate|realt|broker|property/],
  ["fitness", /gym|fitness|trainer|yoga|pilates|coach/],
  ["professional", /law|legal|attorney|account|bookkeep|consult|insurance|financ/],
  ["retail", /shop|store|boutique|cloth|retail|jewel|gift/],
  ["pets", /pet|dog|groom|vet/],
];
const typeFromWords = (text) => TYPE_WORDS.find(([, words]) => words.test((text ?? "").toLowerCase()))?.[0];
function showSuggestions({ root, field, chosen, type, wantsWebsite, ownsAddress, addCare, systems }) {
  const keys = [...(ADDONS_FOR_TYPE[type] ?? []), ...chosen.flatMap((key) => ADDONS_WITH[key] ?? []), ...(wantsWebsite ? ["booking", "search"] : ["search"])];
  if (wantsWebsite && !ownsAddress) keys.unshift("domain");
  const picks = [...new Set(keys)].filter((key) => !chosen.includes(key) && !(systems && (key === "logo" || key === "domain"))).slice(0, 3);
  root.querySelectorAll("[data-suggest]").forEach((box) => {
    box.className = "suggest";
    const items = picks.map((key) => {
      const item = document.createElement("div");
      item.className = "suggest__item";
      const text = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = EXTRA_LABEL[key];
      text.append(name, ` ${ADDON_INFO[key]}`);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `Add +${money(EXTRA[key])}`;
      button.setAttribute("aria-label", `Add ${EXTRA_LABEL[key]} for ${money(EXTRA[key])}`);
      button.addEventListener("click", () => {
        const box2 = root.querySelector(`[name="${field}"][value="${key}"]`);
        box2.checked = true;
        box2.dispatchEvent(new Event("change", { bubbles: true }));
      });
      item.append(text, button);
      return item;
    });
    if (addCare) {
      const item = document.createElement("div");
      item.className = "suggest__item";
      const text = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = "Care Basic";
      text.append(name, " Keeps your site online, safe and up to date.");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Add $49/mo";
      button.setAttribute("aria-label", "Add Care Basic for $49 a month");
      button.addEventListener("click", () => addCare());
      item.append(text, button);
      items.push(item);
    }
    const title = document.createElement("p");
    title.className = "suggest__title";
    title.textContent = "Goes well with your choices";
    box.hidden = !items.length || Boolean(box.closest("[data-not-engine][hidden]"));
    box.replaceChildren(title, ...items);
  });
}
const discountable = (setup, extras) => setup - extras.filter((key) => key === "domain" || key === "folder").reduce((sum, key) => sum + EXTRA[key], 0);
const isSystems = (site, extras) => site === "custom" && ["booking", "assistant", "crm", "automations"].every((key) => extras.includes(key));
const SYSTEMS_ENGINE_PRICE = 300;
const pricedExtras = (site, extras) => (isSystems(site, extras) ? extras.filter((key) => key !== "logo" && key !== "domain") : extras);
const hasWebsite = (site) => site === "template" || site === "custom";
const setupPrice = (site, pages, extras) => (SITE[site] ?? 0) + (hasWebsite(site) ? PAGES[pages] : 0) + pricedExtras(site, extras).reduce((sum, key) => sum + EXTRA[key], 0);
const engineMonthly = (site, extras, engine, offer) => {
  if (!engine) return 0;
  const listed = Math.round(engine * (offer ? 1 - offer.percent / 100 : 1));
  return isSystems(site, extras) ? Math.min(listed, SYSTEMS_ENGINE_PRICE) : listed;
};
const deliveryDays = (site, extras) => {
  if (extras.includes("crm") || extras.includes("automations")) return 10;
  if (site === "custom" || extras.includes("assistant") || extras.includes("store")) return 7;
  return 5;
};

const calc = document.querySelector("[data-calculator]");
if (calc) {
  const total = document.querySelector("[data-total]");
  const monthly = document.querySelector("[data-monthly]");
  const bookLink = document.querySelector("[data-calc-book]");
  const savingNote = document.querySelector("[data-saving]");

  const update = () => {
    const data = new FormData(calc);
    const extras = data.getAll("extra");
    const sum = setupPrice(data.get("site"), data.get("pages"), extras);
    const care = Number(data.get("care"));
    const engine = Number(data.get("engine"));
    const offer = findOffer(data.get("code"));
    const hasCode = Boolean(offer);
    const site = data.get("site");
    const counted = pricedExtras(site, extras);
    const saving = offer ? offerSaving(offer.flat ? sum : offer.everything ? sum : discountable(sum, counted), offer) : 0;
    const speed = data.get("speed");
    const speedFee = offer?.flat ? 0 : Math.round((discountable(sum, counted) * SPEEDS[speed].percent) / 100);
    const days = deliveryDays(data.get("site"), extras);
    calc.querySelectorAll("[data-calc-speed]").forEach((label) => { label.textContent = speedText(days, label.dataset.calcSpeed); });
    total.textContent = money(sum - saving + speedFee);
    savingNote.hidden = !hasCode;
    savingNote.textContent = hasCode ? `Code applied: ${money(saving)} off ${money(sum)}` : "";
    const plans = Math.round(care * (offer?.everything ? 1 - offer.percent / 100 : 1)) + engineMonthly(site, extras, engine, offer);
    monthly.textContent = plans ? `plus ${money(plans)} a month${isSystems(site, extras) && engine ? ", with VFM Engine's first month included" : ""}` : "No monthly plan selected";
    const link = new URLSearchParams({ site: site ?? "", pages: data.get("pages"), care: String(care), engine: String(engine) });
    if (extras.length) link.set("extras", extras.join(","));
    if (offer) link.set("code", offer.code);
    if (speed !== "standard") link.set("speed", speed);
    bookLink.href = `/book.html?${link}`;
    showSuggestions({
      root: calc, field: "extra", chosen: extras, wantsWebsite: true, systems: isSystems(site, extras),
      addCare: care ? null : () => {
        const plan = calc.querySelector('[name="care"][value="49"]');
        plan.checked = true;
        plan.dispatchEvent(new Event("change", { bubbles: true }));
      },
    });
  };
  calc.addEventListener("change", update);
  calc.addEventListener("input", update);
  calc.addEventListener("input", async (event) => {
    if (event.target.name === "code" && (await checkPartner(event.target.value))) update();
  });
  calc.addEventListener("submit", (event) => event.preventDefault());
  update();
}

const form = document.querySelector("[data-project-form]");
if (form) {
  const $ = (selector) => form.querySelector(selector);
  const $$ = (selector) => [...form.querySelectorAll(selector)];
  const siteType = () => $('[name="site-type"]:checked')?.value ?? "";
  const scheduleOnly = new URLSearchParams(location.search).has("schedule");
  const tabs = $$('[role="tab"]');
  const panels = $$('[role="tabpanel"]');
  const status = $("[data-form-status]");
  const prev = $("[data-prev]");
  const next = $("[data-next]");
  const codeInput = $("[data-code]");
  const codeNote = $("[data-code-note]");
  const summary = document.querySelector(".summary");
  let current = 0;

  const usable = (tab) => !tab.hidden;
  const firstVisible = () => tabs.findIndex(usable);
  const lastVisible = () => tabs.length - 1 - [...tabs].reverse().findIndex(usable);
  const stepFrom = (index, step) => {
    let target = index + step;
    while (tabs[target] && !usable(tabs[target])) target += step;
    return tabs[target] ? target : index;
  };
  const showTab = (index, focus = false) => {
    current = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    prev.hidden = index === 0;
    next.hidden = index === lastVisible();
    prev.hidden = index === firstVisible();
    if (focus) tabs[index].focus();
    const strip = tabs[index].parentElement;
    if (strip && strip.scrollWidth > strip.clientWidth) {
      const tabBox = tabs[index].getBoundingClientRect();
      const stripBox = strip.getBoundingClientRect();
      strip.scrollLeft += tabBox.left - stripBox.left - (strip.clientWidth - tabBox.width) / 2;
    }
  };
  const goTo = (index) => {
    showTab(index);
    vfmTrack("Order step: " + tabs[index].textContent.trim().slice(0, 30));
    form.scrollIntoView({ block: "start" });
    panels[index].focus({ preventScroll: true });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showTab(index));
    tab.addEventListener("keydown", (event) => {
      const moves = { ArrowRight: stepFrom(index, 1), ArrowLeft: stepFrom(index, -1), Home: firstVisible(), End: lastVisible() };
      if (!(event.key in moves)) return;
      event.preventDefault();
      showTab(moves[event.key], true);
    });
  });
  prev.addEventListener("click", () => goTo(stepFrom(current, -1)));
  next.addEventListener("click", () => goTo(stepFrom(current, 1)));

  const fullDetail = () => $('[name="detail-level"]:checked').value === "Every detail";
  const applyDetailLevel = () => {
    const engineOnly = siteType() === "engine";
    const full = fullDetail() && !engineOnly && !scheduleOnly;
    $$("[data-full-only]").forEach((block) => { block.hidden = !full; });
    $$("[data-not-engine]").forEach((block) => { block.hidden = engineOnly; });
    const engineChosen = Number($('[name="engine-plan"]:checked').value) > 0;
    $("[data-engine-card]").hidden = !engineOnly || !engineChosen;
    $("[data-search-card]").hidden = !engineOnly || engineChosen;
    $("[data-engine-switch]").hidden = !engineOnly;
    const serviceName = !engineOnly ? "Build your package" : engineChosen ? "VFM Engine" : "Search Engine Setup";
    $("[data-service-tab]").textContent = engineOnly ? "Your plan" : serviceName;
    $("[data-service-title]").textContent = serviceName;
    $("#tab-contact").hidden = engineOnly;
    if (scheduleOnly) {
      ["#tab-service", "#tab-design", "#tab-content", "#tab-features"].forEach((tab) => { $(tab).hidden = true; });
      $(".form-mode").hidden = true;
      $(".ways:not(.form-mode)").hidden = true;
      $('[name="terms-agreed"]').closest("label").hidden = true;
      $("[data-review-note]").hidden = true;
      if (summary) summary.hidden = true;
      $("#tab-business").childNodes[1].textContent = " Your details";
      $("#tab-contact").childNodes[1].textContent = " Pick a time";
      $("#tab-review").childNodes[1].textContent = " Confirm";
    }
    $("[data-website-label]").textContent = engineOnly ? "Your current website (required)" : "Current website, if any";
    $("#tab-design").hidden = engineOnly || scheduleOnly;
    const website = ["template", "custom"].includes(siteType());
    const extrasWithDetails = $$('[name="addons"]:checked').some((box) => $(`[data-feature="${box.value}"]`));
    $("#tab-content").hidden = engineOnly || scheduleOnly || (!full && !website);
    $("#tab-features").hidden = engineOnly || scheduleOnly || (!full && !extrasWithDetails);
    $$("[data-website-only]").forEach((block) => { block.hidden = !website; });
    let number = 0;
    tabs.forEach((tab) => {
      if (!tab.hidden) number += 1;
      tab.querySelector("span").textContent = String(number);
    });
    if (tabs[current].hidden) showTab(firstVisible());
    else showTab(current);
  };

  const applyFollowUps = () => {
    $$("[data-when]").forEach((block) => {
      const [name, wanted] = block.dataset.when.split(":");
      block.hidden = !wanted.split("|").includes($(`[name="${name}"]`).value);
    });
  };

  const UPLOAD_LIMIT = 12;
  const UPLOAD_TOTAL = 15 * 1024 * 1024;
  const readAsData = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const shrinkPhoto = async (file) => {
    const keepAsIs = !file.type.startsWith("image/") || /svg|gif/.test(file.type) || (file.type === "image/png" && file.size < 2 * 1024 * 1024);
    if (keepAsIs || file.size < 500 * 1024) return { url: await readAsData(file), type: file.type || "application/octet-stream", name: file.name };
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return { url: canvas.toDataURL("image/jpeg", 0.85), type: "image/jpeg", name: file.name.replace(/\.[^.]+$/, "") + ".jpg" };
    } catch {
      return { url: await readAsData(file), type: file.type, name: file.name };
    }
  };
  const uploadStatus = (message) => {
    $$("[data-upload-status]").forEach((note) => { note.hidden = !message; note.textContent = message; });
  };
  const showUploads = () => {
    $$("[data-upload-list]").forEach((list) => {
      list.replaceChildren(...pendingUploads.map((file, index) => {
        const item = document.createElement("li");
        if (file.type.startsWith("image/")) {
          const thumb = document.createElement("img");
          thumb.src = `data:${file.type};base64,${file.data}`;
          thumb.alt = "";
          item.append(thumb);
        }
        const name = document.createElement("span");
        name.textContent = file.name;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${file.name}`);
        remove.addEventListener("click", () => {
          pendingUploads.splice(index, 1);
          uploadStatus("");
          showUploads();
          render();
        });
        item.append(name, remove);
        return item;
      }));
    });
    syncUploadAgree();
  };
  const activeUploadAgree = () => $(siteType() === "engine" ? '[data-engine-fields] [name="upload-permission"]' : '#panel-design [name="upload-permission"]');
  const syncUploadAgree = () => {
    const active = activeUploadAgree();
    $$('[name="upload-permission"]').forEach((box) => {
      box.disabled = box !== active;
      box.closest("[data-upload-agree]").hidden = box !== active || !pendingUploads.length;
    });
  };
  const addFiles = async (list) => {
    const incoming = [...list].filter((file) => file.type.startsWith("image/") || file.type === "application/pdf" || /\.(heic|pdf)$/i.test(file.name));
    if (incoming.length < list.length) uploadStatus("Only photos and PDFs can be uploaded.");
    for (const file of incoming) {
      if (pendingUploads.length >= UPLOAD_LIMIT) {
        uploadStatus(`You can upload up to ${UPLOAD_LIMIT} files. Share a Google Drive or Dropbox link for the rest.`);
        break;
      }
      uploadStatus(`Adding ${file.name}...`);
      const { url, type, name } = await shrinkPhoto(file);
      const data = url.slice(url.indexOf(",") + 1);
      const used = pendingUploads.reduce((sum, item) => sum + item.data.length, 0);
      if (used + data.length > UPLOAD_TOTAL) {
        uploadStatus(`${file.name} is too large to add. Share a Google Drive or Dropbox link instead.`);
        continue;
      }
      pendingUploads.push({ name, type, data });
      uploadStatus("");
    }
    showUploads();
    render();
  };
  $$("[data-upload-input]").forEach((input) => {
    input.addEventListener("change", () => {
      addFiles(input.files);
      input.value = "";
    });
    const drop = input.closest(".upload__drop");
    ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, () => drop.classList.remove("is-over")));
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      addFiles(event.dataTransfer.files);
    });
  });

  const audienceField = $('input[placeholder^="For example: homeowners in"]');
  if (audienceField) {
    const cities = ["Lodi", "Modesto", "Tracy", "Manteca", "Galt", "Sacramento"];
    audienceField.placeholder = `For example: homeowners in ${cities[Math.floor(Math.random() * cities.length)]}`;
  }

  const TZ = "America/Los_Angeles";
  const picker = $("[data-picker]");
  const slotField = $("[data-slot]");
  const slotLabel = $("[data-slot-label]");
  const calTitle = $("[data-cal-title]");
  const calDays = $("[data-cal-days]");
  const calPrev = $("[data-cal-prev]");
  const calNext = $("[data-cal-next]");
  const timeTitle = $("[data-time-title]");
  const timeSlots = $("[data-time-slots]");
  const inPacific = (iso, options) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...options }).format(new Date(iso));
  const dayKey = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  const niceTime = (iso) => inPacific(iso, { hour: "numeric", minute: "2-digit" }).replace(" AM", " am").replace(" PM", " pm");
  const niceDay = (iso) => inPacific(iso, { weekday: "long", month: "long", day: "numeric" });
  const chosenLabel = () => (slotField.value ? `${niceDay(slotField.value)} at ${niceTime(slotField.value)} Pacific` : "");
  const pad = (n) => String(n).padStart(2, "0");
  let byDay = new Map();
  let activeDay = "";
  let shown = null; // { year, month } with month 0 to 11.

  const showTimes = () => {
    const times = byDay.get(activeDay) ?? [];
    timeTitle.textContent = times.length ? niceDay(times[0]) : byDay.size ? "Choose a day" : "No open times right now";
    timeSlots.replaceChildren(...times.map((iso) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = niceTime(iso);
      button.setAttribute("aria-pressed", String(iso === slotField.value));
      button.addEventListener("click", () => {
        slotField.value = iso;
        slotLabel.hidden = false;
        slotLabel.textContent = `Your time: ${chosenLabel()}`;
        $$("[data-problem]").forEach((note) => note.remove());
        showTimes();
        render();
      });
      return button;
    }));
  };
  const showMonth = () => {
    const { year, month } = shown;
    calTitle.textContent = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: first }, () => document.createElement("span"));
    for (let day = 1; day <= count; day += 1) {
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(day);
      button.disabled = !byDay.has(key);
      button.setAttribute("aria-pressed", String(key === activeDay));
      button.setAttribute("aria-label", new Date(year, month, day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
      button.addEventListener("click", () => {
        activeDay = key;
        showMonth();
        showTimes();
      });
      cells.push(button);
    }
    calDays.replaceChildren(...cells);
    const keys = [...byDay.keys()];
    const monthKey = `${year}-${pad(month + 1)}`;
    calPrev.disabled = !keys.some((key) => key.slice(0, 7) < monthKey);
    calNext.disabled = !keys.some((key) => key.slice(0, 7) > monthKey);
  };
  const stepMonth = (by) => {
    const next = new Date(shown.year, shown.month + by, 1);
    shown = { year: next.getFullYear(), month: next.getMonth() };
    showMonth();
  };
  calPrev.addEventListener("click", () => stepMonth(-1));
  calNext.addEventListener("click", () => stepMonth(1));
  const loadSlots = async () => {
    timeTitle.textContent = "Loading open times...";
    const response = await fetch(`${formEndpoint}?action=slots`);
    const { slots } = await response.json();
    byDay = new Map();
    for (const iso of slots) byDay.set(dayKey(iso), [...(byDay.get(dayKey(iso)) ?? []), iso]);
    if (slotField.value && !slots.includes(slotField.value)) {
      slotField.value = "";
      slotLabel.hidden = true;
    }
    const wantedTime = new URLSearchParams(location.search).get("time");
    if (wantedTime && !slotField.value && slots.includes(wantedTime)) {
      slotField.value = wantedTime;
      activeDay = dayKey(wantedTime);
      slotLabel.hidden = false;
      slotLabel.textContent = `Your time: ${chosenLabel()}`;
    }
    const firstDay = [...byDay.keys()][0];
    if (!byDay.has(activeDay)) activeDay = firstDay ?? "";
    const [year, month] = (activeDay || dayKey(new Date().toISOString())).split("-").map(Number);
    shown = { year, month: month - 1 };
    showMonth();
    showTimes();
    render();
  };
  const loadFailed = () => {
    shown = shown ?? { year: new Date().getFullYear(), month: new Date().getMonth() };
    showMonth();
    timeTitle.textContent = "We couldn't load the calendar.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Try again";
    retry.addEventListener("click", () => loadSlots().catch(loadFailed));
    timeSlots.replaceChildren(retry);
  };
  loadSlots().catch(loadFailed);

  const selected = () => {
    const data = new FormData(form);
    return {
      data,
      site: data.get("site-type"),
      pages: data.get("page-count"),
      extras: data.getAll("addons"),
      care: Number(data.get("care-plan")),
      engine: Number(data.get("engine-plan")),
      method: data.get("contact-method"),
      speed: data.get("site-type") === "engine" ? "standard" : data.get("delivery-speed"),
    };
  };

  let methodBeforeEngine = "";
  const syncEngineMethod = () => {
    const engineOnly = siteType() === "engine";
    const current = $('[name="contact-method"]:checked');
    if (engineOnly && current.value !== "No-call delivery") {
      methodBeforeEngine = current.value;
      $('[name="contact-method"][value="No-call delivery"]').checked = true;
    } else if (!engineOnly && methodBeforeEngine) {
      $(`[name="contact-method"][value="${methodBeforeEngine}"]`).checked = true;
      methodBeforeEngine = "";
    }
  };

  const render = () => {
    syncEngineMethod();
    const { site, pages, extras, care, engine, method, speed } = selected();
    const setup = site === "engine" ? extras.reduce((sum, key) => sum + EXTRA[key], 0) : setupPrice(site, pages, extras);
    const offer = findOffer(codeInput.value);
    const saving = offer ? offerSaving(offer.flat ? setup : offer.everything ? setup : discountable(setup, pricedExtras(site, extras)), offer) : 0;
    const careShare = offer?.everything ? 1 - offer.percent / 100 : 1;
    const enginePrice = engineMonthly(site, extras, engine, offer);
    const carePrice = Math.round(care * careShare);
    const speedFee = offer?.flat ? 0 : Math.round((discountable(setup, pricedExtras(site, extras)) * SPEEDS[speed].percent) / 100);
    const days = deliveryDays(site, extras);
    const lines = hasWebsite(site) ? [[site === "custom" ? "Custom website" : "Template website", SITE[site]]] : [];
    if (site === "unsure") lines.push(["Website: help me choose", 0]);
    if (PAGES[pages] && hasWebsite(site)) lines.push([pages === "10" ? "6 to 10 pages" : "11 to 20 pages", PAGES[pages]]);
    const counted = pricedExtras(site, extras);
    extras.forEach((key) => lines.push(counted.includes(key) ? [EXTRA_LABEL[key], EXTRA[key]] : [`${EXTRA_LABEL[key]} (included)`, 0]));
    if (isSystems(site, extras) && engine) lines.push(["VFM Engine, first month (included)", 0]);
    if (saving) lines.push([`Code ${offer.code}`, -saving]);
    if (speedFee) lines.push([`${SPEEDS[speed].label} delivery`, speedFee]);
    document.querySelector("[data-summary-total]")?.setAttribute("aria-live", "polite");
    const list = document.querySelector("[data-lines]");
    list.replaceChildren(
      ...lines.map(([label, amount]) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const value = document.createElement("span");
        name.textContent = label;
        value.textContent = amount < 0 ? `-${money(-amount)}` : money(amount);
        item.append(name, value);
        return item;
      }),
    );
    const total = setup - saving + speedFee;
    const monthlyOnly = site === "engine" && total === 0;
    document.querySelector("[data-summary-total]").textContent = monthlyOnly ? `${money(enginePrice || 400)}/mo` : money(total);
    const monthly = document.querySelector("[data-summary-monthly]");
    const monthlyTotal = carePrice + enginePrice;
    const extraMonthly = monthlyOnly ? carePrice : monthlyTotal;
    const engineSaving = monthlyOnly && offer && engine ? `Code ${offer.code}: ${money(engine - enginePrice)} off each month` : "";
    monthly.hidden = !extraMonthly && !engineSaving;
    monthly.textContent = extraMonthly ? `plus ${money(extraMonthly)} a month${isSystems(site, extras) && engine ? ", with VFM Engine's first month included" : ""}` : engineSaving;
    $("[data-engine-card-price]").textContent = offer && engine ? `${money(enginePrice)} a month with code ${offer.code}` : "$400 a month";
    const delivery = daysText(speedDays(days, speed));
    const engineOnly = site === "engine";
    const previewFirst = previewFirstFor(site, total);
    const systemsOrder = isSystems(site, extras);
    const afterPreview = previewFirst ? afterPreviewDue(site, extras, total) : 0;
    document.querySelector("[data-summary-delivery]").textContent = engineOnly ? (engine ? "Your plan starts once we've checked that your business qualifies" : "About 5 business days once we have your payment and access") : previewFirst ? `Free homepage preview in about ${PREVIEW_DAYS} business days, then the full site in ${delivery.charAt(0).toLowerCase() + delivery.slice(1)} after payment` : `${delivery} once we have your deposit and details`;
    $("[data-delivery-speed]").hidden = engineOnly;
    $("[data-speed-note]").hidden = engineOnly;
    applyDetailLevel();
    applyFollowUps();
    const pickedTemplate = $('[name="template"]:checked');
    $("[data-template-select]").value = pickedTemplate?.dataset.slug ?? "";
    const templatePreview = $("[data-template-preview]");
    templatePreview.href = pickedTemplate ? `/samples/${pickedTemplate.dataset.slug}.html` : "/templates.html";
    templatePreview.textContent = pickedTemplate ? `Preview ${pickedTemplate.value}` : "See all the templates";
    showSuggestions({
      root: form, field: "addons", chosen: extras, wantsWebsite: hasWebsite(site), systems: isSystems(site, extras), ownsAddress: $('[name="domain-status"]').value === "Yes, I own one",
      type: (site === "template" && pickedTemplate?.dataset.type) || typeFromWords($('[name="industry"]').value),
      addCare: care || site === "engine" || site === "none" ? null : () => {
        const plan = $('[name="care-plan"][value="49"]');
        plan.checked = true;
        plan.dispatchEvent(new Event("change", { bubbles: true }));
      },
    });
    $("[data-engine-fields]").hidden = !engine;
    $("[data-review-note]").textContent = engineOnly
      ? "Sending this doesn't charge you. We'll review your details, then email you a secure link to get started."
      : !total ? "Sending this doesn't charge you. We'll follow up with your next steps."
      : previewFirst ? `Sending this doesn't charge you. We'll build your homepage and email you a private preview within ${PREVIEW_DAYS} business days. You only pay if you love it.`
      : `Next, you'll pay ${money(payingInFull() ? total : depositOf(total))} on our secure Stripe page by card, Apple Pay, Cash App Pay, Klarna and more. Your order starts only once it's paid.`;
    const dueNow = !engineOnly && !scheduleOnly && !previewFirst && total ? (payingInFull() ? total : depositOf(total)) : 0;
    inlinePay.sync(dueNow);
    if (inlinePay.active()) $("[data-review-note]").textContent = "Your order starts as soon as your payment goes through.";
    if (!scheduleOnly) $("button[type=submit]").textContent = previewFirst ? "Request my free preview" : !dueNow ? "Send my project" : inlinePay.active() ? `Pay ${money(dueNow)} and send` : `Continue to pay ${money(dueNow)}`;
    const careChoice = $('[name="care-plan"]').closest("fieldset");
    careChoice.hidden = site === "none";
    const payChoice = $("[data-pay-choice]");
    payChoice.hidden = site === "engine" || !total || previewFirst;
    payChoice.querySelectorAll("input").forEach((input) => { input.disabled = payChoice.hidden; });
    $("[data-pay-part]").textContent = total ? `${money(depositOf(total))} now, then ${money(total - depositOf(total))} when you approve your work.` : "";
    $("[data-pay-all]").textContent = total ? `${money(total)} once and you're done. You still see your site and approve it first.` : "";
    $$("[data-speed]").forEach((label) => { label.textContent = speedText(days, label.dataset.speed); });
    $("[data-field-delivery]").value = delivery;
    $("[data-field-summary]").value = [
      ...lines.map(([label, amount]) => `${label}: ${amount < 0 ? "-" : ""}${money(Math.abs(amount))}`),
      ...(site === "engine" && total === 0 ? [] : [`Total: ${money(total)}`]),
      ...(previewFirst ? ["Free homepage preview first", ...(systemsOrder ? [`50% after your preview: ${money(afterPreview)}`, `Due on approval: ${money(total - afterPreview)}`] : [`Due after your preview: ${money(total)}`])] : site !== "engine" && total > 0 ? (payingInFull() ? [`Pay in full: ${money(total)}`] : [`${DEPOSIT_PERCENT}% deposit: ${money(depositOf(total))}`, `Due on approval: ${money(total - depositOf(total))}`]) : []),
      ...(care ? [`Care: ${money(carePrice)}/mo`] : []),
      ...(engine ? [`VFM Engine: ${money(enginePrice)}/mo${offer ? ` after code ${offer.code}` : ""}`] : []),
    ].join("; ");

    $$("[data-show-for]").forEach((block) => { block.hidden = block.dataset.showFor !== site; });
    $$("[data-way]").forEach((block) => { block.hidden = block.dataset.way !== method; });
    $$("[data-feature]").forEach((block) => { block.hidden = !extras.includes(block.dataset.feature); });
    $("[data-no-features]").hidden = extras.length > 0;
    syncUploadAgree();
    const depositLine = document.querySelector("[data-summary-deposit]");
    depositLine.hidden = engineOnly || !total;
    depositLine.textContent = previewFirst ? (systemsOrder ? `Free homepage preview first, then ${money(afterPreview)} (half) once you love it and ${money(total - afterPreview)} when you approve` : `Free homepage preview first. Pay ${money(total)} only once you love it`) : payingInFull() ? `Paying in full: ${money(total)}, with nothing more due when you approve` : `${DEPOSIT_PERCENT}% to start: ${money(depositOf(total))}, then ${money(total - depositOf(total))} when you approve`;
    renderReview(total, monthlyTotal, delivery, method, enginePrice);
    const processSteps = engineOnly
      ? [
        ["Send this form", "Nothing is charged yet."],
        ["We check that it fits", "We review your business and show you where your posts will appear."],
        ["Start your plan", `We email a secure link for ${engine ? `${money(enginePrice)} a month` : "your payment"}.`],
        ["We get to work", "Your first pages are built in the first week, and you get a report every month."],
      ]
      : previewFirst
      ? [
        ["Request your free preview", "Nothing is charged. Just tell us about your business."],
        ["See your homepage first", `Within ${PREVIEW_DAYS} business days, we email you a private code to see your new homepage. It's yours to look at for 14 days.`],
        systemsOrder ? ["Love it? Pay half to continue", `${money(afterPreview)} on this estimate, and we build the rest of your site. Not for you? You owe nothing.`] : ["Love it? Pay to continue", `${money(total)} on this estimate, and we build the rest of your site. Not for you? You owe nothing.`],
        ["Check it and ask for changes", "You see the whole site, with two rounds of changes included."],
        systemsOrder ? ["Approve and go live", `${money(total - afterPreview)} when you approve. We put it live on your Care plan and hand over everything that's yours.`] : ["Approve and go live", "Nothing more to pay for your setup. We put it live on your Care plan and hand over everything that's yours."],
      ]
      : [
        ...(total ? [["Send your selections", "Then you go straight to our secure payment page."]] : [["Send this form", "Nothing is charged yet."], ["Get your written price", "We email your final price and a secure payment link."]]),
        payingInFull() ? ["Pay in full", `${money(total)} right after you send this. We start building once it's paid.`] : [`Pay ${DEPOSIT_PERCENT}% to start`, total ? `${money(depositOf(total))} right after you send this. We start building once it's paid.` : "Then we start building."],
        ["See it first", `Within ${speedDays(days, speed)} business day${speedDays(days, speed) === 1 ? "" : "s"}, we email you a private code. Open the Menu at the top of our site, choose Check Project and enter your code to see your project. Two rounds of changes are included.`],
        payingInFull() ? ["Approve it", `Nothing more to pay for your setup.${site === "none" ? "" : " You also choose a Care plan or your own hosting."}`] : ["Approve and pay the rest", `${total ? `${money(total - depositOf(total))} on this estimate, only once you're happy with it.` : "Only once you're happy with it."}${site === "none" ? "" : " You also choose a Care plan or your own hosting."}`],
        [site === "none" ? "Get your finished work" : "Get your finished site", site === "none" ? "Once you approve, we hand everything over." : payingInFull() ? "Once you approve, we put it live and hand over everything that's yours." : "Once your payment arrives, we put it live and hand over everything that's yours."],
      ];
    document.querySelectorAll("[data-process]").forEach((list) => {
      const freeOrder = !engineOnly && !total && Boolean(saving);
      const shownSteps = freeOrder
        ? processSteps.filter(([title]) => !/^Pay|written price/i.test(title)).map(([title, text]) => (/^Approve/.test(title) ? ["Approve it", "Nothing to pay. You also choose how your site stays online."] : [title, text]))
        : processSteps;
      list.replaceChildren(...shownSteps.map(([title, text]) => {
        const item = document.createElement("li");
        const name = document.createElement("b");
        name.textContent = title;
        item.append(name, ` ${text}`);
        return item;
      }));
    });
    showMissing();
  };

  const renderReview = (total, care, delivery, method, enginePrice) => {
    const { data, site, extras } = selected();
    const when = data.get("reach-by") === "Email" ? "We'll email you" : slotField.value ? `${chosenLabel()}, by phone` : "No time chosen yet";
    const detail = method === "Schedule a call" ? when : method === "No-call delivery" ? delivery : data.get("contact-message") || "No message yet";
    const rows = [
      ["Name", data.get("name") || "Missing"],
      ["Business", data.get("business") || "Missing"],
      ["Email", data.get("email") || "Missing"],
      ["For", [data.get("project-purpose"), data.get("project-specifics")].filter(Boolean).join(": ") || "Not filled in yet"],
      ["Website", site === "engine" ? "None, VFM Engine only" : site === "custom" ? "Fully custom" : site === "template" ? `Template: ${data.get("template") || "not chosen yet"}` : site === "unsure" ? "Help me choose" : site === "none" ? "None, services only" : "Not chosen yet"],
      ["VFM Engine", enginePrice ? `${money(enginePrice)} a month` : "Not now"],
      ["Add-ons", extras.map((key) => EXTRA_LABEL[key]).join(", ") || "None"],
      ["Speed", site === "engine" ? "Not needed" : SPEEDS[data.get("delivery-speed")].label],
      ...(previewFirstFor(site, total) ? [["To start", "Nothing. Your homepage preview is free"], ["After your preview", isSystems(site, extras) ? `${money(afterPreviewDue(site, extras, total))} (half), then ${money(total - afterPreviewDue(site, extras, total))} when you approve` : `${money(total)}, only if you love it`]] : site === "engine" || !total ? [] : [["To start", payingInFull() ? `${money(total)} (paid in full), on the next page` : `${money(depositOf(total))} (${DEPOSIT_PERCENT}%), on the next page`], ["When you approve your work", payingInFull() ? "$0" : money(total - depositOf(total))]]),
      ["Files", pendingUploads.length ? `${pendingUploads.length} attached` : "None"],
      ["Estimate", site === "engine" && total === 0 ? `${money(care)}/mo` : `${money(total)}${care ? ` plus ${money(care)} a month` : ""}`],
      ["How we'll work", method],
      ["Details", detail],
    ];
    const review = $("[data-review]");
    const skipForEngine = ["Website", "Speed", "How we'll work", "Details", "For"];
    const keepForCall = ["Name", "Business", "Email", "Details"];
    review.replaceChildren(
      ...rows.filter(([label]) => !scheduleOnly || keepForCall.includes(label)).filter(([label]) => site !== "engine" || !(skipForEngine.includes(label) || (label === "Add-ons" && !extras.length))).map(([label, value]) => {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = value;
        row.append(term, description);
        return row;
      }),
    );
  };

  const showCode = () => {
    const value = codeInput.value.trim();
    codeNote.hidden = !value;
    const offer = findOffer(value);
    codeNote.textContent = offer
      ? offerText(offer)
      : "We don't recognize that code. Check it, or send this form anyway and we'll help.";
  };
  codeInput.addEventListener("input", showCode);
  codeInput.addEventListener("input", async () => {
    if (await checkPartner(codeInput.value)) {
      showCode();
      render();
    }
  });

  const stage = $("[data-business-stage]");
  const starterNote = $("[data-starter-note]");
  const showStarterNote = () => { starterNote.hidden = !stage.value.startsWith("Not yet"); };
  stage.addEventListener("change", showStarterNote);

  const applyPackage = (name) => {
    const packages = {
      launch: { site: "template", extras: [] },
      growth: { site: "custom", extras: ["booking", "assistant"] },
      systems: { site: "custom", extras: ["booking", "assistant", "crm", "automations", "logo", "domain"] },
    };
    const choice = packages[name];
    if (!choice) return;
    $(`[name="site-type"][value="${choice.site}"]`).checked = true;
    $$('[name="addons"]').forEach((box) => { box.checked = choice.extras.includes(box.value); });
    radio("engine-plan", name === "systems" ? "400" : "0");
    $$("[data-package]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.package === name)));
  };
  $$("[data-package]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      applyPackage(button.dataset.package);
      render();
    });
  });

  const params = new URLSearchParams(location.search);
  const radio = (name, value) => {
    const input = $$(`[name="${name}"]`).find((item) => item.value === value);
    if (input) input.checked = true;
    return Boolean(input);
  };
  applyPackage(params.get("package"));
  if (params.get("site")) radio("site-type", params.get("site"));
  if (params.get("pages")) radio("page-count", params.get("pages"));
  if (params.get("care")) radio("care-plan", params.get("care"));
  if (Number(params.get("engine")) > 0) radio("engine-plan", "400");
  (params.get("extras") ?? "").split(",").forEach((key) => {
    const box = $$('[name="addons"]').find((item) => item.value === key);
    if (box) box.checked = true;
  });
  if (params.get("site") === "engine" && !params.has("engine") && !(params.get("extras") ?? "").includes("search")) radio("engine-plan", "400");
  if (SPEEDS[params.get("speed")]) radio("delivery-speed", params.get("speed"));
  const socialDrop = $("[data-social-drop]");
  const socialBoxes = $$('[data-social-drop] [name="addons"]');
  const showSocialChoice = () => {
    const chosen = socialBoxes.filter((box) => box.checked);
    $("[data-social-hint]").textContent = chosen.length ? `${chosen.length} selected` : "Tap to see services and prices";
    const pick = $("[data-social-pick]");
    pick.hidden = !chosen.length;
    pick.querySelectorAll("input").forEach((input) => { input.disabled = pick.hidden; });
  };
  socialBoxes.forEach((box) => box.addEventListener("change", () => {
    if (box.checked && box.value === "social-kit") socialBoxes.filter((other) => other !== box).forEach((other) => { other.checked = false; });
    if (box.checked && box.value !== "social-kit") socialBoxes.find((other) => other.value === "social-kit").checked = false;
    showSocialChoice();
    box.dispatchEvent(new Event("input", { bubbles: true }));
  }));
  if (socialBoxes.some((box) => box.checked)) socialDrop.open = true;
  showSocialChoice();
  const showReach = () => {
    const email = $('[name="reach-by"]:checked')?.value === "Email";
    picker.hidden = email;
    $("[data-email-note]").hidden = !email;
    if (email) {
      slotField.value = "";
      slotLabel.hidden = true;
    }
    render();
  };
  $$('[name="reach-by"]').forEach((choice) => choice.addEventListener("change", showReach));
  if (params.get("reach") === "email") radio("reach-by", "Email");
  const startingTemplate = $$('[name="template"]').find((item) => item.dataset.slug === params.get("template"));
  if (startingTemplate) {
    radio("site-type", "template");
    startingTemplate.checked = true;
  }
  if (params.has("sections")) {
    radio("detail-level", "Every detail");
    const carried = { "design-colors": "palette", "design-font": "font", "design-top": "hero", "design-services": "services", "design-corners": "corners", "design-spacing": "spacing" };
    Object.entries(carried).forEach(([name, key]) => {
      const option = [...$(`[name="${name}"]`).options].find((item) => item.dataset.key === params.get(key));
      if (option) option.selected = true;
    });
    const wanted = params.get("sections").split(",");
    $$('[name="design-sections"]').forEach((box) => { box.checked = wanted.includes(box.dataset.key); });
  }
  const startingOffer = findOffer(params.get("code"));
  if (!startingOffer && (params.get("code") || referralCode())) {
    const incoming = params.get("code") || referralCode();
    checkPartner(incoming).then((valid) => {
      if (!valid) return;
      codeInput.value = incoming.trim().toUpperCase();
      showCode();
      render();
    });
  }
  if (startingOffer) {
    codeInput.value = startingOffer.code;
    showCode();
  }

  $("[data-template-select]").addEventListener("change", (event) => {
    const choice = $$('[name="template"]').find((item) => item.dataset.slug === event.target.value);
    if (choice) {
      choice.checked = true;
    } else {
      $$('[name="template"]').forEach((item) => { item.checked = false; });
    }
    render();
  });
  $("[data-want-website]").addEventListener("click", () => {
    radio("site-type", "template");
    render();
    showTab(firstVisible());
  });
  form.addEventListener("change", (event) => {
    if (event.target.name === "site-type" && event.target.value === "engine" && !$('[name="addons"][value="search"]').checked) radio("engine-plan", "400");
    if (["site-type", "addons"].includes(event.target.name)) {
      $$("[data-package]").forEach((button) => button.setAttribute("aria-pressed", "false"));
    }
    render();
  });
  form.addEventListener("input", () => {
    $$("[data-problem]").forEach((note) => note.remove());
    render();
  });
  $('[name="domain-status"]').addEventListener("change", (event) => {
    const box = $('[name="addons"][value="domain"]');
    if (event.target.value.startsWith("No,")) {
      box.checked = true;
      box.dataset.autoTicked = "yes";
      render();
    } else if (box.dataset.autoTicked === "yes") {
      box.checked = false;
      delete box.dataset.autoTicked;
      render();
    }
  });

  const buildNeeds = () => {
    if (scheduleOnly) return [];
    const data = new FormData(form);
    return vfmBuildNeeds((name) => (name === "__uploads" ? (pendingUploads.length ? "yes" : "") : data.getAll(name).map(String).filter(Boolean).join(", ")));
  };
  const needField = (item) => {
    if (item.field === "__uploads") return $("#panel-design [data-upload-input]");
    return $$(`[name="${item.field}"]`).find((field) => field.closest('[role="tabpanel"]') && !field.closest("[hidden]")) ?? $(`[name="${item.field}"]`);
  };

  const missingItems = () => {
    const { data, method, site, engine } = selected();
    const items = [];
    const need = (tab, label) => items.push({ tab, label });
    const searchOnly = site === "engine" && !engine && $('[name="addons"][value="search"]').checked;
    if (site === "engine" && !engine && !searchOnly) need("service", "Choose a VFM Engine plan");
    if (site === "none" && !$$('[name="addons"]:checked').length) need("service", "Choose a service");
    if (!scheduleOnly && !site && !engine && !data.getAll("addons").length) need("service", "Choose a package, or what you need");
    if (!$('[name="name"]').value.trim()) need("business", "Your name");
    if (!$('[name="business"]').value.trim()) need("business", "Your business name, or your idea");
    if (!$('[name="email"]').value.trim() || !$('[name="email"]').checkValidity()) need("business", "A valid email");
    if (method === "Schedule a call" && data.get("reach-by") === "Call" && !$('[name="phone"]').value.trim()) need("business", "A phone number for your call");
    if (site === "engine" && !$('[name="current-website"]').value.trim()) need("business", "Your current website");
    if (site === "engine" && engine && !$('[name="engine-products"]').value.trim()) need("business", "What VFM Engine should promote");
    if (pendingUploads.length && !activeUploadAgree().checked) {
      need(site === "engine" ? "business" : "design", "Confirm you have permission to use your files");
    }
    if (method === "Schedule a call" && data.get("reach-by") !== "Email" && !slotField.value) need("contact", "Choose a day and time for your call");
    if (method === "Leave a message" && !$('[name="contact-message"]').value.trim()) need("contact", "Write your message");
    buildNeeds().forEach((item) => need(item.tab, item.label));
    if (!scheduleOnly && !$('[name="terms-agreed"]').checked) need("review", "Agree to the terms and policies");
    return items;
  };
  const showMissing = () => {
    const items = missingItems();
    tabs.forEach((tab) => {
      const short = tab.id.replace("tab-", "");
      const count = items.filter((item) => item.tab === short).length;
      tab.classList.toggle("has-missing", count > 0);
      tab.setAttribute("aria-description", count ? `${count} still needed` : "");
    });
    const box = $("[data-still-needed]");
    box.hidden = !items.length;
    const title = document.createElement("p");
    title.textContent = "Still needed before you can send:";
    const list = document.createElement("ul");
    items.forEach((item) => {
      const row = document.createElement("li");
      const jump = document.createElement("button");
      jump.type = "button";
      jump.textContent = item.label;
      jump.addEventListener("click", () => goTo(tabs.findIndex((tab) => tab.id === `tab-${item.tab}`)));
      row.append(jump);
      list.append(row);
    });
    box.replaceChildren(title, list);
  };

  const firstProblem = () => {
    const { method, site, engine } = selected();
    const searchOnly = site === "engine" && !engine && $('[name="addons"][value="search"]').checked;
    if (site === "engine" && !engine && !searchOnly) return [$('[name="engine-plan"]'), "Please choose a VFM Engine plan or Search Engine Setup, or pick a website option."];
    if (site === "none" && !$$('[name="addons"]:checked').length) {
      $("[data-social-drop]").open = true;
      return [$('[name="addons"][value="social-one"]'), "Please choose a service."];
    }
    if (site === "engine" && engine && !$('[name="engine-products"]').value.trim()) return [$('[name="engine-products"]'), "Please tell us which products or services to promote."];
    if (pendingUploads.length && !activeUploadAgree().checked) return [activeUploadAgree(), "Please confirm you have permission to use the files you uploaded."];
    if (site === "engine" && !$('[name="current-website"]').value.trim()) return [$('[name="current-website"]'), "This service needs a live website, so please add yours. No website yet? Pick a website package."];
    for (const name of ["name", "business", "email"]) {
      const field = $(`[name="${name}"]`);
      if (!field.value.trim() || !field.checkValidity()) return [field, "Please fill in your name, business and a valid email."];
    }
    if (method === "Schedule a call") {
      if (selected().data.get("reach-by") !== "Email" && !slotField.value) return [picker, "Please choose a day and time for your call."];
      if (selected().data.get("reach-by") === "Call" && !$('[name="phone"]').value.trim()) return [$('[name="phone"]'), "Please add your phone number so we can call you, or choose email on the Schedule tab."];
    }
    if (method === "Leave a message" && !$('[name="contact-message"]').value.trim()) return [$('[name="contact-message"]'), "Please write your message."];
    const agree = $('[name="terms-agreed"]');
    if (!scheduleOnly && !site && !engine && !selected().extras.length) return [$('[name="site-type"]'), "Please choose a package, or what you need."];
    const buildNeed = buildNeeds()[0];
    if (buildNeed) return [needField(buildNeed), `We need this to build your project: ${buildNeed.label}.`];
    if (!scheduleOnly && !agree.checked) return [agree, "Please confirm you've read the terms and policies."];
    return null;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    render();
    const problem = firstProblem();
    if (problem) {
      const [field, message] = problem;
      showTab(panels.indexOf(field.closest('[role="tabpanel"]')));
      field.focus();
      status.textContent = "";
      const note = field.closest('[role="tabpanel"]').querySelector("[data-problem]") ?? (() => {
        const created = document.createElement("p");
        created.className = "form__error";
        created.setAttribute("role", "alert");
        created.dataset.problem = "";
        field.closest('[role="tabpanel"]').querySelector("h2").after(created);
        return created;
      })();
      note.textContent = message;
      return;
    }
    $$("[data-problem]").forEach((note) => note.remove());
    const button = $("button[type=submit]");
    button.disabled = true;
    status.textContent = "Sending...";
    try {
      if (inlinePay.active()) {
        const { error: detailsError } = await inlinePay.elements.submit();
        if (detailsError) {
          status.textContent = detailsError.message;
          return;
        }
        $("[data-field-pay-now]").value = "yes";
        $("[data-field-pay-amount]").value = String(Math.round(inlinePay.due * 100));
      }
      const sent = inlinePay.secret ? {} : await sendForm(form);
      if (inlinePay.active()) {
        if (sent.payError === "price") {
          status.textContent = `The price for this order is ${money(sent.dueNow)}. Please reload this page and try again.`;
          return;
        }
        inlinePay.secret = inlinePay.secret || sent.clientSecret || "";
        if (inlinePay.secret) {
          status.textContent = "Processing your payment...";
          const { error: payError } = await inlinePay.stripe.confirmPayment({
            elements: inlinePay.elements,
            clientSecret: inlinePay.secret,
            redirect: "if_required",
            confirmParams: {
              return_url: `${location.origin}/book.html?paid=1`,
              payment_method_data: { billing_details: { name: $('[name="name"]').value, email: $('[name="email"]').value } },
            },
          });
          if (payError) {
            status.textContent = `${payError.message} Your selections are saved, so you can try again.`;
            return;
          }
          inlinePay.paid = true;
        }
      }
      const booked = selected().method === "Schedule a call" ? chosenLabel() : "";
      const done = document.createElement("div");
      done.className = "done";
      const title = document.createElement("h2");
      const text = document.createElement("p");
      const emailOnly = scheduleOnly && !booked;
      const owesNow = !inlinePay.paid && !scheduleOnly && siteType() !== "engine" && /(20% deposit|Pay in full): \$[1-9]/.test($("[data-field-summary]").value);
      const previewOrder = /Free homepage preview first/.test($("[data-field-summary]").value);
      title.textContent = previewOrder && !booked ? "Your free preview is on its way." : booked ? "You're booked." : emailOnly ? "Thanks, we'll email you." : inlinePay.paid ? "Payment received. Your project is started." : owesNow ? "One last step: your payment." : "Thanks, we've got your project.";
      text.textContent = previewOrder && !booked
        ? `We'll build your homepage and email your private code within ${PREVIEW_DAYS} business days. To see it, open the Menu at the top of our site and choose Check Project. You haven't been charged, and you only pay if you love it.`
        : booked
        ? `${booked}. We'll call you then. Please save this time, as we don't send a calendar invite. You haven't been charged.`
        : emailOnly ? "We'll reply to the email address you gave us. You haven't been charged."
        : inlinePay.paid ? "Stripe will email your receipt. When your project is ready, we'll email your private code. To view it, open the Menu at the top of our site and choose Check Project."
        : owesNow ? "Your selections are saved, and you haven't been charged yet." : siteType() === "engine" ? "We'll check that your business fits, then email you a secure link to get started. You haven't been charged." : /Code [^:]+: -/.test($("[data-field-summary]").value) && /Total: \$0(;|$)/.test($("[data-field-summary]").value) ? "No payment is needed for this order. We'll email your private code when your project is ready to view." : `We'll email you with your written price and next steps. We start work once your ${payingInFull() ? "payment is in" : "20% deposit is paid"}. You haven't been charged.`;
      const spamTip = document.createElement("p");
      spamTip.className = "small-print";
      spamTip.textContent = "Our emails come from vfmnova@gmail.com. If you don't see one, check your spam or junk folder and mark it Not spam.";
      done.append(title, text, spamTip);
      const summaryText = $("[data-field-summary]").value;
      const depositDue = summaryText.match(/20% deposit: (\$[\d,]+)/)?.[1];
      const fullDue = summaryText.match(/Pay in full: (\$[\d,]+)/)?.[1];
      const totalDue = summaryText.match(/Total: (\$[\d,]+)/)?.[1];
      if (owesNow) {
        const payNote = document.createElement("p");
        payNote.textContent = booked
          ? `To keep your call and start your project, pay ${fullDue || depositDue} now. It's filled in on the next page, so please check it matches. Your order starts once it's paid.`
          : `Taking you to our secure payment page. Your ${fullDue || depositDue} is filled in there, so please check it matches. Your order starts once it's paid.${fullDue ? "" : ` Want it done and paid for? Change the amount to ${totalDue}.`}`;
        const pay = document.createElement("a");
        pay.className = "btn btn--dark";
        pay.href = payUrl(DEPOSIT_LINK, Number((fullDue || depositDue).replace(/[^\d.]/g, "")));
        pay.rel = "noopener";
        pay.textContent = fullDue ? `Pay ${fullDue} in full` : `Pay ${depositDue} deposit`;
        done.append(payNote, pay, payTrust());
      }
      const payLinkNow = done.querySelector("a.btn--dark");
      form.replaceWith(done);
      if (payLinkNow && !booked) window.setTimeout(() => { window.location.href = payLinkNow.href; }, 1500);
      summary.hidden = scheduleOnly;
      title.tabIndex = -1;
      title.focus();
    } catch (error) {
      if (error.message === "taken") {
        status.textContent = "";
        showTab(panels.indexOf(picker.closest('[role="tabpanel"]')));
        slotField.value = "";
        slotLabel.hidden = false;
        slotLabel.textContent = "Someone just took that time. Please choose another.";
        await loadSlots().catch(loadFailed);
        slotLabel.hidden = false;
        picker.focus();
        render();
      } else {
        status.textContent = "That didn't send. Please try again in a moment.";
      }
    } finally {
      button.disabled = false;
    }
  });

  inlinePay.start(formEndpoint).then(async () => {
    const back = new URLSearchParams(location.search).get("payment_intent_client_secret");
    if (back && inlinePay.stripe) {
      const { paymentIntent } = await inlinePay.stripe.retrievePaymentIntent(back);
      const good = paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status);
      const done = document.createElement("div");
      done.className = "done";
      const title = document.createElement("h2");
      title.textContent = good ? "Payment received. Your project is started." : "That payment didn't go through.";
      const text = document.createElement("p");
      text.textContent = good ? "Stripe will email your receipt. When your project is ready, we'll email your private code. To view it, open the Menu at the top of our site and choose Check Project." : "You haven't been charged. Please start your order again, or submit a ticket and we'll help.";
      done.append(title, text);
      form.replaceWith(done);
      return;
    }
    if (inlinePay.stripe) form.dispatchEvent(new Event("change", { bubbles: true }));
  }).catch(() => {});
  $("[data-field-referral]").value = referralCode();
  if (scheduleOnly) {
    document.querySelector(".page-head h1").textContent = "Schedule a call.";
    document.querySelector(".page-head .lead").textContent = "Pick a day and time that works for you. Calls take 10 to 15 minutes, and there's no obligation.";
    const callOnly = document.createElement("input");
    callOnly.type = "hidden";
    callOnly.name = "call-only";
    callOnly.value = "yes";
    form.append(callOnly);
    document.querySelector(".schedule-tab")?.setAttribute("hidden", "");
  }
  const WAYS = { call: "Schedule a call", message: "Leave a message", nocall: "No-call delivery" };
  const way = WAYS[params.get("way")];
  if (way) radio("contact-method", way);
  showTab(way ? panels.indexOf($("#panel-contact")) : 0);
  render();
  showReach();
}

document.querySelectorAll("[data-simple-form]").forEach((simple) => {
  const status = simple.querySelector("[data-form-status]");
  simple.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!simple.checkValidity()) {
      status.textContent = simple.querySelector('input[type="checkbox"]') ? "Please fill in the required fields and agree to the rules." : "Please fill in the required fields, and check that your email is correct.";
      simple.querySelector(":invalid")?.focus();
      return;
    }
    const button = simple.querySelector("button[type=submit]");
    button.disabled = true;
    status.textContent = "Sending...";
    try {
      const result = await sendForm(simple);
      simple.reset();
      const formName = simple.getAttribute("name");
      if (formName === "affiliate-application" && result?.code) {
        const link = `https://ainova.to/book.html?ref=${result.code}`;
        const welcome = document.createElement("div");
        welcome.className = "done";
        const heading = document.createElement("h2");
        const yours = document.createElement("p");
        const share = document.createElement("p");
        const anchor = document.createElement("a");
        const save = document.createElement("p");
        heading.textContent = "You're in.";
        yours.textContent = `Your code is ${result.code}. Your clients save 15% on setup and VFM Engine with it.`;
        share.textContent = "Your link: ";
        anchor.className = "link";
        anchor.href = link;
        anchor.textContent = link;
        share.append(anchor);
        save.textContent = "Please save these now. Tell people you may earn a commission whenever you share them.";
        const key = document.createElement("p");
        key.textContent = `Your private portal key is ${result.key}. Save it, and don't share it. You'll use it with your email to log in and see your referrals and commissions.`;
        const login = document.createElement("a");
        login.className = "btn btn--dark";
        login.href = "/affiliate-portal.html";
        login.textContent = "Go to affiliate login";
        welcome.append(heading, yours, share, save, ...(result.key ? [key, login] : []));
        simple.replaceWith(welcome);
        return;
      }
      status.textContent = formName === "payout-request"
        ? `Thanks, we've received your claim. We'll review it and email you. Your reference is ${result?.ticket ?? "on its way"}.`
        : result?.ticket
          ? `Thanks, your ticket number is ${result.ticket}. Please save it. A person will follow up soon.`
          : "Thanks, we've got it. We'll reply by email.";
    } catch {
      status.textContent = "That didn't send. Please try again in a moment.";
    } finally {
      button.disabled = false;
    }
  });
});

const portalForm = document.querySelector("[data-portal-form]");
if (portalForm) {
  const portal = (name) => document.querySelector(`[data-portal-${name}]`);
  const account = portal("account");
  const status = portal("status");
  const dollars = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;
  const fill = (body, rows, empty) => {
    body.replaceChildren();
    (rows.length ? rows : [[empty]]).forEach((cells) => {
      const row = document.createElement("tr");
      cells.forEach((text) => {
        const cell = document.createElement("td");
        cell.textContent = text;
        if (cells.length === 1) cell.colSpan = 4;
        row.append(cell);
      });
      body.append(row);
    });
  };
  portalForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!portalForm.checkValidity()) {
      status.textContent = "Please enter your email and portal key.";
      return;
    }
    const button = portalForm.querySelector("button[type=submit]");
    button.disabled = true;
    status.textContent = "Logging in...";
    try {
      const body = new URLSearchParams(new FormData(portalForm)).toString();
      const response = await fetch(formEndpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      const me = await response.json();
      if (!me.ok) {
        status.textContent = me.error === "busy" ? "Too many tries. Please wait an hour and try again." : "That email and portal key don't match. Please check them and try again.";
        return;
      }
      const link = `${location.origin}/?ref=${me.code}`;
      portal("name").textContent = `Welcome, ${me.name}.`;
      portal("code").textContent = me.code;
      portal("link").textContent = link;
      portal("link").href = link;
      portal("count").textContent = me.referrals.length;
      portal("waiting").textContent = dollars(me.totals.waiting);
      portal("ready").textContent = dollars(me.totals.ready);
      portal("paid").textContent = dollars(me.totals.paid);
      fill(portal("referrals"), me.referrals.map((r) => [r.date, r.business, r.commission ? dollars(r.commission) : "To be confirmed", r.status]), "No referrals yet. Share your link to get started.");
      fill(portal("claims"), me.claims.map((c) => [c.date, c.ticket, c.business, c.status]), "No claims yet.");
      portalForm.reset();
      status.textContent = "";
      portalForm.hidden = true;
      account.hidden = false;
      portal("name").tabIndex = -1;
      portal("name").focus();
    } catch {
      status.textContent = "That didn't work. Please try again in a moment.";
    } finally {
      button.disabled = false;
    }
  });
  portal("logout").addEventListener("click", () => location.reload());
}

const show = document.querySelector("[data-slideshow]");
if (show) {
  const slides = [...show.querySelectorAll(".show__slide")];
  const dots = show.querySelector("[data-show-dots]");
  const pauseButton = show.querySelector("[data-show-pause]");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let paused = calm;
  let held = false;
  const dotButtons = slides.map((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${slide.getAttribute("aria-label")}`);
    dot.addEventListener("click", () => goTo(i));
    dots.append(dot);
    return dot;
  });
  function goTo(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === index);
      slide.inert = n !== index;
    });
    dotButtons.forEach((dot, n) => dot.setAttribute("aria-current", String(n === index)));
  }
  show.querySelector("[data-show-prev]").addEventListener("click", () => goTo(index - 1));
  show.querySelector("[data-show-next]").addEventListener("click", () => goTo(index + 1));
  pauseButton.hidden = calm;
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.textContent = paused ? "Play" : "Pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
  });
  for (const [type, value] of [["mouseenter", true], ["mouseleave", false], ["focusin", true], ["focusout", false]]) {
    show.addEventListener(type, () => { held = value; }, { passive: true });
  }
  setInterval(() => {
    if (!paused && !held && !document.hidden) goTo(index + 1);
  }, 6000);
  goTo(0);
}

const nextTimes = document.querySelector("[data-next-times]");
const reachLink = (time) => `/book.html?schedule=1${time ? `&time=${encodeURIComponent(time)}` : ""}`;
document.querySelectorAll("[data-reach]").forEach((button, _, all) => button.addEventListener("click", () => {
  const email = button.dataset.reach === "email";
  all.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
  document.querySelector("[data-reach-title]").textContent = email ? "Have us email you" : "Set a call time";
  document.querySelector("[data-reach-text]").textContent = email
    ? "Leave your email address, and we'll reach out."
    : "A free 10- to 15-minute call. Pick the time that suits you.";
  nextTimes.hidden = email;
  document.querySelector("[data-reach-all]").hidden = email;
  document.querySelector("[data-reach-form]").hidden = !email;
}));
const reachForm = document.querySelector("[data-reach-form]");
reachForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const note = reachForm.querySelector("[data-reach-status]");
  if (!reachForm.checkValidity()) {
    note.textContent = reachForm.elements.email.checkValidity() ? "Please tell us briefly what you want." : "Please enter a valid email address.";
    return;
  }
  const button = reachForm.querySelector("button");
  button.disabled = true;
  note.textContent = "Sending...";
  try {
    await sendForm(reachForm);
    reachForm.reset();
    note.textContent = "Thanks, we'll email you soon.";
  } catch {
    note.textContent = "That didn't send. Please try again in a moment.";
  } finally {
    button.disabled = false;
  }
});
if (nextTimes && formEndpoint) {
  fetch(`${formEndpoint}?action=slots`).then((reply) => reply.json()).then(({ slots }) => {
    const label = (iso) => new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
    nextTimes.replaceChildren(...slots.slice(0, 3).map((iso) => {
      const link = document.createElement("a");
      link.dataset.time = iso;
      link.href = reachLink(iso);
      link.textContent = label(iso);
      return link;
    }));
  }).catch(() => {});
}

const estimateTotal = document.querySelector("[data-total], [data-summary-total]");
if (estimateTotal) {
  const bar = document.createElement("div");
  bar.className = "total-bar";
  bar.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = "Estimate";
  const amount = document.createElement("b");
  bar.append(label, amount);
  document.body.append(bar);
  document.body.classList.add("has-total-bar");
  const monthlyPlans = document.createElement("small");
  bar.append(monthlyPlans);
  const monthlyText = document.querySelector("[data-monthly], [data-summary-monthly]");
  const sync = () => {
    const before = amount.textContent + monthlyPlans.textContent;
    amount.textContent = estimateTotal.textContent;
    const perMonth = monthlyText?.textContent.match(/\$[\d,]+/)?.[0];
    monthlyPlans.textContent = perMonth ? `+ ${perMonth}/mo` : "";
    if (before && before !== amount.textContent + monthlyPlans.textContent) {
      amount.classList.remove("is-updated");
      void amount.offsetWidth;
      amount.classList.add("is-updated");
    }
  };
  [estimateTotal, monthlyText].filter(Boolean).forEach((node) => new MutationObserver(sync).observe(node, { childList: true, characterData: true, subtree: true }));
  sync();
  const builder = document.querySelector("[data-calculator], [data-project-form]");
  let totalSeen = false;
  let builderSeen = false;
  const place = () => { bar.classList.toggle("is-hidden", totalSeen || !builderSeen); };
  new IntersectionObserver(([entry]) => { totalSeen = entry.isIntersecting; place(); }).observe(estimateTotal);
  new IntersectionObserver(([entry]) => { builderSeen = entry.isIntersecting; place(); }).observe(builder);
  place();
}

const styleFilter = document.querySelector("[data-style-filter]");
const typeFilter = document.querySelector("[data-type-filter]");
if (styleFilter && typeFilter) {
  const designs = [...document.querySelectorAll(".tpl[data-style]")];
  const empty = document.querySelector("[data-no-designs]");
  const chosen = { style: "all", type: "all" };
  const refresh = () => {
    designs.forEach((design) => {
      design.hidden = (chosen.style !== "all" && design.dataset.style !== chosen.style) || (chosen.type !== "all" && design.dataset.type !== chosen.type);
    });
    empty.hidden = designs.some((design) => !design.hidden);
  };
  [[styleFilter, "style"], [typeFilter, "type"]].forEach(([group, key]) => {
    const buttons = [...group.querySelectorAll("button")];
    buttons.forEach((button) => button.addEventListener("click", () => {
      buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      chosen[key] = button.dataset.filter;
      refresh();
    }));
  });
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const items = document.querySelectorAll(".section__title, .row, .frame, .price-strip > *, .jargon__list > div, .steps__list > li, .package, .tpl");
  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      seen.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -6% 0px" });
  items.forEach((item) => {
    item.classList.add("reveal");
    seen.observe(item);
  });
}

const checkForm = document.querySelector("[data-check-form]");
if (checkForm) {
  const status = document.querySelector("[data-check-status]");
  const result = document.querySelector("[data-check-result]");
  const fromBase64 = (text) => Uint8Array.from(atob(text), (letter) => letter.charCodeAt(0));
  let project = null;
  let projectId = "";
  const respond = (fields) => fetch(formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ business: project.business, "project-id": projectId.slice(0, 8), ...(project.order ? { "order-number": project.order } : {}), ...fields }).toString(),
  }).then((reply) => reply.json()).then((reply) => {
    if (!reply.ok) throw new Error(reply.error || "failed");
  });
  const openProject = async (value) => {
    const code = value.trim().toUpperCase();
    if (!code) {
      status.textContent = "Please enter your project code.";
      return;
    }
    status.textContent = "Opening your project...";
    try {
      const text = new TextEncoder().encode(`vfm-preview:${code}`);
      const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", text));
      projectId = [...hash].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
      const reply = await fetch(`/previews/${projectId}.json`, { cache: "no-store" });
      if (!reply.ok) throw new Error("not-found");
      const file = await reply.json();
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: fromBase64(file.salt), iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(file.iv) }, key, fromBase64(file.data));
      project = JSON.parse(new TextDecoder().decode(plain));
    } catch {
      status.textContent = "We couldn't find that code. Please check it, or submit a ticket and we'll help.";
      return;
    }
    status.textContent = "";
    document.querySelector("[data-check-entry]").hidden = true;
    result.hidden = false;
    document.querySelector("[data-check-business]").textContent = project.business;
    document.querySelector("[data-check-note]").textContent = project.note || "Here's what we've built for you so far.";
    const frame = document.querySelector("[data-check-frame]");
    if (project.url) {
      frame.src = project.url;
      const open = document.querySelector("[data-check-open]");
      open.href = project.url;
      open.hidden = false;
    } else {
      frame.setAttribute("sandbox", "");
      frame.srcdoc = project.html;
    }
    const extrasBox = document.querySelector("[data-check-extras]");
    extrasBox.replaceChildren(...(project.extras ?? []).map((item) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.title;
      img.loading = "lazy";
      const caption = document.createElement("figcaption");
      caption.textContent = item.title;
      figure.append(caption, img);
      return figure;
    }));
    extrasBox.hidden = !(project.extras ?? []).length;
    const homeStage = project.check === 0;
    const rows = homeStage
      ? [["Project total", project.total], ["Paid so far", 0], ["To continue", project.due], ...(project.due < project.total ? [["Due when you approve", project.total - project.due]] : [])]
      : [["Project total", project.total], ["Paid so far", project.paid], ["Due when you approve", project.balance]];
    document.querySelector("[data-check-money]").replaceChildren(...rows.filter(([, amount]) => project.total > 0 || amount).map(([label, amount]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = money(amount);
      row.append(term, detail);
      return row;
    }));
    document.querySelector("[data-check-approve-text]").textContent = project.balance
      ? `Approve it and pay your remaining ${money(project.balance)}. Once your payment arrives, we'll put your site live and hand over everything that's yours.`
      : "Approve it, and we'll put your site live and hand over everything that's yours.";
    const firstCheck = project.check === 1;
    showRounds();
    document.querySelector("[data-check-first]").hidden = !firstCheck;
    document.querySelector("[data-check-final]").hidden = firstCheck || homeStage;
    document.querySelector("[data-check-changes]").hidden = homeStage;
    const home = document.querySelector("[data-check-home]");
    home.hidden = !homeStage;
    if (homeStage) {
      const expired = project.expires && Date.now() > Date.parse(project.expires);
      const half = project.due < project.total;
      document.querySelector("[data-check-frame-note]").textContent = "This is your new homepage, with a preview watermark. The rest of your pages are built once you continue.";
      document.querySelector("[data-check-home-text]").textContent = expired
        ? "This preview has expired. Email vfmnova@gmail.com with your order code and we'll reopen it."
        : `Love it? Pay ${money(project.due)}${half ? ` (half of your ${money(project.total)} total, with the rest when you approve)` : ""} and we build the rest of your site, with two rounds of changes included. Not for you? You owe nothing.`;
      const pay = document.querySelector("[data-check-home-pay]");
      pay.hidden = expired;
      pay.href = payUrl(DEPOSIT_LINK, project.due);
      pay.textContent = `Pay ${money(project.due)} and build my site`;
      pay.onclick = () => { respond({ "form-name": "preview-response", choice: "Opened payment", amount: money(project.due) }).catch(() => {}); };
      document.querySelector("[data-check-home-note]").textContent = expired ? "" : `Secure checkout by Stripe opens in a new tab. ${project.expires ? `This preview is open until ${new Date(project.expires).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.` : ""}`;
      document.querySelector(".check-home-pass").hidden = expired;
      document.querySelector(".check-frame").hidden = expired;
    }
    result.scrollIntoView({ block: "start" });
  };
  document.querySelector("[data-check-home-pass]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const note = document.querySelector("[data-check-home-status]");
    button.disabled = true;
    note.textContent = "Sending...";
    try {
      await respond({ "form-name": "preview-response", choice: "Not for me", note: document.querySelector("[data-check-home-text-input]").value.trim() });
      note.textContent = "Thanks for letting us know. You owe nothing.";
    } catch {
      button.disabled = false;
      note.textContent = "That didn't send. Please try again in a moment.";
    }
  });
  document.querySelector("[data-check-good]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const note = document.querySelector("[data-check-good-status]");
    button.disabled = true;
    note.textContent = "Sending...";
    try {
      await respond({ "form-name": "project-checked", check: "1", feedback: "Looks good so far" });
      note.textContent = "Thank you. We'll finish everything and email you when your second check is ready.";
    } catch {
      button.disabled = false;
      note.textContent = "That didn't send. Please try again in a moment.";
    }
  });
  checkForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openProject(checkForm.elements["project-code"].value);
  });
  const payStep = document.querySelector("[data-check-step-pay]");
  const approveStep = document.querySelector("[data-check-step-approve]");
  const approveButton = document.querySelector("[data-check-approve]");
  const payButtons = document.querySelector("[data-check-pay-buttons]");
  let opened = new Set();
  const choice = () => document.querySelector('[name="after-launch"]:checked');
  const needed = () => {
    const after = choice();
    const list = [];
    if (project.balance) list.push({ key: "balance", label: `Pay your remaining ${money(project.balance)}`, href: payUrl(project.payLink || DEPOSIT_LINK, project.balance) });
    if (after?.dataset.careLink) list.push({ key: "care", label: `Start ${after.value.split(",")[0]} (monthly)`, href: after.dataset.careLink });
    return list;
  };
  const showSteps = () => {
    const after = choice();
    if (!after) return;
    const list = needed();
    payStep.hidden = !list.length;
    document.querySelector("[data-check-approve-step]").textContent = list.length ? "Step 3." : "Step 2.";
    document.querySelector("[data-check-pay-title]").textContent = after.dataset.careLink ? "Start your Care plan" : "Pay your balance";
    payButtons.replaceChildren(...list.map((item) => {
      const link = document.createElement("a");
      link.className = opened.has(item.key) ? "btn btn--outline" : "btn btn--dark";
      link.href = item.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = opened.has(item.key) ? `${item.label} (opened)` : item.label;
      link.addEventListener("click", () => { opened.add(item.key); setTimeout(showSteps, 300); });
      return link;
    }));
    document.querySelector("[data-check-pay-note]").textContent = after.dataset.careLink
      ? "Your plan opens on our secure Stripe page in a new tab and bills monthly from today. Come back here to approve when you're done."
      : "Your payment opens on our secure Stripe page in a new tab. Come back here to approve when you're done.";
    const ready = list.every((item) => opened.has(item.key));
    approveStep.hidden = false;
    approveButton.disabled = !ready;
    approveButton.textContent = !ready ? "Finish step 2 first" : after.dataset.careLink ? "Approve and put my site live" : "Approve and send my files";
  };
  document.querySelectorAll('[name="after-launch"]').forEach((input) => input.addEventListener("change", () => { opened = new Set([...opened].filter((key) => key === "balance")); showSteps(); }));
  approveButton.addEventListener("click", async () => {
    const after = choice();
    const note = document.querySelector("[data-check-pay]");
    note.hidden = false;
    if (!after) {
      note.textContent = "Please choose a Care plan or your own hosting first.";
      return;
    }
    approveButton.disabled = true;
    note.textContent = "Saving your approval...";
    try {
      await respond({ "form-name": "project-approval", approved: "yes", "balance-due": money(project.balance), "after-launch": after.value, "payment-opened": [...opened].join(", ") || "none needed", "gallery-permission": document.querySelector("[data-check-gallery]")?.checked ? "Yes, they allow it in the gallery" : "No" });
      document.querySelectorAll('[name="after-launch"], [data-check-gallery]').forEach((input) => { input.disabled = true; });
      payStep.hidden = true;
      approveStep.hidden = true;
      const owes = project.balance > 0;
      note.textContent = after.dataset.careLink
        ? `Thank you, your approval is saved. ${owes ? "Once your payments show on our side" : "Once your Care plan shows on our side"}, we'll put your site live and email you the link.`
        : owes
          ? "Thank you, your approval is saved. Once your remaining balance shows on our side, we'll email you your site files."
          : "Thank you, your approval is saved. Your order is fully paid, so we'll email you your site files shortly.";
    } catch {
      approveButton.disabled = false;
      note.textContent = "That didn't save. Please try again in a moment.";
    }
  });
  const changes = document.querySelector("[data-check-changes]");
  let roundsLeft = 2;
  let sentThisVisit = false;
  function showRounds() {
    roundsLeft = Number.isFinite(project.changesLeft) ? project.changesLeft : 2;
    const text = document.querySelector("[data-check-rounds]");
    const box = changes.elements["requested-changes"];
    const button = changes.querySelector("button[type=submit]");
    if (roundsLeft <= 0) {
      text.textContent = "You've used both rounds of changes included with your order. For anything more, send us a ticket and we'll give you a price first.";
      box.closest("label").hidden = true;
      button.hidden = true;
      return;
    }
    text.textContent = `You have ${roundsLeft} of 2 rounds of changes left. Sending changes uses one, so put everything you want changed in one message.`;
  }
  changes.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = document.querySelector("[data-check-changes-status]");
    const wanted = changes.elements["requested-changes"].value.trim();
    if (!wanted) {
      note.textContent = "Please tell us what you'd like changed.";
      return;
    }
    note.textContent = "Sending...";
    try {
      if (sentThisVisit) {
        note.textContent = "We already have your changes for this round. If you forgot something, send a ticket and we'll add it to this round.";
        return;
      }
      await respond({ "form-name": "project-changes", "requested-changes": wanted, "change-round": `${3 - roundsLeft} of 2` });
      sentThisVisit = true;
      changes.elements["requested-changes"].value = "";
      note.textContent = `Thanks, we've got your changes. This used round ${3 - roundsLeft} of 2. If anything you asked for is new work, we'll send you a price before doing it. Otherwise we'll update your preview and email you when it's ready.`;
    } catch {
      note.textContent = "That didn't send. Please try again in a moment.";
    }
  });
  const fromLink = new URLSearchParams(location.hash.slice(1)).get("code");
  if (fromLink) {
    checkForm.elements["project-code"].value = fromLink;
    history.replaceState(null, "", location.pathname);
    openProject(fromLink);
  }
}

if (typeof HTMLDialogElement === "function") {
  const openPackage = (key) => {
    const pop = document.getElementById(`package-${key}`);
    if (pop && !pop.open) pop.showModal();
  };
  document.querySelectorAll(".package").forEach((card) => {
    if (!card.querySelector("[data-package-open]")) return;
    card.classList.add("package--opens");
    card.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      openPackage(card.id);
    });
  });
  document.querySelectorAll(".package-pop").forEach((pop) => {
    pop.addEventListener("click", (event) => {
      if (event.target === pop || event.target.closest("[data-package-close]")) pop.close();
    });
  });
  const wanted = location.hash.slice(1);
  if (["launch", "growth", "systems"].includes(wanted)) openPackage(wanted);
}

const valueTrack = document.querySelector("[data-value-track]");
if (valueTrack) {
  const prev = document.querySelector("[data-value-prev]");
  const next = document.querySelector("[data-value-next]");
  const count = document.querySelector("[data-value-count]");
  const cards = [...valueTrack.children];
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : valueTrack.clientWidth);
  const update = () => {
    const per = Math.max(1, Math.round(valueTrack.clientWidth / step()));
    const first = Math.round(valueTrack.scrollLeft / step());
    const last = Math.min(cards.length, first + per);
    count.textContent = per === 1 ? `${first + 1} of ${cards.length}` : `${first + 1}–${last} of ${cards.length}`;
    prev.disabled = valueTrack.scrollLeft <= 2;
    next.disabled = valueTrack.scrollLeft + valueTrack.clientWidth >= valueTrack.scrollWidth - 2;
  };
  const page = (dir) => {
    const per = Math.max(1, Math.round(valueTrack.clientWidth / step()));
    valueTrack.scrollBy({ left: dir * per * step() });
  };
  prev.addEventListener("click", () => { page(-1); vfmTrack?.("Prices: previous"); });
  next.addEventListener("click", () => { page(1); vfmTrack?.("Prices: next"); });
  valueTrack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); page(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); page(-1); }
  });
  valueTrack.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  addEventListener("resize", update);
  update();
}

const workTrack = document.querySelector("[data-work-track]");
if (workTrack) {
  const prev = document.querySelector("[data-work-prev]");
  const next = document.querySelector("[data-work-next]");
  const count = document.querySelector("[data-work-count]");
  const dotsBox = document.querySelector("[data-work-dots]");
  const cards = [...workTrack.children];
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  cards.forEach((card) => workTrack.append(card));
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : workTrack.clientWidth);
  const perView = () => Math.max(1, Math.round(workTrack.clientWidth / step()));
  const stops = () => Math.max(1, cards.length - perView() + 1);
  let dots = [];
  const buildDots = () => {
    if (dots.length === stops()) return;
    dotsBox.textContent = "";
    dots = Array.from({ length: stops() }, (_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "work__dot";
      dot.setAttribute("aria-label", `Show website ${i + 1}`);
      dot.addEventListener("click", () => workTrack.scrollTo({ left: i * step() }));
      dotsBox.append(dot);
      return dot;
    });
  };
  const update = () => {
    buildDots();
    const per = perView();
    const atEnd = workTrack.scrollLeft + workTrack.clientWidth >= workTrack.scrollWidth - 2;
    const first = atEnd ? stops() - 1 : Math.round(workTrack.scrollLeft / step());
    const last = Math.min(cards.length, first + per);
    count.textContent = per === 1 ? `${first + 1} of ${cards.length}` : `${first + 1}–${last} of ${cards.length}`;
    dots.forEach((dot, i) => dot.setAttribute("aria-current", i === first ? "true" : "false"));
    prev.disabled = workTrack.scrollLeft <= 2;
    next.disabled = atEnd;
  };
  const page = (dir) => workTrack.scrollBy({ left: dir * perView() * step() });
  prev.addEventListener("click", () => { page(-1); vfmTrack?.("Work: previous"); });
  next.addEventListener("click", () => { page(1); vfmTrack?.("Work: next"); });
  workTrack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); page(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); page(-1); }
  });
  workTrack.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  addEventListener("resize", update);
  update();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let held = false, seen = false, timer = 0;
    const advance = () => {
      if (held || !seen || document.hidden) return;
      const atEnd = workTrack.scrollLeft + workTrack.clientWidth >= workTrack.scrollWidth - 2;
      if (atEnd) workTrack.scrollTo({ left: 0 }); else workTrack.scrollBy({ left: step() });
    };
    const start = () => { clearInterval(timer); timer = setInterval(advance, 4000); };
    const hold = () => { held = true; };
    const release = () => { held = false; start(); };
    workTrack.addEventListener("pointerenter", hold);
    workTrack.addEventListener("pointerleave", release);
    workTrack.addEventListener("touchstart", hold, { passive: true });
    workTrack.addEventListener("touchend", () => setTimeout(release, 4000), { passive: true });
    workTrack.addEventListener("focusin", hold);
    workTrack.addEventListener("focusout", release);
    [prev, next].forEach((button) => button.addEventListener("click", start));
    new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; }, { threshold: 0.4 }).observe(workTrack);
    start();
  }
}

const demo = document.querySelector("[data-demo]");
if (demo) {
  const steps = [...demo.querySelectorAll("[data-step]")];
  const typing = demo.querySelector("[data-demo-typing]");
  const pick = demo.querySelector("[data-pick]");
  const msgs = demo.querySelector("[data-demo-msgs]");
  const show = (n) => steps.forEach((el) => el.classList.toggle("is-on", Number(el.dataset.step) <= n));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show(6); pick.classList.add("is-picked");
  } else {
    const plan = [[1, 900], [2, 1700, true], [3, 1500], [4, 1500, true], ["pick", 1200], [5, 800], [6, 1600, true], ["hold", 5000]];
    let i = 0, timer = 0, seen = false;
    const reset = () => { show(0); pick.classList.remove("is-picked"); typing.classList.remove("is-on"); };
    const tick = () => {
      if (!seen || document.hidden) { timer = setTimeout(tick, 600); return; }
      if (i >= plan.length) { i = 0; reset(); timer = setTimeout(tick, 900); return; }
      const [what, wait, bot] = plan[i];
      if (bot && !typing.classList.contains("is-on")) { typing.classList.add("is-on"); msgs.append(typing); timer = setTimeout(tick, 1100); return; }
      typing.classList.remove("is-on");
      if (what === "pick") pick.classList.add("is-picked"); else if (typeof what === "number") show(what);
      i++; timer = setTimeout(tick, wait);
    };
    new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; }, { threshold: 0.3 }).observe(demo);
    reset(); tick();
  }
}
