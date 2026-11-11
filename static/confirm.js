const catalog = window.reTailorProducts;
const ids = (new URLSearchParams(location.search).get("items") || "1").split(",").map(Number);
const selected = ids.map((id) => catalog.find((item) => item.id === id)).filter(Boolean);
const total = selected.reduce((sum, item) => sum + item.price, 0);
const yen = (value) => `¥${value.toLocaleString()}`;
const name = document.getElementById("confirmProductName");
const price = document.querySelector(".confirm-product .product-info dl div:last-child dd");
const summary = document.querySelectorAll(".confirm-summary .summary-list strong");
if (name) name.textContent = selected.map((item) => item.name).join("、");
if (price) price.textContent = yen(total);
if (summary[0]) summary[0].textContent = yen(total);
if (summary[2]) summary[2].textContent = yen(total + 300);
const purchaseButton = document.querySelector(".purchase-action");
const backButton = document.querySelector(".back-action");
if (backButton) backButton.href = `buy.html?items=${ids.join(",")}`;
if (purchaseButton) purchaseButton.href = `purchase-complete.html?items=${ids.join(",")}`;
if (purchaseButton) purchaseButton.addEventListener("click", (event) => {
	event.preventDefault();
	if (selected.length === 0) {
		window.location.href = `buy.html?items=${encodeURIComponent(ids.join(","))}`;
		return;
	}
	const orders = JSON.parse(localStorage.getItem("reTailorPurchaseHistory") || "[]");
	const id = Date.now();
	const order = { id, date: new Date().toLocaleString("ja-JP"), receipt: `RT-${id}`, items: selected, total: total + 300 };
	orders.unshift(order);
	localStorage.setItem("reTailorPurchaseHistory", JSON.stringify(orders));
	const cart = JSON.parse(localStorage.getItem("reTailorCart") || "[]");
	localStorage.setItem("reTailorCart", JSON.stringify(cart.filter((cartId) => !ids.includes(Number(cartId)))));
	window.location.href = `purchase-complete.html?order=${encodeURIComponent(order.id)}`;
});
