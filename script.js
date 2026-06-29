/* ============================================================
   for you ♡ • interaksi
   ============================================================ */
const CONFIG = {
  // password = tanggal lahir, 6 digit
  password: "010724",
};

/* ============================================================
   CHARACTER BUILDER — setiap mood menggunakan foto figurine
   ============================================================ */
const MOOD_PHOTOS = {
  normal: "foto2.png",   // coffee boy — chill, santai
  curious: "foto4.png",  // beanie girl — curious, tertanya-tanya
  happy: "foto5.png",    // bear boy — happy, excited!
  angry: "foto1.png",    // red hood TNT — marah!
  arms: "foto3.png",     // box monster — tangan ke atas!
};

function buildCat(mood) {
  const photo = MOOD_PHOTOS[mood] || MOOD_PHOTOS.normal;
  const cls = mood === "arms" ? "cat happy-arms" : "cat";
  return `<img class="${cls}" src="${photo}" alt="" draggable="false" />`;
}

document.querySelectorAll(".cat-wrap[data-cat]").forEach((wrap) => {
  wrap.insertAdjacentHTML("afterbegin", buildCat(wrap.dataset.cat));
});

/* tap karakter -> mantul */
document.addEventListener("click", (e) => {
  const cat = e.target.closest(".cat");
  if (!cat) return;
  cat.classList.remove("boing");
  void cat.offsetWidth;
  cat.classList.add("boing");
  spawnHearts(6);
  setTimeout(() => cat.classList.remove("boing"), 560);
});

/* ---------- background music (intro screens) ---------- */
const audioPlayer = document.getElementById("audioPlayer");
const musicToggle = document.getElementById("musicToggle");

function tryPlayMusic() {
  audioPlayer.volume = 0.5;
  audioPlayer.play()
    .then(() => musicToggle.classList.add("playing"))
    .catch(() => { });
}

// Coba langsung putar saat halaman dimuat (jika diizinkan oleh browser)
tryPlayMusic();

// Fallback: putar pada interaksi pertama (klik atau sentuhan layar di HP)
function startBgmOnInteraction() {
  tryPlayMusic();
  document.removeEventListener("click", startBgmOnInteraction);
  document.removeEventListener("touchstart", startBgmOnInteraction);
}

document.addEventListener("click", startBgmOnInteraction);
document.addEventListener("touchstart", startBgmOnInteraction);

musicToggle.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play()
      .then(() => musicToggle.classList.add("playing"))
      .catch(() => { });
  } else {
    audioPlayer.pause();
    musicToggle.classList.remove("playing");
  }
});

/* ---------- screen navigation ---------- */
const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  screens.forEach((s) => {
    s.classList.toggle("active", s.dataset.screen === id);
  });
  spawnHearts(8);
  if (id === "gate") resetPin();
}

document.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.go));
});

/* ---------- password keypad ---------- */
const pinDots = document.getElementById("pinDots");
const keypad = document.getElementById("keypad");
let pin = "";

function renderPin() {
  pinDots.querySelectorAll("span").forEach((d, i) => {
    d.classList.toggle("filled", i < pin.length);
  });
}
function resetPin() {
  pin = "";
  renderPin();
}

keypad.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const key = btn.dataset.key;

  if (key === "del") {
    pin = pin.slice(0, -1);
  } else if (pin.length < 6) {
    pin += key;
  }
  renderPin();

  if (pin.length === 6) {
    setTimeout(checkPin, 180);
  }
});

function checkPin() {
  if (pin === CONFIG.password) {
    spawnHearts(20);
    showScreen("intro");
  } else {
    pinDots.classList.add("shake");
    setTimeout(() => {
      pinDots.classList.remove("shake");
      resetPin();
    }, 500);
  }
}

/* ---------- "noo" button runs away ---------- */
const nooBtn = document.getElementById("nooBtn");
let dodges = 0;
function dodge() {
  dodges++;
  const dx = (Math.random() - 0.5) * 180;
  const dy = (Math.random() - 0.5) * 120;
  nooBtn.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 12}deg)`;
}
nooBtn.addEventListener("mouseenter", dodge);
nooBtn.addEventListener("touchstart", (e) => {
  if (dodges < 2) { e.preventDefault(); dodge(); }
});

/* ---------- floating hearts ---------- */
const heartsBg = document.getElementById("heartsBg");
const HEART_EMOJI = ["💙", "🩵", "🤍", "💛", "⭐"];

function spawnHearts(count) {
  for (let n = 0; n < count; n++) {
    const h = document.createElement("span");
    h.className = "fh";
    h.textContent = HEART_EMOJI[(Math.random() * HEART_EMOJI.length) | 0];
    h.style.left = Math.random() * 100 + "%";
    h.style.bottom = "-30px";
    h.style.fontSize = 16 + Math.random() * 18 + "px";
    h.style.animationDuration = 4 + Math.random() * 4 + "s";
    heartsBg.appendChild(h);
    setTimeout(() => h.remove(), 8500);
  }
}

setInterval(() => spawnHearts(2), 2200);
spawnHearts(6);

/* ═══════════════════════════════════════════════════════════
   OCEAN PAGE — transition, bubble canvas, playlist, garden
   ═══════════════════════════════════════════════════════════ */

document.getElementById("enterOcean").addEventListener("click", () => {
  // hide intro app, show ocean page
  document.getElementById("app").style.display = "none";
  document.body.classList.add("ocean-mode");

  const oceanPage = document.getElementById("ocean-page");
  oceanPage.style.display = "block";

  // start ocean systems
  initBubbleCanvas();
  initOceanPlaylist();
  initGarden();
  initScrollReveal();
  initLetterTyping();
});

/* ---------- BUBBLE CANVAS ---------- */
let petals = [];
let animating = false;

function initBubbleCanvas() {
  const canvas = document.getElementById("petal-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const COLORS = [
    "rgba(95,208,224,0.55)",
    "rgba(80,180,205,0.45)",
    "rgba(170,235,245,0.50)",
    "rgba(60,150,190,0.40)",
    "rgba(111,224,196,0.30)",
  ];

  function createPetal() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: Math.random() * 7 + 4,
      speed: Math.random() * 1.2 + 0.8,
      drift: (Math.random() - 0.5) * 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.4 + 0.25,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.opacity;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = p.opacity * 0.5;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    if (!animating) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (petals.length < 60 && Math.random() < 0.35) petals.push(createPetal());
    petals = petals.filter((p) => p.y > -30);
    petals.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift + Math.sin(p.y * 0.012) * 0.6;
      drawPetal(p);
    });
    requestAnimationFrame(animate);
  }

  animating = true;
  animate();
}

/* ---------- OCEAN PLAYLIST ---------- */
const playlist = [
  { title: "Iris", artist: "Goo Goo Dolls", src: "song1.mp3", emoji: "🪻" },
  { title: "Komang", artist: "Raim Laode", src: "song2.mp3", emoji: "🌅" },
  { title: "18", artist: "One Direction", src: "song3.mp3", emoji: "🎈" },
];
let currentTrack = 0;
let isPlaying = false;

function initOceanPlaylist() {
  const audio = document.getElementById("audioPlayer");
  audio.loop = false; // matikan loop agar playlist bisa berlanjut otomatis
  const playBtn = document.getElementById("playBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const disc = document.getElementById("musicDisc");
  const titleEl = document.getElementById("trackTitle");
  const artistEl = document.getElementById("trackArtist");
  const trackListEl = document.getElementById("trackList");

  // render track list
  playlist.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "track-row";
    row.dataset.index = i;
    row.innerHTML = `
      <div class="track-num"><span>${i + 1}</span></div>
      <div class="track-thumb">${t.emoji}</div>
      <div class="track-meta">
        <div class="tm-title">${t.title}</div>
        <div class="tm-artist">${t.artist}</div>
      </div>
      <div class="track-play">▶</div>`;
    row.addEventListener("click", () => loadTrack(i, true));
    trackListEl.appendChild(row);
  });

  function updateHighlight() {
    document.querySelectorAll(".track-row").forEach((r) => {
      const active = Number(r.dataset.index) === currentTrack;
      r.classList.toggle("active", active);
      const play = r.querySelector(".track-play");
      if (play) play.textContent = active && isPlaying ? "⏸" : "▶";
    });
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    disc.classList.toggle("playing", isPlaying);
  }

  audio.addEventListener("play", () => { isPlaying = true; updateHighlight(); });
  audio.addEventListener("pause", () => { isPlaying = false; updateHighlight(); });
  audio.addEventListener("ended", () => nextTrack());

  window.loadTrack = function (i, autoplay) {
    currentTrack = (i + playlist.length) % playlist.length;
    const t = playlist[currentTrack];
    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;
    
    // check if it is already playing or loaded with the same track
    const isSameSrc = audio.src.endsWith(t.src) || audio.src.includes(t.src);
    if (!isSameSrc) {
      audio.src = t.src;
      if (autoplay) audio.play().catch(() => { });
    } else {
      if (autoplay && audio.paused) {
        audio.play().catch(() => { });
      }
    }
    updateHighlight();
  };

  window.nextTrack = function () { loadTrack(currentTrack + 1, true); };
  window.prevTrack = function () { loadTrack(currentTrack - 1, true); };

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().catch(() => { });
    else audio.pause();
  });
  prevBtn.addEventListener("click", () => prevTrack());
  nextBtn.addEventListener("click", () => nextTrack());

  loadTrack(currentTrack, false);
}

/* ---------- FLOWER GARDEN ---------- */
function initGarden() {
  document.querySelectorAll(".flower-item").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".flower-item").forEach((f) => f.classList.remove("bloomed"));
      el.classList.add("bloomed");
      const msg = document.getElementById("garden-message");
      msg.style.opacity = "0";
      setTimeout(() => {
        msg.textContent = el.dataset.msg;
        msg.style.opacity = "1";
      }, 300);
    });
  });
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.closest(".grid-container")
            ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
            : 0;
          setTimeout(() => entry.target.classList.add("visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  elements.forEach((el) => observer.observe(el));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((el) => el.classList.add("visible"));
  }
}

/* ---------- LETTER TYPING EFFECT ---------- */
function initLetterTyping() {
  const box = document.querySelector(".letter-display-box");
  if (!box) return;

  const paragraphs = box.querySelectorAll(".letter-paragraph");
  const paragraphsData = [];

  // Extract and hide text content
  paragraphs.forEach((p) => {
    paragraphsData.push({
      element: p,
      text: p.innerHTML.trim()
    });
    p.innerHTML = "";
    p.style.opacity = "0";
  });

  let currentParaIndex = 0;
  let currentCharIndex = 0;
  let typingTimer = null;
  let isFinished = false;

  // Create cursor indicator
  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  cursor.innerHTML = "▋";
  cursor.style.color = "#f08ab0";
  cursor.style.marginLeft = "3px";
  cursor.style.animation = "blink 0.8s step-end infinite";

  function typeNextChar() {
    if (currentParaIndex >= paragraphsData.length) {
      finishTyping();
      return;
    }

    const currentPara = paragraphsData[currentParaIndex];
    currentPara.element.style.opacity = "1";

    const text = currentPara.text;

    // Attach cursor at the beginning of the paragraph typing session
    if (currentCharIndex === 0) {
      currentPara.element.appendChild(cursor);
    }

    if (currentCharIndex < text.length) {
      const char = text[currentCharIndex];
      cursor.before(char);
      currentCharIndex++;

      // Typing delays: natural pauses on punctuation
      let delay = 12;
      if (char === "." || char === "," || char === "?" || char === "-") {
        delay = 180;
      }

      typingTimer = setTimeout(typeNextChar, delay);
    } else {
      currentCharIndex = 0;
      currentParaIndex++;
      typingTimer = setTimeout(typeNextChar, 400);
    }
  }

  function finishTyping() {
    if (isFinished) return;
    isFinished = true;
    clearTimeout(typingTimer);
    cursor.remove();
    paragraphsData.forEach((para) => {
      para.element.innerHTML = para.text;
      para.element.style.opacity = "1";
    });
  }

  // Click on the letter box to reveal everything immediately
  box.addEventListener("click", finishTyping);

  // Trigger typing effect when scrolled into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeNextChar();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(box);
}
