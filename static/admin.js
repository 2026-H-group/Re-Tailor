(() => {
  const ADMIN_ID = "admin";
  const ADMIN_PASSWORD = "admin1234";
  const AUTH_KEY = "retailorAdminSession";
  const storageKeys = {
    members: "retailorAdminMembers",
    products: "retailorAdminProducts",
    orders: "retailorAdminOrders",
    notices: "retailorAdminNotices",
    categories: "retailorAdminCategories",
    contacts: "retailorAdminContacts"
  };
  const seedData = {
    members: [
      { id: "M-24018", name: "佐藤 美咲", email: "misaki.sato@example.com", joined: "2026-09-14", status: "有効", listings: 3, orders: 5 },
      { id: "M-24017", name: "田中 悠", email: "yuu.tanaka@example.com", joined: "2026-09-12", status: "有効", listings: 1, orders: 2 },
      { id: "M-24016", name: "山本 葵", email: "aoi.yamamoto@example.com", joined: "2026-09-10", status: "確認中", listings: 0, orders: 0 },
      { id: "M-24015", name: "小林 直子", email: "naoko.k@example.com", joined: "2026-09-08", status: "有効", listings: 6, orders: 8 },
      { id: "M-24014", name: "伊藤 蓮", email: "ren.ito@example.com", joined: "2026-09-06", status: "停止中", listings: 0, orders: 1 }
    ],
    products: [
      { id: "P-08126", name: "ヴィンテージデニムジャケット", category: "アウター", type: "中古", seller: "old_closet", price: 8900, condition: "目立った傷や汚れなし", status: "販売中" },
      { id: "P-08125", name: "ハンドメイドニットセーター", category: "トップス", type: "ハンドメイド", seller: "atelier_mio", price: 5400, condition: "新品", status: "販売中" },
      { id: "P-08124", name: "コットンワンピース", category: "ワンピース", type: "中古", seller: "mori_fuku", price: 3200, condition: "目立った傷や汚れなし", status: "販売中" },
      { id: "P-08123", name: "リネンシャツ", category: "トップス", type: "中古", seller: "linen_days", price: 2800, condition: "やや傷や汚れあり", status: "審査中" },
      { id: "P-08122", name: "ハンドメイドポーチ", category: "その他", type: "ハンドメイド", seller: "ito_to_nuno", price: 1600, condition: "新品", status: "販売中" }
    ],
    orders: [
      { id: "RT-2026-0918", date: "2026-09-29 10:42", buyer: "佐藤 美咲", total: 8900, method: "クレジットカード", status: "発送待ち", product: "ヴィンテージデニムジャケット" },
      { id: "RT-2026-0917", date: "2026-09-29 09:18", buyer: "小林 直子", total: 5400, method: "コンビニ払い", status: "支払待ち", product: "ハンドメイドニットセーター" },
      { id: "RT-2026-0916", date: "2026-09-28 18:05", buyer: "伊藤 蓮", total: 3200, method: "クレジットカード", status: "取引完了", product: "コットンワンピース" },
      { id: "RT-2026-0915", date: "2026-09-28 15:31", buyer: "田中 悠", total: 2800, method: "PayPay", status: "発送済み", product: "リネンシャツ" }
    ],
    notices: [
      { id: "N-026", title: "秋の衣替えキャンペーンのお知らせ", created: "2026-09-25", published: "2026-10-01", status: "予約公開", body: "秋の衣替えキャンペーンを開催します。対象商品をご確認ください。" },
      { id: "N-025", title: "メンテナンス完了のお知らせ", created: "2026-09-18", published: "2026-09-18", status: "公開中", body: "システムメンテナンスが完了しました。通常どおりご利用いただけます。" },
      { id: "N-024", title: "配送方法の追加について", created: "2026-09-12", published: "2026-09-13", status: "公開中", body: "新しい配送方法を選択できるようになりました。" }
    ],
    categories: [
      { id: "C-01", name: "トップス" }, { id: "C-02", name: "アウター" },
      { id: "C-03", name: "ボトムス" }, { id: "C-04", name: "ワンピース" },
      { id: "C-05", name: "シューズ" }, { id: "C-06", name: "バッグ" },
      { id: "C-07", name: "アクセサリー" }, { id: "C-08", name: "その他" }
    ],
    contacts: []
  };
  const page = document.body.dataset.page;

  function load(collection) {
    const stored = localStorage.getItem(storageKeys[collection]);
    if (stored) {
      try { return JSON.parse(stored); } catch { localStorage.removeItem(storageKeys[collection]); }
    }
    localStorage.setItem(storageKeys[collection], JSON.stringify(seedData[collection]));
    return seedData[collection].map((item) => ({ ...item }));
  }

  function save(collection, records) {
    localStorage.setItem(storageKeys[collection], JSON.stringify(records));
  }

  function text(tag, value, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value ?? "";
    return element;
  }

  function link(label, href, className = "button button-secondary button-small") {
    const element = text("a", label, className);
    element.href = href;
    return element;
  }

  function cell(row, value, className) {
    row.append(text("td", value, className));
  }

  function statusCell(row, value) {
    const target = document.createElement("td");
    const status = text("span", value, `status${value === "停止中" || value === "審査中" || value === "支払待ち" || value === "未対応" ? " status-warn" : value === "取引完了" ? " status-muted" : ""}`);
    target.append(status);
    row.append(target);
  }

  function actionCell(row, actions) {
    const target = document.createElement("td");
    const group = text("div", "", "button-row");
    actions.forEach((action) => group.append(action));
    target.append(group);
    row.append(target);
  }

  function fillTable(selector, records, renderRow) {
    const body = document.querySelector(selector);
    if (!body) return;
    const labels = Array.from(body.closest("table").querySelectorAll("thead th"), (header) => header.textContent.trim());
    body.replaceChildren();
    if (!records.length) {
      const row = document.createElement("tr");
      const empty = text("td", "該当するデータはありません。", "empty-row");
      empty.colSpan = Number(body.dataset.columns || 1);
      row.append(empty);
      body.append(row);
      return;
    }
    records.forEach((record) => {
      const row = renderRow(record);
      row.querySelectorAll("td").forEach((item, index) => { item.dataset.label = labels[index] || ""; });
      body.append(row);
    });
  }

  function activateNavigation() {
    const section = page.startsWith("member") ? "members" : page.startsWith("product") ? "products" : page.startsWith("order") ? "orders" : page.startsWith("notice") ? "notices" : page.startsWith("category") ? "categories" : page.startsWith("contact") ? "contacts" : "dashboard";
    document.querySelectorAll("[data-admin-nav]").forEach((item) => {
      if (item.dataset.adminNav === section) item.setAttribute("aria-current", "page");
    });
    document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", () => {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = "login.html";
    }));
  }

  function setupLogin() {
    const form = document.getElementById("adminLoginForm");
    if (!form) return;
    if (localStorage.getItem(AUTH_KEY) === "true") {
      window.location.href = "dashboard.html";
      return;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const loginId = document.getElementById("loginId").value.trim();
      const password = document.getElementById("loginPassword").value;
      const error = document.getElementById("loginError");
      error.textContent = "";
      if (loginId !== ADMIN_ID || password !== ADMIN_PASSWORD) {
        error.textContent = "ログインIDまたはパスワードが正しくありません。";
        return;
      }
      localStorage.setItem(AUTH_KEY, "true");
      window.location.href = "dashboard.html";
    });
  }

  function guardAdminPages() {
    if (page !== "login" && localStorage.getItem(AUTH_KEY) !== "true") {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function renderDashboard() {
    const members = load("members");
    const products = load("products");
    const orders = load("orders");
    const counters = { members: members.length, products: products.length, orders: orders.length, contacts: load("contacts").length };
    Object.entries(counters).forEach(([key, value]) => {
      const target = document.querySelector(`[data-count="${key}"]`);
      if (target) target.textContent = value.toLocaleString("ja-JP");
    });
    fillTable("[data-table='recent-orders']", orders.slice(0, 4), (item) => {
      const row = document.createElement("tr");
      cell(row, item.id);
      cell(row, item.buyer);
      cell(row, `￥${Number(item.total).toLocaleString("ja-JP")}`);
      statusCell(row, item.status);
      actionCell(row, [link("詳細", `order-detail.html?id=${encodeURIComponent(item.id)}`)]);
      return row;
    });
    const recentProducts = document.querySelector("[data-recent-products]");
    if (recentProducts) {
      recentProducts.replaceChildren();
      products.slice(0, 4).forEach((item) => {
        const row = text("a", "", "recent-product");
        row.href = `product-detail.html?id=${encodeURIComponent(item.id)}`;
        row.append(text("span", item.category, "recent-product-category"), text("strong", item.name), text("span", `￥${Number(item.price).toLocaleString("ja-JP")}`, "recent-product-price"));
        recentProducts.append(row);
      });
    }
  }

  function renderMembers() {
    const allMembers = load("members");
    const search = document.querySelector("[data-search='members']");
    const render = () => {
      const query = (search?.value || "").trim().toLowerCase();
      const records = allMembers.filter((item) => `${item.id} ${item.name} ${item.email}`.toLowerCase().includes(query));
      fillTable("[data-table='members']", records, (item) => {
        const row = document.createElement("tr");
        cell(row, item.id);
        const name = document.createElement("td");
        name.append(text("a", item.name, "table-primary"));
        name.firstChild.href = `member-detail.html?id=${encodeURIComponent(item.id)}`;
        row.append(name);
        cell(row, item.email);
        cell(row, item.joined);
        statusCell(row, item.status);
        actionCell(row, [link("詳細", `member-detail.html?id=${encodeURIComponent(item.id)}`)]);
        return row;
      });
    };
    search?.addEventListener("input", render);
    render();
  }

  function renderProducts() {
    const products = load("products");
    const typeFilter = document.querySelector("[data-product-filter='type']");
    const statusFilter = document.querySelector("[data-product-filter='status']");
    const tableBody = document.querySelector("[data-table='products']");
    if (tableBody && !tableBody.dataset.deleteBound) {
      tableBody.dataset.deleteBound = "true";
      tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-product]");
        if (!button || !window.confirm("この商品を削除しますか？")) return;
        save("products", load("products").filter((item) => item.id !== button.dataset.deleteProduct));
        renderProducts();
      });
    }
    const render = () => fillTable("[data-table='products']", products.filter((item) =>
      (!typeFilter?.value || item.type === typeFilter.value) && (!statusFilter?.value || item.status === statusFilter.value)
    ), (item) => {
      const row = document.createElement("tr");
      cell(row, item.id);
      const image = document.createElement("td");
      const thumbnail = text("span", item.category.slice(0, 2), "product-thumb");
      thumbnail.setAttribute("role", "img");
      thumbnail.setAttribute("aria-label", `${item.name}の商品画像（仮表示）`);
      image.append(thumbnail);
      row.append(image);
      const name = document.createElement("td");
      name.append(text("a", item.name, "table-primary"));
      name.firstChild.href = `product-detail.html?id=${encodeURIComponent(item.id)}`;
      row.append(name);
      cell(row, item.category);
      cell(row, item.type);
      cell(row, item.seller);
      cell(row, `￥${Number(item.price).toLocaleString("ja-JP")}`);
      statusCell(row, item.status);
      actionCell(row, [
        link("詳細", `product-detail.html?id=${encodeURIComponent(item.id)}`),
        link("編集", `product-edit.html?id=${encodeURIComponent(item.id)}`),
        (() => { const button = text("button", "削除", "button button-danger button-small"); button.type = "button"; button.dataset.deleteProduct = item.id; return button; })()
      ]);
      return row;
    });
    if (typeFilter && !typeFilter.dataset.filterBound) {
      typeFilter.dataset.filterBound = "true";
      typeFilter.addEventListener("change", render);
    }
    if (statusFilter && !statusFilter.dataset.filterBound) {
      statusFilter.dataset.filterBound = "true";
      statusFilter.addEventListener("change", render);
    }
    render();
  }

  function renderOrders() {
    const orders = load("orders");
    const statusFilter = document.querySelector("[data-order-status]");
    const render = () => fillTable("[data-table='orders']", orders.filter((item) => !statusFilter?.value || item.status === statusFilter.value), (item) => {
      const row = document.createElement("tr");
      cell(row, item.id);
      cell(row, item.date);
      cell(row, item.buyer);
      cell(row, `￥${Number(item.total).toLocaleString("ja-JP")}`);
      cell(row, item.method);
      statusCell(row, item.status);
      actionCell(row, [link("詳細", `order-detail.html?id=${encodeURIComponent(item.id)}`)]);
      return row;
    });
    statusFilter?.addEventListener("change", render);
    render();
  }

  function renderNotices() {
    const tableBody = document.querySelector("[data-table='notices']");
    if (tableBody && !tableBody.dataset.deleteBound) {
      tableBody.dataset.deleteBound = "true";
      tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-notice]");
        if (!button || !window.confirm("このお知らせを削除しますか？")) return;
        save("notices", load("notices").filter((item) => item.id !== button.dataset.deleteNotice));
        renderNotices();
      });
    }
    fillTable("[data-table='notices']", load("notices"), (item) => {
      const row = document.createElement("tr");
      cell(row, item.title, "wrap-cell");
      cell(row, item.created);
      cell(row, item.published);
      statusCell(row, item.status);
      actionCell(row, [
        link("編集", `notice-edit.html?id=${encodeURIComponent(item.id)}`),
        (() => { const button = text("button", "削除", "button button-danger button-small"); button.type = "button"; button.dataset.deleteNotice = item.id; return button; })()
      ]);
      return row;
    });
  }

  function formatContactDate(value) {
    return value ? new Date(value).toLocaleString("ja-JP") : "-";
  }

  function renderContacts() {
    const contacts = load("contacts");
    const search = document.querySelector("[data-search='contacts']");
    const statusFilter = document.querySelector("[data-contact-status-filter]");
    const render = () => {
      const query = (search?.value || "").trim().toLowerCase();
      fillTable("[data-table='contacts']", contacts.filter((item) =>
        (!statusFilter?.value || item.status === statusFilter.value) &&
        `${item.id} ${item.name} ${item.email} ${item.reference || ""}`.toLowerCase().includes(query)
      ), (item) => {
        const row = document.createElement("tr");
        cell(row, item.id);
        cell(row, formatContactDate(item.received));
        const name = document.createElement("td");
        name.append(text("strong", item.name, "table-primary"), text("span", item.email, "table-secondary"));
        row.append(name);
        cell(row, item.category);
        cell(row, item.reference || "-", "wrap-cell");
        statusCell(row, item.status);
        actionCell(row, [link("詳細", `contact-detail.html?id=${encodeURIComponent(item.id)}`)]);
        return row;
      });
    };
    search?.addEventListener("input", render);
    statusFilter?.addEventListener("change", render);
    render();
  }

  function setupContactDetail() {
    const recordId = new URLSearchParams(window.location.search).get("id");
    const contacts = load("contacts");
    const record = contacts.find((item) => item.id === recordId);
    const missing = document.querySelector("[data-not-found]");
    const statusForm = document.getElementById("contactStatusForm");
    if (!record) {
      if (missing) missing.hidden = false;
      document.querySelectorAll("[data-record-content]").forEach((element) => { element.hidden = true; });
      return;
    }
    const fields = { id: "[data-field='id']", received: "[data-field='received']", name: "[data-field='name']", email: "[data-field='email']", category: "[data-field='category']", reference: "[data-field='reference']", message: "[data-field='message']", status: "[data-field='status']" };
    Object.entries(fields).forEach(([key, selector]) => {
      const target = document.querySelector(selector);
      if (target) target.textContent = key === "received" ? formatContactDate(record[key]) : record[key] || "-";
    });
    const statusSelect = statusForm?.elements.namedItem("status");
    if (statusSelect) statusSelect.value = record.status;
    document.querySelectorAll("[data-record-content]").forEach((element) => { element.hidden = false; });
    statusForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const updatedStatus = statusForm.elements.namedItem("status").value;
      save("contacts", contacts.map((item) => item.id === recordId ? { ...item, status: updatedStatus } : item));
      window.location.href = "contacts.html";
    });
  }

  function renderCategories() {
    fillTable("[data-table='categories']", load("categories"), (item) => {
      const row = document.createElement("tr");
      cell(row, item.id);
      cell(row, item.name);
      actionCell(row, [link("編集", `category-edit.html?id=${encodeURIComponent(item.id)}`)]);
      return row;
    });
  }

  function setDetails(collection, fields) {
    const recordId = new URLSearchParams(window.location.search).get("id");
    const record = load(collection).find((item) => item.id === recordId);
    const missing = document.querySelector("[data-not-found]");
    if (!record) {
      if (missing) missing.hidden = false;
      document.querySelectorAll("[data-record-content]").forEach((element) => { element.hidden = true; });
      return null;
    }
    Object.entries(fields).forEach(([key, selector]) => {
      const target = document.querySelector(selector);
      if (!target) return;
      const value = record[key] ?? "-";
      target.textContent = ["price", "total"].includes(key) ? `￥${Number(value).toLocaleString("ja-JP")}` : value;
    });
    document.querySelectorAll("[data-record-content]").forEach((element) => { element.hidden = false; });
    return record;
  }

  function setupProductEdit() {
    const form = document.getElementById("productEditForm");
    if (!form) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const products = load("products");
    const product = products.find((item) => item.id === id);
    if (!product) {
      document.querySelector("[data-not-found]").hidden = false;
      document.querySelector("[data-edit-panel]").hidden = true;
      return;
    }
    form.hidden = false;
    Object.entries(product).forEach(([key, value]) => {
      const input = form.elements.namedItem(key);
      if (input) input.value = value;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const updated = Object.fromEntries(new FormData(form).entries());
      updated.price = Number(updated.price) || 0;
      save("products", products.map((item) => item.id === id ? { ...item, ...updated } : item));
      window.location.href = `product-detail.html?id=${encodeURIComponent(id)}`;
    });
  }

  function setupNoticeEdit() {
    const form = document.getElementById("noticeEditForm");
    if (!form) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const notices = load("notices");
    const notice = notices.find((item) => item.id === id);
    if (id && !notice) {
      document.querySelector("[data-not-found]").hidden = false;
      document.querySelector("[data-edit-panel]").hidden = true;
      return;
    }
    if (notice) Object.entries(notice).forEach(([key, value]) => { if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value; });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      if (id && notices.some((item) => item.id === id)) save("notices", notices.map((item) => item.id === id ? { ...item, ...values } : item));
      else save("notices", [{ ...values, id: `N-${String(Date.now()).slice(-6)}`, created: new Date().toISOString().slice(0, 10) }, ...notices]);
      window.location.href = "notices.html";
    });
  }

  function setupCategoryEdit() {
    const form = document.getElementById("categoryEditForm");
    if (!form) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const categories = load("categories");
    const category = categories.find((item) => item.id === id);
    if (id && !category) {
      document.querySelector("[data-not-found]").hidden = false;
      document.querySelector("[data-edit-panel]").hidden = true;
      return;
    }
    if (category) {
      form.elements.namedItem("name").value = category.name;
      form.elements.namedItem("id").value = category.id;
    } else {
      const nextId = categories.reduce((max, item) => Math.max(max, Number(item.id.match(/\d+$/)?.[0]) || 0), 0) + 1;
      form.elements.namedItem("id").value = `C-${String(nextId).padStart(2, "0")}`;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      if (id && categories.some((item) => item.id === id)) save("categories", categories.map((item) => item.id === id ? values : item));
      else save("categories", [...categories, values]);
      window.location.href = "categories.html";
    });
  }

  if (page === "login") {
    setupLogin();
    return;
  }
  if (!guardAdminPages()) return;
  activateNavigation();
  if (page === "dashboard") renderDashboard();
  if (page === "members") renderMembers();
  if (page === "member-detail") setDetails("members", { id: "[data-field='id']", name: "[data-field='name']", email: "[data-field='email']", joined: "[data-field='joined']", status: "[data-field='status']", listings: "[data-field='listings']", orders: "[data-field='orders']" });
  if (page === "products") renderProducts();
  if (page === "product-detail") setDetails("products", { id: "[data-field='id']", name: "[data-field='name']", category: "[data-field='category']", type: "[data-field='type']", seller: "[data-field='seller']", price: "[data-field='price']", condition: "[data-field='condition']", status: "[data-field='status']" });
  if (page === "product-edit") setupProductEdit();
  if (page === "orders") renderOrders();
  if (page === "order-detail") setDetails("orders", { id: "[data-field='id']", date: "[data-field='date']", buyer: "[data-field='buyer']", total: "[data-field='total']", method: "[data-field='method']", status: "[data-field='status']", product: "[data-field='product']" });
  if (page === "notices") renderNotices();
  if (page === "notice-edit") setupNoticeEdit();
  if (page === "categories") renderCategories();
  if (page === "category-edit") setupCategoryEdit();
  if (page === "contacts") renderContacts();
  if (page === "contact-detail") setupContactDetail();
})();