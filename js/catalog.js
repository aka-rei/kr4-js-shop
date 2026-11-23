(function () {
  const shop = window.Shop;

  function productImage(product, className) {
    const image = shop.element('img', className);
    const width = product.image === 'dome' ? 1536 : 1254;
    image.src = 'images/' + product.image + '.webp';
    image.srcset = 'images/' + product.image + '-480.webp 480w, images/' + product.image + '-960.webp 960w, images/' + product.image + '.webp ' + width + 'w';
    image.sizes = '(min-width: 1120px) 520px, (min-width: 768px) 45vw, calc(100vw - 32px)';
    image.alt = product.title + ' — ' + shop.categories[product.category].toLowerCase();
    image.width = width;
    image.height = product.image === 'dome' ? 1024 : 1254;
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function addButton(product) {
    const button = shop.element('button', 'button', product.isAvailable ? 'В корзину' : 'Нет в наличии');
    button.type = 'button';
    button.dataset.addCart = product.id;
    button.disabled = !product.isAvailable;
    button.setAttribute('aria-label', product.isAvailable ? 'Добавить в корзину: ' + product.title : product.title + ': нет в наличии');
    return button;
  }

  function createCard(product) {
    const card = shop.element('article', 'product-card');
    card.dataset.productId = product.id;
    const body = shop.element('div', 'product-card__body');
    const status = shop.element('p', 'product-card__availability', product.isAvailable ? 'В наличии' : 'Ожидается поступление');
    if (!product.isAvailable) status.classList.add('product-card__availability--unavailable');
    const actions = shop.element('div', 'product-card__actions');
    const detail = shop.element('a', 'button button--secondary', 'Подробнее');
    detail.href = 'product.html#' + product.slug;
    detail.setAttribute('aria-label', 'Подробнее: ' + product.title);
    actions.append(addButton(product), detail);
    body.append(shop.element('p', 'product-card__category', shop.categories[product.category]), shop.element('h3', 'product-card__title', product.title), shop.element('p', 'product-card__description', product.description), status, shop.element('p', 'product-card__price', shop.money(product.price)), actions);
    card.append(productImage(product, 'product-card__image'));
    if (product.badge) card.append(shop.element('span', 'product-card__badge', product.badge));
    card.append(body);
    return card;
  }

  function initCatalog() {
    const grid = document.querySelector('[data-catalog-grid]');
    if (!grid) return;
    const form = document.querySelector('#catalog-filters');
    const search = form.elements.search;
    const category = form.elements.category;
    const sort = form.elements.sort;
    const availability = form.elements.available;
    const empty = document.querySelector('[data-catalog-empty]');

    function render() {
      const query = search.value.trim().toLocaleLowerCase('ru-RU');
      const filtered = shop.products.filter(function (product) {
        return product.title.toLocaleLowerCase('ru-RU').includes(query)
          && (!category.value || product.category === category.value)
          && (!availability.checked || product.isAvailable);
      });
      // sort меняет массив на месте, поэтому сортируем отдельную копию.
      const sorted = [...filtered];
      if (sort.value === 'price-asc') sorted.sort(function (a, b) { return a.price - b.price; });
      if (sort.value === 'price-desc') sorted.sort(function (a, b) { return b.price - a.price; });
      if (sort.value === 'title') sorted.sort(function (a, b) { return a.title.localeCompare(b.title, 'ru'); });
      grid.replaceChildren(...sorted.map(createCard));
      empty.hidden = sorted.length !== 0;
      document.querySelector('[data-result-count]').textContent = 'Найдено товаров: ' + sorted.length + ' из ' + shop.products.length;
    }

    form.addEventListener('submit', function (event) { event.preventDefault(); });
    search.addEventListener('input', render);
    category.addEventListener('change', render);
    sort.addEventListener('change', render);
    availability.addEventListener('change', render);
    document.querySelectorAll('[data-reset-filters]').forEach(function (button) {
      button.addEventListener('click', function () { form.reset(); render(); search.focus(); });
    });
    render();
  }

  function initPopular() {
    const grid = document.querySelector('[data-popular-grid]');
    if (grid) grid.replaceChildren(...shop.products.slice(0, 3).map(createCard));
  }

  function initProducts() {
    const container = document.querySelector('[data-product-details]');
    if (!container) return;
    shop.products.forEach(function (product) {
      const article = shop.element('article', 'product');
      article.id = product.slug;
      article.setAttribute('aria-labelledby', product.slug + '-title');
      const info = shop.element('div');
      const heading = shop.element('h2', '', product.title);
      heading.id = product.slug + '-title';
      const specs = shop.element('dl', 'product-specs');
      [['Категория', shop.categories[product.category]], ['Высота', product.height + ' см'], ['Мощность', product.power + ' Вт'], ['Питание', product.supply]].forEach(function (pair) {
        specs.append(shop.element('dt', '', pair[0]), shop.element('dd', '', pair[1]));
      });
      const actions = shop.element('div', 'product-card__actions');
      actions.append(addButton(product));
      if (product.isAvailable) {
        const request = shop.element('button', 'button button--secondary', 'Оставить заявку');
        request.type = 'button';
        request.dataset.openModal = product.id;
        actions.append(request);
      }
      info.append(heading, shop.element('p', 'product__description', product.description), specs, shop.element('p', 'product__price', shop.money(product.price)), actions);
      article.append(productImage(product, 'product__image'), info);
      container.append(article);
    });
    function revealHash() {
      const article = Array.from(container.children).find(function (article) { return '#' + article.id === window.location.hash; });
      if (article) article.scrollIntoView();
    }
    requestAnimationFrame(revealHash);
    window.addEventListener('hashchange', revealHash);
  }

  shop.catalog = { init: initCatalog, initPopular, initProducts };
})();
