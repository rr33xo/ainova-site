// Dropdown menu: closes after a choice, with Escape (focus returns to the Menu button), or with a tap outside it.
const menu = document.querySelector(".menu");
if (menu) {
  const button = menu.querySelector("summary");
  menu.addEventListener("click", (event) => { if (event.target.closest("a")) menu.open = false; });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      button.focus();
    }
  });
  document.addEventListener("click", (event) => { if (!menu.contains(event.target)) menu.open = false; });
}
