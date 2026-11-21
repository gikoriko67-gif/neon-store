(() => {
 const cfg=window.SITE_CONFIG||{};
 document.querySelectorAll('[data-store-name]').forEach(el=>el.textContent=cfg.storeName||'NEON STORE');
 const params=new URLSearchParams(location.search); const flow=params.get('flow'); const amount=params.get('amount');
 const banks=['Сбербанк','Т-Банк (Тинькофф)','ВТБ','Альфа-Банк','Газпромбанк','ПСБ','Совкомбанк','Россельхозбанк','Московский кредитный банк (МКБ)','Райффайзенбанк','Росбанк','Почта Банк','ОТП Банк','Банк Санкт-Петербург','Уралсиб','Ак Барс Банк','МТС Банк','Озон Банк','Яндекс Банк','Банк Русский Стандарт','Банк ДОМ.РФ','Ренессанс Банк','Кредит Европа Банк','Новикомбанк'];
 const list=document.querySelector('#bank-list'), search=document.querySelector('#bank-search'), error=document.querySelector('#bank-error');
 if(!['usdt','stars'].includes(flow)||!amount){error.textContent='Не удалось определить операцию. Вернитесь на главную страницу.';return;}
 function render(){const q=search.value.trim().toLocaleLowerCase('ru');const found=banks.filter(b=>b.toLocaleLowerCase('ru').includes(q));list.innerHTML='';if(!found.length){list.textContent='Банк не найден. Попробуйте изменить запрос.';return;}found.forEach(name=>{const button=document.createElement('button');button.type='button';button.className='bank-option';button.textContent=name;button.addEventListener('click',()=>{const key=flow==='usdt'?'neonExchangeBank':'neonStarsBank';sessionStorage.setItem(key,JSON.stringify({name}));location.href=flow==='usdt'?`payment.html?amount=${encodeURIComponent(amount)}`:`stars-payment.html?amount=${encodeURIComponent(amount)}`;});list.append(button);});}
 search.addEventListener('input',render);render();
})();
