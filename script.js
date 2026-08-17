// === Dark/Light Mode ===
(function() {
  const toggle = document.getElementById('darkModeToggle');
  const body = document.body;

  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light');
  } else {
    body.classList.remove('light');
    if (toggle) toggle.checked = true;
  }

  if (toggle) {
    toggle.addEventListener('change', () => {
      body.classList.toggle('light');
      localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
    });
  }
})();

// === Mouse Follower ===
(function() {
  const follower = document.createElement('div');
  follower.className = 'mouse-follower';
  document.body.appendChild(follower);

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    follower.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    follower.classList.remove('active');
  });

  function animateFollower() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    follower.style.left = currentX + 'px';
    follower.style.top = currentY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .project-card, .btn-primary, .btn-secondary').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
  });
})();

// === Scroll-based Navbar ===
(function() {
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
})();

// === Scroll Reveal (Intersection Observer) ===
(function() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, observerOptions);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      observer.observe(el);
    });
  });
})();

// === Counter Animation ===
(function() {
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString() + (el.getAttribute('data-suffix') || '');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString() + (el.getAttribute('data-suffix') || '');
      }
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target.querySelector('.stat-number');
        if (counter && !counter.dataset.animated) {
          counter.dataset.animated = 'true';
          animateCounter(counter);
        }
      }
    });
  }, { threshold: 0.5 });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-item').forEach(el => counterObserver.observe(el));
  });
})();

// === Smooth Page Transitions ===
(function() {
  const transitionEl = document.createElement('div');
  transitionEl.className = 'page-transition';
  document.body.appendChild(transitionEl);

  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a[href]:not([target="_blank"])');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
        if (link.href === window.location.href) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        transitionEl.classList.add('active');
        setTimeout(() => {
          window.location.href = link.href;
        }, 400);
      });
    });
  });

  window.addEventListener('pageshow', () => {
    transitionEl.classList.remove('active');
  });
})();

// === Scroll to video section on page load ===
(function() {
  if (window.location.hash === '#video') {
    const waitForVideo = setInterval(() => {
      const videoSection = document.getElementById('video');
      if (videoSection) {
        clearInterval(waitForVideo);
        setTimeout(() => {
          videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }
    }, 100);
  }
})();

// === Team Cover-Flow Carousel ===
(function() {
  const stage = document.getElementById('teamStage');
  if (!stage) return;
  const slides = Array.from(stage.querySelectorAll('.team-carousel-slide'));
  const total = slides.length;
  if (!total) return;

  let current = 0;
  let autoTimer = null;

  function swap() {
    slides.forEach((slide, i) => {
      const p = ((i - current) % total + total) % total;
      slide.className = `team-carousel-slide pos${p}`;
      slide.classList.toggle('active', p === 0);
    });
  }

  function go(n) {
    current = ((n % total) + total) % total;
    swap();
    if (autoTimer) { clearTimeout(autoTimer); }
    autoTimer = setTimeout(prev, 3000);
  }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function resetDrag() {
    stage.style.transition = '';
    stage.style.transform = '';
  }

  let dragging = false, startX = 0, hasMoved = false;

  stage.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX;
    hasMoved = false;
    stage.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) hasMoved = true;
    stage.style.transform = `translateX(${dx}px)`;
  });

  window.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    stage.style.transition = '';
    stage.style.transform = '';
    if (hasMoved) {
      if (dx < -40) prev(); else if (dx > 40) next();
    }
  });

  let tstartX = 0;
  stage.addEventListener('touchstart', (e) => {
    dragging = true;
    tstartX = e.touches[0].clientX;
    hasMoved = false;
    stage.style.transition = 'none';
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - tstartX;
    if (Math.abs(dx) > 5) hasMoved = true;
    stage.style.transform = `translateX(${dx}px)`;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - tstartX;
    resetDrag();
    if (hasMoved) {
      if (dx < -50) prev(); else if (dx > 50) next();
    }
  }, { passive: true });

  swap();
  autoTimer = setTimeout(prev, 3000);
})();

// === 3D Tilt Effect on Project Cards ===
(function() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();



// === Plyr Video Player ===
(function() {
  if (typeof Plyr === 'undefined') return;

  document.querySelectorAll('.plyr-video').forEach(video => {
    const player = new Plyr(video, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'fullscreen'],
      settings: ['quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
      seekTime: 10,
      clickToPlay: true,
      disableContextMenu: true,
      resetOnEnd: true
    });

    const wrapper = video.closest('.video-wrapper');
    if (wrapper) {
      const loading = wrapper.querySelector('.video-loading');

      video.addEventListener('loadstart', () => {
        if (loading) loading.classList.add('active');
      });

      video.addEventListener('canplay', () => {
        if (loading) loading.classList.remove('active');
      });

      video.addEventListener('waiting', () => {
        if (loading) loading.classList.add('active');
      });

      video.addEventListener('playing', () => {
        if (loading) loading.classList.remove('active');
      });
    }
  });
})();

// === Parallax effect on hero ===
(function() {
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
      const scrolled = window.scrollY;
      const heroContent = hero.querySelector('.hero-content');
      if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
        heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
      }
    }
  });
})();



console.log('%c Nil Studio %c Portfolio ', 'background:#3e37c4;color:#fff;padding:8px 12px;font-weight:700;font-size:14px;border-radius:4px 0 0 4px;', 'background:#0a0a0f;color:#f2f2f2;padding:8px 12px;font-weight:400;font-size:14px;border-radius:0 4px 4px 0;');
