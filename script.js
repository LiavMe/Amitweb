'use strict';

const WA_NUMBER = '972525003222';

// ===== THEME TOGGLE =====
// Default is 'light' — set in the inline <head> script to prevent FOUC.
// Here we wire up the button click.
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ===== STICKY HEADER =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav ul li a');

new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe
  ? sections.forEach(s => new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${s.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' }).observe(s))
  : null;

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });

    if (!wasOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

// ===== COUNTER ANIMATION (stats) =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 }).observe
  ? document.querySelectorAll('.stat-num[data-target]').forEach(el => {
      new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(el); obs.unobserve(el); } });
      }, { threshold: 0.5 }).observe(el);
    })
  : null;

// ===== TESTIMONIALS SLIDER (mobile) =====
const track = document.getElementById('testimonialsTrack');
const dots  = document.querySelectorAll('.dot');
let current = 0;
let timer   = null;

function goTo(index) {
  if (!track || window.innerWidth > 768) return;
  current = index;
  track.style.transform = `translateX(${index * (100 / 3)}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

dots.forEach(d => {
  d.addEventListener('click', () => {
    clearInterval(timer);
    goTo(parseInt(d.dataset.index, 10));
    startAuto();
  });
});

function startAuto() {
  timer = setInterval(() => goTo((current + 1) % 3), 4500);
}

startAuto();

window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && track) track.style.transform = '';
  else goTo(current);
}, { passive: true });

// ===== CONTACT FORM → WHATSAPP =====
const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name     = document.getElementById('name');
    const phone    = document.getElementById('phone');
    const business = document.getElementById('business');
    const service  = document.getElementById('service');
    const message  = document.getElementById('message');

    let valid = true;
    [name, phone].forEach(f => {
      f.classList.remove('error');
      if (!f.value.trim()) { f.classList.add('error'); valid = false; }
    });

    if (!valid) { form.querySelector('.error')?.focus(); return; }

    let text = `היי עמית, הגעתי דרך האתר ואשמח לקבל פרטים.\n\n`;
    text += `שם: ${name.value.trim()}\n`;
    text += `טלפון: ${phone.value.trim()}\n`;
    if (business.value.trim()) text += `שם העסק: ${business.value.trim()}\n`;
    if (service.value)         text += `שירות: ${service.value}\n`;
    if (message.value.trim())  text += `הודעה: ${message.value.trim()}\n`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
}

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(
  '.service-card, .process-step, .testimonial-card, .faq-item, .why-stat-card, .stat-item'
);

const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 80}ms`;
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObs.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.revealed').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});

// inject revealed class styles
const style = document.createElement('style');
style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);
