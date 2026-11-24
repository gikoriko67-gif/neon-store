(() => {
 const cfg=window.SITE_CONFIG||{}; const recipient=cfg.starsGiftRecipient||'@NeuroGramAdmin';
 document.querySelectorAll('[data-store-name]').forEach(el=>el.textContent=cfg.storeName||'NEON STORE');
 document.querySelectorAll('[data-support-link]').forEach(el=>el.href=cfg.supportTelegram||'#');
 document.querySelector('#gift-recipient').textContent=recipient;
 document.querySelector('a.gift-action').href=`https://t.me/${recipient.replace(/^@/,'')}`;
 document.querySelector('#copy-gift-recipient').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(recipient);document.querySelector('#copy-gift-recipient').textContent='Скопировано ✓';}catch(_){alert('Username: '+recipient);}});
 document.querySelector('#product-gifts-sent').addEventListener('click',()=>{
  const button=document.querySelector('#product-gifts-sent'); const status=document.querySelector('#product-gifts-status');
  button.disabled=true; status.textContent='Проверка...'; status.className='payment-status checking';
  window.setTimeout(()=>{status.textContent='Подарки не отправлены';status.className='payment-status failed';button.disabled=false;},1400);
 });
})();