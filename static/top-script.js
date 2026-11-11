const products = window.reTailorProducts.map((product) => ({ ...product, category: product.categoryKey }));

// 服の種類ごとに文字で表示（アイコンは形が崩れるためNG）。
  const TEXT = {
  coat:    "アウター",
  trousers: "ボトムス",
  cardigan: "トップス",
  bag:      "バッグ",
  shirt:    "トップス",
  skirt:    "ボトムス",
  jacket:   "アウター",
  necklace: "アクセサリー",
};

// どの商品が「いいね」されているか、カートに入っているか、
// 今選ばれているカテゴリーは何か、を管理する状態（state）
const state = {
  liked: new Set(JSON.parse(localStorage.getItem("reTailorFavorites") || "[]")),
  cart: new Set(JSON.parse(localStorage.getItem("reTailorCart") || "[]")),
  activeCategory: "all",
};
const recentKey = "reTailorRecentlyViewed";
function saveRecentProduct(id) { const recent = JSON.parse(localStorage.getItem(recentKey) || "[]").filter((itemId) => itemId !== id); recent.unshift(id); localStorage.setItem(recentKey, JSON.stringify(recent.slice(0, 4))); }
function renderRecentProducts() { const ids = JSON.parse(localStorage.getItem(recentKey) || "[]"); const items = ids.map((id) => products.find((product) => product.id === id)).filter(Boolean); const grid = document.getElementById("recentProducts"); const empty = document.getElementById("recentEmpty"); if (!grid || !empty) return; empty.hidden = items.length > 0; grid.innerHTML = items.map((item) => `<a class="recent-card" href="detail.html?id=${item.id}"><span class="recent-image tint-${item.category}">${TEXT[item.icon] || item.category}</span><strong>${item.name}</strong><span>¥${item.price.toLocaleString()}</span></a>`).join(""); }

// ---- 2. 商品カードをグリッドに描画する ----
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const visible = products.filter(
    (p) => state.activeCategory === "all" || p.category === state.activeCategory
  );

  // カード全部のHTMLを一度にまとめて作る（1個ずつ追加するより速い）
  grid.innerHTML = visible.map(cardTemplate).join("");
}

function cardTemplate(product) {
  const isLiked = state.liked.has(product.id);
  const isAdded = state.cart.has(product.id);

  return `
    <article class="product-card">
      <a href="detail.html?id=${product.id}" class="product-image tint-${product.category}" aria-label="${product.name}の商品詳細">
            ${TEXT[product.icon]}
      </a>      <div class="product-info">
      <a class="product-name" href="detail.html?id=${product.id}">${product.name}</a>
        <a class="product-seller" href="seller.html?seller=${encodeURIComponent(product.seller)}">出品者：${product.seller}</a>
        <div class="product-footer">
          <span class="product-price">¥${product.price.toLocaleString()}</span>
          <div class="product-actions">
              <button class="icon-toggle ${isLiked ? "liked" : ""}" 
                      data-action="like" 
                      data-id="${product.id}">
                  いいね
              </button>

              <button class="icon-toggle ${isAdded ? "added" : ""}" 
                      data-action="cart" 
                      data-id="${product.id}">
                  カート
              </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ---- 3. カテゴリー絞り込みのピル（ボタン） ----
function setupCategoryFilter() {
  const row = document.getElementById("categoryRow");
  row.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-pill");
    if (!btn) return;

    // 選ばれているボタンの見た目を更新する
    row.querySelectorAll(".cat-pill").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");

    state.activeCategory = btn.dataset.cat;
    renderProducts();
  });
}

// ---- 4. 「いいね」・カート追加のクリック処理（イベント委譲） ----
// ボタン1つ1つにイベントをつけるのではなく、親のgridにまとめてつけている。
// なぜなら、フィルターが変わるたびにカードが作り直される（再描画される）から。
function setupProductActions() {
  const grid = document.getElementById("productGrid");
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".icon-toggle");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "like") {
      state.liked.has(id) ? state.liked.delete(id) : state.liked.add(id);
      localStorage.setItem("reTailorFavorites", JSON.stringify([...state.liked]));
    }
    if (action === "cart") {
      state.cart.has(id) ? state.cart.delete(id) : state.cart.add(id);
      localStorage.setItem("reTailorCart", JSON.stringify([...state.cart]));
      updateCartCount();
    }
    renderProducts();
  });
}
function setupRecentTracking() { document.getElementById("productGrid").addEventListener("click", (event) => { const link = event.target.closest('a[href^="detail.html?id="]'); if (!link) return; saveRecentProduct(Number(new URL(link.href).searchParams.get("id"))); }); }

function updateCartCount() {
  const el = document.getElementById("cartCount");
  el.textContent = state.cart.size;
  // クラスを一度外してからまた付けることで、CSSのポップアニメーションを毎回やり直させる
  el.classList.remove("pop");
  void el.offsetWidth; // 強制的に再描画（reflow）させて、アニメーションを最初からやり直す
  el.classList.add("pop");
}

// ---- 5. ハンドメイド商品のドロップダウンメニュー ----

// ---- 6. 男性・女性の切り替えピル ----
function setupGenderToggle() {
  const pills = document.querySelectorAll(".toggle-pill");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });
}

// ---- 7. モバイル用のドロワーメニュー（横からスライドして出てくるメニュー） ----
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

// ---- 9. DOMの準備ができたら、まとめて初期化する ----
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartCount();
  setupCategoryFilter();
  setupProductActions();
  renderRecentProducts();
  setupRecentTracking();
  setupGenderToggle();
  setupDrawer();
});
