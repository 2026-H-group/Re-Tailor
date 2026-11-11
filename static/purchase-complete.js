const params = new URLSearchParams(location.search);
const orders = JSON.parse(localStorage.getItem("reTailorPurchaseHistory") || "[]");
const order = orders.find((entry) => String(entry.id) === params.get("order"));
const form = document.getElementById("closetPurchaseForm");
const list = document.getElementById("purchasedItems");
const registerButton = document.getElementById("registerButton");
const error = document.getElementById("completeError");

function renderPurchasedItems() {
  list.replaceChildren();
  order.items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "history-card purchase-option";
    const registered = window.reTailorClosetPurchases.isRegistered(order, item);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "item";
    checkbox.value = String(index);
    checkbox.disabled = registered;
    checkbox.setAttribute("aria-label", `${item.name}をマイクローゼットに登録`);
    const image = document.createElement("div");
    image.className = "history-image";
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", `${item.name}の商品画像`);
    image.textContent = item.category || "商品";
    const info = document.createElement("div");
    info.className = "purchase-option-info";
    const name = document.createElement("h2");
    name.textContent = item.name || "商品名未登録";
    const details = document.createElement("p");
    details.textContent = [item.category, item.color, item.size].filter(Boolean).join(" / ");
    info.append(name, details);
    if (registered) {
      const label = document.createElement("p");
      label.className = "registered-label";
      label.textContent = "マイクローゼット登録済み";
      info.append(label);
    }
    card.append(checkbox, image, info);
    list.append(card);
  });
  updateButton();
}

function updateButton() {
  registerButton.disabled = list.querySelectorAll('input[name="item"]:checked:not(:disabled)').length === 0;
}

if (!order || !Array.isArray(order.items) || order.items.length === 0) {
  error.textContent = "購入情報が見つかりません。購入履歴からご確認ください。";
  error.hidden = false;
  form.hidden = true;
} else {
  form.addEventListener("change", updateButton);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = [...list.querySelectorAll('input[name="item"]:checked:not(:disabled)')]
      .map((checkbox) => order.items[Number(checkbox.value)])
      .filter(Boolean);
    if (selected.length === 0) {
      registerButton.disabled = true;
      return;
    }
    const added = window.reTailorClosetPurchases.addItems(order, selected);
    document.getElementById("registerStatus").textContent = `${added.length}件をマイクローゼットに登録しました。`;
    renderPurchasedItems();
  });
  renderPurchasedItems();
}
