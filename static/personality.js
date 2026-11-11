const questions = [
  { text:"休日に選びたい過ごし方は？", choices:["街を歩いて新しい店を探す","自然の中でゆっくり過ごす","友だちと予定を詰めて遊ぶ","家で好きなことに没頭する"] },
  { text:"服を選ぶとき、いちばん大切なのは？", choices:["シルエットや形","着心地や素材","色や柄の組み合わせ","長く使えること"] },
  { text:"あなたが惹かれる色は？", choices:["白・黒などのベーシック","カーキ・ブラウンなどの自然色","赤・青などの鮮やかな色","くすみカラーや淡い色"] },
  { text:"周りからよく言われる印象は？", choices:["落ち着いている","やさしくて親しみやすい","明るくて個性的","こだわりが強い"] },
  { text:"理想のコーディネートは？", choices:["すっきり洗練されたコーデ","リラックスできるコーデ","気分が上がる遊び心のあるコーデ","自分だけの物語があるコーデ"] }
];
const results = [
  { name:"ストリート × Y2K 系", lead:"ベーシックの中に、今っぽい強さを楽しめるあなた。", mood:"シャープで都会的", tip:"シルエットで個性を出す" },
  { name:"ナチュラル × クラフト系", lead:"素材の表情や、ものの温度を大切にするあなた。", mood:"穏やかで心地よい", tip:"素材感を組み合わせる" },
  { name:"ポップ × カラフル系", lead:"色と遊び心で、毎日の気分を自分らしく彩るあなた。", mood:"明るくエネルギッシュ", tip:"主役の色を一つ決める" },
  { name:"ヴィンテージ × ミックス系", lead:"新旧を自由に組み合わせて、自分のスタイルを作るあなた。", mood:"個性的で奥行きがある", tip:"お気に入りを長く育てる" }
];
let current = 0; const answers = []; const $ = (id) => document.getElementById(id);
function renderQuestion() {
  const question = questions[current];
  $("progressText").textContent = `${current + 1} / ${questions.length}`;
  $("progressBar").style.width = `${((current + 1) / questions.length) * 100}%`;
  $("questionText").textContent = question.text;
  $("choices").innerHTML = question.choices.map((choice,index) => `<div class="choice"><input id="choice${index}" name="answer" type="radio" value="${index}" ${answers[current] === index ? "checked" : ""}><label for="choice${index}">${choice}</label></div>`).join("");
  $("backButton").hidden = current === 0; $("nextButton").textContent = current === questions.length - 1 ? "結果を見る" : "次へ"; $("quizError").textContent = "";
}
function showResult() {
  const counts = [0,0,0,0]; answers.forEach((answer) => counts[answer]++);
  const result = results[counts.indexOf(Math.max(...counts))];
  $("resultName").textContent = result.name; $("resultLead").textContent = result.lead; $("resultMood").textContent = result.mood; $("resultTip").textContent = result.tip;
  $("quiz").hidden = true; $("result").hidden = false;
}
$("startButton").addEventListener("click", () => { $("intro").hidden = true; $("quiz").hidden = false; renderQuestion(); });
$("quiz").addEventListener("submit", (event) => {
  event.preventDefault(); const selected = document.querySelector("input[name=answer]:checked");
  if (!selected) { $("quizError").textContent = "回答を1つ選択してください。"; return; }
  answers[current] = Number(selected.value); if (current === questions.length - 1) showResult(); else { current++; renderQuestion(); }
});
$("backButton").addEventListener("click", () => { current--; renderQuestion(); });
$("resetButton").addEventListener("click", () => { current = 0; answers.length = 0; $("result").hidden = true; $("quiz").hidden = false; renderQuestion(); });