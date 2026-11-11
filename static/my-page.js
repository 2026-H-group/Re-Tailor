const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === tab.dataset.tab));
}));
const profile = JSON.parse(localStorage.getItem('reTailorProfile') || '{}');
if (profile.name) { document.getElementById('userName').textContent = profile.name; document.getElementById('avatar').textContent = profile.name.slice(0, 1); }
if (profile.joined) { const [year, month] = profile.joined.split('-'); document.getElementById('joinedDate').textContent = `${year}年${Number(month)}月から利用`; }

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const formatPrice = (value) => `￥${Number(value || 0).toLocaleString('ja-JP')}`;
const mockListings = [
  { id: 'sample-1', name: 'ヴィンテージデニムジャケット', price: 8900, category: 'アウター', status: '販売中' },
  { id: 'sample-2', name: 'ハンドメイドニットセーター', price: 5400, category: 'トップス', status: '販売中' },
  { id: 'sample-3', name: 'コットンワンピース', price: 3200, category: 'ワンピース', status: '販売中' }
];

function createProductCard(product, { href, editHref } = {}) {
  const card = document.createElement(editHref ? 'article' : 'a');
  card.className = 'product-card';
  if (href) card.href = href;
  const image = document.createElement('div');
  image.className = 'product-image';
  image.setAttribute('role', 'img');
  image.setAttribute('aria-label', `${product.name}の商品画像`);
  image.textContent = product.category || '商品';
  const name = document.createElement('h3');
  name.textContent = product.name;
  const price = document.createElement('p');
  price.textContent = formatPrice(product.price);
  card.append(image, name, price);
  if (editHref) {
    const edit = document.createElement('a');
    edit.href = editHref;
    edit.textContent = '出品内容を編集';
    card.append(edit);
  }
  return card;
}

const storedListings = localStorage.getItem('reTailorListings');
const listings = (storedListings === null ? mockListings : readArray('reTailorListings')).filter((item) => item.status === '販売中');
const listingGrid = document.getElementById('userListings');
document.getElementById('listingCount').textContent = `${listings.length}件`;
listings.forEach((item) => listingGrid.append(createProductCard(item, { editHref: `naiyouhensyuu.html?id=${encodeURIComponent(item.id)}` })));
document.getElementById('listingEmpty').hidden = listings.length > 0;

const favoriteIds = new Set(readArray('reTailorFavorites').map(Number));
const favorites = (window.reTailorProducts || []).filter((item) => favoriteIds.has(item.id));
const favoriteGrid = document.getElementById('favoriteProducts');
document.getElementById('favoriteCount').textContent = `${favorites.length}件`;
favorites.forEach((item) => favoriteGrid.append(createProductCard(item, { href: `detail.html?id=${item.id}` })));
document.getElementById('favoriteEmpty').hidden = favorites.length > 0;

const reviews = readArray('reTailorReviews');
const reviewList = document.getElementById('userReviews');
document.getElementById('userReviewCount').textContent = `${reviews.length}件`;
reviews.forEach((review) => {
  const card = document.createElement('article');
  card.className = 'review-card';
  const header = document.createElement('div');
  const rating = document.createElement('strong');
  rating.textContent = `${'★'.repeat(Number(review.rating) || 0)}${'☆'.repeat(5 - (Number(review.rating) || 0))}`;
  const date = document.createElement('time');
  date.dateTime = review.createdAt || '';
  date.textContent = review.createdAt ? new Date(review.createdAt).toLocaleDateString('ja-JP') : '';
  header.append(rating, date);
  const title = document.createElement('h3');
  title.textContent = review.productName || '商品レビュー';
  const comment = document.createElement('p');
  comment.textContent = review.comment || '';
  card.append(header, title, comment);
  reviewList.append(card);
});
document.getElementById('reviewEmpty').hidden = reviews.length > 0;

const followingCount = document.getElementById('followingCount');
const followerCount = document.getElementById('followerCount');
const followingButton = document.getElementById('showFollowing');
const followersButton = document.getElementById('showFollowers');
const followListPanel = document.getElementById('followListPanel');
const followListTitle = document.getElementById('followListTitle');
const followList = document.getElementById('followList');
const followers = ['mika', 'haru', 'sora', 'yui', 'koto', 'rin', 'ao', 'nana', 'mei', 'aki', 'rei', 'hina'];
let activeList = null;
let listTrigger = null;

const readFollowing = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('reTailorFollowing') || '[]');
    return Array.isArray(stored) ? [...new Set(stored.filter((name) => typeof name === 'string'))] : [];
  } catch {
    return [];
  }
};

let following = readFollowing();

const updateFollowingCount = () => {
  followingCount.textContent = following.length;
};

const renderFollowList = () => {
  const usernames = activeList === 'following' ? following : followers;
  followListTitle.textContent = activeList === 'following' ? 'フォロー中' : 'フォロワー';
  followList.replaceChildren();

  if (usernames.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'follow-list-empty';
    empty.textContent = activeList === 'following' ? 'フォロー中のユーザーはいません。' : 'フォロワーはいません。';
    followList.append(empty);
    return;
  }

  usernames.forEach((username) => {
    const item = document.createElement('li');
    item.className = 'follow-list-item';
    const isFollowing = activeList === 'following';
    const name = document.createElement(isFollowing ? 'a' : 'span');
    name.className = 'follow-list-name';
    name.textContent = username;
    if (isFollowing) name.href = `seller.html?seller=${encodeURIComponent(username)}`;
    item.append(name);

    if (isFollowing) {
      const unfollowButton = document.createElement('button');
      unfollowButton.className = 'unfollow-button';
      unfollowButton.type = 'button';
      unfollowButton.dataset.unfollow = username;
      unfollowButton.textContent = 'フォロー解除';
      item.append(unfollowButton);
    }

    followList.append(item);
  });
};

const closeFollowList = () => {
  followListPanel.hidden = true;
  document.getElementById('followListBackdrop').hidden = true;
  document.body.classList.remove('follow-list-open');
  followingButton.setAttribute('aria-expanded', 'false');
  followersButton.setAttribute('aria-expanded', 'false');
  listTrigger?.focus();
};

const positionFollowList = (trigger) => {
  const margin = 16;
  const gap = 12;
  const triggerRect = trigger.getBoundingClientRect();
  const availableBelow = window.innerHeight - triggerRect.bottom - gap - margin;
  const availableAbove = triggerRect.top - gap - margin;
  const naturalHeight = followListPanel.getBoundingClientRect().height;
  const desiredHeight = Math.min(naturalHeight, 560, window.innerHeight * 0.7);
  const openAbove = availableBelow < desiredHeight && availableAbove > availableBelow;
  const availableSpace = openAbove ? availableAbove : availableBelow;
  const maxHeight = Math.max(120, Math.min(560, window.innerHeight * 0.7, availableSpace));

  followListPanel.style.maxHeight = `${maxHeight}px`;
  followListPanel.classList.toggle('above-trigger', openAbove);
  followListPanel.style.top = `${openAbove ? triggerRect.top - gap : triggerRect.bottom + gap}px`;
};

const showFollowList = (listName, trigger) => {
  if (!followListPanel.hidden && activeList === listName) {
    closeFollowList();
    return;
  }
  activeList = listName;
  listTrigger = trigger;
  followListPanel.hidden = false;
  document.getElementById('followListBackdrop').hidden = false;
  document.body.classList.add('follow-list-open');
  followingButton.setAttribute('aria-expanded', String(listName === 'following'));
  followersButton.setAttribute('aria-expanded', String(listName === 'followers'));
  renderFollowList();
  positionFollowList(followingButton);
};

followingButton.addEventListener('click', () => showFollowList('following', followingButton));
followersButton.addEventListener('click', () => showFollowList('followers', followersButton));
document.getElementById('closeFollowList').addEventListener('click', closeFollowList);
document.getElementById('followListBackdrop').addEventListener('click', closeFollowList);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !followListPanel.hidden) closeFollowList();
});

followList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-unfollow]');
  if (!button) return;
  following = following.filter((username) => username !== button.dataset.unfollow);
  localStorage.setItem('reTailorFollowing', JSON.stringify(following));
  updateFollowingCount();
  renderFollowList();
});

updateFollowingCount();
