// ====================================================
// 評価・レビュー画面
//
// このページは「商品詳細」と「プロフィール」の両方からリンクされる想定。
// リンク元によって見た目を少し変える：
//
//   商品詳細から → hyouka_review.html?product=101
//                  → 同じ商品のレビューしか並ばないので、
//                    ページ上部に商品情報を1回だけ表示する
//
//   プロフィールから → hyouka_review.html（productパラメータなし）
//                  → 出品者が受け取った色んな商品のレビューが並ぶので、
//                    レビュー1件ごとに小さく商品名を表示する
//
// どちらのモードかは、URLの ?product=xxx が付いているかどうかで判断している。
// ====================================================

// URLのクエリパラメータを読み取る（例：hyouka_review.html?product=101 の "101" を取得）
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("product");
const isSingleProductMode = productId !== null;

// 商品詳細から来たときに上部に出す商品情報（本来はproductIdを使ってサーバーから取得する）
const currentProduct = {
  name: "ヴィンテージデニムジャケット",
  price: "￥8,900",
};

function setupNavigation() {
  const productLink = document.getElementById("productLink");
  if (productId) productLink.href = `detail.html?id=${encodeURIComponent(productId)}`;
}

// レビューのサンプルデータ。プロフィールモードのときは、
// レビューごとに紐づく商品（product）も一緒に表示する。
const reviews = [
  {
    name: "〇〇さん",
    stars: 5,
    comment: "梱包も丁寧で状態も良く満足です",
    product: { name: "ヴィンテージデニムジャケット" },
  },
  {
    name: "〇〇さん",
    stars: 5,
    comment: "サイズもぴったりで気に入りました",
    product: { name: "ハンドメイドニットセーター" },
  },
  {
    name: "〇〇さん",
    stars: 4,
    comment: "配送が早くて助かりました",
    product: { name: "コットンワンピース" },
  },
];

// ---- 1. 上部の商品パネルを表示するかどうか切り替える ----
function renderProductPanel() {
  const panel = document.getElementById("reviewProductPanel");

  if (!isSingleProductMode) {
    // プロフィールモードのときは上部パネルは不要なので非表示
    panel.style.display = "none";
    return;
  }

  document.getElementById("panelProductName").textContent = currentProduct.name;
  document.getElementById("panelProductPrice").textContent = currentProduct.price;
}

// ---- 2. ★の数を「★★★☆☆」のような文字列に変換する ----
function starString(count) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

// ---- 3. レビュー一覧を描画する ----
function renderReviews() {
  const list = document.getElementById("reviewList");

  list.innerHTML = reviews
    .map((review) => {
      // 商品詳細モードのときは商品名を繰り返さない。
      // プロフィールモードのときだけ、各カードに商品タグを付ける。
      const productTagHtml = isSingleProductMode
        ? ""
        : `
          <div class="review-product-tag">
            <div class="review-product-thumb"></div>
            <span class="review-product-name">${review.product.name}</span>
          </div>
        `;

      return `
        <div class="review-card">
          <div class="review-avatar"></div>
          <div class="review-body">
            <div class="review-top">
              <span class="review-name">${review.name}</span>
              <span class="review-stars">${starString(review.stars)}</span>
            </div>
            ${productTagHtml}
            <p class="review-comment">${review.comment}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderProductPanel();
  renderReviews();
});
