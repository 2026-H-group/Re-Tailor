const notices = [
  { id: "new-item", date: "9/15", category: "お知らせ", title: "新商品が追加されました", body: "Re:Tailorに新しい商品が追加されました。\n気になるアイテムをぜひチェックしてください。" },
  { id: "autumn-campaign", date: "9/12", category: "キャンペーン", title: "秋のファッション特集開催中！", body: "秋の装いを楽しむアイテムを集めました。\n期間限定の特集をお楽しみください。" },
  { id: "delivery-info", date: "9/10", category: "配送", title: "配送サービスに関するお知らせ", body: "配送サービスについてのお知らせです。\nご注文前に配送に関する情報をご確認ください。" },
  { id: "retailor-update", date: "9/5", category: "Re:Tailor", title: "系統発掘機能が追加されました！", body: "あなたに似合うファッション系統を発掘できる機能を追加しました。\nトップページからお試しください。" }
];

function getOrders() {
  try {
    const storedOrders = JSON.parse(localStorage.getItem("reTailorPurchaseHistory") || "[]");
    return Array.isArray(storedOrders) ? storedOrders : [];
  } catch {
    localStorage.removeItem("reTailorPurchaseHistory");
    return [];
  }
}

function getCurrentUsername() {
  for (const key of ["reTailorProfile", "retailor.user-profile.v1"]) {
    try {
      const profile = JSON.parse(localStorage.getItem(key) || "null");
      if (profile?.username) return String(profile.username).replace(/^@/, "");
    } catch {
      continue;
    }
  }
  return "";
}

function getImportantNotices() {
  const username = getCurrentUsername();
  return getOrders().flatMap((order) => {
    if (!Array.isArray(order.items)) return [];
    return order.items.flatMap((item, index) => {
      const seller = String(item.seller || "");
      if (username && seller !== username) return [];
      const itemId = item.id ?? index;
      const purchaseNotice = {
        id: `purchase-${order.id}-${itemId}`,
        date: order.date || "",
        category: "取引",
        title: "購入されました",
        body: `${item.name || "商品"}が購入されました。\n注文日時：${order.date || "記録なし"}`,
        timestamp: Date.parse(order.createdAt || order.date) || 0,
        orderId: order.id,
        productId: item.id,
      };
      const receiptNotice = item.receivedAt ? [{
        id: `received-${order.id}-${itemId}`,
        date: new Date(item.receivedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
        category: "取引",
        title: "商品を受け取りました",
        body: `購入者が「${item.name || "商品"}」を受け取りました。\n受取日時：${new Date(item.receivedAt).toLocaleString("ja-JP")}`,
        timestamp: Date.parse(item.receivedAt) || 0,
        orderId: order.id,
        productId: item.id,
      }] : [];
      return [purchaseNotice, ...receiptNotice];
    });
  }).sort((first, second) => second.timestamp - first.timestamp);
}

function getNotice() {
  const id = new URLSearchParams(window.location.search).get("id");
  return notices.find((notice) => notice.id === id)
    || getImportantNotices().find((notice) => notice.id === id);
}

function createNoticeLink(notice) {
  const link = document.createElement("a");
  link.className = "notice-link";
  link.href = `notification-detail.html?id=${encodeURIComponent(notice.id)}`;

  const date = document.createElement("time");
  date.className = "notice-date";
  date.textContent = notice.date;
  const category = document.createElement("span");
  category.className = "notice-category";
  category.textContent = notice.category;
  const title = document.createElement("span");
  title.className = "notice-title";
  title.textContent = notice.title;
  const arrow = document.createElement("span");
  arrow.className = "notice-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  link.append(date, category, title, arrow);
  return link;
}

function renderList() {
  const list = document.getElementById("noticeList");
  const importantList = document.getElementById("importantNoticeList");
  if (list) list.replaceChildren(...notices.map(createNoticeLink));
  if (importantList) {
    const importantNotices = getImportantNotices();
    if (importantNotices.length) {
      importantList.replaceChildren(...importantNotices.map(createNoticeLink));
    } else {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "大切なお知らせはありません。";
      importantList.replaceChildren(empty);
    }
  }
}

function renderDetail() {
  const container = document.getElementById("noticeDetail");
  if (!container) return;
  const notice = getNotice();
  if (!notice) {
    const heading = document.createElement("div");
    heading.className = "page-heading";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "INFORMATION";
    const title = document.createElement("h1");
    title.textContent = "お知らせが見つかりません";
    heading.append(eyebrow, title);
    const backLink = document.createElement("a");
    backLink.className = "list-button";
    backLink.href = "notification.html";
    backLink.textContent = "一覧へ戻る";
    container.replaceChildren(heading, backLink);
    return;
  }
  document.title = `${notice.title} | Re:Tailor`;
  const meta = document.createElement("div");
  meta.className = "detail-meta";
  const date = document.createElement("time");
  date.textContent = notice.date;
  const category = document.createElement("span");
  category.className = "detail-category";
  category.textContent = notice.category;
  meta.append(date, category);
  const title = document.createElement("h1");
  title.className = "detail-title";
  title.textContent = notice.title;
  const body = document.createElement("div");
  body.className = "detail-body";
  body.textContent = notice.body;
  const footer = document.createElement("div");
  footer.className = "detail-footer";
  const backLink = document.createElement("a");
  backLink.className = "list-button";
  backLink.href = "notification.html";
  backLink.textContent = "← お知らせ一覧へ";
  footer.append(backLink);
  container.replaceChildren(meta, title, body, footer);
}

document.addEventListener("DOMContentLoaded", () => {
  renderList();
  renderDetail();
});