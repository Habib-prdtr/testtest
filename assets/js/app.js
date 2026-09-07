/**
 * Romantic Birthday Celebration Engine
 * Handles State, Audio Synthesis, Mini-games, Typewriter, and Confetti Explosions
 */

(function () {
  'use strict';

  // --- Sound Effects & Music Synthesizer (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.25, gainLevel = 0.15) {
      if (this.isMuted) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio not allowed yet', e);
      }
    }

    playKey() {
      this.playTone(587.33, 'sine', 0.15, 0.12); // D5
    }

    playSuccess() {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.4, 0.18), idx * 110);
      });
    }

    playWrong() {
      this.init();
      this.playTone(330, 'sawtooth', 0.25, 0.1);
      setTimeout(() => this.playTone(260, 'sawtooth', 0.3, 0.1), 150);
    }

    playPop() {
      this.init();
      if (this.isMuted) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }

    playCardFlip() {
      this.playTone(440, 'sine', 0.08, 0.08);
    }

    playCardMatch() {
      this.init();
      [659.25, 880, 1046.5].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'sine', 0.3, 0.15), i * 90);
      });
    }

    playGiftExplosion() {
      this.init();
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.6, 0.2), i * 80);
      });
    }

    toggleBgm() {
      this.init();
      this.bgmPlaying = !this.bgmPlaying;
      if (this.bgmPlaying) {
        this.startRomanticArpeggio();
      } else {
        clearTimeout(this.bgmTimer);
      }
      return this.bgmPlaying;
    }

    startRomanticArpeggio() {
      if (!this.bgmPlaying) return;
      // Romantic music box melody (Canon in D / Romantic cadence)
      const chordNotes = [
        [587.33, 739.99, 880, 1174.66], // D major
        [440, 554.37, 659.25, 880],     // A major
        [493.88, 587.33, 739.99, 987.77], // B minor
        [369.99, 440, 554.37, 739.99],  // F# minor
        [392.00, 493.88, 587.33, 783.99], // G major
        [587.33, 739.99, 880, 1174.66]  // D major
      ];

      let chordIdx = 0;
      let noteIdx = 0;

      const playNext = () => {
        if (!this.bgmPlaying) return;
        const currentChord = chordNotes[chordIdx];
        const freq = currentChord[noteIdx];
        this.playTone(freq, 'sine', 0.45, 0.05);

        noteIdx++;
        if (noteIdx >= currentChord.length) {
          noteIdx = 0;
          chordIdx = (chordIdx + 1) % chordNotes.length;
        }

        this.bgmTimer = setTimeout(playNext, 380);
      };

      playNext();
    }
  }

  const sound = new SoundEngine();

  // --- Confetti & Heart Particles Engine ---
  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.active = false;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(count = 200) {
      this.active = true;
      const colors = ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#a855f7', '#38bdf8', '#ffffff', '#fde047'];
      const shapes = ['rect', 'circle', 'heart', 'ribbon'];

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2 + (Math.random() * 80 - 40),
          y: this.canvas.height / 2 + 100,
          vx: (Math.random() - 0.5) * 22,
          vy: -(Math.random() * 20 + 8),
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 14,
          gravity: 0.35 + Math.random() * 0.15,
          drag: 0.96,
          opacity: 1,
          decay: Math.random() * 0.005 + 0.003
        });
      }

      if (!this.running) {
        this.running = true;
        this.animate();
      }
    }

    rainHearts(durationMs = 4000) {
      const interval = setInterval(() => {
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 14 + 10,
            color: '#f43f5e',
            shape: 'heart',
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 4,
            gravity: 0.05,
            drag: 0.99,
            opacity: 0.85,
            decay: 0.003
          });
        }
      }, 150);

      setTimeout(() => clearInterval(interval), durationMs);

      if (!this.running) {
        this.running = true;
        this.animate();
      }
    }

    drawHeart(x, y, size, color, opacity, rotation) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = color;

      const d = size;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -d / 4);
      this.ctx.bezierCurveTo(-d / 2, -d, -d, -d / 3, 0, d);
      this.ctx.bezierCurveTo(d, -d / 3, d / 2, -d, 0, -d / 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > this.canvas.height + 40) {
          this.particles.splice(i, 1);
          continue;
        }

        if (p.shape === 'heart') {
          this.drawHeart(p.x, p.y, p.size, p.color, p.opacity, p.rotation);
        } else if (p.shape === 'circle') {
          this.ctx.save();
          this.ctx.globalAlpha = p.opacity;
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        } else if (p.shape === 'ribbon') {
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.globalAlpha = p.opacity;
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 3);
          this.ctx.restore();
        } else {
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.globalAlpha = p.opacity;
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.ctx.restore();
        }
      }

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.animate());
      } else {
        this.running = false;
      }
    }
  }

  // --- Background Drifting Hearts Canvas ---
  function initAmbientHearts(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const hearts = [];
    const maxHearts = 24;

    const pastelColors = ['#f43f5e', '#fb7185', '#fb923c', '#f472b6', '#c084fc', '#38bdf8', '#facc15'];

    for (let i = 0; i < maxHearts; i++) {
      hearts.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 8,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: Math.sin(Math.random() * Math.PI * 2) * 0.4,
        opacity: Math.random() * 0.35 + 0.15,
        swing: Math.random() * 0.02 + 0.01,
        color: pastelColors[i % pastelColors.length]
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      hearts.forEach(h => {
        h.y -= h.speedY;
        h.x += Math.sin(h.y * h.swing) * 0.6 + h.speedX;

        if (h.y < -30) {
          h.y = height + 20;
          h.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.globalAlpha = h.opacity;
        ctx.fillStyle = h.color;

        const d = h.size;
        ctx.beginPath();
        ctx.moveTo(0, -d / 4);
        ctx.bezierCurveTo(-d / 2, -d, -d, -d / 3, 0, d);
        ctx.bezierCurveTo(d, -d / 3, d / 2, -d, 0, -d / 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(render);
    }

    render();
  }

  // --- State & DOM References ---
  const TARGET_PIN = '12052004';
  let currentPin = '';
  let confetti;

  // Romantic Quotes for Level 1 Bubble Pop (Singkat & Romantis)
  const romanticQuotes = [
    'Kamu duniaku ❤️',
    'Senyummu manis ✨',
    'Selalu di hatiku 💖',
    'Anugerah terindah 🌸',
    'Cintaku padamu 🌷',
    'Bidadari tercantik 👑',
    'Rumah ternyamanku 🕊️',
    'Bahagiaku bersamamu 🌟',
    'Doa terbaik untukmu 🎂',
    'I Love You Forever 💍'
  ];

  // Quiz Questions for Level 2
  const quizQuestions = [
    {
      question: 'Apa hal pertama yang paling bikin aku jatuh cinta padamu?',
      options: [
        'Senyum tulus dan kebaikan hatimu',
        'Tawamu yang manis dan bikin tenang',
        'Tatapan matamu yang hangat & teduh',
        'Semua yang ada pada dirimu tanpa terkecuali!'
      ],
      correctIndex: 3,
      wrongSweetNote: 'Pilihanmu manis sekali sayang! Tapi bagiku, setiap jengkal dan detik tentang dirimu adalah alasan aku jatuh cinta setiap hari ❤️ Coba lagi ya!'
    },
    {
      question: 'Kalau kamu lagi lelah atau bad mood, apa yang paling ingin aku lakukan?',
      options: [
        'Kirimkan makanan & camilan manis kesukaanmu',
        'Mendengarkan semua ceritamu dengan penuh kasih',
        'Memelukmu erat dan bilang "semuanya baik-baik saja"',
        'Selalu ada di sisimu sampai kamu tersenyum kembali'
      ],
      correctIndex: 3,
      wrongSweetNote: 'Aww itu juga pasti kulakukan! Tapi yang paling utama, aku selalu ingin ada di sisimu sampai senyum manismu kembali bersinar 💕'
    },
    {
      question: 'Di antara semua tempat di dunia ini, tempat mana yang paling favorit bagiku?',
      options: [
        'Tempat pertama kali kita saling bertatap mata',
        'Kedai kopi favorit kita dengan obrolan hangat',
        'Di mana pun, asalkan genggaman tanganku ada padamu',
        'Taman tepi pantai saat menikmati langit senja'
      ],
      correctIndex: 2,
      wrongSweetNote: 'Tempat itu memang indah, tapi bagiku tempat terindah di dunia bukanlah lokasi, melainkan saat berada di sampingmu sayang ❤️'
    },
    {
      question: 'Apa doa dan harapan terbesarku di hari ulang tahunmu ini?',
      options: [
        'Semoga kamu selalu sehat dan dilindungi',
        'Semoga cita-cita sucimu terwujud dengan mudah',
        'Semoga kebahagiaan menyertaimu tanpa henti',
        'Semua doa terbaik, dan kita terus bersama selamanya!'
      ],
      correctIndex: 3,
      wrongSweetNote: 'Doa itu indah sekali! Tapi harapanku adalah semua kebaikan itu tercurah untukmu, dan aku bisa terus mendampingimu selamanya 🥰'
    }
  ];

  // Memory Card Data for Level 3 (12 cards = 6 pairs)
  const memoryPairs = [
    { id: 'rose', icon: '🌹', name: 'Mawar Cinta' },
    { id: 'ring', icon: '💍', name: 'Cincin Janji' },
    { id: 'letter', icon: '💌', name: 'Surat Hati' },
    { id: 'bear', icon: '🧸', name: 'Boneka Peluk' },
    { id: 'cake', icon: '🎂', name: 'Kue Ultah' },
    { id: 'gift', icon: '🎁', name: 'Kado Kasih' }
  ];

  // Polaroid Photos Data
  const polaroids = [
    {
      src: 'assets/images/photo1.jpg',
      caption: 'Langkah kaki berdua menyusuri pantai senja 🌅',
      story: 'Momen saat kita berjalan berdua diiringi deburan ombak dan hangatnya sinar keemasan senja. Waktu seakan berhenti ketika tangan kita saling terpaut erat.'
    },
    {
      src: 'assets/images/photo2.jpg',
      caption: 'Kopi hangat & manisnya senyumanmu di cafe ☕',
      story: 'Dua cangkir kopi berbusa hati, sepotong kue stroberi manis, dan obrolan panjang yang tak pernah membosankan. Senyummu selalu menjadi hal termanis di mejaku.'
    },
    {
      src: 'assets/images/photo3.jpg',
      caption: 'Lilin kecil, percikan kembang api & harapan kita ✨',
      story: 'Di bawah kerlip cahaya malam yang indah, lilin ulang tahun ini menyala sebagai lambang doa tulusku agar masa depanmu selalu bersinar terang benderang.'
    },
    {
      src: 'assets/images/photo4.jpg',
      caption: 'Buket mawar merah lambang cinta tulusku 🌹',
      story: 'Bunga mawar merekah ini mungkin akan layu seiring waktu, tetapi rasa kasih dan sayangku padamu akan selalu bersemi segar di setiap hembusan nafas.'
    },
    {
      src: 'assets/images/photo5.jpg',
      caption: 'Genggaman jemari yang tak akan pernah kulepaskan 🤝',
      story: 'Bukan sekadar menggenggam, tapi janji bahwa apa pun musim yang akan kita lalui—panas maupun hujan badai—kamu tidak akan pernah berjalan sendirian.'
    }
  ];

  // Letter Content
  const letterText = `Untuk Seseorang yang Paling Berharga Dalam Hidupku,

Selamat ulang tahun, bidadariku tercinta.

Di hari yang begitu istimewa ini, aku memanjatkan rasa syukur yang tak terhingga kepada Sang Pencipta karena telah menghadirkanmu di dunia ini, dan menakdirkan jalan hidup kita untuk saling menemukan dan melengkapi.

Terima kasih atas setiap senyuman manismu yang selalu sanggup menerangi sudut hari-hariku yang paling gelap. Terima kasih untuk ketulusan hatimu, kelembutan bicaramu, dan pelukan hangatmu yang selalu menjadi pelabuhan paling tenang bagi jiwaku saat lelah.

Di usiamu yang kini bertambah, doaku selalu tercurah untukmu: semoga setiap langkah kakimu senantiasa diberkahi, cita-cita dan impian sucimu dimudahkan, kesehatan serta keselamatan selalu melindungimu, dan tawa bahagiamu tak pernah pudar.

Aku berjanji akan selalu ada di sampingmu—menjadi pendukung setiamu, tempatmu bercerita tanpa rasa ragu, dan teman hidup yang akan terus mencintaimu di setiap pergantian waktu.

Selamat bertambah usia, bidadariku tercinta. I love you more than words could ever describe, more than yesterday, and less than tomorrow. Selamanya milikmu.

Dengan segenap cinta,
❤️`;

  // --- Initializer on DOM Load ---
  document.addEventListener('DOMContentLoaded', () => {
    confetti = new ConfettiEngine('confetti-canvas');
    initAmbientHearts('hearts-canvas');

    initPinScreen();
    initGreetingCard();
    initLevel1();
    initLevel2();
    initLevel3();
    initPolaroidGallery();
    initLoveLetter();
    initGiftSurprise();
    initMusicControl();
  });

  // --- Navigation Screen Switcher ---
  function showScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(el => {
      el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- Music Control ---
  function initMusicControl() {
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicIcon = document.getElementById('music-icon');
    const musicText = document.getElementById('music-status-text');

    if (!musicBtn) return;

    musicBtn.addEventListener('click', () => {
      const isPlaying = sound.toggleBgm();
      if (isPlaying) {
        musicIcon.innerHTML = '🎵';
        musicBtn.classList.add('border-pink-500', 'shadow-pink-500/50', 'bg-pink-600/30');
        if (musicText) musicText.innerText = 'Musik: Menyala';
      } else {
        musicIcon.innerHTML = '🔇';
        musicBtn.classList.remove('border-pink-500', 'shadow-pink-500/50', 'bg-pink-600/30');
        if (musicText) musicText.innerText = 'Musik: Hening';
      }
    });
  }

  // --- Screen 1: PIN Screen ---
  function initPinScreen() {
    const pinDots = document.querySelectorAll('.pin-dot');
    const pinPad = document.getElementById('pin-keypad');
    const pinFeedback = document.getElementById('pin-feedback');
    const pinCard = document.getElementById('pin-card');

    function updateDots() {
      pinDots.forEach((dot, idx) => {
        if (idx < currentPin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });
    }

    function checkPin() {
      if (currentPin.length !== 8) return;

      if (currentPin === TARGET_PIN) {
        sound.playSuccess();
        confetti.burst(120);
        pinFeedback.innerHTML = '<span class="text-emerald-400 font-medium">Kunci Terbuka! Selamat Ulang Tahun Sayang! 🎉</span>';

        setTimeout(() => {
          showScreen('greeting-screen');
          confetti.rainHearts(3000);
          // auto turn on gentle BGM
          if (!sound.bgmPlaying) {
            sound.toggleBgm();
            const musicIcon = document.getElementById('music-icon');
            if (musicIcon) musicIcon.innerHTML = '🎵';
          }
        }, 800);
      } else {
        sound.playWrong();
        pinCard.classList.add('shake');
        pinFeedback.innerHTML = '<span class="text-rose-400 font-medium animate-pulse">Oops, bukan tanggal itu sayang.. Coba ingat tanggal terindah saat kamu lahir ke dunia ya 💕 (Hint: DDMMYYYY)</span>';

        setTimeout(() => {
          pinCard.classList.remove('shake');
          currentPin = '';
          updateDots();
        }, 1200);
      }
    }

    if (pinPad) {
      pinPad.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        sound.init();

        const val = btn.dataset.val;
        if (val === 'del') {
          if (currentPin.length > 0) {
            currentPin = currentPin.slice(0, -1);
            sound.playKey();
            updateDots();
          }
        } else if (val === 'clear') {
          currentPin = '';
          sound.playKey();
          updateDots();
        } else if (val && currentPin.length < 8) {
          currentPin += val;
          sound.playKey();
          updateDots();
          if (currentPin.length === 8) {
            setTimeout(checkPin, 150);
          }
        }
      });
    }

    // Support physical keyboard
    window.addEventListener('keydown', e => {
      const pinScreen = document.getElementById('pin-screen');
      if (pinScreen && pinScreen.classList.contains('hidden')) return;

      if (e.key >= '0' && e.key <= '9') {
        if (currentPin.length < 8) {
          currentPin += e.key;
          sound.playKey();
          updateDots();
          if (currentPin.length === 8) {
            setTimeout(checkPin, 150);
          }
        }
      } else if (e.key === 'Backspace') {
        if (currentPin.length > 0) {
          currentPin = currentPin.slice(0, -1);
          sound.playKey();
          updateDots();
        }
      }
    });
  }

  // --- Screen 2: Greeting Card Screen ---
  function initGreetingCard() {
    const startLevel1Btn = document.getElementById('start-level1-btn');
    if (startLevel1Btn) {
      startLevel1Btn.addEventListener('click', () => {
        sound.playSuccess();
        showScreen('level1-screen');
        spawnHeartBubbles();
      });
    }
  }

  // --- Screen 3: Level 1 (Catch 10 Heart Bubbles) ---
  let bubblesCaught = 0;

  function initLevel1() {
    const nextToLvl2Btn = document.getElementById('next-level2-btn');
    if (nextToLvl2Btn) {
      nextToLvl2Btn.addEventListener('click', () => {
        sound.playSuccess();
        showScreen('level2-screen');
        loadQuizQuestion(0);
      });
    }
  }

  function spawnHeartBubbles() {
    bubblesCaught = 0;
    const container = document.getElementById('bubble-play-area');
    const counterText = document.getElementById('bubble-counter-text');
    const progressBar = document.getElementById('bubble-progress-bar');
    const modal = document.getElementById('level1-complete-modal');

    if (!container) return;
    container.innerHTML = '';
    counterText.innerText = '0 / 10';
    progressBar.style.width = '0%';
    modal.classList.add('hidden');

    // Distribusi posisi yang rapi & berada aman di dalam arena agar tidak mepet tepi
    const positions = [
      { top: 24, left: 20 },
      { top: 52, left: 22 },
      { top: 28, left: 45 },
      { top: 62, left: 48 },
      { top: 24, left: 68 },
      { top: 52, left: 70 },
      { top: 38, left: 28 },
      { top: 38, left: 58 },
      { top: 70, left: 32 },
      { top: 68, left: 60 }
    ];

    for (let i = 0; i < 10; i++) {
      // Muncul bertahap (perlahan satu per satu dengan delay staggered)
      setTimeout(() => {
        // Cek jika container masih ada / screen masih aktif
        const activeScreen = document.getElementById('level1-screen');
        if (!activeScreen || activeScreen.classList.contains('hidden')) return;

        const bubble = document.createElement('div');
        bubble.className = 'heart-bubble';

        const size = Math.floor(Math.random() * 12) + 64; // 64px - 76px
        const pos = positions[i] || {
          top: Math.floor(Math.random() * 50) + 20,
          left: Math.floor(Math.random() * 60) + 20
        };

        const animDelay = (Math.random() * 2).toFixed(2);
        const animDuration = (Math.random() * 2 + 4.5).toFixed(2);

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.top = `${pos.top}%`;
        bubble.style.left = `${pos.left}%`;
        bubble.style.animationDelay = `${animDelay}s`;
        bubble.style.animationDuration = `${animDuration}s`;
        bubble.style.transform = 'scale(0)';
        bubble.style.opacity = '0';
        bubble.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';

        bubble.innerHTML = `
          <div class="flex flex-col items-center justify-center pointer-events-none select-none">
            <span class="text-3xl filter drop-shadow">💖</span>
          </div>
        `;

        container.appendChild(bubble);

        // Suara chime lembut saat gelembung muncul
        sound.playTone(500 + i * 40, 'sine', 0.1, 0.03);

        // Animasi muncul membesar (smooth pop in)
        requestAnimationFrame(() => {
          bubble.style.transform = 'scale(1)';
          bubble.style.opacity = '1';
        });

        let clicked = false;
        bubble.addEventListener('click', () => {
          if (clicked) return;
          clicked = true;

          sound.playPop();

          // Spawn floating romantic quote dengan clamping koordinat aman
          const rect = bubble.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const quoteText = romanticQuotes[i] || 'I Love You ❤️';

          const rawX = rect.left - containerRect.left + rect.width / 2;
          // Kunci posisi agar tidak pernah menabrak tepi kiri atau kanan
          const clampedX = Math.max(90, Math.min(containerRect.width - 90, rawX));
          const rawY = rect.top - containerRect.top;
          // Kunci posisi atas agar tidak menembus batas atas kotak saat melayang
          const clampedY = Math.max(45, Math.min(containerRect.height - 35, rawY));

          const quotePill = document.createElement('div');
          quotePill.className = 'absolute bubble-quote-pill bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs md:text-sm px-3.5 py-1.5 rounded-full shadow-2xl border border-white/60 z-50 font-semibold flex items-center justify-center text-center';
          quotePill.style.left = `${clampedX}px`;
          quotePill.style.top = `${clampedY}px`;
          quotePill.innerText = quoteText;

          container.appendChild(quotePill);
          setTimeout(() => quotePill.remove(), 1600);

          // Pop out & hilang
          bubble.style.transform = 'scale(1.4)';
          bubble.style.opacity = '0';

          bubblesCaught++;
          counterText.innerText = `${bubblesCaught} / 10`;
          progressBar.style.width = `${(bubblesCaught / 10) * 100}%`;

          setTimeout(() => {
            bubble.remove();
            if (bubblesCaught >= 10) {
              setTimeout(() => {
                sound.playSuccess();
                confetti.burst(130);
                modal.classList.remove('hidden');
              }, 400);
            }
          }, 250);
        });

      }, i * 260); // Muncul perlahan setiap 260ms
    }
  }

  // --- Screen 4: Level 2 (Trivia Romantis) ---
  let currentQuestionIndex = 0;

  function initLevel2() {
    const modalCloseBtn = document.getElementById('quiz-wrong-close-btn');
    const wrongModal = document.getElementById('quiz-wrong-modal');

    if (modalCloseBtn && wrongModal) {
      modalCloseBtn.addEventListener('click', () => {
        wrongModal.classList.add('hidden');
      });
    }

    const nextToLvl3Btn = document.getElementById('next-level3-btn');
    if (nextToLvl3Btn) {
      nextToLvl3Btn.addEventListener('click', () => {
        sound.playSuccess();
        showScreen('level3-screen');
        startMemoryGame();
      });
    }
  }

  function loadQuizQuestion(index) {
    currentQuestionIndex = index;
    const qData = quizQuestions[index];
    const qText = document.getElementById('quiz-question-text');
    const qNum = document.getElementById('quiz-question-num');
    const qOptionsContainer = document.getElementById('quiz-options-container');
    const completeModal = document.getElementById('level2-complete-modal');

    if (!qData || !qText) return;
    completeModal.classList.add('hidden');

    qNum.innerText = `Pertanyaan ${index + 1} dari ${quizQuestions.length}`;
    qText.innerText = qData.question;
    qOptionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];

    qData.options.forEach((opt, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left p-4 rounded-2xl bg-white/90 hover:bg-pink-50 border border-rose-100/90 shadow-sm transition-all duration-300 flex items-center space-x-3 group active:scale-[0.98]';
      btn.innerHTML = `
        <span class="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-sm border border-pink-200 group-hover:bg-pink-500 group-hover:text-white transition shadow-xs">
          ${letters[optIdx]}
        </span>
        <span class="text-sm md:text-base text-slate-700 font-medium group-hover:text-rose-900 flex-1">${opt}</span>
      `;

      btn.addEventListener('click', () => {
        if (optIdx === qData.correctIndex) {
          // Correct answer
          btn.classList.remove('bg-white/90', 'hover:bg-pink-50');
          btn.classList.add('bg-emerald-100', 'border-emerald-400', 'text-emerald-900');
          sound.playSuccess();
          confetti.burst(60);

          setTimeout(() => {
            if (currentQuestionIndex + 1 < quizQuestions.length) {
              loadQuizQuestion(currentQuestionIndex + 1);
            } else {
              // Quiz Completed
              sound.playSuccess();
              confetti.burst(150);
              completeModal.classList.remove('hidden');
            }
          }, 800);
        } else {
          // Playful wrong note
          sound.playWrong();
          const wrongModal = document.getElementById('quiz-wrong-modal');
          const wrongText = document.getElementById('quiz-wrong-message');
          if (wrongModal && wrongText) {
            wrongText.innerText = qData.wrongSweetNote;
            wrongModal.classList.remove('hidden');
          }
        }
      });

      qOptionsContainer.appendChild(btn);
    });
  }

  // --- Screen 5: Level 3 (Memory Card Game - 12 Cards) ---
  let memoryTimerInterval = null;
  let memorySeconds = 0;
  let flippedCards = [];
  let matchedPairs = 0;
  let isCheckingMatch = false;

  function initLevel3() {
    const nextToMemoriesBtn = document.getElementById('next-memories-btn');
    if (nextToMemoriesBtn) {
      nextToMemoriesBtn.addEventListener('click', () => {
        sound.playSuccess();
        showScreen('memories-screen');
        confetti.rainHearts(3500);
      });
    }
  }

  function startMemoryGame() {
    const grid = document.getElementById('memory-card-grid');
    const timerDisplay = document.getElementById('memory-timer');
    const pairCountDisplay = document.getElementById('memory-pairs-count');
    const completeModal = document.getElementById('level3-complete-modal');

    if (!grid) return;
    grid.innerHTML = '';
    completeModal.classList.add('hidden');
    flippedCards = [];
    matchedPairs = 0;
    isCheckingMatch = false;
    memorySeconds = 0;
    pairCountDisplay.innerText = '0 / 6';

    clearInterval(memoryTimerInterval);
    memoryTimerInterval = setInterval(() => {
      memorySeconds++;
      const mins = String(Math.floor(memorySeconds / 60)).padStart(2, '0');
      const secs = String(memorySeconds % 60).padStart(2, '0');
      timerDisplay.innerText = `${mins}:${secs}`;
    }, 1000);

    // Prepare 12 cards (6 pairs)
    const cardDeck = [...memoryPairs, ...memoryPairs]
      .map((item, idx) => ({ ...item, uniqueKey: idx }))
      .sort(() => Math.random() - 0.5);

    cardDeck.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-flipper';
      cardEl.dataset.id = card.id;

      cardEl.innerHTML = `
        <div class="card-front">
          <span class="text-3xl select-none opacity-80">💝</span>
        </div>
        <div class="card-back flex flex-col items-center justify-center p-2">
          <span class="text-4xl mb-1">${card.icon}</span>
          <span class="text-xs font-semibold text-rose-100 text-center">${card.name}</span>
        </div>
      `;

      cardEl.addEventListener('click', () => {
        if (isCheckingMatch || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
          return;
        }

        sound.playCardFlip();
        cardEl.classList.add('flipped');
        flippedCards.push(cardEl);

        if (flippedCards.length === 2) {
          isCheckingMatch = true;
          const [first, second] = flippedCards;

          if (first.dataset.id === second.dataset.id) {
            // Match found!
            setTimeout(() => {
              sound.playCardMatch();
              first.classList.add('matched');
              second.classList.add('matched');
              matchedPairs++;
              pairCountDisplay.innerText = `${matchedPairs} / 6`;
              flippedCards = [];
              isCheckingMatch = false;

              if (matchedPairs === 6) {
                clearInterval(memoryTimerInterval);
                setTimeout(() => {
                  sound.playSuccess();
                  confetti.burst(160);
                  const resultTime = document.getElementById('memory-result-time');
                  if (resultTime) {
                    const mins = String(Math.floor(memorySeconds / 60)).padStart(2, '0');
                    const secs = String(memorySeconds % 60).padStart(2, '0');
                    resultTime.innerText = `${mins}:${secs}`;
                  }
                  completeModal.classList.remove('hidden');
                }, 500);
              }
            }, 500);
          } else {
            // Not a match, flip back
            setTimeout(() => {
              first.classList.remove('flipped');
              second.classList.remove('flipped');
              flippedCards = [];
              isCheckingMatch = false;
            }, 900);
          }
        }
      });

      grid.appendChild(cardEl);
    });
  }

  // --- Screen 6: Polaroid Gallery & Lightbox ---
  function initPolaroidGallery() {
    const galleryContainer = document.getElementById('polaroid-gallery-track');
    const lightboxModal = document.getElementById('polaroid-lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxStory = document.getElementById('lightbox-story');
    const lightboxClose = document.getElementById('lightbox-close-btn');

    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';

    const rotations = [-2.5, 3.2, -1.8, 2.7, -3];

    polaroids.forEach((item, idx) => {
      const col = document.createElement('div');
      col.className = 'w-full max-w-sm cursor-pointer select-none my-2';

      const rot = rotations[idx % rotations.length];

      col.innerHTML = `
        <div class="polaroid-card" style="transform: rotate(${rot}deg);">
          <div class="washi-tape"></div>
          <div class="aspect-square w-full overflow-hidden rounded mb-3 bg-gray-100">
            <img src="${item.src}" alt="${item.caption}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
          </div>
          <p class="font-romantic text-xl md:text-2xl text-gray-800 text-center leading-snug px-2">
            ${item.caption}
          </p>
        </div>
      `;

      col.addEventListener('click', () => {
        sound.playPop();
        lightboxImg.src = item.src;
        lightboxCaption.innerText = item.caption;
        lightboxStory.innerText = item.story;
        lightboxModal.classList.remove('hidden');
      });

      galleryContainer.appendChild(col);
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.add('hidden');
      });
    }

    if (lightboxModal) {
      lightboxModal.addEventListener('click', e => {
        if (e.target === lightboxModal) {
          lightboxModal.classList.add('hidden');
        }
      });
    }
  }

  // --- Screen 7: Love Letter & Typewriter ---
  let letterTypewriterRunning = false;

  function initLoveLetter() {
    const openLetterPageBtn = document.getElementById('open-letter-page-btn');
    const backToMemoriesBtn = document.getElementById('back-to-memories-btn');
    const envelope = document.getElementById('love-envelope');
    const letterPaper = document.getElementById('letter-content-paper');
    const letterTextEl = document.getElementById('letter-typewriter-text');
    const giftTriggerSection = document.getElementById('gift-surprise-section');

    if (openLetterPageBtn) {
      openLetterPageBtn.addEventListener('click', () => {
        sound.playSuccess();
        showScreen('letter-screen');
        confetti.rainHearts(3000);
      });
    }

    if (backToMemoriesBtn) {
      backToMemoriesBtn.addEventListener('click', () => {
        showScreen('memories-screen');
      });
    }

    if (!envelope) return;

    envelope.addEventListener('click', () => {
      if (envelope.classList.contains('open')) return;

      sound.playSuccess();
      envelope.classList.add('open');

      setTimeout(() => {
        letterPaper.classList.remove('hidden');
        letterPaper.scrollIntoView({ behavior: 'smooth' });

        if (!letterTypewriterRunning) {
          typewriteLetter(letterTextEl, letterText, () => {
            // Selesai mengetik: Tampilkan kado di bawah TANPA memaksa scroll
            if (giftTriggerSection) {
              giftTriggerSection.classList.remove('hidden');
              // Biarkan client membaca surat sampai tuntas dan scroll sendiri ke bawah
            }
          });
        }
      }, 700);
    });
  }

  function typewriteLetter(element, fullText, onComplete) {
    letterTypewriterRunning = true;
    element.innerHTML = '';
    let index = 0;
    const speed = 25; // ms per character

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.parentNode.appendChild(cursor);

    function nextChar() {
      if (index < fullText.length) {
        const char = fullText.charAt(index);
        if (char === '\n') {
          element.innerHTML += '<br>';
        } else {
          element.innerHTML += char;
        }
        index++;

        if (index % 12 === 0) {
          sound.playTone(600 + (index % 100), 'sine', 0.04, 0.02);
        }

        setTimeout(nextChar, speed);
      } else {
        cursor.remove();
        if (onComplete) onComplete();
      }
    }

    nextChar();
  }

  // --- Screen 8: Gift Box & Fullscreen Confetti Explosion ---
  function initGiftSurprise() {
    const giftBtn = document.getElementById('gift-box-btn');
    const surpriseModal = document.getElementById('gift-surprise-modal');

    if (!giftBtn) return;

    giftBtn.addEventListener('click', () => {
      sound.playGiftExplosion();
      confetti.burst(350);
      confetti.rainHearts(6000);

      setTimeout(() => {
        surpriseModal.classList.remove('hidden');
      }, 500);
    });

    if (surpriseModal) {
      // Menutup pop-up saat kartu atau area mana pun diklik
      surpriseModal.addEventListener('click', () => {
        sound.playPop();
        surpriseModal.classList.add('hidden');
      });
    }
  }

})();
