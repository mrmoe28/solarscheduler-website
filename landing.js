// SolarScheduler Landing Page JavaScript
// Handles animations, carousel, and navigation

class SolarSchedulerLanding {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.autoSlideInterval = null;
        
        this.init();
    }

    init() {
        console.log('SolarScheduler Landing: Initializing...');
        
        this.setupEventListeners();
        this.startAutoSlide();
        this.setupAnimations();
        
        console.log('SolarScheduler Landing: Ready');
    }

    setupEventListeners() {
        // Get Started buttons
        document.getElementById('get-started-btn').addEventListener('click', () => {
            this.handleGetStarted();
        });

        document.getElementById('start-now-btn').addEventListener('click', () => {
            this.handleGetStarted();
        });

        // Learn More button
        document.getElementById('learn-more-btn').addEventListener('click', () => {
            this.handleLearnMore();
        });

        // Carousel dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Touch/swipe support for carousel
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const carousel = document.querySelector('.carousel-track');
        let startX = 0;
        let isScrolling = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isScrolling = false;
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isScrolling) {
                const currentX = e.touches[0].clientX;
                const diffX = startX - currentX;
                
                if (Math.abs(diffX) > 50) {
                    isScrolling = true;
                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            }
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('.benefit-item, .feature-highlight, .demo-card').forEach(el => {
            observer.observe(el);
        });
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    goToSlide(slideIndex) {
        this.stopAutoSlide();
        
        // Update current slide
        this.currentSlide = slideIndex;
        
        // Update active states
        this.updateSlideDisplay();
        
        // Restart auto slide after user interaction
        setTimeout(() => {
            this.startAutoSlide();
        }, 8000);
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlideDisplay();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlideDisplay();
    }

    updateSlideDisplay() {
        // Update demo cards
        document.querySelectorAll('.demo-card').forEach((card, index) => {
            card.classList.remove('active');
            if (index === this.currentSlide) {
                card.classList.add('active');
            }
        });

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === this.currentSlide) {
                dot.classList.add('active');
            }
        });
    }

    handleGetStarted() {
        // Add loading state
        const button = event.target.closest('button');
        const originalHTML = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;

        // Simulate brief loading, then redirect
        setTimeout(() => {
            this.redirectToLogin();
        }, 1000);
    }

    handleLearnMore() {
        // Scroll to features section or redirect to main website
        window.location.href = '/index.html#features';
    }

    redirectToLogin() {
        window.location.href = '/login.html';
    }

    // Utility methods
    addParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            document.querySelector('.hero-background').style.transform = `translateY(${rate}px)`;
        });
    }
}

// Utility functions for enhanced UX
function createFloatingElements() {
    const container = document.querySelector('.hero-background');
    
    for (let i = 0; i < 20; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            opacity: 0.7;
        `;
        container.appendChild(element);
    }
}

// CSS animation for floating elements
const floatingStyles = `
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
`;

// Add floating animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = floatingStyles;
document.head.appendChild(styleSheet);

// Initialize landing page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.solarSchedulerLanding = new SolarSchedulerLanding();
    
    // Add floating elements for enhanced visual appeal
    createFloatingElements();
    
    // Prevent zoom on double tap for mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (window.solarSchedulerLanding) {
        if (document.hidden) {
            window.solarSchedulerLanding.stopAutoSlide();
        } else {
            window.solarSchedulerLanding.startAutoSlide();
        }
    }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';