const dishes = [
  { id: 'shafoot', name: 'شفوت', en: 'Shafoot', category: 'appetizers', label: 'المقبلات', price: 15, kcal: 160, image: 'assets/shafoot.jpg' },
  { id: 'meat-burma', name: 'برمة لحم', en: 'Meat Burma', category: 'mains', label: 'الأطباق الرئيسية', price: 99, kcal: 1280, image: 'assets/meat-burma.jpg' },
  { id: 'labani-madhbi', name: 'نفر لحم لباني مضبي', en: 'Labani Lamb Madhbi 1/16', category: 'mains', label: 'الأطباق الرئيسية', price: 99, kcal: 1800, image: 'assets/labani-madhbi.jpg' },
  { id: 'fahsa', name: 'فحسة', en: 'Fahsa', category: 'qallabat', label: 'القلابات', price: 35, kcal: 510, image: 'assets/fahsa.jpg' },
  { id: 'liver', name: 'كبدة بلدي', en: 'Fresh Liver', category: 'qallabat', label: 'القلابات', price: 29, kcal: 310, image: 'assets/liver.jpg' },
  { id: 'soosi', name: 'سوسي', en: 'Soosi', category: 'desserts', label: 'الفتة والحلويات', price: 25, kcal: 600, image: 'assets/soosi.jpg' },
  { id: 'rawani', name: 'رواني', en: 'Rawani', category: 'desserts', label: 'الفتة والحلويات', price: 10, kcal: 380, image: 'assets/rawani.jpg' },
  { id: 'bread', name: 'خبز ملوح دبل', en: 'Double Mulawah Bread', category: 'baked', label: 'المخبوزات', price: 5, kcal: 360, image: 'assets/bread.jpg' }
];

const categories = [
  ['all', 'الكل'],
  ['appetizers', 'المقبلات'],
  ['mains', 'الأطباق الرئيسية'],
  ['qallabat', 'القلابات'],
  ['desserts', 'الفتة والحلويات'],
  ['baked', 'المخبوزات']
];

const categoryList = document.getElementById('categoryList');
const menuGrid = document.getElementById('menuGrid');
const cartTrigger = document.getElementById('cartTrigger');
const cartDrawer = document.getElementById('cartDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutMessage = document.getElementById('checkoutMessage');
const heroVideo = document.querySelector('.hero-video');
const videoToggle = document.getElementById('videoToggle');
const videoToggleIcon = document.getElementById('videoToggleIcon');
const videoToggleText = document.getElementById('videoToggleText');
const cart = new Map();
let activeCategory = 'all';
let previousFocus = null;

function renderCategories() {
  categoryList.innerHTML = categories.map(([key, label]) =>
    `<button type="button" data-category="${key}" class="${key === activeCategory ? 'active' : ''}" aria-pressed="${key === activeCategory}">${label}</button>`
  ).join('');
}

function renderMenu() {
  const visible = activeCategory === 'all' ? dishes : dishes.filter(dish => dish.category === activeCategory);
  menuGrid.innerHTML = visible.map(dish => `
    <article class="dish-card">
      <div class="dish-photo"><img src="${dish.image}" alt="${dish.name} من منيو دار الشيباني" loading="lazy"><span class="dish-category">${dish.label}</span></div>
      <div class="dish-info"><h3>${dish.name}</h3><p class="dish-en">${dish.en}</p>
        <div class="dish-bottom"><span class="dish-price">${dish.price} <small>ر.س</small></span><span class="dish-kcal">${dish.kcal} سعرة</span><button class="dish-add" type="button" data-add="${dish.id}" aria-label="أضف ${dish.name} إلى سلة العرض">+</button></div>
      </div>
    </article>`).join('');
}

function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => sum + dishes.find(dish => dish.id === id).price * quantity, 0);
  cartCount.textContent = String(count);
  cartTotal.textContent = String(total);
  cartItems.innerHTML = entries.length ? entries.map(([id, quantity]) => {
    const dish = dishes.find(item => item.id === id);
    return `<div class="cart-row"><div><strong>${dish.name}</strong><small>${quantity} × ${dish.price} ر.س</small></div><button type="button" data-remove="${id}" aria-label="احذف قطعة من ${dish.name}">−</button></div>`;
  }).join('') : '<p class="empty-cart">أضف طبقًا من المنيو لتجربة السلة.</p>';
}

function openCart() {
  previousFocus = document.activeElement;
  drawerBackdrop.hidden = false;
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  document.getElementById('cartClose').focus();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  drawerBackdrop.hidden = true;
  document.body.classList.remove('drawer-open');
  checkoutMessage.textContent = '';
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
}

categoryList.addEventListener('click', event => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

menuGrid.addEventListener('click', event => {
  const button = event.target.closest('button[data-add]');
  if (!button) return;
  const id = button.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  checkoutMessage.textContent = '';
  cartTrigger.setAttribute('aria-label', `افتح سلة العرض، ${cartCount.textContent} أصناف`);
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('button[data-remove]');
  if (!button) return;
  const id = button.dataset.remove;
  const next = (cart.get(id) || 0) - 1;
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  renderCart();
  cartTrigger.setAttribute('aria-label', `افتح سلة العرض، ${cartCount.textContent} أصناف`);
});

cartTrigger.addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
drawerBackdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart(); });
document.getElementById('demoCheckout').addEventListener('click', () => {
  checkoutMessage.textContent = cart.size ? 'هذه معاينة فقط. في النسخة التشغيلية سيظهر الطلب للكاشير قبل تأكيد الدفع.' : 'أضف طبقًا إلى سلة العرض أولًا.';
});

renderCategories();
renderMenu();
renderCart();

function syncVideoButton() {
  const playing = !heroVideo.paused;
  videoToggle.setAttribute('aria-label', playing ? 'إيقاف فيديو الخباز' : 'تشغيل فيديو الخباز');
  videoToggleIcon.textContent = playing ? 'Ⅱ' : '▶';
  videoToggleText.textContent = playing ? 'إيقاف الفيديو' : 'شاهد الخباز';
}
videoToggle.addEventListener('click', async () => {
  if (heroVideo.paused) {
    try { await heroVideo.play(); } catch { videoToggleText.textContent = 'تعذر تشغيل الفيديو'; }
  } else {
    heroVideo.pause();
  }
  syncVideoButton();
});
heroVideo.addEventListener('play', syncVideoButton);
heroVideo.addEventListener('pause', syncVideoButton);
syncVideoButton();

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}
