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

function initEvents() {
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('hamburgerBtn').classList.toggle('active');
    document.getElementById('navMenu').classList.toggle('active');
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
  renderProducts();
  updateCartCount();
  updateWishlistCount();
  renderCart();
  renderWishlist();
});
