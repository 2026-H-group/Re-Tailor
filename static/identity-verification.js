(function () {
  const mockAuthUser = {
    id: "mock-user-001",
    email: "user@example.com",
    email_confirmed_at: null,
  };
  const mockProfile = {
    is_email_verified: false,
    identity_status: "not_submitted",
  };
  const storageKeys = {
    emailVerified: "retailor.auth.emailVerified",
    identityStatus: "retailor.profile.identityStatus",
  };
  const identityStatuses = {
    not_submitted: { label: "未提出", description: "運転免許証、マイナンバーカードなどの画像を提出してください。" },
    pending: { label: "審査中", description: "身分証明書を受け付けました。審査結果をお待ちください。" },
    verified: { label: "確認済み", description: "本人確認が完了しました。ご利用ありがとうございます。" },
  };
  const maxFileSize = 10 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const els = {
    email: document.getElementById("accountEmail"),
    emailBadge: document.getElementById("emailBadge"),
    emailDescription: document.getElementById("emailDescription"),
    resendButton: document.getElementById("resendButton"),
    identityBadge: document.getElementById("identityBadge"),
    identityDescription: document.getElementById("identityDescription"),
    form: document.getElementById("identityForm"),
    file: document.getElementById("identityFile"),
    dropZone: document.getElementById("dropZone"),
    fileName: document.getElementById("fileName"),
    fileError: document.getElementById("fileError"),
    submitButton: document.getElementById("submitButton"),
    complete: document.getElementById("submissionComplete"),
    toast: document.getElementById("toast"),
    emailControl: document.getElementById("mockEmailStatus"),
    identityControl: document.getElementById("mockIdentityStatus"),
  };
  let selectedFile = null;
  let toastTimer = 0;

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 3200);
  }

  function setEmailVerified(verified) {
    mockAuthUser.email_confirmed_at = verified ? new Date().toISOString() : null;
    mockProfile.is_email_verified = verified;
    els.emailBadge.textContent = verified ? "認証済み（Verified）" : "未認証（Unverified）";
    els.emailBadge.dataset.status = verified ? "verified" : "unverified";
    els.emailDescription.textContent = verified
      ? "メールアドレスの認証が完了しています。"
      : "確認メールのリンクを開いて、メールアドレスの認証を完了してください。";
    els.resendButton.hidden = verified;
    els.emailControl.value = verified ? "verified" : "unverified";
    window.localStorage.setItem(storageKeys.emailVerified, String(verified));
  }

  function setIdentityStatus(status) {
    if (!Object.hasOwn(identityStatuses, status)) return;
    mockProfile.identity_status = status;
    const content = identityStatuses[status];
    els.identityBadge.textContent = content.label;
    els.identityBadge.dataset.status = status;
    els.identityDescription.textContent = content.description;
    els.form.hidden = status !== "not_submitted";
    els.complete.hidden = status === "not_submitted";
    els.identityControl.value = status;
    window.localStorage.setItem(storageKeys.identityStatus, status);
  }

  function validateFile(file) {
    if (!allowedTypes.includes(file.type)) return "JPEG、PNG、WebP形式の画像を選択してください。";
    if (file.size > maxFileSize) return "ファイルサイズは10MB以下にしてください。";
    return "";
  }

  function chooseFile(file) {
    els.fileError.textContent = "";
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      selectedFile = null;
      els.file.value = "";
      els.fileName.textContent = "ファイルは選択されていません";
      els.submitButton.disabled = true;
      els.fileError.textContent = error;
      return;
    }
    selectedFile = file;
    els.fileName.textContent = `${file.name}（${(file.size / 1024 / 1024).toFixed(1)}MB）`;
    els.submitButton.disabled = false;
  }

  async function resendVerificationEmail() {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    return { error: null };
  }

  async function getUser() {
    return { data: { user: mockAuthUser }, error: null };
  }

  async function submitIdentityDocument(file) {
    const error = validateFile(file);
    if (error) throw new Error(error);
    await new Promise((resolve) => window.setTimeout(resolve, 550));
    return { bucket: "identity-docs", status: "pending" };
  }

  const savedEmailVerified = window.localStorage.getItem(storageKeys.emailVerified);
  const savedIdentityStatus = window.localStorage.getItem(storageKeys.identityStatus);
  if (savedEmailVerified === "true") mockAuthUser.email_confirmed_at = new Date().toISOString();
  if (savedIdentityStatus && Object.hasOwn(identityStatuses, savedIdentityStatus)) {
    mockProfile.identity_status = savedIdentityStatus;
  }
  void getUser().then((result) => {
    if (result.error || !result.data.user) return;
    els.email.textContent = result.data.user.email;
    setEmailVerified(result.data.user.email_confirmed_at !== null);
  });
  setIdentityStatus(mockProfile.identity_status);

  els.resendButton.addEventListener("click", async () => {
    els.resendButton.disabled = true;
    try {
      const result = await resendVerificationEmail();
      if (result.error) throw result.error;
      showToast("確認メールを送信しました。受信トレイをご確認ください。");
    } catch (error) {
      showToast("確認メールを送信できませんでした。時間をおいて再度お試しください。");
      console.error("Mock confirmation email failed", error);
    } finally {
      els.resendButton.disabled = false;
    }
  });

  els.file.addEventListener("change", () => chooseFile(els.file.files && els.file.files[0]));
  ["dragenter", "dragover"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.add("is-dragging");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.remove("is-dragging");
    });
  });
  els.dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer && event.dataTransfer.files[0];
    chooseFile(file);
  });

  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      els.fileError.textContent = "提出する画像を選択してください。";
      els.file.focus();
      return;
    }
    els.submitButton.disabled = true;
    els.submitButton.firstChild.textContent = "送信しています…";
    try {
      const result = await submitIdentityDocument(selectedFile);
      setIdentityStatus(result.status);
      els.complete.focus();
    } catch (error) {
      els.fileError.textContent = error instanceof Error ? error.message : "送信できませんでした。もう一度お試しください。";
      els.submitButton.disabled = false;
    } finally {
      if (mockProfile.identity_status === "not_submitted") {
        els.submitButton.firstChild.textContent = "身分証明書を送信する";
      }
    }
  });

  els.emailControl.addEventListener("change", () => setEmailVerified(els.emailControl.value === "verified"));
  els.identityControl.addEventListener("change", () => setIdentityStatus(els.identityControl.value));
})();