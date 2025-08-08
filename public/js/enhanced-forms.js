// === ENHANCED RESPONSIVE FORMS ===

class EnhancedForms {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormEnhancements();
        this.setupAccessibility();
        this.setupMobileOptimizations();
    }

    setupFormEnhancements() {
        // Enhanced input focus states
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Add floating labels effect
            this.setupFloatingLabel(input);
            
            // Enhanced validation feedback
            this.setupValidationFeedback(input);
            
            // Mobile-friendly input behavior
            this.setupMobileInputBehavior(input);
        });

        // Setup form submission enhancements
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.setupFormSubmission(form);
        });
    }

    setupFloatingLabel(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        const label = formGroup.querySelector('label');
        if (!label) return;

        // Create floating label container
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-label-container';
        
        // Wrap input and label
        input.parentNode.insertBefore(floatingContainer, input);
        floatingContainer.appendChild(input);
        floatingContainer.appendChild(label);

        // Handle focus/blur states
        const updateLabelState = () => {
            if (input.value || input === document.activeElement) {
                label.classList.add('floating');
            } else {
                label.classList.remove('floating');
            }
        };

        input.addEventListener('focus', updateLabelState);
        input.addEventListener('blur', updateLabelState);
        input.addEventListener('input', updateLabelState);
        
        // Initial state
        updateLabelState();
    }

    setupValidationFeedback(input) {
        // Real-time validation feedback
        input.addEventListener('input', () => {
            this.validateInput(input);
        });

        input.addEventListener('blur', () => {
            this.validateInput(input);
        });
    }

    validateInput(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        // Remove previous validation states
        formGroup.classList.remove('valid', 'invalid');
        input.classList.remove('valid', 'invalid');

        // Get validation rules
        const isRequired = input.hasAttribute('required');
        const minLength = input.getAttribute('minlength');
        const maxLength = input.getAttribute('maxlength');
        const pattern = input.getAttribute('pattern');
        const type = input.type;

        let isValid = true;
        let errorMessage = '';

        // Required check
        if (isRequired && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Type-specific validation
        else if (input.value) {
            switch (type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
                case 'password':
                    if (minLength && input.value.length < parseInt(minLength)) {
                        isValid = false;
                        errorMessage = `Password must be at least ${minLength} characters`;
                    }
                    break;
            }

            // Pattern validation
            if (pattern && !new RegExp(pattern).test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid format';
            }

            // Length validation
            if (minLength && input.value.length < parseInt(minLength)) {
                isValid = false;
                errorMessage = `Must be at least ${minLength} characters`;
            }
            if (maxLength && input.value.length > parseInt(maxLength)) {
                isValid = false;
                errorMessage = `Must be no more than ${maxLength} characters`;
            }
        }

        // Apply validation state
        if (input.value) {
            if (isValid) {
                formGroup.classList.add('valid');
                input.classList.add('valid');
                this.showValidationMessage(formGroup, '✓ Looks good!', 'success');
            } else {
                formGroup.classList.add('invalid');
                input.classList.add('invalid');
                this.showValidationMessage(formGroup, errorMessage, 'error');
            }
        } else {
            this.hideValidationMessage(formGroup);
        }

        return isValid;
    }

    showValidationMessage(formGroup, message, type) {
        let feedback = formGroup.querySelector('.enhanced-validation-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'enhanced-validation-feedback';
            formGroup.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.className = `enhanced-validation-feedback ${type}`;
        feedback.style.display = 'block';
    }

    hideValidationMessage(formGroup) {
        const feedback = formGroup.querySelector('.enhanced-validation-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    setupMobileInputBehavior(input) {
        // Auto-capitalize for name fields
        if (input.name && (input.name.includes('name') || input.name.includes('Name'))) {
            input.style.textTransform = 'capitalize';
        }

        // Format phone numbers
        if (input.type === 'tel') {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                } else if (value.length >= 3) {
                    value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                }
                e.target.value = value;
            });
        }

        // Enhanced number inputs for mobile
        if (input.type === 'number') {
            input.addEventListener('focus', () => {
                input.setAttribute('inputmode', 'numeric');
            });
        }
    }

    setupAccessibility() {
        // Enhanced keyboard navigation
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                // Skip navigation for form elements in focus
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    return;
                }

                if (e.key === 'Tab') {
                    // Enhanced tab navigation feedback
                    element.classList.add('keyboard-focus');
                    setTimeout(() => {
                        element.classList.remove('keyboard-focus');
                    }, 2000);
                }
            });
        });

        // Screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-announcements';
        document.body.appendChild(liveRegion);

        // Announce form submission status
        window.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 3000);
        };
    }

    setupFormSubmission(form) {
        form.addEventListener('submit', (e) => {
            // Validate all inputs before submission
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let allValid = true;
            let firstInvalidInput = null;

            inputs.forEach(input => {
                const isValid = this.validateInput(input);
                if (!isValid) {
                    allValid = false;
                    if (!firstInvalidInput) {
                        firstInvalidInput = input;
                    }
                }
            });

            if (!allValid) {
                e.preventDefault();
                
                // Focus on first invalid input
                if (firstInvalidInput) {
                    firstInvalidInput.focus();
                    firstInvalidInput.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }

                // Announce to screen readers
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Please fix the errors in the form before submitting.');
                }

                return false;
            }

            // Show loading state
            this.showFormLoadingState(form);
        });
    }

    showFormLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent || submitBtn.value;
            submitBtn.disabled = true;
            
            if (submitBtn.tagName === 'BUTTON') {
                submitBtn.innerHTML = `
                    <span class="loading-spinner"></span>
                    <span>Processing...</span>
                `;
            } else {
                submitBtn.value = 'Processing...';
            }

            // Store original text for restoration
            submitBtn.dataset.originalText = originalText;
        }
    }

    setupMobileOptimizations() {
        // Optimize viewport for form inputs on iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.addEventListener('focusin', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    // Prevent zoom on iOS
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
                        );
                    }
                }
            });

            document.addEventListener('focusout', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    // Restore normal viewport
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1.0'
                        );
                    }
                }
            });
        }

        // Enhanced touch targets
        const buttons = document.querySelectorAll('button, .btn, .cta-main, .cta-secondary');
        buttons.forEach(button => {
            if (window.innerWidth <= 768) {
                const rect = button.getBoundingClientRect();
                if (rect.height < 48) {
                    button.style.minHeight = '48px';
                    button.style.padding = '12px 24px';
                }
            }
        });
    }
}

// Initialize enhanced forms
document.addEventListener('DOMContentLoaded', function() {
    window.enhancedForms = new EnhancedForms();
});

// Export for global use
window.EnhancedForms = EnhancedForms;