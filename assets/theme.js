/* ============================================================
   Girlgeous theme scripts
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.Girlgeous || {};

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function formatMoney(cents) {
    var value = (cents / 100).toFixed(2);
    var fmt = CFG.moneyFormat || '${{amount}}';
    return fmt.replace(/\{\{\s*amount\s*\}\}/, value)
              .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100));
  }

  function toast(msg) {
    var el = $('#Toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'Toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- overlay ---------- */
  function overlay() {
    var el = $('#Overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'Overlay';
      el.className = 'overlay';
      document.body.appendChild(el);
    }
    return el;
  }

  function openPanel(el) {
    if (!el) return;
    el.classList.add('is-open');
    overlay().classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
  function closePanels() {
    $$('.is-open.cart-drawer, .is-open.mobile-nav').forEach(function (p) { p.classList.remove('is-open'); });
    var s = $('#SearchModal'); if (s) s.classList.remove('is-open');
    overlay().classList.remove('is-active');
    document.body.style.overflow = '';
  }

  overlay().addEventListener('click', closePanels);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanels(); });

  /* ---------- mobile nav ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-open]')) { openPanel($('#MobileNav')); }
    if (e.target.closest('[data-menu-close]')) { closePanels(); }
    var sub = e.target.closest('.mobile-nav__toggle-sub');
    if (sub) { sub.closest('.mobile-nav__item').classList.toggle('is-open'); }
  });

  /* ---------- search modal ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-search-open]')) {
      var m = $('#SearchModal');
      if (m) { m.classList.add('is-open'); overlay().classList.add('is-active'); setTimeout(function(){ var i = $('.search-modal__input', m); if (i) i.focus(); }, 60); }
    }
    if (e.target.closest('[data-search-close]')) { closePanels(); }
  });

  /* ============================================================
     Cart
     ============================================================ */
  function getCart() {
    return fetch(CFG.routes.cart_url + '.js', { headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); });
  }

  function updateCartCount(count) {
    $$('.cart-count').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function shipBarHtml(total) {
    var threshold = CFG.freeShipThreshold || 0;
    if (!threshold) return '';
    var remaining = threshold - total;
    var pct = Math.min(100, (total / threshold) * 100);
    var msg = remaining > 0
      ? 'You’re ' + formatMoney(remaining) + ' away from free shipping ✨'
      : 'Yay! You’ve unlocked free shipping 🎀';
    return '<div class="cart-drawer__ship"><div>' + msg + '</div><div class="ship-bar"><div class="ship-bar__fill" style="width:' + pct + '%"></div></div></div>';
  }

  function renderCartDrawer(cart) {
    var drawer = $('#CartDrawer');
    if (!drawer) return;
    var itemsEl = $('.cart-drawer__items', drawer);
    var footEl = $('.cart-drawer__foot', drawer);
    var shipEl = $('.cart-drawer__ship-wrap', drawer);

    if (shipEl) shipEl.innerHTML = shipBarHtml(cart.total_price);

    if (!cart.item_count) {
      itemsEl.innerHTML = '<div class="cart-drawer__empty"><p>Your bag is empty.</p><a href="' + (CFG.routes.cart_url === '/cart' ? '/collections/all' : '/') + '" class="btn btn--accent" data-menu-close>Start shopping</a></div>';
      if (footEl) footEl.style.display = 'none';
      return;
    }
    if (footEl) footEl.style.display = 'block';

    itemsEl.innerHTML = cart.items.map(function (item, i) {
      var img = item.image ? '<img src="' + item.image.replace(/(\.[^.]*)$/, '_160x$1') + '" alt="" loading="lazy">' : '';
      var variant = item.variant_title && item.variant_title !== 'Default Title' ? '<div class="cart-item__variant">' + item.variant_title + '</div>' : '';
      return '<div class="cart-item" data-line="' + (i + 1) + '">' +
        '<a class="cart-item__img" href="' + item.url + '">' + img + '</a>' +
        '<div><a href="' + item.url + '"><h4 class="cart-item__title">' + item.product_title + '</h4></a>' + variant +
        '<div class="cart-item__qty"><button data-qty-down aria-label="Decrease">&minus;</button><span>' + item.quantity + '</span><button data-qty-up aria-label="Increase">+</button></div>' +
        '<button class="cart-item__remove" data-remove>Remove</button></div>' +
        '<div class="cart-item__price">' + formatMoney(item.final_line_price) + '</div></div>';
    }).join('');

    var sub = $('.cart-drawer__subtotal-value', drawer);
    if (sub) sub.textContent = formatMoney(cart.total_price);
  }

  function refreshCart(open) {
    return getCart().then(function (cart) {
      updateCartCount(cart.item_count);
      renderCartDrawer(cart);
      if (open && CFG.cartType === 'drawer') openPanel($('#CartDrawer'));
      return cart;
    });
  }

  function changeLine(line, quantity) {
    return fetch(CFG.routes.cart_change_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    }).then(function (r) { return r.json(); }).then(function (cart) {
      updateCartCount(cart.item_count);
      renderCartDrawer(cart);
      return cart;
    });
  }

  // cart drawer interactions
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-open]')) {
      e.preventDefault();
      if (CFG.cartType === 'drawer') { refreshCart(true); }
      else { window.location.href = CFG.routes.cart_url; }
    }
    var itemEl = e.target.closest('.cart-item');
    if (itemEl) {
      var line = parseInt(itemEl.getAttribute('data-line'), 10);
      var qty = parseInt($('.cart-item__qty span', itemEl).textContent, 10);
      if (e.target.closest('[data-qty-up]')) changeLine(line, qty + 1);
      if (e.target.closest('[data-qty-down]')) changeLine(line, Math.max(0, qty - 1));
      if (e.target.closest('[data-remove]')) changeLine(line, 0);
    }
  });

  /* ---------- add to cart (forms + quick add) ---------- */
  function addToCart(id, quantity, btn) {
    var original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    return fetch(CFG.routes.cart_add_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: id, quantity: quantity || 1 })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) { toast(res.data.description || 'Could not add to bag'); return; }
        if (btn) { btn.textContent = CFG.strings.added || 'Added!'; }
        refreshCart(true);
        setTimeout(function () { if (btn) { btn.textContent = original; btn.disabled = false; } }, 1400);
      }).catch(function () { toast('Something went wrong'); if (btn) { btn.textContent = original; btn.disabled = false; } });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    var idInput = form.querySelector('[name="id"]');
    var qtyInput = form.querySelector('[name="quantity"]');
    if (!idInput || !idInput.value) { toast('Please select options'); return; }
    addToCart(idInput.value, qtyInput ? parseInt(qtyInput.value, 10) : 1, form.querySelector('[data-add-btn]'));
  });

  document.addEventListener('click', function (e) {
    var quick = e.target.closest('[data-quick-add]');
    if (quick) {
      e.preventDefault();
      addToCart(quick.getAttribute('data-quick-add'), 1, quick);
    }
  });

  /* ============================================================
     Product page: variants, gallery, qty, accordions
     ============================================================ */
  function initProduct(root) {
    var dataEl = $('[data-product-json]', root);
    if (!dataEl) return;
    var product = JSON.parse(dataEl.textContent);
    var selected = {};
    var form = $('[data-product-form]', root);
    var idInput = form ? form.querySelector('[name="id"]') : null;
    var priceEl = $('[data-price]', root);
    var addBtn = $('[data-add-btn]', root);

    // default from first available variant
    var first = product.variants.find(function (v) { return v.available; }) || product.variants[0];
    if (first) { product.options.forEach(function (opt, i) { selected[i] = first['option' + (i + 1)]; }); }

    function currentVariant() {
      return product.variants.find(function (v) {
        return product.options.every(function (opt, i) { return v['option' + (i + 1)] === selected[i]; });
      });
    }

    function update() {
      $$('.option-pill', root).forEach(function (pill) {
        var idx = parseInt(pill.getAttribute('data-option-index'), 10);
        pill.classList.toggle('is-active', pill.getAttribute('data-value') === selected[idx]);
      });
      var v = currentVariant();
      if (v) {
        if (idInput) idInput.value = v.id;
        if (priceEl) {
          var html = '<span class="' + (v.compare_at_price > v.price ? 'price__sale' : '') + '">' + formatMoney(v.price) + '</span>';
          if (v.compare_at_price > v.price) html += ' <span class="price__compare">' + formatMoney(v.compare_at_price) + '</span>';
          priceEl.innerHTML = html;
        }
        if (addBtn) {
          addBtn.disabled = !v.available;
          addBtn.textContent = v.available ? (CFG.strings.addToCart || 'Add to bag') : (CFG.strings.soldOut || 'Sold out');
        }
        if (v.featured_image) {
          var main = $('.product__gallery-main img', root);
          if (main) main.src = v.featured_image.src;
        }
      } else if (addBtn) {
        addBtn.disabled = true;
        addBtn.textContent = 'Unavailable';
      }
    }

    $$('.option-pill', root).forEach(function (pill) {
      pill.addEventListener('click', function () {
        var idx = parseInt(pill.getAttribute('data-option-index'), 10);
        selected[idx] = pill.getAttribute('data-value');
        update();
      });
    });

    // gallery thumbnails
    $$('.product__thumb', root).forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-full');
        var main = $('.product__gallery-main img', root);
        if (main && src) main.src = src;
        $$('.product__thumb', root).forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });

    // qty stepper
    var qtyWrap = $('.product__qty', root);
    if (qtyWrap) {
      var input = $('input', qtyWrap);
      $$('button', qtyWrap).forEach(function (b) {
        b.addEventListener('click', function () {
          var val = parseInt(input.value, 10) || 1;
          val += b.hasAttribute('data-qty-up') ? 1 : -1;
          input.value = Math.max(1, val);
        });
      });
    }

    update();
  }

  // accordions (global)
  document.addEventListener('click', function (e) {
    var head = e.target.closest('.accordion__head');
    if (head) head.closest('.accordion').classList.toggle('is-open');
  });

  /* ============================================================
     Newsletter (client feedback only; Shopify handles submit)
     ============================================================ */
  // handled by native form + contact form; nothing extra needed

  /* ============================================================
     Init
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    $$('[data-product-root]').forEach(initProduct);
    refreshCart(false);
  });

  // re-init in theme editor
  document.addEventListener('shopify:section:load', function (e) {
    $$('[data-product-root]', e.target).forEach(initProduct);
  });

  window.GirlgeousAddToCart = addToCart;
})();
