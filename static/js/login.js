// login.js - Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
    setupPasswordToggle();
});

// Setup login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        // Form will submit to Django backend
        // Client-side validation
        
        const email = document.querySelector('input[name="email"]').value;
        const password = document.querySelector('input[name="password"]').value;
        
        if (!validateEmail(email)) {
            e.preventDefault();
            showToast('Please enter a valid email address', 'danger');
            return false;
        }
        
        if (password.length === 0) {
            e.preventDefault();
            showToast('Please enter your password', 'danger');
            return false;
        }
        
        // Show loading while form submits
        showLoading();
    });
}

// Setup password toggle visibility
function setupPasswordToggle() {
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (passwordInput) {
        // Add toggle button if not exists
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-outline-secondary';
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
        
        // Check if input is in input-group
        const inputGroup = passwordInput.parentElement;
        if (inputGroup && inputGroup.classList.contains('input-group')) {
            inputGroup.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                
                const icon = this.querySelector('i');
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            });
        }
    }
}

// Forgot password handler
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('a[href="#"]');
    
    if (forgotPasswordLink && forgotPasswordLink.textContent.includes('Forgot')) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});

function handleForgotPassword() {
    const email = prompt('Please enter your email address:');
    
    if (!email) return;
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'danger');
        return;
    }
    
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        showToast('Password reset link sent to your email!', 'success');
    }, 1500);
}

console.log('Login JS loaded successfully');