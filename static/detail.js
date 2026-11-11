const products = {
  1: { name: "リネンシャツ", type: "中古品", category: "トップス", price: 850, seller: "linen_days", rating: "4.8", reviews: 12, listedAt: "2026年9月17日", condition: "目立った傷や汚れなし", brand: "無印良品", size: "M", color: "ナチュラル", material: "麻 100%", purchaseDate: "2024年春", shipping: "ゆうゆうメルカリ便", handling: "1〜2日", image: "トップス", description: "軽くて通気性のよいリネンシャツです。数回着用しましたが、目立つ汚れやほつれはありません。\nこれからの季節に一枚で、また羽織りとしても使いやすいアイテムです。", sellerRating: "本人確認済み・評価 4.8", sales: "取引 36件" },
  2: { name: "ハンドメイドニットセーター", type: "ハンドメイド品", category: "トップス", price: 5400, seller: "atelier_mio", rating: "5.0", reviews: 8, listedAt: "2026年9月16日", condition: "新品・未使用", brand: "atelier mio", size: "フリー", color: "アイボリー", material: "ウール・アクリル", purchaseDate: "2026年9月", shipping: "宅急便コンパクト", handling: "2〜3日", image: "ハンドメイド", description: "一編みずつ丁寧に仕上げたハンドメイドセーターです。ゆったりしたシルエットで、重ね着にも向いています。", sellerRating: "本人確認済み・評価 5.0", sales: "取引 18件" },
  3: { name: "ヴィンテージデニムジャケット", type: "中古品", category: "アウター", price: 8900, seller: "old_closet", rating: "4.9", reviews: 21, listedAt: "2026年9月15日", condition: "やや傷や汚れあり", brand: "Levi's", size: "L", color: "インディゴ", material: "綿 100%", purchaseDate: "不明", shipping: "宅急便", handling: "1〜2日", image: "アウター", description: "色落ちと風合いが魅力のヴィンテージデニムジャケットです。写真で状態をご確認ください。", sellerRating: "本人確認済み・評価 4.9", sales: "取引 52件" }
};
products[4] = { ...products[1], name: "プリーツスカート", category: "ボトムス", price: 1100, seller: "closet_note", image: "ボトムス" };
products[5] = { ...products[1], name: "キャンバストートバッグ", category: "アクセサリー", price: 700, seller: "daily_goods", image: "バッグ" };
products[6] = { ...products[1], name: "コットンワンピース", category: "トップス", price: 3200, seller: "mori_fuku", image: "ワンピース" };
products[7] = { ...products[3], name: "コーデュロイジャケット", price: 1500, seller: "old_closet", image: "アウター" };
products[8] = { ...products[1], name: "ビーズネックレス", category: "アクセサリー", price: 400, seller: "handmade_ito", type: "ハンドメイド品", image: "アクセサリー" };
const reviews = [
  { name: "mika", rating: "★★★★★", date: "2026/09/12", text: "写真どおりのきれいな状態でした。発送も早く、気持ちよく取引できました。" },
  { name: "haru", rating: "★★★★☆", date: "2026/08/28", text: "サイズ感がちょうどよく、これからたくさん着たいと思います。" }
];

function getProduct() { const id = new URLSearchParams(location.search).get("id"); if (!id) return products[1]; const base = products[id]; const shared = window.getReTailorProduct(id); return base && shared ? { ...base, ...shared } : null; }
function setText(id, value) { document.getElementById(id).textContent = value; }
function renderProduct(product) {
  document.title = `${product.name} | Re:Tailor`;
  setText("productName", product.name); setText("productType", product.type); setText("productCategory", product.category); setText("sellerName", product.seller); setText("sellerNameLarge", product.seller);
  const sellerUrl = `seller.html?seller=${encodeURIComponent(product.seller)}&fromProduct=${product.id}`;
  document.getElementById("sellerName").href = sellerUrl;
  document.getElementById("sellerProfileLink").href = sellerUrl;
  setText("productPrice", `¥${product.price.toLocaleString()}`); setText("listedAt", product.listedAt); setText("productRating", "★★★★★"); setText("ratingText", product.rating); setText("reviewCount", `(${product.reviews}件)`); setText("productImage", product.image);
  setText("detailType", product.type);
  ["condition", "brand", "size", "color", "material", "purchaseDate", "shipping", "handling", "description"].forEach((key) => setText(key, product[key]));
  setText("sellerInitial", product.seller.slice(0, 1).toUpperCase()); setText("sellerRating", product.sellerRating); setText("sellerSales", product.sales);
}
function renderReviews() { document.getElementById("reviewList").innerHTML = reviews.map((review) => `<article class="review-item"><div class="review-meta"><span><strong>${review.name}</strong><span class="stars">${review.rating}</span></span><time>${review.date}</time></div><p>${review.text}</p></article>`).join(""); }
document.addEventListener("DOMContentLoaded", () => {
  const productId = new URLSearchParams(location.search).get("id") || "1";
  const product = getProduct();
  if (!product) { document.getElementById("productDetail").innerHTML = '<p class="eyebrow">PRODUCT NOT FOUND</p><h1>商品が見つかりません</h1><p>商品一覧から別の商品を選択してください。</p><p><a href="top-index.html#products">商品一覧へ戻る</a></p>'; return; }
  renderProduct(product); renderReviews();
  const recent = JSON.parse(localStorage.getItem("reTailorRecentlyViewed") || "[]").filter((id) => id !== Number(productId)); recent.unshift(Number(productId)); localStorage.setItem("reTailorRecentlyViewed", JSON.stringify(recent.slice(0, 4)));
  const favorites = new Set(JSON.parse(localStorage.getItem("reTailorFavorites") || "[]"));
  const favoriteButton = document.getElementById("favoriteButton");
  const isFavorite = favorites.has(Number(productId));
  favoriteButton.classList.toggle("active", isFavorite); favoriteButton.setAttribute("aria-pressed", isFavorite); favoriteButton.textContent = isFavorite ? "♥ お気に入り済み" : "♡ お気に入り";
  document.getElementById("buyButton").addEventListener("click", () => { location.href = `buy.html?items=${productId}`; });
  favoriteButton.addEventListener("click", (event) => { const button = event.currentTarget; const active = button.classList.toggle("active"); button.setAttribute("aria-pressed", active); button.textContent = active ? "♥ お気に入り済み" : "♡ お気に入り"; active ? favorites.add(Number(productId)) : favorites.delete(Number(productId)); localStorage.setItem("reTailorFavorites", JSON.stringify([...favorites])); });
  const followButton = document.getElementById("followButton");
  const following = new Set(JSON.parse(localStorage.getItem("reTailorFollowing") || "[]"));
  const followerCounts = JSON.parse(localStorage.getItem("reTailorFollowerCounts") || "{}");
  let followerCount = followerCounts[product.seller] || 18;
  const updateFollowButton = () => { const active = following.has(product.seller); followButton.classList.toggle("active", active); followButton.setAttribute("aria-pressed", active); followButton.textContent = active ? "フォロー解除" : "フォローする"; document.getElementById("sellerFollowers").textContent = `フォロワー ${followerCount}人`; };
  updateFollowButton();
  followButton.addEventListener("click", () => { const active = following.has(product.seller); active ? (following.delete(product.seller), followerCount = Math.max(0, followerCount - 1)) : (following.add(product.seller), followerCount += 1); followerCounts[product.seller] = followerCount; localStorage.setItem("reTailorFollowing", JSON.stringify([...following])); localStorage.setItem("reTailorFollowerCounts", JSON.stringify(followerCounts)); updateFollowButton(); });
});
