document.addEventListener('DOMContentLoaded', function() {
    const newsForm = document.getElementById('newsForm');
    const newsText = document.getElementById('newsText');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const result = document.getElementById('result');

    newsForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const text = newsText.value.trim();

        // Validation
        if (!text) {
            showError('Please enter some text to analyze');
            return;
        }

        // Hide previous results and errors
        hideError();
        hideResult();

        // Show loading
        loading.style.display = 'block';

        try {
            // Get CSRF token
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Create FormData (matching Django view expectation)
            const formData = new FormData();
            formData.append('news_text', text);

            // Send request to backend
            const response = await fetch('/analyze/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: formData
            });

            const data = await response.json();

            // Hide loading
            loading.style.display = 'none';

            if (data.success) {
                // Show results
                displayResult(data);
            } else {
                showError(data.error || 'An error occurred during analysis');
            }

        } catch (err) {
            loading.style.display = 'none';
            showError('Network error: Could not connect to server. Please try again.');
            console.error('Error:', err);
        }
    });

    function displayResult(data) {
        const predictionLabel = document.getElementById('predictionLabel');
        const confidence = document.getElementById('confidence');
        const fakeProb = document.getElementById('fakeProb');
        const realProb = document.getElementById('realProb');

        // Set prediction label with icon (matching your view's response)
        if (data.is_fake || data.prediction.toLowerCase().includes('fake')) {
            predictionLabel.innerHTML = '<i class="bi bi-x-circle-fill text-danger me-2"></i>FAKE NEWS';
            predictionLabel.className = 'display-6 fw-bold mb-3 text-danger';
        } else {
            predictionLabel.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>REAL NEWS';
            predictionLabel.className = 'display-6 fw-bold mb-3 text-success';
        }

        // Set probabilities
        confidence.textContent = data.confidence;
        fakeProb.textContent = data.fake_probability;
        realProb.textContent = data.real_probability;

        // Show result card with animation
        result.style.display = 'block';
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showError(message) {
        errorMessage.textContent = message;
        error.style.display = 'block';
        error.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
        error.style.display = 'none';
    }

    function hideResult() {
        result.style.display = 'none';
    }
});