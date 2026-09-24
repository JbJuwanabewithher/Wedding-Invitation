const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const navigableSections = sections.filter((section) => navLinks.some((link) => link.getAttribute('href') === `#${section.id}`));

const countdown = document.querySelector('[data-countdown]');
const countdownComplete = document.querySelector('[data-countdown-complete]');
const countdownTarget = countdown ? new Date(countdown.dataset.target).getTime() : 0;

const updateCountdown = () => {
  if (!countdown || !countdownComplete) return;

  const remaining = countdownTarget - Date.now();
  if (remaining <= 0) {
    countdown.hidden = true;
    countdownComplete.hidden = false;
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  Object.entries(values).forEach(([unit, value]) => {
    const element = countdown.querySelector(`[data-unit="${unit}"]`);
    if (element) element.textContent = String(value).padStart(2, '0');
  });
};

updateCountdown();
if (countdown) window.setInterval(updateCountdown, 1000);

const attireButtons = [...document.querySelectorAll('[data-attire-color]')];
const attireGallery = document.querySelector('[data-attire-color]')?.closest('.ceremony-card')?.querySelector('.attire-gallery');
const attireImages = attireGallery ? [...attireGallery.querySelectorAll('[data-attire-image]')] : [];
let activeAttireColor = null;
let attireTransitionTimer;

const setAttireImages = (color) => {
  attireImages.forEach((image, index) => {
    image.classList.remove('is-loaded');
    image.hidden = true;
    image.loading = 'eager';
    image.alt = `${color[0].toUpperCase()}${color.slice(1)} attire, photo ${index + 1}`;
    image.onload = () => {
      image.hidden = false;
      image.classList.add('is-loaded');
    };
    image.onerror = () => {
      image.hidden = true;
      image.classList.remove('is-loaded');
    };
    image.src = `images/${color}-${index + 1}.jpeg`;
  });
};

const updateAttireButtons = () => {
  attireButtons.forEach((button) => {
    const isActive = button.dataset.attireColor === activeAttireColor;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-expanded', String(isActive));
  });
};

attireButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!attireGallery) return;
    window.clearTimeout(attireTransitionTimer);

    if (activeAttireColor === button.dataset.attireColor) {
      activeAttireColor = null;
      updateAttireButtons();
      attireGallery.classList.remove('is-visible');
      return;
    }

    const nextColor = button.dataset.attireColor;
    const wasVisible = attireGallery.classList.contains('is-visible');
    activeAttireColor = nextColor;
    updateAttireButtons();

    const reveal = () => {
      attireGallery.classList.add('is-visible');
      setAttireImages(nextColor);
      window.requestAnimationFrame(() => attireGallery.classList.remove('is-switching'));
    };

    if (wasVisible) {
      attireGallery.classList.add('is-switching');
      attireTransitionTimer = window.setTimeout(reveal, 300);
    } else {
      reveal();
    }
  });
});

menuToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const setActiveLink = () => {
  const current = navigableSections.reduce((visibleSection, section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - 110);
    return !visibleSection || distance < visibleSection.distance
      ? { id: section.id, distance }
      : visibleSection;
  }, null);

  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current?.id}`));
};

window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();
