/* =============================================
   MALFUFA — theme.js (Salla Platform)
   Header logic: Delivery/Pickup, Address, Cart
   ============================================= */

// ---- FULFILLMENT TABS (Delivery / Pickup) ----
function setFulfillment(mode, btn) {
  document.querySelectorAll('.fulfillment-tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  localStorage.setItem('malfufa_fulfillment', mode);

  // Hide address selector for pickup mode
  const addrEl = document.getElementById('address-selector');
  if (addrEl) {
    addrEl.style.opacity = mode === 'pickup' ? '0.4' : '1';
    addrEl.style.pointerEvents = mode === 'pickup' ? 'none' : 'auto';
  }
}

// ---- ADDRESS PANEL TOGGLE ----
function toggleAddressPanel() {
  const selector = document.getElementById('address-selector');
  if (!selector) return;
  selector.classList.toggle('open');
  if (selector.classList.contains('open')) {
    setTimeout(() => {
      const input = document.getElementById('address-input');
      if (input) input.focus();
    }, 50);
  }
}

function selectAddress(address) {
  const textEl = document.getElementById('selected-address-text');
  if (textEl) textEl.textContent = address;
  localStorage.setItem('malfufa_address', address);
  const selector = document.getElementById('address-selector');
  if (selector) selector.classList.remove('open');
}

// Address search filter
function initAddressSearch() {
  const input = document.getElementById('address-input');
  if (!input) return;
  input.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.address-list li').forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// Close dropdown on outside click
function initOutsideClick() {
  document.addEventListener('click', function (e) {
    const selector = document.getElementById('address-selector');
    if (selector && !selector.contains(e.target)) {
      selector.classList.remove('open');
    }
  });
}

// Restore saved state on page load
function restoreState() {
  const savedAddress = localStorage.getItem('malfufa_address');
  if (savedAddress) {
    const el = document.getElementById('selected-address-text');
    if (el) el.textContent = savedAddress;
  }
  const savedMode = localStorage.getItem('malfufa_fulfillment') || 'delivery';
  const btn = document.querySelector(`.tab[data-mode="${savedMode}"]`);
  if (btn) setFulfillment(savedMode, btn);
}

// ---- ADD TO CART — uses Salla's event system ----
function sallaAddToCart(productId, btn, quantity) {
  quantity = parseInt(quantity) || 1;
  const originalHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.innerHTML = '<span>...</span>';

  // Salla uses their global `salla` JS object for cart operations
  // This fires the Salla cart:add event which the platform handles natively
  if (window.salla) {
    salla.cart.addItem({ id: productId, quantity: quantity })
      .then(() => {
        btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>';
        btn.style.background = '#2d7a4f';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.classList.remove('loading');
        }, 2000);
      })
      .catch(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('loading');
      });
  } else {
    // Fallback: direct API call if salla object not yet available
    fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ product_id: productId, quantity: quantity })
    })
    .then(r => r.json())
    .then(data => {
      btn.innerHTML = '✓';
      btn.style.background = '#2d7a4f';
      // Update cart count badge
      const badge = document.querySelector('.cart-count');
      if (data.count !== undefined) {
        if (badge) badge.textContent = data.count;
      }
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.classList.remove('loading');
      }, 2000);
    })
    .catch(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('loading');
    });
  }
}

// ---- CART ITEM CONTROLS ----
function updateCartItem(itemId, newQty) {
  if (newQty < 1) { removeCartItem(itemId); return; }
  if (window.salla) {
    salla.cart.updateItem(itemId, { quantity: newQty }).then(() => location.reload());
  }
}

function removeCartItem(itemId) {
  if (window.salla) {
    salla.cart.deleteItem(itemId).then(() => location.reload());
  }
}

// ---- PRODUCT PAGE QTY ----
function changeQty(delta) {
  const input = document.getElementById('qty-input');
  if (!input) return;
  const newVal = Math.max(1, parseInt(input.value || 1) + delta);
  input.value = newVal;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function () {
  restoreState();
  initAddressSearch();
  initOutsideClick();
});

// Listen to Salla cart update events to refresh cart badge
if (window.salla) {
  salla.event.on('cart.updated', function (data) {
    const badge = document.querySelector('.cart-count');
    if (badge && data.count !== undefined) badge.textContent = data.count;
  });
}
