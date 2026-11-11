const notices = [
  { id: "new-item", date: "9/15", category: "お知らせ", title: "新商品が追加されました", body: "Re:Tailorに新しい商品が追加されました。\n気になるアイテムをぜひチェックしてください。" },
  { id: "autumn-campaign", date: "9/12", category: "キャンペーン", title: "秋のファッション特集開催中！", body: "秋の装いを楽しむアイテムを集めました。\n期間限定の特集をお楽しみください。" },
  { id: "delivery-info", date: "9/10", category: "配送", title: "配送サービスに関するお知らせ", body: "配送サービスについてのお知らせです。\nご注文前に配送に関する情報をご確認ください。" },
  { id: "retailor-update", date: "9/5", category: "Re:Tailor", title: "系統発掘機能が追加されました！", body: "あなたに似合うファッション系統を発掘できる機能を追加しました。\nトップページからお試しください。" }
];

function getNotice() {
  const id = new URLSearchParams(window.location.search).get("id");
  return notices.find((notice) => notice.id === id);
}

function renderList() {
  const list = document.getElementById("noticeList");
  if (!list) return;
  list.innerHTML = notices.map((notice) => `
    <a class="notice-link" href="notification-detail.html?id=${notice.id}">
      <time class="notice-date">${notice.date}</time>
      <span class="notice-category">${notice.category}</span>
      <span class="notice-title">${notice.title}</span>
      <span class="notice-arrow" aria-hidden="true">→</span>
    </a>`).join("");
}

function renderDetail() {
  const container = document.getElementById("noticeDetail");
  if (!container) return;
  const notice = getNotice();
  if (!notice) {
    container.innerHTML = '<div class="page-heading"><p class="eyebrow">INFORMATION</p><h1>お知らせが見つかりません</h1></div><a class="list-button" href="notification.html">一覧へ戻る</a>';
    return;
  }
  document.title = `${notice.title} | Re:Tailor`;
  container.innerHTML = `
    <div class="detail-meta"><time>${notice.date}</time><span class="detail-category">${notice.category}</span></div>
    <h1 class="detail-title">${notice.title}</h1>
    <div class="detail-body">${notice.body}</div>
    <div class="detail-footer"><a class="list-button" href="notification.html">← お知らせ一覧へ</a></div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderList();
  renderDetail();
});