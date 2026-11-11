const products = window.reTailorProducts || [];
const searchForm = document.getElementById("searchForm");
const filterForm = document.getElementById("filterForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("searchResults");
const status = document.getElementById("searchStatus");
const emptyState = document.getElementById("emptyState");
const fields = {
  style: document.getElementById("styleFilter"),
  category: document.getElementById("categoryFilter"),
  color: document.getElementById("colorFilter"),
  size: document.getElementById("sizeFilter")
};

function makeCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  const link = document.createElement("a");
  link.className = "product-link";
  link.href = `detail.html?id=${product.id}`;
  const image = document.createElement("div");
  image.className = "card-image";
  image.setAttribute("role", "img");
  image.setAttribute("aria-label", `${product.name}の商品画像`);
  image.textContent = product.category;
  const body = document.createElement("div");
  body.className = "card-body";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  tag.textContent = `${product.style} / ${product.type}`;
  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = product.name;
  const meta = document.createElement("div");
  meta.className = "card-meta";
  const seller = document.createElement("span");
  seller.textContent = `出品者：${product.seller}`;
  const price = document.createElement("strong");
  price.textContent = `￥${Number(product.price).toLocaleString()}`;
  meta.append(seller, price);
  body.append(tag, title, meta);
  link.append(image, body);
  card.append(link);
  return card;
}

function renderResults() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const selected = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
  const visible = products.filter((product) => {
    const searchable = [product.name, product.category, product.seller, product.type, product.material, product.style, product.color, product.size].join(" ").toLocaleLowerCase();
    return (!query || searchable.includes(query))
      && (!selected.style || product.style === selected.style)
      && (!selected.category || product.category === selected.category)
      && (!selected.color || product.color === selected.color)
      && (!selected.size || product.size === selected.size);
  });
  results.replaceChildren(...visible.map(makeCard));
  status.textContent = `${visible.length}件の商品が見つかりました。`;
  emptyState.hidden = visible.length > 0;
}

searchInput.value = new URLSearchParams(window.location.search).get("q") || "";
searchForm.addEventListener("submit", (event) => { event.preventDefault(); renderResults(); });
searchInput.addEventListener("input", renderResults);
filterForm.addEventListener("change", renderResults);
document.getElementById("resetFilters").addEventListener("click", () => {
  filterForm.reset();
  searchInput.value = "";
  renderResults();
});
renderResults();
