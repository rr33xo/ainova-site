(() => {
  const groups = [...document.querySelectorAll("[data-browse]")];
  if (!groups.length) return;
  const cards = [...document.querySelectorAll(".tpl[data-style]")];
  const empty = document.querySelector("[data-no-designs]");
  const count = document.querySelector("[data-browse-count]");
  const params = new URLSearchParams(location.search);
  const chosen = {};
  const refresh = () => {
    let shown = 0;
    cards.forEach((card) => {
      const fits = Object.entries(chosen).every(([key, value]) => value === "all" || (card.dataset[key] ?? "").split(" ").includes(value));
      card.hidden = !fits;
      if (fits) shown += 1;
    });
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = `Showing ${shown} of ${cards.length} designs`;
  };
  groups.forEach((group) => {
    const key = group.dataset.browse;
    const buttons = [...group.querySelectorAll("button")];
    const pick = (button) => {
      buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      chosen[key] = button.dataset.filter;
    };
    pick(buttons.find((button) => button.dataset.filter === params.get(key)) ?? buttons[0]);
    buttons.forEach((button) => button.addEventListener("click", () => { pick(button); refresh(); }));
  });
  refresh();
})();

(() => {
  const field = document.querySelector('select[name="design-layout"]');
  if (!field) return;
  const params = new URLSearchParams(location.search);
  [["design-layout", "layout"], ["design-images", "images"]].forEach(([name, param]) => {
    const select = document.querySelector(`select[name="${name}"]`);
    const option = [...(select?.options ?? [])].find((item) => item.dataset.key === params.get(param));
    if (option) option.selected = true;
  });
  const order = document.querySelector('input[name="design-order"]');
  if (order && params.get("order")) order.value = params.get("order").split(",").join(", ");
})();

(() => {
  const source = document.getElementById("design-options");
  if (!source) return;
  const { design, defaults, slug, sections: startSections } = JSON.parse(source.textContent);
  const body = document.body;
  const params = new URLSearchParams(location.search);
  const sectionKeys = design.sections.map((item) => item.key);

  const startingSections = () => (startSections ? [...startSections] : [...sectionKeys]);
  const pageRoot = document.querySelector("[data-page]");
  const pages = JSON.parse(document.getElementById("design-pages")?.textContent ?? "{}");
  pages[defaults.layout] = pageRoot.innerHTML;
  const fromLink = (name) => (known(name, params.get(name)) ? params.get(name) : null);

  const known = (name, value) => design[name].some((item) => item.key === value);
  const startLayout = fromLink("layout") ?? defaults.layout;
  const family = (key) => design.layout.find((item) => item.key === key);
  const state = {
    layout: startLayout,
    images: known("images", params.get("images")) ? params.get("images") : "natural",
    order: params.has("order") ? params.get("order").split(",").filter((key) => sectionKeys.includes(key)) : null,
    palette: known("palette", params.get("palette")) ? params.get("palette") : "original",
    font: known("font", params.get("font")) ? params.get("font") : defaults.font,
    hero: fromLink("hero") ?? (startLayout === defaults.layout ? defaults.hero : family(startLayout).hero),
    services: fromLink("services") ?? (startLayout === defaults.layout ? defaults.services : family(startLayout).services),
    corners: known("corners", params.get("corners")) ? params.get("corners") : defaults.corners,
    spacing: known("spacing", params.get("spacing")) ? params.get("spacing") : defaults.spacing,
    sections: params.has("sections") ? params.get("sections").split(",").filter((key) => sectionKeys.includes(key)) : startingSections(),
  };

  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  };

  const startLinks = document.querySelectorAll("[data-start]");
  const chips = new Map();
  const checks = new Map();
  const presetButtons = new Map();
  const looks = new Map();
  const startLink = el("a", { className: "c-start", textContent: "Start with this design" });

  const choices = () => {
    const link = new URLSearchParams({ template: slug });
    if (state.palette !== "original") link.set("palette", state.palette);
    ["layout", "font", "hero", "services", "corners", "spacing", "images"].forEach((name) => link.set(name, state[name]));
    if (state.order) link.set("order", state.order.join(","));
    link.set("sections", state.sections.join(","));
    return link;
  };

  const orderNow = () => state.order ?? [...pageRoot.querySelectorAll("main > [data-section]")].map((section) => section.dataset.section);
  const placeSections = () => {
    if (!state.order) return;
    const main = pageRoot.querySelector("main");
    const placed = state.order.map((key) => main.querySelector(`:scope > [data-section="${key}"]`)).filter(Boolean);
    placed.forEach((section) => main.append(section));
    const call = main.querySelector(":scope > .d-cta");
    if (call && placed[2]) main.insertBefore(call, placed[2]);
  };
  let drawRows = () => {};
  let showing = defaults.layout;
  const apply = () => {
    if (state.layout !== showing) {
      pageRoot.innerHTML = pages[state.layout];
      showing = state.layout;
    }
    if (state.palette === "original") delete body.dataset.palette;
    else body.dataset.palette = state.palette;
    ["layout", "font", "hero", "services", "corners", "spacing", "images"].forEach((name) => { body.dataset[name] = state[name]; });
    placeSections();
    document.querySelectorAll("[data-section]").forEach((section) => { section.hidden = !state.sections.includes(section.dataset.section); });
    document.querySelectorAll("[data-for]").forEach((link) => { link.hidden = !state.sections.includes(link.dataset.for); });
    chips.forEach((button, id) => {
      const [name, key] = id.split(":");
      button.setAttribute("aria-pressed", String(state[name] === key));
    });
    checks.forEach((box, key) => { box.checked = state.sections.includes(key); });
    presetButtons.forEach((button, key) => {
      const wanted = design.presets.find((item) => item.key === key).sections;
      const same = wanted.length === state.sections.length && wanted.every((section) => state.sections.includes(section));
      button.setAttribute("aria-pressed", String(same));
    });
    looks.forEach((button, key) => {
      const { label, key: own, ...wanted } = design.look.find((item) => item.key === key);
      button.setAttribute("aria-pressed", String(Object.entries(wanted).every(([name, value]) => state[name] === value)));
    });
    drawRows();
    const href = `/book.html?${choices()}`;
    startLink.href = href;
    startLinks.forEach((link) => { link.href = href; });
    const here = new URLSearchParams(choices());
    here.delete("template");
    history.replaceState(null, "", `${location.pathname}?${here}${location.hash}`);
  };

  const chipGroup = (title, name) => el("fieldset", { className: "c-group" },
    el("legend", { textContent: title }),
    el("div", { className: "c-chips" }, ...design[name].map((item) => {
      const button = el("button", { type: "button", className: "c-chip" });
      if (name === "palette") {
        const swatch = el("span", { className: `c-swatch${item.swatch.length ? "" : " c-swatch--theme"}` });
        item.swatch.forEach((color) => {
          const part = document.createElement("i");
          part.style.background = color;
          swatch.append(part);
        });
        button.append(swatch);
      }
      button.append(item.label);
      button.addEventListener("click", () => {
        state[name] = item.key;
        if (name === "layout") Object.assign(state, { hero: item.hero, services: item.services, order: null });
        apply();
      });
      chips.set(`${name}:${item.key}`, button);
      return button;
    })));

  const presetGroup = el("fieldset", { className: "c-group" },
    el("legend", { textContent: "How much should it show?" }),
    el("div", { className: "c-chips" }, ...design.presets.map((item) => {
      const button = el("button", { type: "button", className: "c-chip", textContent: item.label });
      button.addEventListener("click", () => { state.sections = [...item.sections]; apply(); });
      presetButtons.set(item.key, button);
      return button;
    })));

  const lookGroup = el("fieldset", { className: "c-group" },
    el("legend", { textContent: "Style" }),
    el("div", { className: "c-chips" }, ...design.look.map((item) => {
      const button = el("button", { type: "button", className: "c-chip", textContent: item.label });
      button.addEventListener("click", () => {
        const { label, key, ...settings } = item;
        Object.assign(state, { palette: "original" }, settings);
        apply();
      });
      looks.set(item.key, button);
      return button;
    })));

  const rows = el("div", { className: "c-rows" });
  const move = (key, step) => {
    const order = orderNow();
    const from = order.indexOf(key);
    const to = from + step;
    if (from < 0 || to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    state.order = order;
    apply();
  };
  const moveButton = (item, step, word, mark) => {
    const button = el("button", { type: "button", className: "c-move", textContent: mark });
    button.setAttribute("aria-label", `Move ${item.label} ${word}`);
    button.dataset.key = item.key;
    button.dataset.step = step;
    button.addEventListener("click", () => {
      move(item.key, step);
      rows.querySelector(`.c-move[data-key="${item.key}"][data-step="${step}"]`)?.focus({ preventScroll: true });
    });
    return button;
  };
  const rowFor = new Map(design.sections.map((item) => {
    const box = el("input", { type: "checkbox" });
    box.addEventListener("change", () => {
      state.sections = sectionKeys.filter((key) => (key === item.key ? box.checked : state.sections.includes(key)));
      apply();
    });
    checks.set(item.key, box);
    const row = el("div", { className: "c-row" }, el("label", { className: "c-check" }, box, item.label), moveButton(item, -1, "up", "\u2191"), moveButton(item, 1, "down", "\u2193"));
    return [item.key, row];
  }));
  drawRows = () => { rows.replaceChildren(...orderNow().map((key) => rowFor.get(key)).filter(Boolean)); };
  const sectionGroup = el("fieldset", { className: "c-group" }, el("legend", { textContent: "Sections: tick to show, arrows to reorder" }), rows);

  const paletteGroup = chipGroup("Colors", "palette");
  const fontGroup = chipGroup("Font pairing", "font");
  const simpleOnly = [lookGroup, presetGroup];
  const detailOnly = [chipGroup("Page layout", "layout"), chipGroup("Top of the page", "hero"), chipGroup("How services are shown", "services"), chipGroup("Button and corner shape", "corners"), chipGroup("Spacing", "spacing"), chipGroup("Photo look", "images"), sectionGroup];
  const simpleTab = el("button", { type: "button", className: "c-mode", textContent: "Keep it simple" });
  const detailTab = el("button", { type: "button", className: "c-mode", textContent: "Choose every detail" });
  const setMode = (detail) => {
    simpleTab.setAttribute("aria-pressed", String(!detail));
    detailTab.setAttribute("aria-pressed", String(detail));
    simpleOnly.forEach((group) => { group.hidden = detail; });
    detailOnly.forEach((group) => { group.hidden = !detail; });
  };
  simpleTab.addEventListener("click", () => setMode(false));
  detailTab.addEventListener("click", () => setMode(true));
  const [layoutGroup, ...otherDetail] = detailOnly;

  const openButton = el("button", { type: "button", className: "c-open", textContent: "Customize this design" });
  const closeButton = el("button", { type: "button", className: "c-close", textContent: "Close" });
  const resetButton = el("button", { type: "button", className: "c-reset", textContent: "Reset to the original" });
  const panel = el("aside", { className: "c-panel", hidden: true },
    el("div", { className: "c-head" }, el("b", { textContent: "Customize this design" }), closeButton),
    el("div", { className: "c-modes" }, simpleTab, detailTab),
    el("div", { className: "c-body" },
      lookGroup,
      layoutGroup,
      paletteGroup,
      fontGroup,
      presetGroup,
      ...otherDetail),
    el("div", { className: "c-foot" }, startLink, resetButton, el("p", { className: "c-note", textContent: "All included with every template. Nothing is charged here." })));
  panel.setAttribute("aria-label", "Customize this design");

  const setOpen = (open) => {
    panel.hidden = !open;
    openButton.hidden = open;
    (open ? closeButton : openButton).focus({ preventScroll: true });
  };
  openButton.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !panel.hidden) setOpen(false); });
  resetButton.addEventListener("click", () => {
    Object.assign(state, defaults, { palette: "original", images: "natural", order: null, sections: startingSections() });
    apply();
  });

  document.addEventListener("click", (event) => {
    const pick = event.target.closest("[data-pick]");
    if (!pick) return;
    document.querySelectorAll(`[data-pick="${pick.dataset.pick}"]`).forEach((item) => item.setAttribute("aria-pressed", String(item === pick)));
  });

  const back = document.querySelector("[data-back]");
  let cameFrom = "";
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin) cameFrom = document.referrer;
  } catch {
    cameFrom = "";
  }
  back?.addEventListener("click", (event) => {
    event.preventDefault();
    if (history.length <= 1) window.close();
    setTimeout(() => location.assign(cameFrom || "/templates.html"), 150);
  });

  setMode(false);
  body.append(openButton, panel);
  const phone = window.matchMedia("(max-width: 860px)");
  const placeOpenButton = () => {
    const links = document.querySelector(".d-banner__links");
    if (phone.matches && links) {
      links.append(openButton);
      openButton.textContent = "Customize";
    } else {
      body.insertBefore(openButton, panel);
      openButton.textContent = "Customize this design";
    }
  };
  placeOpenButton();
  phone.addEventListener("change", placeOpenButton);
  apply();
})();
