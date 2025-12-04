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
                <div class="progress-header">
                    <span class="step-count">Step 1 of 3</span>
                    <h2 class="step-title">Complaint Details</h2>
                </div>
                <div class="progress-bar-linear">
                    <div class="progress-fill" style="width: 33%"></div>
                </div>
            </div>

            <!-- Form Container -->
            <div class="form-container">
                <form id="complaintForm" class="complaint-form">
                    <!-- Category Selector -->
                    <div class="form-group">
                        <label class="form-label required">Select Category</label>
                        <div class="category-search">
                            <span class="search-icon">🔍</span>
                            <input type="text" class="form-input" placeholder="Search categories...">
                        </div>
                        <div class="category-grid" id="categoryGrid">
                            <div class="category-card" data-category="sanitation">
                                <div class="category-icon">🗑️</div>
                                <div class="category-name">Sanitation</div>
                            </div>
                            <div class="category-card" data-category="roads">
                                <div class="category-icon">🚧</div>
                                <div class="category-name">Roads</div>
                            </div>
                            <div class="category-card" data-category="electricity">
                                <div class="category-icon">💡</div>
                                <div class="category-name">Electricity</div>
                            </div>
                            <div class="category-card" data-category="water">
                                <div class="category-icon">💧</div>
                                <div class="category-name">Water</div>
                            </div>
                            <div class="category-card" data-category="police">
                                <div class="category-icon">👮</div>
                                <div class="category-name">Police</div>
                            </div>
                            <div class="category-card" data-category="other">
                                <div class="category-icon">📦</div>
                                <div class="category-name">Other</div>
                            </div>
                        </div>
                        <div class="error-message" id="categoryError"></div>
                    </div>

                    <!-- Location Input -->
                    <div class="form-group">
                        <label for="location" class="form-label required">Location of Issue</label>
                        <div class="location-input-group">
                            <input 
                                type="text" 
                                id="location" 
                                class="form-input" 
                                placeholder="Enter location"
                            />
                            <button type="button" class="btn-location" id="useLocationBtn">
                                📍 Use My Current Location
                            </button>
                        </div>
                        <div class="map-placeholder">
                            <p>🗺️ Map View</p>
                        </div>
                        <div class="error-message" id="locationError"></div>
                    </div>

                    <!-- Description Field -->
                    <div class="form-group">
                        <label for="description" class="form-label required">Describe the Issue</label>
                        <textarea 
                            id="description" 
                            class="form-textarea" 
                            placeholder="Describe your issue in detail..."
                            rows="5"
                        ></textarea>
                        <div class="char-counter">
                            <span id="charCount">0</span>/500 characters
                        </div>
                        <div class="error-message" id="descriptionError"></div>
                    </div>

                    <!-- Media Attachment Section -->
                    <div class="form-group">
                        <label class="form-label">Add Evidence (Optional)</label>
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
                        <button type="submit" class="btn btn-primary btn-block" id="reviewContinueBtn">
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
