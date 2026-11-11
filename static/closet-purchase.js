(() => {
  const storageKey = "reTailorMyCloset";
  const categoryKeys = {
    tops: "tops",
    outwear: "outer",
    bottom: "bottoms",
    shoes: "shoes",
    bag: "accessories",
    accessories: "accessories",
  };
  const categoryLabels = {
    tops: "トップス",
    outwear: "アウター",
    bottom: "ボトムス",
    shoes: "靴",
    bag: "アクセサリー",
    accessories: "アクセサリー",
  };

  function getItems() {
    const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(items)) throw new Error("マイクローゼットのデータ形式が正しくありません。");
    return items;
  }

  function isRegistered(order, product) {
    return getItems().some((item) =>
      String(item.purchaseOrderId) === String(order.id)
      && Number(item.purchaseProductId) === Number(product.id)
    );
  }

  function addItems(order, products) {
    const items = getItems();
    const added = [];
    products.forEach((product, index) => {
      const alreadyAdded = items.some((item) =>
        String(item.purchaseOrderId) === String(order.id)
        && Number(item.purchaseProductId) === Number(product.id)
      );
      if (alreadyAdded) return;
      const key = product.categoryKey || ({
        "トップス": "tops",
        "アウター": "outwear",
        "ボトムス": "bottom",
        "靴": "shoes",
        "シューズ": "shoes",
        "バッグ": "bag",
        "アクセサリー": "accessories",
      })[product.category];
      items.push({
        ...product,
        id: Date.now() + index,
        category: categoryKeys[key] || "accessories",
        categoryLabel: categoryLabels[key] || product.category || "アクセサリー",
        image: "",
        purchaseOrderId: order.id,
        purchaseProductId: product.id,
      });
      added.push(product);
    });
    localStorage.setItem(storageKey, JSON.stringify(items));
    return added;
  }

  window.reTailorClosetPurchases = { getItems, isRegistered, addItems };
})();
