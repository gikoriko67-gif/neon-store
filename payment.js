(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const fmt = n => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(n);
  const params = new URLSearchParams(location.search);
  const amount = Number(params.get('amount'));
  const min = Number(cfg.exchangeMinimumUsdt || 5);
  const rate = Number(cfg.exchangeRateRub || 90);
  const wallet = 'TWNe16cgaRHS9APMiVH9DBQTFDxq6S73eF';

  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  $('[data-support-link]').href = cfg.supportTelegram || '#';

  let payout = null;
  try { payout = JSON.parse(sessionStorage.getItem('neonExchangePayout') || 'null'); } catch (_) {}

  const validAmount = Number.isFinite(amount) && amount >= min;
  if (!validAmount || !payout || !payout.value || !['phone', 'card'].includes(payout.type)) {
    $('.payment-intro').textContent = 'Данные обмена не найдены. Вернитесь в обменник, укажите сумму и реквизиты для выплаты, затем нажмите «Обменять USDT на RUB».';
    $('#pay-amount').textContent = '—';
    $('#pay-rub').textContent = '—';
    $('#payout-method').textContent = '—';
    $('#payout-destination').textContent = 'Не указаны';
    $('#notify-support').classList.add('hidden');
    return;
  }

  const rub = amount * rate;
  $('#pay-amount').textContent = `${fmt(amount)} USDT`;
  $('#pay-rub').textContent = `${fmt(rub)} ₽`;
  $('#payout-method').textContent = payout.type === 'phone' ? 'По номеру телефона' : 'На банковскую карту';
  $('#payout-destination').textContent = payout.value;

  const support = (cfg.supportTelegram || '').replace(/\/$/, '');
  const message = `Здравствуйте! Я отправляю ${fmt(amount)} USDT в сети TRC20 для обмена на ${fmt(rub)} RUB. Способ выплаты: ${payout.type === 'phone' ? 'по номеру телефона' : 'на банковскую карту'}. Реквизиты: ${payout.value}. После перевода отправьте TXID.`;
  if (support && support !== 'https://t.me') {
    $('#notify-support').href = `${support}?text=${encodeURIComponent(message)}`;
  } else {
    $('#notify-support').classList.add('hidden');
  }

  $('#copy-exchange-wallet').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      $('#copy-exchange-wallet').textContent = 'Адрес скопирован ✓';
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents($('#exchange-wallet'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      $('#copy-exchange-wallet').textContent = 'Выделите и скопируйте адрес';
    }
  });
})();