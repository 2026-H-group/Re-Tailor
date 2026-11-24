const params = new URLSearchParams(location.search);
const orderId = params.get("order");
const productId = Number(params.get("product") || params.get("id"));
let orders = [];
try {
	const storedOrders = JSON.parse(localStorage.getItem("reTailorPurchaseHistory") || "[]");
	if (Array.isArray(storedOrders)) orders = storedOrders;
} catch {
	localStorage.removeItem("reTailorPurchaseHistory");
}

const order = orderId
	? orders.find((entry) => String(entry.id) === orderId)
	: orders.find((entry) => entry.items?.some((item) => Number(item.id) === productId));
const item = order?.items?.find((entry) => Number(entry.id) === productId);
const detail = document.getElementById("purchaseDetail");
const notFound = document.getElementById("purchaseDetailNotFound");

if (!order || !item) {
	detail.hidden = true;
	notFound.hidden = false;
} else {
	const yen = (value) => `¥${Number(value || 0).toLocaleString("ja-JP")}`;
	document.getElementById("productImage").textContent = item.category || "商品";
	document.getElementById("productImage").setAttribute("aria-label", `${item.name}の商品画像`);
	document.getElementById("category").textContent = item.category || "未登録";
	document.getElementById("productName").textContent = item.name || "商品名未登録";
	document.getElementById("seller").textContent = item.seller || "未登録";
	document.getElementById("size").textContent = item.size || "未登録";
	document.getElementById("color").textContent = item.color || "未登録";
	document.getElementById("date").textContent = order.date || "記録なし";
	document.getElementById("receipt").textContent = order.receipt || "記録なし";
	document.getElementById("subtotal").textContent = yen(item.price);
	document.getElementById("total").textContent = yen(order.total);
	const query = `order=${encodeURIComponent(order.id)}&product=${encodeURIComponent(item.id)}`;
	document.getElementById("reviewLink").href = `review.html?${query}`;
	document.getElementById("coordinateLink").href = `coordinate_shindan.html?item=${encodeURIComponent(item.id)}&order=${encodeURIComponent(order.id)}`;
	const receiptButton = document.getElementById("receiptButton");
	const receiptStatus = document.getElementById("receiptStatus");
	const updateReceiptStatus = () => {
		if (item.receivedAt) {
			receiptButton.disabled = true;
			receiptButton.textContent = "受取完了済み";
			receiptStatus.textContent = `受取完了を出品者に通知しました（${new Date(item.receivedAt).toLocaleString("ja-JP")}）。`;
		}
	};
	receiptButton.addEventListener("click", () => {
		try {
			const storedOrders = JSON.parse(localStorage.getItem("reTailorPurchaseHistory") || "[]");
			const latestOrder = Array.isArray(storedOrders)
				? storedOrders.find((entry) => String(entry.id) === String(order.id))
				: null;
			const latestItem = latestOrder?.items?.find((entry) => Number(entry.id) === Number(item.id));
			if (!latestOrder || !latestItem) {
				receiptStatus.textContent = "購入情報を確認できませんでした。購入履歴を再読み込みしてください。";
				return;
			}
			if (!latestItem.receivedAt) {
				latestItem.receivedAt = new Date().toISOString();
				localStorage.setItem("reTailorPurchaseHistory", JSON.stringify(storedOrders));
			}
			item.receivedAt = latestItem.receivedAt;
			updateReceiptStatus();
		} catch {
			receiptStatus.textContent = "受取完了を保存できませんでした。もう一度お試しください。";
		}
	});
	updateReceiptStatus();
	const closetButton = document.getElementById("closetRegisterButton");
	const closetStatus = document.getElementById("closetRegisterStatus");
	if (!window.reTailorClosetPurchases.isRegistered(order, item)) {
		closetButton.hidden = false;
		closetButton.addEventListener("click", () => {
			const added = window.reTailorClosetPurchases.addItems(order, [item]);
			closetButton.hidden = true;
			closetStatus.textContent = added.length
				? "マイクローゼットに登録しました。"
				: "この商品はすでにマイクローゼットに登録されています。";
		});
	}
}
