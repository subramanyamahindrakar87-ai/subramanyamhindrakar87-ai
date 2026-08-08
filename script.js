/* ==========================================================================
   FreshBite - Core Application Script
   Full-Stack REST API & Frontend Integration
   ========================================================================== */

// --- Global Fallback Datasets & State ---
let foodItems = [];
let restaurants = [];
let cart = JSON.parse(localStorage.getItem('freshbite_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('freshbite_wishlist')) || [1, 3];
let currentUser = JSON.parse(localStorage.getItem('freshbite_user')) || {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  addresses: ["742 Evergreen Terrace, Springfield", "100 Innovation Way, Suite 400"],
  isLoggedIn: true
};
let orders = JSON.parse(localStorage.getItem('freshbite_orders')) || [
  {
    id: "FB-8841",
    date: "Aug 05, 2026",
    items: [
      { name: "Artisanal Margherita Pizza", qty: 1, price: 14.99 },
      { name: "Molten Chocolate Lava Cake", qty: 2, price: 7.99 }
    ],
    total: 34.12,
    status: "Delivered",
    address: "742 Evergreen Terrace, Springfield"
  }
];
let activeCoupon = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  renderCategories();
  await loadRestaurants();
  await loadMenu();
  updateCartBadges();
  renderCartPage();
  renderAccountPage();
  setupEventListeners();
});

// --- Navigation & Mobile Drawer ---
function initNavbar() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('drawerCloseBtn');

  toggleBtn?.addEventListener('click', () => {
    drawer.classList.add('open');
    overlay.classList.add('active');
  });

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
  };

  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', () => {
    closeDrawer();
    closeModal();
  });
}

// --- Render Categories ---
function renderCategories() {
  const container = document.getElementById('categoryGrid');
  if (!container) return;

  const cats = [
    { name: "All", icon: "fa-border-all" },
    { name: "Pizza", icon: "fa-pizza-slice" },
    { name: "Burgers", icon: "fa-hamburger" },
    { name: "Sushi", icon: "fa-fish" },
    { name: "Indian", icon: "fa-pepper-hot" },
    { name: "Healthy", icon: "fa-leaf" },
    { name: "Desserts", icon: "fa-ice-cream" }
  ];

  container.innerHTML = cats.map((c, i) => `
    <div class="category-card ${i === 0 ? 'active' : ''}" onclick="filterCategory('${c.name}', this)">
      <div class="icon-box"><i class="fas ${c.icon}"></i></div>
      <h4>${c.name}</h4>
    </div>
  `).join('');
}

// --- REST API: Load Restaurants ---
async function loadRestaurants(filterCuisine = "All") {
  const container = document.getElementById('restaurantGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/restaurants');
    const json = await res.json();
    if (json.success) restaurants = json.data;
  } catch (err) {
    console.warn('Backend REST API unavailable, using cached data', err);
  }

  const filtered = filterCuisine === "All" ? restaurants : restaurants.filter(r => r.cuisine === filterCuisine);

  container.innerHTML = filtered.map(r => `
    <div class="restaurant-card">
      <div class="rest-img-box">
        <img src="${r.image}" alt="${r.name}">
        <span class="rest-badge">${r.badge}</span>
      </div>
      <div class="rest-info">
        <div class="rest-info-head">
          <h3>${r.name}</h3>
          <span class="rating-badge"><i class="fas fa-star"></i> ${r.rating}</span>
        </div>
        <div class="rest-meta">
          <span><i class="fas fa-utensils"></i> ${r.cuisine}</span>
          <span><i class="fas fa-clock"></i> ${r.deliveryTime}</span>
          <span><i class="fas fa-motorcycle"></i> $${r.deliveryFee.toFixed(2)}</span>
        </div>
        <button class="btn-outline" style="width: 100%; font-size: 0.88rem;" onclick="filterCategory('All', null); document.getElementById('menu').scrollIntoView();">View Menu</button>
      </div>
    </div>
  `).join('');
}

// --- REST API: Load Menu Grid ---
let currentCategoryFilter = "All";
let currentDietFilter = "all";
let currentSearchQuery = "";
let currentSortOption = "popular";

async function loadMenu() {
  const container = document.getElementById('foodGrid');
  if (!container) return;

  let items = [];
  try {
    const params = new URLSearchParams({
      category: currentCategoryFilter,
      diet: currentDietFilter,
      search: currentSearchQuery,
      sort: currentSortOption
    });
    const res = await fetch(`/api/food?${params.toString()}`);
    const json = await res.json();
    if (json.success) {
      items = json.data;
      foodItems = items; // cache locally
    }
  } catch (err) {
    console.warn('REST API fetch error, using local array', err);
    items = [...foodItems];
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--border-color); margin-bottom: 16px;"></i>
        <h3>No food items found matching your filter</h3>
        <p style="color: var(--text-muted); max-width: 400px; margin: 8px auto 20px auto;">Try clearing search or choosing another category tag.</p>
        <button class="btn-primary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const isWishlisted = wishlist.includes(item.id);
    return `
      <div class="food-card">
        <div class="food-img-box" onclick="openProductModal(${item.id})">
          <img src="${item.image}" alt="${item.name}">
          <span class="dietary-tag ${item.veg ? '' : 'non-veg'}" title="${item.veg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${item.id})">
            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
        <div class="food-content">
          <div class="food-title-row">
            <h3 onclick="openProductModal(${item.id})">${item.name}</h3>
            <span class="rating-badge"><i class="fas fa-star"></i> ${item.rating}</span>
          </div>
          <p class="food-desc">${item.description}</p>
          <div class="food-footer">
            <span class="food-price">$${item.price.toFixed(2)}</span>
            <button class="add-cart-btn" onclick="addToCart(${item.id})"><i class="fas fa-plus"></i> Add</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Filter Event Triggers
function filterCategory(categoryName, element) {
  currentCategoryFilter = categoryName;
  if (element) {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
  }
  loadMenu();
}

function filterDietary(type, element) {
  currentDietFilter = type;
  document.querySelectorAll('.diet-btn').forEach(b => b.classList.remove('active'));
  element.classList.add('active');
  loadMenu();
}

function resetFilters() {
  currentCategoryFilter = "All";
  currentDietFilter = "all";
  currentSearchQuery = "";
  document.getElementById('menuSearchInput').value = "";
  renderCategories();
  loadMenu();
}

// --- Cart Operations ---
function addToCart(itemId, qty = 1) {
  const existing = cart.find(i => i.itemId === itemId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ itemId, quantity: qty });
  }
  saveState();
  updateCartBadges();
  renderCartPage();
  const item = foodItems.find(i => i.id === itemId);
  showToast(`Added <strong>${item ? item.name : 'Item'}</strong> to your cart!`);
}

function updateQuantity(itemId, delta) {
  const index = cart.findIndex(i => i.itemId === itemId);
  if (index !== -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveState();
    updateCartBadges();
    renderCartPage();
  }
}

function removeFromCart(itemId) {
  cart = cart.filter(i => i.itemId !== itemId);
  saveState();
  updateCartBadges();
  renderCartPage();
  showToast('Item removed from cart');
}

function updateCartBadges() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartBadgeCount');
  if (badge) badge.innerText = totalCount;
}

function calculateTotals() {
  let subtotal = 0;
  cart.forEach(cItem => {
    const item = foodItems.find(i => i.id === cItem.itemId);
    if (item) subtotal += item.price * cItem.quantity;
  });

  let deliveryFee = cart.length > 0 ? 2.99 : 0.00;
  let tax = subtotal * 0.05;
  let discount = 0;

  if (activeCoupon) {
    if (activeCoupon.discountPercent) discount = subtotal * (activeCoupon.discountPercent / 100);
    if (activeCoupon.fixedDiscount) discount = Math.min(subtotal, activeCoupon.fixedDiscount);
    if (activeCoupon.freeDelivery) deliveryFee = 0;
  }

  const grandTotal = Math.max(0, subtotal + tax + deliveryFee - discount);
  return { subtotal, deliveryFee, tax, discount, grandTotal };
}

// --- Render Cart Page ---
function renderCartPage() {
  const container = document.getElementById('cartItemsContainer');
  const summaryBox = document.getElementById('cartSummaryContainer');
  if (!container || !summaryBox) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <i class="fas fa-shopping-basket" style="font-size: 3.5rem; color: var(--border-color); margin-bottom: 16px;"></i>
        <h3>Your shopping cart is empty</h3>
        <p style="color: var(--text-muted); max-width: 400px; margin: 8px auto 20px auto;">Looks like you haven't added any delicious meals yet.</p>
        <button class="btn-primary" onclick="document.getElementById('menu').scrollIntoView()">Explore Menu</button>
      </div>
    `;
    summaryBox.style.display = 'none';
    return;
  }

  summaryBox.style.display = 'block';

  container.innerHTML = cart.map(cItem => {
    const item = foodItems.find(i => i.id === cItem.itemId);
    if (!item) return '';
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)} each</p>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button>
          <span class="qty-val">${cItem.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button>
        </div>
        <div class="cart-item-price">$${(item.price * cItem.quantity).toFixed(2)}</div>
        <button style="background:none; border:none; color: var(--text-muted); font-size: 1.1rem;" onclick="removeFromCart(${item.id})">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  }).join('');

  const totals = calculateTotals();

  summaryBox.innerHTML = `
    <h3 style="margin-bottom: 20px; font-size: 1.25rem;">Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>$${totals.subtotal.toFixed(2)}</span></div>
    <div class="summary-row"><span>Estimated Tax (5%)</span><span>$${totals.tax.toFixed(2)}</span></div>
    <div class="summary-row"><span>Delivery Fee</span><span>$${totals.deliveryFee.toFixed(2)}</span></div>
    ${totals.discount > 0 ? `
      <div class="summary-row" style="color: var(--veg-green); font-weight: 700;">
        <span>Promo Discount</span>
        <span>-$${totals.discount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="coupon-box">
      <input type="text" id="couponInput" placeholder="Promo Code (e.g. FRESH20)" value="${activeCoupon ? activeCoupon.code : ''}">
      <button class="btn-primary" style="padding: 8px 16px; border-radius: var(--radius-sm);" onclick="applyCoupon()">Apply</button>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>$${totals.grandTotal.toFixed(2)}</span>
    </div>
    <button class="btn-primary" style="width: 100%; margin-top: 20px; padding: 14px 0;" onclick="goToCheckout()">Proceed to Checkout <i class="fas fa-arrow-right"></i></button>
  `;
}

// --- REST API: Apply Coupon ---
async function applyCoupon() {
  const code = document.getElementById('couponInput')?.value.trim();
  if (!code) return;

  try {
    const res = await fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const json = await res.json();
    if (json.success) {
      activeCoupon = { ...json.coupon, code: json.code };
      renderCartPage();
      showToast(`Coupon <strong>${json.code}</strong> applied successfully!`);
    } else {
      showToast(json.message || 'Invalid promo code', 'error');
    }
  } catch (err) {
    showToast('Failed to apply coupon', 'error');
  }
}

function goToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  document.getElementById('checkout').scrollIntoView();
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const summaryBox = document.getElementById('checkoutOrderItems');
  if (!summaryBox) return;

  const totals = calculateTotals();
  summaryBox.innerHTML = `
    <div style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
      ${cart.map(cItem => {
        const item = foodItems.find(i => i.id === cItem.itemId);
        return `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.92rem;">
            <span>${cItem.quantity}x ${item ? item.name : 'Food Item'}</span>
            <span style="font-weight: 700;">$${((item ? item.price : 0) * cItem.quantity).toFixed(2)}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="summary-row"><span>Subtotal</span><span>$${totals.subtotal.toFixed(2)}</span></div>
    <div class="summary-row"><span>Delivery Fee</span><span>$${totals.deliveryFee.toFixed(2)}</span></div>
    <div class="summary-row"><span>Tax</span><span>$${totals.tax.toFixed(2)}</span></div>
    ${totals.discount > 0 ? `<div class="summary-row" style="color: var(--veg-green);"><span>Discount</span><span>-$${totals.discount.toFixed(2)}</span></div>` : ''}
    <div class="summary-row total"><span>Total Payable</span><span>$${totals.grandTotal.toFixed(2)}</span></div>
  `;
}

/// --- Payment Method Selection & Live Preview ---
let selectedPaymentMethod = 'card';

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.payment-methods .pay-card').forEach(c => c.classList.remove('active'));

  document.getElementById('cardPaymentForm').style.display = 'none';
  document.getElementById('upiPaymentForm').style.display = 'none';
  document.getElementById('codPaymentForm').style.display = 'none';

  if (method === 'card') {
    document.getElementById('payMethodCard')?.classList.add('active');
    document.getElementById('cardPaymentForm').style.display = 'block';
  } else if (method === 'upi') {
    document.getElementById('payMethodUpi')?.classList.add('active');
    document.getElementById('upiPaymentForm').style.display = 'block';
  } else if (method === 'cod') {
    document.getElementById('payMethodCod')?.classList.add('active');
    document.getElementById('codPaymentForm').style.display = 'block';
  }
}

function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '');
  val = val.replace(/(.{4})/g, '$1 ').trim();
  input.value = val.substring(0, 19);
}

function updateCardPreview() {
  const name = document.getElementById('cardNameInput')?.value || "ALEX MORGAN";
  const num = document.getElementById('cardNumberInput')?.value || "4532 8892 1029 8892";
  const exp = document.getElementById('cardExpiryInput')?.value || "12/28";

  const numDisplay = document.getElementById('cardPreviewNumber');
  const nameDisplay = document.getElementById('cardPreviewName');
  const expDisplay = document.getElementById('cardPreviewExpiry');

  if (numDisplay) numDisplay.innerText = num.length > 0 ? num : "•••• •••• •••• ••••";
  if (nameDisplay) nameDisplay.innerText = name.toUpperCase();
  if (expDisplay) expDisplay.innerText = exp;
}

// --- REST API: Place Order & Process Payment ---
async function placeOrder() {
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }

  const address = document.getElementById('checkoutAddress')?.value || "742 Evergreen Terrace, Springfield";
  const totals = calculateTotals();

  let paymentPayload = {
    paymentMethod: selectedPaymentMethod,
    amount: totals.grandTotal
  };

  if (selectedPaymentMethod === 'card') {
    const name = document.getElementById('cardNameInput')?.value;
    const num = document.getElementById('cardNumberInput')?.value;
    const exp = document.getElementById('cardExpiryInput')?.value;
    const cvv = document.getElementById('cardCvvInput')?.value;

    if (!num || num.replace(/\s/g, '').length < 13 || !exp || !cvv) {
      showToast('Please enter complete Credit/Debit Card details', 'error');
      return;
    }
    paymentPayload.cardDetails = { cardName: name, cardNumber: num, expiry: exp, cvv };
  } else if (selectedPaymentMethod === 'upi') {
    const upi = document.getElementById('upiIdInput')?.value;
    if (!upi || !upi.includes('@')) {
      showToast('Please enter a valid UPI VPA ID (e.g. name@gpay)', 'error');
      return;
    }
    paymentPayload.upiId = upi;
  }

  // Show Payment Processing Spinner Overlay
  const processingModal = document.getElementById('paymentProcessingModal');
  if (processingModal) processingModal.classList.add('active');

  let transactionId = `TXN-${Date.now().toString().slice(-8)}`;

  try {
    // 1. Process Online Payment via REST API Backend
    const payRes = await fetch('/api/payment/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload)
    });
    const payJson = await payRes.json();

    if (!payJson.success) {
      if (processingModal) processingModal.classList.remove('active');
      showToast(payJson.message || 'Payment failed', 'error');
      return;
    }

    transactionId = payJson.transactionId;

    // 2. Submit Order to Backend
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        address,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        transactionId,
        couponCode: activeCoupon ? activeCoupon.code : null
      })
    });
    const orderJson = await orderRes.json();

    if (processingModal) processingModal.classList.remove('active');

    if (orderJson.success) {
      const newOrder = { ...orderJson.data, transactionId };
      orders.unshift(newOrder);
      cart = [];
      activeCoupon = null;
      saveState();
      updateCartBadges();
      renderCartPage();
      renderAccountPage();
      openTrackerModal(newOrder);
    }
  } catch (err) {
    if (processingModal) processingModal.classList.remove('active');

    // Fallback if backend server is offline
    const fallbackOrder = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionId: transactionId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      items: cart.map(cItem => {
        const item = foodItems.find(i => i.id === cItem.itemId);
        return { name: item ? item.name : 'Item', qty: cItem.quantity, price: item ? item.price : 0 };
      }),
      total: totals.grandTotal,
      status: "Preparing",
      address: address,
      paymentMethod: selectedPaymentMethod.toUpperCase()
    };
    orders.unshift(fallbackOrder);
    cart = [];
    activeCoupon = null;
    saveState();
    updateCartBadges();
    renderCartPage();
    renderAccountPage();
    openTrackerModal(fallbackOrder);
  }
}

// --- Live Order Tracker Modal & Payment Receipt ---
function openTrackerModal(order) {
  const modal = document.getElementById('trackerModal');
  const content = document.getElementById('trackerModalBody');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <i class="fas fa-check-circle" style="font-size: 3.5rem; color: var(--veg-green); margin-bottom: 12px;"></i>
      <h2>Payment Verified & Order Confirmed!</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">Order ID: <strong>${order.id}</strong></p>
      
      <div style="display: inline-flex; align-items: center; gap: 8px; background: #E8F5E9; color: #2E7D32; padding: 6px 16px; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 700;">
        <i class="fas fa-shield-alt"></i> Paid via ${order.paymentMethod || 'Online Payment'} • Txn: ${order.transactionId || 'TXN-9842019'}
      </div>
    </div>

    <div class="tracker-stepper">
      <div class="tracker-progress-bar" id="trackerProgress" style="width: 25%;"></div>
      <div class="step-item active" id="step1">
        <div class="step-icon"><i class="fas fa-receipt"></i></div>
        <h5>Order Received</h5>
      </div>
      <div class="step-item" id="step2">
        <div class="step-icon"><i class="fas fa-utensils"></i></div>
        <h5>Preparing</h5>
      </div>
      <div class="step-item" id="step3">
        <div class="step-icon"><i class="fas fa-motorcycle"></i></div>
        <h5>Out for Delivery</h5>
      </div>
      <div class="step-item" id="step4">
        <div class="step-icon"><i class="fas fa-home"></i></div>
        <h5>Delivered</h5>
      </div>
    </div>

    <div style="background: var(--bg-cream); padding: 20px; border-radius: var(--radius-md); text-align: center; margin-bottom: 24px;">
      <h4 style="font-size: 1.1rem; margin-bottom: 4px;">Estimated Delivery Time</h4>
      <h2 style="color: var(--primary-orange); font-size: 2.2rem;" id="deliveryCountdown">25:00 min</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0;">Driver: Alex (Yamaha FZ) • +1 (555) 888-9900</p>
    </div>
  `;

  modal.classList.add('active');

  setTimeout(() => {
    document.getElementById('step2')?.classList.add('active');
    const bar = document.getElementById('trackerProgress');
    if (bar) bar.style.width = '50%';
  }, 4000);

  setTimeout(() => {
    document.getElementById('step3')?.classList.add('active');
    const bar = document.getElementById('trackerProgress');
    if (bar) bar.style.width = '75%';
  }, 10000);
}

// --- Product Detail Modal ---
async function openProductModal(itemId) {
  let item = foodItems.find(i => i.id === itemId);
  try {
    const res = await fetch(`/api/food/${itemId}`);
    const json = await res.json();
    if (json.success) item = json.data;
  } catch (err) {
    console.warn('API error, using cached product', err);
  }

  if (!item) return;

  const modal = document.getElementById('productModal');
  const content = document.getElementById('productModalContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
    <img class="product-modal-img" src="${item.image}" alt="${item.name}">
    <div class="product-modal-body">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <h2>${item.name}</h2>
          <p style="color: var(--primary-orange); font-weight: 700;"><i class="fas fa-store"></i> ${item.restaurantName}</p>
        </div>
        <span class="food-price" style="font-size: 1.6rem;">$${item.price.toFixed(2)}</span>
      </div>
      <p style="color: var(--text-muted); margin-bottom: 20px;">${item.description}</p>
      
      <h4>Ingredients</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 20px 0;">
        ${item.ingredients.map(ing => `<span style="background: var(--bg-cream); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: var(--radius-pill); font-size: 0.85rem;">${ing}</span>`).join('')}
      </div>

      <h4>Nutritional Information</h4>
      <div class="nutrition-grid">
        <div class="nutrition-item"><h5>Calories</h5><p>${item.nutrition.calories} kcal</p></div>
        <div class="nutrition-item"><h5>Protein</h5><p>${item.nutrition.protein}</p></div>
        <div class="nutrition-item"><h5>Carbs</h5><p>${item.nutrition.carbs}</p></div>
        <div class="nutrition-item"><h5>Fat</h5><p>${item.nutrition.fat}</p></div>
      </div>

      <div style="display: flex; gap: 16px; align-items: center;">
        <button class="btn-primary" style="flex: 1; padding: 14px;" onclick="addToCart(${item.id}); closeModal();">Add to Order • $${item.price.toFixed(2)}</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// --- Wishlist Management ---
function toggleWishlist(itemId) {
  const index = wishlist.indexOf(itemId);
  if (index === -1) {
    wishlist.push(itemId);
    showToast('Saved to your wishlist! ❤️');
  } else {
    wishlist.splice(index, 1);
    showToast('Removed from wishlist');
  }
  saveState();
  loadMenu();
  renderAccountPage();
}

// --- Render Account Page ---
function renderAccountPage() {
  const orderList = document.getElementById('accountOrderHistory');
  const wishlistContainer = document.getElementById('accountWishlistContainer');
  if (!orderList) return;

  if (orders.length === 0) {
    orderList.innerHTML = `<p style="color: var(--text-muted);">No past orders yet.</p>`;
  } else {
    orderList.innerHTML = orders.map(ord => `
      <div class="order-card">
        <div class="order-head">
          <div>
            <strong>Order ID: ${ord.id}</strong>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${ord.date}</div>
          </div>
          <span class="status-badge ${ord.status.toLowerCase()}">${ord.status}</span>
        </div>
        <div style="margin-bottom: 12px; font-size: 0.9rem;">
          ${ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 1.1rem; color: var(--primary-orange);">$${ord.total.toFixed(2)}</strong>
          <button class="btn-outline" style="font-size: 0.85rem; padding: 6px 16px;" onclick="reorderItems('${ord.id}')">Reorder</button>
        </div>
      </div>
    `).join('');
  }

  if (wishlistContainer) {
    const wishItems = foodItems.filter(i => wishlist.includes(i.id));
    if (wishItems.length === 0) {
      wishlistContainer.innerHTML = `<p style="color: var(--text-muted);">Your wishlist is empty.</p>`;
    } else {
      wishlistContainer.innerHTML = wishItems.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${item.image}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
            <div>
              <h4 style="font-size: 0.95rem;">${item.name}</h4>
              <span style="color: var(--primary-orange); font-weight: 700;">$${item.price.toFixed(2)}</span>
            </div>
          </div>
          <button class="btn-primary" style="font-size: 0.85rem; padding: 6px 14px;" onclick="addToCart(${item.id})">Add to Cart</button>
        </div>
      `).join('');
    }
  }
}

function reorderItems(orderId) {
  const ord = orders.find(o => o.id === orderId);
  if (ord) {
    ord.items.forEach(i => {
      const match = foodItems.find(f => f.name === i.name);
      if (match) addToCart(match.id, i.qty);
    });
    document.getElementById('cart').scrollIntoView();
  }
}

// --- Toast Helper ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Add New Food Item (Chef Portal) ---
function updateImagePreview(url) {
  const box = document.getElementById('imagePreviewBox');
  if (box && url) {
    box.src = url;
  }
}

function selectPresetPhoto(url) {
  const input = document.getElementById('newItemImage');
  if (input) {
    input.value = url;
    updateImagePreview(url);
  }
}

async function handleAddNewItem(event) {
  event.preventDefault();

  const name = document.getElementById('newItemName')?.value;
  const price = document.getElementById('newItemPrice')?.value;
  const category = document.getElementById('newItemCategory')?.value;
  const restaurantName = document.getElementById('newItemRestaurant')?.value;
  const image = document.getElementById('newItemImage')?.value;
  const calories = document.getElementById('newItemCalories')?.value;
  const veg = document.getElementById('newItemVeg')?.checked;
  const vegan = document.getElementById('newItemVegan')?.checked;
  const glutenFree = document.getElementById('newItemGluten')?.checked;
  const description = document.getElementById('newItemDescription')?.value;

  const payload = {
    name,
    price: parseFloat(price),
    category,
    restaurantName: restaurantName || "Chef's Kitchen",
    image: image || "assets/images/margherita_pizza.png",
    calories: parseInt(calories) || 500,
    veg,
    vegan,
    glutenFree,
    description: description || "Fresh chef's creation.",
    ingredients: ["Fresh Ingredients", "House Sauce", "Chef Spices"]
  };

  try {
    const res = await fetch('/api/food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      foodItems.unshift(json.data);
      showToast(`Dish <strong>${json.data.name}</strong> added to menu successfully!`);
    }
  } catch (err) {
    // Fallback local insertion
    const fallbackItem = {
      id: foodItems.length + 1,
      name,
      price: parseFloat(price),
      category,
      restaurantId: 1,
      restaurantName: restaurantName || "Chef's Kitchen",
      veg,
      vegan,
      glutenFree,
      rating: 5.0,
      reviewsCount: 1,
      prepTime: "20 min",
      calories: parseInt(calories) || 500,
      image: image || "assets/images/margherita_pizza.png",
      description: description || "Fresh chef's creation.",
      ingredients: ["Fresh Ingredients", "House Sauce"],
      nutrition: { calories: calories || 500, protein: "25g", carbs: "50g", fat: "15g" }
    };
    foodItems.unshift(fallbackItem);
    showToast(`Dish <strong>${name}</strong> added to menu!`);
  }

  // Reset form
  document.getElementById('addNewItemForm')?.reset();
  selectPresetPhoto('assets/images/margherita_pizza.png');

  // Navigate to menu and refresh view
  document.getElementById('menu').scrollIntoView();
  loadMenu();
}

function saveState() {
  localStorage.setItem('freshbite_cart', JSON.stringify(cart));
  localStorage.setItem('freshbite_wishlist', JSON.stringify(wishlist));
  localStorage.setItem('freshbite_user', JSON.stringify(currentUser));
  localStorage.setItem('freshbite_orders', JSON.stringify(orders));
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  document.getElementById('menuSearchInput')?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    loadMenu();
  });

  document.getElementById('heroSearchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentSearchQuery = e.target.value;
      document.getElementById('menu').scrollIntoView();
      loadMenu();
    }
  });

  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    currentSortOption = e.target.value;
    loadMenu();
  });

  document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    placeOrder();
  });
}
