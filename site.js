// ═══════════════════════════════════════════════════════════════════
// FORT SULLIVAN — shared behaviour for index.html and history.html
// ═══════════════════════════════════════════════════════════════════
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ═══════════════════════════════════
// HERO FILM
// Set `mp4` to a local file (e.g. 'hero.mp4') once the original footage
// arrives; it takes priority over YouTube. Adjust start/end to re-cut.
// ═══════════════════════════════════
const HERO_FILM = { mp4: null, youtubeId: 'VDt1A-Oq2Xg', start: 0, end: 30 };

(() => {
    const film = document.querySelector('.hero-film');
    const toggle = document.querySelector('.film-toggle');
    if (!film || reducedMotion.matches || navigator.connection?.saveData) return;

    let pause, play, paused = false;
    const showToggle = () => { if (toggle) toggle.hidden = false; };
    const fallback = () => { film.classList.remove('is-playing'); if (toggle) toggle.hidden = true; };

    if (HERO_FILM.mp4) {
        const video = document.createElement('video');
        Object.assign(video, { src: HERO_FILM.mp4, muted: true, loop: true, playsInline: true, autoplay: true });
        video.setAttribute('aria-hidden', 'true');
        video.addEventListener('playing', () => { film.classList.add('is-playing'); showToggle(); });
        video.addEventListener('error', fallback);
        film.appendChild(video);
        pause = () => video.pause();
        play = () => video.play();
    } else {
        let player, ready = false;
        const mount = document.createElement('div');
        mount.id = 'hero-player';
        film.appendChild(mount);
        window.onYouTubeIframeAPIReady = () => {
            player = new YT.Player('hero-player', {
                host: 'https://www.youtube-nocookie.com',
                videoId: HERO_FILM.youtubeId,
                playerVars: { autoplay: 1, mute: 1, controls: 0, playsinline: 1, disablekb: 1, rel: 0,
                              start: HERO_FILM.start, end: HERO_FILM.end, origin: location.origin },
                events: {
                    onReady(e) {
                        ready = true;
                        const frame = e.target.getIframe();
                        frame.title = 'Fort Sullivan aerial film';
                        frame.tabIndex = -1;
                        frame.setAttribute('aria-hidden', 'true');
                        e.target.mute();
                        e.target.playVideo();
                    },
                    onStateChange(e) {
                        if (e.data === YT.PlayerState.PLAYING) { film.classList.add('is-playing'); showToggle(); }
                        if (e.data === YT.PlayerState.ENDED && !paused) {
                            player.loadVideoById({ videoId: HERO_FILM.youtubeId, startSeconds: HERO_FILM.start, endSeconds: HERO_FILM.end });
                        }
                    },
                    onError: fallback,
                    onAutoplayBlocked: fallback
                }
            });
        };
        pause = () => ready && player.pauseVideo();
        play = () => ready && player.playVideo();
        const api = document.createElement('script');
        api.src = 'https://www.youtube.com/iframe_api';
        api.async = true;
        api.onerror = fallback;
        document.head.appendChild(api);
    }

    toggle?.addEventListener('click', () => {
        paused = !paused;
        paused ? pause() : play();
        toggle.textContent = paused ? 'Play film' : 'Pause film';
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause(); else if (!paused) play();
    });
})();

// ═══════════════════════════════════
// HORIZON YEAR COUNTER ANIMATION
// ═══════════════════════════════════
(() => {
    const span = document.querySelector('.yr');
    if (!span) return;
    const target = parseInt(span.dataset.target);
    const startVal = parseInt(span.dataset.from) || 1776;
    if (reducedMotion.matches) { span.textContent = target; return; }
    const duration = 2800;
    const start = performance.now();
    const raf = (ts) => {
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        span.textContent = Math.round(startVal + (target - startVal) * ease);
        if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
})();

// ═══════════════════════════════════
// PARALLAX SCROLL
// ═══════════════════════════════════
(() => {
    if (reducedMotion.matches) return;
    const parallaxEls = document.querySelectorAll('.parallax-bg');
    if (!parallaxEls.length) return;
    window.addEventListener('scroll', () => {
        parallaxEls.forEach(el => {
            const rect = el.parentElement.getBoundingClientRect();
            const speed = parseFloat(el.dataset.speed) || 0.3;
            el.style.transform = `translateY(${-rect.top * speed}px)`;
        });
    }, { passive: true });
})();

// ═══════════════════════════════════
// JOIN REVEALER (drag / click / arrow keys)
// ═══════════════════════════════════
(() => {
    const revealer = document.getElementById('join-revealer');
    const before = document.getElementById('join-before');
    const handle = document.getElementById('join-handle');
    if (!revealer) return;

    let dragging = false;
    let pct = 50;
    const apply = () => {
        before.style.width = pct + '%';
        handle.style.left = pct + '%';
        revealer.setAttribute('aria-valuenow', Math.round(pct));
    };
    const setPos = (x) => {
        const rect = revealer.getBoundingClientRect();
        pct = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
        apply();
    };

    revealer.addEventListener('mousedown', (e) => { dragging = true; setPos(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });
    revealer.addEventListener('touchstart', (e) => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; });
    window.addEventListener('touchmove', (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    revealer.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        pct = Math.max(2, Math.min(98, pct + (e.key === 'ArrowRight' ? 5 : -5)));
        apply();
    });

    handle.style.transform = 'translateX(-50%)';
    apply();
})();

// ═══════════════════════════════════
// MEMORY PALACE — POSITION ARTIFACTS
// ═══════════════════════════════════
(() => {
    const site = document.getElementById('dig-site');
    if (!site) return;
    const cards = site.querySelectorAll('.artifact');

    cards.forEach((card) => {
        const xPct = parseFloat(card.dataset.x) || 0;
        const yPct = parseFloat(card.dataset.y) || 50;
        const rot = parseFloat(card.dataset.rotation) || 0;
        const isDeep = card.classList.contains('artifact-deep');
        card.style.left = `calc(${xPct}% + 20px)`;
        card.style.top = `${yPct}%`;
        card.style.transform = `translateY(-50%) rotate(${rot}deg)`;
        card.tabIndex = 0;

        const surface = () => {
            card.style.transform = 'translateY(-50%) rotate(0deg) scale(1.04)';
            card.style.zIndex = '20';
            card.style.opacity = '1';
        };
        const settle = () => {
            card.style.transform = `translateY(-50%) rotate(${rot}deg)`;
            card.style.zIndex = isDeep ? '2' : '5';
            card.style.opacity = isDeep ? '0.45' : '0.8';
        };
        card.addEventListener('mouseenter', surface);
        card.addEventListener('focus', surface);
        card.addEventListener('mouseleave', settle);
        card.addEventListener('blur', settle);
    });

    const lastCard = cards[cards.length - 1];
    if (lastCard) site.style.width = `calc(${parseFloat(lastCard.dataset.x)}% + 480px)`;
})();

// ═══════════════════════════════════
// DRAG-TO-SCROLL (gallery strip, dig site)
// Returns a function reporting whether the last press was a drag,
// so a drag never opens the lightbox.
// ═══════════════════════════════════
function dragScroll(el, ignoreSelector) {
    if (!el) return () => false;
    let down = false, moved = false, startX = 0, startSL = 0;
    el.addEventListener('mousedown', (e) => {
        if (ignoreSelector && e.target.closest(ignoreSelector)) return;
        down = true; moved = false; startX = e.pageX; startSL = el.scrollLeft;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if (!down) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 5) moved = true;
        el.scrollLeft = startSL - dx;
    });
    window.addEventListener('mouseup', () => { down = false; el.style.cursor = ''; });
    return () => moved;
}

const digWrapper = document.getElementById('dig-site-wrapper');
dragScroll(digWrapper, '.artifact');

// ═══════════════════════════════════
// GALLERY STRIP — arrows, wheel, drag
// ═══════════════════════════════════
const strip = document.getElementById('gallery-strip');
const stripWasDragged = dragScroll(strip);
(() => {
    if (!strip) return;
    // Vertical wheel scrolls the strip sideways, but hands back to the page
    // at either end so the visitor is never trapped.
    strip.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        const max = strip.scrollWidth - strip.clientWidth;
        const atStart = strip.scrollLeft <= 0 && e.deltaY < 0;
        const atEnd = strip.scrollLeft >= max - 1 && e.deltaY > 0;
        if (atStart || atEnd) return;
        e.preventDefault();
        strip.scrollLeft += e.deltaY * 1.5;
    }, { passive: false });

    const step = () => Math.max(300, strip.clientWidth * 0.7);
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    document.querySelector('.gallery-prev')?.addEventListener('click', () => strip.scrollBy({ left: -step(), behavior }));
    document.querySelector('.gallery-next')?.addEventListener('click', () => strip.scrollBy({ left: step(), behavior }));
})();

// ═══════════════════════════════════
// LIGHTBOX — any [data-full] button; grouped by data-group
// ═══════════════════════════════════
(() => {
    const box = document.querySelector('.lightbox');
    if (!box || typeof box.showModal !== 'function') return;
    const img = box.querySelector('img');
    const count = box.querySelector('.lightbox-count');
    const caption = box.querySelector('.lightbox-caption');
    let set = [], i = 0, opener = null;

    const show = (n) => {
        i = (n + set.length) % set.length;
        const btn = set[i];
        img.src = btn.dataset.full;
        img.alt = btn.querySelector('img')?.alt || '';
        caption.textContent = img.alt;
        count.textContent = `${i + 1} / ${set.length}`;
    };

    document.querySelectorAll('[data-full]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.closest('#gallery-strip') && stripWasDragged()) return;
            opener = btn;
            const group = btn.dataset.group;
            set = group ? [...document.querySelectorAll(`[data-full][data-group="${group}"]`)] : [btn];
            show(set.indexOf(btn));
            box.showModal();
        });
    });
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(i - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(i + 1));
    box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
    box.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
    });
    box.addEventListener('click', (e) => {
        if (e.target === box || e.target.classList.contains('lightbox-inner')) box.close();
    });
    box.addEventListener('close', () => opener?.focus());
})();

// ═══════════════════════════════════
// SPINE / TIMELINE — highlight the chapter in view (history page)
// ═══════════════════════════════════
(() => {
    const links = [...document.querySelectorAll('.spine-link, .timeline-strip a')]
        .filter(a => a.getAttribute('href')?.startsWith('#'));
    if (!links.length) return;
    const ids = [...new Set(links.map(a => a.getAttribute('href').slice(1)))];
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
})();

// ═══════════════════════════════════
// SCROLL-REVEAL on strata
// ═══════════════════════════════════
(() => {
    const targets = document.querySelectorAll(
        '.stratum, .keep-grid, .chapel-grid, .artifact, .join-quote, .chapel-quote, .military-content, .gallery-strip'
    );
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('in-view'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
        });
    }, { threshold: 0.07 });
    targets.forEach(el => io.observe(el));

    // Arriving on history.html#chapter: reveal the target immediately
    if (location.hash) {
        const t = document.getElementById(location.hash.slice(1));
        if (t) { t.classList.add('in-view'); t.querySelectorAll('.chapel-grid, .keep-grid, .military-content, .chapel-quote').forEach(el => el.classList.add('in-view')); }
    }
})();
