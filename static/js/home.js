document.addEventListener('DOMContentLoaded', function() {
    console.log('Home page loaded - using Django template data');
    
    // Setup search form
    setupSearchForm();
    
    // Check if search was performed and show message
    checkSearchResults();
    
    // DO NOT render cars from JS - let Django template handle it
});

// Format price in PKR
function formatPrice(price) {
    return 'Rs ' + price.toLocaleString('en-PK');
}

// View car details
function viewCarDetails(carId) {
    showToast('Viewing car details...', 'info');
    window.location.href = `/products/${carId}/`;
}

// Check if search was performed and show success message
function checkSearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand');
    const year = urlParams.get('year');
    const priceRange = urlParams.get('price_range');
    
    // If any search parameter exists, show success message
    if (brand || year || priceRange) {
        showSearchSuccessMessage(brand, year, priceRange);
    }
}

// Show search success message on page
function showSearchSuccessMessage(brand, year, priceRange) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-success alert-dismissible fade show fixed-top m-3';
    messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    
    let filters = [];
    if (brand && brand !== 'Select Brand') filters.push(`Brand: ${brand.toUpperCase()}`);
    if (year && year !== 'Select Model Year') filters.push(`Year: ${year}`);
    if (priceRange && priceRange !== 'Price Range') {
        let priceText = priceRange;
        if (priceRange === '0-1000000') priceText = 'Under 10 Lakh';
        else if (priceRange === '1000000-2000000') priceText = '10-20 Lakh';
        else if (priceRange === '2000000-5000000') priceText = '20-50 Lakh';
        else if (priceRange === '5000000+') priceText = 'Above 50 Lakh';
        filters.push(`Price: ${priceText}`);
    }
    
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2 text-success" style="font-size: 24px;"></i>
            <div>
                <strong>Search Successful! ✓</strong><br>
                <small>${filters.join(' | ')}</small>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Setup search form - FIXED VERSION
function setupSearchForm() {
    const searchForm = document.getElementById('searchForm');
    
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        // DON'T prevent default - let form submit naturally to Django!
        
        const formData = new FormData(searchForm);
        const brand = formData.get('brand');
        const year = formData.get('year');
        const priceRange = formData.get('price_range');
        
        // Validate - at least one field should be selected
        if (brand === 'Select Brand' && year === 'Select Model Year' && priceRange === 'Price Range') {
            e.preventDefault(); // Only prevent if validation fails
            showErrorMessage('Please select at least one search filter!');
            return false;
        }
        
        // Show loading state on button
        const submitBtn = searchForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Searching...';
        }
        
        // Form will submit naturally to action="{% url 'home' %}"
    });
}

// Show error message
function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-warning alert-dismissible fade show';
    messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill me-2 text-warning" style="font-size: 24px;"></i>
            <div>
                <strong>Warning!</strong><br>
                <small>${message}</small>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

// Toast notification function (fallback)
function showToast(message, type = 'info') {
    // Check if global toast function exists
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback to console
    console.log(`[${type.toUpperCase()}] ${message}`);
}