(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const wallet = cfg.usdtWalletAddress || 'TWNe16cgaRHS9APMiVH9DBQTFDxq6S73eF';
  let toastTimer;
  const toast = message => {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  };
  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  document.querySelectorAll('[data-support-link]').forEach(el => el.href = cfg.supportTelegram || '#');
  $('#product-pay-amount').textContent = `${cfg.productUsdtPrice || '5.00'} USDT`;
  $('#product-wallet').textContent = wallet;

  $('#copy-product-wallet').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(wallet); $('#copy-product-wallet').textContent = 'Адрес скопирован ✓'; }
    catch (_) { toast('Не удалось скопировать. Выделите адрес и скопируйте его вручную.'); }
  });

  $('#product-sent').addEventListener('click', async () => {
    const support = (cfg.supportTelegram || '').replace(/\/$/, '');
    const message = `Здравствуйте! Я отправил оплату за NeuroGram: ${cfg.productUsdtPrice || '5.00'} USDT в сети TRC20 на адрес ${wallet}. Прошу проверить поступление платежа и после подтверждения выдать ключ.`;
    if (/^https?:\/\/t\.me\/[A-Za-z0-9_]{5,}$/.test(support)) {
      window.open(`${support}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      toast('Отправьте подготовленное сообщение поддержке для проверки');
    } else {
      try { await navigator.clipboard.writeText(message); toast('Сообщение скопировано. Отправьте его в поддержку Telegram.'); }
      catch (_) { toast('Укажите ссылку поддержки в config.js, чтобы отправить заявку.'); }
    }
  });
})();
