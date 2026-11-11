const messages = document.getElementById("messages");
const choices = document.getElementById("choices");
const closet = JSON.parse(localStorage.getItem("reTailorMyCloset") || "[]");
const products = window.reTailorProducts || [];
const styles = ["かっこいい", "かわいい", "きれいめ", "カジュアル", "おまかせ"];

function addMessage(text, role = "assistant") {
  const row = document.createElement("article");
  row.className = `message ${role}`;
  if (role === "assistant") {
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "AI";
    row.append(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  bubble.append(paragraph);
  row.append(bubble);
  messages.append(row);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function showChoices(labels, handler, bubble = addMessage("選んでください。")) {
  const group = document.createElement("div");
  group.className = "choices";
  labels.forEach((label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = label;
    button.addEventListener("click", () => {
      group.remove();
      addMessage(label, "user");
      handler(label);
    });
    group.append(button);
  });
  bubble.append(group);
}

function addProduct(bubble, product) {
  const link = document.createElement("a");
  link.className = "recommendation";
  link.href = `detail.html?id=${product.id}`;
  const image = document.createElement("span");
  image.className = "recommendation-image";
  image.textContent = product.category;
  const info = document.createElement("span");
  const name = document.createElement("strong");
  name.textContent = product.name;
  const price = document.createElement("span");
  price.textContent = `￥${Number(product.price).toLocaleString()}`;
  info.append(name, price);
  link.append(image, info);
  bubble.append(link);
}

function showRecommendations(text, ids) {
  const bubble = addMessage(text);
  ids.map((id) => products.find((product) => product.id === id)).filter(Boolean).forEach((product) => addProduct(bubble, product));
}

function startRequest(topic) {
  choices.replaceChildren();
  if (topic === "コーデを考えてほしい") {
    showChoices(styles, (style) => showOutfit(style), addMessage("どんな雰囲気のコーデにしましょう？"));
  } else if (topic === "商品をおすすめしてほしい") {
    showChoices(["トップス", "アウター", "小物", "おまかせ"], (category) => {
      const categoryIds = { "トップス": [1, 2], "アウター": [3, 7], "小物": [4, 5], "おまかせ": [1, 3] };
      showRecommendations(`${category}から選びました。気になる商品を開いて詳細を確認できます。`, categoryIds[category]);
    }, addMessage("探したいアイテムを選んでください。"));
  } else if (topic === "手持ちの服に合う服を探したい") {
    const garment = closet[0];
    const note = garment ? `「${garment.name}」${garment.color ? `（${garment.color}）` : ""}に合わせるアイテムを探します。` : "クローゼットに登録された服がまだありません。サンプルの白シャツに合わせる提案を表示します。";
    showRecommendations(`${note}色を合わせやすいアイテムはこちらです。`, [1, 4]);
    if (!garment) {
      const link = document.createElement("a");
      link.className = "inline-link";
      link.href = "my-closet-register.html";
      link.textContent = "マイクローゼットに服を登録する →";
      messages.lastElementChild.querySelector(".bubble").append(link);
    }
  } else {
    showChoices(["サイズ選び", "お手入れ方法", "自由に入力する"], (choice) => {
      if (choice === "自由に入力する") document.getElementById("messageInput").focus();
      else addMessage(`${choice}ですね。商品ページのサイズ・素材情報を確認しながら、ぴったりの選び方をご案内します。相談したい商品名や気になる点も入力できます。`);
    }, addMessage("どんなことを相談しますか？"));
  }
}

function showOutfit(style) {
  const mood = style === "おまかせ" ? "バランスのよいカジュアル" : style;
  const closetNote = closet.length ? `マイクローゼットの「${closet.slice(0, 2).map((item) => item.name).join("」「")}」を取り入れました。` : "クローゼットは未登録のため、着回しやすい定番アイテムを中心にしています。";
  const bubble = addMessage(`${mood}なコーデをご提案します。今日は「18℃・くもり」の想定で組みました。${closetNote}薄手の羽織りがあると安心です。※天気・気温はデモ用の想定値です。`);
  [3, 6].map((id) => products.find((product) => product.id === id)).filter(Boolean).forEach((product) => addProduct(bubble, product));
}

document.getElementById("composer").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  const bubble = addMessage("相談ありがとうございます。好みや行き先、予算などを教えていただければ、アイテム選びのヒントをお返しします。こちらはデモ回答です。");
  showChoices(["コーデを考えてほしい", "商品をおすすめしてほしい"], startRequest, bubble);
});

document.getElementById("resetChat").addEventListener("click", () => {
  messages.replaceChildren();
  const bubble = addMessage("こんにちは！今日はどんな服選びをお手伝いしましょう？");
  showChoices(["コーデを考えてほしい", "商品をおすすめしてほしい", "手持ちの服に合う服を探したい", "その他の相談"], startRequest, bubble);
  document.getElementById("messageInput").value = "";
});

showChoices(["コーデを考えてほしい", "商品をおすすめしてほしい", "手持ちの服に合う服を探したい", "その他の相談"], startRequest, messages.querySelector(".bubble"));