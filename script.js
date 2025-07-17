// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on links
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for anchor links with navbar offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight - 20; // 20px extra padding
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format numbers with appropriate suffixes
        let displayValue = Math.floor(current);
        if (element.textContent.includes('K')) {
            displayValue = Math.floor(current / 1000) + 'K';
        } else if (element.textContent.includes('%')) {
            displayValue = Math.floor(current) + '%';
        } else if (element.textContent.includes('.')) {
            displayValue = (current / 10).toFixed(1);
        }
        
        element.textContent = displayValue;
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate counters
            if (entry.target.classList.contains('hero-stats')) {
                const stats = entry.target.querySelectorAll('.stat-number');
                stats.forEach(stat => {
                    const text = stat.textContent;
                    let target = parseInt(text);
                    
                    if (text.includes('K')) {
                        target = parseInt(text) * 1000;
                    } else if (text.includes('%')) {
                        target = parseInt(text);
                    } else if (text.includes('.')) {
                        target = parseFloat(text) * 10;
                    }
                    
                    animateCounter(stat, target);
                });
            }
            
            // Animate download stats
            if (entry.target.classList.contains('download-stats')) {
                const stats = entry.target.querySelectorAll('.stat-number');
                stats.forEach(stat => {
                    const text = stat.textContent;
                    let target = parseInt(text.replace(/[^0-9]/g, ''));
                    
                    if (text.includes('K')) {
                        target = parseInt(text) * 1000;
                    } else if (text.includes('.')) {
                        target = parseFloat(text) * 10;
                    }
                    
                    animateCounter(stat, target);
                });
            }
            
            // Animate cards
            if (entry.target.classList.contains('feature-card') || 
                entry.target.classList.contains('testimonial-card') ||
                entry.target.classList.contains('pricing-card')) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                entry.target.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, Math.random() * 200);
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const elementsToObserve = [
        '.hero-stats',
        '.download-stats',
        '.feature-card',
        '.testimonial-card',
        '.pricing-card'
    ];
    
    elementsToObserve.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => observer.observe(element));
    });
});

// Phone mockup interactive demo
document.addEventListener('DOMContentLoaded', () => {
    const jobCards = document.querySelectorAll('.job-card');
    
    jobCards.forEach(card => {
        card.addEventListener('click', () => {
            // Add a subtle interaction effect
            card.style.transform = 'scale(0.98)';
            card.style.transition = 'transform 0.1s ease';
            
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 100);
        });
    });
});

// Form validation and submission
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ef4444';
        } else {
            field.style.borderColor = '#d1d5db';
        }
    });
    
    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            isValid = false;
            emailField.style.borderColor = '#ef4444';
        }
    }
    
    return isValid;
}

// Add form submission handling if form exists
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(form)) {
                // Show success message
                const button = form.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                button.textContent = 'Sending...';
                button.disabled = true;
                
                setTimeout(() => {
                    button.textContent = 'Message Sent!';
                    button.style.background = '#10b981';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                        button.style.background = '';
                        form.reset();
                    }, 2000);
                }, 1000);
            }
        });
    });
});

// Pricing card hover effects
document.addEventListener('DOMContentLoaded', () => {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('popular')) {
                card.style.transform = 'translateY(-10px)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('popular')) {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
            }
        });
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const speed = 0.5;
        hero.style.transform = `translateY(${scrolled * speed}px)`;
    }
});

// Add CSS for hamburger animation
const style = document.createElement('style');
style.textContent = `
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);