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

// Neural Network Background Animation
function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Hide CSS particles since we have canvas now
    const particles = document.querySelectorAll('.particle');
    particles.forEach(p => p.style.display = 'none');

    // Neural nodes
    const nodes = [];
    const numNodes = Math.min(60, Math.floor((width * height) / 25000)); // Responsive node count
    const connectionDistance = 180;

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += 0.02;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Keep in bounds
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
        }

        draw() {
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
            // Lavender core
            ctx.fillStyle = `rgba(167, 139, 250, ${0.6 * pulse})`;
            ctx.fill();

            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
            // Sky blue glow
            gradient.addColorStop(0, `rgba(56, 189, 248, ${0.3 * pulse})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    // Create nodes
    for (let i = 0; i < numNodes; i++) {
        nodes.push(new Node());
    }

    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const opacity = (1 - dist / connectionDistance) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    // Indigo connection lines
                    ctx.strokeStyle = `rgba(129, 140, 248, ${opacity})`;
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

    // Handle resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    animate();
}

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
// --------------------------
// JSON-driven gallery loader (Albums Support)
// --------------------------
let allAlbums = [];

async function updateGalleryFromApi() {
    const albumsGrid = document.getElementById('albums-grid');
    const albumView = document.getElementById('album-view');
    const galleryItems = document.getElementById('gallery-items');
    const backBtn = document.getElementById('back-to-albums');
    const albumTitle = document.getElementById('current-album-title');

    if (!albumsGrid) return; // Not on gallery page

    // Back button logic
    if (backBtn) {
        backBtn.onclick = () => {
            albumView.style.display = 'none';
            albumsGrid.style.display = 'grid';
            // Fade effect
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

        // Handle legacy format (if it was just an array of strings, though we updated it)
        if (Array.isArray(allAlbums) && typeof allAlbums[0] === 'string') {
            console.warn('Legacy gallery format detected. Please update images.json.');
            renderLegacyGallery(allAlbums, galleryItems);
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

            // Image count badge
            const count = album.images ? album.images.length : 0;

            card.innerHTML = `
                <div class="album-cover">
                    <img src="${album.cover || 'assets/img/thumbnails/album_placeholder.png'}" alt="${album.title}">
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
    }

    function openAlbum(album) {
        // Switch views
        albumsGrid.style.display = 'none';
        albumView.style.display = 'block';
        albumView.style.opacity = '0';

        requestAnimationFrame(() => {
            albumView.style.transition = 'opacity 0.5s ease';
            albumView.style.opacity = '1';
        });

        // Set title
        if (albumTitle) albumTitle.textContent = album.title;

        // Render images
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
            // Stagger animation
            item.style.animationDelay = `${index * 0.1}s`;
            item.onclick = () => openModal(imgSrc);
            item.innerHTML = `<img src="${imgSrc}" alt="${album.title} ${index + 1}">`;
            galleryItems.appendChild(item);
        });
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
            // Use image if available, else fallback emoji
            const imgContent = post.image
                ? `<img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                   <div class="icon">📝</div>`
                : `<div class="icon">📝</div>`;

            card.innerHTML = `
                        <div class="blog-image">
                            ${imgContent}
                        </div>
                        <div class="blog-content">
                            <div class="blog-meta">Technlogy</div>
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
        const data = await resp.json();
        if (Array.isArray(data)) {
            // Check if it's the new album format (objects) or legacy (strings)
            if (typeof data[0] === 'string') return data.length;
            // Sum all images in albums
            return data.reduce((acc, album) => acc + (album.images ? album.images.length : 0), 0);
        }
        return 50;
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

            // Dynamic shadow shift based on tilt
            const shadowX = rotateY * 2;
            const shadowY = -rotateX * 2;
            card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(255, 215, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.4)`;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Glare effect
            let glare = card.querySelector('.glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'glare';
                card.appendChild(glare);
            }
            const glareX = x;
            const glareY = y;
            glare.style.background = `radial-gradient(circle at ${glareX}px ${glareY}px, rgba(255, 255, 255, 0.2) 0%, transparent 80%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.1), 0 10px 30px rgba(0, 0, 0, 0.3)';
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

    // Initialize Neural Network Background
    initNeuralNetwork();
});