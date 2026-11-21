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
  let bank = 'Не выбран';
  try { bank = JSON.parse(sessionStorage.getItem('neonExchangeBank') || '{}').name || bank; } catch (_) {}
  const bankTile = document.querySelector('#payout-bank'); if (bankTile) bankTile.textContent = bank;
  $('#pay-amount').textContent = `${fmt(amount)} USDT`;
  $('#pay-rub').textContent = `${fmt(rub)} ₽`;
  $('#payout-method').textContent = payout.type === 'phone' ? 'По номеру телефона' : 'На банковскую карту';
  $('#payout-destination').textContent = payout.value;

  $('#copy-exchange-wallet').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(wallet); $('#copy-exchange-wallet').textContent = 'Адрес скопирован ✓'; }
    catch (_) { toast('Не удалось скопировать. Выделите адрес и скопируйте его вручную.'); }
  });

  $('#exchange-sent').addEventListener('click', () => {
    const button = $('#exchange-sent');
    const status = $('#exchange-check-status');
    button.disabled = true;
    status.textContent = 'Проверка...';
    status.className = 'payment-status checking';
    window.setTimeout(() => {
      status.textContent = 'USDT не отправлены';
      status.className = 'payment-status failed';
      $('#exchange-check-note').textContent = 'Это демонстрационный результат: статический сайт не подключён к блокчейну и не может проверить перевод.';
      button.disabled = false;
    }, 1400);
  });
})();
