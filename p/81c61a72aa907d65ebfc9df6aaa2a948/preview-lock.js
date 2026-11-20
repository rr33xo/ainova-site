const bar = document.createElement("div");
bar.className = "vfm-preview-bar";
bar.textContent = "Your free homepage preview from VFM NOVA. The rest of your site is built once you continue.";
document.body.append(bar);
document.body.style.paddingBottom = "48px";
let toast;
const say = (text) => {
  toast?.remove();
  toast = document.createElement("div");
  toast.className = "vfm-preview-toast";
  toast.textContent = text;
  document.body.append(toast);
  setTimeout(() => toast?.remove(), 3500);
};
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  const target = href.split("#")[0].split("?")[0].replace("./", "");
  if (/^(https?:|mailto:|tel:)/.test(href) || target === "" || target === "index.html") return;
  event.preventDefault();
  say("This page is built once you continue. It's part of your full site.");
});
document.addEventListener("submit", (event) => { event.preventDefault(); say("Forms start working on your finished site."); });
document.addEventListener("contextmenu", (event) => { if (event.target.closest("img")) event.preventDefault(); });
