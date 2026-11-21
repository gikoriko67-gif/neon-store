(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const format = (n) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits:2}).format(n);
  const dialog = $('#payment-dialog');
  let toastTimer;
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }
  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  document.querySelectorAll('[data-product-name]').forEach(el => el.textContent = cfg.productName || 'Мой мод');
  document.querySelectorAll('[data-rate]').forEach(el => el.textContent = cfg.exchangeRateRub || 90);
  $('[data-support-link]').href = cfg.supportTelegram || '#';
  $('#support-link').href = cfg.supportTelegram || '#';
  $('#year').textContent = new Date().getFullYear();
  $('[data-usdt-price]').textContent = `${cfg.productUsdtPrice || '5.00'} USDT`;
  $('#wallet-address').textContent = cfg.usdtWalletAddress || 'АДРЕС НЕ НАСТРОЕН';

  function openPayment(kind) {
    const isUsdt = kind === 'usdt';
    $('#modal-title').textContent = isUsdt ? 'Оплата USDT' : 'Оплата Telegram Stars';
    $('#modal-description').textContent = isUsdt
      ? 'Отправьте точную сумму в сети TRC20 на указанный адрес. Перед переводом обязательно проверьте реквизиты.'
      : 'Откройте Telegram по платёжной ссылке и следуйте инструкциям.';
    $('#usdt-details').classList.toggle('hidden', !isUsdt);
    $('#stars-details').classList.toggle('hidden', isUsdt);
    const payLink = $('#payment-link');
    if (isUsdt) {
      payLink.classList.add('hidden');
    } else if (cfg.starsPaymentUrl) {
      payLink.href = cfg.starsPaymentUrl; payLink.classList.remove('hidden');
    } else {
      payLink.classList.add('hidden');
      $('#modal-description').textContent += ' Ссылка оплаты ещё не настроена — свяжитесь с поддержкой.';
    }
    dialog.showModal();
  }
  document.querySelectorAll('[data-pay]').forEach(btn => btn.addEventListener('click', () => { if (btn.dataset.pay === 'stars') { window.location.href = 'neurogram-stars-payment.html'; return; } openPayment(btn.dataset.pay); }));
  const productUsdtButton = $('#product-usdt-pay');
  if (productUsdtButton) productUsdtButton.addEventListener('click', () => { window.location.href = 'neurogram-payment.html'; });
  $('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  $('#copy-address').addEventListener('click', async () => {
    const address = cfg.usdtWalletAddress || '';
    if (!address) return toast('Сначала укажите адрес кошелька в config.js');
    try { await navigator.clipboard.writeText(address); toast('Адрес скопирован'); }
    catch { toast('Не удалось скопировать — выдели адрес вручную'); }
  });

  const amount = $('#amount'), result = $('#rub-result');
  function calculate() {
    const value = Number(amount.value);
    const rate = Number(cfg.exchangeRateRub || 90);
    result.textContent = `${format(Number.isFinite(value) && value > 0 ? value * rate : 0)} ₽`;
  }
  amount.addEventListener('input', calculate); calculate();
  const destinationInput = $('#exchange-destination');
  const destinationLabel = $('#exchange-destination-label');
  function updateExchangePayoutField(type) {
    const isPhone = type === 'phone';
    destinationLabel.textContent = isPhone ? 'Номер телефона для выплаты' : 'Номер банковской карты для выплаты';
    destinationInput.type = isPhone ? 'tel' : 'text';
    destinationInput.placeholder = isPhone ? '+7 900 000-00-00' : '0000 0000 0000 0000';
    destinationInput.maxLength = isPhone ? 32 : 23;
    destinationInput.value = '';
  }
  document.querySelectorAll('input[name="exchange-payout"]').forEach(radio => {
    radio.addEventListener('change', () => updateExchangePayoutField(radio.value));
  });
  $('#exchange-submit').addEventListener('click', () => {
    const value = Number(amount.value);
    const min = Number(cfg.exchangeMinimumUsdt || 5);
    if (!Number.isFinite(value) || value < min) return toast(`Минимум для обмена — ${min} USDT`);
    const payoutType = document.querySelector('input[name="exchange-payout"]:checked')?.value || 'phone';
    const payoutValue = destinationInput.value.trim();
    const digits = payoutValue.replace(/\D/g, '');
    if (!payoutValue) return toast('Укажите реквизиты для получения рублей');
    if (payoutType === 'phone' && digits.length < 10) return toast('Проверьте номер телефона');
    if (payoutType === 'card' && (digits.length < 13 || digits.length > 19)) return toast('Проверьте номер банковской карты');
    try {
      sessionStorage.setItem('neonExchangePayout', JSON.stringify({ type: payoutType, value: payoutValue }));
    } catch (_) {
      return toast('Браузер не разрешил временно сохранить реквизиты. Проверьте настройки хранилища сайта.');
    }
    window.location.href = `payment.html?amount=${encodeURIComponent(value)}`;
  });

  // Продажа Telegram Stars
  const starsAmount = $('#stars-amount');
  const starsResult = $('#stars-rub-result');
  const starsRate = Number(cfg.starsSellRateRub || 0);
  const starsMin = Number(cfg.starsSellMinimum || 315);
  document.querySelectorAll('[data-stars-rate]').forEach(el => {
    el.textContent = starsRate > 0 ? format(starsRate) : 'Не задан';
  });
  function calculateStars() {
    const count = Math.floor(Number(starsAmount.value));
    if (!starsRate || !Number.isFinite(count) || count <= 0) {
      starsResult.textContent = starsRate > 0 ? '— ₽' : 'Укажите курс';
      return;
    }
    starsResult.textContent = `${format(count * starsRate)} ₽`;
  }
  starsAmount.min = String(starsMin);
  starsAmount.addEventListener('input', calculateStars);
  calculateStars();

  const starsDestination = $('#stars-destination');
  const starsDestinationLabel = $('#stars-destination-label');
  function updateStarsPayoutField(type) {
    const isPhone = type === 'phone';
    starsDestinationLabel.textContent = isPhone ? 'Номер телефона для выплаты' : 'Номер банковской карты для выплаты';
    starsDestination.type = isPhone ? 'tel' : 'text';
    starsDestination.placeholder = isPhone ? '+7 900 000-00-00' : '0000 0000 0000 0000';
    starsDestination.maxLength = isPhone ? 32 : 23;
    starsDestination.value = '';
  }
  document.querySelectorAll('input[name="stars-payout"]').forEach(radio => {
    radio.addEventListener('change', () => updateStarsPayoutField(radio.value));
  });
  $('#stars-sell-submit').addEventListener('click', () => {
    const count = Math.floor(Number(starsAmount.value));
    if (!Number.isFinite(count) || count < starsMin) return toast(`Минимум для продажи — ${starsMin} Stars`);
    if (count % 5 !== 0) return toast('Количество Stars должно делиться на 5: доступны подарки на 15, 25, 50 и 100 Stars');
    if (!starsRate || starsRate <= 0) return toast('Продажа Stars пока не настроена: укажите курс в config.js');
    if (!cfg.starsSellBotUrl) return toast('Сначала укажите ссылку на Telegram-бота в config.js');
    const payoutType = document.querySelector('input[name="stars-payout"]:checked')?.value || 'phone';
    const payoutValue = starsDestination.value.trim();
    const digits = payoutValue.replace(/\D/g, '');
    if (!payoutValue) return toast('Укажите реквизиты для получения рублей');
    if (payoutType === 'phone' && digits.length < 10) return toast('Проверьте номер телефона');
    if (payoutType === 'card' && (digits.length < 13 || digits.length > 19)) return toast('Проверьте номер банковской карты');
    try {
      sessionStorage.setItem('neonStarsSell', JSON.stringify({ type: payoutType, value: payoutValue }));
    } catch (_) {
      return toast('Не удалось временно сохранить реквизиты. Проверьте настройки хранилища браузера.');
    }
    window.location.href = `stars-payment.html?amount=${encodeURIComponent(count)}`;
  });

})();