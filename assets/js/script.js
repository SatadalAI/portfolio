/*
 * ===================================================================
 *  PORTFOLIO — MAIN SCRIPT
 *  Handles: Theme system, Neural network, Gallery, Blog, Analytics,
 *           Tilt effects, Chat widget, Page transitions, Umami stats
 * ===================================================================
 */

/* ===================================================================
 *  THEME SYSTEM
 *  Kept professional dark theme as default.
 * =================================================================== */


/* ===================================================================
 *  PAGE TRANSITIONS
 * =================================================================== */

function initPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname &&
            !link.href.includes('#') &&
            !link.hasAttribute('download') &&
            !link.target) {

            link.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.href;

                document.body.classList.remove('fade-in');
                document.body.classList.add('fade-out');

                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        }
    });
}

/* ===================================================================
 *  NEURAL NETWORK BACKGROUND
 * =================================================================== */

function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    const nodes = [];
    const numNodes = Math.min(50, Math.floor((width * height) / 30000));
    const connectionDistance = 160;

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 0.8;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            // Mouse attraction in AI mode
            if (document.body.getAttribute('data-theme-mode') === 'ai_enhanced' && mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 250) {
                    this.vx += (dx / dist) * 0.06;
                    this.vy += (dy / dist) * 0.06;
                }
            }

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const maxSpeed = document.body.getAttribute('data-theme-mode') === 'ai_enhanced' ? 2 : 0.6;
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }

            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += 0.015;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
        }

        draw() {
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            // Read CSS custom property colors
            const nodeColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--nn-node-color').trim() || 'rgba(122, 162, 247, 0.5)';
            const glowColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--nn-glow-color').trim() || 'rgba(125, 207, 255, 0.25)';

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = nodeColor;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
            gradient.addColorStop(0, glowColor);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    for (let i = 0; i < numNodes; i++) {
        nodes.push(new Node());
    }

    // Cache line color to avoid per-frame getComputedStyle overhead
    let lineColor = 'rgba(187, 154, 247, 0.3)';
    function updateLineColor() {
        lineColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--nn-line-color').trim() || lineColor;
    }
    updateLineColor();
    // Re-read on theme changes
    const observer = new MutationObserver(updateLineColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const opacity = (1 - dist / connectionDistance) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${opacity})`);
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawConnections();
        nodes.forEach(node => {
            node.update();
            node.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    animate();
}

/* ===================================================================
 *  MODAL
 * =================================================================== */

function openModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (!modal || !modalImg) return;
    modal.style.display = 'block';
    modalImg.src = imgSrc;
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
}

/* ===================================================================
 *  SCROLL-TRIGGERED ANIMATIONS
 * =================================================================== */

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.project-card, .blog-card, .stat-card, .skill-category, .album-card'
    );

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => observer.observe(el));
}

/* ===================================================================
 *  GALLERY (JSON-driven with Albums)
 * =================================================================== */

let allAlbums = [];

async function updateGalleryFromApi() {
    const albumsGrid = document.getElementById('albums-grid');
    const albumView = document.getElementById('album-view');
    const galleryItems = document.getElementById('gallery-items');
    const backBtn = document.getElementById('back-to-albums');
    const albumTitle = document.getElementById('current-album-title');

    if (!albumsGrid) return;

    if (backBtn) {
        backBtn.onclick = () => {
            albumView.style.display = 'none';
            albumsGrid.style.display = 'grid';
            albumsGrid.style.opacity = '0';
            requestAnimationFrame(() => {
                albumsGrid.style.transition = 'opacity 0.5s ease';
                albumsGrid.style.opacity = '1';
            });
        };
    }

    try {
        const resp = await fetch('assets/data/images.json');
        if (!resp.ok) throw new Error('images.json not found');
        allAlbums = await resp.json();

        if (Array.isArray(allAlbums) && typeof allAlbums[0] === 'string') {
            console.warn('Legacy gallery format detected.');
            return;
        }

        renderAlbums(allAlbums, albumsGrid);
    } catch (err) {
        console.warn('Could not load gallery:', err.message);
    }

    function renderAlbums(albums, container) {
        container.innerHTML = '';
        albums.forEach(album => {
            const card = document.createElement('div');
            card.className = 'album-card';
            const count = album.images ? album.images.length : 0;

            card.innerHTML = `
                <div class="album-cover">
                    <img src="${album.cover || 'assets/img/thumbnails/album_placeholder.png'}" alt="${album.title}" loading="lazy">
                    <div class="album-overlay">
                        <span class="view-album-btn">View Album</span>
                    </div>
                </div>
                <div class="album-info">
                    <h3>${album.title}</h3>
                    <p>${album.description}</p>
                    <span class="album-count">${count} items</span>
                </div>
            `;

            card.onclick = () => openAlbum(album);
            container.appendChild(card);
        });

        // Trigger scroll animations for dynamically added cards
        initScrollAnimations();
    }

    function openAlbum(album) {
        albumsGrid.style.display = 'none';
        albumView.style.display = 'block';
        albumView.style.opacity = '0';

        requestAnimationFrame(() => {
            albumView.style.transition = 'opacity 0.5s ease';
            albumView.style.opacity = '1';
        });

        if (albumTitle) albumTitle.textContent = album.title;

        galleryItems.innerHTML = '';
        if (!album.images || album.images.length === 0) {
            galleryItems.innerHTML = '<p class="empty-msg">No images in this album yet.</p>';
            return;
        }

        const normalized = album.images.map(src => {
            if (typeof src !== 'string') return null;
            if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
            return src.startsWith('assets/img/') ? src : `assets/img/${src}`;
        }).filter(Boolean);

        normalized.forEach((imgSrc, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.transitionDelay = `${index * 0.08}s`;
            item.onclick = () => openModal(imgSrc);
            item.innerHTML = `<img src="${imgSrc}" alt="${album.title} ${index + 1}" loading="lazy">`;
            galleryItems.appendChild(item);
        });

        // Trigger scroll animations for gallery items
        initScrollAnimations();
    }
}

/* ===================================================================
 *  BLOG (JSON-driven)
 * =================================================================== */

async function populateBlogGrid() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;
    blogGrid.innerHTML = '';

    try {
        const resp = await fetch('assets/data/blogs.json');
        if (!resp.ok) throw new Error('blogs.json not found or returned ' + resp.status);
        const posts = await resp.json();
        if (!Array.isArray(posts)) throw new Error('blogs.json is not an array');

        posts.forEach((entry) => {
            const post = (typeof entry === 'string') ? { url: entry, title: '', excerpt: '' } : { ...entry };
            post.title = post.title || '';
            post.excerpt = post.excerpt || '';

            const card = document.createElement('div');
            card.className = 'blog-card';
            if (post.mode === 'ai') {
                card.classList.add('ai-exclusive');
            }
            card.dataset.postUrl = post.url;

            const imgContent = post.image
                ? `<img src="${post.image}" alt="${post.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                   <div class="icon">📝</div>`
                : `<div class="icon">📝</div>`;

            card.innerHTML = `
                <div class="blog-image">
                    ${imgContent}
                </div>
                <div class="blog-content">
                    <div class="blog-meta">Technology</div>
                    <h3 class="post-title">${post.title || 'Untitled'}</h3>
                    <p class="post-summary">${post.excerpt}</p>
                    <a href="${post.url}" class="read-more">Read Article</a>
                </div>
            `;

            card.addEventListener('click', function () {
                const link = card.querySelector('.read-more');
                if (link && link.href) window.location.href = link.href;
            });

            blogGrid.appendChild(card);
        });

        // Trigger scroll animations
        initScrollAnimations();
    } catch (err) {
        console.warn('Could not load blogs.json:', err.message);
    }
}

/* ===================================================================
 *  ANALYTICS COUNTERS
 * =================================================================== */

let analyticsAnimated = false;

function animateCounter(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (range || 1)));
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (id === 'visitorCount') {
            element.textContent = current.toLocaleString();
        } else {
            element.textContent = current + '+';
        }
        if (current === end) clearInterval(timer);
    }, stepTime);
}

function calculateExperience() {
    const startDate = new Date('2020-12-07');
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - startDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
}

/* ===================================================================
 *  UMAMI ANALYTICS INTEGRATION
 * =================================================================== */

// Fetch real visitor stats from Umami API
async function fetchUmamiStats() {
    // Configuration — replace these with your Umami instance details
    const UMAMI_API_URL = ''; // e.g., 'https://cloud.umami.is'
    const UMAMI_WEBSITE_ID = ''; // your website ID from Umami dashboard
    const UMAMI_API_TOKEN = ''; // read-only API token

    // If not configured, return fallback values
    if (!UMAMI_API_URL || !UMAMI_WEBSITE_ID || !UMAMI_API_TOKEN) {
        return {
            visitors: 0,
            pageviews: 0,
            configured: false
        };
    }

    try {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

        const response = await fetch(
            `${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${thirtyDaysAgo}&endAt=${now}`,
            {
                headers: {
                    'Authorization': `Bearer ${UMAMI_API_TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) throw new Error(`Umami API returned ${response.status}`);
        const data = await response.json();

        return {
            visitors: data.visitors?.value || data.uniques?.value || 0,
            pageviews: data.pageviews?.value || 0,
            configured: true
        };
    } catch (err) {
        console.warn('Umami API fetch failed:', err.message);
        return { visitors: 0, pageviews: 0, configured: false };
    }
}

// Fetch detailed metrics for the analytics dashboard page
async function fetchUmamiMetrics() {
    const UMAMI_API_URL = '';
    const UMAMI_WEBSITE_ID = '';
    const UMAMI_API_TOKEN = '';

    if (!UMAMI_API_URL || !UMAMI_WEBSITE_ID || !UMAMI_API_TOKEN) {
        return null;
    }

    try {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const params = `startAt=${thirtyDaysAgo}&endAt=${now}`;
        const headers = {
            'Authorization': `Bearer ${UMAMI_API_TOKEN}`,
            'Accept': 'application/json'
        };

        const [statsRes, pagesRes, referrersRes, browsersRes] = await Promise.all([
            fetch(`${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?${params}`, { headers }),
            fetch(`${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/metrics?${params}&type=url`, { headers }),
            fetch(`${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/metrics?${params}&type=referrer`, { headers }),
            fetch(`${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/metrics?${params}&type=browser`, { headers })
        ]);

        const stats = await statsRes.json();
        const pages = await pagesRes.json();
        const referrers = await referrersRes.json();
        const browsers = await browsersRes.json();

        return { stats, pages, referrers, browsers };
    } catch (err) {
        console.warn('Umami detailed metrics failed:', err.message);
        return null;
    }
}

// Render analytics dashboard (on analytics.html page)
async function renderAnalyticsDashboard() {
    const dashboard = document.getElementById('analytics-dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = '<p class="dashboard-loading">Loading analytics data...</p>';

    const metrics = await fetchUmamiMetrics();

    if (!metrics) {
        dashboard.innerHTML = `
            <div class="dashboard-card">
                <h3>📊 Analytics</h3>
                <p class="dashboard-error">
                    Umami is not configured yet. Add your API URL, Website ID, and API Token in
                    <code>assets/js/script.js</code> to see real analytics data here.
                </p>
                <p style="color: var(--color-text-muted); margin-top: 12px; font-size: 0.88em;">
                    Sign up at <a href="https://umami.is" target="_blank">umami.is</a> (free tier available)
                    or self-host with Docker.
                </p>
            </div>
        `;
        return;
    }

    const s = metrics.stats;
    const visitors = s.visitors?.value || s.uniques?.value || 0;
    const pageviews = s.pageviews?.value || 0;
    const bounces = s.bounces?.value || 0;
    const avgTime = s.totaltime?.value ? Math.round((s.totaltime.value / visitors) / 1000) : 0;

    let pagesHtml = '';
    if (metrics.pages && metrics.pages.length > 0) {
        pagesHtml = metrics.pages.slice(0, 8).map(p =>
            `<li><span>${p.x || p.url || '/'}</span><span class="metric-value">${p.y || p.views || 0}</span></li>`
        ).join('');
    }

    let referrersHtml = '';
    if (metrics.referrers && metrics.referrers.length > 0) {
        referrersHtml = metrics.referrers.slice(0, 6).map(r =>
            `<li><span>${r.x || r.referrer || 'Direct'}</span><span class="metric-value">${r.y || r.views || 0}</span></li>`
        ).join('');
    }

    let browsersHtml = '';
    if (metrics.browsers && metrics.browsers.length > 0) {
        browsersHtml = metrics.browsers.slice(0, 5).map(b =>
            `<li><span>${b.x || b.browser || 'Unknown'}</span><span class="metric-value">${b.y || b.views || 0}</span></li>`
        ).join('');
    }

    dashboard.innerHTML = `
        <div class="dashboard-card">
            <h3>👁 Unique Visitors</h3>
            <div class="big-number">${visitors.toLocaleString()}</div>
            <div class="label">Last 30 days</div>
        </div>
        <div class="dashboard-card">
            <h3>📄 Page Views</h3>
            <div class="big-number">${pageviews.toLocaleString()}</div>
            <div class="label">Last 30 days</div>
        </div>
        <div class="dashboard-card">
            <h3>⏱ Avg. Visit Duration</h3>
            <div class="big-number">${avgTime}s</div>
            <div class="label">Per visitor</div>
        </div>
        <div class="dashboard-card">
            <h3>🚪 Bounce Rate</h3>
            <div class="big-number">${pageviews > 0 ? Math.round((bounces / visitors) * 100) : 0}%</div>
            <div class="label">Single page visits</div>
        </div>
        ${pagesHtml ? `
        <div class="dashboard-card dashboard-full-width">
            <h3>📊 Top Pages</h3>
            <ul class="metrics-list">${pagesHtml}</ul>
        </div>` : ''}
        ${referrersHtml ? `
        <div class="dashboard-card">
            <h3>🔗 Referrers</h3>
            <ul class="metrics-list">${referrersHtml}</ul>
        </div>` : ''}
        ${browsersHtml ? `
        <div class="dashboard-card">
            <h3>🌐 Browsers</h3>
            <ul class="metrics-list">${browsersHtml}</ul>
        </div>` : ''}
    `;
}

async function animateAnalytics() {
    if (analyticsAnimated) return;
    analyticsAnimated = true;

    const experienceYears = calculateExperience();

    // Hardcoded project/artwork counts (avoid fetching and parsing HTML)
    const projectCount = 3;
    const artworkCount = 4;

    // Animate counters
    animateCounter('projectCount', 0, projectCount, 1500);
    animateCounter('experienceYears', 0, experienceYears, 1500);
    animateCounter('artworkCount', 0, artworkCount, 1500);

    // AI mode counters
    animateCounter('workflowsCount', 0, 142, 2000);
    animateCounter('tokensGenerated', 0, 8, 1500);
    animateCounter('computeUsage', 0, 1205, 2000);

    // Fetch real visitor count from Umami
    const stats = await fetchUmamiStats();
    const visitorEl = document.getElementById('visitorCount');
    if (visitorEl) {
        if (stats.configured && stats.visitors > 0) {
            animateCounter('visitorCount', 0, stats.visitors, 2000);
        } else {
            visitorEl.textContent = '—';
            visitorEl.title = 'Connect Umami analytics to see real visitor data';
        }
    }
}

/* ===================================================================
 *  3D TILT EFFECT (refined — reduced intensity)
 * =================================================================== */

function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .blog-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Reduced from ±10° to ±5° for elegance
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            const shadowX = rotateY * 1.5;
            const shadowY = -rotateX * 1.5;
            card.style.boxShadow = `${shadowX}px ${shadowY}px 25px rgba(0, 0, 0, 0.2), 0 15px 35px rgba(0, 0, 0, 0.3)`;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;

            // Glare effect
            let glare = card.querySelector('.glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'glare';
                card.appendChild(glare);
            }
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12) 0%, transparent 80%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.boxShadow = '';
        });
    });
}

/* ===================================================================
 *  MAIN INITIALIZATION
 * =================================================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ── AI Mode Toggle (separate from visual theme) ──
    const aiToggle = document.getElementById('ai-checkbox');
    if (aiToggle) {
        const savedAiMode = localStorage.getItem('ai_mode');
        if (savedAiMode === 'ai_enhanced') {
            document.body.setAttribute('data-theme-mode', 'ai_enhanced');
            aiToggle.checked = true;
        }

        aiToggle.addEventListener('change', function () {
            // Trigger glitch transition
            document.body.classList.remove('glitch-active');
            void document.body.offsetWidth; // force reflow
            document.body.classList.add('glitch-active');
            setTimeout(() => { document.body.classList.remove('glitch-active'); }, 400);

            if (this.checked) {
                document.body.setAttribute('data-theme-mode', 'ai_enhanced');
                localStorage.setItem('ai_mode', 'ai_enhanced');
            } else {
                document.body.removeAttribute('data-theme-mode');
                localStorage.setItem('ai_mode', 'normal');
            }
        });
    }

    // ── Gallery ──
    if (document.getElementById('gallery-items') || document.getElementById('albums-grid')) {
        updateGalleryFromApi();
    }

    // ── Blog ──
    if (document.querySelector('.blog-grid')) {
        populateBlogGrid();
    }

    // ── Navigation active link ──
    const links = document.querySelectorAll('nav a');
    const currentPathname = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;
        const linkPathname = linkHref.split('/').pop().split('#')[0];

        let effectivePathname = currentPathname;
        if (effectivePathname === 'gallery.html') {
            effectivePathname = 'projects.html';
        }

        if (linkPathname === effectivePathname) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ── Analytics Section Observer ──
    const analyticsSection = document.getElementById('analytics');
    if (analyticsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateAnalytics();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(analyticsSection);
    }

    // ── Analytics Dashboard Page ──
    renderAnalyticsDashboard();

    // ── Scroll Animations ──
    initScrollAnimations();

    // ── Tilt Effect ──
    initTiltEffect();

    // ── Neural Network ──
    initNeuralNetwork();

    // ── Page Transitions ──
    initPageTransitions();

    // ── Modal close on backdrop click ──
    document.addEventListener('click', function (e) {
        const modal = document.getElementById('imageModal');
        if (e.target === modal) {
            closeModal();
        }
    });
    // ── UX Enhance: Magnetic Buttons ──
    initMagneticButtons();

    // ── UX Enhance: Scroll-Synced Path ──
    initScrollSyncedPath();
});


function initMagneticButtons() {
    const magnets = document.querySelectorAll('.btn, .social-icon, .read-more');
    
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', function(e) {
            const position = magnet.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            // magnetic translation
            magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            
            // if we want a sub-element to move slightly more
            const text = magnet.querySelector('.btn-text');
            if(text) text.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        magnet.addEventListener('mouseleave', function() {
            magnet.style.transform = `translate(0px, 0px)`;
            const text = magnet.querySelector('.btn-text');
            if(text) text.style.transform = `translate(0px, 0px)`;
        });
    });
}

function initScrollSyncedPath() {
    const timeline = document.querySelector('.timeline');
    const progressBar = document.querySelector('.timeline-progress');
    const items = document.querySelectorAll('.timeline-item');
    if (!timeline || !progressBar) return;

    window.addEventListener('scroll', () => {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Start timeline progress when top of timeline is at the middle of the screen
        const start = rect.top - windowHeight / 2;
        
        let progress = 0;
        if (start < 0) {
            // How much of the timeline has scrolled past
            progress = Math.abs(start) / (rect.height);
        }
        progress = Math.max(0, Math.min(1, progress));
        progressBar.style.height = `${progress * 100}%`;

        // Check each dot
        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            // middle of the screen offset
            if (itemRect.top < windowHeight / 2 + 50) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });
}

