
        // Page Navigation System
        function showPage(pageName) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Show selected page
            document.getElementById(pageName).classList.add('active');
            
            // Update navigation active state
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => link.classList.remove('active'));
            document.getElementById('nav-' + pageName).classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Trigger analytics animation if on about page
            if (pageName === 'about') {
                setTimeout(animateAnalytics, 300);
            }
        }

        // Image Upload and Gallery Management
        const uploadedImages = [];

        document.getElementById('fileInput').addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadedImages.push(event.target.result);
                    updateGallery();
                };
                reader.readAsDataURL(file);
            });
        });

        function updateGallery() {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = '';
            
            uploadedImages.forEach((imgSrc, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.onclick = () => openModal(imgSrc);
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = `Artwork ${index + 1}`;
                
                item.appendChild(img);
                gallery.appendChild(item);
            });

            // Add placeholders for remaining slots
            const remainingSlots = Math.max(6 - uploadedImages.length, 0);
            for (let i = 0; i < remainingSlots; i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'gallery-item';
                placeholder.innerHTML = `<div class="gallery-placeholder">Artwork ${uploadedImages.length + i + 1}</div>`;
                gallery.appendChild(placeholder);
            }
        }

        // Modal Functions
        function openModal(imgSrc) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = 'block';
            modalImg.src = imgSrc;
        }

        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        window.onclick = function(event) {
            const modal = document.getElementById('imageModal');
            if (event.target == modal) {
                closeModal();
            }
        };

        // Analytics Counter Animation
        let analyticsAnimated = false;

        function animateCounter(id, start, end, duration) {
            const element = document.getElementById(id);
            if (!element) return;
            
            const range = end - start;
            const increment = end > start ? 1 : -1;
            const stepTime = Math.abs(Math.floor(duration / range));
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (id === 'visitorCount') {
                    element.textContent = current.toLocaleString();
                } else {
                    element.textContent = current + '+';
                }
                
                if (current === end) {
                    clearInterval(timer);
                }
            }, stepTime);
        }

        function animateAnalytics() {
            if (analyticsAnimated) return;
            analyticsAnimated = true;
            
            animateCounter('projectCount', 0, 15, 2000);
            animateCounter('experienceYears', 0, 4, 2000);
            animateCounter('artworkCount', 0, 50, 2000);
            
            // Simulate visitor count
            const visitors = Math.floor(Math.random() * 500) + 100;
            animateCounter('visitorCount', 0, visitors, 2000);
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(e) {
            if (e.state && e.state.page) {
                showPage(e.state.page);
            }
        });

        // Update URL without page reload (optional - for better UX)
        const originalShowPage = showPage;
        showPage = function(pageName) {
            originalShowPage(pageName);
            history.pushState({ page: pageName }, '', '#' + pageName);
        };

        // Load correct page on initial load based on hash
        window.addEventListener('load', function() {
            const hash = window.location.hash.substring(1);
            if (hash && document.getElementById(hash)) {
                showPage(hash);
            }
        });
    