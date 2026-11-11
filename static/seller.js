const sellerId = new URLSearchParams(location.search).get("seller") || "linen_days";
const sellerProducts = window.reTailorProducts.filter((item) => item.seller === sellerId);
const returnProductId = new URLSearchParams(location.search).get("fromProduct");
const returnProduct = window.getReTailorProduct(returnProductId);
if (returnProduct && returnProduct.seller === sellerId) {
	const backLink = document.getElementById("sellerBackLink");
	backLink.href = `detail.html?id=${returnProduct.id}`;
	backLink.textContent = "← 商品詳細へ";
}
const sellerName = document.getElementById("sellerName");
const following = new Set(JSON.parse(localStorage.getItem("reTailorFollowing") || "[]"));
const followerCounts = JSON.parse(localStorage.getItem("reTailorFollowerCounts") || "{}");
let followerCount = followerCounts[sellerId] || 18;
sellerName.textContent = sellerId;
document.getElementById("sellerAvatar").textContent = sellerId.slice(0, 1).toUpperCase();
document.getElementById("listingCount").textContent = `${sellerProducts.length}件`;
document.getElementById("sellerListings").innerHTML = sellerProducts.map((item) => `<a class="seller-card" href="detail.html?id=${item.id}"><div class="seller-image">${item.category}</div><strong>${item.name}</strong><span>¥${item.price.toLocaleString()}</span></a>`).join("");
document.getElementById("emptyMessage").hidden = sellerProducts.length > 0;
const followButton = document.getElementById("followButton");
const updateFollow = () => { const active = following.has(sellerId); followButton.classList.toggle("active", active); followButton.setAttribute("aria-pressed", active); followButton.textContent = active ? "フォロー解除" : "フォローする"; document.getElementById("sellerFollowers").textContent = `フォロワー ${followerCount}人`; };
updateFollow();
followButton.addEventListener("click", () => { const active = following.has(sellerId); active ? (following.delete(sellerId), followerCount = Math.max(0, followerCount - 1)) : (following.add(sellerId), followerCount += 1); followerCounts[sellerId] = followerCount; localStorage.setItem("reTailorFollowing", JSON.stringify([...following])); localStorage.setItem("reTailorFollowerCounts", JSON.stringify(followerCounts)); updateFollow(); });
