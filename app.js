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
      ? 'Отправь точную сумму в сети TRC20 на указанный адрес. Перед переводом обязательно проверь реквизиты.'
      : 'Открой Telegram по платёжной ссылке и следуй инструкциям.';
    $('#usdt-details').classList.toggle('hidden', !isUsdt);
    $('#stars-details').classList.toggle('hidden', isUsdt);
    const payLink = $('#payment-link');
    if (isUsdt) {
      payLink.classList.add('hidden');
    } else if (cfg.starsPaymentUrl) {
      payLink.href = cfg.starsPaymentUrl; payLink.classList.remove('hidden');
    } else {
      payLink.classList.add('hidden');
      $('#modal-description').textContent += ' Ссылка оплаты ещё не настроена — свяжись с поддержкой.';
    }
    dialog.showModal();
  }
  document.querySelectorAll('[data-pay]').forEach(btn => btn.addEventListener('click', () => openPayment(btn.dataset.pay)));
  $('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  $('#copy-address').addEventListener('click', async () => {
    const address = cfg.usdtWalletAddress || '';
    if (!address) return toast('Сначала укажи адрес кошелька в config.js');
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
    const digits = payoutValue.replace(/\\D/g, '');
    if (!payoutValue) return toast('Укажи реквизиты для получения рублей');
    if (payoutType === 'phone' && digits.length < 10) return toast('Проверь номер телефона');
    if (payoutType === 'card' && (digits.length < 13 || digits.length > 19)) return toast('Проверь номер банковской карты');
    try {
      sessionStorage.setItem('neonExchangePayout', JSON.stringify({ type: payoutType, value: payoutValue }));
    } catch (_) {
      return toast('Браузер запретил временно сохранить реквизиты. Разреши хранилище сайта и повтори.');
    }
    window.location.href = `payment.html?amount=${encodeURIComponent(value)}`;
  });
})();