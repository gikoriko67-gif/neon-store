(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const fmt = n => new Intl.NumberFormat('ru-RU', {maximumFractionDigits:2}).format(n);
  const params = new URLSearchParams(location.search);
  const amount = Number(params.get('amount'));
  const min = Number(cfg.exchangeMinimumUsdt || 5);
  const rate = Number(cfg.exchangeRateRub || 90);
  const validAmount = Number.isFinite(amount) && amount >= min;
  let payoutType = 'phone';
  let payoutValue = '';
  let toastTimer;

  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  $('[data-rate]').textContent = rate;
  $('[data-support-link]').href = cfg.supportTelegram || '#';
  $('#rate').textContent = rate;

  if (!validAmount) {
    $('#pay-amount').textContent = 'Некорректная сумма';
    $('#pay-rub').textContent = '—';
    $('#show-wallet').disabled = true;
    $('#show-wallet').textContent = 'Вернись в обменник и укажи сумму';
  } else {
    $('#pay-amount').textContent = `${fmt(amount)} USDT`;
    $('#pay-rub').textContent = `${fmt(amount * rate)} RUB`;
  }

  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function setPayoutType(type) {
    payoutType = type;
    const phone = type === 'phone';
    $('#destination-label').textContent = phone ? 'Номер телефона для выплаты' : 'Номер банковской карты для выплаты';
    $('#destination').type = phone ? 'tel' : 'text';
    $('#destination').placeholder = phone ? '+7 900 000-00-00' : '0000 0000 0000 0000';
    $('#destination').value = '';
    $('#destination').maxLength = phone ? 32 : 23;
  }
  document.querySelectorAll('input[name="payout"]').forEach(el => el.addEventListener('change', () => setPayoutType(el.value)));

  $('#show-wallet').addEventListener('click', () => {
    payoutValue = $('#destination').value.trim();
    if (!validAmount) return toast('Вернись в обменник и укажи корректную сумму');
    if (!payoutValue) return toast('Укажи номер для получения рублей');
    if (payoutType === 'card' && payoutValue.replace(/\D/g, '').length < 13) return toast('Проверь номер банковской карты');
    if (payoutType === 'phone' && payoutValue.replace(/\D/g, '').length < 10) return toast('Проверь номер телефона');

    $('#wallet-amount').textContent = `${fmt(amount)} USDT`;
    $('#payout-confirm').textContent = `Выплата: ${payoutType === 'phone' ? 'по номеру телефона' : 'на банковскую карту'} · ${payoutValue}`;
    $('#wallet-panel').classList.remove('hidden');
    $('#wallet-panel').scrollIntoView({behavior:'smooth', block:'start'});

    const payoutLabel = payoutType === 'phone' ? 'номер телефона' : 'номер карты';
    const msg = `Здравствуйте! Я отправил(а) заявку на обмен ${fmt(amount)} USDT TRC20 на ${fmt(amount * rate)} RUB. Выплата: ${payoutLabel} ${payoutValue}. После перевода пришлю TXID.`;
    const support = (cfg.supportTelegram || '').replace(/\/$/, '');
    const notify = $('#notify-support');
    if (support && support !== 'https://t.me') {
      notify.href = `${support}?text=${encodeURIComponent(msg)}`;
      notify.classList.remove('hidden');
    } else {
      notify.classList.add('hidden');
    }
  });

  $('#copy-exchange-wallet').addEventListener('click', async () => {
    const address = 'TWNe16cgaRHS9APMiVH9DBQTFDxq6S73eF';
    try { await navigator.clipboard.writeText(address); toast('Адрес кошелька скопирован'); }
    catch { toast('Не удалось скопировать — выдели адрес вручную'); }
  });
})();