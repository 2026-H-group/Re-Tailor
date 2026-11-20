const STORAGE_KEY = "retailor.user-profile.v1";

const mockUser = {
  id: "usr_mock_yamada_taro",
  lastName: "山田",
  firstName: "太郎",
  lastNameKana: "やまだ",
  firstNameKana: "たろう",
  username: "yamada_taro",
  gender: "male",
  birthDate: "1990-08-15",
  recipientName: "山田 太郎",
  postalCode: "100-0005",
  address: "東京都千代田区丸の内1-1-1",
  phone: "09012345678",
  email: "yamada.taro@example.com",
  hasPassword: true,
  paymentMethod: {
    id: "pm_mock_visa_4321",
    brand: "visa",
    last4: "4321",
    expMonth: 12,
    expYear: 2028,
    stripeCustomerId: "cus_mock_yamada",
    stripePaymentMethodId: "pm_mock_visa_4321",
  },
  createdAt: "2024-04-01T09:00:00.000Z",
  updatedAt: "2026-09-11T06:29:00.000Z",
};

const GENDER_LABELS = {
  male: "男性",
  female: "女性",
  other: "その他",
  unspecified: "回答しない",
};

const PAYMENT_BRAND_LABELS = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "American Express",
  jcb: "JCB",
  diners: "Diners Club",
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneProfile(profile) {
  return {
    ...profile,
    paymentMethod: profile.paymentMethod ? { ...profile.paymentMethod } : null,
  };
}

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneProfile(mockUser);
    return { ...cloneProfile(mockUser), ...JSON.parse(raw) };
  } catch {
    return cloneProfile(mockUser);
  }
}

function writeStoredProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function formatPostalCode(raw) {
  const digits = String(raw).replace(/\D/g, "").slice(0, 7);
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function formatUsername(username) {
  const trimmed = String(username).trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function formatBirthDateJa(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
}

function formatPhoneDisplay(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-****-${digits.slice(7)}`;
  return phone;
}

function formatEmailDisplay(email) {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  return `${email.slice(0, 2)}****${email.slice(at)}`;
}

function formatPaymentMethod(method) {
  if (!method) return "未登録";
  return `クレジットカード (${PAYMENT_BRAND_LABELS[method.brand] || method.brand}末尾${method.last4})`;
}

async function fetchUserProfile() {
  await wait(220);
  return { data: readStoredProfile(), error: null };
}

async function updateUserProfile(input) {
  await wait(220);
  const current = readStoredProfile();
  const next = {
    ...current,
    lastName: input.lastName.trim(),
    firstName: input.firstName.trim(),
    lastNameKana: input.lastNameKana.trim(),
    firstNameKana: input.firstNameKana.trim(),
    username: formatUsername(input.username).replace(/^@/, ""),
    recipientName: input.recipientName.trim(),
    postalCode: input.postalCode.trim() ? formatPostalCode(input.postalCode) : "",
    address: input.address.trim(),
    phone: input.phone.replace(/\D/g, ""),
    email: input.email.trim(),
    updatedAt: new Date().toISOString(),
  };
  writeStoredProfile(next);
  return { data: next, error: null };
}

async function changePassword(input) {
  await wait(220);
  if (!input.currentPassword || !input.newPassword) {
    return { data: null, error: { message: "現在のパスワードと新しいパスワードを入力してください。" } };
  }
  if (input.newPassword !== input.confirmPassword) {
    return { data: null, error: { message: "新しいパスワードが一致しません。" } };
  }
  if (input.newPassword.length < 8) {
    return { data: null, error: { message: "パスワードは8文字以上で入力してください。" } };
  }
  return { data: { success: true }, error: null };
}

async function createStripePortalSession() {
  await wait(220);
  return { data: { url: "./billing-portal.html" }, error: null };
}

async function updatePaymentMethod(input) {
  await wait(220);
  const expMonth = Number(input.expMonth);
  const expYear = Number(input.expYear);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const isExpired = expYear === currentYear && expMonth < currentDate.getMonth() + 1;
  if (!PAYMENT_BRAND_LABELS[input.brand] || !/^\d{4}$/.test(input.last4)) {
    return { data: null, error: { message: "カードブランドとカード番号の下4桁を確認してください。" } };
  }
  if (!Number.isInteger(expMonth) || expMonth < 1 || expMonth > 12
    || !Number.isInteger(expYear) || expYear < currentYear || expYear > currentYear + 25 || isExpired) {
    return { data: null, error: { message: "有効期限を確認してください。" } };
  }

  const current = readStoredProfile();
  const paymentMethod = {
    ...(current.paymentMethod || {}),
    id: `pm_mock_${input.brand}_${input.last4}`,
    brand: input.brand,
    last4: input.last4,
    expMonth,
    expYear,
    stripePaymentMethodId: `pm_mock_${input.brand}_${input.last4}`,
  };
  const next = { ...current, paymentMethod, updatedAt: new Date().toISOString() };
  try {
    writeStoredProfile(next);
  } catch {
    return { data: null, error: { message: "お支払い方法を保存できませんでした。" } };
  }
  return { data: next, error: null };
}

window.RetailorApi = {
  mockUser,
  GENDER_LABELS,
  fetchUserProfile,
  updateUserProfile,
  updatePaymentMethod,
  changePassword,
  createStripePortalSession,
  formatPostalCode,
  formatUsername,
  formatBirthDateJa,
  formatPhoneDisplay,
  formatEmailDisplay,
  formatPaymentMethod,
};
