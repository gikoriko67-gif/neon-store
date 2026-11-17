(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const fmt = n => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(n);
  const params = new URLSearchParams(location.search);
  const amount = Math.floor(Number(params.get('amount')));
  const min = Number(cfg.starsSellMinimum || 300);
  const rate = Number(cfg.starsSellRateRub || 0);

  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  $('[data-support-link]').href = cfg.supportTelegram || '#';

  let payout = null;
  try { payout = JSON.parse(sessionStorage.getItem('neonStarsSell') || 'null'); } catch (_) {}

  if (!Number.isFinite(amount) || amount < min || !rate || rate <= 0 || !payout || !payout.value || !['phone', 'card'].includes(payout.type)) {
    $('.payment-intro').textContent = 'Данные продажи не найдены. Вернитесь на главную страницу, укажите количество Stars и реквизиты для выплаты.';
    $('#stars-pay-amount').textContent = '—';
    $('#stars-pay-rub').textContent = '—';
    $('#stars-payout-method').textContent = '—';
    $('#stars-payout-destination').textContent = 'Не указаны';
    $('#stars-bot-link').classList.add('hidden');
    $('#stars-bot-missing').classList.remove('hidden');
    return;
  }

  $('#stars-pay-amount').textContent = `${fmt(amount)} ⭐`;
  $('#stars-pay-rub').textContent = `${fmt(amount * rate)} ₽`;
  $('#stars-payout-method').textContent = payout.type === 'phone' ? 'По номеру телефона' : 'На банковскую карту';
  $('#stars-payout-destination').textContent = payout.value;

  if (cfg.starsSellBotUrl) {
    $('#stars-bot-link').href = cfg.starsSellBotUrl;
  } else {
    $('#stars-bot-link').classList.add('hidden');
    $('#stars-bot-missing').classList.remove('hidden');
  }
})();