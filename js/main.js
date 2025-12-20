/**
 * Ocampo Demoliciones - Main JavaScript
 * =====================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initScrollReveal();
    initProcessAnimation();
    initContactForm();
    initCounterAnimation();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const menuLinks = mobileMenu.querySelectorAll('a');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', function() {
        const isOpen = mobileMenu.classList.contains('open');

        if (isOpen) {
            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('hidden');
            menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        } else {
            mobileMenu.classList.remove('hidden');
            // Force reflow
            mobileMenu.offsetHeight;
            mobileMenu.classList.add('open');
            menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
        }
    });

    // Close menu when clicking a link
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('hidden');
            menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        });
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    const navLinks = header.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!header) return;

    let lastScrollY = 0;

    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;

        // Add/remove scrolled class
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - header.offsetHeight - 100;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });

        lastScrollY = scrollY;
    });
}

/**
 * Scroll Reveal Animation
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.service-card, .project-card, .reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

/**
 * Process Steps Animation
 */
function initProcessAnimation() {
    const processSteps = document.querySelectorAll('.process-step');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150);
            }
        });
    }, observerOptions);

    processSteps.forEach(step => {
        observer.observe(step);
    });
}

/**
 * Contact Form Handler
 */
function initContactForm() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // EmailJS configuration
        const serviceID = 'service_2rwdsy2';
        const templateRicardo = 'template_h71lsx4';
        const templateCliente = 'template_tag9nse';

        // Send email to Ricardo
        emailjs.send(serviceID, templateRicardo, data)
            .then(() => {
                // Send copy to client
                return emailjs.send(serviceID, templateCliente, data);
            })
            .then(() => {
                // Success state
                form.classList.add('success');
                showNotification('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
                form.reset();

                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Remove success class after animation
                setTimeout(() => {
                    form.classList.remove('success');
                }, 3000);
            })
            .catch((error) => {
                console.error('Error al enviar:', error);
                showNotification('Error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    });
}

/**
 * Form Validation
 */
function validateForm(data) {
    const { nombre, email, telefono, servicio, mensaje } = data;
    let isValid = true;

    // Clear previous errors
    clearFormErrors();

    if (!nombre || nombre.trim().length < 2) {
        showFieldError('nombre', 'Por favor ingresa tu nombre');
        isValid = false;
    }

    if (!email || !isValidEmail(email)) {
        showFieldError('email', 'Por favor ingresa un email válido');
        isValid = false;
    }

    if (!telefono || telefono.trim().length < 8) {
        showFieldError('telefono', 'Por favor ingresa un teléfono válido');
        isValid = false;
    }

    if (!servicio) {
        showFieldError('servicio', 'Por favor selecciona un servicio');
        isValid = false;
    }

    if (!mensaje || mensaje.trim().length < 10) {
        showFieldError('mensaje', 'Por favor describe tu proyecto (mínimo 10 caracteres)');
        isValid = false;
    }

    return isValid;
}

/**
 * Email Validation
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show Field Error
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('border-red-500');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

/**
 * Clear Form Errors
 */
function clearFormErrors() {
    const form = document.getElementById('contact-form');
    const errors = form.querySelectorAll('.field-error');
    const fields = form.querySelectorAll('.border-red-500');

    errors.forEach(error => error.remove());
    fields.forEach(field => field.classList.remove('border-red-500'));
}

/**
 * Show Notification
 */
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;

    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else {
        notification.classList.add('bg-red-500', 'text-white');
    }

    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${type === 'success'
                    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
                    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
                }
            </svg>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Counter Animation
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[class*="font-extrabold"][class*="text-4xl"]');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Animate Counter
 */
function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/(\+?)(\d+)(%?)/);

    if (!match) return;

    const prefix = match[1] || '';
    const target = parseInt(match[2]);
    const suffix = match[3] || '';

    let current = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
            element.textContent = `${prefix}${target}${suffix}`;
            clearInterval(timer);
        } else {
            element.textContent = `${prefix}${Math.floor(current)}${suffix}`;
        }
    }, 16);
}

/**
 * Lazy Load Images (if needed)
 */
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

/**
 * Track WhatsApp Clicks (for analytics)
 */
document.addEventListener('click', function(e) {
    const whatsappBtn = e.target.closest('#whatsapp-btn');

    if (whatsappBtn) {
        // Track event (Google Analytics example)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'WhatsApp',
                'event_label': 'Floating Button Click'
            });
        }
    }
});

/**
 * Track Form Submissions (for analytics)
 */
document.addEventListener('submit', function(e) {
    if (e.target.id === 'contact-form') {
        // Track event (Google Analytics example)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'Contact',
                'event_label': 'Quote Request'
            });
        }
    }
});
