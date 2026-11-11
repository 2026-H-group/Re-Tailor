const form = document.getElementById('reviewForm');
const comment = document.getElementById('comment');
const counter = document.getElementById('counter');
const ratingError = document.getElementById('ratingError');
const commentError = document.getElementById('commentError');
const status = document.getElementById('formStatus');
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get('product'));
const orderId = params.get('order');
let orders = [];
try {
    const storedOrders = JSON.parse(localStorage.getItem('reTailorPurchaseHistory') || '[]');
    if (Array.isArray(storedOrders)) orders = storedOrders;
} catch {
    localStorage.removeItem('reTailorPurchaseHistory');
}

const order = orderId ? orders.find((item) => String(item.id) === orderId) : null;
const purchasedProduct = order?.items?.find((item) => Number(item.id) === productId);
const catalogProduct = (window.reTailorProducts || []).find((item) => item.id === productId);
const product = orderId ? purchasedProduct : catalogProduct;

if (product) {
    const image = document.getElementById('reviewProductImage');
    image.textContent = product.category || product.image || '商品';
    image.setAttribute('aria-label', `${product.name}の商品画像`);
    document.getElementById('reviewProductName').textContent = product.name;
    document.getElementById('reviewSeller').textContent = product.seller || '未登録';
    form.hidden = false;
} else {
    document.getElementById('reviewProductPanel').hidden = true;
    document.getElementById('reviewProductError').hidden = false;
}

function updateCounter() {
    counter.textContent = `${comment.value.length} / 300`;
}

comment.addEventListener('input', updateCounter);

form.addEventListener('submit', function (event) {
    event.preventDefault();
    ratingError.textContent = '';
    commentError.textContent = '';
    status.textContent = '';

    const rating = form.querySelector('input[name="rating"]:checked');
    const text = comment.value.trim();
    let valid = true;

    if (!rating) {
        ratingError.textContent = '満足度を選択してください。';
        valid = false;
    }
    if (!text) {
        commentError.textContent = 'レビュー本文を入力してください。';
        valid = false;
    } else if (text.length < 10) {
        commentError.textContent = '10文字以上で入力してください。';
        valid = false;
    }
    if (!valid) {
        (rating ? comment : form.querySelector('input[name="rating"]')).focus();
        return;
    }

    const reviews = (() => {
        try {
            const stored = JSON.parse(localStorage.getItem('reTailorReviews') || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch {
            return [];
        }
    })();
    reviews.unshift({
        id: Date.now(),
        orderId,
        productId,
        productName: product.name,
        seller: product.seller || '',
        rating: Number(rating.value),
        comment: text,
        again: form.elements.namedItem('again').checked,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('reTailorReviews', JSON.stringify(reviews));

    form.querySelectorAll('input, textarea, button').forEach(function (field) {
        field.disabled = true;
    });
    status.textContent = 'レビューを投稿しました。ご協力ありがとうございます。';
});
