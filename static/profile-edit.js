const form = document.getElementById('profileForm');
const profile = JSON.parse(localStorage.getItem('reTailorProfile') || '{}');
const nameInput = document.getElementById('name');
const joinedInput = document.getElementById('joined');
const bioInput = document.getElementById('bio');
nameInput.value = profile.name || 'ユーザー名';
joinedInput.value = profile.joined || '2025-06';
bioInput.value = profile.bio || '';
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!nameInput.value.trim() || !joinedInput.value) return;
  localStorage.setItem('reTailorProfile', JSON.stringify({ name: nameInput.value.trim(), joined: joinedInput.value, bio: bioInput.value.trim() }));
  document.getElementById('formStatus').textContent = 'プロフィールを保存しました。';
  window.setTimeout(() => { location.href = 'my-page.html'; }, 500);
});
