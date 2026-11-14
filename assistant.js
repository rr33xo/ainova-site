(() => {
  const start = { label: "Start your project", href: "/book.html" };
  const packages = { label: "See packages", href: "/packages.html" };
  const templates = { label: "See templates", href: "/templates.html" };
  const schedule = { label: "Book a free call", href: "/book.html?schedule=1" };
  const calculator = { label: "Work out your price", href: "/packages.html#calculator" };
  const ticket = { label: "Submit a ticket", href: "/support.html" };
  const services = { label: "What we build", href: "/services.html" };
  const refunds = { label: "Refund policy", href: "/refunds.html" };
  const terms = { label: "Terms", href: "/terms.html" };
  const engine = { label: "See VFM Engine", href: "/engine.html" };
  const sample = (slug, label) => ({ label, href: `/samples/${slug}.html` });

  const SITE = { template: 997, custom: 1695 };
  const PAGE_PRICE = { 10: 300, 20: 800 };
  const EXTRAS = [
    { key: "booking", label: "online booking", price: 150, words: ["booking", "book", "appointment", "schedul", "reservation"] },
    { key: "assistant", label: "an AI assistant", price: 650, words: ["assistant", "chatbot", "bot", "ai"] },
    { key: "store", label: "an online store", price: 995, words: ["online store", "online shop", "ecommerce", "store", "sell"] },
    { key: "crm", label: "a customer list", price: 1000, words: ["crm", "customer list"] },
    { key: "automations", label: "reminders and follow-ups", price: 1500, words: ["automation", "reminder", "follow-up", "followup"] },
    { key: "starter", label: "Business Starter", price: 495, words: ["starter", "llc", "no business"] },
    { key: "logo", label: "a logo", price: 49, words: ["logo design", "new logo", "a logo"] },
    { key: "design-flyer", label: "a flyer design", price: 79, words: ["flyer design", "a flyer", "flyers"] },
    { key: "design-card", label: "a business card design", price: 49, words: ["business card", "business cards", "card design"] },
    { key: "domain", label: "a custom web address (plus the address cost)", price: 99, words: ["domain", "web address"] },
    { key: "search", label: "Search Engine Setup", price: 299, words: ["search engine setup", "search engines"] },
    { key: "folder", label: "a printed welcome folder", price: 99, words: ["folder"] },
  ];
  const money = (n) => `$${n.toLocaleString("en-US")}`;

  const topics = [
    { id: "free", phrases: ["free preview", "free homepage", "free trial", "try before", "owe nothing", "is it free", "for free", "see it first", "before i pay", "before paying", "pay first", "pay up front", "pay upfront", "up front"], words: ["free", "trial"], text: "Every website order starts with a free homepage preview, built for your business within 2 business days. You don't pay anything to see it. If you love it, you pay and we build the rest of your site, with two rounds of changes included. If it's not for you, you owe nothing.", links: [start, refunds] },
    { id: "price", words: ["price", "cost", "much", "pricing", "afford", "budget", "cheap", "cheapest", "lowest", "expensive", "fee", "charge", "rate"], phrases: ["how much"], text: "Packages start at $997 for Launch, $2,495 for Growth and $4,995 for Systems. Tell me what you need, such as \"custom site with booking\", and I'll estimate it.", links: [packages, calculator], chips: ["Help me choose", "Launch vs Growth", "Do you have a coupon?"] },
    { id: "launch", words: ["launch"], text: "Launch is from $997 and takes up to 5 business days. You get a template of your choice made yours, up to 5 pages, your logo, colors, words and photos, and your web address connected and secured.", links: [{ label: "Choose Launch", href: "/book.html?package=launch" }, packages] },
    { id: "growth", words: ["growth"], text: "Growth is from $2,495 and takes up to 7 business days. You get a custom-designed website with up to 5 pages, online booking and an AI assistant trained on your business. The assistant is coming soon: it's still in testing, and we add it once it passes our checks.", links: [{ label: "Choose Growth", href: "/book.html?package=growth" }, packages] },
    { id: "systems", words: ["systems", "system"], text: "Systems is from $4,995 and takes up to 10 business days. It's everything in Growth, plus one list of all your customers, automatic reminders and follow-ups, and connections to the apps you already use. It also includes a logo and custom web address if you want them, plus VFM Engine's first month, then $300 a month if you stay.", links: [{ label: "Choose Systems", href: "/book.html?package=systems" }, packages] },
    { id: "compare", phrases: ["launch vs", "vs growth", "which package", "best package", "compare package", "launch and growth", "growth and systems", "launch or growth", "growth or systems", "difference between launch", "diference between launch", "difference between package", "what's included", "whats included", "what is included", "what do i get"], words: ["compare", "versus"], text: "Launch gets you online properly on a budget. Growth adds a custom design, online booking and an AI assistant. Systems adds a customer list, automatic follow-ups and app connections. Want help picking?", links: [packages], chips: ["Help me choose"] },
    { id: "template", phrases: ["template and custom", "custom and template", "template or custom", "custom or template", "template vs", "custom vs"], words: ["template", "custom", "sample", "example", "portfolio", "style", "look"], text: "A template starts from a design we've already made and gets adapted to your business, from $997. Custom is designed from scratch around your brand, from $1,695. We have 30 sample sites across styles and budgets, from premium brands to local favorites. They use made-up businesses, so you can see the style.", links: [templates, start] },
    { id: "time", phrases: ["this week", "next week", "by friday", "tomorrow"], words: ["long", "fast", "soon", "delivery", "deliver", "rush", "quick", "when", "timeline", "turnaround", "deadline", "urgent"], text: "Launch takes up to 5 business days, Growth up to 7 and Systems up to 10. Need it sooner? Rush adds 25% and takes about half the time, Expedited adds 50% and takes about a third, and Emergency adds 100% and takes about a fifth, subject to availability.", links: [start] },
    { id: "call", phrases: ["call take", "long is the call", "long is a call", "are you open", "your hours", "free call"], words: ["call", "talk", "meet", "meeting", "schedule", "appointment", "hour", "open", "lunch", "available", "phone", "consultation"], text: "Free calls take 10 to 15 minutes, Monday to Friday, 9 am to 6 pm Pacific, closed noon to 1 pm. Pick any open time on the Schedule tab, then choose whether we call or email you. Once a time is taken, it's gone.", links: [schedule] },
    { id: "nocall", phrases: ["no call", "skip call", "without a call", "without call", "no interaction", "don't want to talk"], words: ["no-call", "nocall", "interaction"], text: "Yes, you can skip calls. Choose no-call delivery, answer the questions online, and approve your preview by email. You can also leave us a message and we'll reply in writing.", links: [start] },
    { id: "approve", phrases: ["see my site", "pay the rest", "don't like", "dont like"], words: ["approve", "approval", "preview", "revision", "change", "changes", "edit", "handoff"], text: "You review your work on a private preview before anything goes live, and two rounds of changes are included. Please reply within 5 business days to keep your project moving. Once you approve, you pay anything still due, and we put your site live and hand over what's yours.", links: [{ label: "Read the terms", href: "/terms.html" }, start] },
    { id: "checkproject", phrases: ["check project", "check my project", "see my project", "my code", "project code", "my preview", "view my site"], text: "If we've built something for you, open Check Project and enter your private code. You can see your site, ask for changes, and approve it when you're happy.", links: [{ label: "Check your project", href: "/check.html" }] },
    { id: "schedule", phrases: ["schedule a call", "book a call", "talk to someone", "make an appointment", "schedule an appointment"], words: ["appointment"], text: "You can pick a time that works for you. Calls take 10 to 15 minutes, Monday to Friday, 9 am to 6 pm Pacific.", links: [{ label: "Schedule a call", href: "/book.html?schedule=1" }] },
    { id: "pay", words: ["pay", "payment", "deposit", "stripe", "card", "apple", "installment", "bank", "invoice", "financing", "safe", "secure"], phrases: ["payment safe", "is it safe", "card safe", "card number"], text: "Websites start with a free homepage preview, so you pay only if you love it: the full price, or half for Systems with the rest when you approve. Design, socials and setup orders pay 20% to start or in full. You can pay by card, Apple Pay, Cash App Pay, Klarna and more through Stripe's secure checkout, and we never see your full card number. Anything still due is paid when you approve your finished work on the Check Project page.", links: [refunds] },
    { id: "refund", words: ["refund", "cancel", "money"], phrases: ["money back"], text: "Website orders start with a free homepage preview, so nothing is charged until you choose to continue. After that, your payment is fully refundable until we begin work on the rest of your site, then refundable for the part we haven't done. Finished and approved work isn't refundable. Monthly plans can be canceled any time, and past months aren't refunded.", links: [refunds] },
    { id: "code", words: ["code", "coupon", "discount", "flyer", "deal", "save", "promo", "sale"], text: "If you have a code, enter it on the project form. Our own codes take 30% off your setup, up to $750 off, and affiliate codes take 15% off. Through January 1, 2027, new customers can take 15% off with code HOLIDAY. Each code also comes off VFM Engine every month. You can use one code per project, and codes don't apply to care plans, web address setup or the printed folder.", links: [start] },
    { id: "care", words: ["care", "monthly", "maintain", "maintenance", "update", "subscription", "hosting", "host"], text: "Care plans keep everything running after launch. Basic is $49 a month for hosting, security and updates. Plus is $99 and adds small monthly changes. Pro is $199 and we also look after your assistant and tools. You can cancel any time.", links: [{ label: "Compare care plans", href: "/packages.html#care" }] },
    { id: "setup", words: ["discord", "telegram", "whatsapp", "slack", "instagram", "tiktok", "facebook", "linkedin", "youtube", "yelp", "social", "socials"], text: "We set up Discord, social profiles and business listings. A single setup is $149, Discord Pro is $299, the Social Bundle is $349 and the Full Launch Kit is $699. See the Socials & Setup page." },
    { id: "ai", words: ["assistant", "ai", "chatbot", "bot"], text: "An AI assistant is coming soon, for $650. It's still in testing. It will know your hours, services and prices, answer common questions, collect details and offer appointment times, and hand anything tricky over to you. AI can make mistakes, so you review how it's set up.", links: [services, calculator] },
    { id: "tools", phrases: ["booking system", "booking systems", "online booking", "take bookings"], words: ["automation", "tool", "crm", "reminder", "followup", "follow-up", "booking", "store", "shop", "ecommerce", "sell"], text: "Add-ons: online booking $150, AI assistant $650 (coming soon), online store $995, customer list $1,000, and reminders and follow-ups $1,500. You can start small and add them later.", links: [services, calculator] },
    { id: "affiliate", words: ["affiliate", "refer", "referral", "commission", "earn"], text: "Affiliates earn 20% of what a client pays for setup, plus 10% of their Care and VFM Engine payments for 12 months. Clients save 15% on setup and VFM Engine with the affiliate's code. That's about $169 on Launch, $424 on Growth and $849 on Systems, before monthly plans. Anyone can join for free and get a code right away. Approved earnings go out monthly. Earnings aren't guaranteed.", links: [{ label: "See the program", href: "/affiliates.html" }, { label: "Claim your earnings", href: "/affiliates.html#payout" }] },
    { id: "engine", phrases: ["vfm engine", "engine growth", "engine plan", "engine starter", "engine pro"], words: ["engine", "marketing", "seo", "traffic", "promote", "advertise", "ads", "posts", "rank", "ranking", "google"], text: "VFM Engine is our monthly growth service, with keywords, search pages, a Partner Directory listing, posts on VFM channels and a report. It's $400 a month, and discount codes apply. Add it to any package, or buy it alone if you have a website. We can't guarantee rankings, traffic or sales.", links: [engine] },
    { id: "design", phrases: ["flyer design", "business card", "card design", "design only"], words: ["flyer", "flyers", "cards"], text: "We design flyers for $79 and business cards for $49. It's design only, so you get print-ready files and printing isn't included. You can order them with or without a website.", links: [start] },
    { id: "logo", words: ["logo"], text: "A logo is $49 as an add-on, and it's included in Systems if you want one.", links: [calculator] },
    { id: "starter", phrases: ["business email", "no business", "don't have a business", "dont have a business", "business yet", "starting a business", "start a business", "new business"], words: ["idea", "startup", "llc", "register", "registered", "starter"], text: "No business yet? Business Starter is $495 on top of any package. It covers name ideas, a simple logo, help getting your web address, business email and profile setup, and a checklist. Filing and service fees are separate, and we don't give legal or tax advice.", links: [{ label: "See Business Starter", href: "/packages.html#starter" }] },
    { id: "domain", phrases: ["web address"], words: ["domain", "url", "namecheap", "godaddy", "dns"], text: "If you already have a web address, we connect it and secure it. If you don't, web address setup is $99: we buy it in your name and set up what it needs, and the web address cost is added at what we pay. That add-on and cost aren't refundable once it's purchased, and it stays yours.", links: [start] },
    { id: "redesign", phrases: ["already have a website", "existing website", "existing site", "current website", "current site", "fix my site", "fix my website", "improve my site", "improve my website", "update my site", "update my website", "new look"], words: ["redesign", "redo", "revamp", "rebuild", "replace", "outdated", "old", "fix", "improve"], text: "Yes, we can rebuild or refresh an existing site. Share your current website or Yelp link on the project form, and tell us what you have permission to reuse. Your web address can stay the same, and you still get a free homepage preview first.", links: [start] },
    { id: "photos", words: ["photo", "picture", "image", "yelp", "content", "words", "copy", "writing"], text: "Upload your logo and photos right on the project form, or share links to any website or Yelp page with photos you have permission to use, or tell us you have none. We write clear, plain-English words for you, and we use marked placeholders until your real photos are ready. We never invent reviews or prices.", links: [start] },
    { id: "folder", phrases: ["welcome pack", "welcome folder", "paperwork"], words: ["folder", "documents", "document", "mailed", "mail"], text: "Every project includes a welcome pack by email with your site guide, web address and renewal details, brand sheet and next steps. Prefer it by mail? For $99, shipping included, we'll send it in a printed, branded folder with your paid invoice. Passwords are never included, and we share your logins separately.", links: [calculator] },
    { id: "own", words: ["own", "ownership", "mine", "rights", "transfer"], text: "Once you've paid in full, the website content and design we create for you are yours. Your web address and business content stay yours. Outside software and services keep their own licenses.", links: [terms] },
    { id: "pages", words: ["page", "pages"], text: "Packages include up to 5 pages. Going up to 10 pages adds $300, and up to 20 pages adds $800. More than 20 is a custom quote.", links: [calculator] },
    { id: "mobile", phrases: ["on phone", "on my phone", "on a phone", "on cell"], words: ["mobile", "phone-friendly", "responsive", "iphone", "android", "tablet"], text: "Yes. The sites we build are made to work well on phones as well as computers.", links: [templates] },
    { id: "process", phrases: ["need a website", "want a website", "build a website", "build my website", "how does it work", "how it works", "what happens", "next step", "get started", "getting started"], words: ["process", "steps", "start"], text: "Here's how it works: pick your package and a template, send your details, and we build your homepage for free, usually within 2 business days. You get a private code: open the Menu, choose Check Project and enter it to see it. If you love it, you pay and we build the rest, with two rounds of changes included. You approve the finished site, and then we put it live.", links: [start] },
    { id: "tech", words: ["tech", "technical", "understand", "beginner", "hard", "confusing", "computer"], text: "You don't need any tech knowledge. We handle the setup and explain anything you need to decide in plain English.", links: [start] },
    { id: "where", words: ["where", "location", "local", "country", "worldwide", "area", "based"], text: "We're an online studio, so we work with businesses anywhere. Everything happens by phone and email, and your location doesn't change the price or the timeline.", links: [start] },
    { id: "who", phrases: ["real company", "who are you", "what is vfm nova", "what do you do", "what does vfm nova"], words: ["about", "company"], text: "VFM NOVA builds websites, AI assistants and everyday business tools for people who would rather run their business than learn tech.", links: [services] },
    { id: "bot", phrases: ["are you real", "are you a person", "are you a real person", "are you human", "are you a bot", "are you ai"], text: "I'm NOVA, an automated helper, not a person. I answer from our published information. For anything I can't settle, a real person can help.", links: [ticket, schedule] },
    { id: "support", phrases: ["not working", "doesn't work", "isn't working", "site is down", "existing customer", "need help with my"], words: ["ticket", "broken", "bug", "issue", "problem", "support", "error", "complaint", "down"], text: "Submit a ticket with the details and you'll get a ticket number right away. A person will follow up by the method you choose.", links: [ticket] },
    { id: "human", phrases: ["a person", "someone", "a human", "contact you", "reach you", "your email", "your phone"], words: ["human", "person", "contact", "speak", "representative"], text: "Happy to connect you. Book a free call, or submit a ticket and a person will reply.", links: [schedule, ticket] },
    { id: "legal", words: ["legal", "lawyer", "tax", "taxes", "license", "medical", "accountant"], text: "I can't give legal, tax or medical advice. Please check with a professional or your local government. We can help with the website and setup side.", links: [schedule] },
    { id: "searchsetup", phrases: ["search engine", "search engines", "on google", "find my site", "find my business", "submit my site", "not showing up"], text: "Search Engine Setup is $299 one time, with or without a new website. We check your site, set it up for Google, Bing, Yandex, Yahoo and DuckDuckGo, fix what's blocking them and send a report. Search engines decide what to show, so we can't guarantee rankings.", links: [{ label: "Get Search Engine Setup", href: "/book.html?site=engine&engine=0&extras=search" }] },
    { id: "customers", phrases: ["more customers", "more business", "more calls", "more leads", "more clients", "get customers", "get clients", "more sales"], text: "A clear website with online booking helps turn visitors into customers, which is what Growth is built for. VFM Engine can add monthly search pages and posts. We can't guarantee sales, but we'll tell you honestly what would help.", links: [packages, engine], chips: ["Help me choose"] },
    { id: "guarantee", phrases: ["guarantee", "guaranteed", "promise results"], text: "We can't promise specific rankings, traffic or sales. You do see your homepage for free before you pay anything, and our refund policy explains the rest.", links: [refunds] },
    { id: "fees", phrases: ["hidden fee", "hidden cost", "contract", "any fees", "extra fees"], text: "You see your price before you pay, and we agree on any extra cost with you first. Some outside services can have their own fees, and monthly plans can be canceled any time.", links: [terms, packages] },
    { id: "social", words: ["social", "instagram", "facebook", "tiktok"], text: "Business Starter helps set up your social profiles. VFM Engine publishes posts for you on VFM channels, clearly labeled as ads.", links: [engine, packages] },
    { id: "thanks", words: ["thanks", "thank", "thx", "great", "awesome", "perfect"], text: "You're welcome. Is there anything else you'd like to know?", links: [] },
    { id: "hello", words: ["hi", "hello", "hey", "yo", "sup"], text: "Hi! What are you looking to build? I can compare packages, estimate a price or help you choose.", links: [], chips: ["Help me choose", "How much does it cost?"] },
  ];

  const industries = [
    { words: ["hotel", "inn", "resort", "bnb", "lodge"], name: "hotels and stays", demo: sample("larkspur", "See the boutique hotel sample"), rec: "Growth is a good fit for booking and an assistant that answers guest questions." },
    { words: ["jewelry", "jeweler", "watches", "luxury"], name: "luxury brands", demo: sample("aurelle", "See the fine jewelry sample"), rec: "Growth with an online store is a good fit for a premium brand." },
    { words: ["medspa", "botox", "aesthetics", "wellness", "massage"], name: "med spas and wellness", demo: sample("solace-house", "See the med spa sample"), rec: "Growth is a good fit, since clients expect to book online." },
    { words: ["architect", "architecture", "interior", "designer"], name: "design firms", demo: sample("vane-oak", "See the architecture sample"), rec: "Launch shows off your work well, and Growth adds a custom design." },
    { words: ["photographer", "photography", "videographer", "artist"], name: "photographers and creatives", demo: sample("hollis-reed", "See the photography sample"), rec: "Launch works well for a portfolio, and you can add booking later." },
    { words: ["nonprofit", "charity", "church", "community"], name: "nonprofits and community groups", demo: sample("maple-commons", "See the community sample"), rec: "Launch is a good place to start, and you can add more later." },
    { words: ["venue", "wedding", "event", "events"], name: "event venues", demo: sample("copper-loft", "See the event venue sample"), rec: "Growth is a good fit for tour requests and booking." },
    { words: ["cleaner", "cleaners", "maid", "janitorial", "housekeeping"], name: "cleaning services", demo: sample("tidy-wren", "See the cleaning sample"), rec: "Launch works well to start, and Growth adds online booking." },
    { words: ["handyman", "repairs"], name: "handyman services", demo: sample("odd-job", "See the handyman sample"), rec: "Launch works well to start, and you can add booking later." },
    { words: ["taco", "truck", "vendor"], name: "food trucks and vendors", demo: sample("lucky-lime", "See the food truck sample"), rec: "Launch is a good fit for your menu, schedule and contact details." },
    { words: ["farm", "farmers", "market", "stall"], name: "market stalls and farms", demo: sample("little-acre", "See the farm stand sample"), rec: "Launch works well, and an online store can be added when you want one." },
    { words: ["tutor", "lessons", "teacher", "music", "instructor"], name: "teachers and lessons", demo: sample("low-note", "See the lessons sample"), rec: "Growth is a good fit if you want students to book online." },
    { words: ["consulting", "advisor", "advisory"], name: "consultants", demo: sample("quill-compass", "See the consulting sample"), rec: "Launch works well to start, and Growth adds booking and an assistant." },
    { words: ["landscaping", "landscaper", "lawn", "garden", "gardener", "yard", "tree"], name: "outdoor services", demo: sample("greenway", "See the landscaping sample"), rec: "Launch works well to start, and online booking is $150 if you want people to request quotes." },
    { words: ["mechanic", "auto", "garage", "tire", "tires", "detailing", "towing"], name: "auto shops", demo: sample("torque-lane", "See the auto repair sample"), rec: "Growth is a good fit for online booking and answering common questions." },
    { words: ["lawyer", "attorney", "law", "legal", "accountant", "accounting", "bookkeeper", "consultant", "insurance", "financial"], name: "professional services", demo: sample("alder-finch", "See the law firm sample"), rec: "Growth suits most offices, with online booking and an AI assistant for common questions." },
    { words: ["boutique", "clothing", "fashion", "shop", "store", "retail", "jewelry", "gift"], name: "shops", demo: sample("thread-fable", "See the boutique sample"), rec: "Launch plus an online store is a good fit if you want to sell online." },
    { words: ["pet", "pets", "dog", "dogs", "groomer", "grooming", "vet", "veterinarian", "kennel"], name: "pet care", demo: sample("good-boy", "See the pet grooming sample"), rec: "Growth suits most pet businesses, since owners can book online any time." },
    { words: ["bakery", "bakeries", "baker", "coffee", "cafe", "pastry", "dessert"], name: "bakeries and cafes", demo: sample("morning-loaf", "See the bakery sample"), rec: "Launch covers your menu, hours and location, and you can add ordering with an online store." },
    { words: ["roof", "roofing", "roofer", "contractor", "plumber", "plumbing", "electrician", "hvac", "construction", "cleaning"], name: "home services", demo: sample("ridgeline", "See the roofing sample"), rec: "Launch works well to start, and online booking is $150 if you want people to request visits." },
    { words: ["dentist", "dental", "doctor", "clinic", "chiropractor", "therapist", "medical"], name: "health offices", demo: sample("bright-street", "See the dental sample"), rec: "Growth is a good fit because it includes online booking and an AI assistant for common questions." },
    { words: ["restaurant", "cafe", "bakery", "bar", "food", "catering", "truck", "coffee"], name: "food businesses", demo: sample("salt-ember", "See the restaurant sample"), rec: "Launch covers your menu, hours and location, and you can add booking for reservations." },
    { words: ["salon", "barber", "barbershop", "hair", "nails", "spa", "lash", "beauty", "tattoo"], name: "salons and studios", demo: sample("fern", "See the salon sample"), rec: "Growth suits most studios, since people can book online day or night." },
    { words: ["realtor", "realty", "broker", "property", "estate"], name: "real estate", demo: sample("lantern", "See the real estate sample"), rec: "Growth suits most agents, and Systems adds a customer list with automatic follow-ups." },
    { words: ["gym", "fitness", "trainer", "yoga", "crossfit", "pilates", "coach"], name: "fitness", demo: sample("iron-hour", "See the gym sample"), rec: "Growth is a good fit for class bookings and answering common questions." },
  ];

  const stem = (word) => word.replace(/'s$/, "").replace(/(ing|ies|es|ed|s)$/, "") || word;
  const close = (a, b) => {
    if (Math.abs(a.length - b.length) > 1 || a.length < 6) return false;
    let i = 0;
    let j = 0;
    let edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i += 1; j += 1; continue; }
      edits += 1;
      if (edits > 1) return false;
      if (a.length > b.length) i += 1;
      else if (b.length > a.length) j += 1;
      else { i += 1; j += 1; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  };
  const hasWord = (tokens, word) => {
    const target = stem(word);
    return tokens.some((token) => token === word || stem(token) === target || close(token, word));
  };
  const score = (topic, lower, tokens) =>
    (topic.phrases ?? []).filter((phrase) => lower.includes(phrase)).length * 4 +
    (topic.words ?? []).filter((word) => hasWord(tokens, word)).length * 2;

  const estimate = (lower, tokens) => {
    const asksPrice = ["much", "cost", "price", "estimate", "quote", "total"].some((word) => hasWord(tokens, word));
    const mentions = (word) => (word.includes(" ") ? lower.includes(word) : new RegExp(`\\b${word}`).test(lower));
    const extras = EXTRAS.filter(({ words }) => words.some(mentions));
    const custom = /\bcustom\b/.test(lower);
    const template = /\btemplates?\b/.test(lower);
    const pageMatch = lower.match(/(\d+)\s*pages?/);
    if (/difference|\bvs\b|versus/.test(lower) || (custom && template)) return null;
    if (!asksPrice && !(custom || template)) return null;
    const wantsSite = custom || template || pageMatch || /\b(website|site)\b/.test(lower);
    if (!wantsSite) {
      if (!extras.length) return null;
      return { text: `${extras.map((extra) => `${extra.label[0].toUpperCase()}${extra.label.slice(1)} is ${money(extra.price)}`).join(". ")}. ${extras.length > 1 ? "These add" : "It adds"} to any website package.`, links: [calculator, start] };
    }
    if (!(extras.length || custom || template || pageMatch)) return null;
    const site = custom ? "custom" : "template";
    let total = SITE[site];
    const parts = [`${custom ? "custom design" : "template website"} ${money(SITE[site])}`];
    const pageCount = pageMatch ? Number(pageMatch[1]) : 5;
    if (pageCount > 20) return { text: "More than 20 pages is a custom quote. Tell us about it on the project form or a free call, and we'll send a written price.", links: [start, schedule] };
    if (pageCount > 5) {
      const tier = pageCount > 10 ? 20 : 10;
      total += PAGE_PRICE[tier];
      parts.push(`up to ${tier} pages ${money(PAGE_PRICE[tier])}`);
    }
    for (const extra of extras) {
      total += extra.price;
      parts.push(`${extra.label} ${money(extra.price)}`);
    }
    return {
      text: `Here's a starting estimate: ${parts.join(", ")}. That's about ${money(total)}. Your written quote is the final price.`,
      links: [start, calculator],
    };
  };

  let guide = null;
  const guideSteps = {
    business: { text: "Happy to help. Do you already have a business?", options: ["Yes, I have a business", "No, just an idea"] },
    goal: { text: "What matters most right now?", options: ["Get online", "Get more bookings", "Save time on busywork", "Grow my traffic"] },
  };
  const recommend = ({ idea, goal }) => {
    const add = idea ? " Since you're starting from an idea, add Business Starter for $495." : "";
    if (goal === "Grow my traffic") return { text: `If you already have a site, VFM Engine is a good fit at $400 a month, with no new website needed. If you don't, start with Launch and add the Engine.${add}`, links: [engine, packages] };
    if (goal === "Get more bookings") return { text: `I'd look at Growth, from $2,495. It includes a custom site, online booking and an AI assistant (coming soon). On a tighter budget, Launch plus booking is about $1,145.${add}`, links: [{ label: "Choose Growth", href: "/book.html?package=growth" }, calculator] };
    if (goal === "Save time on busywork") return { text: `I'd look at Systems, from $4,995. It adds one customer list, automatic reminders and follow-ups, and connections to your apps.${add}`, links: [{ label: "Choose Systems", href: "/book.html?package=systems" }, packages] };
    return { text: `I'd start with Launch, from $997. You get a professional site in up to 5 business days, and you can add more later.${add}`, links: [{ label: "Choose Launch", href: "/book.html?package=launch" }, templates] };
  };

  let lastFallbacks = 0;
  const reply = (question) => {
    const lower = question.toLowerCase().replace(/[’]/g, "'");
    const tokens = lower.match(/[a-z0-9'-]+/g) ?? [];
    if (/help me (choose|pick|decide)|which (one|package) (is|should)|what (do|should) i (need|get|choose)|recommend/.test(lower)) {
      guide = { step: "business" };
      return { text: guideSteps.business.text, chips: guideSteps.business.options };
    }
    if (/^(yes|yeah|yep|sure|ok|okay|please)\b/.test(lower)) {
      guide = { step: "business" };
      return { text: guideSteps.business.text, chips: guideSteps.business.options };
    }
    if (/^(no|nope|not now|no thanks)\b/.test(lower)) return { text: "No problem. Ask me anything else whenever you're ready.", links: [] };
    const priced = estimate(lower, tokens);
    if (priced) return priced;
    const industry = industries.find(({ words }) => words.some((word) => tokens.includes(word) || tokens.includes(`${word}s`)));
    const ranked = topics
      .map((topic) => ({ topic, points: score(topic, lower, tokens) }))
      .filter(({ points }) => points > 0)
      .sort((a, b) => b.points - a.points);
    if (industry && (!ranked.length || ranked[0].points < 4)) {
      return { text: `We can build for ${industry.name}. ${industry.rec} Want a closer look?`, links: [industry.demo, start], chips: ["How much does it cost?", "How long does it take?"] };
    }
    if (!ranked.length && /\b(i have a|i own a|i run a|i'?m a|my business|nonprofit)\b/.test(lower)) {
      return { text: "We can build for most small businesses and nonprofits. Start with a template, or tell us about it and we'll suggest what fits.", links: [templates, start], chips: ["Help me choose", "How much does it cost?"] };
    }
    if (!ranked.length) {
      lastFallbacks += 1;
      return {
        text: lastFallbacks > 1
          ? "That one needs a person. Submit a ticket or book a free call, and we'll give you a real answer."
          : "I'm not sure about that one. I can help with prices, timing, templates, web addresses, payments, refunds, calls and support. Try asking another way, or send it to a person.",
        links: [ticket, schedule],
        chips: ["Help me choose", "How much does it cost?", "How does it work?"],
      };
    }
    lastFallbacks = 0;
    if (ranked.length > 1 && ranked[0].topic.id === "price" && !["thanks", "hello"].includes(ranked[1].topic.id)) ranked.push(ranked.shift());
    const [first, second] = ranked;
    const both = second && /\band\b|&|,|\balso\b/.test(lower) && second.points >= 2 && !["thanks", "hello"].includes(second.topic.id);
    if (both) {
      return { text: `${first.topic.text} ${second.topic.text}`, links: [...first.topic.links, ...second.topic.links].slice(0, 3), chips: first.topic.chips };
    }
    return first.topic;
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const launcher = el("button", "ask-launcher", "Ask NOVA");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "ask-panel");

  const panel = el("section", "ask-panel");
  panel.id = "ask-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Ask NOVA automated helper");

  const head = el("header", "ask-panel__head");
  const titles = el("div");
  titles.append(el("h2", "", "Ask NOVA"), el("p", "", "Automated helper"));
  const closeButton = el("button", "ask-panel__close", "Close");
  closeButton.type = "button";
  head.append(titles, closeButton);

  const log = el("div", "ask-panel__log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");

  const chips = el("div", "ask-panel__chips");
  const defaultChips = ["Help me choose", "How much does it cost?", "How long does it take?", "Submit a ticket"];
  const showChips = (list) => {
    chips.replaceChildren(...list.map((question) => {
      const chip = el("button", "", question);
      chip.type = "button";
      chip.addEventListener("click", () => ask(question));
      return chip;
    }));
  };

  const form = el("form", "ask-panel__form");
  const input = el("input");
  input.setAttribute("aria-label", "Your question");
  input.placeholder = "Ask a question";
  input.autocomplete = "off";
  input.maxLength = 200;
  const send = el("button", "", "Send");
  send.type = "submit";
  form.append(input, send);

  const say = (who, text, links = []) => {
    const bubble = el("div", `ask-msg ask-msg--${who}`);
    bubble.append(el("p", "", text));
    if (links.length) {
      const row = el("p", "ask-msg__links");
      for (const { label, href } of links) {
        const link = el("a", "", label);
        link.href = href;
        row.append(link);
      }
      bubble.append(row);
    }
    log.append(bubble);
    log.scrollTop = log.scrollHeight;
  };

  function ask(question) {
    const text = question.trim();
    if (!text) return;
    say("them", text);
    if (guide) {
      if (guide.step === "business" && guideSteps.business.options.includes(text)) {
        guide = { step: "goal", idea: text.startsWith("No") };
        say("nova", guideSteps.goal.text);
        showChips(guideSteps.goal.options);
        return;
      }
      if (guide.step === "goal" && guideSteps.goal.options.includes(text)) {
        const answer = recommend({ idea: guide.idea, goal: text });
        guide = null;
        say("nova", answer.text, answer.links);
        showChips(["How much does it cost?", "How long does it take?", "Do you have a coupon?"]);
        return;
      }
      guide = null;
    }
    const answer = reply(text);
    say("nova", answer.text, answer.links);
    showChips(answer.chips ?? defaultChips);
  }

  const toggle = (open) => {
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else launcher.focus();
  };

  say("nova", "Hi, I'm NOVA, an automated helper. I can compare packages, estimate your price, explain how it works, or send you to a person.");
  showChips(defaultChips);
  launcher.addEventListener("click", () => toggle(true));
  closeButton.addEventListener("click", () => toggle(false));
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") toggle(false);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
    input.value = "";
  });

  panel.append(head, log, chips, form);
  document.body.append(launcher, panel);
})();
