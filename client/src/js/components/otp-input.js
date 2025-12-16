/**
 * OTP Input Component
 * Reusable 6-digit OTP input with auto-focus and paste support
 */

export function createOTPInput(containerId, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="otp-input-container">
            <input type="text" maxlength="1" class="otp-digit" data-index="0" inputmode="numeric" pattern="[0-9]" autocomplete="off">
            <input type="text" maxlength="1" class="otp-digit" data-index="1" inputmode="numeric" pattern="[0-9]" autocomplete="off">
            <input type="text" maxlength="1" class="otp-digit" data-index="2" inputmode="numeric" pattern="[0-9]" autocomplete="off">
            <input type="text" maxlength="1" class="otp-digit" data-index="3" inputmode="numeric" pattern="[0-9]" autocomplete="off">
            <input type="text" maxlength="1" class="otp-digit" data-index="4" inputmode="numeric" pattern="[0-9]" autocomplete="off">
            <input type="text" maxlength="1" class="otp-digit" data-index="5" inputmode="numeric" pattern="[0-9]" autocomplete="off">
        </div>
    `;

    const inputs = container.querySelectorAll('.otp-digit');

    // Focus first input
    inputs[0].focus();

    inputs.forEach((input, index) => {
        // Handle input
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Only allow numbers
            if (!/^\d$/.test(value)) {
                e.target.value = '';
                return;
            }

            // Move to next input
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Check if all inputs are filled
            checkComplete();
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').trim();

            if (/^\d{6}$/.test(pastedData)) {
                pastedData.split('').forEach((char, i) => {
                    if (inputs[i]) {
                        inputs[i].value = char;
                    }
                });
                inputs[5].focus();
                checkComplete();
            }
        });
    });

    function checkComplete() {
        const otp = Array.from(inputs).map(input => input.value).join('');
        if (otp.length === 6 && /^\d{6}$/.test(otp)) {
            if (onComplete) {
                onComplete(otp);
            }
        }
    }

    // Return methods to interact with the component
    return {
        getValue: () => Array.from(inputs).map(input => input.value).join(''),
        clear: () => {
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
        },
        disable: () => inputs.forEach(input => input.disabled = true),
        enable: () => inputs.forEach(input => input.disabled = false)
    };
}

/**
 * Add OTP input styles to document
 */
export function addOTPStyles() {
    if (document.getElementById('otp-input-styles')) return;

    const style = document.createElement('style');
    style.id = 'otp-input-styles';
    style.textContent = `
        .otp-input-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 20px 0;
        }

        .otp-digit {
            width: 50px;
            height: 60px;
            text-align: center;
            font-size: 24px;
            font-weight: 600;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            outline: none;
            transition: all 0.2s;
            background: white;
            color: #1f2937;
        }

        .otp-digit:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .otp-digit:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
        }

        @media (max-width: 640px) {
            .otp-digit {
                width: 40px;
                height: 50px;
                font-size: 20px;
            }
            
            .otp-input-container {
                gap: 8px;
            }
        }
    `;
    document.head.appendChild(style);
}
