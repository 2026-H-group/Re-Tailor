const listingKey = "reTailorListings";
const latestListingKey = "reTailorLatestListing";
const sampleListings = [
  { id: "sample-1", name: "ヴィンテージデニムジャケット", price: 8900, category: "アウター", status: "販売中" },
  { id: "sample-2", name: "ハンドメイドニットセーター", price: 5400, category: "トップス", status: "販売中" },
  { id: "sample-3", name: "コットンワンピース", price: 3200, category: "ワンピース", status: "販売中" },
  { id: "sample-4", name: "リネンシャツ", price: 2800, category: "トップス", status: "売却済み", condition: "目立った傷や汚れなし", description: "風通しのよいリネン素材のシャツです。", buyer: "mika_style", purchasedAt: "2026-09-18T14:30:00" },
  { id: "sample-5", name: "ハンドメイドポーチ", price: 1600, category: "その他", status: "下書き", condition: "新品", description: "制作中の作品です。" }
];
const getListings = () => JSON.parse(localStorage.getItem(listingKey) || "null") || sampleListings;
const saveListings = (items) => localStorage.setItem(listingKey, JSON.stringify(items));
const requestedStatus = new URLSearchParams(window.location.search).get("status");
let activeStatus = ["販売中", "売却済み", "下書き"].includes(requestedStatus) ? requestedStatus : "販売中";

function createDetailRow(container, label, value) {
  const row = document.createElement("div");
  row.className = "sale-detail-row";
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value || "未登録";
  row.append(term, description);
  container.append(row);
}

function formatPurchasedAt(value) {
  if (!value) return "購入日時の記録なし";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function createListingCard(item) {
  const card = document.createElement("article");
  card.className = "card";
  const image = document.createElement("div");
  image.className = "card-img empty";
  image.setAttribute("aria-hidden", "true");
  card.append(image);

  const body = document.createElement("div");
  body.className = "card-body";
  card.append(body);

  const name = document.createElement(activeStatus === "売却済み" ? "button" : "div");
  name.className = "card-name";
  name.textContent = item.name;
  if (activeStatus === "売却済み") {
    name.classList.add("sold-item-trigger");
    name.type = "button";
    name.setAttribute("aria-expanded", "false");
  }
  body.append(name);

  const price = document.createElement("div");
  price.className = "card-price";
  price.textContent = `￥${Number(item.price || 0).toLocaleString()}`;
  body.append(price);

  const status = document.createElement("span");
  status.className = "card-status";
  status.textContent = item.status;
  body.append(status);

  if (activeStatus === "売却済み") {
    const details = document.createElement("dl");
    details.className = "sold-details";
    details.hidden = true;
    createDetailRow(details, "カテゴリ", item.category);
    createDetailRow(details, "価格", `￥${Number(item.price || 0).toLocaleString()}`);
    createDetailRow(details, "商品状態", item.condition);
    createDetailRow(details, "商品説明", item.description);
    createDetailRow(details, "購入者", item.buyer);
    createDetailRow(details, "購入日時", formatPurchasedAt(item.purchasedAt || item.soldAt));
    body.append(details);
    name.addEventListener("click", () => {
      details.hidden = !details.hidden;
      name.setAttribute("aria-expanded", String(!details.hidden));
    });
  } else {
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const edit = document.createElement("a");
    edit.className = "btn-edit";
    edit.href = `naiyouhensyuu.html?id=${encodeURIComponent(item.id)}`;
    edit.textContent = "編集";
    actions.append(edit);

    if (activeStatus === "販売中") {
      const withdraw = document.createElement("a");
      withdraw.className = "btn-withdraw";
      withdraw.href = `torisage.html?id=${encodeURIComponent(item.id)}`;
      withdraw.textContent = "取り下げ";
      actions.append(withdraw);
    } else {
      const publish = document.createElement("button");
      publish.className = "btn-publish";
      publish.type = "button";
      publish.textContent = "出品する";
      publish.addEventListener("click", () => {
        const listings = getListings();
        const target = listings.find((listing) => String(listing.id) === String(item.id));
        if (!target) return;
        target.status = "販売中";
        target.publishedAt = new Date().toISOString();
        saveListings(listings);
        activeStatus = "販売中";
        document.querySelectorAll(".tab[data-status]").forEach((tab) => {
          const selected = tab.dataset.status === activeStatus;
          tab.classList.toggle("active", selected);
          tab.setAttribute("aria-pressed", String(selected));
        });
        renderListings();
      });
      actions.append(publish);
    }

    body.append(actions);
  }
  return card;
}

function renderListings() {
  const list = document.getElementById("listingList");
  if (!list) return;
  const listings = getListings().filter((item) => item.status === activeStatus);
  list.replaceChildren();
  if (listings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "listing-empty";
    empty.textContent = `${activeStatus}の商品はありません。`;
    list.append(empty);
    return;
  }
  listings.forEach((item) => list.append(createListingCard(item)));
}

function setupListingTabs() {
  document.querySelectorAll(".tab[data-status]").forEach((tab) => {
    const selected = tab.dataset.status === activeStatus;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-pressed", String(selected));
    tab.addEventListener("click", () => {
      activeStatus = tab.dataset.status;
      document.querySelectorAll(".tab[data-status]").forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderListings();
    });
  });
}

function setupListingForm() {
  const submit = document.getElementById("listingSubmit");
  if (!submit) return;
  submit.addEventListener("click", (event) => {
    const name = document.getElementById("listingName").value.trim();
    const category = document.getElementById("listingCategory").value;
    const price = Number(document.getElementById("listingPrice").value.replace(/,/g, ""));
    const error = document.getElementById("listingError");
    if (!name || !category || !price || price < 1) {
      event.preventDefault();
      error.textContent = "商品名、カテゴリ、価格を入力してください。";
      return;
    }
    event.preventDefault();
    const condition = document.querySelector('input[name="condition"]:checked');
    const listing = {
      id: Date.now(), name, category, price, status: "販売中",
      condition: condition ? (condition.value === "new" ? "新品" : "中古") : "未選択",
      material: document.getElementById("listingMaterial").value.trim(),
      description: document.getElementById("listingDescription").value.trim(),
      shippingMethod: document.getElementById("shippingMethod").value,
      shippingHandling: document.getElementById("shippingHandling").value,
      shippingCost: document.getElementById("shippingCost").value,
      returnPolicy: document.getElementById("returnPolicy").value
    };
    const listings = getListings();
    listings.unshift(listing);
    saveListings(listings);
    localStorage.setItem(latestListingKey, JSON.stringify(listing));
    window.location.href = "syuppin_complete.html";
  });
}

function setupDraftSave() {
  const saveDraftButtons = document.querySelectorAll("#saveDraft, #saveDraftFooter");
  saveDraftButtons.forEach((button) => button.addEventListener("click", () => {
    const condition = document.querySelector('input[name="condition"]:checked');
    const listing = {
      id: `draft-${Date.now()}`,
      name: document.getElementById("listingName").value.trim() || "商品名未入力",
      category: document.getElementById("listingCategory").value,
      price: Number(document.getElementById("listingPrice").value.replace(/,/g, "")) || 0,
      status: "下書き",
      condition: condition ? (condition.value === "new" ? "新品" : "中古") : "未選択",
      material: document.getElementById("listingMaterial").value.trim(),
      description: document.getElementById("listingDescription").value.trim(),
      shippingMethod: document.getElementById("shippingMethod").value,
      shippingHandling: document.getElementById("shippingHandling").value,
      shippingCost: document.getElementById("shippingCost").value,
      returnPolicy: document.getElementById("returnPolicy").value,
      savedAt: new Date().toISOString()
    };
    const listings = getListings();
    listings.unshift(listing);
    saveListings(listings);
    window.location.href = "syuppin_itiran.html?status=%E4%B8%8B%E6%9B%B8%E3%81%8D";
  }));
}

renderListings();
setupListingTabs();
setupListingForm();
setupDraftSave();
