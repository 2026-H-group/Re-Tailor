const form = document.getElementById('profileForm');
const profile = JSON.parse(localStorage.getItem('reTailorProfile') || '{}');
const nameInput = document.getElementById('name');
const joinedInput = document.getElementById('joined');
const bioInput = document.getElementById('bio');
const avatarInput = document.getElementById('avatarInput');
const avatarImage = document.getElementById('avatarImage');
const avatarFallback = document.getElementById('avatarFallback');
const formStatus = document.getElementById('formStatus');
let avatar = profile.avatar || '';

function renderAvatar() {
  avatarImage.hidden = !avatar;
  avatarFallback.hidden = Boolean(avatar);
  if (avatar) avatarImage.src = avatar;
  else avatarImage.removeAttribute('src');
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('画像を読み込めませんでした。'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('画像を読み込めませんでした。'));
      image.onload = () => {
        const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('画像を処理できませんでした。'));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch {
          reject(new Error('画像を保存できませんでした。'));
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

nameInput.value = profile.name || 'ユーザー名';
joinedInput.value = profile.joined || '2025-06';
bioInput.value = profile.bio || '';
renderAvatar();

avatarInput.addEventListener('change', async () => {
  const [file] = avatarInput.files || [];
  if (!file) return;
  formStatus.textContent = '';
  if (!file.type.startsWith('image/')) {
    formStatus.textContent = '画像ファイルを選択してください。';
    avatarInput.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    formStatus.textContent = '画像は5MB以下のファイルを選択してください。';
    avatarInput.value = '';
    return;
  }
  try {
    avatar = await compressImage(file);
    renderAvatar();
  } catch (error) {
    formStatus.textContent = error.message;
    avatarInput.value = '';
  }
});

document.getElementById('clearAvatar').addEventListener('click', () => {
  avatar = '';
  avatarInput.value = '';
  renderAvatar();
  formStatus.textContent = '画像を削除しました。保存すると反映されます。';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!nameInput.value.trim() || !joinedInput.value) return;
  try {
    localStorage.setItem('reTailorProfile', JSON.stringify({ name: nameInput.value.trim(), joined: joinedInput.value, bio: bioInput.value.trim(), avatar }));
  } catch {
    formStatus.textContent = '保存できませんでした。別の画像を選択してください。';
    return;
  }
  formStatus.textContent = 'プロフィールを保存しました。';
  window.setTimeout(() => { location.href = 'my-page.html'; }, 500);
});
