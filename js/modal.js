function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  selectedSize = null;

  document.getElementById('modalImg1').src = p.img1;
  document.getElementById('modalImg1').alt = p.name;
  document.getElementById('modalImg2').src = p.img2;
  document.getElementById('modalImg2').alt = p.name;
  document.getElementById('modalCategory').textContent = `${p.team} \u2022 ${p.season}`;
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalPrice').textContent = formatPrice(p.price);
  document.getElementById('modalDescription').textContent = p.desc;

  const sizes = p.type === 'chaussettes'
    ? ['36-38', '39-41', '42-44', '45-47']
    : p.type === 'crampons'
    ? ['39', '40', '41', '42', '43', '44', '45', '46']
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  document.getElementById('sizeOptions').innerHTML = sizes.map((s, i) =>
    `<button class="size-btn" onclick="selectSize(this, '${s}')">${s}</button>`
  ).join('');

  const wishBtn = document.getElementById('modalWishlist');
  wishBtn.className = `btn-wishlist ${isInWishlist(p.id) ? 'active' : ''}`;
  wishBtn.onclick = () => toggleWishlist(p);

  document.getElementById('modalAddCart').onclick = () => {
    if (!selectedSize && p.type !== 'veste') {
      showToast('Veuillez s\u00e9lectionner une taille');
      return;
    }
    addToCart(p);
  };

  document.getElementById('productModal').classList.add('active');
}

function selectSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = size;
}
