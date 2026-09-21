'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ===== قائمة الجوال =====
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    document.documentElement.classList.add('nav-ready');
    toggle.hidden = false;

    const closeMenu = (restoreFocus = false) => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');

      if (restoreFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');

      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute(
        'aria-label',
        open ? 'Close menu' : 'Open menu'
      );
    });

    nav.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const section = document.getElementById(
          link.hash.slice(1)
        );

        const wasOpen = nav.classList.contains('open');

        closeMenu();

        if (wasOpen && section) {
          section.setAttribute('tabindex', '-1');
          section.focus({ preventScroll: true });

          section.addEventListener(
            'blur',
            () => section.removeAttribute('tabindex'),
            { once: true }
          );
        }
      });
    });

    document.addEventListener('click', event => {
      if (
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', event => {
      if (
        event.key === 'Escape' &&
        nav.classList.contains('open')
      ) {
        closeMenu(true);
      }
    });

    document.addEventListener('focusin', event => {
      if (
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.matchMedia('(min-width: 769px)')
      .addEventListener('change', event => {
        if (event.matches) {
          closeMenu();
        }
      });
  }

  // ===== تحديث السنة =====
  const year = document.getElementById('year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ===== تمييز رابط القسم الحالي =====
  if (nav && 'IntersectionObserver' in window) {
    const links = [
      ...nav.querySelectorAll('a[href^="#"]')
    ];

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          links.forEach(link => {
            if (link.hash === `#${entry.target.id}`) {
              link.setAttribute(
                'aria-current',
                'location'
              );
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      {
        rootMargin: '-15% 0px -60% 0px',
        threshold: 0
      }
    );

    document.querySelectorAll('main > section[id]')
      .forEach(section => observer.observe(section));
  }

  // ===== التحكم في فيديو الخلفية =====
  const motion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const background = document.getElementById(
    'backgroundVideo'
  );

  const motionButton = document.getElementById(
    'motionToggle'
  );

  const smallScreen = window.matchMedia(
    '(max-width: 768px)'
  );

  let motionEnabled =
    !motion.matches &&
    !smallScreen.matches &&
    !navigator.connection?.saveData;

  if (background && motionButton) {
    motionButton.hidden = false;

    const updateButton = () => {
      motionButton.setAttribute(
        'aria-pressed',
        String(!background.paused)
      );

      motionButton.textContent = background.paused
        ? 'Enable background motion'
        : 'Pause background motion';
    };

    const syncBackground = () => {
      motionButton.hidden = motion.matches;

      if (
        !motionEnabled ||
        motion.matches ||
        document.hidden
      ) {
        background.pause();
        updateButton();
        return;
      }

      if (!background.getAttribute('src')) {
        background.src = background.dataset.src;
      }

      background.play().catch(() => {
        motionEnabled = false;
        updateButton();
      });
    };

    background.addEventListener(
      'play',
      updateButton
    );

    background.addEventListener(
      'pause',
      updateButton
    );

    background.addEventListener('error', () => {
      motionEnabled = false;
      motionButton.hidden = true;
    });

    motionButton.addEventListener('click', () => {
      motionEnabled = !motionEnabled;
      syncBackground();
    });

    motion.addEventListener('change', () => {
      if (motion.matches) {
        motionEnabled = false;
      }

      syncBackground();
    });

    document.addEventListener(
      'visibilitychange',
      syncBackground
    );

    syncBackground();
  }

  // ===== فيديو مشروع التخرج: تلقائي ومتكرر =====
  const graduationVideo = document.getElementById(
    'graduationVideo'
  );

  if (graduationVideo) {
    graduationVideo.muted = true;
    graduationVideo.defaultMuted = true;
    graduationVideo.autoplay = true;
    graduationVideo.loop = true;
    graduationVideo.playsInline = true;

    const playGraduationVideo = () => {
      if (document.hidden || !graduationVideo.paused) {
        return;
      }

      const playPromise = graduationVideo.play();

      if (playPromise) {
        playPromise.catch(() => {
          // قد يمنع المتصفح التشغيل التلقائي.
          // نحاول مجددًا عند أول تفاعل من الزائر.
        });
      }
    };

    // بدء التشغيل عند توفر بيانات الفيديو
    graduationVideo.addEventListener(
      'canplay',
      playGraduationVideo
    );

    // إعادة المحاولة عند العودة إلى الصفحة
    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden) {
          playGraduationVideo();
        }
      }
    );

    window.addEventListener(
      'pageshow',
      playGraduationVideo
    );

    // بديل إذا منع المتصفح التشغيل قبل التفاعل
    document.addEventListener(
      'pointerdown',
      playGraduationVideo,
      { once: true }
    );

    document.addEventListener(
      'keydown',
      playGraduationVideo,
      { once: true }
    );

    playGraduationVideo();

    // لا يوجد إيقاف للفيديو عند التمرير خارج القسم.
    // خاصية loop تعيد تشغيله تلقائيًا عند النهاية.
  }

  // ===== نموذج التواصل =====
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form && status && 'fetch' in window) {
    form.addEventListener('submit', async event => {
      event.preventDefault();

      const button = form.querySelector(
        'button[type="submit"]'
      );

      if (
        !button ||
        button.disabled ||
        !form.reportValidity()
      ) {
        return;
      }

      button.disabled = true;
      button.textContent = 'Sending…';

      form.setAttribute('aria-busy', 'true');

      status.dataset.state = 'pending';
      status.textContent = 'Sending your message…';

      const controller = new AbortController();

      const timeout = window.setTimeout(
        () => controller.abort(),
        20000
      );

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            Accept: 'application/json'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        form.reset();

        status.dataset.state = 'success';
        status.textContent =
          'Thank you! Your message has been sent.';
      } catch (error) {
        status.dataset.state = 'error';

        status.textContent =
          error.name === 'AbortError'
            ? 'Delivery could not be confirmed. Please wait before trying again, or contact me on LinkedIn.'
            : 'Your message could not be confirmed. Please try again later or contact me on LinkedIn.';
      } finally {
        clearTimeout(timeout);

        button.disabled = false;
        button.textContent = 'Send message ↗';

        form.removeAttribute('aria-busy');
      }
    });
  }
});