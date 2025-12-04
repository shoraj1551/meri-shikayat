/**
 * Complaint Form Page - Screen 2: Initial Complaint Form
 * Step 1 of 3 in the complaint submission flow
 */

export function renderComplaintForm() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="complaint-form-page">
            <!-- Progress Indicator -->
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-step active">
                        <div class="step-number">1</div>
                        <div class="step-label">Details</div>
                    </div>
                    <div class="progress-line"></div>
                    <div class="progress-step">
                        <div class="step-number">2</div>
                        <div class="step-label">Register</div>
                    </div>
                    <div class="progress-line"></div>
                    <div class="progress-step">
                        <div class="step-number">3</div>
                        <div class="step-label">Submit</div>
                    </div>
                </div>
            </div>

            <!-- Form Container -->
            <div class="form-container">
                <div class="form-header">
                    <h1>File Your Complaint</h1>
                    <p>Help us understand your issue by providing the details below</p>
                </div>

                <form id="complaintForm" class="complaint-form">
                    <!-- Category Selector -->
                    <div class="form-group">
                        <label class="form-label required">Complaint Category</label>
                        <div class="category-grid" id="categoryGrid">
                            <div class="category-card" data-category="roads">
                                <div class="category-icon">🚧</div>
                                <div class="category-name">Roads & Infrastructure</div>
                            </div>
                            <div class="category-card" data-category="sanitation">
                                <div class="category-icon">🗑️</div>
                                <div class="category-name">Sanitation & Waste</div>
                            </div>
                            <div class="category-card" data-category="utilities">
                                <div class="category-icon">💡</div>
                                <div class="category-name">Public Utilities</div>
                            </div>
                            <div class="category-card" data-category="safety">
                                <div class="category-icon">🚨</div>
                                <div class="category-name">Public Safety</div>
                            </div>
                            <div class="category-card" data-category="parks">
                                <div class="category-icon">🌳</div>
                                <div class="category-name">Parks & Public Spaces</div>
                            </div>
                        </div>
                        <div class="error-message" id="categoryError"></div>
                    </div>

                    <!-- Location Input -->
                    <div class="form-group">
                        <label for="location" class="form-label required">Location</label>
                        <div class="location-input-group">
                            <input 
                                type="text" 
                                id="location" 
                                class="form-input" 
                                placeholder="Enter the location of the issue"
                            />
                            <button type="button" class="btn-location" id="useLocationBtn">
                                📍 Use My Current Location
                            </button>
                        </div>
                        <div class="map-placeholder">
                            <p>🗺️ Map integration placeholder</p>
                        </div>
                        <div class="error-message" id="locationError"></div>
                    </div>

                    <!-- Description Field -->
                    <div class="form-group">
                        <label for="description" class="form-label required">Description</label>
                        <textarea 
                            id="description" 
                            class="form-textarea" 
                            placeholder="Describe your issue in detail (minimum 50 characters)"
                            rows="5"
                        ></textarea>
                        <div class="char-counter">
                            <span id="charCount">0</span>/50 characters
                        </div>
                        <div class="error-message" id="descriptionError"></div>
                    </div>

                    <!-- Submit Button -->
                    <div class="form-actions">
                        <a href="/" class="btn btn-secondary">Cancel</a>
                        <button type="submit" class="btn btn-primary" id="reviewContinueBtn">
                            Review & Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Initialize form logic
    initializeComplaintForm();
}

function initializeComplaintForm() {
    let selectedCategory = null;

    // Category selection
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCategory = card.dataset.category;
            document.getElementById('categoryError').textContent = '';
        });
    });

    // Character counter
    const description = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    description.addEventListener('input', () => {
        charCount.textContent = description.value.length;
        if (description.value.length >= 50) {
            document.getElementById('descriptionError').textContent = '';
        }
    });

    // Use current location
    const useLocationBtn = document.getElementById('useLocationBtn');
    const locationInput = document.getElementById('location');
    useLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            useLocationBtn.textContent = '⏳ Getting location...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationInput.value = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
                    useLocationBtn.textContent = '✅ Location Added';
                    document.getElementById('locationError').textContent = '';
                    setTimeout(() => {
                        useLocationBtn.textContent = '📍 Use My Current Location';
                    }, 2000);
                },
                (error) => {
                    useLocationBtn.textContent = '❌ Location Access Denied';
                    setTimeout(() => {
                        useLocationBtn.textContent = '📍 Use My Current Location';
                    }, 2000);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });

    // Form submission
    const form = document.getElementById('complaintForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        // Validate category
        if (!selectedCategory) {
            document.getElementById('categoryError').textContent = 'Please select a complaint category';
            isValid = false;
        }

        // Validate location
        if (!locationInput.value.trim()) {
            document.getElementById('locationError').textContent = 'Please enter your location or use current location';
            isValid = false;
        }

        // Validate description
        const descLength = description.value.trim().length;
        if (descLength < 50) {
            document.getElementById('descriptionError').textContent =
                `Please provide at least 50 characters describing your issue (currently: ${descLength}/50)`;
            isValid = false;
        }

        // If valid, navigate to registration gateway
        if (isValid) {
            // Store complaint data in sessionStorage
            sessionStorage.setItem('complaintData', JSON.stringify({
                category: selectedCategory,
                location: locationInput.value,
                description: description.value
            }));

            // Navigate to registration gateway
            window.router.navigate('/register?step=complaint');
        }
    });

    // Clear location error on input
    locationInput.addEventListener('input', () => {
        if (locationInput.value.trim()) {
            document.getElementById('locationError').textContent = '';
        }
    });
}
