const latestListing = JSON.parse(localStorage.getItem("reTailorLatestListing") || "null");
const editLink = document.getElementById("editListing");
const notice = document.getElementById("listingNotice");

if (latestListing) {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const value = latestListing[element.dataset.field];
    element.textContent = element.dataset.field === "price" && value != null
      ? Number(value).toLocaleString()
      : (value || "未入力");
  });
  editLink.href = `naiyouhensyuu.html?id=${encodeURIComponent(latestListing.id)}`;
} else {
  notice.hidden = false;
  notice.textContent = "出品情報が見つかりません。出品一覧から商品をご確認ください。";
}