/**
 * Form Utilities - Reusable form enhancement functions
 */

/**
 * Initialize password toggle functionality
 * @param {string} passwordInputId - ID of the password input
 * @param {string} toggleButtonId - ID of the toggle button
 */
export function initPasswordToggle(passwordInputId, toggleButtonId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleBtn = document.getElementById(toggleButtonId);

    if (!passwordInput || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const icon = toggleBtn.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = type === 'password' ? '👁️' : '🔒';
        }

        toggleBtn.title = type === 'password' ? 'Show password' : 'Hide password';
    });
}

/**
 * Initialize real-time email/phone validation
 * @param {string} inputId - ID of the identifier input
 */
export function initIdentifierValidation(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const formGroup = input.closest('.form-group');
    const successIcon = formGroup?.querySelector('.success-icon');
    const errorIcon = formGroup?.querySelector('.error-icon');

    input.addEventListener('input', () => {
        const value = input.value.trim();
        const isEmail = /^\S+@\S+\.\S+$/.test(value);
        const isPhone = /^[0-9]{10}$/.test(value);

        if (value.length === 0) {
            if (successIcon) successIcon.style.display = 'none';
            if (errorIcon) errorIcon.style.display = 'none';
            input.classList.remove('valid', 'invalid');
        } else if (isEmail || isPhone) {
            if (successIcon) successIcon.style.display = 'block';
            if (errorIcon) errorIcon.style.display = 'none';
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            if (successIcon) successIcon.style.display = 'none';
            if (errorIcon) errorIcon.style.display = 'block';
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    });
}

/**
 * Initialize password strength indicator
 * @param {string} passwordInputId - ID of the password input
 * @param {string} strengthContainerId - ID of the strength indicator container
 */
export function initPasswordStrength(passwordInputId, strengthContainerId) {
    const passwordInput = document.getElementById(passwordInputId);
    const strengthContainer = document.getElementById(strengthContainerId);

    if (!passwordInput || !strengthContainer) return;

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);

        const bar = strengthContainer.querySelector('.password-strength-bar');
        const text = strengthContainer.querySelector('.password-strength-text');

        if (password.length === 0) {
            strengthContainer.style.display = 'none';
            return;
        }

        strengthContainer.style.display = 'block';

        // Update bar
        bar.className = 'password-strength-bar ' + strength.level;

        // Update text
        text.textContent = strength.label;
        text.className = 'password-strength-text ' + strength.level;
    });
}

/**
 * Calculate password strength
 * @param {string} password
 * @returns {Object} strength object with level and label
 */
function calculatePasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', label: 'Weak password' };
    if (score <= 4) return { level: 'medium', label: 'Medium password' };
    return { level: 'strong', label: 'Strong password' };
}

/**
 * Initialize password requirements checker
 * @param {string} passwordInputId - ID of the password input
 * @param {string} requirementsId - ID of the requirements container
 */
export function initPasswordRequirements(passwordInputId, requirementsId) {
    const passwordInput = document.getElementById(passwordInputId);
    const requirementsContainer = document.getElementById(requirementsId);

    if (!passwordInput || !requirementsContainer) return;

    const requirements = requirementsContainer.querySelectorAll('li');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;

        // Check each requirement
        requirements.forEach((req, index) => {
            let met = false;

            switch (index) {
                case 0: // Min 8 characters
                    met = password.length >= 8;
                    break;
                case 1: // Uppercase letter
                    met = /[A-Z]/.test(password);
                    break;
                case 2: // Number
                    met = /[0-9]/.test(password);
                    break;
                case 3: // Special character
                    met = /[^a-zA-Z0-9]/.test(password);
                    break;
            }

            if (met) {
                req.classList.add('met');
            } else {
                req.classList.remove('met');
            }
        });
    });
}

/**
 * Initialize loading state for form submission
 * @param {string} formId - ID of the form
 * @param {string} buttonId - ID of the submit button
 * @param {Function} submitHandler - Async function to handle form submission
 */
export function initFormSubmit(formId, buttonId, submitHandler) {
    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);

    if (!form || !button) return;

    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        button.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';

        try {
            await submitHandler(e);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    });
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
}

/**
 * Validate phone format (10 digits)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

/**
 * Show error message
 * @param {string} elementId - ID of the error message element
 * @param {string} message - Error message to display
 */
export function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

/**
 * Hide error message
 * @param {string} elementId - ID of the error message element
 */
export function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Show success message
 * @param {string} elementId - ID of the success message element
 * @param {string} message - Success message to display
 */
export function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

/**
 * Hide success message
 * @param {string} elementId - ID of the success message element
 */
export function hideSuccess(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}
