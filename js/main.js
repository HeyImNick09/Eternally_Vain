/* ============================================
   ETERNALLY VAIN — Main JavaScript
   Handles: Preloader, Navbar, Tabs, Testimonials,
   Booking Form, Scroll Animations, Back-to-Top
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize Lucide Icons ---
    lucide.createIcons();

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1800);
    });
    // Fallback: hide preloader after 3 seconds regardless
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3000);

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function handleNavScroll() {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function updateActiveLink() {
        const scrollPos = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        handleNavScroll();
        updateActiveLink();
        handleBackToTop();
        handleScrollReveal();
    }, { passive: true });

    // --- Mobile Navigation ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Close mobile nav on outside click
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPos = target.offsetTop - navHeight - 10;
                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Injectable Tabs ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Re-init icons in newly visible tab
            lucide.createIcons();
        });
    });

    // --- Testimonial Carousel ---
    const track = document.getElementById('testimonialTrack');
    const cards = track ? track.querySelectorAll('.testimonial-card') : [];
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const dotsContainer = document.getElementById('testimonialDots');
    let currentSlide = 0;
    let slidesPerView = 3;
    let totalSlides = 0;

    function calculateSlidesPerView() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    function initCarousel() {
        if (!track || cards.length === 0) return;
        
        slidesPerView = calculateSlidesPerView();
        
        // On mobile, total slides = number of cards
        // On desktop, total slides = cards - slidesPerView + 1
        if (window.innerWidth <= 768) {
            totalSlides = cards.length;
        } else {
            totalSlides = Math.max(0, cards.length - slidesPerView + 1);
        }
        
        currentSlide = Math.min(currentSlide, totalSlides - 1);
        if (currentSlide < 0) currentSlide = 0;

        // Build dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = `dot${i === currentSlide ? ' active' : ''}`;
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        updateCarousel();
    }

    function updateCarousel() {
        if (!track || cards.length === 0) return;
        
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile: each card is 100% of container width
            const containerWidth = track.parentElement.offsetWidth;
            const offset = currentSlide * containerWidth;
            track.style.transform = `translateX(-${offset}px)`;
        } else {
            // On desktop: calculate with gap
            const cardWidth = cards[0].offsetWidth;
            const gap = 24;
            const offset = currentSlide * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Update dots
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }
    }

    function goToSlide(index) {
        currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
        updateCarousel();
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }

    // Auto-slide disabled for better manual control on mobile

    window.addEventListener('resize', initCarousel);
    initCarousel();

    // --- Touch/Swipe support for testimonials ---
    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
            }
        }, { passive: true });
    }

    // --- Booking Form ---
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) value = value.slice(0, 10);
                if (value.length >= 7) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
                } else if (value.length >= 4) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                } else if (value.length >= 1) {
                    value = `(${value}`;
                }
                e.target.value = value;
            });
        }

        // Set min date to today
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // Form submission
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation visual feedback
            const requiredFields = bookingForm.querySelectorAll('[required]');
            let valid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#c0392b';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!valid) return;

            // Show success state
            const formWrapper = document.querySelector('.booking-form-wrapper');
            formWrapper.innerHTML = `
                <div class="form-success">
                    <i data-lucide="check-circle"></i>
                    <h3>Request Received!</h3>
                    <p>Thank you for choosing Eternally Vain. We'll confirm your appointment within 24 hours via email or phone.</p>
                    <p style="margin-top: 16px; color: var(--color-accent);">We look forward to seeing you!</p>
                </div>
            `;
            lucide.createIcons();
        });
    }

    // --- Newsletter Form ---
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            if (input && input.value.trim()) {
                newsletterForm.innerHTML = `<p style="color: var(--color-accent); font-size: 0.88rem;">Thank you for subscribing! Stay beautiful.</p>`;
            }
        });
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('backToTop');

    function handleBackToTop() {
        if (!backToTopBtn) return;
        if (window.scrollY > 600) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Scroll Reveal (data-aos elements) ---
    function handleScrollReveal() {
        const elements = document.querySelectorAll('[data-aos]');
        const windowHeight = window.innerHeight;
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < windowHeight * 0.88) {
                el.classList.add('revealed');
            }
        });
    }
    // Initial check
    handleScrollReveal();

    // --- Counter Animation for stats ---
    const stats = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateCounters() {
        if (statsAnimated) return;
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
            statsAnimated = true;
            stats.forEach(stat => {
                const text = stat.textContent;
                const match = text.match(/(\d+)/);
                if (match) {
                    const target = parseInt(match[0]);
                    const suffix = text.replace(match[0], '');
                    let current = 0;
                    const increment = Math.max(1, Math.floor(target / 60));
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        stat.textContent = current + suffix;
                    }, 20);
                }
            });
        }
    }

    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

    // --- Parallax-like subtle movement on hero ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
            }
        }, { passive: true });
    }

});
