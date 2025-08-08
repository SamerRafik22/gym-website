// AJAX Validation for Registration Form
class FormValidator {
    constructor(formId = 'joinForm') {
        this.formId = formId;
        this.debounceTimers = {};
        this.validationStates = {
            username: { isValid: false, message: '' },
            email: { isValid: false, message: '' },
            phone: { isValid: false, message: '' }
        };
        
        this.init();
    }

    init() {
        // Get form elements
        this.usernameInput = document.getElementById('username');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        
        // Get submit button
        this.submitBtn = document.querySelector('#joinForm .submit-btn');
        
        // Get feedback elements
        this.usernameFeedback = document.getElementById('username-feedback');
        this.emailFeedback = document.getElementById('email-feedback');
        this.phoneFeedback = document.getElementById('phone-feedback');

        if (this.usernameInput && this.emailInput && this.phoneInput) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Username validation
        this.usernameInput.addEventListener('input', (e) => {
            this.debounceValidation('username', () => this.validateUsername(e.target.value));
        });

        this.usernameInput.addEventListener('blur', (e) => {
            this.validateUsername(e.target.value);
        });

        // Email validation
        this.emailInput.addEventListener('input', (e) => {
            this.debounceValidation('email', () => this.validateEmail(e.target.value));
        });

        this.emailInput.addEventListener('blur', (e) => {
            this.validateEmail(e.target.value);
        });

        // Phone validation
        this.phoneInput.addEventListener('input', (e) => {
            this.debounceValidation('phone', () => this.validatePhone(e.target.value));
        });

        this.phoneInput.addEventListener('blur', (e) => {
            this.validatePhone(e.target.value);
        });

        // Form submission
        const form = document.getElementById(this.formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                if (!this.isFormValid()) {
                    e.preventDefault();
                    this.showFormErrors();
                }
            });
        }
    }

    debounceValidation(field, validationFunction) {
        // Clear existing timer
        if (this.debounceTimers[field]) {
            clearTimeout(this.debounceTimers[field]);
        }

        // Set new timer
        this.debounceTimers[field] = setTimeout(() => {
            validationFunction();
        }, 500); // 500ms delay
    }

    async validateUsername(username) {
        if (!username || username.trim().length < 3) {
            this.showFieldError('username', 'Username must be at least 3 characters long');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showFieldError('username', 'Username can only contain letters, numbers, and underscores');
            return;
        }

        try {
            const response = await fetch(`/auth/check-username/${encodeURIComponent(username.trim())}`);
            const data = await response.json();

            if (data.success) {
                if (data.available) {
                    this.showFieldSuccess('username', data.message);
                } else {
                    this.showFieldError('username', data.message);
                }
            } else {
                this.showFieldError('username', data.message || 'Error checking username');
            }
        } catch (error) {
            console.error('Username validation error:', error);
            this.showFieldError('username', 'Error checking username availability');
        }
    }

    async validateEmail(email) {
        if (!email || !email.includes('@')) {
            this.showFieldError('email', 'Please enter a valid email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            return;
        }

        try {
            const response = await fetch(`/auth/check-email/${encodeURIComponent(email.trim())}`);
            const data = await response.json();

            if (data.success) {
                if (data.available) {
                    this.showFieldSuccess('email', data.message);
                } else {
                    this.showFieldError('email', data.message);
                }
            } else {
                this.showFieldError('email', data.message || 'Error checking email');
            }
        } catch (error) {
            console.error('Email validation error:', error);
            this.showFieldError('email', 'Error checking email availability');
        }
    }

    async validatePhone(phone) {
        if (!phone || phone.trim().length < 10) {
            this.showFieldError('phone', 'Please enter a valid phone number');
            return;
        }

        // Remove non-digit characters for validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            this.showFieldError('phone', 'Phone number must be at least 10 digits');
            return;
        }

        try {
            const response = await fetch(`/auth/check-phone/${encodeURIComponent(phone.trim())}`);
            const data = await response.json();

            if (data.success) {
                if (data.available) {
                    this.showFieldSuccess('phone', data.message);
                } else {
                    this.showFieldError('phone', data.message);
                }
            } else {
                this.showFieldError('phone', data.message || 'Error checking phone number');
            }
        } catch (error) {
            console.error('Phone validation error:', error);
            this.showFieldError('phone', 'Error checking phone number availability');
        }
    }

    showFieldError(field, message) {
        this.validationStates[field] = { isValid: false, message };
        
        const input = this[`${field}Input`];
        const feedback = this[`${field}Feedback`];
        
        if (input && feedback) {
            input.classList.remove('valid');
            input.classList.add('invalid');
            feedback.textContent = message;
            feedback.className = 'validation-feedback error';
        }
        
        this.updateSubmitButton();
    }

    showFieldSuccess(field, message) {
        this.validationStates[field] = { isValid: true, message };
        
        const input = this[`${field}Input`];
        const feedback = this[`${field}Feedback`];
        
        if (input && feedback) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            feedback.textContent = message;
            feedback.className = 'validation-feedback success';
        }
        
        this.updateSubmitButton();
    }

    isFormValid() {
        return Object.values(this.validationStates).every(state => state.isValid);
    }

    updateSubmitButton() {
        if (this.submitBtn) {
            this.submitBtn.disabled = !this.isFormValid();
        }
    }

    showFormErrors() {
        // Show error message to user
        alert('Please fix the validation errors before submitting the form.');
        
        // Focus on first invalid field
        for (const [field, state] of Object.entries(this.validationStates)) {
            if (!state.isValid) {
                const input = this[`${field}Input`];
                if (input) {
                    input.focus();
                    break;
                }
            }
        }
    }

    // Public method to reset validation states
    resetValidation() {
        this.validationStates = {
            username: { isValid: false, message: '' },
            email: { isValid: false, message: '' },
            phone: { isValid: false, message: '' }
        };

        // Clear feedback messages
        [this.usernameFeedback, this.emailFeedback, this.phoneFeedback].forEach(feedback => {
            if (feedback) {
                feedback.textContent = '';
                feedback.className = 'validation-feedback';
            }
        });

        // Remove validation classes
        [this.usernameInput, this.emailInput, this.phoneInput].forEach(input => {
            if (input) {
                input.classList.remove('valid', 'invalid');
            }
        });

        this.updateSubmitButton();
    }
}

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the join page
    if (document.getElementById('joinForm')) {
        window.joinFormValidator = new FormValidator('joinForm');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
} 