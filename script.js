
const RATE_LIMIT = {
    MAX_REQUESTS: 10,
    TIME_WINDOW: 60000 // 1 minute in milliseconds
};

let requestCount = parseInt(localStorage.getItem('qrRequestCount')) || 0;
let lastRequestTime = parseInt(localStorage.getItem('qrLastRequestTime')) || Date.now();

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function validateInput(input) {
    // Basic validation
    if (!input) {
        showError('Please enter text or URL');
        return false;
    }
    
    // Length validation
    if (input.length > 500) {
        showError('Input too long (max 500 characters)');
        return false;
    }
    
    // URL validation if input starts with http
    if (input.startsWith('http')) {
        try {
            new URL(input);
        } catch {
            showError('Invalid URL format');
            return false;
        }
    }
    
    return true;
}

function checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now - lastRequestTime > RATE_LIMIT.TIME_WINDOW) {
        requestCount = 0;
        lastRequestTime = now;
    }
    
    if (requestCount >= RATE_LIMIT.MAX_REQUESTS) {
        const cooldown = Math.ceil((RATE_LIMIT.TIME_WINDOW - (now - lastRequestTime)) / 1000);
        showError(`Too many requests. Please wait ${cooldown} seconds`);
        return false;
    }
    
    
    requestCount++;
    localStorage.setItem('qrRequestCount', requestCount);
    localStorage.setItem('qrLastRequestTime', lastRequestTime);
    return true;
}

function generateQR() {
    try {
        const input = document.getElementById('qr-input').value.trim();
        const output = document.getElementById('qr-output');
        const generateBtn = document.getElementById('generate-btn');
        
        // Clear previous output
        output.innerHTML = '';
        
        // Validate rate limit
        if (!checkRateLimit()) {
            generateBtn.classList.add('disabled');
            setTimeout(() => generateBtn.classList.remove('disabled'), RATE_LIMIT.TIME_WINDOW);
            return;
        }
        
        // Validate input
        if (!validateInput(input)) return;
        
        // Generate QR code
        new QRCode(output, {
            text: input,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.H
        });
        
    } catch (error) {
        showError('An unexpected error occurred');
        console.error('QR Generation Error:', error);
    }
}

// Add window load listener to reset UI state
window.addEventListener('load', () => {
    if (requestCount >= RATE_LIMIT.MAX_REQUESTS) {
        const btn = document.getElementById('generate-btn');
        btn.classList.add('disabled');
    }
});