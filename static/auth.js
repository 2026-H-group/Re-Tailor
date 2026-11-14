const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (loginForm) loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("loginError");
  error.textContent = "";
  if (!email || !email.includes("@")) { error.textContent = "メールアドレスを正しく入力してください。"; return; }
  if (!password) { error.textContent = "パスワードを入力してください。"; return; }
  localStorage.setItem("reTailorLoggedIn", "true");
  location.href = "top-index.html";
});

const signupFieldIds = [
  "lastName",
  "firstName",
  "lastNameKana",
  "firstNameKana",
  "username",
  "gender",
  "birthDate",
  "email",
  "password",
  "password_confirm",
  "postalCode",
  "address",
  "phone",
];

const getSignupFieldErrors = () => {
  const errors = {};
  const values = {};
  signupFieldIds.forEach((id) => {
    const value = document.getElementById(id).value;
    values[id] = id === "password" || id === "password_confirm" || id === "phone" ? value : value.trim();
  });

  if (!values.lastName) errors.lastName = "姓を入力してください。";
  if (!values.firstName) errors.firstName = "名を入力してください。";
  if (!values.lastNameKana || !/^[ぁ-んァ-ンー\s]+$/.test(values.lastNameKana)) {
    errors.lastNameKana = "せいはひらがなまたはカタカナで入力してください。";
  }
  if (!values.firstNameKana || !/^[ぁ-んァ-ンー\s]+$/.test(values.firstNameKana)) {
    errors.firstNameKana = "めいはひらがなまたはカタカナで入力してください。";
  }
  if (!/^[A-Za-z0-9_.-]{3,20}$/.test(values.username)) {
    errors.username = "ユーザー名は3〜20文字の半角英数字、_、.、-で入力してください。";
  }
  if (!values.gender) errors.gender = "性別を選択してください。";
  if (!values.birthDate) errors.birthDate = "生年月日を入力してください。";

  const emailInput = document.getElementById("email");
  if (!values.email || !emailInput.validity.valid) {
    errors.email = "有効なメールアドレスを入力してください。";
  }

  if (!values.password) {
    errors.password = "パスワードを入力してください。";
  } else if (!/^(?=.*[A-Z])[A-Za-z0-9]{8,}$/.test(values.password)) {
    errors.password = "英大文字を1文字以上含む、8文字以上の半角英数字で入力してください。";
  }
  if (!values.password_confirm) {
    errors.password_confirm = "確認用パスワードを入力してください。";
  } else if (values.password !== values.password_confirm) {
    errors.password_confirm = "パスワードが一致しません。";
  }

  if (values.postalCode && !/^\d{3}-?\d{4}$/.test(values.postalCode)) {
    errors.postalCode = "郵便番号は7桁の数字で入力してください。";
  }
  if (!/^\d{10,11}$/.test(values.phone)) {
    errors.phone = "電話番号はハイフンを入れず、10〜11桁の数字で入力してください。";
  }
  return errors;
};

const renderSignupFieldError = (id, message) => {
  const input = document.getElementById(id);
  const error = signupForm.querySelector(`[data-field-error="${id}"]`);
  error.textContent = message || "";

  if (message) {
    input.setAttribute("aria-invalid", "true");
    const describedBy = new Set((input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    describedBy.add(error.id);
    input.setAttribute("aria-describedby", [...describedBy].join(" "));
  } else {
    input.removeAttribute("aria-invalid");
    const describedBy = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter((value) => value && value !== error.id);
    if (describedBy.length) input.setAttribute("aria-describedby", describedBy.join(" "));
    else input.removeAttribute("aria-describedby");
  }
};

if (signupForm) signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors = getSignupFieldErrors();
  signupFieldIds.forEach((id) => renderSignupFieldError(id, errors[id]));
  const firstInvalidField = signupFieldIds.find((id) => errors[id]);
  if (firstInvalidField) {
    document.getElementById(firstInvalidField).focus();
    return;
  }

  const lastName = document.getElementById("lastName").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const lastNameKana = document.getElementById("lastNameKana").value.trim();
  const firstNameKana = document.getElementById("firstNameKana").value.trim();
  const username = document.getElementById("username").value.trim();
  const gender = document.getElementById("gender").value;
  const birthDate = document.getElementById("birthDate").value;
  const email = document.getElementById("email").value.trim();
  const postalCode = document.getElementById("postalCode").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const cleanPostalCode = postalCode.replace("-", "");

  localStorage.setItem("reTailorLoggedIn", "true");
  const joined = new Date().toISOString().slice(0, 7);
  const fullName = `${lastName} ${firstName}`;
  const profile = {
    name: fullName,
    lastName,
    firstName,
    lastNameKana,
    firstNameKana,
    username,
    gender,
    birthDate,
    email,
    joined,
    recipientName: fullName,
    postalCode: cleanPostalCode.replace(/(\d{3})(\d{4})/, '$1-$2'),
    address,
    phone,
  };
  localStorage.setItem("reTailorProfile", JSON.stringify(profile));
  localStorage.setItem("retailor.user-profile.v1", JSON.stringify({
    lastName,
    firstName,
    lastNameKana,
    firstNameKana,
    username,
    gender,
    birthDate,
    recipientName: fullName,
    postalCode: profile.postalCode,
    address,
    phone: profile.phone,
    email,
    hasPassword: true,
    paymentMethod: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  signupForm.hidden = true;
  document.querySelector(".login").hidden = true;
  document.getElementById("signupComplete").hidden = false;
  document.getElementById("signupCompleteTitle").focus();
});

if (signupForm) {
  const validateField = (id) => {
    const errors = getSignupFieldErrors();
    renderSignupFieldError(id, errors[id]);
    if (id === "password" && document.getElementById("password_confirm").getAttribute("aria-invalid") === "true") {
      renderSignupFieldError("password_confirm", errors.password_confirm);
    }
  };

  signupFieldIds.forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("input", () => {
      validateField(id);
    });
    field.addEventListener("change", () => {
      validateField(id);
    });
    field.addEventListener("blur", () => {
      validateField(id);
    });
  });

  signupForm.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.getAttribute("aria-controls"));
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.textContent = showPassword ? "非表示" : "表示";
      button.setAttribute("aria-label", `${input.id === "password" ? "パスワード" : "確認用パスワード"}を${showPassword ? "非表示" : "表示"}`);
    });
  });
}

if (forgotPasswordForm) forgotPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.getElementById("forgotEmail");
  const message = document.getElementById("forgotPasswordMessage");
  const email = emailInput.value.trim();
  message.textContent = "";
  message.classList.remove("error");

  if (!email || !emailInput.validity.valid) {
    message.textContent = "メールアドレスを正しく入力してください。";
    message.classList.add("error");
    return;
  }

  message.textContent = "再設定用メール送信機能は現在準備中です。";
});
