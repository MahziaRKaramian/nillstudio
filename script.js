// === Dark/Light Mode ===
(function() {
  const toggle = document.getElementById('darkModeToggle');
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.remove('light');
    if (toggle) toggle.checked = true;
  } else {
    body.classList.add('light');
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

// === Card Video: Hover Play + Sound Toggle + Click Nav ===
(function() {
  // Single audio context for the page — unlocks audio on first user gesture
  let audioCtx = null;

  document.querySelectorAll('.project-card').forEach(card => {
    const video = card.querySelector('.card-video');
    const visual = card.querySelector('.project-card-visual');
    const link = card.querySelector('.project-card-link');
    if (!video || !link) return;
    const href = link.getAttribute('href');

    // Create mute toggle button
    const muteBtn = document.createElement('button');
    muteBtn.className = 'video-mute-btn';
    muteBtn.dataset.muted = 'true';
    muteBtn.setAttribute('aria-label', 'قطع صدا');
    muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
    visual.appendChild(muteBtn);

    function unlockAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function navigate() {
      if (!href) return;
      const el = document.querySelector('.page-transition');
      if (el) { el.classList.add('active'); setTimeout(() => { window.location.href = href; }, 400); }
      else { window.location.href = href; }
    }

    // Hover → play muted
    card.addEventListener('mouseenter', () => {
      video.muted = true;
      video.volume = 1;
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
    });

    // Mute button: just toggle audio
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMuted = muteBtn.dataset.muted === 'true';
      if (isMuted) {
        video.muted = false;
        muteBtn.dataset.muted = 'false';
        muteBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
        // If video is paused (hover ended), start playing with sound
        if (video.paused) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      } else {
        video.muted = true;
        muteBtn.dataset.muted = 'true';
        muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
      }
    });

    // Click card → navigate
    card.addEventListener('click', (e) => {
      if (e.target.closest('.video-mute-btn')) return;
      navigate();
    });
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

// === Team Orbit Tooltip ===
(function() {
  const tooltip = document.createElement('div');
  tooltip.className = 'team-tooltip';
  tooltip.innerHTML = '<div class="team-tooltip-name"></div><div class="team-tooltip-role"></div>';
  document.body.appendChild(tooltip);
  const nameEl = tooltip.querySelector('.team-tooltip-name');
  const roleEl = tooltip.querySelector('.team-tooltip-role');

  let currentMember = null;
  let hideTimeout = null;

  document.querySelectorAll('.orbit-avatar').forEach(avatar => {
    const member = avatar.closest('.orbit-member');

    avatar.addEventListener('mouseenter', () => {
      if (hideTimeout) clearTimeout(hideTimeout);

      const name = member.getAttribute('data-name') || '';
      const role = member.getAttribute('data-role') || '';
      nameEl.textContent = name;
      roleEl.textContent = role;

      const rect = avatar.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 160;
      const left = rect.left + rect.width / 2 - tooltipWidth / 2;
      const top = rect.bottom + 12;

      tooltip.style.left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8)) + 'px';
      tooltip.style.top = top + 'px';
      tooltip.classList.add('visible');
    });

    avatar.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove('visible');
      }, 80);
    });

    avatar.addEventListener('mousemove', () => {
      const rect = avatar.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 160;
      const left = rect.left + rect.width / 2 - tooltipWidth / 2;
      const top = rect.bottom + 12;

      tooltip.style.left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8)) + 'px';
      tooltip.style.top = top + 'px';
    });
  });
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

// === Contact Form ===
(function() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };
      console.log('Form submitted:', formData);

      const btn = contactForm.querySelector('.submit-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Message Sent!';
      btn.style.background = '#f1b34f';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    });
  }
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
