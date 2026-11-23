// defer сохраняет порядок файлов и позволяет открывать HTML без сборки.
(function () {
  const shop = window.Shop;
  shop.cart.init();
  shop.catalog.init();
  shop.catalog.initPopular();
  shop.catalog.initProducts();
  shop.initModal();
  shop.initValidation();
})();
