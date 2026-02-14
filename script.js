// Utility: Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility: Check if mobile device
const isMobile = () => window.innerWidth <= 768;

// Mobile Menu Toggle with proper state management
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const body = document.body;

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

// Close menu when clicking on links
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
            body.style.overflow = '';
        }
    });
});

// Improved Smooth Scroll with offset for sticky nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
            const offsetTop = target.offsetTop - navHeight - topBarHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Scroll Effect - Debounced for performance
const navbar = document.getElementById('navbar');
let lastScrollTop = 0;

const handleScroll = debounce(() => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (navbar) {
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
        } else {
            navbar.style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)';
        }
    }
    
    // Update active nav links
    updateActiveNavLink();
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, 10);

window.addEventListener('scroll', handleScroll, { passive: true });

// Update active nav link based on scroll position
function updateActiveNavLink() {
    if (isMobile()) return; // Skip on mobile for performance
    
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.pageYOffset + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Intersection Observer for Scroll Animations - Only on desktop
if (!isMobile() && 'IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, observerOptions);

    // Observe elements
    const animateElements = document.querySelectorAll('.value-card, .program, .life-card, .step, .contact-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
} else {
    // Skip animations on mobile - just show elements
    const animateElements = document.querySelectorAll('.value-card, .program, .life-card, .step, .contact-card');
    animateElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}

// Counter Animation for Stats - Only trigger once
const stats = document.querySelectorAll('.stat-item h3');
const aboutSection = document.querySelector('.about');
let statsAnimated = false;

function animateCounter(element) {
    const target = element.textContent;
    const isPercent = target.includes('%');
    const isPlus = target.includes('+');
    const number = parseInt(target.replace(/\D/g, ''));
    
    if (isNaN(number)) return;
    
    const duration = 2000;
    const increment = number / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < number) {
            element.textContent = Math.floor(current) + (isPlus ? '+' : isPercent ? '%' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

if ('IntersectionObserver' in window && aboutSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                stats.forEach(stat => animateCounter(stat));
                statsObserver.disconnect(); // Stop observing after animation
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(aboutSection);
}

// Form Submission with validation
const admissionForm = document.getElementById('admissionForm');
if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(admissionForm);
        const inputs = admissionForm.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        // Basic validation
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ff6b35';
            } else {
                input.style.borderColor = '';
            }
        });
        
        if (isValid) {
            // Show success message
            alert('Thank you for your inquiry! Our admissions team will contact you within 24 hours.');
            admissionForm.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });
}

// Remove parallax effect on mobile for performance
const hero = document.querySelector('.hero');
if (!isMobile() && hero) {
    const handleParallax = debounce(() => {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }, 10);
    
    window.addEventListener('scroll', handleParallax, { passive: true });
}

// Lazy load images if any are added later
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for older browsers
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Handle resize events - Update mobile state
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menu if window is resized to desktop
        if (!isMobile() && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
            body.style.overflow = '';
        }
    }, 250);
});

// Prevent horizontal scroll on mobile
function preventHorizontalScroll() {
    const body = document.body;
    const html = document.documentElement;
    
    if (body.scrollWidth > window.innerWidth) {
        body.style.overflowX = 'hidden';
        html.style.overflowX = 'hidden';
    }
}

preventHorizontalScroll();
window.addEventListener('resize', debounce(preventHorizontalScroll, 250));

// Add touch feedback for better mobile UX
if ('ontouchstart' in window) {
    const buttons = document.querySelectorAll('.btn, .nav-menu a');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.style.opacity = '1';
        }, { passive: true });
    });
}

// Set current year in footer
try {
    const currentYear = new Date().getFullYear();
    const footerText = document.querySelector('.footer-bottom p');
    if (footerText && !footerText.textContent.includes(currentYear)) {
        footerText.innerHTML = footerText.innerHTML.replace(/2026/g, currentYear);
    }
} catch (error) {
    console.error('Error updating footer year:', error);
}

// Performance monitoring (remove in production)
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('✓ SKV School website loaded in ' + pageLoadTime + 'ms');
        }, 0);
    });
}

// Error handling for missing elements
try {
    // Ensure critical elements exist
    if (!navbar) console.warn('Navbar element not found');
    if (!navMenu) console.warn('Nav menu element not found');
    if (!mobileToggle) console.warn('Mobile toggle element not found');
} catch (error) {
    console.error('Initialization error:', error);
}

console.log('✓ SKV School website initialized successfully');
