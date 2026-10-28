/* Персонализация: измените эти строки перед отправкой поздравления. */
const greeting = {
  name: 'Кирилл',
  title: 'С 29-летием!',
  paragraphs: [
    'Я очень рада, что мы познакомились. И ещё больше рада, что после окончания моего обучения мы не потерялись и продолжаем общаться. Я ведь просто пришла учиться, а в итоге познакомилась с человеком, с которым мне хорошо и интересно. Вот такой неожиданный бонус к образованию 😄',
    'Мне очень нравится, какой ты весёлый и какая у тебя классная энергетика. В тебе чувствуется сила — и при этом с тобой легко, можно посмеяться и просто быть собой. Я иногда смотрю на тебя и думаю: вот бы тоже уметь так заряжать людей и так уверенно идти по жизни. В общем, кое-чему я у тебя всё ещё учусь. Надеюсь, за это уже не надо сдавать домашку)',
    'Хочется пожелать тебе побольше того, от чего ты сам кайфуешь. Чтобы хватало сил на свои идеи, времени на отдых и чтобы рядом были люди, которые поддерживают тебя так же, как ты умеешь поддерживать других. Пусть всё, что ты давно хочешь, потихоньку получается. Даже то, о чём пока никому не рассказываешь.',
    'Ну и в 29 уже можно позволить себе многое. Например, купить торт без повода. Хотя сегодня повод как раз есть — так что не отвлекайся на мои задания слишком долго 😄 Спасибо тебе за наше общение. Я его очень ценю. С днём рождения!'
  ],
  signature: 'Обнимаю ♡'
};
const app = document.querySelector('#app');
let screen = 0, soundEnabled = false, audio;
let gameToken = 0;
const escapeHTML = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let musicGain, musicTimer, nextNoteAt = 0, noteIndex = 0;
// Лёгкая зацикленная мелодия: ноты синтезируются локально, без загрузки аудио.
const melody = [72, 76, 79, 76, 74, 77, 81, 77, 71, 74, 79, 74, 72, 76, 79, 84,
  81, 79, 76, 72, 77, 81, 79, 77, 74, 77, 79, 71, 72, 76, 72, null];
function playNote(midi, at, duration, volume, destination) {
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  oscillator.connect(gain); gain.connect(destination);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  oscillator.start(at); oscillator.stop(at + duration + .03);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}
function scheduleMusic() {
  if (!soundEnabled || audio.state !== 'running') return;
  nextNoteAt = Math.max(nextNoteAt, audio.currentTime + .025);
  while (nextNoteAt < audio.currentTime + .4) {
    const midi = melody[noteIndex % melody.length];
    if (midi !== null) playNote(midi, nextNoteAt, .52, .15, musicGain);
    if (noteIndex % 4 === 0) {
      const bass = [48, 53, 55, 48][Math.floor(noteIndex / 4) % 4];
      playNote(bass, nextNoteAt, 1.1, .08, musicGain);
    }
    noteIndex++; nextNoteAt += .32;
  }
}
function tone() {
  if (soundEnabled && audio?.state === 'running') {
    playNote(84, audio.currentTime, .18, .07, musicGain);
  }
}
const soundButton = document.querySelector('#sound');
function updateSoundButton() {
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundButton.setAttribute('aria-label', soundEnabled ? 'Выключить музыку' : 'Включить музыку');
  soundButton.title = soundEnabled ? 'Музыка играет — нажми, чтобы выключить' : 'Включить праздничную мелодию';
  soundButton.textContent = soundEnabled ? '♫' : '♪';
}
soundButton.onclick = async () => {
  soundButton.disabled = true;
  try {
    if (soundEnabled) {
      soundEnabled = false;
      clearInterval(musicTimer);
      musicGain.gain.setValueAtTime(0, audio.currentTime);
      await audio.suspend();
    } else {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (!musicGain) {
        musicGain = audio.createGain(); musicGain.connect(audio.destination);
      }
      await audio.resume();
      if (audio.state !== 'running') throw new Error('Audio is not running');
      soundEnabled = true;
      musicGain.gain.setValueAtTime(.65, audio.currentTime);
      nextNoteAt = audio.currentTime + .025; noteIndex = 0;
      scheduleMusic();
      musicTimer = setInterval(scheduleMusic, 150);
    }
    updateSoundButton();
  } catch {
    soundEnabled = false; clearInterval(musicTimer);
    if (musicGain) musicGain.gain.value = 0;
    updateSoundButton();
    soundButton.title = 'Не удалось включить музыку. Попробуй нажать ещё раз.';
    soundButton.setAttribute('aria-label', soundButton.title);
  } finally { soundButton.disabled = false; }
};
updateSoundButton();
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
    app.innerHTML = `<div class="eyebrow">Сегодня тебе 29</div><h1>Ты перешёл<br>на <em>29-й уровень!</em></h1><p class="intro">Поздравление заперто за пятью испытаниями.<br>Сегодня задания для тебя. Моя очередь проверять! 😎</p><div class="hero-art" aria-hidden="true"><div class="halo"></div><span class="spark s1">✦</span><span class="spark s2">✧</span><span class="spark s3">✦</span><div class="gift"><div class="bow"></div></div></div><button class="primary" id="begin">Начать приключение <span>↗</span></button><p class="small-note">5 испытаний · 5–8 минут · зачёт с хорошим настроением</p><section class="journey" aria-label="Твоё приключение"><article><span class="step-icon">♧</span><div><h3>Взломай сейф</h3><p>Три цифры до сюрприза</p></div></article><article><span class="step-icon">♡</span><div><h3>Найди совпадения</h3><p>Память, ритм и немного логики</p></div></article><article><span class="step-icon">✧</span><div><h3>Собери созвездие</h3><p>Финальная головоломка</p></div></article></section>`;
    document.querySelector('#begin').onclick = () => advance();
  } else if (screen <= 5) {
    const titles = ['Сейф с хорошими новостями', 'Проверим оперативку?', 'Поймай праздничный ритм', 'Теперь моя очередь спрашивать', 'Включи своё созвездие'];
    const hints = ['Разгадай три подсказки и введи код. Взлом совершенно легальный.', 'Найди шесть пар. Карточки одинаковые, а вот где они лежат — вопрос.', 'Смотри, в каком порядке загораются кнопки, и повторяй. Три раунда, без таймера.', 'Три задачки на логику. Преподаватель сегодня по другую сторону зачёта 😄', 'Зажги все девять звёзд. Нажатие переключает звезду и её соседей сверху, снизу, слева и справа.'];
    app.innerHTML = `<div class="progress" aria-label="Уровень ${screen} из 5">${[1,2,3,4,5].map(n => `<i class="${n <= screen ? 'active' : ''}"></i>`).join('')}</div><div class="eyebrow">Уровень 0${screen} / 05</div><h1 class="game-heading">${titles[screen-1]}</h1><p class="intro">${hints[screen-1]}</p><section class="game-panel"><div class="game-status" role="status" aria-live="polite" id="status"></div><div id="board"></div></section><div id="next"></div><button class="secondary" id="restart">Вернуться в начало</button>`;
    document.querySelector('#restart').onclick = () => {screen = 0; render();};
    if (screen === 1) safe();
    if (screen === 2) pairs();
    if (screen === 3) rhythm();
    if (screen === 4) quiz();
    if (screen === 5) stars();
  } else finale();
}
function advance() { tone(); screen++; render(); }
function completed(message) {
  document.querySelector('#status').textContent = message;
  document.querySelector('#next').innerHTML = `<button class="primary" id="continue">${screen === 5 ? 'Открыть поздравление' : 'Следующий уровень'} <span>↗</span></button>`;
  document.querySelector('#continue').onclick = advance;
}
function safe() {
  const board = document.querySelector('#board');
  board.innerHTML = `<ol class="clues"><li>Сколько двоек в числе 29?</li><li>Сколько жизней у кота, если верить поговорке?</li><li>Сколько свечей останется на торте, если из пяти убрать две?</li></ol><form id="safe-form"><label for="code">Трёхзначный код</label><div class="code-row"><input id="code" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" autocomplete="off" required placeholder="···"><button class="primary">Открыть</button></div></form><details class="hint"><summary>Нужна подсказка?</summary>Каждая задачка даёт одну цифру. В числе 29 всего одна двойка; коту приписывают девять жизней. Последняя цифра — 5 − 2.</details>`;
  document.querySelector('#status').textContent = 'Введи цифры в порядке подсказок.';
  document.querySelector('#safe-form').onsubmit = event => {
    event.preventDefault();
    if (document.querySelector('#code').value !== '193') {
      document.querySelector('#status').textContent = 'Пока не сходится. Посмотри на каждую подсказку отдельно — попытки не ограничены.'; return;
    }
    tone(); completed('Сейф открыт! Никаких носков, только следующий уровень.');
    document.querySelector('#code').disabled = true;
    document.querySelector('#safe-form button').disabled = true;
  };
}
function pairs() {
  let selected = [], locked = false, matches = 0;
  const token = gameToken;
  const board = document.querySelector('#board'); board.className = 'grid';
  document.querySelector('#status').textContent = 'Пары: 0 из 6';
  board.innerHTML = shuffle(['🌷','💗','🍰','✨','🎁','🍀','🌷','💗','🍰','✨','🎁','🍀']).map((icon, i) => `<button class="tile" data-icon="${icon}" aria-label="Открыть карточку ${i+1}">✧</button>`).join('');
  board.onclick = event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || locked || selected.includes(button)) return;
    button.textContent = button.dataset.icon; button.setAttribute('aria-label',button.dataset.icon); selected.push(button); tone();
    if (selected.length < 2) return;
    if (selected[0].dataset.icon === selected[1].dataset.icon) {
      selected.forEach(card => {card.disabled = true; card.classList.add('found');});
      selected = []; matches++;
      document.querySelector('#status').textContent = `Пары: ${matches} из 6`;
      if (matches === 6) completed('Оперативка в порядке! Все шесть пар на месте.');
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
function rhythm() {
  const token = gameToken;
  const sequence = Array.from({length: 5}, () => Math.floor(Math.random() * 4));
  let round = 0, input = 0, showing = false, finished = false;
  const board = document.querySelector('#board');
  board.innerHTML = `<div class="rhythm-grid">${['🌙','☀️','⚡','🌈'].map((icon,i) => `<button class="tile rhythm-key" data-key="${i}" aria-label="Кнопка ${i+1}">${icon}</button>`).join('')}</div><button class="secondary" id="replay">Показать последовательность</button><p class="small-note">Можно играть без звука. Каждый новый раунд на одну ноту длиннее.</p>`;
  const keys = [...board.querySelectorAll('.rhythm-key')];
  const replay = document.querySelector('#replay');
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function show() {
    if (showing || finished) return;
    showing = true; input = 0; replay.disabled = true;
    keys.forEach(key => key.disabled = true);
    document.querySelector('#status').textContent = `Раунд ${round+1} из 3: запомни ${round+3} нажатия.`;
    await delay(400);
    for (const index of sequence.slice(0, round+3)) {
      if (token !== gameToken) return;
      keys[index].classList.add('playing');
      if (soundEnabled && audio?.state === 'running') playNote([72,76,79,84][index], audio.currentTime, .25, .15, musicGain);
      await delay(550);
      keys[index].classList.remove('playing'); await delay(220);
    }
    if (token !== gameToken) return;
    showing = false; replay.disabled = false; keys.forEach(key => key.disabled = false);
    document.querySelector('#status').textContent = `Твоя очередь: ${round+3} нажатия. Раунд ${round+1} из 3.`;
  }
  replay.onclick = show;
  keys.forEach((key,index) => key.onclick = () => {
    if (showing || finished) return;
    tone();
    if (index !== sequence[input]) {
      input = 0;
      document.querySelector('#status').textContent = 'Чуть мимо! Начни последовательность сначала или посмотри её ещё раз.';
      return;
    }
    input++;
    document.querySelector('#status').textContent = `Верно: ${input} из ${round+3}`;
    if (input === round+3) {
      round++; input = 0;
      if (round === 3) {
        finished = true; keys.forEach(key => key.disabled = true); replay.disabled = true;
        completed('Ритм пойман. Можно собирать группу!');
      } else show();
    }
  });
  show();
}
function quiz() {
  const questions = [
    { text: 'Ты обогнал бегуна, который был вторым. На каком месте ты теперь?', answers: ['На первом', 'На втором', 'На третьем'], correct: 1, hint: 'Ты занял его место. Лидер всё ещё впереди.' },
    { text: 'Два отца и два сына съели три куска торта. Каждому достался один. Как так?', answers: ['Один кусок разделили', 'Их было трое: дед, отец и сын', 'Торт был очень убедительный'], correct: 1, hint: 'Один человек может быть и отцом, и сыном одновременно.' },
    { text: 'В комнате три лампы. Ты выключил две. Сколько ламп осталось в комнате?', answers: ['Одна', 'Две', 'Три'], correct: 2, hint: 'Выключенные лампы никуда не ушли. Даже на праздник.' }
  ];
  let current = 0;
  const board = document.querySelector('#board');
  function draw() {
    const question = questions[current];
    document.querySelector('#status').textContent = `Вопрос ${current+1} из 3`;
    board.innerHTML = `<p class="question">${question.text}</p><div class="answers">${question.answers.map((answer,i) => `<button class="answer" data-answer="${i}">${answer}</button>`).join('')}</div>`;
    board.querySelectorAll('.answer').forEach(button => button.onclick = () => {
      if (Number(button.dataset.answer) !== question.correct) {
        button.disabled = true;
        document.querySelector('#status').textContent = question.hint; return;
      }
      tone(); current++;
      if (current < questions.length) draw();
      else { board.innerHTML = '<p class="question">Зачёт! Даже пересдача не понадобилась 😎</p>'; completed('Теперь осталось зажечь звёзды.'); }
    });
  }
  draw();
}
function stars() {
  const board = document.querySelector('#board');
  let cells, moves = 0, finished = false;
  const affected = index => [index, ...(index >= 3 ? [index-3] : []), ...(index < 6 ? [index+3] : []), ...(index % 3 ? [index-1] : []), ...(index % 3 < 2 ? [index+1] : [])];
  function reset() {
    cells = Array(9).fill(true);
    [0,4,8].forEach(index => affected(index).forEach(i => cells[i] = !cells[i]));
    moves = 0; finished = false; draw();
  }
  function draw() {
    board.innerHTML = `<div class="constellation">${cells.map((lit,i) => `<button class="tile ${lit ? 'playing' : ''}" data-star="${i}" aria-label="Звезда ${i+1}" aria-pressed="${lit}" ${finished ? 'disabled' : ''}>${lit ? '✦' : '✧'}</button>`).join('')}</div><button class="secondary" id="reset-stars">Сбросить звёзды</button><details class="hint"><summary>Подсказка к созвездию</summary>После сброса нажми верхнюю левую, центральную и нижнюю правую звёзды. Порядок не важен. Попробуй сначала найти решение сам!</details>`;
    document.querySelector('#status').textContent = `Горят ${cells.filter(Boolean).length} из 9 · Ходов: ${moves}`;
    board.querySelectorAll('[data-star]').forEach(button => button.onclick = () => {
      if (finished) return;
      affected(Number(button.dataset.star)).forEach(i => cells[i] = !cells[i]); moves++; tone();
      finished = cells.every(Boolean); draw();
      if (finished) completed('Все звёзды зажглись. Загадывай желание — и открывай письмо.');
    });
    document.querySelector('#reset-stars').onclick = () => {
      document.querySelector('#next').replaceChildren(); reset();
    };
  }
  reset();
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
