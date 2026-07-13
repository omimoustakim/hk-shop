let cart = JSON.parse(localStorage.getItem('hk_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('hk_wishlist')) || [];
let selectedSize = null;

function saveCart() {
  localStorage.setItem('hk_cart', JSON.stringify(cart));
  updateCartCount();
}

function saveWishlist() {
  localStorage.setItem('hk_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function updateWishlistCount() {
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

function isInWishlist(id) {
  return wishlist.some(p => p.id === id);
}

function toggleWishlist(product) {
  const idx = wishlist.findIndex(p => p.id === product.id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast('Retir\u00e9 de la liste de souhaits');
  } else {
    wishlist.push(product);
    showToast('Ajout\u00e9 \u00e0 la liste de souhaits');
  }
  saveWishlist();
  renderProducts();
  renderWishlist();
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1, size: selectedSize || 'M' });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} ajout\u00e9 au panier`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Votre panier est vide</p></div>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img1}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>Taille: ${item.size} | Qt\u00e9: ${item.qty}</p>
          <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('');
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function renderWishlist() {
  const container = document.getElementById('wishlistItems');
  if (wishlist.length === 0) {
    container.innerHTML = '<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>Votre liste de souhaits est vide</p></div>';
  } else {
    container.innerHTML = wishlist.map(item => `
      <div class="cart-item">
        <img src="${item.img1}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.team}</p>
          <span class="cart-item-price">${formatPrice(item.price)}</span>
        </div>
        <button class="cart-item-remove" onclick="toggleWishlist(PRODUCTS.find(p=>p.id===${item.id}))">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('');
  }
}
