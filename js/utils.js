function formatPrice(price) {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('active');
  setTimeout(() => t.classList.remove('active'), 2500);
}

function showMessage(msg) {
  showToast(msg);
}
