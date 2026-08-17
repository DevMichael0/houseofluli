/* ===========================================================
   House Of Luli — MAIN JS
   Handles: header scroll, mobile menu, cart (localStorage),
   add-to-cart animations, newsletter AJAX, toast notifications
   =========================================================== */

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

/* ---------- HEADER SCROLL ---------- */
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
});

/* ---------- MOBILE MENU ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

/* ---------- TOAST ---------- */
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ---------- CART (localStorage based, swap for DB/session cart once API is live) ---------- */
const Cart = {
    key: 'vogue_cart',
    get() { return JSON.parse(localStorage.getItem(this.key) || '[]'); },
    save(items) { localStorage.setItem(this.key, JSON.stringify(items)); this.render(); },
    add(item) {
        const items = this.get();
        const existing = items.find(i => i.id === item.id && i.size === item.size && i.color === item.color);
        if (existing) { existing.qty += item.qty; } else { items.push(item); }
        this.save(items);
        showToast('Added "' + item.name + '" to your bag');
        document.getElementById('cartDrawer')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('open');
    },
    updateQty(index, delta) {
        const items = this.get();
        if (!items[index]) return;
        items[index].qty += delta;
        if (items[index].qty <= 0) items.splice(index, 1);
        this.save(items);
    },
    remove(index) {
        const items = this.get();
        items.splice(index, 1);
        this.save(items);
    },
    total() { return this.get().reduce((sum, i) => sum + i.price * i.qty, 0); },
    count() { return this.get().reduce((sum, i) => sum + i.qty, 0); },
    render() {
        const wrap = document.getElementById('cartItemsWrap');
        const countEl = document.getElementById('cartCount');
        const subEl = document.getElementById('cartSubtotal');
        const items = this.get();

        if (countEl) countEl.textContent = this.count();
        if (subEl) subEl.textContent = '$' + this.total().toFixed(2);
        if (!wrap) return;

        if (items.length === 0) {
            wrap.innerHTML = '<div class="empty-cart">Your bag is empty.</div>';
            return;
        }

        wrap.innerHTML = items.map((item, idx) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="meta">Size: ${item.size} • Color: ${item.color}</div>
                    <div class="qty-control">
                        <button onclick="Cart.updateQty(${idx},-1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="Cart.updateQty(${idx},1)">+</button>
                    </div>
                    <span class="remove-item" onclick="Cart.remove(${idx})">Remove</span>
                </div>
                <strong>$${(item.price * item.qty).toFixed(2)}</strong>
            </div>
        `).join('');
    }
};
window.Cart = Cart;
document.addEventListener('DOMContentLoaded', () => Cart.render());

/* ---------- ADD TO CART BUTTONS (data attributes on product cards) ---------- */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-add-cart');
    if (!btn) return;
    const card = btn.closest('[data-product]');
    Cart.add({
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        image: card.dataset.image,
        size: card.dataset.size || 'M',
        color: card.dataset.color || 'Black',
        qty: 1
    });
});

/* ---------- CART DRAWER TOGGLE ---------- */
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
if (cartToggle) cartToggle.addEventListener('click', () => { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); });
if (closeCart) closeCart.addEventListener('click', () => { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); });
if (cartOverlay) cartOverlay.addEventListener('click', () => { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); });

/* ---------- NEWSLETTER AJAX ---------- */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletterEmail').value;
        const msgEl = document.getElementById('newsletterMsg');
        msgEl.textContent = 'Subscribing...';
        msgEl.style.color = '#facc15';
        try {
            const res = await fetch('newsletter_subscribe.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            msgEl.textContent = data.message;
            msgEl.style.color = data.success ? '#facc15' : '#ff6b6b';
            if (data.success) newsletterForm.reset();
        } catch (err) {
            msgEl.textContent = 'Something went wrong. Please try again.';
            msgEl.style.color = '#ff6b6b';
        }
    });
}

/* ---------- SCROLL REVEAL ---------- */
const revealEls = document.querySelectorAll('.product-card, .blog-card, .cat-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.classList.add('animate-up');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => { el.style.opacity = 0; observer.observe(el); });
