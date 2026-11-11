// About page only needs the header interactions from top-script.js —
// there's no product grid here, so that part is left out.

// ---- モバイル用のドロワーメニュー ----
function setupDrawer() {
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const openBtn = document.getElementById("menuToggle");
  const closeBtn = document.getElementById("drawerClose");

  const open = () => {
    drawer.classList.add("mobile-open");
    backdrop.classList.add("open");
  };
  const close = () => {
    drawer.classList.remove("mobile-open");
    backdrop.classList.remove("open");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
}

document.addEventListener("DOMContentLoaded", () => {
  setupDrawer();
});
