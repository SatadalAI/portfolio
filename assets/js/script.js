/*
 * ===================================================================
 *  SITE-WIDE DATA SOURCE
 * ===================================================================
 */

/*
 * ===================================================================
 *  APPLICATION LOGIC
 * ===================================================================
 */

// Modal Functions
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

window.onclick = function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        closeModal();
    }
};

// Custom smooth scroll function
function customSmoothScroll(targetId, duration) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;

    if (distance === 0) return;

    let startTime = null;
    const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        window.scrollTo(0, easeInOutQuad(timeElapsed, startPosition, distance, duration));
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}

// --------------------------
// JSON-driven gallery loader
// --------------------------
async function updateGalleryFromApi() {
    const gallery = document.getElementById('gallery-items') || document.getElementById('gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    try {
        const resp = await fetch('assets/data/images.json');
        if (!resp.ok) throw new Error('images.json not found or returned ' + resp.status);
        const images = await resp.json();
        if (!Array.isArray(images)) throw new Error('images.json is not an array');

        // Normalize entries: strings -> assets/img/<name> unless already absolute/starting with assets/img/
        const normalized = images.map(src => {
            if (typeof src !== 'string') return null;
            if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
            return src.startsWith('assets/img/') ? src : `assets/img/${src}`;
        }).filter(Boolean);

        normalized.forEach((imgSrc, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => openModal(imgSrc);
            item.innerHTML = `<img src="${imgSrc}" alt="Artwork ${index + 1}">`;
            gallery.appendChild(item);
        });
    } catch (err) {
        console.warn('Could not load images.json:', err.message);
    }
}

// --------------------------
// JSON-driven blog loader
// --------------------------
async function populateBlogGrid() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;
    blogGrid.innerHTML = '';

    try {
        const resp = await fetch('assets/data/blogs.json');
        if (!resp.ok) throw new Error('blogs.json not found or returned ' + resp.status);
        const posts = await resp.json();
        if (!Array.isArray(posts)) throw new Error('blogs.json is not an array');

        // Each entry can be a string (url) or object { url, title, excerpt }
        posts.forEach((entry) => {
            const post = (typeof entry === 'string') ? { url: entry, title: '', excerpt: '' } : { ...entry };
            post.title = post.title || '';
            post.excerpt = post.excerpt || '';

            const card = document.createElement('div');
            card.className = 'blog-card';
            card.dataset.postUrl = post.url;
            card.innerHTML = `
                        <div class="blog-image">📝</div>
                        <div class="blog-content">
                            <div class="blog-meta"><span>📄</span></div>
                            <h3 class="post-title">${post.title || 'Untitled'}</h3>
                            <p class="post-summary">${post.excerpt}</p>
                            <a href="${post.url}" class="read-more">Read More</a>
                        </div>
                    `;
            card.addEventListener('click', function () {
                const link = card.querySelector('.read-more');
                if (link && link.href) window.location.href = link.href;
            });
            blogGrid.appendChild(card);
        });
    } catch (err) {
        console.warn('Could not load blogs.json:', err.message);
    }
}

// Analytics & other behaviors
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

// Calculate years of experience from December 7, 2020
function calculateExperience() {
    const startDate = new Date('2020-12-07');
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - startDate);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
}

// Get or initialize visitor count
function getVisitorCount() {
    // Check if this is a new visitor
    const hasVisited = localStorage.getItem('portfolio_visited');
    let totalVisitors = parseInt(localStorage.getItem('portfolio_visitor_count') || '0');
    
    if (!hasVisited) {
        // New visitor
        totalVisitors++;
        localStorage.setItem('portfolio_visitor_count', totalVisitors.toString());
        localStorage.setItem('portfolio_visited', 'true');
    }
    
    return totalVisitors;
}

// Count projects dynamically
async function countProjects() {
    // Try to count from projects.html via fetch
    try {
        const response = await fetch('projects.html');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const projectCards = doc.querySelectorAll('.project-card');
        return projectCards.length || 15; // Fallback to 15 if can't count
    } catch (error) {
        console.warn('Could not count projects:', error);
        return 15; // Fallback value
    }
}

// Count artworks from gallery
async function countArtworks() {
    try {
        const resp = await fetch('assets/data/images.json');
        if (!resp.ok) throw new Error('images.json not found');
        const images = await resp.json();
        return Array.isArray(images) ? images.length : 50;
    } catch (error) {
        console.warn('Could not count artworks:', error);
        return 50; // Fallback value
    }
}

async function animateAnalytics() {
    if (analyticsAnimated) return;
    analyticsAnimated = true;
    
    // Get dynamic counts
    const projectCount = await countProjects();
    const experienceYears = calculateExperience();
    const artworkCount = await countArtworks();
    const visitorCount = getVisitorCount();
    
    // Animate counters with real values
    animateCounter('projectCount', 0, projectCount, 2000);
    animateCounter('experienceYears', 0, experienceYears, 2000);
    animateCounter('artworkCount', 0, artworkCount, 2000);
    animateCounter('visitorCount', 0, visitorCount, 2000);
}

/*
 * ===================================================================
 *  3D TILT EFFECT
 * ===================================================================
 */
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .blog-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('checkbox');
    if (themeToggle) {
        // Check for saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'artist') {
            document.body.setAttribute('data-theme', 'artist');
            themeToggle.checked = true;
        }

        themeToggle.addEventListener('change', function () {
            if (this.checked) {
                document.body.setAttribute('data-theme', 'artist');
                localStorage.setItem('theme', 'artist');
            } else {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'engineer');
            }
        });
    }

    // Populate gallery if on gallery page
    if (document.getElementById('gallery-items') || document.getElementById('gallery')) {
        updateGalleryFromApi();
    }

    // Populate blog grid if on blog page
    if (document.querySelector('.blog-grid')) {
        populateBlogGrid();
    }

    // Navigation active link logic
    const links = document.querySelectorAll('nav a');
    const currentPathname = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;

    links.forEach(link => {
        const linkHref = link.getAttribute('href');
        const linkPathname = linkHref.split('/').pop().split('#')[0];
        const linkHash = linkHref.includes('#') ? '#' + linkHref.split('#')[1] : '';

        if (linkPathname === currentPathname && linkHash === currentHash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }

        // Smooth scroll for anchor links on the home page
        if (currentPathname === 'index.html' && linkHref.startsWith('#')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                customSmoothScroll(targetId, 1200);
            });
        }
    });

    // Intersection Observer for analytics section
    const analyticsSection = document.getElementById('analytics');
    if (analyticsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateAnalytics();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(analyticsSection);
    }

    // Initialize tilt effect
    initTiltEffect();
});