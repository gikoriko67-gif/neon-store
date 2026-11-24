(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = s => document.querySelector(s);
  const fmt = n => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(n);
  const params = new URLSearchParams(location.search);
  const amount = Math.floor(Number(params.get('amount')));
  const min = Number(cfg.starsSellMinimum || 315);
  const rate = Number(cfg.starsSellRateRub || 0);
  const recipient = cfg.starsGiftRecipient || '@NeuroGramAdmin';
  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = cfg.storeName || 'NEON STORE');
  document.querySelectorAll('[data-support-link]').forEach(el => el.href = cfg.supportTelegram || '#');
  let payout = null;
  try { payout = JSON.parse(sessionStorage.getItem('neonStarsSell') || 'null'); } catch (_) {}
  if (!Number.isFinite(amount) || amount < min || amount % 5 !== 0 || !rate || rate <= 0 || !payout || !payout.value || !['phone', 'card'].includes(payout.type)) {
    $('.payment-intro').textContent = `Данные продажи не найдены или некорректны. Минимум — ${min} Stars, количество должно делиться на 5. Вернитесь на главную страницу и оформите заявку заново.`;
    $('#stars-pay-amount').textContent = '—'; $('#stars-pay-rub').textContent = '—';
    $('#stars-payout-method').textContent = '—'; $('#stars-payout-destination').textContent = 'Не указаны';
    $('#gift-instructions').textContent = 'Не удалось рассчитать подарки';
    $('#stars-sell-sent').disabled = true;
    return;
  }
  // Dynamic programming guarantees the minimum number of gifts for denominations 100, 50, 25, 15.
  const denominations = [100, 50, 25, 15];
  const dp = Array(amount + 1).fill(null); dp[0] = {count: 0, combo: [0,0,0,0]};
  for (let n = 1; n <= amount; n++) {
    for (let i = 0; i < denominations.length; i++) {
      const d = denominations[i];
      if (n >= d && dp[n-d]) {
        const candidate = {count: dp[n-d].count + 1, combo: dp[n-d].combo.slice()};
        candidate.combo[i]++;
        if (!dp[n] || candidate.count < dp[n].count) dp[n] = candidate;
      }
    }
  }
  const combo = dp[amount]?.combo || [0,0,0,0];
  const names = ['подарков за 100 звёзд', 'подарков за 50 звёзд', 'подарков за 25 звёзд', 'подарков за 15 звёзд'];
  const parts = combo.map((count, i) => count ? `${count} ${names[i]}` : '').filter(Boolean);
  let instruction = `Отправьте ${parts.join(', ').replace(/, ([^,]*)$/, ' и $1')} на указанный Username, затем вернитесь на сайт и нажмите кнопку «Отправил». После чего выплата будет обработана.`;
  $('#gift-instructions').textContent = instruction;
  $('#stars-pay-amount').textContent = `${fmt(amount)} ⭐`;
  $('#stars-pay-rub').textContent = `${fmt(amount * rate)} ₽`;
  $('#stars-payout-method').textContent = payout.type === 'phone' ? 'По номеру телефона' : 'На банковскую карту';
  $('#stars-payout-destination').textContent = payout.value;
  let bank = 'Не выбран'; try { bank = JSON.parse(sessionStorage.getItem('neonStarsBank') || '{}').name || bank; } catch (_) {}
  const bankEl = $('#stars-payout-bank'); if (bankEl) bankEl.textContent = bank;
  $('#gift-recipient').textContent = recipient;
  $('#open-gift-recipient').href = `https://t.me/${recipient.replace(/^@/, '')}`;
  $('#copy-gift-recipient').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(recipient); $('#copy-gift-recipient').textContent = 'Скопировано ✓'; }
    catch (_) { $('#copy-gift-recipient').textContent = recipient; }
  });
  $('#stars-sell-sent').addEventListener('click', () => {
    const button = $('#stars-sell-sent');
    const status = $('#stars-sell-status');
    button.disabled = true;
    status.textContent = 'Проверка...';
    status.className = 'payment-status checking';
    window.setTimeout(() => {
      status.textContent = 'Подарки не отправлены';
      status.className = 'payment-status failed';
      button.disabled = false;
    }, 1400);
  });
})();
