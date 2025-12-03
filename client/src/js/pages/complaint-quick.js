/**
 * Quick Complaint Form - Screen 1
 * Simplified complaint submission for non-logged-in users
 */

const CATEGORIES = [
    { id: 'pothole', icon: '🚧', label: 'Pothole' },
    { id: 'trash', icon: '🗑️', label: 'Trash/Waste' },
    { id: 'water', icon: '💧', label: 'Water Leak' },
    { id: 'light', icon: '💡', label: 'Street Light' },
    { id: 'safety', icon: '⚠️', label: 'Safety Issue' },
    { id: 'other', icon: '📋', label: 'Other' }
];

let complaintData = {
    category: null,
    location: null,
    details: '',
    media: null
};

export function renderComplaintQuickPage() {
    const app = document.getElementById('app');

    // Load saved data from sessionStorage
    const saved = sessionStorage.getItem('pendingComplaint');
    if (saved) {
        complaintData = JSON.parse(saved);
    }

    app.innerHTML = `
        <div class="complaint-quick-page">
            <div class="complaint-quick-container">
                <div class="quick-form-header">
                    <h1 class="quick-form-title">What is the issue?</h1>
                    <p class="quick-form-subtitle">Tell us about the problem in your community</p>
                </div>

                <!-- Category Selection -->
                <div class="category-section">
                    <label class="section-label">Select Category *</label>
                    <input 
                        type="text" 
                        id="categorySearch" 
                        class="category-search" 
                        placeholder="Search categories..."
                    >
                    <div class="category-grid" id="categoryGrid">
                        ${CATEGORIES.map(cat => `
                            <div class="category-card ${complaintData.category === cat.id ? 'selected' : ''}" 
                                 data-category="${cat.id}">
                                <span class="category-icon">${cat.icon}</span>
                                <span class="category-label">${cat.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Location Picker -->
                <div class="location-section">
                    <label class="section-label">Location *</label>
                    <div class="location-tabs">
                        <button class="location-tab active" data-tab="map">📍 Pin on Map</button>
                        <button class="location-tab" data-tab="address">🔍 Search Address</button>
                    </div>

                    <div class="location-tab-content active" id="mapTab">
                        <div class="map-container" id="mapContainer">
                            <iframe 
                                src="https://www.openstreetmap.org/export/embed.html?bbox=77.5,28.5,77.7,28.7&layer=mapnik&marker=28.6,77.6"
                                style="border: none;"
                            ></iframe>
                        </div>
                        <button class="current-location-btn" id="useCurrentLocation">
                            📍 Use Current Location
                        </button>
                    </div>

                    <div class="location-tab-content" id="addressTab">
                        <div class="address-search-container">
                            <input 
                                type="text" 
                                id="addressInput" 
                                class="address-input" 
                                placeholder="Enter address or landmark..."
                                value="${complaintData.location?.address || ''}"
                            >
                            <div class="address-suggestions" id="addressSuggestions" style="display: none;"></div>
                        </div>
                    </div>

                    ${complaintData.location ? `
                        <div class="selected-location-display">
                            📍 Selected: ${complaintData.location.address}
                        </div>
                    ` : ''}
                </div>

                <!-- Details Section -->
                <div class="details-section">
                    <label class="section-label">Describe the Issue *</label>
                    <textarea 
                        id="detailsTextarea" 
                        class="details-textarea" 
                        placeholder="Describe the issue in detail..."
                        rows="5"
                    >${complaintData.details}</textarea>
                    <div class="word-counter" id="wordCounter">
                        <span id="wordCount">0</span> words (minimum 10 required)
                    </div>

                    <!-- Media Upload -->
                    <div class="media-upload-section">
                        <label class="media-upload-label">Add Supporting Media (Optional)</label>
                        <div class="media-buttons">
                            <button class="media-btn" id="addImageBtn">
                                📷 Add Image
                            </button>
                            <button class="media-btn" id="addAudioBtn">
                                🎤 Record Audio
                            </button>
                            <button class="media-btn" id="addVideoBtn">
                                📹 Record Video
                            </button>
                        </div>
                        <input type="file" id="mediaFileInput" accept="image/*,audio/*,video/*" style="display: none;">
                        <div class="media-preview" id="mediaPreview" style="display: none;"></div>
                    </div>
                </div>

                <!-- Privacy Note -->
                <div class="privacy-note">
                    Your details will remain confidential. 
                    <a href="/privacy" class="privacy-link">View our Privacy Policy</a>
                </div>

                <!-- CTA -->
                <div class="cta-section">
                    <button class="review-continue-btn" id="reviewContinueBtn" disabled>
                        Review & Continue
                    </button>
                    <div class="validation-error" id="validationError" style="display: none;"></div>
                </div>
            </div>
        </div>
    `;

    // Wait for DOM to be fully rendered before setting up listeners
    setTimeout(() => {
        setupEventListeners();
    }, 50);
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');

    // Category Selection
    const categoryCards = document.querySelectorAll('.category-card');
    const categorySearch = document.getElementById('categorySearch');

    if (!categoryCards.length) {
        console.error('❌ Category cards not found!');
        return;
    }

    console.log(`✅ Found ${categoryCards.length} category cards`);

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            console.log('Category clicked:', card.dataset.category);
            categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            complaintData.category = card.dataset.category;
            saveToSession();
            validateForm();
        });
    });

    // Category Search
    categorySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        categoryCards.forEach(card => {
            const label = card.querySelector('.category-label').textContent.toLowerCase();
            card.style.display = label.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Location Tabs
    const locationTabs = document.querySelectorAll('.location-tab');
    const locationTabContents = document.querySelectorAll('.location-tab-content');

    locationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            locationTabs.forEach(t => t.classList.remove('active'));
            locationTabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.dataset.tab === 'map' ? 'mapTab' : 'addressTab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Current Location Button
    const useLocationBtn = document.getElementById('useCurrentLocation');
    useLocationBtn.addEventListener('click', async () => {
        useLocationBtn.classList.add('loading');
        useLocationBtn.textContent = '📍 Getting location...';

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    complaintData.location = {
                        address: data.display_name,
                        lat: latitude,
                        lng: longitude
                    };

                    saveToSession();
                    validateForm();

                    // Update display
                    const locationDisplay = document.querySelector('.selected-location-display');
                    if (locationDisplay) {
                        locationDisplay.textContent = `📍 Selected: ${data.display_name}`;
                    } else {
                        const locationSection = document.querySelector('.location-section');
                        locationSection.insertAdjacentHTML('beforeend', `
                            <div class="selected-location-display">
                                📍 Selected: ${data.display_name}
                            </div>
                        `);
                    }
                } catch (error) {
                    alert('Failed to get address. Please try manual search.');
                }

                useLocationBtn.classList.remove('loading');
                useLocationBtn.textContent = '📍 Use Current Location';
            }, (error) => {
                alert('Location access denied. Please enable location services.');
                useLocationBtn.classList.remove('loading');
                useLocationBtn.textContent = '📍 Use Current Location';
            });
        } else {
            alert('Geolocation is not supported by your browser.');
            useLocationBtn.classList.remove('loading');
            useLocationBtn.textContent = '📍 Use Current Location';
        }
    });

    // Address Search
    const addressInput = document.getElementById('addressInput');
    let searchTimeout;

    addressInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value;

        if (query.length < 3) {
            document.getElementById('addressSuggestions').style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
                );
                const results = await response.json();

                const suggestionsDiv = document.getElementById('addressSuggestions');
                if (results.length > 0) {
                    suggestionsDiv.innerHTML = results.map(result => `
                        <div class="suggestion-item" data-lat="${result.lat}" data-lon="${result.lon}" data-address="${result.display_name}">
                            ${result.display_name}
                        </div>
                    `).join('');
                    suggestionsDiv.style.display = 'block';

                    // Add click listeners to suggestions
                    suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', () => {
                            complaintData.location = {
                                address: item.dataset.address,
                                lat: parseFloat(item.dataset.lat),
                                lng: parseFloat(item.dataset.lon)
                            };
                            addressInput.value = item.dataset.address;
                            suggestionsDiv.style.display = 'none';
                            saveToSession();
                            validateForm();
                        });
                    });
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            } catch (error) {
                console.error('Address search failed:', error);
            }
        }, 500);
    });

    // Details Textarea
    const detailsTextarea = document.getElementById('detailsTextarea');
    const wordCounter = document.getElementById('wordCounter');
    const wordCount = document.getElementById('wordCount');

    detailsTextarea.addEventListener('input', (e) => {
        const text = e.target.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const count = words.length;

        wordCount.textContent = count;
        complaintData.details = text;

        if (count >= 10) {
            wordCounter.classList.add('valid');
            wordCounter.classList.remove('invalid');
        } else {
            wordCounter.classList.add('invalid');
            wordCounter.classList.remove('valid');
        }

        saveToSession();
        validateForm();
    });

    // Trigger initial word count
    detailsTextarea.dispatchEvent(new Event('input'));

    // Media Recording Logic
    let mediaRecorder = null;
    let mediaChunks = [];
    let recordingType = null;

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();

            // Stop all tracks
            mediaRecorder.stream.getTracks().forEach(track => track.stop());

            // Reset buttons
            addAudioBtn.classList.remove('recording');
            addAudioBtn.textContent = '🎤 Record Audio';
            addVideoBtn.classList.remove('recording');
            addVideoBtn.textContent = '📹 Record Video';

            // Re-enable other buttons
            addImageBtn.disabled = false;
            addAudioBtn.disabled = false;
            addVideoBtn.disabled = false;
        }
    };

    const startRecording = async (type) => {
        try {
            const constraints = type === 'audio' ? { audio: true } : { video: true, audio: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            mediaRecorder = new MediaRecorder(stream);
            mediaChunks = [];
            recordingType = type;

            // UI Updates
            addImageBtn.disabled = true;
            if (type === 'audio') {
                addVideoBtn.disabled = true;
                addAudioBtn.classList.add('recording');
                addAudioBtn.textContent = '⏹ Stop Recording';
            } else {
                addAudioBtn.disabled = true;
                addVideoBtn.classList.add('recording');
                addVideoBtn.textContent = '⏹ Stop Recording';

                // Show live preview for video
                mediaPreview.innerHTML = `<video autoplay muted playsinline class="live-preview"></video>`;
                mediaPreview.querySelector('video').srcObject = stream;
                mediaPreview.style.display = 'block';
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    mediaChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const mimeType = type === 'audio' ? 'audio/mp3' : 'video/webm';
                const blob = new Blob(mediaChunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const fileName = type === 'audio' ? "recording.mp3" : "recording.webm";
                const file = new File([blob], fileName, { type: mimeType });

                // Update Preview
                let previewHTML = '';
                if (type === 'audio') {
                    previewHTML = `<audio controls src="${url}"></audio>`;
                } else {
                    previewHTML = `<video controls src="${url}"></video>`;
                }

                mediaPreview.innerHTML = `
                    ${previewHTML}
                    <button class="media-remove-btn" id="removeMediaBtn">×</button>
                `;
                mediaPreview.style.display = 'block';

                // Save data
                complaintData.media = {
                    file: file,
                    type: type,
                    url: url
                };

                // Setup remove button
                document.getElementById('removeMediaBtn').addEventListener('click', () => {
                    mediaPreview.style.display = 'none';
                    mediaPreview.innerHTML = '';
                    complaintData.media = null;
                    saveToSession();

                    // Reset file input if it was used
                    mediaFileInput.value = '';
                });

                saveToSession();
            };

            mediaRecorder.start();

        } catch (err) {
            console.error('Recording error:', err);
            alert(`Could not access ${type === 'audio' ? 'microphone' : 'camera'}. Please check permissions.`);

            // Reset UI
            addImageBtn.disabled = false;
            addAudioBtn.disabled = false;
            addVideoBtn.disabled = false;
        }
    };

    addImageBtn.addEventListener('click', () => {
        console.log('📷 Image button clicked');
        mediaFileInput.accept = 'image/*';
        mediaFileInput.click();
    });

    addAudioBtn.addEventListener('click', () => {
        console.log('🎤 Audio button clicked');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            stopRecording();
        } else {
            startRecording('audio');
        }
    });

    addVideoBtn.addEventListener('click', () => {
        console.log('📹 Video button clicked');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            stopRecording();
        } else {
            startRecording('video');
        }
    });

    mediaFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const fileType = file.type.split('/')[0];

            let previewHTML = '';
            if (fileType === 'image') {
                previewHTML = `<img src="${url}" alt="Preview">`;
            } else if (fileType === 'video') {
                previewHTML = `<video controls src="${url}"></video>`;
            } else if (fileType === 'audio') {
                previewHTML = `<audio controls src="${url}"></audio>`;
            }

            mediaPreview.innerHTML = `
                ${previewHTML}
                <button class="media-remove-btn" id="removeMediaBtn">×</button>
            `;
            mediaPreview.style.display = 'block';

            complaintData.media = {
                file: file,
                type: fileType,
                url: url
            };

            document.getElementById('removeMediaBtn').addEventListener('click', () => {
                mediaPreview.style.display = 'none';
                mediaPreview.innerHTML = '';
                mediaFileInput.value = '';
                complaintData.media = null;
                saveToSession();
            });

            saveToSession();
        }
    });

    // Review & Continue Button
    const reviewBtn = document.getElementById('reviewContinueBtn');

    if (!reviewBtn) {
        console.error('❌ Review button not found!');
        return;
    }

    console.log('✅ Review button found:', reviewBtn);

    reviewBtn.addEventListener('click', (e) => {
        console.log('🔘 Review button CLICKED!', {
            disabled: reviewBtn.disabled,
            hasClass: reviewBtn.className,
            complaintData: complaintData
        });

        e.preventDefault();
        e.stopPropagation();

        if (validateForm(true)) {
            console.log('✅ Validation passed, navigating...');
            window.router.navigate('/register-gateway');
        } else {
            console.log('❌ Validation failed');
        }
    });

    console.log('✅ Event listener attached to review button');

    // Initial validation - call after a small delay to ensure DOM is ready
    setTimeout(() => {
        validateForm();
        console.log('✅ Initial validation complete', complaintData);
    }, 100);
}

function validateForm(showErrors = false) {
    const errors = [];
    const reviewBtn = document.getElementById('reviewContinueBtn');
    const errorDiv = document.getElementById('validationError');

    if (!reviewBtn) {
        console.error('Review button not found in DOM');
        return false;
    }

    if (!complaintData.category) {
        errors.push('Please select a category');
    }

    if (!complaintData.location) {
        errors.push('Please select a location');
    }

    const words = complaintData.details.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 10) {
        errors.push('Please provide at least 10 words in the description');
    }

    console.log('Validation check:', {
        category: complaintData.category,
        location: complaintData.location,
        wordCount: words.length,
        errors: errors,
        isValid: errors.length === 0
    });

    if (errors.length === 0) {
        // Enable button
        reviewBtn.removeAttribute('disabled');
        reviewBtn.classList.remove('btn-disabled');
        reviewBtn.classList.add('btn-enabled');
        if (errorDiv) errorDiv.style.display = 'none';
        console.log('✅ Form is VALID, button ENABLED');
        return true;
    } else {
        // Disable button
        reviewBtn.setAttribute('disabled', 'true');
        reviewBtn.classList.add('btn-disabled');
        reviewBtn.classList.remove('btn-enabled');
        if (showErrors && errorDiv) {
            errorDiv.textContent = errors.join('. ');
            errorDiv.style.display = 'block';
        }
        console.log('❌ Form is INVALID, button DISABLED. Errors:', errors);
        return false;
    }
}

function saveToSession() {
    // Don't save file object, just metadata
    const dataToSave = {
        ...complaintData,
        media: complaintData.media ? {
            type: complaintData.media.type,
            name: complaintData.media.file?.name
        } : null
    };
    sessionStorage.setItem('pendingComplaint', JSON.stringify(dataToSave));
}
