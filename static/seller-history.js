const sampleHistory = [
  { id: "sale-1", name: "ヴィンテージデニムジャケット", category: "アウター", price: 8900, soldAt: "2026/09/18", buyer: "mika_style", rating: 5, review: "丁寧な梱包で、商品の状態も説明どおりでした。大切に着ます。" },
  { id: "sale-2", name: "ハンドメイドニットセーター", category: "トップス", price: 5400, soldAt: "2026/08/30", buyer: "haru_wardrobe", rating: 4, review: "色合いがとても素敵です。これからの季節に活躍しそうです。" },
  { id: "sale-3", name: "コットンワンピース", category: "ワンピース", price: 3200, soldAt: "2026/07/12", buyer: "", rating: 0, review: "" }
];
const storedHistory = localStorage.getItem("reTailorSellerHistory");
const history = storedHistory === null ? sampleHistory : JSON.parse(storedHistory);
const list = document.getElementById("historyList");
const detail = document.getElementById("saleDetail");
document.getElementById("historyCount").textContent = `${history.length}件`;

function renderDetail(item) {
  if (!item.buyer) {
    detail.innerHTML = `<h2>${item.name}</h2><p class="empty-copy">購入者からのレビューはまだありません。</p>`;
    return;
  }
  const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
  detail.innerHTML = `<h2>${item.name}</h2><h3>購入者</h3><p class="buyer-name">${item.buyer}</p><h3>レビュー</h3><p class="review-rating" aria-label="${item.rating}つ星">${stars}</p><p class="review-date">${item.soldAt}</p><p class="review-text">${item.review}</p>`;
}

function selectItem(item, button) {
  list.querySelectorAll(".history-item").forEach((entry) => entry.setAttribute("aria-pressed", String(entry === button)));
  renderDetail(item);
}

if (history.length === 0) {
  list.innerHTML = '<p class="empty-state">販売した商品はありません。</p>';
  detail.innerHTML = '<h2>商品を選択してください</h2><p class="empty-copy">出品履歴の商品を選ぶと購入者情報を確認できます。</p>';
} else {
  history.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.setAttribute("aria-pressed", String(index === 0));
    button.innerHTML = `<span class="product-image" role="img" aria-label="${item.category}の商品画像">${item.category}</span><span class="item-copy"><strong>${item.name}</strong><span>￥${Number(item.price).toLocaleString()} ・ ${item.soldAt}</span><span class="item-status">${item.buyer ? "レビューあり" : "レビュー待ち"}</span></span>`;
    button.addEventListener("click", () => selectItem(item, button));
    list.append(button);
  });
  renderDetail(history[0]);
}