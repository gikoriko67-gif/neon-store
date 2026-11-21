(() => {
 const cfg=window.SITE_CONFIG||{}; const recipient=cfg.starsGiftRecipient||'@SoftgameV4seller';
 document.querySelectorAll('[data-store-name]').forEach(el=>el.textContent=cfg.storeName||'NEON STORE');
 document.querySelectorAll('[data-support-link]').forEach(el=>el.href=cfg.supportTelegram||'#');
 document.querySelector('#gift-recipient').textContent=recipient;
 document.querySelector('#copy-gift-recipient').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(recipient);document.querySelector('#copy-gift-recipient').textContent='Скопировано ✓';}catch(_){alert('Username: '+recipient);}});
 document.querySelector('#product-gifts-sent').addEventListener('click',()=>{const support=(cfg.supportTelegram||'').replace(/\/$/,'');const msg='Здравствуйте! Я отправил 3 подарка по 100 ⭐ для покупки NeuroGram. Прошу проверить отправку и выдать ключ.';if(/^https?:\/\/t\.me\/[A-Za-z0-9_]{5,}$/.test(support))window.open(`${support}?text=${encodeURIComponent(msg)}`,'_blank','noopener');else{try{navigator.clipboard.writeText(msg);alert('Сообщение скопировано. Отправьте его в поддержку для проверки.');}catch(_){alert('Свяжитесь с поддержкой для проверки подарков.');}}});
})();