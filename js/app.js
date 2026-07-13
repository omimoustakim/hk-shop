let currentPageView = 'accueil';

function getSearchSuggestions(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const seen = new Set();
  const suggestions = [];

  const teams = [...new Set(PRODUCTS.map(p => p.team))];
  teams.forEach(team => {
    const t = team.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (t.includes(q) && !seen.has(team)) {
      const count = PRODUCTS.filter(p => p.team === team).length;
      suggestions.push({ text: team, tag: 'Club/Pays', count });
      seen.add(team);
    }
  });

  const leagues = [
    { name: 'Ligue 1', keywords: ['psg', 'marseille', 'monaco', 'lyon', 'lille'] },
    { name: 'Premier League', keywords: ['manchester united', 'manchester city', 'liverpool', 'chelsea', 'arsenal', 'tottenham'] },
    { name: 'La Liga', keywords: ['real madrid', 'fc barcelone', 'atletico'] },
    { name: 'Bundesliga', keywords: ['bayern munich', 'dortmund', 'leverkusen'] },
    { name: 'Serie A', keywords: ['juventus', 'ac milan', 'inter', 'napoli', 'roma'] },
    { name: 'Saudi Pro League', keywords: ['al-nassr'] }
  ];
  leagues.forEach(league => {
    if (league.name.toLowerCase().includes(q) || league.keywords.some(k => k.includes(q))) {
      const count = PRODUCTS.filter(p => league.keywords.some(k => p.team.toLowerCase().includes(k))).length;
      if (!seen.has(league.name)) {
        suggestions.push({ text: league.name, tag: 'Ligue', count });
        seen.add(league.name);
      }
    }
  });

  const types = [
    { name: 'Maillots', type: 'maillot' },
    { name: 'Ensembles', type: 'ensemble' }
  ];
  types.forEach(item => {
    if (item.name.toLowerCase().includes(q)) {
      const count = PRODUCTS.filter(p => p.type === item.type).length;
      if (!seen.has(item.name)) {
        suggestions.push({ text: item.name, tag: 'Type', count });
        seen.add(item.name);
      }
    }
  });

  const keywords = [
    { name: 'Domicile', filter: 'domicile' },
    { name: 'Extérieur', filter: 'exterieur' },
    { name: 'Third', filter: 'third' },
    { name: 'Player', filter: 'player' },
    { name: 'Goalkeeper', filter: 'goalkeeper' },
    { name: 'Rétro', filter: 'retro' }
  ];
  keywords.forEach(item => {
    if (item.name.toLowerCase().includes(q)) {
      const count = PRODUCTS.filter(p => {
        const name = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(item.filter);
      }).length;
      if (!seen.has(item.name)) {
        suggestions.push({ text: item.name, tag: 'Style', count });
        seen.add(item.name);
      }
    }
  });

  return suggestions.slice(0, 8);
}

function renderSuggestions(suggestions) {
  const container = document.getElementById('searchSuggestions');
  if (!suggestions.length) {
    container.classList.remove('active');
    container.innerHTML = '';
    return;
  }
  container.innerHTML = suggestions.map(s =>
    `<div class="search-suggestion-item" data-text="${s.text}">
      <span class="suggestion-tag">${s.tag}</span>
      <span class="suggestion-text">${s.text}</span>
      <span class="suggestion-count">${s.count} produits</span>
    </div>`
  ).join('');
  container.classList.add('active');

  container.querySelectorAll('.search-suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      document.getElementById('searchInput').value = item.dataset.text;
      currentFilter.search = item.dataset.text;
      currentPage = 1;
      container.classList.remove('active');
      renderProducts();
    });
  });
}

function renderFeatured() {
  const featuredIds = [3, 4, 6, 8, 10, 23, 27, 35];
  const track = document.getElementById('featuredTrack');
  const featured = PRODUCTS.filter(p => featuredIds.includes(p.id));

  function cardHTML(p) {
    const wish = isInWishlist(p.id);
    const badge = p.category === 'retro' ? 'Rétro' : p.category === 'ensemble' ? 'Ensemble' : '';
    return `
      <div class="product-card" onclick="openModal(${p.id})">
        ${badge ? `<span class="product-badge">${badge}</span>` : ''}
        <button class="product-wishlist ${wish ? 'active' : ''}" onclick="event.stopPropagation();toggleWishlist(PRODUCTS.find(x=>x.id===${p.id}))">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${wish ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <img class="product-image" src="${p.img1}" alt="${p.name}" loading="lazy">
        <div class="product-info">
          <span class="product-category">${p.team} &bull; ${p.season}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-actions">
            <button class="btn-add-small" onclick="event.stopPropagation();navigateTo('boutique')">Voir le catalogue</button>
          </div>
        </div>
      </div>
    `;
  }

  const cards = featured.map(cardHTML).join('');
  track.innerHTML = cards + cards;
}

function renderTestimonials() {
  const testimonials = [
    { name: 'Kwami', team: 'PSG', text: 'Super qualit\u00e9 ! Le maillot est identique \u00e0 l\'original. Livraison rapide, je recommande.', img: 'image/testimonials/client1.jpg' },
    { name: 'Afi', team: 'Real Madrid', text: 'J\'ai command\u00e9 pour mon fils, il est tr\u00e8s content. Le tissu est excellent.', img: 'image/testimonials/client2.jpg' },
    { name: 'Kossi', team: 'France', text: 'Meilleur site de maillots au Togo. Paiement \u00e0 la livraison, z\u00e9ro risque.', img: 'image/testimonials/client3.jpg' },
    { name: 'Yawa', team: 'FC Barcelone', text: 'Les ensembles sont magnifiques. J\'ai d\u00e9j\u00e0 command\u00e9 3 fois.', img: 'image/testimonials/client4.jpg' },
    { name: 'Kokou', team: 'Marseille', text: 'Service client r\u00e9actif sur WhatsApp. Maillot re\u00e7u en 24h, impressionnant !', img: 'image/testimonials/client5.jpg' },
    { name: 'Adjoa', team: 'Liverpool', text: 'Les maillots r\u00e9tros sont incroyables. La qualit\u00e9 est au rendez-vous.', img: 'image/testimonials/client6.jpg' }
  ];

  const track = document.getElementById('testimonialsTrack');
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <img class="testimonial-img" src="${t.img}" alt="${t.name}" loading="lazy">
      <div class="testimonial-body">
        <div class="testimonial-stars">\u2605\u2605\u2605\u2605\u2605</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.name.charAt(0)}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-team">Fan de ${t.team}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function navigateTo(page) {
  currentPageView = page;

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (link) link.classList.add('active');

  const featured = document.getElementById('featured');
  const products = document.getElementById('products');
  const productsGrid = document.getElementById('productsGrid');
  const loadMore = document.getElementById('loadMoreContainer');

  if (page === 'accueil') {
    featured.style.display = '';
    products.style.display = 'none';
    productsGrid.style.display = 'none';
    loadMore.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    featured.style.display = 'none';
    products.style.display = '';
    productsGrid.style.display = '';
    currentPage = 1;
    renderProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  }

  document.getElementById('hamburgerBtn').classList.remove('active');
  document.getElementById('navMenu').classList.remove('active');
}

function initEvents() {
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('hamburgerBtn').classList.toggle('active');
    document.getElementById('navMenu').classList.toggle('active');
  });

  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  document.getElementById('filterTeam').addEventListener('change', e => {
    currentFilter.team = e.target.value;
    currentPage = 1;
    renderProducts();
  });

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', e => {
    const val = e.target.value;
    const suggestions = getSearchSuggestions(val);
    renderSuggestions(suggestions);
    currentFilter.search = val;
    currentPage = 1;
    renderProducts();
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('searchSuggestions').classList.remove('active');
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-bar-collection')) {
      document.getElementById('searchSuggestions').classList.remove('active');
    }
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter.type = btn.dataset.filter;
      currentPage = 1;
      renderProducts();
    });
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentPage++;
    renderProducts();
  });

  document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.add('active');
    renderCart();
  });

  document.getElementById('cartClose').addEventListener('click', () => {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
  });

  document.getElementById('cartOverlay').addEventListener('click', () => {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
  });

  document.getElementById('wishlistBtn').addEventListener('click', () => {
    document.getElementById('wishlistSidebar').classList.add('active');
    renderWishlist();
  });

  document.getElementById('wishlistClose').addEventListener('click', () => {
    document.getElementById('wishlistSidebar').classList.remove('active');
  });

  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('productModal').classList.remove('active');
  });

  document.getElementById('productModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove('active');
    }
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Votre panier est vide');
      return;
    }
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items = cart.map(i => `${i.name} (${i.size}) x${i.qty}`).join('%0A');
    const orderNum = 'HK-' + Date.now().toString(36).toUpperCase();
    const msg = `Commande ${orderNum}%0A%0A${items}%0A%0ATotal: ${formatPrice(total)}%0A%0APaiement à la livraison.`;
    window.open(`https://wa.me/22898097621?text=${msg}`, '_blank');
    document.getElementById('orderNumber').textContent = orderNum;
    document.getElementById('checkoutModal').classList.add('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
    cart = [];
    saveCart();
    renderCart();
  });

  document.getElementById('checkoutClose').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('active');
  });

  document.getElementById('checkoutContinue').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('active');
  });
}

function sendEmail() {
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;
  const subject = encodeURIComponent('Contact HKShop - ' + name);
  const body = encodeURIComponent('Nom: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);
  window.location.href = 'mailto:Khalidhakim404@gmail.com?subject=' + subject + '&body=' + body;
  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMessage').value = '';
  showMessage('Merci ! Votre client mail s\'ouvre...');
}

document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  initEvents();
  renderFeatured();
  renderTestimonials();
  renderProducts();
  updateCartCount();
  updateWishlistCount();
  renderCart();
  renderWishlist();
  navigateTo('accueil');
});
