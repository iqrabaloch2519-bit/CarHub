// signup.js - Signup Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupSignupForm();
    setupPasswordToggle();
    setupCNICFormatting();
    setupRealTimeValidation();
});

// Setup signup form submission
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        // Form will submit to Django backend
        // Client-side validation happens here
        
        const password = document.querySelector('input[name="password1"]').value;
        const confirmPassword = document.querySelector('input[name="password2"]').value;
        
        if (password !== confirmPassword) {
            e.preventDefault();
            showToast('Passwords do not match', 'danger');
            return false;
        }
        
        if (password.length < 8) {
            e.preventDefault();
            showToast('Password must be at least 8 characters', 'danger');
            return false;
        }
        
        // Show loading while form submits
        showLoading();
    });
}

// Setup password toggle visibility
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            
            const icon = this.querySelector('i');
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    });
}

// Setup CNIC auto-formatting (12345-1234567-1)
function setupCNICFormatting() {
    const cnicInput = document.querySelector('input[name="cnic"]');
    
    if (cnicInput) {
        cnicInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 13) {
                value = value.substr(0, 13);
            }
            
            if (value.length > 5) {
                value = value.substr(0, 5) + '-' + value.substr(5);
            }
            
            if (value.length > 13) {
                value = value.substr(0, 13) + '-' + value.substr(13);
            }
            
            e.target.value = value;
        });
    }
}

// Real-time form validation
function setupRealTimeValidation() {
    // Email validation
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // Phone validation
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // Password match validation
    const password1 = document.querySelector('input[name="password1"]');
    const password2 = document.querySelector('input[name="password2"]');
    
    if (password2) {
        password2.addEventListener('input', function() {
            if (password1 && this.value !== password1.value && this.value.length > 0) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value === password1.value && this.value.length > 0) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    }
}

console.log('Signup JS loaded successfully');