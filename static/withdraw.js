const withdrawButton = document.getElementById("withdrawSubmit");
const reason = document.getElementById("withdrawReason");
const withdrawError = document.getElementById("withdrawError");
const withdrawId = new URLSearchParams(location.search).get("id");

withdrawButton.addEventListener("click", (event) => {
  if (!reason.value.trim()) {
    event.preventDefault();
    withdrawError.textContent = "取り下げ理由を入力してください。";
    reason.focus();
    return;
  }
  if (!window.confirm("この商品を取り下げますか？")) { event.preventDefault(); return; }
  if (withdrawId) {
    const listings = JSON.parse(localStorage.getItem("reTailorListings") || "[]");
    localStorage.setItem("reTailorListings", JSON.stringify(listings.filter((item) => String(item.id) !== withdrawId)));
  }
});