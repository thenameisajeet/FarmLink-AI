/* ===========================================================
   FarmLink AI — Farmer Portal app.js
   Nav rendering · Language system · Sell modal · Listings/Orders
   =========================================================== */

/* ---------- Nav map (single source of truth) ---------- */
const farmerPages = [
  { id:'dashboard', key:'nav.dashboard', href:'index.html', group:'market',
    icon:'<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>' },
  { id:'sell-crop', key:'nav.sellCrop', href:'sell-crop.html', group:'market',
    icon:'<path d="M3 3h18M6 3v18M18 3v18M3 21h18M9 8h6M9 13h6"/>' },
  { id:'marketplace', key:'nav.marketplace', href:'marketplace.html', group:'market', badgeKey:'buyerCount',
    icon:'<path d="M3 9l1-5h16l1 5M3 9v11a1 1 0 0 0 1 1h4v-6h8v6h4a1 1 0 0 0 1-1V9M3 9h18"/>' },
  { id:'listings', key:'nav.listings', href:'listings.html', group:'market', badgeKey:'listingCount',
    icon:'<path d="M4 6h16M4 12h16M4 18h10"/>' },
  { id:'orders', key:'nav.orders', href:'orders.html', group:'market', badgeKey:'orderCount',
    icon:'<path d="M6 2l1.5 4h9L18 2M4 8h16l-1.5 12a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 8z"/>' },
  { id:'demand-forecast', key:'nav.demandForecast', href:'demand-forecast.html', group:'ai',
    icon:'<path d="M3 17l6-6 4 4 8-8M21 7v6h-6"/>' },
  { id:'route-optimizer', key:'nav.routeOptimizer', href:'route-optimizer.html', group:'ai',
    icon:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3H9a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h7"/>' },
  { id:'logistics', key:'nav.logistics', href:'logistics.html', group:'ai',
    icon:'<rect x="1" y="7" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7"/><circle cx="6" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/>' },
  { id:'payments', key:'nav.payments', href:'payments.html', group:'account',
    icon:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>' },
  { id:'support', key:'nav.support', href:'support.html', group:'account',
    icon:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 1.7-2.3 3.5M12 17h.01"/>' },
];
const FARMER_GROUPS = [
  { id:'market', key:'navgroup.market' },
  { id:'ai', key:'navgroup.ai' },
  { id:'account', key:'navgroup.account' }
];

/* ---------- i18n dictionaries ---------- */
const FL_I18N = {
en:{
  'navgroup.market':'Marketplace','navgroup.ai':'AI & Operations','navgroup.account':'Account',
  'nav.dashboard':'Dashboard','nav.sellCrop':'Sell Crop','nav.marketplace':'Buyer Marketplace',
  'nav.listings':'My Listings','nav.orders':'Orders','nav.demandForecast':'Demand Forecast',
  'nav.routeOptimizer':'Route Optimizer','nav.logistics':'Logistics','nav.payments':'Payments','nav.support':'Support',
  'greeting':'Good evening, Farmer','searchph':'Search buyers, crops, orders...',
  'hero.badge':'AI-Powered Direct Marketplace',
  'hero.title1':'Sell closer to the ','hero.title2':'source','hero.title3':'. Keep more of the value.',
  'hero.desc':'Connect your harvest directly with verified consumers and bulk buyers. Farm-gate listings, demand intelligence and smarter logistics — without unnecessary middle layers.',
  'hero.btnList':'List your harvest','hero.btnFind':'Find buyers',
  'stat.sales':"This month's direct sales",'stat.demand':'Active buyer demand','stat.demandSub':'High demand today',
  'stat.saving':'Average intermediary saving','stat.savingSub':'Across your recent sales',
  'stat.orders':'Orders in progress','stat.ordersSub':'need your action',
  'stat.realization':'Farmer realization','stat.realizationSub':'saved vs typical chain',
  'stat.buyers':'Verified buyers','stat.buyersSub':'currently seeking your crops',
  'stat.score':'Demand score','stat.scoreSub':'High for onion this week',
  'stat.logistics':'Avg. logistics saving','stat.logisticsSub':'AI route optimization',
  'forecast.title':'Onion demand forecast','forecast.sub':'Regional buyer demand • next 7 days','forecast.badge':'AI forecast',
  'ai.badge':'confidence','ai.title':'AI selling opportunity','ai.sub':'Based on current buyer demand',
  'ai.headline':'Demand is rising around Mumbai','ai.desc':'Bulk buyers are expected to need more Grade-A onion this week.',
  'ai.bestAction':'Best action','ai.next':'Next 2-4 days','ai.list5':'List 5 tonnes','ai.target':'Target buyer offer',
  'ai.confidence':'Demand confidence','ai.requests':'Buyer requests','ai.consumer':'Consumer demand','ai.consumerHigh':'High',
  'ai.sellthrough':'Expected sell-through',
  'buyer.title':'Direct buyer opportunities','buyer.sub':"Best matches for your 5T Grade-A onion lot",'buyer.viewall':'View all 18',
  'demand.title':'Where demand is strongest','demand.sub':'AI-ranked buyer clusters','demand.map':'Open map',
  'route.title':'AI route optimizer','route.sub':'For your current onion order','route.saved':'saved',
  'route.transport':'Estimated transport',
  'listings.title':'My active listings','listings.sub':'Harvest available to buyers',
  'impact.title':'Impact this month','impact.sub':'Value retained by going direct',
  'impact.retained':'Value retained','impact.reached':'Direct buyers reached','impact.avoided':'Intermediary layers avoided',
  'impact.fulfilled':'Orders fulfilled directly','impact.saving':'Average buyer saving',
  'quick.title':'Quick actions',
  'quick.list.title':'List your harvest','quick.list.sub':'Reach direct buyers',
  'quick.buyers.title':'Find bulk buyers','quick.buyers.sub':'Browse active demand',
  'quick.optimize.title':'Optimize delivery','quick.optimize.sub':'Reduce transport cost',
  'quick.manage.title':'Manage orders','quick.manage.sub':'actions required',
  'recent.title':'Recent orders',
  'trust.title':'Trust & payment health','trust.status':'Healthy',
  'trust.coverage':'Verified buyer coverage','trust.ontime':'On-time payments','trust.disputed':'Disputed orders','trust.avgtime':'Average payment time',
  'trust.desc':'Digital order records keep quantity, price, delivery and payment status transparent for both sides.',
  'modal.sell.title':'List your harvest','modal.sell.crop':'Crop','modal.sell.qty':'Quantity (kg)',
  'modal.sell.quality':'Quality','modal.sell.price':'Asking price /q','modal.sell.from':'Available from',
  'modal.sell.delivery':'Delivery mode','modal.sell.packaging':'Packaging details','modal.sell.publish':'Publish to verified buyers',
  'modal.sell.pickup':'Buyer pickup','modal.sell.platform':'Platform logistics','modal.sell.self':'Self delivery',
  'lang.title':'Choose your language',
  'toast.langChanged':'Language set to English','toast.listed':'Listing published to verified buyers',
  'toast.themeLight':'Switched to light theme','toast.themeDark':'Switched to dark theme',
},
hi:{
  'navgroup.market':'बाज़ार','navgroup.ai':'एआई और संचालन','navgroup.account':'खाता',
  'nav.dashboard':'डैशबोर्ड','nav.sellCrop':'फसल बेचें','nav.marketplace':'खरीदार बाज़ार',
  'nav.listings':'मेरी लिस्टिंग','nav.orders':'ऑर्डर','nav.demandForecast':'मांग पूर्वानुमान',
  'nav.routeOptimizer':'रूट ऑप्टिमाइज़र','nav.logistics':'लॉजिस्टिक्स','nav.payments':'भुगतान','nav.support':'सहायता',
  'greeting':'शुभ संध्या, किसान','searchph':'खरीदार, फसल, ऑर्डर खोजें...',
  'hero.badge':'एआई-संचालित सीधा बाज़ार',
  'hero.title1':'सीधे ','hero.title2':'स्रोत','hero.title3':' से बेचें। अधिक मूल्य अपने पास रखें।',
  'hero.desc':'अपनी फसल को सत्यापित उपभोक्ताओं और थोक खरीदारों से सीधे जोड़ें। बिना अनावश्यक बिचौलियों के फार्म-गेट लिस्टिंग, मांग विश्लेषण और बेहतर लॉजिस्टिक्स।',
  'hero.btnList':'अपनी फसल लिस्ट करें','hero.btnFind':'खरीदार खोजें',
  'stat.sales':'इस महीने की सीधी बिक्री','stat.demand':'सक्रिय खरीदार मांग','stat.demandSub':'आज उच्च मांग',
  'stat.saving':'औसत बिचौलिया बचत','stat.savingSub':'आपकी हाल की बिक्री में',
  'stat.orders':'प्रगति में ऑर्डर','stat.ordersSub':'को आपकी कार्रवाई चाहिए',
  'stat.realization':'किसान प्राप्ति','stat.realizationSub':'सामान्य चेन से अधिक बचत',
  'stat.buyers':'सत्यापित खरीदार','stat.buyersSub':'फिलहाल आपकी फसल की तलाश में',
  'stat.score':'मांग स्कोर','stat.scoreSub':'इस सप्ताह प्याज़ के लिए उच्च',
  'stat.logistics':'औसत लॉजिस्टिक बचत','stat.logisticsSub':'एआई रूट ऑप्टिमाइज़ेशन',
  'forecast.title':'प्याज़ मांग पूर्वानुमान','forecast.sub':'क्षेत्रीय खरीदार मांग • अगले 7 दिन','forecast.badge':'एआई पूर्वानुमान',
  'ai.badge':'विश्वास','ai.title':'एआई बिक्री अवसर','ai.sub':'वर्तमान खरीदार मांग के आधार पर',
  'ai.headline':'मुंबई के आसपास मांग बढ़ रही है','ai.desc':'थोक खरीदारों को इस सप्ताह अधिक ग्रेड-A प्याज़ की आवश्यकता होगी।',
  'ai.bestAction':'सर्वोत्तम कार्रवाई','ai.next':'अगले 2-4 दिन','ai.list5':'5 टन लिस्ट करें','ai.target':'लक्षित खरीदार भाव',
  'ai.confidence':'मांग विश्वास','ai.requests':'खरीदार अनुरोध','ai.consumer':'उपभोक्ता मांग','ai.consumerHigh':'उच्च',
  'ai.sellthrough':'अनुमानित बिक्री समय',
  'buyer.title':'सीधे खरीदार अवसर','buyer.sub':'आपके 5T ग्रेड-A प्याज़ लॉट के लिए सर्वश्रेष्ठ मेल','buyer.viewall':'सभी 18 देखें',
  'demand.title':'जहाँ मांग सबसे मजबूत है','demand.sub':'एआई-रैंक किए गए खरीदार समूह','demand.map':'मानचित्र खोलें',
  'route.title':'एआई रूट ऑप्टिमाइज़र','route.sub':'आपके वर्तमान प्याज़ ऑर्डर के लिए','route.saved':'बचत',
  'route.transport':'अनुमानित परिवहन लागत',
  'listings.title':'मेरी सक्रिय लिस्टिंग','listings.sub':'खरीदारों के लिए उपलब्ध फसल',
  'impact.title':'इस महीने का प्रभाव','impact.sub':'सीधे बेचने से बचाया गया मूल्य',
  'impact.retained':'बचाया गया मूल्य','impact.reached':'सीधे पहुंचे खरीदार','impact.avoided':'औसत बचे बिचौलिया स्तर',
  'impact.fulfilled':'सीधे पूरे किए गए ऑर्डर','impact.saving':'औसत खरीदार बचत',
  'quick.title':'त्वरित कार्रवाई',
  'quick.list.title':'अपनी फसल लिस्ट करें','quick.list.sub':'सीधे खरीदारों तक पहुंचें',
  'quick.buyers.title':'थोक खरीदार खोजें','quick.buyers.sub':'सक्रिय मांग देखें',
  'quick.optimize.title':'डिलीवरी अनुकूलित करें','quick.optimize.sub':'परिवहन लागत घटाएं',
  'quick.manage.title':'ऑर्डर प्रबंधित करें','quick.manage.sub':'कार्रवाई आवश्यक',
  'recent.title':'हाल के ऑर्डर',
  'trust.title':'विश्वास और भुगतान स्वास्थ्य','trust.status':'स्वस्थ',
  'trust.coverage':'सत्यापित खरीदार कवरेज','trust.ontime':'समय पर भुगतान','trust.disputed':'विवादित ऑर्डर','trust.avgtime':'औसत भुगतान समय',
  'trust.desc':'डिजिटल ऑर्डर रिकॉर्ड दोनों पक्षों के लिए मात्रा, मूल्य, डिलीवरी और भुगतान स्थिति को पारदर्शी रखते हैं।',
  'modal.sell.title':'अपनी फसल लिस्ट करें','modal.sell.crop':'फसल','modal.sell.qty':'मात्रा (किग्रा)',
  'modal.sell.quality':'गुणवत्ता','modal.sell.price':'मांग मूल्य /क्विंटल','modal.sell.from':'उपलब्ध तिथि',
  'modal.sell.delivery':'डिलीवरी मोड','modal.sell.packaging':'पैकेजिंग विवरण','modal.sell.publish':'सत्यापित खरीदारों को भेजें',
  'modal.sell.pickup':'खरीदार पिकअप','modal.sell.platform':'प्लेटफॉर्म लॉजिस्टिक्स','modal.sell.self':'स्वयं डिलीवरी',
  'lang.title':'अपनी भाषा चुनें',
  'toast.langChanged':'भाषा हिंदी में सेट की गई','toast.listed':'लिस्टिंग सत्यापित खरीदारों को भेजी गई',
  'toast.themeLight':'लाइट थीम में बदला गया','toast.themeDark':'डार्क थीम में बदला गया',
},
mr:{
  'navgroup.market':'बाजारपेठ','navgroup.ai':'एआय आणि कामकाज','navgroup.account':'खाते',
  'nav.dashboard':'डॅशबोर्ड','nav.sellCrop':'पीक विका','nav.marketplace':'खरेदीदार बाजारपेठ',
  'nav.listings':'माझ्या नोंदी','nav.orders':'ऑर्डर','nav.demandForecast':'मागणी अंदाज',
  'nav.routeOptimizer':'मार्ग ऑप्टिमायझर','nav.logistics':'लॉजिस्टिक्स','nav.payments':'पेमेंट्स','nav.support':'सहाय्य',
  'greeting':'शुभ संध्याकाळ, शेतकरी','searchph':'खरेदीदार, पीक, ऑर्डर शोधा...',
  'hero.badge':'एआय-सक्षम थेट बाजारपेठ',
  'hero.title1':'थेट ','hero.title2':'स्त्रोता','hero.title3':'जवळून विका. अधिक मूल्य स्वतःकडे ठेवा.',
  'hero.desc':'तुमचे पीक सत्यापित ग्राहक आणि घाऊक खरेदीदारांशी थेट जोडा. अनावश्यक मध्यस्थांशिवाय शेत-गेट नोंदी, मागणी विश्लेषण आणि स्मार्ट लॉजिस्टिक्स.',
  'hero.btnList':'तुमचे पीक नोंदवा','hero.btnFind':'खरेदीदार शोधा',
  'stat.sales':'या महिन्यातील थेट विक्री','stat.demand':'सक्रिय खरेदीदार मागणी','stat.demandSub':'आज जास्त मागणी',
  'stat.saving':'सरासरी मध्यस्थ बचत','stat.savingSub':'तुमच्या अलीकडील विक्रीत',
  'stat.orders':'प्रगतीपथावरील ऑर्डर','stat.ordersSub':'ला तुमची कृती हवी',
  'stat.realization':'शेतकरी प्राप्ती','stat.realizationSub':'नेहमीच्या साखळीपेक्षा जास्त बचत',
  'stat.buyers':'सत्यापित खरेदीदार','stat.buyersSub':'सध्या तुमचे पीक शोधत आहेत',
  'stat.score':'मागणी गुण','stat.scoreSub':'या आठवड्यात कांद्यासाठी जास्त',
  'stat.logistics':'सरासरी लॉजिस्टिक बचत','stat.logisticsSub':'एआय मार्ग ऑप्टिमायझेशन',
  'forecast.title':'कांदा मागणी अंदाज','forecast.sub':'प्रादेशिक खरेदीदार मागणी • पुढील 7 दिवस','forecast.badge':'एआय अंदाज',
  'ai.badge':'विश्वास','ai.title':'एआय विक्री संधी','ai.sub':'सध्याच्या खरेदीदार मागणीवर आधारित',
  'ai.headline':'मुंबईजवळ मागणी वाढत आहे','ai.desc':'घाऊक खरेदीदारांना या आठवड्यात अधिक ग्रेड-A कांद्याची गरज भासेल.',
  'ai.bestAction':'सर्वोत्तम कृती','ai.next':'पुढील 2-4 दिवस','ai.list5':'5 टन नोंदवा','ai.target':'लक्ष्य खरेदीदार दर',
  'ai.confidence':'मागणी विश्वास','ai.requests':'खरेदीदार विनंत्या','ai.consumer':'ग्राहक मागणी','ai.consumerHigh':'जास्त',
  'ai.sellthrough':'अपेक्षित विक्री कालावधी',
  'buyer.title':'थेट खरेदीदार संधी','buyer.sub':'तुमच्या 5T ग्रेड-A कांदा लॉटसाठी सर्वोत्तम जुळणी','buyer.viewall':'सर्व 18 पहा',
  'demand.title':'मागणी सर्वात मजबूत कुठे आहे','demand.sub':'एआय-क्रमवारी खरेदीदार गट','demand.map':'नकाशा उघडा',
  'route.title':'एआय मार्ग ऑप्टिमायझर','route.sub':'तुमच्या सध्याच्या कांदा ऑर्डरसाठी','route.saved':'बचत',
  'route.transport':'अंदाजित वाहतूक खर्च',
  'listings.title':'माझ्या सक्रिय नोंदी','listings.sub':'खरेदीदारांसाठी उपलब्ध पीक',
  'impact.title':'या महिन्याचा परिणाम','impact.sub':'थेट विक्रीमुळे राखलेले मूल्य',
  'impact.retained':'राखलेले मूल्य','impact.reached':'थेट पोहोचलेले खरेदीदार','impact.avoided':'टाळलेले मध्यस्थ स्तर',
  'impact.fulfilled':'थेट पूर्ण झालेले ऑर्डर','impact.saving':'सरासरी खरेदीदार बचत',
  'quick.title':'त्वरित कृती',
  'quick.list.title':'तुमचे पीक नोंदवा','quick.list.sub':'थेट खरेदीदारांपर्यंत पोहोचा',
  'quick.buyers.title':'घाऊक खरेदीदार शोधा','quick.buyers.sub':'सक्रिय मागणी पहा',
  'quick.optimize.title':'डिलिव्हरी ऑप्टिमाइझ करा','quick.optimize.sub':'वाहतूक खर्च कमी करा',
  'quick.manage.title':'ऑर्डर व्यवस्थापित करा','quick.manage.sub':'कृती आवश्यक',
  'recent.title':'अलीकडील ऑर्डर',
  'trust.title':'विश्वास आणि पेमेंट आरोग्य','trust.status':'निरोगी',
  'trust.coverage':'सत्यापित खरेदीदार कव्हरेज','trust.ontime':'वेळेवर पेमेंट','trust.disputed':'वादग्रस्त ऑर्डर','trust.avgtime':'सरासरी पेमेंट वेळ',
  'trust.desc':'डिजिटल ऑर्डर नोंदी दोन्ही बाजूंसाठी प्रमाण, किंमत, डिलिव्हरी आणि पेमेंट स्थिती पारदर्शक ठेवतात.',
  'modal.sell.title':'तुमचे पीक नोंदवा','modal.sell.crop':'पीक','modal.sell.qty':'प्रमाण (किलो)',
  'modal.sell.quality':'गुणवत्ता','modal.sell.price':'मागणी किंमत /क्विंटल','modal.sell.from':'उपलब्ध तारीख',
  'modal.sell.delivery':'डिलिव्हरी पद्धत','modal.sell.packaging':'पॅकेजिंग तपशील','modal.sell.publish':'सत्यापित खरेदीदारांना पाठवा',
  'modal.sell.pickup':'खरेदीदार पिकअप','modal.sell.platform':'प्लॅटफॉर्म लॉजिस्टिक्स','modal.sell.self':'स्वतः डिलिव्हरी',
  'lang.title':'तुमची भाषा निवडा',
  'toast.langChanged':'भाषा मराठीत सेट केली','toast.listed':'नोंद सत्यापित खरेदीदारांना पाठवली',
  'toast.themeLight':'लाइट थीमवर बदलले','toast.themeDark':'डार्क थीमवर बदलले',
}
};
const FL_LANG_KEY = 'farmlink-language';

function flT(key){
  const lang = localStorage.getItem(FL_LANG_KEY) || 'en';
  return (FL_I18N[lang] && FL_I18N[lang][key]) || FL_I18N.en[key] || key;
}

function flApplyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = flT(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.setAttribute('placeholder', flT(el.getAttribute('data-i18n-ph')));
  });
  const lang = localStorage.getItem(FL_LANG_KEY) || 'en';
  document.documentElement.setAttribute('lang', lang);
  renderFarmerSidebar(document.body.getAttribute('data-page'));
  renderLangModalOptions();
}

function setLanguage(lang){
  localStorage.setItem(FL_LANG_KEY, lang);
  flApplyTranslations();
  flCloseModal('langModal');
  const names = { en:'English', hi:'हिंदी', mr:'मराठी' };
  flToast((FL_I18N[lang]['toast.langChanged']) || `Language set to ${names[lang]}`);
  if (window.lucide) lucide.createIcons();
}

function initFarmerLanguage(){
  if (!localStorage.getItem(FL_LANG_KEY)) localStorage.setItem(FL_LANG_KEY, 'en');
  flApplyTranslations();
}

function renderLangModalOptions(){
  const wrap = document.getElementById('langOptionsWrap');
  if (!wrap) return;
  const current = localStorage.getItem(FL_LANG_KEY) || 'en';
  const opts = [
    { id:'mr', main:'मराठी', sub:'शेतकऱ्यांसाठी सोपी भाषा' },
    { id:'hi', main:'हिंदी', sub:'किसानों के लिए आसान भाषा' },
    { id:'en', main:'English', sub:'Simple English' },
  ];
  wrap.innerHTML = opts.map(o => `
    <div class="lang-option ${o.id===current?'active':''}" onclick="setLanguage('${o.id}')" role="button" tabindex="0">
      <div><div class="main">${o.main}</div><div class="sub">${o.sub}</div></div>
      ${o.id===current ? '<i data-lucide="check-circle-2" style="color:var(--accent-text);width:20px;height:20px;"></i>' : ''}
    </div>`).join('');
}

/* ---------- Sidebar rendering ---------- */
function flCounts(){
  return {
    buyerCount: 18,
    listingCount: flStore.get('farmlink-listings', FL_DEFAULT_LISTINGS).filter(l=>l.status!=='closed').length,
    orderCount: flStore.get('farmlink-orders', FL_DEFAULT_ORDERS).filter(o=>o.status==='ACTION'||o.status==='IN TRANSIT').length,
  };
}

function renderFarmerSidebar(activePage){
  const mount = document.getElementById('sidebarMount');
  if (!mount) return;
  const counts = flCounts();
  const groupsHtml = FARMER_GROUPS.map(g => {
    const items = farmerPages.filter(p => p.group === g.id).map(p => {
      const badge = p.badgeKey ? `<span class="count">${counts[p.badgeKey]}</span>` : '';
      return `<a class="nav-item ${p.id===activePage?'active':''}" href="${p.href}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p.icon}</svg>
        <span>${flT(p.key)}</span>${badge}
      </a>`;
    }).join('');
    return `<div class="nav-group"><div class="nav-label">${flT(g.key)}</div>${items}</div>`;
  }).join('');

  mount.innerHTML = `
    <div class="brand">
      <div class="brand-mark">F</div>
      <div class="brand-text"><div class="name">FarmLink AI</div><div class="tag">Direct Agri Marketplace</div></div>
    </div>
    ${groupsHtml}
    <div class="sidebar-footer">
      <div class="avatar-chip">RK</div>
      <div><div class="who">Farmer</div><div class="sub">Chhatrapati Sambhaji Nagar</div></div>
      <button class="settings-btn" title="Settings"><i data-lucide="settings" style="width:16px;height:16px;"></i></button>
    </div>`;
  if (window.lucide) lucide.createIcons();
}

/* ---------- Default seed data ---------- */
const FL_DEFAULT_LISTINGS = [
  { id:'L1', crop:'Onion', quality:'Grade A', qty:5000, offers:3, status:'live' },
  { id:'L2', crop:'Tomato', quality:'Grade A', qty:2000, offers:1, status:'negotiating' },
  { id:'L3', crop:'Grapes', quality:'Premium', qty:800, offers:4, status:'watching' },
];
const FL_DEFAULT_ORDERS = [
  { id:'FL-1048', buyer:'Shree Foods', detail:'5,000 kg onion • Pickup tomorrow 08:30', status:'IN TRANSIT' },
  { id:'FL-1044', buyer:'MahaFresh', detail:'2,000 kg tomato • Delivered today', status:'PAID' },
  { id:'FL-NEW1', buyer:'FreshCart', detail:'Onion • ₹2,950/q • received 26 min ago', status:'ACTION' },
];

/* ---------- Sell modal ---------- */
let flSelectedQuality = 'Grade A';
let flSelectedDelivery = 'Buyer pickup';

function openSellModal(){
  flOpenModal('sellModal');
}
function closeSellModal(){
  flCloseModal('sellModal');
}
function selectChip(groupEl, value, target){
  groupEl.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  event.target.closest('.chip').classList.add('selected');
  if (target === 'quality') flSelectedQuality = value;
  if (target === 'delivery') flSelectedDelivery = value;
}
function submitSellForm(e){
  e.preventDefault();
  const form = e.target;
  const crop = form.crop.value;
  const qty = form.qty.value;
  const price = form.price.value;
  if (!crop || !qty || !price){
    flToast('Please fill crop, quantity and price', 'error');
    return;
  }
  const listings = flStore.get('farmlink-listings', FL_DEFAULT_LISTINGS);
  listings.unshift({
    id:'L' + Date.now(), crop, quality:flSelectedQuality, qty:Number(qty),
    offers:0, status:'live', price, delivery:flSelectedDelivery
  });
  flStore.set('farmlink-listings', listings);
  flToast(flT('toast.listed'));
  closeSellModal();
  form.reset();
  if (typeof renderListingsPage === 'function') renderListingsPage();
  renderFarmerSidebar(document.body.getAttribute('data-page'));
}

/* ---------- Quick actions ---------- */
function goTo(url){ window.location.href = url; }

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initFarmerLanguage();
  renderFarmerSidebar(document.body.getAttribute('data-page'));

  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) langBtn.addEventListener('click', () => { renderLangModalOptions(); flOpenModal('langModal'); });

  const sellForm = document.getElementById('sellForm');
  if (sellForm) sellForm.addEventListener('submit', submitSellForm);

  if (window.lucide) lucide.createIcons();
});
