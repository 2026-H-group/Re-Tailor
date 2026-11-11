const historyList = document.getElementById("historyList");
let savedOrders = [];
try {
	const storedOrders = JSON.parse(localStorage.getItem("reTailorPurchaseHistory") || "[]");
	if (Array.isArray(storedOrders)) savedOrders = storedOrders;
} catch {
	localStorage.removeItem("reTailorPurchaseHistory");
}

const history = savedOrders.flatMap((order) => Array.isArray(order.items)
	? order.items.map((item) => ({
			...item,
			orderId: String(order.id),
			date: order.date,
			receipt: order.receipt,
			subtotal: Number(item.price) || 0,
			total: Number(order.total) || 0
		}))
	: []);
const yen = (value) => `¥${Number(value || 0).toLocaleString("ja-JP")}`;

if (history.length === 0) {
	const empty = document.createElement("p");
	empty.className = "history-empty";
	empty.textContent = "購入履歴はありません。商品を購入すると、ここに表示されます。";
	historyList.append(empty);
} else {
	history.forEach((item) => {
		const card = document.createElement("article");
		card.className = "history-card";
		const image = document.createElement("div");
		image.className = "history-image";
		image.setAttribute("role", "img");
		image.setAttribute("aria-label", `${item.name}の商品画像`);
		image.textContent = item.category || "商品";

		const content = document.createElement("div");
		content.className = "history-content";
		const meta = document.createElement("div");
		meta.className = "order-meta";
		const date = document.createElement("span");
		date.textContent = `注文日時 ${item.date || "記録なし"}`;
		const receipt = document.createElement("span");
		receipt.textContent = `レシート番号 ${item.receipt || "記録なし"}`;
		meta.append(date, receipt);
		content.append(meta);

		const name = document.createElement("h2");
		name.textContent = item.name || "商品名未登録";
		const seller = document.createElement("p");
		seller.className = "seller";
		seller.textContent = `出品者：${item.seller || "未登録"}`;
		const details = document.createElement("dl");
		[["カテゴリ", item.category], ["サイズ", item.size], ["カラー", item.color]].forEach(([label, value]) => {
			const row = document.createElement("div");
			const term = document.createElement("dt");
			term.textContent = label;
			const description = document.createElement("dd");
			description.textContent = value || "未登録";
			row.append(term, description);
			details.append(row);
		});
		const amount = document.createElement("p");
		amount.className = "amount";
		amount.append(`小計 ${yen(item.subtotal)}　`);
		const total = document.createElement("strong");
		total.textContent = `合計 ${yen(item.total)}`;
		amount.append(total);
		content.append(name, seller, details, amount);

		const detail = document.createElement("a");
		detail.className = "detail-link";
		detail.href = `purchase-history-detail.html?order=${encodeURIComponent(item.orderId)}&product=${encodeURIComponent(item.id)}`;
		detail.textContent = "購入詳細を見る";
		card.append(image, content, detail);
		historyList.append(card);
	});
}
