'use strict';
const content = window.TRAM_CONTENT;
const $ = (selector) => document.querySelector(selector);
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
document.querySelectorAll('nav [data-page]').forEach(link => {
  if (link.dataset.page === document.body.dataset.page) link.setAttribute('aria-current', 'page');
});
const ambient = $('#ambient');
const soundButton = $('#sound-toggle');
function updateSound() {
  if (!soundButton || !ambient) return;
  soundButton.setAttribute('aria-pressed', String(!ambient.paused));
  const span = soundButton.querySelector('span');
  if (span) span.textContent = ambient.paused ? 'Bật nhạc nền' : 'Tắt nhạc nền';
}
if (ambient && soundButton) {
  ambient.volume = 0.25;
  ambient.addEventListener('play', updateSound);
  ambient.addEventListener('pause', updateSound);
  soundButton.addEventListener('click', async () => {
    const status = $('#audio-status');
    if (status) status.textContent = '';
    if (!ambient.paused) return ambient.pause();
    const episodePlayer = $('#episode-player');
    if (episodePlayer && !episodePlayer.paused) episodePlayer.pause();
    try { await ambient.play(); } catch { if (status) status.textContent = 'Chưa mở được nhạc nền. Bạn có thể thử lại sau.'; }
  });
}

// Lời nhắn dự phòng luôn hoạt động; bảng cũ vẫn được đọc theo cột cảm xúc / lời nhắn.
// Các dòng không có cảm xúc phù hợp không được gán ngẫu nhiên cho người đọc.
if ($('#moods')) {
  const moodQuotes = Object.fromEntries(Object.entries(content.moods).map(([key, list]) => [key, [...list]]));
  const previous = {};
  for (const mood of Object.keys(moodQuotes)) {
    const button = element('button', 'mood-button', mood);
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      document.querySelectorAll('.mood-button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const pool = moodQuotes[mood].filter(quote => quote !== previous[mood]);
      const choices = pool.length ? pool : moodQuotes[mood];
      const quote = choices[Math.floor(Math.random() * choices.length)];
      previous[mood] = quote;
      $('#mood-result').replaceChildren(element('p', '', quote));
    });
    $('#moods').append(button);
  }
  if (content.quoteSheetUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    fetch(content.quoteSheetUrl, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Quote source unavailable');
      return response.text();
    }).then(text => {
      const normalize = value => value.trim().toLocaleLowerCase('vi');
      text.split(/\r?\n/).slice(1).forEach(row => {
        const [label, quote] = row.split('\t');
        const mood = Object.keys(moodQuotes).find(key => normalize(key) === normalize(label || ''));
        if (mood && quote?.trim() && !moodQuotes[mood].includes(quote.trim())) moodQuotes[mood].push(quote.trim());
      });
    }).catch(() => { /* Nội dung có sẵn vẫn sử dụng được khi ngoại tuyến. */ }).finally(() => clearTimeout(timeout));
  }
}

if ($('#about-copy')) {
  content.about.forEach(paragraph => $('#about-copy').append(element('p', '', paragraph)));
}
const publishedPosts = content.posts.filter(post => post.published === true);
function postCard(post) {
  const card = element('a', 'post-card');
  card.href = 'bai-doc.html?id=' + encodeURIComponent(post.id);
  card.append(element('p', 'eyebrow', post.category || 'GÓC ĐỌC'), element('h2', '', post.title), element('p', '', post.excerpt), element('span', 'text-link', 'Đọc tiếp ↗'));
  return card;
}
if ($('#home-posts') && publishedPosts.length) {
  const grid = element('div', 'post-grid');
  publishedPosts.slice(0, 4).forEach(post => grid.append(postCard(post)));
  $('#home-posts').replaceChildren(grid);
}
if ($('#post-list')) {
  const letter = element('a', 'post-card');
  letter.href = 've-du-an.html';
  letter.append(element('p', 'eyebrow', 'LỜI NGỎ · TRIẾT VŨ'), element('h2', '', 'Vì sao có một trạm xoa dịu cảm xúc?'), element('p', '', content.about[0]), element('span', 'text-link', 'Đọc lời ngỏ ↗'));
  $('#post-list').append(letter);
  publishedPosts.forEach(post => $('#post-list').append(postCard(post)));
}
if ($('#article')) {
  const post = publishedPosts.find(item => item.id === new URLSearchParams(location.search).get('id'));
  const article = $('#article');
  article.replaceChildren();
  if (!post) {
    article.append(element('h1', '', 'Bài viết chưa có ở đây.'), element('p', '', 'Bạn có thể ghé góc đọc để tìm một bài khác.'));
  } else {
    document.title = post.title + ' · Trạm xoa dịu cảm xúc';
    const words = post.paragraphs.join(' ').split(/\s+/).length;
    article.append(element('p', 'eyebrow', post.category || 'GÓC ĐỌC'), element('h1', '', post.title), element('p', 'article-meta', (post.author || content.author) + ' · ' + Math.max(1, Math.ceil(words / 200)) + ' phút đọc'));
    post.paragraphs.forEach(paragraph => article.append(element('p', '', paragraph)));
  }
  const back = element('a', 'text-link', '← Trở lại góc đọc');
  back.href = 'bai-viet.html';
  article.append(back);
}

if ($('#episodes')) {
  const player = $('#episode-player');
  const speedBtn = $('#speed-btn');
  const speedVal = $('#speed-val');
  const timerSelect = $('#timer-select');
  const timerBadge = $('#timer-badge');
  const timeDisplay = $('#player-time-display');

  let activeFile = '';
  let request = 0;
  let timerInterval = null;
  let timerRemaining = 0;
  let stopAtTrackEnd = false;
  const speeds = [1.0, 1.2, 0.8];
  let speedIndex = 0;

  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function updateTimeDisplay() {
    if (timeDisplay) {
      timeDisplay.textContent = formatTime(player.currentTime) + ' / ' + formatTime(player.duration || 0);
    }
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRemaining = 0;
    stopAtTrackEnd = false;
    if (timerBadge) {
      timerBadge.style.display = 'none';
      timerBadge.textContent = '';
    }
  }

  function applyTimer(val) {
    clearTimer();
    if (!val || val === '0') return;
    if (val === 'end') {
      stopAtTrackEnd = true;
      if (timerBadge) {
        timerBadge.style.display = 'inline-flex';
        timerBadge.textContent = '⏱ Tắt khi hết tập';
      }
      return;
    }
    const mins = parseInt(val, 10);
    if (isNaN(mins) || mins <= 0) return;
    timerRemaining = mins * 60;
    if (timerBadge) {
      timerBadge.style.display = 'inline-flex';
      timerBadge.textContent = '⏱ Tắt sau ' + formatTime(timerRemaining);
    }
    timerInterval = setInterval(() => {
      if (player.paused) return;
      timerRemaining--;
      if (timerRemaining <= 10 && timerRemaining > 0) {
        player.volume = Math.max(0, timerRemaining / 10);
      }
      if (timerRemaining <= 0) {
        clearTimer();
        player.pause();
        player.volume = 1;
        if (timerSelect) timerSelect.value = '0';
        const st = $('#player-status');
        if (st) st.textContent = 'Đã tự động tắt podcast theo hẹn giờ của bạn.';
      } else if (timerBadge) {
        timerBadge.textContent = '⏱ Tắt sau ' + formatTime(timerRemaining);
      }
    }, 1000);
  }

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      speedIndex = (speedIndex + 1) % speeds.length;
      const spd = speeds[speedIndex];
      player.playbackRate = spd;
      if (speedVal) speedVal.textContent = spd.toFixed(1) + 'x';
    });
  }

  if (timerSelect) {
    timerSelect.addEventListener('change', (e) => {
      applyTimer(e.target.value);
    });
  }

  player.addEventListener('timeupdate', updateTimeDisplay);
  player.addEventListener('loadedmetadata', updateTimeDisplay);
  player.addEventListener('ended', () => {
    if (stopAtTrackEnd) {
      clearTimer();
      if (timerSelect) timerSelect.value = '0';
      const st = $('#player-status');
      if (st) st.textContent = 'Đã tự động tắt podcast sau khi hết tập.';
    }
  });

  $('#episode-count').textContent = content.episodes.length + ' TẬP ĐỂ GHÉ NGHE';
  const rows = [];
  function updateEpisodes() {
    rows.forEach(({ row, button, episode }) => {
      const active = activeFile === episode.file;
      const playing = active && !player.paused;
      row.classList.toggle('active', active);
      button.textContent = playing ? 'Ⅱ' : '▶';
      button.setAttribute('aria-label', (playing ? 'Tạm dừng: ' : 'Nghe: ') + episode.title);
      button.setAttribute('aria-pressed', String(playing));
    });
  }
  content.episodes.forEach((episode, index) => {
    const row = element('div', 'episode');
    const copy = element('div', 'episode-copy');
    const button = element('button', '', '▶');
    button.type = 'button';
    copy.append(element('h3', '', episode.title), element('p', '', episode.description));
    row.append(element('span', 'episode-number', String(index + 1).padStart(2, '0')), copy, button);
    rows.push({ row, button, episode });
    button.addEventListener('click', async () => {
      const currentRequest = ++request;
      $('#player-status').textContent = '';
      if (activeFile === episode.file && !player.paused) return player.pause();
      if (ambient) ambient.pause();
      if (activeFile !== episode.file) {
        activeFile = episode.file;
        player.src = episode.file;
        player.playbackRate = speeds[speedIndex];
        $('#now-playing').textContent = episode.title;
      }
      try { await player.play(); } catch (error) {
        if (currentRequest === request && error.name !== 'AbortError') $('#player-status').textContent = 'Chưa phát được tập này. Bạn thử nhấn phát lại nhé.';
      }
      updateEpisodes();
    });
    $('#episodes').append(row);
  });
  ['play', 'pause', 'ended'].forEach(event => player.addEventListener(event, updateEpisodes));
  player.addEventListener('play', () => { if (ambient) ambient.pause(); });
  player.addEventListener('error', () => { $('#player-status').textContent = 'Không tải được âm thanh. Bạn có thể chọn một tập khác hoặc thử lại.'; });
  updateEpisodes();
}
