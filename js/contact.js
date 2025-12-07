// ==========================================
// Contact Form Handler with API Integration
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        return;
    }
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            company: document.getElementById('company').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            country: document.getElementById('country').value,
            product_interest: document.getElementById('productInterest').value,
            message: document.getElementById('message').value.trim(),
            status: 'new',
            submitted_at: new Date().toISOString()
        };
        
        // Validate form
        if (!validateForm(formData)) {
            return;
        }
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoading = submitButton.querySelector('.btn-loading');
        
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        
        try {
            const webhookUrl = 'https://open.feishu.cn/open-apis/bot/v2/hook/42e83c54-6d7d-463f-80f3-726ec644c964';
            const text = [
                '【New Inquiry】',
                `Name: ${formData.name || '-'}`,
                `Email: ${formData.email || '-'}`,
                `Company: ${formData.company || '-'}`,
                `Phone: ${formData.phone || '-'}`,
                `Country: ${formData.country || '-'}`,
                `Product Interest: ${formData.product_interest || '-'}`,
                'Message:',
                formData.message || '-',
                `Submitted At: ${formData.submitted_at}`
            ].join('\n');

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msg_type: 'text',
                    content: { text }
                })
            });

            const result = await response.json().catch(() => ({}));
            const ok = response.ok && (result.StatusCode === undefined || result.StatusCode === 0);
            if (ok) {
                showFormMessage('success', 'Thank you for your inquiry! We will get back to you within 24 hours.');
                contactForm.reset();
            } else {
                throw new Error(result.Msg || 'Failed to submit form');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('error', 'Sorry, there was an error submitting your inquiry. Please try again or contact us directly via email.');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}

// ==========================================
// Form Validation
// ==========================================
function validateForm(data) {
    const errors = [];
    
    // Name validation
    if (!data.name || data.name.length < 2) {
        errors.push('Please enter a valid name');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Country validation
    if (!data.country) {
        errors.push('Please select your country');
    }
    
    // Message validation
    if (!data.message || data.message.length < 10) {
        errors.push('Please enter a message with at least 10 characters');
    }
    
    if (errors.length > 0) {
        showFormMessage('error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// ==========================================
// Show Form Message
// ==========================================
function showFormMessage(type, message) {
    const messageDiv = document.getElementById('formMessage');
    
    if (!messageDiv) {
        return;
    }
    
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = message;
    messageDiv.style.display = 'block';
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// ==========================================
// Input Formatting and Validation
// ==========================================

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        // Remove non-numeric characters except + and spaces
        let value = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
        e.target.value = value;
    });
}

// Email validation on blur
const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '';
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================
// Character Counter for Textarea (Optional)
// ==========================================
const messageTextarea = document.getElementById('message');
if (messageTextarea) {
    const maxLength = 1000;
    
    // Create counter element
    const counterDiv = document.createElement('div');
    counterDiv.style.textAlign = 'right';
    counterDiv.style.fontSize = '0.85rem';
    counterDiv.style.color = '#999';
    counterDiv.style.marginTop = '0.25rem';
    messageTextarea.parentElement.appendChild(counterDiv);
    
    function updateCounter() {
        const length = messageTextarea.value.length;
        counterDiv.textContent = `${length}/${maxLength} characters`;
        
        if (length > maxLength) {
            counterDiv.style.color = '#e74c3c';
            messageTextarea.value = messageTextarea.value.substring(0, maxLength);
        } else if (length > maxLength * 0.9) {
            counterDiv.style.color = '#f39c12';
        } else {
            counterDiv.style.color = '#999';
        }
    }
    
    messageTextarea.addEventListener('input', updateCounter);
    updateCounter();
}

// ==========================================
// Auto-save Form Data to LocalStorage (Optional)
// ==========================================
const STORAGE_KEY = 'xuanmeng_contact_form';

function saveFormData() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
        productInterest: document.getElementById('productInterest').value,
        message: document.getElementById('message').value
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        if (document.getElementById('name')) document.getElementById('name').value = formData.name || '';
        if (document.getElementById('email')) document.getElementById('email').value = formData.email || '';
        if (document.getElementById('company')) document.getElementById('company').value = formData.company || '';
        if (document.getElementById('phone')) document.getElementById('phone').value = formData.phone || '';
        if (document.getElementById('country')) document.getElementById('country').value = formData.country || '';
        if (document.getElementById('productInterest')) document.getElementById('productInterest').value = formData.productInterest || '';
        if (document.getElementById('message')) document.getElementById('message').value = formData.message || '';
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
}

// Load saved data on page load
window.addEventListener('load', loadFormData);

// Auto-save on input
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('input', debounce(saveFormData, 500));
    
    // Clear saved data on successful submission
    const originalSubmit = contactForm.onsubmit;
    contactForm.addEventListener('submit', function() {
        setTimeout(() => {
            if (document.querySelector('.form-message.success')) {
                clearFormData();
            }
        }, 1000);
    });
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
