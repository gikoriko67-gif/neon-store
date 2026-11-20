(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const fmt = n => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(n);
  const params = new URLSearchParams(location.search);
  const amount = Number(params.get('amount'));
  const min = Number(cfg.exchangeMinimumUsdt || 5);
  const rate = Number(cfg.exchangeRateRub || 90);
  const wallet = cfg.usdtWalletAddress || 'TWNe16cgaRHS9APMiVH9DBQTFDxq6S73eF';
  let toastTimer;
  const toast = message => {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  };
  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  document.querySelectorAll('[data-support-link]').forEach(el => el.href = cfg.supportTelegram || '#');
  $('#exchange-wallet').textContent = wallet;

  let payout = null;
  try { payout = JSON.parse(sessionStorage.getItem('neonExchangePayout') || 'null'); } catch (_) {}
  const validAmount = Number.isFinite(amount) && amount >= min;
  if (!validAmount || !payout || !payout.value || !['phone', 'card'].includes(payout.type)) {
    $('.payment-intro').textContent = 'Данные обмена не найдены. Вернитесь в обменник, укажите сумму и реквизиты для выплаты, затем нажмите «Обменять USDT на RUB».';
    $('#pay-amount').textContent = '—'; $('#pay-rub').textContent = '—';
    $('#payout-method').textContent = '—'; $('#payout-destination').textContent = 'Не указаны';
    $('#exchange-sent').disabled = true;
    return;
  }
  const rub = amount * rate;
  $('#pay-amount').textContent = `${fmt(amount)} USDT`;
  $('#pay-rub').textContent = `${fmt(rub)} ₽`;
  $('#payout-method').textContent = payout.type === 'phone' ? 'По номеру телефона' : 'На банковскую карту';
  $('#payout-destination').textContent = payout.value;

  $('#copy-exchange-wallet').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(wallet); $('#copy-exchange-wallet').textContent = 'Адрес скопирован ✓'; }
    catch (_) { toast('Не удалось скопировать. Выделите адрес и скопируйте его вручную.'); }
  });

  $('#exchange-sent').addEventListener('click', async () => {
    const txid = $('#exchange-txid').value.trim();
    if (!txid) return toast('Сначала вставьте хеш транзакции (TXID)');
    const support = (cfg.supportTelegram || '').replace(/\/$/, '');
    const message = `Здравствуйте! Я отправил ${fmt(amount)} USDT в сети TRC20 для обмена на ${fmt(rub)} RUB. Способ выплаты: ${payout.type === 'phone' ? 'по номеру телефона' : 'на банковскую карту'}. Реквизиты: ${payout.value}. TXID: ${txid}. Прошу проверить перевод.`;
    if (/^https?:\/\/t\.me\/[A-Za-z0-9_]{5,}$/.test(support)) {
      window.open(`${support}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      toast('Откройте Telegram и отправьте сообщение для ручной проверки');
    } else {
      try { await navigator.clipboard.writeText(message); toast('Сообщение с TXID скопировано. Отправьте его в поддержку Telegram.'); }
      catch (_) { toast('Поддержка не настроена. Скопируйте TXID и передайте его оператору вручную.'); }
    }
  });
})();
