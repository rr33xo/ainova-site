// Mobile menu, and a booking picker that shows how online booking works.
const toggle = document.querySelector("[data-menu]");
const nav = document.querySelector("[data-nav]");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
}));

const book = document.querySelector("[data-book]");
if (book) {
  const pick = { service: "", day: "", time: "" };
  const summary = book.querySelector("[data-book-summary]");
  const done = book.querySelector("[data-book-done]");
  const go = book.querySelector("[data-book-go]");
  const days = book.querySelector("[data-book-days]");
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const open = book.dataset.open.split(",").map(Number);
  let added = 0;
  for (let i = 1; added < 5 && i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (!open.includes(d.getDay())) continue;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.pick = "day";
    b.dataset.value = `${names[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
    b.innerHTML = `<b>${names[d.getDay()]}</b> ${d.getMonth() + 1}/${d.getDate()}`;
    days.append(b);
    added++;
  }
  const update = () => {
    const ready = pick.service && pick.day && pick.time;
    go.disabled = !ready;
    summary.textContent = ready ? `${pick.service}, ${pick.day} at ${pick.time}` : "Pick a service, a day and a time.";
  };
  book.addEventListener("click", (event) => {
    const b = event.target.closest("[data-pick]");
    if (!b) return;
    book.querySelectorAll(`[data-pick="${b.dataset.pick}"]`).forEach((x) => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    pick[b.dataset.pick] = b.dataset.value;
    done.hidden = true;
    update();
  });
  go.addEventListener("click", () => {
    done.hidden = false;
    done.textContent = `You picked ${pick.service}, ${pick.day} at ${pick.time}. On a real site, this books the slot and sends a confirmation and a reminder. This is a concept design by VFM NOVA.`;
  });
  update();
}
