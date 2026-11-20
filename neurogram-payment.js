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
    const txid = $('#product-txid').value.trim();
    if (!txid) return toast('Сначала вставьте хеш транзакции (TXID)');
    const support = (cfg.supportTelegram || '').replace(/\/$/, '');
    const message = `Здравствуйте! Я оплатил NeuroGram: ${cfg.productUsdtPrice || '5.00'} USDT в сети TRC20. TXID: ${txid}. Прошу проверить оплату и выдать ключ.`;
    if (/^https?:\/\/t\.me\/[A-Za-z0-9_]{5,}$/.test(support)) {
      window.open(`${support}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      toast('Откройте Telegram и отправьте сообщение для ручной проверки');
    } else {
      try { await navigator.clipboard.writeText(message); toast('Сообщение с TXID скопировано. Отправьте его в поддержку Telegram.'); }
      catch (_) { toast('Поддержка не настроена. Скопируйте TXID и передайте его оператору вручную.'); }
    }
  });
})();
