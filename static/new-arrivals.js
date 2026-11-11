const products = [
  { id: 1, name: "リネンシャツ", price: 850, category: "トップス", listedAt: "2026-09-17" },
  { id: 2, name: "ハンドメイドニットセーター", price: 5400, category: "トップス", listedAt: "2026-09-16" },
  { id: 3, name: "ヴィンテージデニムジャケット", price: 8900, category: "アウター", listedAt: "2026-09-15" },
  { id: 4, name: "プリーツスカート", price: 1100, category: "ボトムス", listedAt: "2026-09-14" },
  { id: 5, name: "キャンバストートバッグ", price: 700, category: "アクセサリー", listedAt: "2026-09-13" },
  { id: 6, name: "コットンワンピース", price: 3200, category: "トップス", listedAt: "2026-09-12" },
  { id: 7, name: "コーデュロイジャケット", price: 1500, category: "アウター", listedAt: "2026-09-11" },
  { id: 8, name: "ビーズネックレス", price: 400, category: "アクセサリー", listedAt: "2026-09-10" }
];

function formatDate(iso) {
  const date = new Date(iso + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()} 出品`;
}

function cardTemplate(product) {
  return `
    <article class="product-card">
      <a class="product-image" href="detail.html?id=${product.id}" aria-label="${product.name}の商品詳細">${product.category}</a>
      <div class="product-info">
        <a class="product-name" href="detail.html?id=${product.id}">${product.name}</a>
        <p class="product-meta">${formatDate(product.listedAt)}</p>
        <div class="product-footer">
          <span class="product-price">¥${product.price.toLocaleString()}</span>
          <a class="cart-link" href="cart.html">カートへ</a>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const list = document.getElementById("productList");
  const empty = document.getElementById("emptyState");
  const items = [...products].sort((a, b) => b.listedAt.localeCompare(a.listedAt));

  if (!items.length) {
    empty.hidden = false;
    list.innerHTML = "";
    return;
  }

  empty.hidden = true;
  list.innerHTML = items.map(cardTemplate).join("");
}

document.addEventListener("DOMContentLoaded", renderProducts);
