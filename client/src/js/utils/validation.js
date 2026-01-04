/**
 * Form Validation Utility
 * Provides real-time validation for form inputs
 */

// Validation rules
export const validators = {
    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            valid: regex.test(value),
            message: 'Please enter a valid email address'
        };
    },

    phone: (value) => {
        // Indian mobile number format: starts with 6-9, 10 digits
        const regex = /^[6-9]\d{9}$/;
        return {
            valid: regex.test(value.replace(/\s/g, '')),
            message: 'Please enter a valid 10-digit mobile number'
        };
    },

    required: (value) => {
        return {
            valid: value && value.trim().length > 0,
            message: 'This field is required'
        };
    },

    minLength: (min) => (value) => {
        return {
            valid: value && value.length >= min,
            message: `Minimum ${min} characters required`
        };
    },

    maxLength: (max) => (value) => {
        return {
            valid: !value || value.length <= max,
            message: `Maximum ${max} characters allowed`
        };
    },

    password: (value) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return {
            valid: regex.test(value),
            message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        };
    },

    confirmPassword: (originalPassword) => (value) => {
        return {
            valid: value === originalPassword,
            message: 'Passwords do not match'
        };
    },

    pincode: (value) => {
        const regex = /^\d{6}$/;
        return {
            valid: regex.test(value),
            message: 'Please enter a valid 6-digit pincode'
        };
    }
};

/**
 * Validate a single field with multiple validators
 * @param {HTMLInputElement} input - The input element to validate
 * @param {Function[]} validatorFns - Array of validator functions
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateField(input, validatorFns) {
    const value = input.value;

    // Run all validators
    for (const validator of validatorFns) {
        const result = validator(value);
        if (!result.valid) {
            showError(input, result.message);
            return false;
        }
    }

    // All validators passed
    showSuccess(input);
    return true;
}

/**
 * Show error state on input
 */
function showError(input, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    input.setAttribute('aria-invalid', 'true');

    // Find or create error message element
    let errorEl = input.parentNode.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        input.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

/**
 * Show success state on input
 */
function showSuccess(input) {
    input.classList.add('valid');
    input.classList.remove('invalid');
    input.setAttribute('aria-invalid', 'false');

    // Remove error message if exists
    const errorEl = input.parentNode.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Clear validation state
 */
export function clearValidation(input) {
    input.classList.remove('valid', 'invalid');
    input.removeAttribute('aria-invalid');

    const errorEl = input.parentNode.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Initialize validation for a form
 * @param {HTMLFormElement} form - The form element
 * @param {Object} fieldValidators - Object mapping field names to validator arrays
 */
export function initializeFormValidation(form, fieldValidators) {
    Object.keys(fieldValidators).forEach(fieldName => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;

        const validators = fieldValidators[fieldName];

        // Validate on blur (when user leaves field)
        input.addEventListener('blur', () => {
            if (input.value) {
                validateField(input, validators);
            }
        });

        // Validate on input (as user types) - but only after first blur
        let hasBlurred = false;
        input.addEventListener('blur', () => {
            hasBlurred = true;
        }, { once: true });

        input.addEventListener('input', () => {
            if (hasBlurred) {
                validateField(input, validators);
            }
        });
    });

    // Validate all fields on submit
    form.addEventListener('submit', (e) => {
        let isValid = true;

        Object.keys(fieldValidators).forEach(fieldName => {
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (!input) return;

            const validators = fieldValidators[fieldName];
            if (!validateField(input, validators)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();

            // Focus first invalid field
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    });
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - The form element
 * @param {Object} fieldValidators - Object mapping field names to validator arrays
 * @returns {boolean} - True if all fields are valid
 */
export function validateForm(form, fieldValidators) {
    let isValid = true;

    Object.keys(fieldValidators).forEach(fieldName => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;

        const validators = fieldValidators[fieldName];
        if (!validateField(input, validators)) {
            isValid = false;
        }
    });

    return isValid;
}
