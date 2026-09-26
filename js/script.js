/* ===============================================
   GDG Museum — script.js
   Handles: theme toggle, exhibit search/filter,
   suggestion form validation, scroll-spy nav.
   =============================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. DARK / LIGHT MODE TOGGLE ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeToggleIcon');
  const body = document.body;

  function applyTheme(theme) {
    if (theme === 'light') {
      body.classList.add('light-mode');
      themeIcon.innerHTML = '&#9788;'; // sun
    } else {
      body.classList.remove('light-mode');
      themeIcon.innerHTML = '&#9789;'; // moon
    }
  }

  const savedTheme = localStorage.getItem('gdg-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', function () {
    const current = body.classList.contains('light-mode') ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('gdg-theme', next);
  });


  /* ---------- 2. EXHIBIT SEARCH / FILTER ---------- */
  const searchInput = document.getElementById('exhibitSearch');
  const exhibitCols = document.querySelectorAll('.exhibit-col');
  const searchCount = document.getElementById('exhibitSearchCount');

  function filterExhibits() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    exhibitCols.forEach(function (col) {
      const card = col.querySelector('.exhibit-card');
      const genre = card.dataset.genre.toLowerCase();
      const game = card.dataset.game.toLowerCase();
      const matches = genre.includes(query) || game.includes(query);

      col.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    if (query === '') {
      searchCount.textContent = '';
    } else {
      searchCount.textContent = visibleCount === 0
        ? 'No exhibits match "' + searchInput.value + '"'
        : visibleCount + ' exhibit' + (visibleCount === 1 ? '' : 's') + ' found';
    }
  }

  searchInput.addEventListener('input', filterExhibits);


  /* ---------- 3. SUGGESTION FORM VALIDATION ---------- */
  const form = document.getElementById('suggestForm');
  const nameField = document.getElementById('visitorName');
  const emailField = document.getElementById('visitorEmail');
  const genreField = document.getElementById('visitorGenre');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const genreError = document.getElementById('genreError');
  const successMsg = document.getElementById('suggestSuccess');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function clearErrors() {
    [nameError, emailError, genreError].forEach(function (el) {
      el.textContent = '';
    });
    [nameField, emailField, genreField].forEach(function (el) {
      el.classList.remove('is-invalid');
    });
  }

  function markInvalid(field, errorEl, message) {
    field.classList.add('is-invalid');
    errorEl.textContent = message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    successMsg.textContent = '';

    let valid = true;

    if (nameField.value.trim().length < 2) {
      markInvalid(nameField, nameError, 'Please enter your name.');
      valid = false;
    }

    if (!emailPattern.test(emailField.value.trim())) {
      markInvalid(emailField, emailError, 'Please enter a valid email address.');
      valid = false;
    }

    if (genreField.value.trim().length < 5) {
      markInvalid(genreField, genreError, 'Tell us the genre and game (at least 5 characters).');
      valid = false;
    }

    if (!valid) return;

    // No backend — simulate a successful submission.
    successMsg.textContent = 'Thanks, ' + nameField.value.trim() + '! Your suggestion has been added to the visitor log.';
    form.reset();
  });


  /* ---------- 4. SCROLL-SPY ACTIVE NAV LINK ---------- */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(function (section) {
    observer.observe(section);
  });


  /* ---------- 5. HERO BANNER: AUTO-SCROLL + MANUAL SCROLL ---------- */
  const bannerTrack = document.getElementById('bannerTrack');
  const bannerPrev = document.getElementById('bannerPrev');
  const bannerNext = document.getElementById('bannerNext');

  if (bannerTrack) {
    const AUTO_SCROLL_SPEED = 3.5;   // px per animation frame
    const RESUME_DELAY = 3000;       // ms of inactivity before auto-scroll resumes
    let autoScrollEnabled = true;
    let resumeTimer = null;
    let rafId = null;

    function step() {
      if (autoScrollEnabled) {
        const maxScroll = bannerTrack.scrollWidth - bannerTrack.clientWidth;
        if (maxScroll <= 0) {
          rafId = requestAnimationFrame(step);
          return;
        }
        if (bannerTrack.scrollLeft >= maxScroll - 1) {
          bannerTrack.scrollLeft = 0; // loop back to start
        } else {
          bannerTrack.scrollLeft += AUTO_SCROLL_SPEED;
        }
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);

    function pauseAutoScroll() {
      autoScrollEnabled = false;
      bannerTrack.classList.add('snap-active'); // let manual scroll/snap take over cleanly
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        autoScrollEnabled = true;
        bannerTrack.classList.remove('snap-active'); // let auto-scroll move freely again
      }, RESUME_DELAY);
    }

    // Any manual interaction pauses the auto-scroll for a bit.
    ['wheel', 'touchstart', 'pointerdown'].forEach(function (evt) {
      bannerTrack.addEventListener(evt, pauseAutoScroll, { passive: true });
    });

    function slideWidth() {
      const firstSlide = bannerTrack.querySelector('.hero-slide');
      return firstSlide ? firstSlide.getBoundingClientRect().width : bannerTrack.clientWidth;
    }

    function atStart() {
      return bannerTrack.scrollLeft <= 4;
    }

    function atEnd() {
      const maxScroll = bannerTrack.scrollWidth - bannerTrack.clientWidth;
      return bannerTrack.scrollLeft >= maxScroll - 4;
    }

    bannerPrev.addEventListener('click', function () {
      pauseAutoScroll();
      if (atStart()) {
        bannerTrack.scrollTo({ left: bannerTrack.scrollWidth, behavior: 'smooth' });
      } else {
        bannerTrack.scrollBy({ left: -slideWidth(), behavior: 'smooth' });
      }
    });

    bannerNext.addEventListener('click', function () {
      pauseAutoScroll();
      if (atEnd()) {
        bannerTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        bannerTrack.scrollBy({ left: slideWidth(), behavior: 'smooth' });
      }
    });

    // Pause when the browser tab isn't visible, resume when it is again.
    document.addEventListener('visibilitychange', function () {
      autoScrollEnabled = !document.hidden;
      bannerTrack.classList.toggle('snap-active', document.hidden);
    });
  }

});
