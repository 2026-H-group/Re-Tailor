const STORAGE_KEY = "reTailorMyCloset";
const categories = {
  tops: { label: "トップス", fields: [["categoryDetail", "カテゴリー", "Tシャツ / シャツ / ニット / その他", "text"], ["color", "カラー", "例：ホワイト", "text"], ["size", "サイズ", "例：M", "text"], ["length", "着丈（cm）", "例：68", "number"], ["width", "身幅（cm）", "例：52", "number"], ["sleeve", "袖丈（cm）", "例：60", "number"]] },
  bottoms: { label: "ボトムス", fields: [["categoryDetail", "カテゴリー", "パンツ / スカート / その他", "text"], ["color", "カラー", "例：ブラック", "text"], ["size", "サイズ", "例：M", "text"], ["totalLength", "総丈（cm）", "例：98", "number"], ["waist", "ウエスト（cm）", "例：72", "number"], ["riseInseam", "股上・股下（cm）", "例：30 / 68", "text"]] },
  outer: { label: "アウター", fields: [["color", "カラー", "例：カーキ", "text"], ["size", "サイズ", "例：L", "text"], ["length", "着丈（cm）", "例：72", "number"], ["width", "身幅（cm）", "例：58", "number"], ["sleeve", "袖丈（cm）", "例：62", "number"]] },
  shoes: { label: "靴", fields: [["categoryDetail", "カテゴリー", "スニーカー / ブーツ / サンダル / その他", "text"], ["color", "カラー", "例：ホワイト", "text"], ["size", "サイズ（cm）", "例：24.5", "text"]] },
  accessories: { label: "アクセサリー", fields: [["categoryDetail", "カテゴリー", "バッグ / 帽子 / ネックレス / その他", "text"], ["color", "カラー", "例：シルバー", "text"], ["size", "サイズ", "例：フリー", "text"]] }
};
const extraFields = [["season", "季節", "春 / 夏 / 秋 / 冬 / オールシーズン", "text"], ["style", "系統", "カジュアル / ストリート / Y2K / ナチュラル", "text"]];
const categoryOrder = Object.keys(categories);
const $ = (id) => document.getElementById(id);
const getItems = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveItems = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

function renderFields() {
  const config = categories[$("category").value];
  const fields = config.fields.concat(extraFields);
  $("categoryFields").innerHTML = `<p class="field-note">${config.label}の登録項目</p><div class="field-grid">${fields.map(([id, label, placeholder, type]) => `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}"></div>`).join("")}</div>`;
}

function readImage(file) {
  if (!file || !file.size) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("画像を読み込めませんでした。"));
    reader.readAsDataURL(file);
  });
}

async function registerItem(form) {
  const error = $("formError");
  error.textContent = "";
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const config = categories[data.get("category")];
  const name = data.get("name").trim();
  if (!name) {
    error.textContent = "商品名を入力してください。";
    $("itemName").focus();
    return;
  }
  try {
    const item = Object.fromEntries([...data.entries()].filter(([key]) => key !== "imageFile"));
    item.name = name;
    item.categoryLabel = config.label;
    item.image = await readImage(data.get("imageFile"));
    item.id = Date.now();
    const items = getItems();
    items.push(item);
    saveItems(items);
    window.location.href = "my-closet.html?registered=1";
  } catch (exception) {
    error.textContent = exception instanceof Error ? exception.message : "アイテムを登録できませんでした。";
  }
}

function createItemCard(item, index) {
  const card = document.createElement("article");
  card.className = "closet-item";
  if (typeof item.image === "string" && item.image.startsWith("data:image/")) {
    const image = document.createElement("img");
    image.className = "item-thumb";
    image.src = item.image;
    image.alt = `${item.name}の商品写真`;
    card.append(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "item-thumb image-placeholder";
    placeholder.textContent = "写真なし";
    card.append(placeholder);
  }
  const main = document.createElement("div");
  main.className = "item-main";
  const name = document.createElement("p");
  name.className = "item-name";
  name.textContent = item.name;
  const meta = document.createElement("p");
  meta.className = "item-meta";
  meta.textContent = [item.categoryDetail, item.color || "カラー未登録", item.style].filter(Boolean).join(" / ");
  main.append(name, meta);
  const button = document.createElement("button");
  button.className = "delete-button";
  button.type = "button";
  button.dataset.index = String(index);
  button.textContent = "削除";
  button.setAttribute("aria-label", `${item.name}を削除`);
  card.append(main, button);
  return card;
}

function renderItems() {
  const items = getItems();
  const filter = $("colorFilter");
  const selectedColor = filter.value;
  const colors = [...new Set(items.map((item) => item.color?.trim()).filter(Boolean))].sort();
  filter.replaceChildren(new Option("すべてのカラー", "all"));
  colors.forEach((color) => filter.add(new Option(color, color)));
  filter.value = colors.includes(selectedColor) ? selectedColor : "all";
  $("itemCount").textContent = `${items.length}件`;
  $("categoryGroups").replaceChildren();
  const filtered = items.map((item, index) => ({ item, index }))
    .filter(({ item }) => filter.value === "all" || (item.color?.trim() || "未登録") === filter.value);
  categoryOrder.forEach((category) => {
    const groupItems = filtered.filter(({ item }) => item.category === category);
    if (!groupItems.length) return;
    const section = document.createElement("section");
    section.className = "category-group";
    const title = document.createElement("h3");
    title.textContent = `${categories[category].label}（${groupItems.length}件）`;
    const grid = document.createElement("div");
    grid.className = "closet-list";
    groupItems.forEach(({ item, index }) => grid.append(createItemCard(item, index)));
    section.append(title, grid);
    $("categoryGroups").append(section);
  });
  $("emptyMessage").hidden = items.length > 0;
  $("noResultsMessage").hidden = items.length === 0 || filtered.length > 0;
}

const form = $("closetForm");
if (form) {
  $("category").addEventListener("change", renderFields);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    registerItem(form);
  });
  renderFields();
} else {
  $("colorFilter").addEventListener("change", renderItems);
  $("categoryGroups").addEventListener("click", (event) => {
    const button = event.target.closest(".delete-button");
    if (!button) return;
    const items = getItems();
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || !items[index]) return;
    if (!window.confirm(`「${items[index].name}」をマイクローゼットから削除しますか？`)) return;
    items.splice(index, 1);
    saveItems(items);
    renderItems();
  });
  if (new URLSearchParams(window.location.search).has("registered")) {
    $("statusMessage").textContent = "アイテムを登録しました。";
    $("statusMessage").hidden = false;
  }
  renderItems();
}
