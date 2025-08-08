// Password validation
function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchFeedback = document.getElementById('passwordMatch');
    const mismatchFeedback = document.getElementById('passwordMismatch');
    
    // Hide both feedbacks initially
    matchFeedback.style.display = 'none';
    mismatchFeedback.style.display = 'none';
    
    // Only show feedback if both fields have values
    if (password && confirmPassword) {
        if (password === confirmPassword) {
            matchFeedback.style.display = 'flex';
            return true;
        } else {
            mismatchFeedback.style.display = 'flex';
            return false;
        }
    }
    return null; // No validation yet
}

// Show payment modal
function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    const formData = new FormData(document.getElementById('joinForm'));
    
    // Populate summary
    document.getElementById('summaryName').textContent = 
        formData.get('firstName') + ' ' + formData.get('lastName');
    document.getElementById('summaryEmail').textContent = formData.get('email');
    document.getElementById('summaryMembership').textContent = 
        getMembershipDisplayName(formData.get('membershipType'));
    document.getElementById('summaryBilling').textContent = 
        formData.get('billingType') === 'annual' ? 'Annual (2 months free)' : 'Monthly';
    
    // Calculate total
    const membershipPrice = getMembershipPrice(formData.get('membershipType'));
    const billingType = formData.get('billingType');
    const total = billingType === 'annual' ? membershipPrice * 10 : membershipPrice; // 10 months for annual
    document.getElementById('summaryTotal').textContent = '$' + total;
    
    modal.style.display = 'block';
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Process payment
async function processPayment() {
    const formData = new FormData(document.getElementById('joinForm'));
    const submitBtn = document.querySelector('.payment-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span>Processing...</span><div class="spinner"></div>';
    submitBtn.disabled = true;
    
    try {
        // Prepare registration data
        const registrationData = {
            name: formData.get('firstName') + ' ' + formData.get('lastName'),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            age: calculateAge(formData.get('dateOfBirth')),
            gender: formData.get('gender'),
            membershipType: formData.get('membershipType'),
            fitnessGoals: Array.from(document.querySelectorAll('input[name="fitnessGoals[]"]:checked')).map(cb => cb.value),
            medicalConditions: formData.get('medicalConditions') ? [formData.get('medicalConditions')] : [],
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode'),
            emergencyName: formData.get('emergencyName'),
            emergencyPhone: formData.get('emergencyPhone'),
            emergencyRelation: formData.get('emergencyRelation'),
            billingType: formData.get('billingType')
        };
        
        // Debug: Log the data being sent
        console.log('Registration data being sent:', registrationData);
        
        // Determine the correct API URL
        const apiUrl = window.location.protocol === 'file:' 
            ? 'http://localhost:3000/api/auth/register'
            : '/api/auth/register';
        
        console.log('Using API URL:', apiUrl);
        console.log('Current protocol:', window.location.protocol);
        
        // Register user
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            // Store token and user data
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            // Show success modal
            showSuccessModal(result.data.user);
        } else {
            console.error('Registration failed:', result);
            alert('Registration failed: ' + (result.message || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('Network error: Please check if the server is running on https://localhost:3000 or http://localhost:3000');
        } else {
            alert('Registration failed: ' + error.message);
        }
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show success modal
function showSuccessModal(user) {
    const modal = document.getElementById('successModal');
    
    // Populate success details
    document.getElementById('successMembershipId').textContent = user.id;
    document.getElementById('successStartDate').textContent = new Date().toLocaleDateString();
    
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    document.getElementById('successNextBilling').textContent = nextBilling.toLocaleDateString();
    
    // Hide payment modal and show success modal
    document.getElementById('paymentModal').style.display = 'none';
    modal.style.display = 'block';
}

// Go to dashboard
function goToDashboard() {
    // Check user role and redirect accordingly
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role === 'admin') {
        window.location.href = '/admin';
    } else {
        window.location.href = '/dashboard';
    }
}

// Helper functions
function getMembershipDisplayName(type) {
    const names = {
        'standard': 'Standard - $39/month',
        'premium': 'Premium - $59/month',
        'elite': 'Elite - $99/month'
    };
    return names[type] || type;
}

function getMembershipPrice(type) {
    const prices = {
        'standard': 39,
        'premium': 59,
        'elite': 99
    };
    return prices[type] || 0;
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 18; // Default age if no date provided
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return Math.max(16, Math.min(100, age)); // Ensure age is between 16-100
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for password validation
    document.getElementById('password').addEventListener('input', validatePasswords);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswords);
    
    // Form submission handler
    document.getElementById('joinForm').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Validate all required fields first
        const requiredFields = document.querySelectorAll('#joinForm [required]');
        let firstInvalidField = null;
        
        requiredFields.forEach(field => {
            if (!field.value.trim() && !firstInvalidField) {
                firstInvalidField = field;
            }
        });
        
        if (firstInvalidField) {
            alert('Please fill in all required fields.');
            // Smooth scroll to the first invalid field
            firstInvalidField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            setTimeout(() => firstInvalidField.focus(), 500);
            return;
        }
        
        // Validate passwords match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            // Smooth scroll to password section
            document.getElementById('confirmPassword').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            setTimeout(() => document.getElementById('confirmPassword').focus(), 500);
            return;
        }
        
        // All validation passed - show payment modal
        showPaymentModal();
    });
    
    // Payment button
    document.getElementById('paymentBtn').addEventListener('click', processPayment);
    
    // Close payment modal button
    document.getElementById('closePaymentBtn').addEventListener('click', closePaymentModal);
    
    // Dashboard button
    document.getElementById('dashboardBtn').addEventListener('click', goToDashboard);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const paymentModal = document.getElementById('paymentModal');
        const successModal = document.getElementById('successModal');
        
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}); 