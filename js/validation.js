(function () {
  const shop = window.Shop;

  function prepareOrder() {
    const form = document.querySelector('#order-form');
    if (!form) return;
    const select = form.elements.product;
    shop.products.forEach(function (product) {
      const option = shop.element('option', '', product.title + ' — ' + shop.money(product.price) + (product.isAvailable ? '' : ' (нет в наличии)'));
      option.value = product.id;
      option.disabled = !product.isAvailable;
      select.append(option);
    });
    const query = new URLSearchParams(window.location.search);
    const chosen = shop.products.find(function (product) { return product.id === Number(query.get('product')) && product.isAvailable; });
    if (chosen) select.value = String(chosen.id);
    else if (query.get('source') === 'cart' && shop.cart.getLines().length) select.value = 'cart';

    shop.updateOrderSummary = function () {
      const cartOption = select.querySelector('[data-cart-option]');
      cartOption.disabled = shop.cart.getLines().length === 0;
      if (select.value === 'cart' && cartOption.disabled) select.value = '';
      const summary = document.querySelector('[data-order-summary]');
      summary.replaceChildren();
      if (select.value === 'cart') {
        const lines = shop.cart.getLines();
        const list = shop.element('ul');
        lines.forEach(function (line) {
          list.append(shop.element('li', '', line.product.title + ' × ' + line.quantity + ' — ' + shop.money(line.product.price * line.quantity)));
        });
        const amounts = shop.cart.totals();
        summary.append(shop.element('h2', '', 'Состав заявки'), list);
        if (amounts.discount) summary.append(shop.element('p', '', 'Скидка SVET10: ' + shop.money(amounts.discount)));
        summary.append(shop.element('strong', '', 'Итого: ' + shop.money(amounts.total)));
      } else {
        const product = shop.products.find(function (product) { return product.id === Number(select.value); });
        if (product) summary.append(shop.element('p', '', product.title + ', 1 шт. — ' + shop.money(product.price)));
      }
      summary.hidden = !select.value;
    };
    select.addEventListener('change', shop.updateOrderSummary);
    shop.updateOrderSummary();
  }

  function errorFor(field) {
    const value = field.value.trim();
    if (field.type === 'checkbox') return field.checked ? '' : 'Подтвердите согласие на обработку данных.';
    if (field.required && !value) return 'Заполните это поле.';
    if (!value) return '';
    if (field.name === 'name' && (value.length < 2 || value.length > 50)) return 'Укажите имя длиной от 2 до 50 символов.';
    if (field.type === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || field.validity.typeMismatch)) return 'Введите e-mail, например name@example.com.';
    if (field.type === 'tel') {
      const digits = value.replace(/[\s()+-]/g, '');
      if (!/^[78][0-9]{10}$/.test(digits)) return 'Введите российский номер: +7 или 8 и ещё 10 цифр.';
    }
    if (field.name === 'product') {
      if (value === 'cart') return shop.cart.getLines().length ? '' : 'Корзина пуста. Выберите модель.';
      if (!shop.products.some(function (product) { return product.id === Number(value) && product.isAvailable; })) return 'Выберите доступную модель.';
    }
    if (field.name === 'question' && value.length < 10) return 'Напишите вопрос длиной не менее 10 символов.';
    if (field.maxLength > 0 && value.length > field.maxLength) return 'Не более ' + field.maxLength + ' символов.';
    return '';
  }

  function initForm(form) {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const message = form.querySelector('[data-form-message]');
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = submit.textContent;
    const errors = new Map();
    let pending = false;
    fields.forEach(function (field) {
      const error = shop.element('p', 'field-error');
      error.id = field.id + '-error';
      error.hidden = true;
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
      const container = field.closest('.order-form__field, .order-form__consent');
      container.append(error);
      errors.set(field, error);
    });

    function showError(field, text) {
      const error = errors.get(field);
      error.textContent = text;
      error.hidden = !text;
      field.classList.toggle('is-invalid', Boolean(text));
      if (text) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function clearMessage() {
      message.hidden = true;
      message.textContent = '';
      message.classList.remove('form-message--error');
    }

    function handleEdit(event) {
      if (!errors.has(event.target) || pending) return;
      clearMessage();
      if (event.target.hasAttribute('aria-invalid')) showError(event.target, errorFor(event.target));
    }
    form.addEventListener('input', handleEdit);
    form.addEventListener('change', handleEdit);
    form.addEventListener('reset', function (event) {
      if (pending) { event.preventDefault(); return; }
      fields.forEach(function (field) { showError(field, ''); });
      clearMessage();
      if (form.id === 'order-form') setTimeout(shop.updateOrderSummary, 0);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (pending) return;
      const invalid = [];
      fields.forEach(function (field) {
        const error = errorFor(field);
        showError(field, error);
        if (error) invalid.push(field);
      });
      message.hidden = false;
      message.classList.toggle('form-message--error', invalid.length > 0);
      if (invalid.length) {
        message.textContent = 'Проверьте отмеченные поля. Ошибок: ' + invalid.length + '.';
        invalid[0].focus();
        return;
      }
      // Имитация запроса. Данные никуда не отправляются и не сохраняются.
      const name = form.elements.namedItem('name').value.trim();
      const summary = form.id === 'order-form'
        ? Array.from(document.querySelector('[data-order-summary]').querySelectorAll('li, p, strong'))
          .map(function (node) { return node.textContent; }).join('; ')
        : '';
      pending = true;
      form.setAttribute('aria-busy', 'true');
      const controls = Array.from(form.querySelectorAll('input, select, textarea, button'));
      const previousDisabled = controls.map(function (control) { return control.disabled; });
      controls.forEach(function (control) { control.disabled = true; });
      submit.textContent = 'Подготовка…';
      message.textContent = form.id === 'order-form' ? 'Подготавливаем учебную заявку…' : 'Подготавливаем учебное сообщение…';
      window.setTimeout(function () {
        pending = false;
        controls.forEach(function (control, index) { control.disabled = previousDisabled[index]; });
        form.reset();
        if (form.id === 'order-form') shop.updateOrderSummary();
        submit.textContent = submitLabel;
        form.removeAttribute('aria-busy');
        message.textContent = name + ', ' + (form.id === 'order-form' ? 'заявка подготовлена. ' + summary + '. ' : 'сообщение подготовлено. ') + 'Это учебная имитация: данные не отправлялись.';
        message.hidden = false;
        message.focus();
      }, 650);
    });
  }

  shop.initValidation = function () {
    prepareOrder();
    document.querySelectorAll('[data-validate-form]').forEach(initForm);
  };
})();
