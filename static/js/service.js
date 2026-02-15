// service.js - Services Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupServiceButtons();
    animateElements();
    handleDjangoMessages();
});

// FIXED: Better button selection
function setupServiceButtons() {
    // Get all buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        const buttonText = button.textContent.trim();
        
        // Browse Cars button
        if (buttonText.includes('Browse')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showToast('Redirecting to car listings...', 'info');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            });
        }
        
        // List Your Car button
        if (buttonText.includes('List Your Car')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showListCarModal();
            });
        }
        
        // Value My Car button 
        if (buttonText.includes('Value My Car')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(' Value My Car clicked!');
                showCarValuationModal();
            });
        }
    });
}

// Handle Django Messages
function handleDjangoMessages() {
    const alerts = document.querySelectorAll('.alert');
    
    if (alerts.length > 0) {
        console.log(' Django Messages found:', alerts.length);
        
        setTimeout(() => {
            alerts.forEach(alert => {
                try {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                } catch (error) {
                    alert.style.opacity = '0';
                    alert.style.transition = 'opacity 0.3s';
                    setTimeout(() => alert.remove(), 300);
                }
            });
        }, 4000);
    }
}

// Show list car modal
function showListCarModal() {
    showToast('Please login or signup to list your car', 'info');
    setTimeout(() => {
        window.location.href = '/signup/';
    }, 1500);
}

//  Show car valuation modal 
function showCarValuationModal() {
    console.log('Opening Car Valuation Modal...');
    
    const modalHTML = `
        <div class="modal fade" id="valuationModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title"><i class="bi bi-calculator me-2"></i>Car Valuation</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="valuationForm">
                            <div class="mb-3">
                                <label class="form-label">Car Brand</label>
                                <select class="form-select" id="valBrand" required>
                                    <option value="">Select Brand</option>
                                    <option value="toyota">Toyota</option>
                                    <option value="honda">Honda</option>
                                    <option value="suzuki">Suzuki</option>
                                    <option value="bmw">BMW</option>
                                    <option value="mercedes">Mercedes</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Model Year</label>
                                <input type="number" class="form-control" id="valYear" min="2000" max="2025" required placeholder="e.g., 2020">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Mileage (km)</label>
                                <input type="number" class="form-control" id="valMileage" required placeholder="e.g., 50000">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Condition</label>
                                <select class="form-select" id="valCondition" required>
                                    <option value="">Select Condition</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                        </form>
                        <div id="valuationResult" class="d-none">
                            <div class="alert alert-success">
                                <h5>Estimated Value</h5>
                                <h3 class="text-success" id="estimatedValue">Rs 0</h3>
                                <p class="mb-0 small">This is an estimated value based on market trends</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-info" id="calculateBtn">
                            <i class="bi bi-calculator me-2"></i>Calculate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('valuationModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('valuationModal'));
    modal.show();
    
    // Add calculate button event listener
    document.getElementById('calculateBtn').addEventListener('click', calculateValuation);
}

// Calculate car valuation
function calculateValuation() {
    const brand = document.getElementById('valBrand').value;
    const year = parseInt(document.getElementById('valYear').value);
    const mileage = parseInt(document.getElementById('valMileage').value);
    const condition = document.getElementById('valCondition').value;
    
    console.log('Calculating valuation...', { brand, year, mileage, condition });
    
    if (!brand || !year || !mileage || !condition) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        
        // Simple valuation logic
        let basePrice = 3000000;
        
        // Brand pricing
        const brandPrices = {
            'toyota': 3500000,
            'honda': 4000000,
            'suzuki': 2500000,
            'bmw': 8000000,
            'mercedes': 9000000
        };
        
        basePrice = brandPrices[brand] || 3000000;
        
        // Depreciation based on age
        const age = 2025 - year;
        basePrice -= age * 200000;
        
        // Mileage adjustment
        if (mileage > 100000) {
            basePrice -= 500000;
        } else if (mileage > 50000) {
            basePrice -= 250000;
        }
        
        // Condition multiplier
        const conditionMultiplier = {
            'excellent': 1.1,
            'good': 1.0,
            'fair': 0.85,
            'poor': 0.7
        };
        
        basePrice *= conditionMultiplier[condition];
        
        // Ensure positive value
        basePrice = Math.max(basePrice, 500000);
        
        // Display result
        document.getElementById('estimatedValue').textContent = 
            'Rs ' + Math.round(basePrice).toLocaleString('en-PK');
        document.getElementById('valuationResult').classList.remove('d-none');
        
        console.log('Valuation calculated:', basePrice);
        showToast('Valuation calculated successfully!', 'success');
    }, 1500);
}

// Animate elements on scroll
function animateElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    const elements = document.querySelectorAll('.service-card, .step-number');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Utility: Show toast notification
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Utility: Show loading
function showLoading() {
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
    }
}

// Utility: Hide loading
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

console.log(' Service JS loaded successfully');