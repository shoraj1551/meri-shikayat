/**
 * Complaint Form Page - Screen 2: Initial Complaint Form
 * Step 1 of 3 in the complaint submission flow
 */

import FormValidator from '../utils/form-validator.js';
import Loading from '../components/loading.js';

export function renderComplaintForm() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="complaint-form-page">
            <!-- Progress Steps (Enhanced) -->
            <div class="progress-steps">
                <div class="progress-step active">
                    <span class="progress-step-number">1</span>
                    <span>Complaint Details</span>
                </div>
                <div class="progress-step">
                    <span class="progress-step-number">2</span>
                    <span>Review</span>
                </div>
                <div class="progress-step">
                    <span class="progress-step-number">3</span>
                    <span>Submitted</span>
                </div>
            </div>

            <!-- Form Container -->
            <div class="form-container">
                <form id="complaintForm" class="complaint-form">
                    <!-- Category Selector -->
                    <div class="form-group">
                        <label class="form-label required">
                            Select Category
                            <span class="tooltip-trigger" data-tooltip="Choose the category that best fits your issue to help us route it correctly" data-tooltip-position="top">?</span>
                        </label>
                        <div class="category-search">
                            <span class="search-icon">🔍</span>
                            <input type="text" class="form-input" placeholder="Search categories..." id="categorySearch">
                        </div>
                        <div class="category-grid" id="categoryGrid">
                            <div class="category-card" data-category="sanitation" tabindex="0">
                                <div class="category-icon">🗑️</div>
                                <div class="category-name">Sanitation</div>
                            </div>
                            <div class="category-card" data-category="roads" tabindex="0">
                                <div class="category-icon">🚧</div>
                                <div class="category-name">Roads</div>
                            </div>
                            <div class="category-card" data-category="electricity" tabindex="0">
                                <div class="category-icon">💡</div>
                                <div class="category-name">Electricity</div>
                            </div>
                            <div class="category-card" data-category="water" tabindex="0">
                                <div class="category-icon">💧</div>
                                <div class="category-name">Water</div>
                            </div>
                            <div class="category-card" data-category="police" tabindex="0">
                                <div class="category-icon">👮</div>
                                <div class="category-name">Police</div>
                            </div>
                            <div class="category-card" data-category="other" tabindex="0">
                                <div class="category-icon">📦</div>
                                <div class="category-name">Other</div>
                            </div>
                        </div>
                        <div class="field-error" id="categoryError"></div>
                    </div>

                    <!-- Location Input -->
                    <div class="form-group">
                        <label for="location" class="form-label required">
                            Location of Issue
                            <span class="tooltip-trigger" data-tooltip="Where did this issue occur? Be as specific as possible." data-tooltip-position="top">?</span>
                        </label>
                        <div class="input-wrapper location-input-group">
                            <span class="input-icon">📍</span>
                            <input 
                                type="text" 
                                id="location" 
                                class="form-input" 
                                placeholder="Enter address or landmark"
                                required
                            />
                            <button type="button" class="btn-location" id="useLocationBtn" title="Use current GPS location">
                                🎯 Use My Location
                            </button>
                        </div>
                        <small class="form-hint-enhanced">
                            <span class="hint-icon">💡</span>
                            <span><strong>Tip:</strong> You can use your current location for better accuracy</span>
                        </small>
                        <div class="map-placeholder">
                            <p>🗺️ Map View Placeholder</p>
                        </div>
                        <div class="field-error" id="locationError"></div>
                    </div>

                    <!-- Description Field -->
                    <div class="form-group">
                        <label for="description" class="form-label required">
                            Describe the Issue
                            <span class="tooltip-trigger" data-tooltip="Provide details like what happened, when it started, and any immediate danger" data-tooltip-position="top">?</span>
                        </label>
                        <div class="input-wrapper">
                            <textarea 
                                id="description" 
                                class="form-textarea" 
                                placeholder="Describe your issue in detail..."
                                rows="5"
                                required
                                minlength="20"
                            ></textarea>
                        </div>
                        <div class="char-counter">
                            <span id="charCount">0</span>/500 characters
                        </div>
                        <small class="form-hint-enhanced">
                            <span class="hint-icon">📝</span>
                            <span>Please provide at least 20 characters describing the problem</span>
                        </small>
                        <div class="field-error" id="descriptionError"></div>
                    </div>

                    <!-- Media Attachment Section -->
                    <div class="form-group">
                        <label class="form-label">
                            Add Evidence (Optional)
                            <span class="tooltip-trigger" data-tooltip="Photos or videos help authorities understand the issue better" data-tooltip-position="top">?</span>
                        </label>
                        <div class="media-options">
                            <button type="button" class="media-btn">
                                <span class="media-icon">📷</span>
                                <span>Camera</span>
                            </button>
                            <button type="button" class="media-btn">
                                <span class="media-icon">📹</span>
                                <span>Video</span>
                            </button>
                            <button type="button" class="media-btn">
                                <span class="media-icon">🎤</span>
                                <span>Audio</span>
                            </button>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-block btn-cta-main" id="reviewContinueBtn">
                            Next Step
                        </button>
                    </div>
                    
                    <div class="form-footer">
                        <p>By submitting, you agree to our <a href="/privacy">Privacy Policy</a>.</p>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Initialize logic
    initializeComplaintForm();
}

function initializeComplaintForm() {
    // Initialize tooltips
    if (window.tooltip) {
        window.tooltip.initializeTooltips();
    }

    const form = document.getElementById('complaintForm');
    const validator = new FormValidator(form);

    let selectedCategory = null;

    // Category selection
    const categoryCards = document.querySelectorAll('.category-card');
    const categoryGrid = document.getElementById('categoryGrid');

    categoryCards.forEach(card => {
        // Click selection
        card.addEventListener('click', () => selectCategory(card));

        // Keyboard selection
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCategory(card);
            }
        });
    });

    function selectCategory(card) {
        categoryCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedCategory = card.dataset.category;

        // Clear error
        const categoryError = document.getElementById('categoryError');
        categoryError.textContent = '';
        categoryError.style.display = 'none';

        // Remove error style from grid if it existed
        categoryGrid.style.border = 'none';
    }

    // Category Search
    const searchInput = document.getElementById('categorySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            categoryCards.forEach(card => {
                const name = card.querySelector('.category-name').textContent.toLowerCase();
                if (name.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Character counter & Real-time validation
    const description = document.getElementById('description');
    const charCount = document.getElementById('charCount');

    description.addEventListener('input', () => {
        const length = description.value.length;
        charCount.textContent = length;

        if (length > 0) {
            if (length < 20) {
                validator.setError(description, `Please share more details (${20 - length} more characters needed)`);
            } else {
                validator.clearError(description);
            }
        }
    });

    // Location
    const locationInput = document.getElementById('location');
    const useLocationBtn = document.getElementById('useLocationBtn');

    locationInput.addEventListener('blur', () => {
        if (locationInput.value.trim()) {
            validator.validateRequired(locationInput, 'Location');
        }
    });

    useLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            const originalText = useLocationBtn.innerHTML;
            useLocationBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Locating...';
            useLocationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationInput.value = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
                    useLocationBtn.innerHTML = '✅ Location Added';
                    useLocationBtn.classList.add('success');
                    validator.clearError(locationInput);

                    setTimeout(() => {
                        useLocationBtn.innerHTML = originalText;
                        useLocationBtn.disabled = false;
                        useLocationBtn.classList.remove('success');
                    }, 3000);
                },
                (error) => {
                    useLocationBtn.innerHTML = '❌ Denied';
                    useLocationBtn.classList.add('error');
                    validator.setError(locationInput, 'Location access denied. Please enter manually.');

                    setTimeout(() => {
                        useLocationBtn.innerHTML = originalText;
                        useLocationBtn.disabled = false;
                        useLocationBtn.classList.remove('error');
                    }, 3000);
                }
            );
        } else {
            validator.setError(locationInput, 'Geolocation not supported by your browser');
        }
    });

    // Form Submission
    const submitBtn = document.getElementById('reviewContinueBtn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all
        let isValid = true;

        if (!selectedCategory) {
            const categoryError = document.getElementById('categoryError');
            categoryError.textContent = 'Please select a category';
            categoryError.style.display = 'block';
            categoryGrid.style.border = '1px solid #F44336';
            categoryGrid.style.borderRadius = '12px';
            isValid = false;
        }

        if (!validator.validateRequired(locationInput, 'Location')) {
            isValid = false;
        }

        if (description.value.length < 20) {
            validator.setError(description, 'Description must be at least 20 characters');
            isValid = false;
        }

        if (!isValid) return;

        // Proceed
        Loading.buttonLoading(submitBtn, 'Processing...');

        // Mock submission - usually we'd go to review step
        setTimeout(() => {
            Loading.buttonReset(submitBtn);
            // In a real flow, navigate to step 2 or show success
            window.router.navigate('/dashboard');
        }, 1500);
    });
}
