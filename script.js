/*
 * ===================================================================
 *  SITE-WIDE DATA SOURCE (now backed by simple server API)
 * ===================================================================
 * The arrays were removed — the client now fetches /api/images and /api/blogs.
 */

/*
 * ===================================================================
 *  APPLICATION LOGIC
 * ===================================================================
 * The code below uses the API endpoints to populate gallery and blog pages.
 */

        // Modal Functions (unchanged)
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

        window.onclick = function(event) {
            const modal = document.getElementById('imageModal');
            if (event.target == modal) {
                closeModal();
            }
        };

        // Custom smooth scroll function (unchanged)
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
                const resp = await fetch('images.json');
                if (!resp.ok) throw new Error('images.json not found or returned ' + resp.status);
                const images = await resp.json();
                if (!Array.isArray(images)) throw new Error('images.json is not an array');

                // Normalize entries: strings -> images/<name> unless already absolute/starting with images/
                const normalized = images.map(src => {
                    if (typeof src !== 'string') return null;
                    if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
                    return src.startsWith('images/') ? src : `images/${src}`;
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
                // Intentionally do not fall back to built-in lists per request.
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
                const resp = await fetch('blogs.json');
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
                    card.addEventListener('click', function() {
                        const link = card.querySelector('.read-more');
                        if (link && link.href) window.location.href = link.href;
                    });
                    blogGrid.appendChild(card);
                });
            } catch (err) {
                console.warn('Could not load blogs.json:', err.message);
                // No fallback per request.
            }
        }

        // Analytics & other behaviors (reuse existing functions if present)
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

        function animateAnalytics() {
            if (analyticsAnimated) return;
            analyticsAnimated = true;
            animateCounter('projectCount', 0, 15, 2000);
            animateCounter('experienceYears', 0, 4, 2000);
            animateCounter('artworkCount', 0, 50, 2000);
            const visitors = Math.floor(Math.random() * 500) + 100;
            animateCounter('visitorCount', 0, visitors, 2000);
        }

document.addEventListener('DOMContentLoaded', function() {
    // Populate gallery if on gallery page
    if (document.getElementById('gallery-items') || document.getElementById('gallery')) {
        updateGalleryFromApi();
    }

    // Populate blog grid if on blog page
    if (document.querySelector('.blog-grid')) {
        populateBlogGrid();
    }

    // Navigation active link logic (preserved)
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
            link.addEventListener('click', function(e) {
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

    // Smooth page transitions for internal links
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="."]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && href !== window.location.pathname.split('/').pop()) {
                e.preventDefault();
                document.body.classList.remove('fade-in');
                setTimeout(() => { window.location.href = href; }, 500);
            }
        });
    });
});