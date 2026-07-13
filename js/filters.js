let currentFilter = { category: 'all', team: 'all', type: 'all', search: '' };
const ITEMS_PER_PAGE = 24;
let currentPage = 1;

function getFilteredProducts() {
  let filtered = [...PRODUCTS];

  if (currentFilter.team !== 'all') {
    filtered = filtered.filter(p => p.team === currentFilter.team);
  }
  if (currentFilter.type !== 'all') {
    const t = currentFilter.type;
    if (t === 'domicile') {
      filtered = filtered.filter(p => /domicile/i.test(p.name));
    } else if (t === 'exterieur') {
      filtered = filtered.filter(p => /ext[eé]rieur/i.test(p.name));
    } else if (t === 'third') {
      filtered = filtered.filter(p => /third/i.test(p.name));
    }
  }
  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    filtered = filtered.filter(p => {
      const name = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const team = p.team.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const desc = p.desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cat = p.category.toLowerCase();
      const type = p.type.toLowerCase();
      const season = p.season.toLowerCase();

      if (name.includes(q) || team.includes(q) || desc.includes(q) || season.includes(q)) return true;
      if (cat.includes(q)) return true;
      if (type.includes(q)) return true;

      const aliases = {
        'real': ['real madrid'],
        'barca': ['fc barcelone', 'barcelone'],
        'barcelone': ['fc barcelone'],
        'man utd': ['manchester united'],
        'manchester': ['manchester united', 'manchester city'],
        'man city': ['manchester city'],
        'om': ['marseille'],
        'psg': ['paris saint-germain'],
        'bayern': ['bayern munich'],
        'dortmund': ['borussia dortmund'],
        'acm': ['ac milan'],
        'inter': ['inter milan'],
        'l1': ['ligue 1', 'psg', 'marseille', 'monaco'],
        'ligue1': ['ligue 1', 'psg', 'marseille', 'monaco'],
        'premier league': ['manchester united', 'manchester city', 'liverpool', 'chelsea', 'arsenal', 'tottenham'],
        'premier': ['manchester united', 'manchester city', 'liverpool', 'chelsea', 'arsenal'],
        'liga': ['real madrid', 'fc barcelone', 'atletico'],
        'bundesliga': ['bayern munich', 'dortmund', 'leverkusen'],
        'serie a': ['juventus', 'ac milan', 'inter', 'napoli', 'roma'],
        'nfl': ['etats-unis', 'usa'],
        'selefs': ['france', 'argentine', 'bresil', 'espagne', 'angleterre', 'italie', 'portugal', 'allemagne', 'pays-bas', 'belgique', 'maroc', 'nigeria', 'japon', 'algerie', 'mexique', 'haiti'],
        'selections': ['france', 'argentine', 'bresil', 'espagne', 'angleterre', 'italie', 'portugal', 'allemagne', 'pays-bas', 'belgique', 'maroc', 'nigeria', 'japon', 'algerie', 'mexique', 'haiti'],
        'national': ['france', 'argentine', 'bresil', 'espagne', 'angleterre', 'italie', 'portugal', 'allemagne', 'pays-bas', 'belgique', 'maroc', 'nigeria', 'japon', 'algerie', 'mexique', 'haiti'],
        'domicile': ['domicile'],
        'exterieur': ['exterieur', 'exterieur'],
        'extérieur': ['exterieur', 'exterieur'],
        'third': ['third'],
        'player': ['player'],
        'goalkeeper': ['goalkeeper', 'gardien'],
        'gardien': ['goalkeeper', 'gardien'],
        'retro': ['retro'],
        'ensemble': ['ensemble']
      };

      for (const [key, values] of Object.entries(aliases)) {
        if (q.includes(key) || key.includes(q)) {
          if (values.some(v => name.includes(v) || team.includes(v) || desc.includes(v))) return true;
        }
      }

      const words = q.split(/\s+/).filter(w => w.length > 1);
      if (words.length > 1) {
        return words.every(w => name.includes(w) || team.includes(w) || desc.includes(w));
      }

      return false;
    });
  }

  return filtered;
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const filtered = getFilteredProducts();
  const toShow = filtered.slice(0, currentPage * ITEMS_PER_PAGE);

  document.getElementById('resultsCount').textContent = `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`;

  if (toShow.length === 0) {
    grid.innerHTML = '<div class="empty-state"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>Aucun produit trouv\u00e9</p></div>';
  } else {
    grid.innerHTML = toShow.map(p => {
      const wish = isInWishlist(p.id);
      const badge = p.category === 'retro' ? 'R\u00e9tro' : p.category === 'ensemble' ? 'Ensemble' : p.type === 'crampons' ? 'Crampons' : '';
      return `
        <div class="product-card" onclick="openModal(${p.id})">
          ${badge ? `<span class="product-badge">${badge}</span>` : ''}
          <button class="product-wishlist ${wish ? 'active' : ''}" onclick="event.stopPropagation();toggleWishlist(PRODUCTS.find(x=>x.id===${p.id}))">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${wish ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <img class="product-image" src="${p.img1}" alt="${p.name}" loading="lazy">
          <div class="product-info">
            <span class="product-category">${p.team} \u2022 ${p.season}</span>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-price">${formatPrice(p.price)}</p>
            <div class="product-actions">
              <button class="btn-add-small" onclick="event.stopPropagation();addToCart(PRODUCTS.find(x=>x.id===${p.id}))">Ajouter au panier</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const loadMoreContainer = document.getElementById('loadMoreContainer');
  if (toShow.length < filtered.length) {
    loadMoreContainer.style.display = 'block';
  } else {
    loadMoreContainer.style.display = 'none';
  }
}

function populateFilters() {
  const teams = [...new Set(PRODUCTS.map(p => p.team))].sort();

  const teamSelect = document.getElementById('filterTeam');
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    teamSelect.appendChild(opt);
  });
}
