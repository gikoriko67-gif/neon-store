(() => {
  const cfg = window.SITE_CONFIG || {};
  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  const params = new URLSearchParams(location.search);
  const flow = params.get('flow');
  const amount = params.get('amount');
  const banks = [
    'Сбербанк','Т-Банк (Тинькофф)','ВТБ','Альфа-Банк','Газпромбанк','ПСБ','Совкомбанк',
    'Россельхозбанк','Московский кредитный банк (МКБ)','Райффайзенбанк','Банк Санкт-Петербург',
    'Озон Банк','Яндекс Банк','МТС Банк','Банк Русский Стандарт','Банк ДОМ.РФ','Ак Барс Банк',
    'Уралсиб','Почта Банк','ОТП Банк','Ренессанс Банк','Кредит Европа Банк','Новикомбанк',
    'Банк Россия','Банк ЗЕНИТ','Абсолют Банк','Банк Авангард','ББР Банк','Банк Левобережный',
    'Банк Кубань Кредит','Примсоцбанк','Дальневосточный банк','Кузнецкбизнесбанк','Челиндбанк',
    'Банк СГБ','Сургутнефтегазбанк','Экспобанк','Банк Интеза','ЮниКредит Банк','БКС Банк',
    'СБП (по номеру телефона)','ЮMoney','VK Pay','Кошелёк Ozon','WB Кошелёк','Яндекс Пэй','МОНЕТА.РУ',
    'МТС Деньги'
  ];
  const list = document.querySelector('#bank-list');
  const search = document.querySelector('#bank-search');
  const error = document.querySelector('#bank-error');
  if (!['usdt', 'stars'].includes(flow) || !amount || !/^\d+(?:\.\d+)?$/.test(amount)) {
    error.textContent = 'Не удалось определить операцию. Вернитесь на главную страницу.';
    return;
  }
  function render() {
    const q = search.value.trim().toLocaleLowerCase('ru');
    const found = banks.filter(name => name.toLocaleLowerCase('ru').includes(q));
    list.innerHTML = '';
    if (!found.length) {
      list.textContent = 'Вариант не найден. Попробуйте изменить запрос.';
      return;
    }
    found.forEach(name => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bank-option';
      button.textContent = name;
      button.addEventListener('click', () => {
        const key = flow === 'usdt' ? 'neonExchangeBank' : 'neonStarsBank';
        sessionStorage.setItem(key, JSON.stringify({ name }));
        location.href = flow === 'usdt'
          ? `payment.html?amount=${encodeURIComponent(amount)}`
          : `stars-payment.html?amount=${encodeURIComponent(amount)}`;
      });
      list.append(button);
    });
  }
  search.addEventListener('input', render);
  render();
})();
