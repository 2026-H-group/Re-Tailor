const api = window.RetailorApi;
const form = document.getElementById("paymentForm");
const brandInput = document.getElementById("cardBrand");
const last4Input = document.getElementById("cardLast4");
const monthInput = document.getElementById("expMonth");
const yearInput = document.getElementById("expYear");
const saveButton = document.getElementById("savePayment");
const status = document.getElementById("paymentStatus");
const currentPayment = document.getElementById("currentPayment");
const currentYear = new Date().getFullYear();
yearInput.min = currentYear;
yearInput.max = currentYear + 25;

function showPaymentMethod(method) {
  if (!method) {
    currentPayment.textContent = "登録されていません";
    return;
  }
  currentPayment.textContent = `${api.formatPaymentMethod(method)}（有効期限 ${String(method.expMonth).padStart(2, "0")}/${method.expYear}）`;
  brandInput.value = method.brand;
  last4Input.value = method.last4;
  monthInput.value = method.expMonth;
  yearInput.value = method.expYear;
}

api.fetchUserProfile().then((result) => {
  showPaymentMethod(result.data.paymentMethod);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";
  saveButton.disabled = true;
  const result = await api.updatePaymentMethod({
    brand: brandInput.value,
    last4: last4Input.value.trim(),
    expMonth: monthInput.value,
    expYear: yearInput.value,
  });
  saveButton.disabled = false;
  if (result.error) {
    status.textContent = result.error.message;
    status.classList.add("error");
    return;
  }
  status.classList.remove("error");
  showPaymentMethod(result.data.paymentMethod);
  status.textContent = "お支払い方法を更新しました。";
});
