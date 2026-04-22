/* ============================================================
   Bhaskar Singha — Portfolio JavaScript v3.0
   Features: Nav progress · Scroll animations · Google Sheets form
             Theme toggle · Portfolio filter · Counter animation
             Custom cursor · Mobile menu · Skill bars
============================================================ */
'use strict';

/* ═══ UTILITIES ═════════════════════════════════════════════ */
function throttle(fn, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function isInViewport(el, threshold = 0.15) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold);
}

/* ═══ 1. THEME MANAGER ══════════════════════════════════════ */
const ThemeManager = (() => {
  const STORAGE_KEY = 'bhaskar-portfolio-theme';
  const body = document.body;
  const toggle = document.getElementById('themeToggle');

  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#111311' : '#F7F5F2');
  }

  function init() {
    applyTheme(getInitialTheme());
    if (toggle) toggle.addEventListener('click', () => {
      const current = body.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  return { init };
})();


/* ═══ 2. NAVBAR — Scroll, Active State, Progress Bar ════════ */
const Navbar = (() => {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const progressBar = document.getElementById('navProgress');

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
    updateProgress();
  }

  function updateActiveLink() {
    let currentSection = '';
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) currentSection = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-section') === currentSection);
    });
  }

  function init() {
    if (!navbar) return;
    window.addEventListener('scroll', throttle(handleScroll, 80));
    handleScroll();
  }

  return { init };
})();


/* ═══ 3. MOBILE MENU ════════════════════════════════════════ */
const MobileMenu = (() => {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let isOpen = false;

  function open() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function init() {
    if (!hamburger || !menu) return;
    hamburger.addEventListener('click', () => isOpen ? close() : open());
    mobileLinks.forEach((l) => l.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) close(); });
    document.addEventListener('click', (e) => {
      if (isOpen && !menu.contains(e.target) && !hamburger.contains(e.target)) close();
    });
  }

  return { init };
})();


/* ═══ 4. SMOOTH SCROLLING ═══════════════════════════════════ */
const SmoothScroll = (() => {
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
      });
    });
  }
  return { init };
})();


/* ═══ 5. SCROLL REVEAL ANIMATIONS ══════════════════════════ */
const ScrollAnimations = (() => {
  const els = document.querySelectorAll('[data-animate]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (prefersReduced) { els.forEach((el) => el.classList.add('animated')); return; }
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('animated')); return; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          if (entry.target.classList.contains('skills-grid')) animateSkillBars();
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    els.forEach((el) => observer.observe(el));
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) observer.observe(skillsGrid);
  }

  return { init };
})();


/* ═══ 6. SKILL BARS ════════════════════════════════════════ */
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach((fill, i) => {
    setTimeout(() => { fill.style.width = (fill.getAttribute('data-width') || '0') + '%'; }, i * 60);
  });
}

const SkillBars = (() => {
  let done = false;
  function check() {
    if (done) return;
    if (isInViewport(document.getElementById('skills'), 0.3)) { animateSkillBars(); done = true; }
  }
  function init() {
    window.addEventListener('scroll', throttle(check, 200));
    check();
  }
  return { init };
})();


/* ═══ 7. COUNTER ANIMATION ══════════════════════════════════ */
const CounterAnimation = (() => {
  let done = false;

  function animateCounter(el, target, duration = 1400) {
    const start = performance.now();
    (function update(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(update); else el.textContent = target;
    })(start);
  }

  function run() {
    if (done) return;
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length || !isInViewport(document.querySelector('.hero'), 0.2)) return;
    done = true;
    counters.forEach((c, i) => {
      const t = parseInt(c.getAttribute('data-count'), 10);
      if (!isNaN(t)) setTimeout(() => animateCounter(c, t), i * 200 + 400);
    });
  }

  function init() {
    window.addEventListener('scroll', throttle(run, 200));
    setTimeout(run, 800);
  }

  return { init };
})();


/* ═══ 8. PORTFOLIO FILTER ═══════════════════════════════════ */
const PortfolioFilter = (() => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  function filterCards(filter) {
    let idx = 0;
    cards.forEach((card) => {
      const show = filter === 'all' || card.getAttribute('data-category') === filter;
      if (show) {
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        const delay = ++idx * 50;
        requestAnimationFrame(() => setTimeout(() => {
          card.style.transition = 'opacity 350ms ease-out, transform 350ms ease-out, box-shadow 300ms, border-color 300ms';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, delay));
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function init() {
    if (!filterBtns.length) return;
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        filterCards(btn.getAttribute('data-filter'));
      });
    });
  }

  return { init };
})();


/* ═══ 9. CONTACT FORM — Google Sheets Integration ══════════ */
/*
  ┌──────────────────────────────────────────────────────────┐
  │  GOOGLE SHEETS SETUP — ONE-TIME STEPS                   │
  │                                                          │
  │  1. Open your spreadsheet:                              │
  │     https://docs.google.com/spreadsheets/d/             │
  │     1kibaJ-L4cLkq-vxZteXx4gmwJIkUtagZvd3wVAD5YGc/edit │
  │                                                          │
  │  2. Add these column headers in Row 1:                  │
  │     A: Timestamp  B: Name  C: Email  D: Phone           │
  │     E: Project Type  F: Budget  G: Message              │
  │                                                          │
  │  3. Extensions → Apps Script → paste code below:        │
  │     (also saved as google-apps-script.js)               │
  │                                                          │
  │  4. Save → Deploy → New deployment                      │
  │     Type: Web app                                        │
  │     Execute as: Me (creativesbhaskar@gmail.com)         │
  │     Who has access: Anyone                              │
  │                                                          │
  │  5. Copy the Web App URL → paste into GOOGLE_SHEETS_URL │
  └──────────────────────────────────────────────────────────┘

  Apps Script code to paste (copy everything between the lines):
  ─────────────────────────────────────────────────────────────
  const SHEET_ID = '1kibaJ-L4cLkq-vxZteXx4gmwJIkUtagZvd3wVAD5YGc';
  const NOTIFY_EMAIL = 'creativesbhaskar@gmail.com';

  function doPost(e) {
    try {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      const d = e.parameter;
      sheet.appendRow([
        new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
        d.name || '', d.email || '', d.phone || '',
        d.projectType || '', d.budget || '', d.message || ''
      ]);
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '🎨 New Portfolio Enquiry from ' + (d.name || 'Unknown'),
        htmlBody: `<h2>New contact form submission</h2>
          <table style="border-collapse:collapse;font-family:sans-serif">
            <tr><td style="padding:8px;font-weight:bold;background:#f0f0f0">Name</td><td style="padding:8px">${d.name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f0f0f0">Email</td><td style="padding:8px"><a href="mailto:${d.email}">${d.email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f0f0f0">Phone</td><td style="padding:8px">${d.phone || 'Not provided'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f0f0f0">Project Type</td><td style="padding:8px">${d.projectType || 'Not specified'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f0f0f0">Budget</td><td style="padding:8px">${d.budget || 'Not specified'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f0f0f0">Message</td><td style="padding:8px">${d.message}</td></tr>
          </table>
          <p style="color:#666;font-size:12px">Sent from bhaskarsingha.info contact form</p>`
      });
      return ContentService.createTextOutput(JSON.stringify({result:'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({result:'error',error:err.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({result:'ready'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  ─────────────────────────────────────────────────────────────
*/

const ContactForm = (() => {
  // ⚠️ PASTE YOUR GOOGLE APPS SCRIPT DEPLOYMENT URL HERE after setup:
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxrEG_-8f_ADYuzXld6SLAk4seKRtDwTWQXItaAgwL21VaHJ1aQWuEk4Mvnsuf0ldem/exec';

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('formFeedback');

  const fields = {
    name: {
      el: document.getElementById('name'),
      error: document.getElementById('name-error'),
      validate: (v) => v.trim().length >= 2 ? '' : 'Please enter your full name.',
    },
    email: {
      el: document.getElementById('email'),
      error: document.getElementById('email-error'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    },
    message: {
      el: document.getElementById('message'),
      error: document.getElementById('message-error'),
      validate: (v) => v.trim().length >= 20 ? '' : 'Please write a message of at least 20 characters.',
    },
  };

  function showError(field, message) {
    if (field.error) field.error.textContent = message;
    if (field.el) field.el.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateForm() {
    let valid = true;
    Object.values(fields).forEach((f) => {
      if (!f.el) return;
      const err = f.validate(f.el.value);
      showError(f, err);
      if (err) valid = false;
    });
    return valid;
  }

  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.className = 'form-feedback ' + type;
    feedback.textContent = message;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { feedback.className = 'form-feedback'; feedback.textContent = ''; }, 7000);
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    submitBtn.disabled = loading;
    if (loading) {
      if (btnText) btnText.textContent = 'Sending…';
      if (btnIcon) btnIcon.style.display = 'none';
    } else {
      if (btnText) btnText.textContent = 'Send Message';
      if (btnIcon) btnIcon.style.display = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    // If Google Sheets URL is not configured, fall back to mailto
    if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.includes('YOUR_GOOGLE')) {
      const name    = fields.name.el?.value.trim() || '';
      const email   = fields.email.el?.value.trim() || '';
      const msg     = fields.message.el?.value.trim() || '';
      const ptype   = document.getElementById('project-type')?.value || '';
      const budget  = document.getElementById('budget')?.value || '';
      const phone   = document.getElementById('phone')?.value.trim() || '';
      const subject = encodeURIComponent('Portfolio Enquiry from ' + name);
      const body    = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone +
        '\nProject: ' + ptype + '\nBudget: ' + budget + '\n\nMessage:\n' + msg
      );
      window.location.href = 'mailto:creativesbhaskar@gmail.com?subject=' + subject + '&body=' + body;
      showFeedback('success', '✓ Your mail client has opened. You can also email creativesbhaskar@gmail.com directly.');
      form.reset();
      return;
    }

    // Google Sheets submission
    setLoading(true);
    const formData = new FormData(form);

    fetch(GOOGLE_SHEETS_URL, { method: 'POST', body: formData })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.result === 'success') {
          showFeedback('success', '✓ Message sent! I\'ll get back to you within 24 hours.');
          form.reset();
        } else {
          throw new Error('Script returned error');
        }
      })
      .catch(() => {
        setLoading(false);
        showFeedback('error', 'Something went wrong. Please email me directly at creativesbhaskar@gmail.com');
      });
  }

  function init() {
    if (!form) return;
    Object.values(fields).forEach((f) => {
      if (!f.el) return;
      f.el.addEventListener('blur', () => showError(f, f.validate(f.el.value)));
      f.el.addEventListener('input', () => showError(f, ''));
    });
    form.addEventListener('submit', handleSubmit);
  }

  return { init };
})();


/* ═══ 10. CUSTOM CURSOR ═════════════════════════════════════ */
const CustomCursor = (() => {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = 0, my = 0, fx = 0, fy = 0;
  const LERP = 0.12;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    fx = lerp(fx, mx, LERP);
    fy = lerp(fy, my, LERP);
    if (follower) { follower.style.left = fx + 'px'; follower.style.top = fy + 'px'; }
    requestAnimationFrame(loop);
  }

  function init() {
    if (!window.matchMedia('(hover: hover)').matches || !cursor || !follower) return;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .portfolio-card, .service-card, .cert-card, .filter-btn, input, select, textarea')
      .forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; follower.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; follower.style.opacity = ''; });
    loop();
  }

  return { init };
})();


/* ═══ 11. BACK TO TOP ═══════════════════════════════════════ */
const BackToTop = (() => {
  const btn = document.getElementById('backToTop');
  function init() {
    if (!btn) return;
    window.addEventListener('scroll', throttle(() => btn.classList.toggle('visible', window.scrollY > 500), 200));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  return { init };
})();


/* ═══ 12. FOOTER YEAR ═══════════════════════════════════════ */
const FooterYear = (() => {
  function init() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }
  return { init };
})();


/* ═══ 13. TYPEWRITER EFFECT ════════════════════════════════ */
const TypewriterEffect = (() => {
  function init() {
    const tagline = document.querySelector('.hero-tagline em');
    if (!tagline || sessionStorage.getItem('bs-visited')) return;
    sessionStorage.setItem('bs-visited', '1');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const full = tagline.textContent;
    tagline.textContent = '';
    tagline.style.borderRight = '2px solid currentColor';
    let i = 0;
    const t = setInterval(() => {
      if (i < full.length) { tagline.textContent += full[i++]; }
      else { clearInterval(t); setTimeout(() => { tagline.style.borderRight = 'none'; }, 600); }
    }, 55);
  }
  return { init };
})();


/* ═══ 14. LOAD SPLASH ═══════════════════════════════════════ */
const LoadSplash = (() => {
  function create() {
    if (sessionStorage.getItem('bs-splash') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    sessionStorage.setItem('bs-splash', '1');
    const splash = document.createElement('div');
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = '<span>B·S</span>';
    Object.assign(splash.style, { position:'fixed', inset:'0', zIndex:'99999', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'var(--c-bg)', pointerEvents:'none', transition:'opacity 250ms ease-out' });
    const t = splash.querySelector('span');
    Object.assign(t.style, { fontFamily:"'Fraunces', serif", fontSize:'32px', fontWeight:'700', letterSpacing:'-0.03em', color:'var(--c-accent)', opacity:'0', transition:'opacity 300ms ease-out' });
    document.body.appendChild(splash);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 280);
      }, 700);
    });
  }
  function init() { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', create) : create(); }
  return { init };
})();


/* ═══ 15. LAZY IMAGES ═══════════════════════════════════════ */
const LazyImages = (() => {
  function init() {
    if ('loading' in HTMLImageElement.prototype) return;
    if (!('IntersectionObserver' in window)) return;
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { const img = e.target; img.src = img.dataset.src || img.src; obs.unobserve(img); } });
    });
    imgs.forEach((img) => obs.observe(img));
  }
  return { init };
})();


/* ═══ INIT ══════════════════════════════════════════════════ */
LoadSplash.init();

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navbar.init();
  MobileMenu.init();
  SmoothScroll.init();
  BackToTop.init();
  FooterYear.init();
  ScrollAnimations.init();
  SkillBars.init();
  CounterAnimation.init();
  TypewriterEffect.init();
  PortfolioFilter.init();
  ContactForm.init();
  CustomCursor.init();
  LazyImages.init();

  console.log('%c Bhaskar Singha Portfolio v3.0 ', 'background:#1E3A2F;color:#F7F5F2;font-size:13px;padding:4px 8px;border-radius:4px;', '\nbhaskarsingha.info');
});

window.addEventListener('load', () => {
  CounterAnimation.init();
  if ('performance' in window && performance.mark) performance.mark('portfolio-loaded');
});
