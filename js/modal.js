(function () {
  window.Shop.initModal = function () {
    const modal = document.querySelector('#order-modal');
    if (!modal) return;
    let trigger = null;
    document.addEventListener('click', function (event) {
      const button = event.target.closest('[data-open-modal]');
      if (!button) return;
      const product = window.Shop.products.find(function (product) { return product.id === Number(button.dataset.openModal); });
      if (!product || !product.isAvailable) return;
      trigger = button;
      modal.querySelector('#modal-title').textContent = 'Заявка: ' + product.title;
      modal.querySelector('[data-modal-description]').textContent = product.title + ' — ' + window.Shop.money(product.price) + '. Выберите эту модель в форме заявки.';
      modal.querySelector('[data-modal-link]').href = 'order.html?product=' + product.id;
      modal.showModal();
    });
    modal.querySelector('[data-close-modal]').addEventListener('click', function () { modal.close(); });
    modal.addEventListener('close', function () { if (trigger) trigger.focus(); });
    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      const controls = modal.querySelectorAll('a[href], button:not([disabled])');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    // Escape обрабатывается самим dialog.
  };
})();
