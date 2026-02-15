// contact.js - Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupContactForm();
    setupRealTimeValidation();
});

// Setup contact form submission
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        // Form will submit to Django backend
        // Client-side validation
        
        const firstName = document.querySelector('input[name="first_name"]').value.trim();
        const lastName = document.querySelector('input[name="last_name"]').value.trim();
        const email = document.querySelector('input[name="email"]').value.trim();
        const message = document.querySelector('textarea[name="message"]').value.trim();
        
        // Validate first name
        if (firstName.length < 2) {
            e.preventDefault();
            showToast('Please enter a valid first name', 'danger');
            return false;
        }
        
        // Validate last name
        if (lastName.length < 2) {
            e.preventDefault();
            showToast('Please enter a valid last name', 'danger');
            return false;
        }
        
        // Validate email
        if (!validateEmail(email)) {
            e.preventDefault();
            showToast('Please enter a valid email address', 'danger');
            return false;
        }
        
        // Validate message
        if (message.length < 10) {
            e.preventDefault();
            showToast('Message must be at least 10 characters', 'danger');
            return false;
        }
        
        // Show loading while form submits
        showLoading();
    });
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
    
    // Message character count
    const messageInput = document.querySelector('textarea[name="message"]');
    if (messageInput) {
        const charCounter = document.createElement('small');
        charCounter.className = 'text-muted mt-1';
        messageInput.parentNode.appendChild(charCounter);
        
        messageInput.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length} characters`;
            
            if (length < 10) {
                charCounter.classList.add('text-danger');
                charCounter.classList.remove('text-success');
            } else {
                charCounter.classList.add('text-success');
                charCounter.classList.remove('text-danger');
            }
        });
    }
}

console.log('Contact JS loaded successfully');