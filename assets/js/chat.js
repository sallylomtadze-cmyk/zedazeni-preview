/* Help desk: scripted answers, no network. Topics are matched by keywords; anything unknown is routed to phone / e-mail. */
(function () {
  'use strict';
  const root = document.documentElement, minor = root.classList.contains('minor');
  const T = window.TR || (s => s), ROOT = window.ROOT || '';
  const L = (t, h) => ({ t, h });
  const TOPICS = [
    { id: 'products', q: 'პროდუქცია', k: ['პროდუქ', 'ასორტიმენტ', 'რას აწარმო', 'ბრენდ', 'სასმელ'],
      a: 'ერთ ქარხანაში 30-ზე მეტ პროდუქტს ვაწარმოებთ: ლუდს, ლიმონათს, კოლას, ცივ ჩაის, წვენს, წყალსა და ენერგეტიკულ სასმელებს.',
      l: [L('ლუდი', 'beer.html'), L('გამაგრილებელი', 'soft-drinks.html'), L('ყველა ბრენდი', 'brands.html')] },
    { id: 'beer', adult: true, q: 'ლუდი', k: ['ლუდ', 'პილსნერ', 'ლაგერ', 'ხევსურულ', 'აია', 'რავი', 'სვიან', 'რაგნარ', 'miller', 'მილერ', 'harp', 'ჰარპ', 'გინეს', 'guinness', 'krombacher'],
      a: 'პორტფელშია ზედაზენი, ხევსურული, აია, რავი, სვიანი, ბელგიური და რაგნარი, ლიცენზიით Miller, Harp და Holsten, იმპორტით Heineken, Krombacher, Guinness და Blue Moon.',
      l: [L('ლუდის კატალოგი', 'beer.html')] },
    { id: 'heineken', adult: true, q: 'Heineken', k: ['heineken', 'ჰეინეკენ', 'ჰაინეკენ'],
      a: '2025 წლის 1 ივლისიდან ზედაზენი Heineken-ის ექსკლუზიური წარმომადგენელი და დისტრიბუტორია საქართველოში.',
      l: [L('ვრცლად', 'news.html')] },
    { id: 'soft', q: 'გამაგრილებელი', k: ['ლიმონათ', 'კოლა', 'არსი', 'rc', 'ჩერო', 'წვენ', 'ჩაი', 'გურიელ', 'dilmah', 'დილმა', 'წყალ', 'ზენი', 'ენერგეტიკ', 'wilder', 'dino', 'უშაქრო'],
      a: '12 ბრენდი და 37 გემო: ლიმონათი „ზედაზენი“ ექვს გემოდ, უშაქრო ლიმონათი, არსი კოლა, ჩერო, გურიელი, Dilmah, წყარო „ზენი“, Wilder, Dino და Rad Rain.',
      l: [L('ყველა გემო', 'soft-drinks.html')] },
    { id: 'zero', q: 'უალკოჰოლო', k: ['უალკოჰოლ', '0.0', 'ალკოჰოლის გარეშე'],
      a: 'უალკოჰოლო ლუდებია ზედაზენი 0.0 და რაგნარი 0.0. ორივეს ლუდის სრული გემო აქვს და 0.0% ალკოჰოლი.',
      l: minor ? [] : [L('ნახვა', 'beer.html#zedazeni-00')] },
    { id: 'where', q: 'სად ვიყიდო', k: ['სად ვიყიდ', 'ყიდვა', 'მაღაზი', 'შეძენ', 'სად იყიდ', 'ფას'],
      a: 'პროდუქცია იყიდება საქართველოს ყველა რეგიონის სავაჭრო ქსელებსა და მაღაზიებში. საცალო ფასს გამყიდველი ადგენს.',
      l: [L('რეგიონები', 'geography.html')] },
    { id: 'distribution', q: 'დისტრიბუცია', k: ['დისტრიბუ', 'საბითუმო', 'მომარაგ', 'შეკვეთ', 'პარტნიორ', 'თანამშრომლ', 'ჰორეკა', 'რესტორ', 'ბარ'],
      a: 'საქართველოში 11 სადისტრიბუციო ცენტრი გვაქვს. შეკვეთისა და თანამშრომლობისთვის დარეკეთ დისტრიბუციის განყოფილებაში: +995 32 224 3535.',
      l: [L('დარეკვა', 'tel:+995322243535'), L('ცენტრების სია', 'geography.html')] },
    { id: 'export', q: 'ექსპორტი', k: ['ექსპორტ', 'საზღვარგარეთ', 'ქვეყნ', 'ევროპ', 'ამერიკ', 'პოლონ', 'გერმან'],
      a: 'ზედაზენის პროდუქცია 34 ქვეყანაში იყიდება. ყველაზე მოთხოვნადი საექსპორტო პროდუქტი ლიმონათი „ზედაზენია“.',
      l: [L('ექსპორტის რუკა', 'geography.html')] },
    { id: 'tour', q: 'ქარხნის ტური', k: ['ტურ', 'ექსკურს', 'ვიზიტ', 'ქარხნის ნახვა', 'დათვალიერ'],
      a: 'ქარხანა საგურამოშია, ზედაზენის მთის ძირას. ტურის დასაჯავშნად შეავსეთ ფორმა კონტაქტის გვერდზე და თემად აირჩიეთ „ქარხნის ტური“.',
      l: [L('ტურის დაჯავშნა', 'contact.html')] },
    { id: 'factory', q: 'წარმოება', k: ['წარმოებ', 'ქარხან', 'ხარისხ', 'სერტიფიკ', 'fssc', 'ლაბორატორ', 'ჭაბურღილ'],
      a: 'წყალს საკუთარი ჭაბურღილებიდან, 150 მეტრის სიღრმიდან ვიღებთ. წარმოება FSSC სტანდარტითაა სერტიფიცირებული, აუდიტს TÜV SÜD ატარებს.',
      l: [L('როგორ იხარშება', 'production.html')] },
    { id: 'company', q: 'კომპანია', k: ['კომპანი', 'მფლობელ', 'დირექტორ', 'tempo', 'ტემპო', 'აქციონერ', 'ინვესტ', 'ანგარიშ'],
      a: 'სს „ქართული ლუდის კომპანია“ 2011 წელს დაარსდა. 2025 წლის მაისიდან 60%-იან წილს Tempo Beverages Ltd ფლობს. დირექტორია გიორგი ქესანაშვილი.',
      l: [L('კომპანიის შესახებ', 'company.html'), L('ისტორია', 'story.html')] },
    { id: 'job', q: 'ვაკანსია', k: ['ვაკანს', 'სამსახურ', 'დასაქმ', 'cv', 'რეზიუმე', 'სტაჟირ'],
      a: 'ვაკანსიებისა და სტაჟირების შესახებ მოგვწერეთ: info@zedazeni.ge. წერილში მიუთითეთ სასურველი მიმართულება.',
      l: [L('წერილის მიწერა', 'mailto:info@zedazeni.ge')] },
    { id: 'contact', q: 'კონტაქტი', k: ['კონტაქტ', 'ტელეფონ', 'ნომერ', 'მისამართ', 'მეილ', 'ელ. ფოსტ', 'დარეკ', 'ოფის', 'სამუშაო საათ'],
      a: 'ცენტრალური ოფისი: სოფ. საგურამო, მცხეთა 3311. ტელეფონი: +995 32 243 7770. ელ. ფოსტა: info@zedazeni.ge.',
      l: [L('დარეკვა', 'tel:+995322437770'), L('მოწერა', 'contact.html')] },
    { id: 'complaint', q: 'შენიშვნა პროდუქტზე', k: ['პრეტენზ', 'საჩივ', 'გაფუჭ', 'ვადა', 'ხარვეზ', 'შენიშვნ', 'უკმაყოფილ'],
      a: 'ვწუხვართ. გთხოვთ, მოგვწეროთ compliance@geobeer.ge-ზე და მიუთითოთ პროდუქტი, პარტიის ნომერი ბოთლიდან და შეძენის ადგილი. პასუხს სამუშაო დღეებში მიიღებთ.',
      l: [L('წერილის მიწერა', 'mailto:compliance@geobeer.ge')] },
  ];
  let HELLO = 'გამარჯობა! რით შეგვიძლია დაგეხმაროთ? აირჩიეთ თემა ან დაწერეთ კითხვა.';
  let MISS = 'ამ კითხვაზე მზა პასუხი არ გვაქვს. დაგვირეკეთ ან მოგვწერეთ და კომპანიის წარმომადგენელი გიპასუხებთ.';
  let ADULT = 'ეს ინფორმაცია მხოლოდ სრულწლოვანთათვისაა ხელმისაწვდომი.';
  if (window.TR) { TOPICS.forEach(t => { t.q = T(t.q); t.a = T(t.a); t.k = t.k.map(k => T(k).toLowerCase()); t.l.forEach(l => { l.t = T(l.t) }) }); HELLO = T(HELLO); MISS = T(MISS); ADULT = T(ADULT) }
  const START = ['products', 'where', 'distribution', 'tour', 'contact'];

  const norm = s => s.toLowerCase().replace(/[„“"'.,!?:;()]/g, ' ');
  function match(text) {
    const n = norm(text); let best = null, score = 0;
    for (const t of TOPICS) { let s = 0; for (const k of t.k) if (n.includes(k)) s += k.length; if (s > score) { score = s; best = t } }
    return best;
  }

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e };
  const box = el('div', 'chat'); box.innerHTML =
    '<button class="chat-open" aria-expanded="false" aria-controls="chat-panel" aria-label="' + T('დახმარება') + '">' +
    '<svg class="ci" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<g class="ci-chat"><path d="M6 15.2C6 10.1 10.5 6 16 6s10 4.1 10 9.2-4.5 9.2-10 9.2c-1.3 0-2.6-.2-3.7-.6L7 26l1.3-4.4C6.900 20 6 17.700 6 15.2Z"/><circle class="d" cx="11.800" cy="15.300" r=".9"/><circle class="d" cx="16" cy="15.300" r=".9"/><circle class="d" cx="20.200" cy="15.300" r=".9"/></g>' +
    '<g class="ci-x"><path d="M10 10l12 12M22 10 10 22"/></g></svg><em></em><span>' + T('დახმარება') + '</span></button>' +
    '<section class="chat-panel" id="chat-panel" role="dialog" aria-label="' + T('დახმარება') + '" hidden>' +
    '<header><img src="' + ROOT + 'assets/img/logo-light.svg" alt=""><div><b>' + T('დახმარება') + '</b><small>' + T('სწრაფი პასუხები · 24/7') + '</small></div><button class="chat-x" aria-label="' + T('დახურვა') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg></button></header>' +
    '<div class="chat-log" aria-live="polite"></div>' +
    '<form class="chat-form"><input type="text" maxlength="200" placeholder="' + T('დაწერეთ კითხვა') + '" aria-label="' + T('კითხვა') + '" autocomplete="off"><button type="submit" aria-label="' + T('გაგზავნა') + '"></button></form></section>';
  document.body.appendChild(box);
  const open = box.querySelector('.chat-open'), panel = box.querySelector('.chat-panel'), log = box.querySelector('.chat-log'), form = box.querySelector('form'), input = form.querySelector('input');
  let started = false, busy = false;

  const scroll = () => { log.scrollTop = log.scrollHeight };
  function say(text, who) { const m = el('div', 'msg ' + who); m.appendChild(el('p', '', text)); log.appendChild(m); scroll(); return m }
  function chips(ids) {
    const row = el('div', 'chips-row');
    ids.map(id => TOPICS.find(t => t.id === id)).filter(t => t && !(minor && t.adult)).forEach(t => { const b = el('button', '', t.q); b.type = 'button'; b.addEventListener('click', () => ask(t.q, t)); row.appendChild(b) });
    log.appendChild(row); scroll();
  }
  function answer(t) {
    busy = true; const dots = el('div', 'msg bot typing'); dots.innerHTML = '<p><i></i><i></i><i></i></p>'; log.appendChild(dots); scroll();
    setTimeout(() => {
      dots.remove(); busy = false;
      if (!t) { const m = say(MISS, 'bot'); links(m, [L(T('დარეკვა'), 'tel:+995322437770'), L(T('მოწერა'), 'contact.html')]); chips(START); return }
      if (minor && t.adult) { say(ADULT, 'bot'); chips(START); return }
      links(say(t.a, 'bot'), t.l);
      chips(START.filter(id => id !== t.id).slice(0, 4));
    }, 650 + Math.random() * 450);
  }
  function links(m, list) { if (!list || !list.length) return; const r = el('div', 'msg-links'); list.forEach(l => { const a = el('a', '', l.t); a.href = l.h; r.appendChild(a) }); m.appendChild(r); scroll() }
  function ask(text, topic) { if (busy) return; log.querySelectorAll('.chips-row').forEach(r => r.remove()); say(text, 'me'); answer(topic || match(text)) }

  function toggle(show) {
    panel.hidden = !show; box.classList.toggle('on', show); open.setAttribute('aria-expanded', show);
    if (show) { box.classList.add('seen'); if (!started) { started = true; say(HELLO, 'bot'); chips(START) } setTimeout(() => input.focus({ preventScroll: true }), 60) }
  }
  open.addEventListener('click', () => toggle(panel.hidden));
  const low = () => box.classList.toggle('low', scrollY < 120); low(); addEventListener('scroll', low, { passive: true });   // phones: keep the first screen clear
  box.querySelector('.chat-x').addEventListener('click', () => { toggle(false); open.focus() });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); open.focus() } });
  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; ask(v) });
  if (new URLSearchParams(location.search).has('chat')) { toggle(true); const q = new URLSearchParams(location.search).get('chat'); if (q) setTimeout(() => ask(q), 200) }

  /* self-check: every start topic exists and a few phrases route where they should */
  console.assert(START.every(id => TOPICS.some(t => t.id === id)), 'chat: unknown start topic');
  if (!window.TR) {   // Georgian phrases: only meaningful on the Georgian pages
    console.assert(match('სად შეიძლება ვიყიდო ლიმონათი?').id === 'where' || match('სად შეიძლება ვიყიდო ლიმონათი?').id === 'soft', 'chat: where');
    console.assert(match('მინდა ქარხნის ტური') && match('მინდა ქარხნის ტური').id === 'tour', 'chat: tour');
  }
  console.assert(match('asdf qwerty') === null, 'chat: miss');
})();
