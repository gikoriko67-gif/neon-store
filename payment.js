(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const fmt = n => new Intl.NumberFormat('ru-RU', {maximumFractionDigits:2}).format(n);
  const params = new URLSearchParams(location.search);
  const amount = Number(params.get('amount'));
  const min = Number(cfg.exchangeMinimumUsdt || 5);
  const rate = Number(cfg.exchangeRateRub || 90);
  const wallet = 'TWNe16cgaRHS9APMiVH9DBQTFDxq6S73eF';
  let payout = null;

  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  $('[data-support-link]').href = cfg.supportTelegram || '#';

  try {
    payout = JSON.parse(sessionStorage.getItem('neonExchangePayout') || 'null');
  } catch (_) {}

  const validAmount = Number.isFinite(amount) && amount >= min;
  if (!validAmount || !payout || !payout.value || !['phone','card'].includes(payout.type)) {
    $('#pay-amount').textContent = 'Данные не найдены';
    $('#pay-rub').textContent = '—';
    $('#payout-method').textContent = '—';
    $('#payout-destination').textContent = 'Вернись в обменник и заполни форму';
    $('#notify-support').classList.add('hidden');
    return;
  }

  const rub = amount * rate;
  const method = payout.type === 'phone' ? 'По номеру телефона' : 'На банковскую карту';
  $('#pay-amount').textContent = `${fmt(amount)} USDT`;
  $('#pay-rub').textContent = `${fmt(rub)} ₽`;
  $('#payout-method').textContent = method;
  $('#payout-destination').textContent = payout.value;

  const support = (cfg.supportTelegram || '').replace(/\/$/, '');
  const msg = `Здравствуйте! Хочу обменять ${fmt(amount)} USDT TRC20 на ${fmt(rub)} RUB. Выплата: ${method.toLowerCase()}, реквизиты: ${payout.value}. После перевода пришлю TXID.`;
  if (support && support !== 'https://t.me') {
    $('#notify-support').href = `${support}?text=${encodeURIComponent(msg)}`;
  } else {
    $('#notify-support').classList.add('hidden');
  }

  $('#copy-exchange-wallet').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      $('#copy-exchange-wallet').textContent = 'Скопировано ✓';
    } catch (_) {
      $('#copy-exchange-wallet').textContent = wallet;
    }
  });
})();