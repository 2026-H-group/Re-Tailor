const listingId = new URLSearchParams(location.search).get("id") || "sample-1";
const defaults = { "sample-1": { name: "ヴィンテージデニムジャケット", price: 8900, category: "アウター" }, "sample-2": { name: "ハンドメイドニットセーター", price: 5400, category: "トップス" }, "sample-3": { name: "コットンワンピース", price: 3200, category: "ワンピース" } };
const listings = JSON.parse(localStorage.getItem("reTailorListings") || "[]");
const item = listings.find((entry) => String(entry.id) === listingId) || defaults[listingId] || defaults["sample-1"];
const name = document.getElementById("editName");
const category = document.getElementById("editCategory");
const price = document.getElementById("editPrice");
const material = document.getElementById("editMaterial");
const description = document.getElementById("editDescription");
name.value = item.name; category.value = item.category; price.value = item.price; material.value = item.material || ""; description.value = item.description || "";

document.getElementById("editSubmit").addEventListener("click", () => {
  const updated = { ...item, id: item.id || listingId, name: name.value.trim(), category: category.value, price: Number(price.value.replace(/,/g, "")), material: material.value.trim(), description: description.value.trim(), status: "販売中" };
  if (!updated.name || !updated.category || !updated.price) { window.alert("商品名、カテゴリ、価格を入力してください。"); return; }
  const index = listings.findIndex((entry) => String(entry.id) === listingId);
  if (index >= 0) listings[index] = updated; else listings.push(updated);
  localStorage.setItem("reTailorListings", JSON.stringify(listings));
  location.href = "syuppin_itiran.html";
});
