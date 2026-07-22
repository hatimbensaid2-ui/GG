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

  /* ---------- size guide modal ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-size-guide-open]')) {
      var m = $('[data-size-guide]');
      if (m) { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    }
    if (e.target.closest('[data-size-guide-close]')) {
      var m2 = $('[data-size-guide]');
      if (m2) { m2.classList.remove('is-open'); document.body.style.overflow = ''; }
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var m = $('[data-size-guide].is-open');
      if (m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
    }
  });

  /* ---------- size chart cm/inch toggle ---------- */
  document.addEventListener('click', function (e) {
    var u = e.target.closest('[data-sg-unit]');
    if (!u) return;
    var sg = u.closest('[data-sg]');
    if (!sg) return;
    var unit = u.getAttribute('data-sg-unit');
    $$('[data-sg-unit]', sg).forEach(function (b) { b.classList.toggle('is-active', b === u); });
    $$('[data-sg-cm]', sg).forEach(function (t) { t.hidden = unit !== 'cm'; });
    $$('[data-sg-in]', sg).forEach(function (t) { t.hidden = unit !== 'in'; });
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
     Predictive search
     ============================================================ */
  (function initPredictive() {
    var input = $('[data-predictive-input]');
    var results = $('[data-predictive-results]');
    if (!input || !results) return;
    var base = (CFG.routes && CFG.routes.search_url) ? CFG.routes.search_url : '/search';
    var timer, lastQ = '';

    function priceStr(p) {
      if (p == null || p === '') return '';
      if (typeof p === 'number') return formatMoney(p);
      if (/^\d+(\.\d+)?$/.test(p)) return formatMoney(Math.round(parseFloat(p) * 100));
      return p;
    }

    function render(data, q) {
      var r = (data.resources && data.resources.results) || {};
      var products = r.products || [];
      var collections = r.collections || [];
      var queries = r.queries || [];
      if (!products.length && !collections.length && !queries.length) {
        results.innerHTML = '<div class="predictive__empty">' + (CFG.strings.noResults || 'No matches for') + ' “' + q + '”</div>';
        return;
      }
      var left = '';
      if (queries.length) {
        left += '<div class="predictive__heading">' + (CFG.strings.suggestions || 'Suggestions') + '</div><ul class="predictive__links">' +
          queries.slice(0, 5).map(function (x) { return '<li><a href="' + x.url + '">' + x.text + '</a></li>'; }).join('') + '</ul>';
      }
      if (collections.length) {
        left += '<div class="predictive__heading">' + (CFG.strings.collections || 'Collections') + '</div><ul class="predictive__links">' +
          collections.slice(0, 5).map(function (x) { return '<li><a href="' + x.url + '">' + x.title + '</a></li>'; }).join('') + '</ul>';
      }
      var right = '';
      if (products.length) {
        right = '<div class="predictive__heading">' + (CFG.strings.products || 'Products') + '</div><div class="predictive__products">' +
          products.slice(0, 8).map(function (p) {
            var img = p.featured_image && p.featured_image.url ? p.featured_image.url : (p.image || '');
            var imgTag = img ? '<img src="' + img + '" alt="" loading="lazy">' : '';
            return '<a class="predictive-card" href="' + p.url + '"><div class="predictive-card__media">' + imgTag + '</div>' +
              '<div class="predictive-card__title">' + p.title + '</div>' +
              '<div class="predictive-card__price">' + priceStr(p.price) + '</div></a>';
          }).join('') + '</div>';
      }
      results.innerHTML = '<div class="predictive__cols"><div>' + (left || '') + '</div><div>' + right + '</div></div>';
    }

    function search(q) {
      var url = base + '/suggest.json?q=' + encodeURIComponent(q) +
        '&resources[type]=product,collection,query&resources[limit]=8&resources[options][unavailable_products]=last';
      fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(function (res) { return res.json(); })
        .then(function (data) { render(data, q); })
        .catch(function () { results.innerHTML = ''; });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      if (q.length < 2) { results.innerHTML = ''; lastQ = ''; return; }
      if (q === lastQ) return;
      lastQ = q;
      results.innerHTML = '<div class="predictive__loading">' + (CFG.strings.searching || 'Searching…') + '</div>';
      timer = setTimeout(function () { search(q); }, 240);
    });
  })();

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
      // line-level automatic discounts
      var lineDiscounts = '';
      (item.line_level_discount_allocations || []).forEach(function (d) {
        lineDiscounts += '<div class="cart-item__discount">' + (d.discount_application ? d.discount_application.title : d.title) + ' (&minus;' + formatMoney(d.amount) + ')</div>';
      });
      var priceHtml = item.original_line_price > item.final_line_price
        ? '<span class="cart-item__price-was">' + formatMoney(item.original_line_price) + '</span><span class="cart-item__price-now">' + formatMoney(item.final_line_price) + '</span>'
        : formatMoney(item.final_line_price);
      return '<div class="cart-item" data-line="' + (i + 1) + '">' +
        '<a class="cart-item__img" href="' + item.url + '">' + img + '</a>' +
        '<div><a href="' + item.url + '"><h4 class="cart-item__title">' + item.product_title + '</h4></a>' + variant + lineDiscounts +
        '<div class="cart-item__qty"><button data-qty-down aria-label="Decrease">&minus;</button><span>' + item.quantity + '</span><button data-qty-up aria-label="Increase">+</button></div>' +
        '<button class="cart-item__remove" data-remove>Remove</button></div>' +
        '<div class="cart-item__price">' + priceHtml + '</div></div>';
    }).join('');

    // cart-level automatic discounts + total savings
    var discEl = $('.cart-drawer__discounts', drawer);
    if (discEl) {
      var rows = '';
      (cart.cart_level_discount_applications || []).forEach(function (d) {
        rows += '<div class="cart-drawer__discount-row"><span>' + d.title + '</span><span>&minus;' + formatMoney(d.total_allocated_amount) + '</span></div>';
      });
      if (cart.total_discount > 0) {
        rows += '<div class="cart-drawer__discount-row cart-drawer__discount-row--total"><span>' + (CFG.strings.youSaved || 'You saved') + '</span><span>&minus;' + formatMoney(cart.total_discount) + '</span></div>';
      }
      discEl.innerHTML = rows;
    }

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

  /* ---------- discount code ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-discount-form]');
    if (!form) return;
    e.preventDefault();
    var code = (form.querySelector('[name="discount"]').value || '').trim();
    if (!code) return;
    var redirect = (CFG.routes && CFG.routes.cart_url) ? CFG.routes.cart_url : '/cart';
    window.location.href = '/discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent(redirect);
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
  /* ---------- product gallery: swipe + mouse drag ---------- */
  function initGallery(root, product) {
    var slider = $('[data-gallery]', root);
    if (!slider) return null;
    var slides = $$('.product__slide', slider);
    var thumbs = $$('.product__thumb', root);
    if (!slides.length) return null;

    function slideWidth() { return slider.clientWidth; }

    function currentIndex() {
      return Math.round(slider.scrollLeft / slideWidth());
    }

    function setActive(i) {
      thumbs.forEach(function (t, idx) { t.classList.toggle('is-active', idx === i); });
    }

    function goTo(i, smooth) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      slider.scrollTo({ left: i * slideWidth(), behavior: smooth === false ? 'auto' : 'smooth' });
      setActive(i);
    }

    // thumbnails jump
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        goTo(parseInt(thumb.getAttribute('data-index'), 10));
      });
    });

    // arrows
    var prev = $('[data-gallery-prev]', root);
    var next = $('[data-gallery-next]', root);
    if (prev) prev.addEventListener('click', function () { goTo(currentIndex() - 1); });
    if (next) next.addEventListener('click', function () { goTo(currentIndex() + 1); });

    // keep active thumb in sync while scrolling / swiping
    var scrollTimer;
    slider.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { setActive(currentIndex()); }, 60);
    });

    // mouse drag to scroll
    var down = false, startX = 0, startScroll = 0, moved = false;
    slider.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // native touch scroll handles it
      down = true; moved = false;
      startX = e.clientX; startScroll = slider.scrollLeft;
      slider.classList.add('is-dragging');
      slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      slider.scrollLeft = startScroll - dx;
    });
    function endDrag(e) {
      if (!down) return;
      down = false;
      slider.classList.remove('is-dragging');
      if (moved) goTo(currentIndex()); // snap to nearest
    }
    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);
    slider.addEventListener('pointerleave', endDrag);
    // prevent click navigation right after a drag
    slider.addEventListener('click', function (e) { if (moved) { e.preventDefault(); } }, true);

    // recalc on resize
    window.addEventListener('resize', function () { setActive(currentIndex()); });

    setActive(0);
    return { goTo: goTo, currentIndex: currentIndex };
  }

  function initProduct(root) {
    var dataEl = $('[data-product-json]', root);
    if (!dataEl) return;
    var product = JSON.parse(dataEl.textContent);
    var selected = {};
    var form = $('[data-product-form]', root);
    var idInput = form ? form.querySelector('[name="id"]') : null;
    var priceEls = $$('[data-price]', root);
    var addBtn = $('[data-add-btn]', root);
    var stickyAdd = $('[data-sticky-add]', root);
    var gallery = initGallery(root, product);

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
        var html = '<span class="' + (v.compare_at_price > v.price ? 'price__sale' : '') + '">' + formatMoney(v.price) + '</span>';
        if (v.compare_at_price > v.price) html += ' <span class="price__compare">' + formatMoney(v.compare_at_price) + '</span>';
        priceEls.forEach(function (el) { el.innerHTML = html; });
        [addBtn, stickyAdd].forEach(function (btn) {
          if (!btn) return;
          btn.disabled = !v.available;
          btn.textContent = v.available ? (CFG.strings.addToCart || 'Add to bag') : (CFG.strings.soldOut || 'Sold out');
        });
        if (v.featured_media && gallery) {
          gallery.goTo(v.featured_media.position - 1);
        }
      } else {
        [addBtn, stickyAdd].forEach(function (btn) { if (btn) { btn.disabled = true; btn.textContent = 'Unavailable'; } });
      }
    }

    // sticky add-to-cart mirrors the main button
    if (stickyAdd && addBtn) {
      stickyAdd.addEventListener('click', function () { addBtn.click(); });
    }
    if (addBtn && 'IntersectionObserver' in window) {
      var stickyBar = $('[data-pdp-sticky]', root);
      if (stickyBar) {
        new IntersectionObserver(function (entries) {
          stickyBar.classList.toggle('is-visible', !entries[0].isIntersecting);
        }, { rootMargin: '0px 0px -10% 0px' }).observe(addBtn);
      }
    }

    $$('.option-pill', root).forEach(function (pill) {
      pill.addEventListener('click', function () {
        var idx = parseInt(pill.getAttribute('data-option-index'), 10);
        selected[idx] = pill.getAttribute('data-value');
        update();
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
