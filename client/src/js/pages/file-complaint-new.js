/**
 * New Complaint Submission Page - Redesigned
 * Multi-step wizard with auto-location, custom categories, and guest support
 */

import { categoryService } from '../api/category.service.js';

let currentStep = 1;
let formData = {
    description: '',
    category: null,
    customCategory: '',
    location: null,
    photo: null,
    guestContact: null
};
let categories = [];
let map = null;
let marker = null;

export async function renderFileComplaintNew() {
    const app = document.getElementById('app');

    // Load categories
    try {
        const response = await categoryService.getCategories();
        categories = response;
    } catch (error) {
        console.error('Failed to load categories:', error);
        categories = [];
    }

    app.innerHTML = generatePageHTML();
    initializeStep1();
}

function generatePageHTML() {
    return `
        <div class="complaint-wizard">
            <div class="wizard-container">
                <!-- Progress Bar -->
                <div class="wizard-progress">
                    <div class="progress-step ${currentStep >= 1 ? 'active' : ''}" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-label">Problem</div>
                    </div>
                    <div class="progress-line ${currentStep >= 2 ? 'active' : ''}"></div>
                    <div class="progress-step ${currentStep >= 2 ? 'active' : ''}" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-label">Location</div>
                    </div>
                    <div class="progress-line ${currentStep >= 3 ? 'active' : ''}"></div>
                    <div class="progress-step ${currentStep >= 3 ? 'active' : ''}" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-label">Review</div>
                    </div>
                </div>

                <!-- Step Content -->
                <div class="wizard-content" id="wizardContent">
                    <!-- Content will be dynamically rendered -->
                </div>

                <!-- Navigation -->
                <div class="wizard-nav">
                    <button class="btn btn-outline" id="backBtn" style="display: none;">
                        ← Back
                    </button>
                    <button class="btn btn-primary" id="nextBtn">
                        Next →
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Step 1: Problem Description
function initializeStep1() {
    const content = document.getElementById('wizardContent');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    backBtn.style.display = 'none';
    nextBtn.textContent = 'Next →';

    content.innerHTML = `
        <div class="step-content step-1">
            <h2>What's the problem?</h2>
            <p class="step-subtitle">Describe the issue you want to report</p>

            <div class="form-group">
                <label>Description *</label>
                <textarea 
                    id="description" 
                    placeholder="Describe the problem in detail..."
                    rows="6"
                    maxlength="500"
                >${formData.description}</textarea>
                <div class="char-counter">
                    <span id="charCount">${formData.description.length}</span>/500 
                    <span class="min-chars">(minimum 20 characters)</span>
                </div>
            </div>

            <div class="form-group">
                <label>Add Photo (Optional)</label>
                <div class="photo-upload" id="photoUpload">
                    ${formData.photo ? `
                        <img src="${URL.createObjectURL(formData.photo)}" alt="Preview" class="photo-preview">
                        <button class="remove-photo" id="removePhoto">✕</button>
                    ` : `
                        <div class="upload-placeholder">
                            <div class="upload-icon">📷</div>
                            <p>Click to upload or drag & drop</p>
                            <small>JPG, PNG up to 10MB</small>
                        </div>
                    `}
                    <input type="file" id="photoInput" accept="image/*" style="display: none;">
                </div>
            </div>

            <div class="form-group">
                <label>Category *</label>
                <div class="category-grid">
                    ${categories.map(cat => `
                        <div class="category-card ${formData.category === cat._id ? 'selected' : ''}" data-id="${cat._id}">
                            <div class="category-icon">${cat.icon || '📋'}</div>
                            <div class="category-name">${cat.name}</div>
                        </div>
                    `).join('')}
                    <div class="category-card ${formData.category === 'custom' ? 'selected' : ''}" data-id="custom">
                        <div class="category-icon">✏️</div>
                        <div class="category-name">Other</div>
                    </div>
                </div>
                ${formData.category === 'custom' ? `
                    <input 
                        type="text" 
                        id="customCategory" 
                        placeholder="Enter custom category..."
                        value="${formData.customCategory}"
                        maxlength="50"
                        class="custom-category-input"
                    >
                ` : ''}
            </div>
        </div>
    `;

    // Character counter
    const descInput = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    descInput.addEventListener('input', (e) => {
        charCount.textContent = e.target.value.length;
        formData.description = e.target.value;
    });

    // Photo upload
    const photoUpload = document.getElementById('photoUpload');
    const photoInput = document.getElementById('photoInput');

    photoUpload.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-photo')) {
            photoInput.click();
        }
    });

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            formData.photo = file;
            initializeStep1(); // Re-render to show preview
        }
    });

    document.getElementById('removePhoto')?.addEventListener('click', (e) => {
        e.stopPropagation();
        formData.photo = null;
        photoInput.value = '';
        initializeStep1();
    });

    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            formData.category = card.dataset.id;

            if (formData.category === 'custom') {
                initializeStep1(); // Re-render to show custom input
            } else {
                formData.customCategory = '';
            }
        });
    });

    // Custom category input
    document.getElementById('customCategory')?.addEventListener('input', (e) => {
        formData.customCategory = e.target.value;
    });

    // Next button
    nextBtn.onclick = () => {
        if (validateStep1()) {
            currentStep = 2;
            initializeStep2();
        }
    };
}

function validateStep1() {
    if (formData.description.length < 20) {
        alert('Please provide a description of at least 20 characters');
        return false;
    }
    if (!formData.category) {
        alert('Please select a category');
        return false;
    }
    if (formData.category === 'custom' && !formData.customCategory.trim()) {
        alert('Please enter a custom category');
        return false;
    }
    return true;
}

// Step 2: Location (with map)
async function initializeStep2() {
    const content = document.getElementById('wizardContent');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    backBtn.style.display = 'block';
    nextBtn.textContent = 'Next →';

    content.innerHTML = `
        <div class="step-content step-2">
            <h2>Where is it?</h2>
            <p class="step-subtitle">Help us locate the problem</p>

            <button class="btn btn-outline btn-block" id="useMyLocation">
                📍 Use My Current Location
            </button>

            <div class="map-container" id="mapContainer">
                <div id="map" style="height: 400px; border-radius: 12px;"></div>
            </div>

            <div class="location-info" id="locationInfo">
                ${formData.location ? `
                    <div class="location-address">
                        <strong>📍 Selected Location:</strong>
                        <p>${formData.location.address || `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}`}</p>
                    </div>
                ` : '<p class="text-muted">Click "Use My Current Location" or drag the map pin</p>'}
            </div>
        </div>
    `;

    // Initialize Leaflet map
    await initializeMap();

    // Use my location button
    document.getElementById('useMyLocation').addEventListener('click', getCurrentLocation);

    // Navigation
    backBtn.onclick = () => {
        currentStep = 1;
        initializeStep1();
    };

    nextBtn.onclick = () => {
        if (validateStep2()) {
            currentStep = 3;
            initializeStep3();
        }
    };
}

async function initializeMap() {
    // Dynamically import Leaflet
    const L = window.L;

    // Default center (India)
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    map = L.map('map').setView(formData.location ? [formData.location.lat, formData.location.lng] : defaultCenter, formData.location ? 15 : defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker
    if (formData.location) {
        marker = L.marker([formData.location.lat, formData.location.lng], { draggable: true }).addTo(map);
        marker.on('dragend', updateLocationFromMarker);
    }

    // Click to add/move marker
    map.on('click', (e) => {
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng, { draggable: true }).addTo(map);
            marker.on('dragend', updateLocationFromMarker);
        }
        updateLocation(e.latlng.lat, e.latlng.lng);
    });
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    const btn = document.getElementById('useMyLocation');
    btn.disabled = true;
    btn.textContent = '📍 Getting location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            updateLocation(latitude, longitude);

            // Center map on location
            map.setView([latitude, longitude], 15);

            // Add/move marker
            if (marker) {
                marker.setLatLng([latitude, longitude]);
            } else {
                marker = window.L.marker([latitude, longitude], { draggable: true }).addTo(map);
                marker.on('dragend', updateLocationFromMarker);
            }

            btn.disabled = false;
            btn.textContent = '📍 Use My Current Location';
        },
        (error) => {
            alert('Unable to get your location. Please select manually on the map.');
            btn.disabled = false;
            btn.textContent = '📍 Use My Current Location';
        }
    );
}

async function updateLocation(lat, lng) {
    formData.location = { lat, lng };

    // Reverse geocode to get address
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        formData.location.address = data.display_name;
    } catch (error) {
        console.error('Geocoding error:', error);
        formData.location.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    // Update UI
    document.getElementById('locationInfo').innerHTML = `
        <div class="location-address">
            <strong>📍 Selected Location:</strong>
            <p>${formData.location.address}</p>
        </div>
    `;
}

function updateLocationFromMarker(e) {
    const { lat, lng } = e.target.getLatLng();
    updateLocation(lat, lng);
}

function validateStep2() {
    if (!formData.location) {
        alert('Please select a location');
        return false;
    }
    return true;
}

// Step 3: Review & Submit
function initializeStep3() {
    const content = document.getElementById('wizardContent');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    backBtn.style.display = 'block';
    nextBtn.textContent = 'Submit Complaint';

    const categoryName = formData.category === 'custom'
        ? formData.customCategory
        : categories.find(c => c._id === formData.category)?.name || 'Unknown';

    content.innerHTML = `
        <div class="step-content step-3">
            <h2>Review Your Complaint</h2>
            <p class="step-subtitle">Please verify all details before submitting</p>

            <div class="review-card">
                <div class="review-section">
                    <div class="review-header">
                        <strong>Description</strong>
                        <button class="edit-btn" data-step="1">Edit</button>
                    </div>
                    <p>${formData.description}</p>
                </div>

                <div class="review-section">
                    <div class="review-header">
                        <strong>Category</strong>
                        <button class="edit-btn" data-step="1">Edit</button>
                    </div>
                    <p>${categoryName}</p>
                </div>

                ${formData.photo ? `
                    <div class="review-section">
                        <div class="review-header">
                            <strong>Photo</strong>
                            <button class="edit-btn" data-step="1">Edit</button>
                        </div>
                        <img src="${URL.createObjectURL(formData.photo)}" alt="Complaint photo" class="review-photo">
                    </div>
                ` : ''}

                <div class="review-section">
                    <div class="review-header">
                        <strong>Location</strong>
                        <button class="edit-btn" data-step="2">Edit</button>
                    </div>
                    <p>${formData.location.address}</p>
                </div>
            </div>
        </div>
    `;

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step);
            currentStep = step;
            if (step === 1) initializeStep1();
            else if (step === 2) initializeStep2();
        });
    });

    // Navigation
    backBtn.onclick = () => {
        currentStep = 2;
        initializeStep2();
    };

    nextBtn.onclick = submitComplaint;
}

async function submitComplaint() {
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Submitting...';

    try {
        const submitData = new FormData();
        submitData.append('description', formData.description);

        if (formData.category !== 'custom') {
            submitData.append('category', formData.category);
        } else {
            submitData.append('customCategory', formData.customCategory);
        }

        submitData.append('location', JSON.stringify({
            lat: formData.location.lat,
            lng: formData.location.lng,
            address: formData.location.address
        }));

        if (formData.photo) {
            submitData.append('media', formData.photo);
        }

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const endpoint = token ? '/complaints' : '/complaints/guest';

        const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {},
            body: submitData
        });

        const result = await response.json();

        if (result.success) {
            showSuccessPage(result.data.complaintId);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Submit error:', error);
        alert('Failed to submit complaint. Please try again.');
        nextBtn.disabled = false;
        nextBtn.textContent = 'Submit Complaint';
    }
}

function showSuccessPage(complaintId) {
    const app = document.getElementById('app');
    const isAuthenticated = !!localStorage.getItem('token');

    app.innerHTML = `
        <div class="success-page">
            <div class="success-container">
                <div class="success-icon">✅</div>
                <h1>Complaint Submitted!</h1>
                <p>Your complaint has been registered successfully</p>

                <div class="complaint-id-box">
                    <label>Your Complaint ID</label>
                    <div class="id-display">
                        <span class="id-text">${complaintId}</span>
                        <button class="copy-btn" id="copyId">
                            <span class="copy-icon">📋</span>
                            Copy
                        </button>
                    </div>
                    <small>Save this ID to track your complaint</small>
                </div>

                ${!isAuthenticated ? `
                    <div class="next-steps">
                        <h3>What's Next?</h3>
                        <div class="options-grid">
                            <button class="option-card" onclick="window.router.navigate('/login?redirect=/dashboard')">
                                <div class="option-icon">🔐</div>
                                <strong>Login to Track</strong>
                                <p>Track progress in your dashboard</p>
                            </button>
                            <button class="option-card" id="getUpdates">
                                <div class="option-icon">📧</div>
                                <strong>Get Updates</strong>
                                <p>Receive progress via email/SMS</p>
                            </button>
                        </div>
                    </div>
                ` : `
                    <button class="btn btn-primary btn-lg" onclick="window.router.navigate('/dashboard')">
                        Go to Dashboard
                    </button>
                `}

                <button class="btn btn-outline" onclick="window.router.navigate('/')">
                    Back to Home
                </button>
            </div>
        </div>
    `;

    // Copy ID functionality
    document.getElementById('copyId').addEventListener('click', () => {
        navigator.clipboard.writeText(complaintId);
        const btn = document.getElementById('copyId');
        btn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
        setTimeout(() => {
            btn.innerHTML = '<span class="copy-icon">📋</span> Copy';
        }, 2000);
    });

    // Get updates modal (for guests)
    document.getElementById('getUpdates')?.addEventListener('click', () => {
        showGuestContactModal(complaintId);
    });
}

function showGuestContactModal(complaintId) {
    // TODO: Implement guest contact modal
    alert('Guest contact form coming soon! For now, please login to track your complaint.');
}
