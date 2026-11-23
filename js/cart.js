// В хранилище попадают только id, количество и промокод, без контактных данных.
(function () {
  const shop = window.Shop;
  const storageKey = 'svet-kr4-cart-v1';
  let items = [];
  let promoCode = '';
  let storageAvailable = true;

  function readStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !Array.isArray(saved.items)) return;
      const unique = new Map();
      saved.items.forEach(function (item) {
        if (!item || !Number.isInteger(item.id) || !Number.isInteger(item.quantity)) return;
        const product = shop.products.find(function (product) { return product.id === item.id && product.isAvailable; });
        if (product && item.quantity > 0) unique.set(item.id, { id: item.id, quantity: Math.min(99, item.quantity) });
      });
      items = Array.from(unique.values());
      promoCode = saved.promoCode === 'SVET10' ? 'SVET10' : '';
    } catch (error) {
      // Повреждённый JSON или запрет storage не ломают текущую вкладку.
      storageAvailable = error.name !== 'SecurityError';
    }
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ items, promoCode }));
    } catch (error) { storageAvailable = false; }
  }

  function getLines() {
    return items.map(function (item) {
      return { product: shop.products.find(function (product) { return product.id === item.id; }), quantity: item.quantity };
    });
  }

  function totals() {
    const subtotal = getLines().reduce(function (sum, line) { return sum + line.product.price * line.quantity; }, 0);
    const discount = promoCode === 'SVET10' ? Math.round(subtotal * 0.1) : 0;
    return { subtotal, discount, total: subtotal - discount };
  }

  function update() {
    const count = items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (node) { node.textContent = count; });
    const note = document.querySelector('[data-storage-note]');
    if (note) note.hidden = storageAvailable;
    render();
  }

  function commit(message) {
    save();
    update();
    if (message) shop.notify(message);
  }

  function add(id) {
    const product = shop.products.find(function (product) { return product.id === id && product.isAvailable; });
    if (!product) return;
    const item = items.find(function (item) { return item.id === id; });
    if (item && item.quantity >= 99) { shop.notify('В корзине уже 99 штук этой модели.'); return; }
    if (item) item.quantity += 1;
    else items.push({ id, quantity: 1 });
    commit('«' + product.title + '» добавлен в корзину.');
  }

  function render() {
    const list = document.querySelector('[data-cart-items]');
    if (!list) return;
    const focus = document.activeElement;
    const focusId = focus && focus.dataset.cartId;
    const focusAction = focus && focus.dataset.cartAction;
    list.replaceChildren();
    const empty = items.length === 0;
    document.querySelector('[data-cart-empty]').hidden = !empty;
    document.querySelector('[data-cart-content]').hidden = empty;
    const amounts = totals();
    Object.keys(amounts).forEach(function (name) {
      document.querySelector('[data-cart-' + name + ']').textContent = shop.money(amounts[name]);
    });
    getLines().forEach(function (line) {
      const product = line.product;
      const row = shop.element('article', 'cart-item');
      const image = shop.element('img', 'cart-item__image');
      image.src = 'images/' + product.image + '-480.webp';
      image.alt = product.title;
      image.width = 120;
      image.height = 90;
      const info = shop.element('div', 'cart-item__info');
      const title = shop.element('h2', 'cart-item__title');
      const link = shop.element('a', '', product.title);
      link.href = 'product.html#' + product.slug;
      title.append(link);
      info.append(title, shop.element('p', '', shop.money(product.price) + ' за шт.'));
      const controls = shop.element('div', 'quantity');
      [['decrease', '−', 'Уменьшить количество'], ['increase', '+', 'Увеличить количество']].forEach(function (action, index) {
        const button = shop.element('button', 'button button--secondary', action[1]);
        button.type = 'button';
        button.dataset.cartAction = action[0];
        button.dataset.cartId = product.id;
        button.setAttribute('aria-label', action[2] + ': ' + product.title);
        button.disabled = index === 0 ? line.quantity <= 1 : line.quantity >= 99;
        if (index === 1) controls.append(shop.element('span', 'quantity__value', line.quantity + ' шт.'));
        controls.append(button);
      });
      const remove = shop.element('button', 'button button--secondary', 'Удалить');
      remove.type = 'button';
      remove.dataset.cartAction = 'remove';
      remove.dataset.cartId = product.id;
      remove.setAttribute('aria-label', 'Удалить из корзины: ' + product.title);
      row.append(image, info, controls, shop.element('strong', 'cart-item__sum', shop.money(product.price * line.quantity)), remove);
      list.append(row);
    });
    // После перерисовки сохраняем место клавиатурного фокуса.
    if (focusId && focusAction) {
      const replacement = list.querySelector('[data-cart-id="' + focusId + '"][data-cart-action="' + focusAction + '"]');
      const fallback = replacement && replacement.closest('.cart-item').querySelector('a');
      const next = replacement && !replacement.disabled ? replacement : fallback || list.querySelector('a') || document.querySelector('[data-cart-empty] a');
      if (next) next.focus();
    }
  }

  function initCart() {
    readStorage();
    update();
    document.addEventListener('click', function (event) {
      const addButton = event.target.closest('[data-add-cart]');
      if (addButton && !addButton.disabled) add(Number(addButton.dataset.addCart));
      const action = event.target.closest('[data-cart-action]');
      if (!action || action.disabled) return;
      const id = Number(action.dataset.cartId);
      const item = items.find(function (item) { return item.id === id; });
      if (!item) return;
      if (action.dataset.cartAction === 'remove') items = items.filter(function (item) { return item.id !== id; });
      else item.quantity = Math.max(1, Math.min(99, item.quantity + (action.dataset.cartAction === 'increase' ? 1 : -1)));
      commit('Корзина обновлена.');
    });
    const clear = document.querySelector('[data-clear-cart]');
    if (clear) clear.addEventListener('click', function () {
      items = [];
      promoCode = '';
      document.querySelector('#promo-code').value = '';
      document.querySelector('#promo-message').textContent = '';
      commit('Корзина очищена.');
      document.querySelector('[data-cart-empty] a').focus();
    });
    const promoForm = document.querySelector('#promo-form');
    if (promoForm) {
      promoForm.elements.promo.value = promoCode;
      const message = document.querySelector('#promo-message');
      if (promoCode) message.textContent = 'Промокод SVET10 применён: скидка 10%.';
      promoForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const value = promoForm.elements.promo.value.trim().toUpperCase();
        promoCode = value === 'SVET10' ? value : '';
        message.textContent = promoCode ? 'Промокод SVET10 применён: скидка 10%.' : value ? 'Промокод не найден. Скидка не применяется.' : 'Промокод удалён.';
        commit();
      });
    }
    window.addEventListener('storage', function (event) {
      if (event.key !== storageKey && event.key !== null) return;
      items = [];
      promoCode = '';
      readStorage();
      update();
      if (promoForm) {
        promoForm.elements.promo.value = promoCode;
        document.querySelector('#promo-message').textContent = promoCode ? 'Промокод SVET10 применён: скидка 10%.' : '';
      }
      if (shop.updateOrderSummary) shop.updateOrderSummary();
    });
  }

  shop.cart = { add, getLines, totals, init: initCart };
})();
