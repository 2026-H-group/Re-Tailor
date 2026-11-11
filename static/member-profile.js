(function () {
  const api = window.RetailorApi;
  const els = {
    view: document.getElementById("viewMode"),
    edit: document.getElementById("editMode"),
    startEdit: document.getElementById("startEdit"),
    cancelEdit: document.getElementById("cancelEdit"),
    save: document.getElementById("saveButton"),
    toast: document.getElementById("toast"),
    dialog: document.getElementById("emailDialog"),
    dialogEmail: document.getElementById("dialogEmail"),
    confirmEmail: document.getElementById("confirmEmail"),
    cancelEmail: document.getElementById("cancelEmail"),
    portal: document.getElementById("changePayment"),
  };

  const inputs = {
    lastName: document.getElementById("lastName"),
    firstName: document.getElementById("firstName"),
    lastNameKana: document.getElementById("lastNameKana"),
    firstNameKana: document.getElementById("firstNameKana"),
    username: document.getElementById("username"),
    recipientName: document.getElementById("recipientName"),
    postalCode: document.getElementById("postalCode"),
    address: document.getElementById("address"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
  };

  let profile = null;
  let isEditing = false;
  let toastTimer = 0;

  function showToast(message, tone) {
    els.toast.textContent = message;
    els.toast.className = `toast ${tone}`;
    els.toast.classList.remove("hidden");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.add("hidden"), 2600);
  }

  function setEditing(next) {
    isEditing = next;
    els.view.classList.toggle("hidden", next);
    els.edit.classList.toggle("hidden", !next);
    els.startEdit.classList.toggle("hidden", next);
    els.cancelEdit.classList.toggle("hidden", !next);
  }

  function fillView(data) {
    document.getElementById("viewName").textContent = `${data.lastName} ${data.firstName}`;
    document.getElementById("viewKana").textContent = `${data.lastNameKana} ${data.firstNameKana}`;
    document.getElementById("viewUsername").textContent = api.formatUsername(data.username);
    document.getElementById("viewGender").textContent = api.GENDER_LABELS[data.gender];
    document.getElementById("viewBirth").textContent = api.formatBirthDateJa(data.birthDate);
    document.getElementById("viewRecipient").textContent = data.recipientName;
    document.getElementById("viewPostal").textContent = `〒${data.postalCode}`;
    document.getElementById("viewAddress").textContent = data.address;
    document.getElementById("viewPhone").textContent = api.formatPhoneDisplay(data.phone);
    document.getElementById("viewEmail").textContent = api.formatEmailDisplay(data.email);
    document.getElementById("viewPayment").textContent = api.formatPaymentMethod(data.paymentMethod);
    document.getElementById("editGenderNote").textContent = `${api.GENDER_LABELS[data.gender]}（変更不可）`;
    document.getElementById("editBirthNote").textContent = `${api.formatBirthDateJa(data.birthDate)}（変更不可）`;
  }

  function fillForm(data) {
    inputs.lastName.value = data.lastName;
    inputs.firstName.value = data.firstName;
    inputs.lastNameKana.value = data.lastNameKana;
    inputs.firstNameKana.value = data.firstNameKana;
    inputs.username.value = api.formatUsername(data.username);
    inputs.recipientName.value = data.recipientName;
    inputs.postalCode.value = data.postalCode;
    inputs.address.value = data.address;
    inputs.phone.value = data.phone;
    inputs.email.value = data.email;
  }

  function readForm() {
    return {
      lastName: inputs.lastName.value,
      firstName: inputs.firstName.value,
      lastNameKana: inputs.lastNameKana.value,
      firstNameKana: inputs.firstNameKana.value,
      username: inputs.username.value,
      recipientName: inputs.recipientName.value,
      postalCode: inputs.postalCode.value,
      address: inputs.address.value,
      phone: inputs.phone.value,
      email: inputs.email.value,
    };
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
    document.querySelectorAll(".control").forEach((el) => el.classList.remove("is-invalid"));
  }

  function setError(id, message) {
    const input = document.getElementById(id);
    const error = document.getElementById(`${id}Error`);
    if (input) input.classList.add("is-invalid");
    if (error) error.textContent = message;
  }

  function validate(form) {
    clearErrors();
    const kana = /^[ぁ-んァ-ンー\s]+$/;
    const name = /^[ぁ-んァ-ン一-龯ー\s]+$/;
    let ok = true;

    if (!form.lastName || !name.test(form.lastName)) {
      setError("lastName", "姓を日本語で入力してください。");
      ok = false;
    }
    if (!form.firstName || !name.test(form.firstName)) {
      setError("firstName", "名を日本語で入力してください。");
      ok = false;
    }
    if (!form.lastNameKana || !kana.test(form.lastNameKana)) {
      setError("lastNameKana", "せいはひらがなまたはカタカナで入力してください。");
      ok = false;
    }
    if (!form.firstNameKana || !kana.test(form.firstNameKana)) {
      setError("firstNameKana", "めいはひらがなまたはカタカナで入力してください。");
      ok = false;
    }
    const username = form.username.replace(/^@/, "");
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(username)) {
      setError("username", "3〜20文字の英数字・_・.・-で入力してください。");
      ok = false;
    }
    if (!form.recipientName) {
      setError("recipientName", "宛名を入力してください。");
      ok = false;
    }
    if (!/^\d{7}$/.test(form.postalCode.replace(/\D/g, ""))) {
      setError("postalCode", "郵便番号は7桁で入力してください。");
      ok = false;
    }
    if (form.address.trim().length < 8) {
      setError("address", "住所は8文字以上で入力してください。");
      ok = false;
    }
    if (!/^\d{10,11}$/.test(form.phone.replace(/\D/g, ""))) {
      setError("phone", "電話番号は10〜11桁の数字で入力してください。");
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("email", "メールアドレスの形式が正しくありません。");
      ok = false;
    }
    return ok;
  }

  async function persist(form) {
    els.save.disabled = true;
    const result = await api.updateUserProfile(form);
    els.save.disabled = false;
    if (result.error) {
      showToast(result.error.message, "error");
      return;
    }
    profile = result.data;
    fillView(profile);
    fillForm(profile);
    setEditing(false);
    els.dialog.classList.add("hidden");
    showToast("登録内容を保存しました。", "success");
  }

  async function handleSave() {
    if (!isEditing) {
      setEditing(true);
      fillForm(profile);
    }
    const form = readForm();
    if (!validate(form)) {
      showToast("入力内容を確認してください。", "error");
      return;
    }
    if (form.email !== profile.email) {
      els.dialogEmail.textContent = form.email;
      els.dialog.classList.remove("hidden");
      return;
    }
    await persist(form);
  }

  els.startEdit.addEventListener("click", () => {
    fillForm(profile);
    setEditing(true);
  });

  els.cancelEdit.addEventListener("click", () => {
    fillForm(profile);
    clearErrors();
    setEditing(false);
  });

  els.save.addEventListener("click", () => {
    void handleSave();
  });

  els.cancelEmail.addEventListener("click", () => {
    els.dialog.classList.add("hidden");
  });

  els.confirmEmail.addEventListener("click", () => {
    void persist(readForm());
  });

  inputs.postalCode.addEventListener("input", (event) => {
    event.target.value = api.formatPostalCode(event.target.value);
  });

  els.portal.addEventListener("click", async () => {
    els.portal.disabled = true;
    const result = await api.createStripePortalSession();
    els.portal.disabled = false;
    if (result.error) {
      showToast(result.error.message, "error");
      return;
    }
    showToast("決済ポータルへ移動します。（モック）", "success");
    window.location.href = result.data.url;
  });

  api.fetchUserProfile().then((result) => {
    profile = result.data;
    fillView(profile);
    fillForm(profile);
  });
})();
