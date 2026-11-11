const categoryOrder = [
  ["tops", "トップス"],
  ["outer", "アウター"],
  ["bottoms", "ボトムス"],
  ["shoes", "靴"],
  ["accessories", "アクセサリー"],
];
const closetItems = JSON.parse(localStorage.getItem("reTailorMyCloset") || "[]");
const purchaseItems = [
  { id: 1, name: "シンプルブラックTシャツ", category: "トップス", color: "ブラック", size: "M", purchase: true },
  { id: 3, name: "ヴィンテージデニムジャケット", category: "アウター", color: "インディゴ", size: "L", purchase: true },
];
const purchasedItem = purchaseItems.find((item) => item.id === Number(new URLSearchParams(location.search).get("item")));
const recommendationPools = [
  [{ id: 5, name: "レザーベルト", price: "¥1,800" }, { id: 4, name: "キャンバストートバッグ", price: "¥3,200" }, { id: 7, name: "ウールマフラー", price: "¥2,400" }],
  [{ id: 8, name: "チェーンネックレス", price: "¥1,500" }, { id: 4, name: "フェルトハット", price: "¥2,800" }, { id: 1, name: "レザーシューズ", price: "¥6,500" }],
  [{ id: 8, name: "シルバーピアス", price: "¥1,200" }, { id: 3, name: "デニムキャップ", price: "¥2,100" }, { id: 5, name: "ミニショルダーバッグ", price: "¥4,600" }],
];
const colorPalettes = [
  ["#3f4a2e", "#8a5a2b", "#a3312c", "#d9d5cc", "#1c1c1c"],
  ["#274060", "#c9a66b", "#5c5346", "#e8e3d8", "#2e2e2e"],
  ["#5b3a29", "#a68a64", "#d6c7a1", "#333333", "#7a1f1f"],
];
const suggestionMessages = [
  "この組み合わせ、いい感じにまとまっています。",
  "落ち着いた色合いでバランスが良いコーディネートです。",
  "アクセントカラーが効いた、おしゃれな組み合わせです。",
];
const $ = (id) => document.getElementById(id);
let diagnosisTimer;

function getSelectedItems() {
  const selected = [...$("closetSelectors").querySelectorAll("input:checked")]
    .map((input) => closetItems[Number(input.value)])
    .filter(Boolean)
    .map((item) => ({ ...item, closet: true }));
  return purchasedItem ? [purchasedItem, ...selected] : selected;
}

function renderClosetSelectors() {
  const container = $("closetSelectors");
  categoryOrder.forEach(([key, label]) => {
    const items = closetItems.map((item, index) => ({ item, index }))
      .filter(({ item }) => item.category === key);
    if (!items.length) return;
    const group = document.createElement("fieldset");
    group.className = "closet-category";
    const legend = document.createElement("legend");
    legend.textContent = label;
    group.append(legend);
    items.forEach(({ item, index }, itemPosition) => {
      const option = document.createElement("label");
      option.className = "closet-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = String(index);
      checkbox.checked = itemPosition === 0 && purchasedItem?.category !== label;
      const name = document.createElement("span");
      name.textContent = `${item.name}${item.color ? `（${item.color}）` : ""}`;
      option.append(checkbox, name);
      group.append(option);
    });
    container.append(group);
  });
  $("selectionEmpty").hidden = closetItems.length > 0;
}

function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "coord-item";
  const link = document.createElement("a");
  link.className = `img-box${item.image ? " has-image" : " empty"}`;
  link.href = item.purchase ? `purchase-history-detail.html?id=${item.id}` : item.closet ? "my-closet.html" : `detail.html?id=${item.id}`;
  link.setAttribute("aria-label", `${item.name}の情報`);
  if (typeof item.image === "string" && item.image.startsWith("data:image/")) {
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = `${item.name}の写真`;
    link.append(image);
  }
  const name = document.createElement("p");
  name.className = "coord-item-name";
  name.textContent = item.name;
  const meta = document.createElement("p");
  meta.className = "coord-item-price";
  meta.textContent = item.categoryLabel || item.category
    ? [item.categoryLabel || item.category, item.color].filter(Boolean).join(" / ")
    : item.price || "";
  card.append(link, name, meta);
  return card;
}

function renderItemGrid(containerId, items) {
  const grid = $(containerId);
  grid.replaceChildren(...items.map(createItemCard));
}

function renderSelectedItems() {
  const items = getSelectedItems();
  renderItemGrid("selectedItems", items);
  $("selectedCount").textContent = `（${items.length}件）`;
  $("selectedEmpty").hidden = items.length > 0;
  $("saveComboBtn").disabled = items.length === 0;
}

function runCoordinateDiagnosis() {
  return {
    score: Math.floor(Math.random() * 29) + 70,
    palette: colorPalettes[Math.floor(Math.random() * colorPalettes.length)],
    message: suggestionMessages[Math.floor(Math.random() * suggestionMessages.length)],
    recommended: recommendationPools[Math.floor(Math.random() * recommendationPools.length)],
  };
}

function renderDiagnosis() {
  clearTimeout(diagnosisTimer);
  const box = $("aiSuggestionBox");
  const text = $("aiSuggestionText");
  const retryBtn = $("retryBtn");
  if (!getSelectedItems().length) {
    box.classList.remove("loading");
    text.textContent = "アイテムを選択するとコーディネートを診断します。";
    $("compatScore").textContent = "--%";
    $("compatBarFill").style.width = "0";
    $("colorDots").replaceChildren();
    $("recommendedItems").replaceChildren();
    retryBtn.disabled = true;
    return;
  }
  box.classList.add("loading");
  text.textContent = "診断中…";
  retryBtn.disabled = true;
  diagnosisTimer = window.setTimeout(() => {
    const result = runCoordinateDiagnosis();
    $("compatScore").textContent = `${result.score}%`;
    $("compatBarFill").style.width = `${result.score}%`;
    text.textContent = result.message;
    $("colorDots").replaceChildren(...result.palette.map((color) => {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.backgroundColor = color;
      return dot;
    }));
    renderItemGrid("recommendedItems", result.recommended);
    box.classList.remove("loading");
    retryBtn.disabled = false;
  }, 600);
}

document.addEventListener("DOMContentLoaded", () => {
  renderClosetSelectors();
  $("closetSelectors").addEventListener("change", () => {
    renderSelectedItems();
    renderDiagnosis();
  });
  $("retryBtn").addEventListener("click", renderDiagnosis);
  $("saveComboBtn").addEventListener("click", () => {
    $("saveStatus").textContent = "この組み合わせを保存しました。";
    $("saveComboBtn").disabled = true;
  });
  renderSelectedItems();
  renderDiagnosis();
});
