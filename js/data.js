// Единый источник данных. Цены — числа, id не повторяются.
const products = [
  { id: 1, slug: 'dome', title: 'Купол', category: 'home', price: 8900, isAvailable: true, image: 'dome', description: 'Широкий абажур и тёплый свет для стола или тумбы.', height: 38, power: 8, supply: 'От сети', badge: 'Хит' },
  { id: 2, slug: 'line', title: 'Линия', category: 'work', price: 6400, isAvailable: true, image: 'line', description: 'Регулируемое плечо для направленного света на рабочем столе.', height: 45, power: 10, supply: 'От сети', badge: 'Новинка' },
  { id: 3, slug: 'point', title: 'Точка', category: 'portable', price: 4700, isAvailable: true, image: 'point', description: 'Компактная аккумуляторная лампа для небольшого стола.', height: 28, power: 4, supply: 'Аккумулятор', badge: '' },
  { id: 4, slug: 'dome-mini', title: 'Купол Мини', category: 'home', price: 5900, isAvailable: true, image: 'dome', description: 'Младшая модель серии «Купол» для прикроватной тумбы.', height: 26, power: 5, supply: 'От сети', badge: '' },
  { id: 5, slug: 'line-pro', title: 'Линия Про', category: 'work', price: 9900, isAvailable: true, image: 'line', description: 'Увеличенная высота и яркий свет для большого рабочего стола.', height: 60, power: 14, supply: 'От сети', badge: '' },
  { id: 6, slug: 'point-mini', title: 'Точка Мини', category: 'portable', price: 3200, isAvailable: true, image: 'point', description: 'Лёгкая переносная модель для вечернего чтения.', height: 20, power: 3, supply: 'Аккумулятор', badge: '' },
  { id: 7, slug: 'dome-soft', title: 'Купол Софт', category: 'home', price: 10400, isAvailable: false, image: 'dome', description: 'Рассеянный свет для спокойного вечернего освещения.', height: 42, power: 9, supply: 'От сети', badge: '' },
  { id: 8, slug: 'line-mini', title: 'Линия Мини', category: 'work', price: 4500, isAvailable: true, image: 'line', description: 'Регулируемый светильник для компактного рабочего места.', height: 32, power: 6, supply: 'От сети', badge: '' },
  { id: 9, slug: 'point-plus', title: 'Точка Плюс', category: 'portable', price: 7200, isAvailable: false, image: 'point', description: 'Старшая аккумуляторная модель серии «Точка».', height: 34, power: 6, supply: 'Аккумулятор', badge: '' }
];

window.Shop = {
  products,
  categories: { home: 'Для дома', work: 'Для работы', portable: 'Переносные' },
  money(value) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  },
  // Текст всегда передаётся через textContent.
  element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.classList.add(...className.split(' '));
    if (text !== undefined) node.textContent = text;
    return node;
  },
  notify(text) {
    const message = document.querySelector('[data-shop-message]');
    if (message) message.textContent = text;
  }
};
