/* Персонализация: измените эти строки перед отправкой поздравления. */
const greeting = {
  name: 'Кирилл',
  title: 'С 29-летием!',
  paragraphs: [
    'Я очень рада, что мы познакомились! Когда-то я пришла учиться, а в итоге встретила человека, с которым хочется общаться и после окончания обучения. И я правда счастлива, что у нас получилось это общение сохранить. Пожалуй, это самый приятный бонус к обучению — и явно не тот, который обещали в программе 😄',
    'Ты очень весёлый человек с самой классной энергетикой. В ней чувствуется сила, уверенность и при этом такая лёгкость, что рядом хочется улыбаться и самой становиться смелее. Очень хочется научиться так же относиться к жизни и заряжать людей вокруг. Если когда-нибудь откроешь курс «Как быть на таком вайбе» — считай, первый ученик уже есть. Да, опять я!',
    'Желаю, чтобы у тебя самого всегда было достаточно поводов для радости, сил на свои желания и людей рядом, с которыми так же легко и хорошо. Пусть получается то, что важно именно тебе, мечты постепенно превращаются в планы, а планы — в классные истории.',
    'В 29 желаю денег без «недостаточно средств», отдыха без «я только отвечу на одно сообщение» и приключений, после которых хочется сказать «надо повторить», а не «больше никогда». Пусть этот год будет щедрым на всё хорошее. С днём рождения! 🥳'
  ],
  signature: 'Обнимаю! Очень рада, что ты есть в моей жизни ♡'
};
const app = document.querySelector('#app');
let screen = 0, soundEnabled = false, audio;
let gameToken = 0;
const escapeHTML = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tone() {
  if (!soundEnabled) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.frequency.value = 520 + Math.random() * 300;
    gain.gain.setValueAtTime(.06, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .25);
    oscillator.start(); oscillator.stop(audio.currentTime + .25);
  } catch { /* Игра работает и без поддержки звука. */ }
}
document.querySelector('#sound').onclick = event => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled));
  event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Выключить звуки' : 'Включить звуки');
  tone();
};
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function render() {
  gameToken++;
  app.classList.remove('fade'); void app.offsetWidth; app.classList.add('fade');
  if (screen === 0) {
    app.innerHTML = `<div class="eyebrow">Сегодня тебе 29</div><h1>Ты перешёл<br>на <em>29-й уровень!</em></h1><p class="intro">Поздравление заперто за тремя испытаниями.<br>Сегодня задания для тебя. Моя очередь проверять! 😎</p><div class="hero-art" aria-hidden="true"><div class="halo"></div><span class="spark s1">✦</span><span class="spark s2">✧</span><span class="spark s3">✦</span><div class="gift"><div class="bow"></div></div></div><button class="primary" id="begin">Начать приключение <span>↗</span></button><p class="small-note">3 испытания · 2 минуты · зачёт с хорошим настроением</p><section class="journey" aria-label="Твоё приключение"><article><span class="step-icon">♧</span><div><h3>Собери подарки</h3><p>Лут на новый год жизни</p></div></article><article><span class="step-icon">♡</span><div><h3>Найди совпадения</h3><p>Проверка памяти. Без паники.</p></div></article><article><span class="step-icon">✧</span><div><h3>Зажги звёзды</h3><p>Желания принимаются без очереди</p></div></article></section>`;
    document.querySelector('#begin').onclick = () => advance();
  } else if (screen <= 3) {
    const titles = ['Забирай праздничный лут', 'Проверим оперативку?', 'Загадывай. Сегодня можно всё.'];
    const hints = ['Открой четыре подарка. Тут без носков и геля для душа. Обещаю.', 'Найди четыре пары. Если забыл, где торт, — это просто голод.', 'Зажги все пять звёзд и загадай желание. Можно нескромное.'];
    app.innerHTML = `<div class="progress" aria-label="Уровень ${screen} из 3">${[1,2,3].map(n => `<i class="${n <= screen ? 'active' : ''}"></i>`).join('')}</div><div class="eyebrow">Уровень 0${screen} / 03</div><h1 class="game-heading">${titles[screen-1]}</h1><p class="intro">${hints[screen-1]}</p><section class="game-panel"><div class="game-status" role="status" aria-live="polite" id="status"></div><div id="board"></div></section><div id="next"></div><button class="secondary" id="restart">Вернуться в начало</button>`;
    document.querySelector('#restart').onclick = () => {screen = 0; render();};
    if (screen === 1) gifts();
    if (screen === 2) pairs();
    if (screen === 3) stars();
  } else finale();
}
function advance() { tone(); screen++; render(); }
function completed(message) {
  document.querySelector('#status').textContent = message;
  document.querySelector('#next').innerHTML = `<button class="primary" id="continue">${screen === 3 ? 'Открыть поздравление' : 'Следующий уровень'} <span>↗</span></button>`;
  document.querySelector('#continue').onclick = advance;
}
function gifts() {
  let count = 0;
  const wishes = ['Здоровье', 'Деньги', 'Удача', 'Отпуск'];
  const board = document.querySelector('#board'); board.className = 'grid';
  document.querySelector('#status').textContent = 'Подарки: 0 из 4';
  board.innerHTML = wishes.map((wish, i) => `<button class="tile" aria-label="Открыть подарок ${i+1}" data-wish="${wish}">🎁</button>`).join('');
  board.onclick = event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    button.disabled = true; button.classList.add('found'); button.textContent = ['🌷','💗','🍀','✨'][count++];
    button.setAttribute('aria-label', button.dataset.wish);
    document.querySelector('#status').textContent = `${button.dataset.wish} — для тебя! Подарки: ${count} из 4`; tone();
    if (count === 4) completed('Лут собран! В налоговую сообщать не надо.');
  };
}
function pairs() {
  let selected = [], locked = false, matches = 0;
  const token = gameToken;
  const board = document.querySelector('#board'); board.className = 'grid';
  document.querySelector('#status').textContent = 'Пары: 0 из 4';
  board.innerHTML = shuffle(['🌷','💗','🍰','✨','🌷','💗','🍰','✨']).map((icon, i) => `<button class="tile" data-icon="${icon}" aria-label="Открыть карточку ${i+1}">✧</button>`).join('');
  board.onclick = event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || locked || selected.includes(button)) return;
    button.textContent = button.dataset.icon; button.setAttribute('aria-label',button.dataset.icon); selected.push(button); tone();
    if (selected.length < 2) return;
    if (selected[0].dataset.icon === selected[1].dataset.icon) {
      selected.forEach(card => {card.disabled = true; card.classList.add('found');});
      selected = []; matches++;
      document.querySelector('#status').textContent = `Пары: ${matches} из 4`;
      if (matches === 4) completed('Оперативка в порядке! Все четыре пары на месте.');
    } else {
      locked = true;
      setTimeout(() => {
        if (token !== gameToken) return;
        selected.forEach(card => { card.textContent = '✧'; card.setAttribute('aria-label','Открыть карточку'); });
        selected = []; locked = false;
      }, 850);
    }
  };
}
function stars() {
  let count = 0;
  const board = document.querySelector('#board'); board.className = 'stars';
  document.querySelector('#status').textContent = 'Звёзды: 0 из 5';
  board.innerHTML = [[8,45],[29,3],[45,53],[65,12],[77,62]].map(([left,top],i) => `<button class="star-button" style="left:${left}%;top:${top}%" aria-label="Зажечь звезду ${i+1}" aria-pressed="false">✧</button>`).join('');
  board.onclick = event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    button.disabled = true; button.classList.add('lit'); button.textContent = '✦'; button.setAttribute('aria-pressed','true'); count++; tone();
    document.querySelector('#status').textContent = `Звёзды: ${count} из 5`;
    if (count === 5) completed('Заявка во Вселенную отправлена. Жди приятных сюрпризов!');
  };
}
function confetti() {
  const container = document.querySelector('#confetti'); container.replaceChildren();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 65; i++) {
    const bit = document.createElement('i'); bit.className = 'confetto';
    bit.style.left = `${Math.random()*100}%`; bit.style.background = ['#eaa8cc','#f4cfb0','#b8a4dc','#f8f3ff'][i%4]; bit.style.animationDelay = `${Math.random()*1.5}s`;
    bit.addEventListener('animationend', () => bit.remove()); container.append(bit);
  }
}
function finale() {
  app.innerHTML = `<div class="eyebrow">Миссия выполнена · именинник великолепен</div><h1 class="game-heading">${escapeHTML(greeting.title)} <em>♡</em></h1><p class="intro">Все испытания позади. Можно выдохнуть и принимать поздравления.</p><article class="letter"><h2>${greeting.name ? `${escapeHTML(greeting.name)}, с днём рождения!` : 'Сегодня — твой день.'}</h2>${greeting.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}<div class="signature">${escapeHTML(greeting.signature)}</div></article><button class="primary" id="celebrate">Ещё немного волшебства <span>✦</span></button><br><button class="secondary" id="again">Пройти приключение ещё раз</button>`;
  document.querySelector('#celebrate').onclick = () => {tone(); confetti();};
  document.querySelector('#again').onclick = () => {screen = 0; render();};
  confetti();
}
render();
