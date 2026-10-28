/* Персонализация: измените эти строки перед отправкой поздравления. */
const greeting = {
  name: 'Кирилл',
  title: 'Кирилл, с 29-летием!',
  paragraphs: [
    'С днём рождения, дружище! Сегодня тебе 29 — отличный возраст: уже можно давать мудрые советы, а потом делать ровно наоборот. До тридцати ещё целый год, так что режим «я пока молодой» официально продлён!',
    'Желаю здоровья без техобслуживания, денег без уведомлений «недостаточно средств» и выходных, которые ощущаются длиннее, чем пять минут. Пусть работа оставляет силы на жизнь, планы сбываются, а приключения заканчиваются фразой «надо повторить»!',
    'Пусть рядом будут свои люди, с которыми можно и поговорить по душам, и поржать до слёз. Мечтай, пробуй новое и почаще выбирай то, от чего тебе хорошо. Обнимаю, Кирилл! А теперь закрывай квест — торт сам себя не съест. 🎂'
  ],
  signature: 'Обнимаю, дружище! За твой 29-й уровень 🥳'
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
    app.innerHTML = `<div class="eyebrow">Кирилл · сегодня тебе 29</div><h1>Кирилл, ты перешёл<br>на <em>29-й уровень!</em></h1><p class="intro">Поздравление заперто за тремя испытаниями.<br>Докажи, что в 29 ты ещё можешь нажимать на кнопки. 😎</p><div class="hero-art" aria-hidden="true"><div class="halo"></div><span class="spark s1">✦</span><span class="spark s2">✧</span><span class="spark s3">✦</span><div class="gift"><div class="bow"></div></div></div><button class="primary" id="begin">Начать приключение <span>↗</span></button><p class="small-note">3 испытания · 2 минуты · без справки от терапевта</p><section class="journey" aria-label="Твоё приключение"><article><span class="step-icon">♧</span><div><h3>Собери подарки</h3><p>Лут на новый год жизни</p></div></article><article><span class="step-icon">♡</span><div><h3>Найди совпадения</h3><p>Проверка памяти. Без паники.</p></div></article><article><span class="step-icon">✧</span><div><h3>Зажги звёзды</h3><p>Желания принимаются без очереди</p></div></article></section>`;
    document.querySelector('#begin').onclick = () => advance();
  } else if (screen <= 3) {
    const titles = ['Забирай праздничный лут', 'Кирилл, проверим оперативку?', 'Загадывай. Сегодня можно всё.'];
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
    if (count === 5) completed('Заявка во Вселенную отправлена. Кирилл, жди приятных сюрпризов!');
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
  app.innerHTML = `<div class="eyebrow">Миссия выполнена · именинник великолепен</div><h1 class="game-heading">${escapeHTML(greeting.title)} <em>♡</em></h1><p class="intro">Все испытания позади. Можно выдохнуть и принимать поздравления.</p><article class="letter"><h2>${greeting.name ? `${escapeHTML(greeting.name)}, дружище!` : 'Сегодня — твой день.'}</h2>${greeting.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}<div class="signature">${escapeHTML(greeting.signature)}</div></article><button class="primary" id="celebrate">Ещё немного волшебства <span>✦</span></button><br><button class="secondary" id="again">Пройти приключение ещё раз</button>`;
  document.querySelector('#celebrate').onclick = () => {tone(); confetti();};
  document.querySelector('#again').onclick = () => {screen = 0; render();};
  confetti();
}
render();
