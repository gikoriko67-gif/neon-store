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

  $('#product-sent').addEventListener('click', () => {
    const button = $('#product-sent'); const status = $('#product-check-status');
    button.disabled = true; status.textContent = 'Проверка...'; status.className = 'payment-status checking';
    window.setTimeout(() => { status.textContent = 'USDT не отправлены'; status.className = 'payment-status failed'; $('#product-check-note').textContent = 'Это демонстрационный результат: статический сайт не подключён к блокчейну и не может проверить перевод.'; button.disabled = false; }, 1400);
  });
})();
