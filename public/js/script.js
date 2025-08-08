// === REDEFINELAB GYM WEBSITE - OPTIMIZED JAVASCRIPT ===

// === VALIDATION SYSTEM ===
const ValidationRules = {
    name: {
        validate: (value) => {
            const trimmed = value.trim();
            return trimmed.length >= 2 && !/[0-9]/.test(trimmed);
        },
        message: 'Full name must be at least 2 characters and contain only letters'
    },
    phone: {
        validate: (value) => /^(\+201|01)[0-9]{9}$/.test(value.trim()),
        message: 'Please enter a valid Egyptian phone number (e.g., 01234567890)'
    },
    email: {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        message: 'Please enter a valid email address'
    },
    required: {
        validate: (value) => value.trim() !== '',
        message: 'This field is required'
    }
};

function validateField(field) {
    const value = field.value;
    const validationType = field.dataset.validate;
    let isValid = true;
    
    // Check required first
    if (field.hasAttribute('required')) {
        const rule = ValidationRules.required;
        if (!rule.validate(value)) {
            showFieldError(field, rule.message);
            return false;
        }
    }
    
    // Check specific validation type if there is a value
    if (validationType && value.trim() !== '') {
        const rule = ValidationRules[validationType];
        if (rule && !rule.validate(value)) {
            showFieldError(field, rule.message);
            isValid = false;
        }
    }
    
    if (isValid) {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#ff4757';
    field.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// === NAVIGATION & THEME ===
function initializeNavigation() {
    // Highlight active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Mobile menu toggle
    initializeMobileMenu();
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    
    if (!mobileMenuToggle || !mobileNavMenu) return;
    
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNavMenu.classList.toggle('open');
    });
    
    // Close menu when clicking on a nav link
    const navLinks = mobileNavMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileNavMenu.classList.remove('open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenuToggle.contains(e.target) && !mobileNavMenu.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            mobileNavMenu.classList.remove('open');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            mobileMenuToggle.classList.remove('active');
            mobileNavMenu.classList.remove('open');
        }
    });
}

function initializeThemeToggle() {
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (!darkModeBtn) return;

    // Set initial state from localStorage, default to dark mode to match CSS
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true; // Default to dark mode
    document.body.classList.toggle('dark-home', isDark);
    darkModeBtn.checked = isDark;
    
    // Save default theme if none exists
    if (!savedTheme) {
        localStorage.setItem('theme', 'dark');
    }

    darkModeBtn.addEventListener('change', () => {
        if (darkModeBtn.checked) {
            document.body.classList.add('dark-home');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-home');
            localStorage.setItem('theme', 'light');
        }
    });
}

// === NOTIFICATIONS ===
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// === HEADER & FOOTER GENERATION ===
function createGlobalHeader() {
    const headerHTML = `
    <header class="main-header modern-gym-header">
        <nav class="main-nav gym-nav">
            <div class="brand gym-brand">
                <a href="/" class="logo-link">
                    <div class="logo-container">
                        <img src="images/Gemini_Generated_Image_wfkascwfkascwfka.png" alt="RedefineLab Logo" class="brand-logo gym-logo">
                        <div class="logo-glow"></div>
                    </div>
                    <span class="brand-name gym-title">REDEFINELAB</span>
                </a>
            </div>
            <div class="nav-mobile-controls">
                <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle navigation menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <ul class="nav-links gym-nav-links" id="mobile-nav-menu">
                <li><a href="/" class="nav-link">HOME</a></li>
                <li><a href="/services" class="nav-link">SERVICES</a></li>
                <li><a href="/about" class="nav-link">ABOUT</a></li>
                <li><a href="/contact" class="nav-link">CONTACT</a></li>
                <li><a href="/login" class="nav-link">LOGIN</a></li>
                <li><a href="/join" class="join-btn gym-cta">JOIN</a></li>
                <li>
                    <div class="theme-switch-wrapper gym-toggle">
                        <span class="theme-label gym-toggle-label">Dark Mode</span>
                        <label class="theme-switch gym-switch" for="dark-mode-toggle">
                            <input type="checkbox" id="dark-mode-toggle" />
                            <span class="slider round gym-slider"></span>
                        </label>
                    </div>
                </li>
            </ul>
        </nav>
    </header>`;
    
    const headerContainer = document.getElementById('global-header');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
        
        // Set active navigation based on current page
        const currentPath = window.location.pathname;
        const navLinks = headerContainer.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
                link.classList.add('active');
            }
        });
        
        // Reinitialize theme toggle after header is loaded
        initializeThemeToggle();
    }
}

function createGlobalFooter() {
    const footerContainer = document.getElementById('global-footer');
    if (!footerContainer) return;
    
    const footerHTML = `
    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-sections">
                <!-- Brand Section -->
                <div class="footer-section footer-brand">
                    <div class="footer-logo">
                        <img src="images/Gemini_Generated_Image_wfkascwfkascwfka.png" alt="RedefineLab Logo" class="footer-brand-logo">
                        <h3 class="footer-brand-name">REDEFINELAB</h3>
                    </div>
                    <p class="footer-description">
                        Transform your body and mind through the power of fitness. Join our community and redefine what's possible.
                    </p>
                    <div class="footer-social">
                        <h4>Follow Us</h4>
                        <div class="social-icons">
                            <a href="#" class="social-icon facebook" title="Facebook">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </a>
                            <a href="#" class="social-icon instagram" title="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" stroke-width="2"/>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </a>
                            <a href="#" class="social-icon twitter" title="Twitter">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </a>
                            <a href="#" class="social-icon youtube" title="YouTube">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" stroke-width="2"/>
                                    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="currentColor"/>
                                </svg>
                            </a>
                            <a href="https://wa.me/201285500002" class="social-icon whatsapp" title="WhatsApp" target="_blank">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z" fill="currentColor"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="footer-section footer-links">
                    <h4>Quick Links</h4>
                    <ul class="footer-nav">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Services</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/join">Join Now</a></li>
                    </ul>
                </div>

                <!-- Services -->
                <div class="footer-section footer-services">
                    <h4>Our Services</h4>
                    <ul class="footer-nav">
                        <li><a href="/services">Personal Training</a></li>
                        <li><a href="/services">Group Classes</a></li>
                        <li><a href="/services">Nutrition Coaching</a></li>
                        <li><a href="/services">Strength Training</a></li>
                        <li><a href="/services">Cardio Workouts</a></li>
                    </ul>
                </div>

                <!-- Contact Info -->
                <div class="footer-section footer-contact">
                    <h4>Get In Touch</h4>
                    <div class="contact-info">
                        <div class="contact-item">
                            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <div>
                                <span class="contact-label">Address</span>
                                <span class="contact-value">St Teseen, New Cairo, Egypt</span>
                            </div>
                        </div>
                        <div class="contact-item">
                            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <div>
                                <span class="contact-label">Phone</span>
                                <span class="contact-value">01285500002</span>
                            </div>
                        </div>
                        <div class="contact-item">
                            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/>
                                <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <div>
                                <span class="contact-label">Email</span>
                                <span class="contact-value">info@redefinelab.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gym Hours -->
                <div class="footer-section footer-hours">
                    <h4>Gym Hours</h4>
                    <div class="hours-list">
                        <div class="hour-item">
                            <span>Mon - Fri</span>
                            <span>5:00 AM - 11:00 PM</span>
                        </div>
                        <div class="hour-item">
                            <span>Sat - Sun</span>
                            <span>6:00 AM - 10:00 PM</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Bottom -->
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <div class="footer-copyright">
                        <p>&copy; 2025 RedefineLab. All rights reserved.</p>
                    </div>
                    <div class="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;
    
    footerContainer.innerHTML = footerHTML;
}

// === CONTACT PAGE FUNCTIONALITY ===
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Handle form submission
    form.addEventListener('submit', handleFormSubmission);
    
    // Real-time validation feedback
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // For name field, prevent numbers
            if (this.dataset.validate === 'name') {
                this.value = this.value.replace(/[0-9]/g, '');
                validateField(this);
            } else if (this.value.trim().length === 0) {
                clearFieldError(this);
            }
            updateFormProgress();
        });
    });
}

function updateFormProgress() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    const progressFill = form.querySelector('.progress-fill');
    const progressText = form.querySelector('.progress-text');
    
    if (!progressFill || !progressText) return;
    
    let filledInputs = 0;
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            filledInputs++;
        }
    });
    
    const progress = (filledInputs / inputs.length) * 100;
    progressFill.style.width = progress + '%';
    
    if (progress === 100) {
        progressText.textContent = 'Ready to send!';
    } else if (progress > 0) {
        progressText.textContent = `${Math.round(progress)}% complete`;
    } else {
        progressText.textContent = 'Complete the form below';
    }
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.contact-submit-btn');
    const originalBtnContent = submitBtn.innerHTML;
    
    // Final validation before submitting
    let isFormValid = true;
    const fieldsToValidate = form.querySelectorAll('[data-validate]');
    fieldsToValidate.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        showNotification('Please fix the errors before submitting.', 'error');
        return;
    }
    
    try {
        // Show loading state
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <div class="spinner"></div>
        `;
        submitBtn.disabled = true;
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            phone: formData.get('phone').trim(),
            email: formData.get('email').trim(),
            interest: formData.get('interest'),
            message: formData.get('message').trim(),
            timestamp: new Date().toISOString(),
            source: 'contact-form'
        };
        
        // Submit to API
        const response = await submitToAPI(data);
        
        if (response.success) {
            showNotification(
                `Thank you ${data.name}! Your message has been received. Reference: ${response.reference}. We'll contact you within ${response.estimatedResponse}.`,
                'success'
            );
            
            // Save to localStorage for tracking
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push({
                ...data,
                reference: response.reference,
                submittedAt: new Date().toISOString()
            });
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
            
            // Reset form
            form.reset();
            updateFormProgress();
            
            // Optional: Redirect to WhatsApp after successful submission
            setTimeout(() => {
                if (confirm('Would you like to continue the conversation on WhatsApp?')) {
                    const whatsappMessage = `Hi! I just submitted a contact form (Ref: ${response.reference}). I'm interested in ${data.interest || 'your services'}.`;
                    window.open(`https://wa.me/201285500002?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                }
            }, 2000);
            
        } else {
            throw new Error(response.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification(
            error.message || 'Something went wrong. Please try again or contact us directly via WhatsApp.',
            'error'
        );
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
    }
}

async function submitToAPI(formData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demonstration, simulate different responses
    const random = Math.random();
    
    if (random > 0.9) {
        // Simulate 10% failure rate
        throw new Error('Server temporarily unavailable. Please try again.');
    }
    
    // Simulate successful submission
    return {
        success: true,
        message: 'Form submitted successfully!',
        reference: 'REF-' + Date.now(),
        estimatedResponse: '2 hours'
    };
}

// === FAQ FUNCTIONALITY ===
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = element.querySelector('.faq-icon');
    
    faqItem.classList.toggle('active');
    
    if (faqItem.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '−';
    } else {
        answer.style.maxHeight = '0';
        icon.textContent = '+';
    }
}

function openMap() {
    window.open('https://maps.google.com/?q=St+Teseen+New+Cairo+Egypt', '_blank');
}

// === JOIN PAGE FUNCTIONALITY ===
function initJoinPage() {
    initPlanSelection();
    initJoinForm();
    setMinDate();
}

function initPlanSelection() {
    const planButtons = document.querySelectorAll('.plan-cta');
    const membershipSelect = document.getElementById('membershipPlan');
    
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            selectPlan(plan);
            scrollToForm();
        });
    });
    
    function selectPlan(plan) {
        if (membershipSelect) {
            membershipSelect.value = plan;
            
            // Highlight selected plan
            document.querySelectorAll('.plan-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const selectedCard = document.querySelector(`[data-plan="${plan}"]`).closest('.plan-card');
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
            
            showNotification(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan selected!`, 'success');
        }
    }
    
    function scrollToForm() {
        const formSection = document.querySelector('.membership-form-section');
        if (formSection) {
            formSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

function initJoinForm() {
    const form = document.getElementById('joinForm');
    if (!form) return;
    
    // Form validation
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.dataset.validate === 'name') {
                field.value = field.value.replace(/[0-9]/g, '');
                validateField(field);
            } else {
                clearFieldError(field);
            }
        });
    });
    
    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', formatPhoneNumber);
    }
    
    form.addEventListener('submit', handleJoinFormSubmit);
    
    // Billing type change handler
    const billingSelect = document.getElementById('billingType');
    if (billingSelect) {
        billingSelect.addEventListener('change', updatePlanPricing);
    }
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('201')) {
        value = '+' + value;
    } else if (value.startsWith('1') && value.length > 1) {
        value = '01' + value.substring(1);
    }
    
    e.target.value = value;
}

async function handleJoinFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    // Validate all required fields
    let isFormValid = true;
    const requiredFields = form.querySelectorAll('[data-validate]');
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    // Check terms agreement
    const termsCheckbox = form.querySelector('input[name="terms"]');
    if (!termsCheckbox.checked) {
        showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
        isFormValid = false;
    }
    
    if (!isFormValid) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <span>Processing...</span>
        <div class="spinner"></div>
    `;
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const joinData = Object.fromEntries(formData.entries());
        
        // Collect fitness goals
        const goalCheckboxes = form.querySelectorAll('input[name="goals[]"]:checked');
        joinData.goals = Array.from(goalCheckboxes).map(cb => cb.value);
        
        // Add timestamp and generate membership ID
        joinData.timestamp = new Date().toISOString();
        joinData.membershipId = 'RL' + Date.now().toString().slice(-8);
        
        // Simulate API call
        await simulateJoinAPI(joinData);
        
        // Store membership data
        localStorage.setItem('pendingMembership', JSON.stringify(joinData));
        
        // Show success message
        showJoinSuccess(joinData);
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.error('Join form submission error:', error);
        showNotification('Something went wrong. Please try again.', 'error');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function simulateJoinAPI(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure (90% success rate)
    if (Math.random() < 0.1) {
        throw new Error('API Error');
    }
    
    // Log to console (in real app, this would be an API call)
    console.log('Membership application submitted:', data);
    
    return {
        success: true,
        membershipId: data.membershipId,
        message: 'Application submitted successfully'
    };
}

function showJoinSuccess(data) {
            const isDarkMode = document.body.classList.contains('dark-home');
        const successHTML = `
            <div class="join-success-overlay">
                <div class="join-success-modal ${isDarkMode ? 'dark' : 'light'}">
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <h2>Welcome to RedefineLab!</h2>
                    <p>Your membership application has been submitted successfully.</p>
                    
                    <div class="success-details">
                        <div class="detail-item">
                            <strong>Membership ID:</strong> ${data.membershipId}
                        </div>
                        <div class="detail-item">
                            <strong>Selected Plan:</strong> ${data.membershipPlan.charAt(0).toUpperCase() + data.membershipPlan.slice(1)}
                        </div>
                        <div class="detail-item">
                            <strong>Next Steps:</strong> We'll contact you within 24 hours
                        </div>
                    </div>
                    
                    <div class="success-actions">
                        <button class="whatsapp-btn" onclick="sendWhatsAppConfirmation('${data.membershipId}', '${data.membershipPlan}')">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z" fill="currentColor"/>
                            </svg>
                            Chat on WhatsApp
                        </button>
                        <button class="close-success-btn" onclick="closeSuccessModal()">
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </div>
        `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
    
    // Add styles
            const style = document.createElement('style');
        style.textContent = `
            .join-success-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .join-success-modal {
                border: 2px solid #ff7a1a;
                border-radius: 20px;
                padding: 3rem 2rem;
                text-align: center;
                max-width: 500px;
                margin: 1rem;
                box-shadow: 0 20px 60px rgba(255, 122, 26, 0.3);
            }
            
            .join-success-modal.dark {
                background: rgba(20, 20, 22, 0.95);
            }
            
            .join-success-modal.light {
                background: rgba(255, 255, 255, 0.95);
            }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff7a1a, #ff5722);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            box-shadow: 0 8px 25px rgba(255, 122, 26, 0.4);
        }
        
        .success-icon svg {
            width: 40px;
            height: 40px;
            color: #fff;
        }
        
                    .join-success-modal.dark h2 {
                color: #fff;
            }
            
            .join-success-modal.light h2 {
                color: #222;
            }
            
            .join-success-modal h2 {
                font-size: 2rem;
                font-weight: 900;
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .join-success-modal.dark p {
                color: #b0b0b0;
            }
            
            .join-success-modal.light p {
                color: #666;
            }
            
            .join-success-modal p {
                font-size: 1.1rem;
                margin-bottom: 2rem;
                line-height: 1.6;
            }
        
        .success-details {
            background: rgba(255, 122, 26, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            text-align: left;
        }
        
                    .join-success-modal.dark .detail-item {
                color: #e0e0e0;
            }
            
            .join-success-modal.light .detail-item {
                color: #555;
            }
            
            .detail-item {
                margin-bottom: 0.75rem;
                font-size: 0.95rem;
            }
        
        .detail-item strong {
            color: #ff7a1a;
            font-weight: 700;
        }
        
        .success-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .whatsapp-btn, .close-success-btn {
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 700;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
        }
        
        .whatsapp-btn {
            background: #25D366;
            color: #fff;
        }
        
        .whatsapp-btn:hover {
            background: #128C7E;
            transform: translateY(-2px);
        }
        
        .whatsapp-btn svg {
            width: 20px;
            height: 20px;
        }
        
        .close-success-btn {
            background: rgba(255, 122, 26, 0.1);
            border: 2px solid #ff7a1a;
            color: #ff7a1a;
        }
        
        .close-success-btn:hover {
            background: #ff7a1a;
            color: #fff;
            transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

function sendWhatsAppConfirmation(membershipId, plan) {
    const message = `Hi RedefineLab! 🏋️‍♂️

I just submitted my membership application and wanted to confirm:

📋 Membership ID: ${membershipId}
💪 Selected Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}

Looking forward to starting my fitness journey with you! When can I schedule my first visit?

Thanks!`;

    const phoneNumber = '201285500002';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

function closeSuccessModal() {
    const overlay = document.querySelector('.join-success-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }
}

function setMinDate() {
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        startDateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Set default to next Monday
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
        startDateInput.value = nextMonday.toISOString().split('T')[0];
    }
}

function updatePlanPricing() {
    const billingType = document.getElementById('billingType').value;
    const planCards = document.querySelectorAll('.plan-card');
    
    const prices = {
        starter: { monthly: 29, annual: 290 },
        premium: { monthly: 59, annual: 590 },
        elite: { monthly: 99, annual: 990 }
    };
    
    planCards.forEach(card => {
        const planButton = card.querySelector('.plan-cta');
        const plan = planButton.getAttribute('data-plan');
        const priceElement = card.querySelector('.price');
        const periodElement = card.querySelector('.period');
        
        if (billingType === 'annual') {
            priceElement.textContent = `$${prices[plan].annual}`;
            periodElement.textContent = '/year';
            
            // Add savings badge if not exists
            if (!card.querySelector('.savings-badge')) {
                const savingsBadge = document.createElement('div');
                savingsBadge.className = 'savings-badge';
                savingsBadge.innerHTML = '2 Months FREE!';
                savingsBadge.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #28a745;
                    color: #fff;
                    padding: 0.3rem 0.8rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                `;
                card.appendChild(savingsBadge);
            }
        } else {
            priceElement.textContent = `$${prices[plan].monthly}`;
            periodElement.textContent = '/month';
            
            // Remove savings badge
            const savingsBadge = card.querySelector('.savings-badge');
            if (savingsBadge) {
                savingsBadge.remove();
            }
        }
    });
}

// === NAME INPUT VALIDATION ===
function initializeNameValidation() {
    // Prevent numbers in name inputs across all pages
    const nameInputs = document.querySelectorAll('input[data-validate="name"]');
    nameInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[0-9]/g, '');
        });
    });
}

// === REVIEWS FUNCTIONALITY ===
function initializeReviewsSection() {
    // Animate reviews on scroll
    animateReviewsOnScroll();
}

function animateReviewsOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe review cards for animation
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Animate stats numbers
    const statsNumbers = document.querySelectorAll('.stat-number, .rating-number');
    statsNumbers.forEach(stat => {
        observer.observe(stat);
        stat.addEventListener('transitionend', () => {
            if (stat.style.opacity === '1') {
                animateNumber(stat);
            }
        });
    });
}

function animateNumber(element) {
    const finalNumber = element.textContent;
    const isDecimal = finalNumber.includes('.');
    const hasPlus = finalNumber.includes('+');
    const hasPercent = finalNumber.includes('%');
    const hasK = finalNumber.includes('k');
    
    let numericValue = parseFloat(finalNumber.replace(/[^0-9.]/g, ''));
    let currentNumber = 0;
    const increment = numericValue / 30; // 30 steps
    
    element.textContent = '0';
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= numericValue) {
            currentNumber = numericValue;
            clearInterval(timer);
        }
        
        let displayNumber = isDecimal ? currentNumber.toFixed(1) : Math.floor(currentNumber);
        
        if (hasK) displayNumber += 'k';
        if (hasPlus) displayNumber += '+';
        if (hasPercent) displayNumber += '%';
        
        element.textContent = displayNumber;
    }, 50);
}

// === MAIN INITIALIZATION ===
window.addEventListener('DOMContentLoaded', () => {
    // Create global header and footer
    createGlobalHeader();
    createGlobalFooter();
    
    // Initialize navigation and theme
    initializeNavigation();
    
    // Initialize contact form if on contact page
    initializeContactForm();
    
    // Initialize join page if on join page
    if (document.body.getAttribute('data-page') === 'join') {
        initJoinPage();
    }
    
    // Initialize reviews section if on home page
    if (document.getElementById('reviews')) {
        initializeReviewsSection();
    }
    
    // Initialize name validation for all name inputs
    initializeNameValidation();
    
    // Load responsive navigation
    const navScript = document.createElement('script');
    navScript.src = '/js/responsive-nav.js';
    navScript.async = true;
    document.head.appendChild(navScript);
    
    // Load enhanced forms
    const formsScript = document.createElement('script');
    formsScript.src = '/js/enhanced-forms.js';
    formsScript.async = true;
    document.head.appendChild(formsScript);
}); 