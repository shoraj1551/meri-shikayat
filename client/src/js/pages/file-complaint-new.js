/**
 * Redesigned Complaint Submission Page
 * Complete media support: Photo, Video, Audio (Upload + Record)
 * Guest and Authenticated user support
 */

import { categoryService } from '../api/category.service.js';

let currentStep = 1;
let formData = {
    description: '',
    category: null,
    customCategory: '',
    location: null,
    mediaType: null,  // 'photo', 'video', 'audio', or null
    mediaFile: null,
    guestContact: null
};
let categories = [];
let map = null;
let marker = null;
let mediaRecorder = null;
let recordedChunks = [];

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
                        <div class="step-circle">
                            <div class="step-number">1</div>
                        </div>
                        <div class="step-label">Details</div>
                    </div>
                    <div class="progress-line ${currentStep >= 2 ? 'active' : ''}"></div>
                    <div class="progress-step ${currentStep >= 2 ? 'active' : ''}" data-step="2">
                        <div class="step-circle">
                            <div class="step-number">2</div>
                        </div>
                        <div class="step-label">Location</div>
                    </div>
                    <div class="progress-line ${currentStep >= 3 ? 'active' : ''}"></div>
                    <div class="progress-step ${currentStep >= 3 ? 'active' : ''}" data-step="3">
                        <div class="step-circle">
                            <div class="step-number">3</div>
                        </div>
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

// Step 1: Problem Description + Media
function initializeStep1() {
    const content = document.getElementById('wizardContent');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    backBtn.style.display = 'none';
    nextBtn.textContent = 'Next →';

    content.innerHTML = `
        <div class="step-content step-1">
            <h2>📝 Describe Your Complaint</h2>
            <p class="step-subtitle">Provide details about the issue</p>

            <!-- Description -->
            <div class="form-group">
                <label>Description *</label>
                <textarea 
                    id="description" 
                    placeholder="Describe the problem in detail..."
                    rows="5"
                    maxlength="500"
                >${formData.description}</textarea>
                <div class="char-counter">
                    <span id="charCount">${formData.description.length}</span>/500 
                    <span class="min-chars">(minimum 20 characters)</span>
                </div>
            </div>

            <!-- Category Selection -->
            <div class="form-group">
                <label>Category *</label>
                <div class="category-selector">
                    <select id="categorySelect" class="category-dropdown">
                        <option value="">-- Select Category --</option>
                        ${categories.map(cat => `
                            <option value="${cat._id}" ${formData.category === cat._id ? 'selected' : ''}>
                                ${cat.icon || '📋'} ${cat.name}
                            </option>
                        `).join('')}
                        <option value="custom" ${formData.category === 'custom' ? 'selected' : ''}>
                            ✏️ Other (Specify)
                        </option>
                    </select>
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

            <!-- Media Options -->
            <div class="form-group">
                <label>Add Evidence (Optional)</label>
                <div class="media-options">
                    <button type="button" class="media-option-btn ${formData.mediaType === 'photo' ? 'active' : ''}" data-type="photo">
                        <span class="media-icon">📷</span>
                        <span>Photo</span>
                    </button>
                    <button type="button" class="media-option-btn ${formData.mediaType === 'video' ? 'active' : ''}" data-type="video">
                        <span class="media-icon">📹</span>
                        <span>Video</span>
                    </button>
                    <button type="button" class="media-option-btn ${formData.mediaType === 'audio' ? 'active' : ''}" data-type="audio">
                        <span class="media-icon">🎤</span>
                        <span>Audio</span>
                    </button>
                </div>

                <!-- Media Upload/Record Area -->
                <div id="mediaArea" class="media-area" style="display: ${formData.mediaType ? 'block' : 'none'}">
                    <!-- Will be populated based on media type -->
                </div>
            </div>
        </div>
    `;

    setupStep1Listeners();
    if (formData.mediaType) {
        showMediaControls(formData.mediaType);
    }

    nextBtn.onclick = () => {
        if (validateStep1()) {
            currentStep = 2;
            initializeStep2();
        }
    };
}

function setupStep1Listeners() {
    // Character counter
    const descInput = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    descInput.addEventListener('input', (e) => {
        charCount.textContent = e.target.value.length;
        formData.description = e.target.value;
    });

    // Category selection
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.addEventListener('change', (e) => {
        formData.category = e.target.value;
        if (e.target.value === 'custom') {
            initializeStep1(); // Re-render to show custom input
        } else {
            formData.customCategory = '';
        }
    });

    // Custom category input
    document.getElementById('customCategory')?.addEventListener('input', (e) => {
        formData.customCategory = e.target.value;
    });

    // Media type selection
    document.querySelectorAll('.media-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;

            // Toggle selection
            if (formData.mediaType === type) {
                formData.mediaType = null;
                formData.mediaFile = null;
                document.getElementById('mediaArea').style.display = 'none';
                btn.classList.remove('active');
            } else {
                document.querySelectorAll('.media-option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                formData.mediaType = type;
                formData.mediaFile = null;
                showMediaControls(type);
            }
        });
    });
}

function showMediaControls(type) {
    const mediaArea = document.getElementById('mediaArea');
    mediaArea.style.display = 'block';

    let html = '';

    if (type === 'photo') {
        html = `
            <div class="media-controls">
                <div class="upload-record-tabs">
                    <button class="tab-btn active" data-mode="upload">📤 Upload Photo</button>
                    <button class="tab-btn" data-mode="capture">📸 Take Photo</button>
                </div>
                <div class="media-content">
                    <div id="uploadMode" class="media-mode">
                        <input type="file" id="photoInput" accept="image/*" style="display: none;">
                        <div class="upload-zone" id="photoUploadZone">
                            ${formData.mediaFile ? `
                                <img src="${URL.createObjectURL(formData.mediaFile)}" class="media-preview">
                                <button class="remove-media-btn" id="removeMedia">✕ Remove</button>
                            ` : `
                                <div class="upload-placeholder">
                                    <div class="upload-icon">📷</div>
                                    <p>Click to upload or drag & drop</p>
                                    <small>JPG, PNG up to 10MB</small>
                                </div>
                            `}
                        </div>
                    </div>
                    <div id="captureMode" class="media-mode" style="display: none;">
                        <video id="cameraPreview" autoplay playsinline style="width: 100%; border-radius: 8px;"></video>
                        <canvas id="photoCanvas" style="display: none;"></canvas>
                        <div class="capture-controls">
                            <button class="btn btn-primary" id="startCamera">📸 Start Camera</button>
                            <button class="btn btn-primary" id="capturePhoto" style="display: none;">📸 Capture</button>
                            <button class="btn btn-outline" id="stopCamera" style="display: none;">Stop</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'video') {
        html = `
            <div class="media-controls">
                <div class="upload-record-tabs">
                    <button class="tab-btn active" data-mode="upload">📤 Upload Video</button>
                    <button class="tab-btn" data-mode="record">🎥 Record Video</button>
                </div>
                <div class="media-content">
                    <div id="uploadMode" class="media-mode">
                        <input type="file" id="videoInput" accept="video/*" style="display: none;">
                        <div class="upload-zone" id="videoUploadZone">
                            ${formData.mediaFile ? `
                                <video src="${URL.createObjectURL(formData.mediaFile)}" controls class="media-preview"></video>
                                <button class="remove-media-btn" id="removeMedia">✕ Remove</button>
                            ` : `
                                <div class="upload-placeholder">
                                    <div class="upload-icon">📹</div>
                                    <p>Click to upload or drag & drop</p>
                                    <small>MP4, WebM up to 50MB</small>
                                </div>
                            `}
                        </div>
                    </div>
                    <div id="recordMode" class="media-mode" style="display: none;">
                        <video id="videoPreview" autoplay playsinline muted style="width: 100%; border-radius: 8px;"></video>
                        <div class="record-controls">
                            <button class="btn btn-primary" id="startRecording">🎥 Start Recording</button>
                            <button class="btn btn-danger" id="stopRecording" style="display: none;">⏹ Stop</button>
                            <span id="recordingTime" style="display: none;">00:00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'audio') {
        html = `
            <div class="media-controls">
                <div class="upload-record-tabs">
                    <button class="tab-btn active" data-mode="upload">📤 Upload Audio</button>
                    <button class="tab-btn" data-mode="record">🎤 Record Audio</button>
                </div>
                <div class="media-content">
                    <div id="uploadMode" class="media-mode">
                        <input type="file" id="audioInput" accept="audio/*" style="display: none;">
                        <div class="upload-zone" id="audioUploadZone">
                            ${formData.mediaFile ? `
                                <audio src="${URL.createObjectURL(formData.mediaFile)}" controls class="media-preview"></audio>
                                <button class="remove-media-btn" id="removeMedia">✕ Remove</button>
                            ` : `
                                <div class="upload-placeholder">
                                    <div class="upload-icon">🎤</div>
                                    <p>Click to upload or drag & drop</p>
                                    <small>MP3, WAV up to 20MB</small>
                                </div>
                            `}
                        </div>
                    </div>
                    <div id="recordMode" class="media-mode" style="display: none;">
                        <div class="audio-visualizer">
                            <div class="recording-indicator" id="recordingIndicator">
                                <span class="pulse"></span>
                                <span>Ready to record</span>
                            </div>
                        </div>
                        <audio id="audioPlayback" controls style="width: 100%; display: none;"></audio>
                        <div class="record-controls">
                            <button class="btn btn-primary" id="startRecording">🎤 Start Recording</button>
                            <button class="btn btn-danger" id="stopRecording" style="display: none;">⏹ Stop</button>
                            <span id="recordingTime" style="display: none;">00:00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    mediaArea.innerHTML = html;
    setupMediaListeners(type);
}

function setupMediaListeners(type) {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            document.querySelectorAll('.media-mode').forEach(m => m.style.display = 'none');
            document.getElementById(`${mode}Mode`).style.display = 'block';
        });
    });

    // Upload listeners
    if (type === 'photo') {
        setupPhotoUpload();
        setupPhotoCapture();
    } else if (type === 'video') {
        setupVideoUpload();
        setupVideoRecording();
    } else if (type === 'audio') {
        setupAudioUpload();
        setupAudioRecording();
    }
}

// Photo upload/capture functions
function setupPhotoUpload() {
    const input = document.getElementById('photoInput');
    const zone = document.getElementById('photoUploadZone');

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            formData.mediaFile = e.target.files[0];
            showMediaControls('photo');
        }
    });

    document.getElementById('removeMedia')?.addEventListener('click', (e) => {
        e.stopPropagation();
        formData.mediaFile = null;
        showMediaControls('photo');
    });
}

function setupPhotoCapture() {
    let stream = null;
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('photoCanvas');
    const startBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('capturePhoto');
    const stopBtn = document.getElementById('stopCamera');

    startBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = 'block';
            startBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
        } catch (err) {
            alert('Camera access denied');
        }
    });

    captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            formData.mediaFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            // Switch to upload mode to show preview
            document.querySelector('[data-mode="upload"]').click();
        });
    });

    stopBtn.addEventListener('click', () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.style.display = 'none';
        startBtn.style.display = 'inline-block';
        captureBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    });
}

// Video upload/recording functions
function setupVideoUpload() {
    const input = document.getElementById('videoInput');
    const zone = document.getElementById('videoUploadZone');

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            formData.mediaFile = e.target.files[0];
            showMediaControls('video');
        }
    });

    document.getElementById('removeMedia')?.addEventListener('click', (e) => {
        e.stopPropagation();
        formData.mediaFile = null;
        showMediaControls('video');
    });
}

function setupVideoRecording() {
    let stream = null;
    let recorder = null;
    let chunks = [];
    let startTime = null;
    let timerInterval = null;

    const video = document.getElementById('videoPreview');
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const timeDisplay = document.getElementById('recordingTime');

    startBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            video.srcObject = stream;

            recorder = new MediaRecorder(stream);
            chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                formData.mediaFile = new File([blob], 'video.webm', { type: 'video/webm' });
                if (stream) stream.getTracks().forEach(track => track.stop());
                clearInterval(timerInterval);
                // Switch to upload mode
                document.querySelector('[data-mode="upload"]').click();
            };

            recorder.start();
            startTime = Date.now();
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            timeDisplay.style.display = 'inline-block';

            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);

        } catch (err) {
            alert('Camera/microphone access denied');
        }
    });

    stopBtn.addEventListener('click', () => {
        if (recorder && recorder.state === 'recording') {
            recorder.stop();
        }
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        timeDisplay.style.display = 'none';
    });
}

// Audio upload/recording functions
function setupAudioUpload() {
    const input = document.getElementById('audioInput');
    const zone = document.getElementById('audioUploadZone');

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            formData.mediaFile = e.target.files[0];
            showMediaControls('audio');
        }
    });

    document.getElementById('removeMedia')?.addEventListener('click', (e) => {
        e.stopPropagation();
        formData.mediaFile = null;
        showMediaControls('audio');
    });
}

function setupAudioRecording() {
    let stream = null;
    let recorder = null;
    let chunks = [];
    let startTime = null;
    let timerInterval = null;

    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const timeDisplay = document.getElementById('recordingTime');
    const indicator = document.getElementById('recordingIndicator');
    const playback = document.getElementById('audioPlayback');

    startBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            recorder = new MediaRecorder(stream);
            chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                formData.mediaFile = new File([blob], 'audio.webm', { type: 'audio/webm' });
                playback.src = URL.createObjectURL(blob);
                playback.style.display = 'block';
                if (stream) stream.getTracks().forEach(track => track.stop());
                clearInterval(timerInterval);
                indicator.innerHTML = '<span>Recording saved</span>';
            };

            recorder.start();
            startTime = Date.now();
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            timeDisplay.style.display = 'inline-block';
            indicator.innerHTML = '<span class="pulse"></span><span>Recording...</span>';

            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);

        } catch (err) {
            alert('Microphone access denied');
        }
    });

    stopBtn.addEventListener('click', () => {
        if (recorder && recorder.state === 'recording') {
            recorder.stop();
        }
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        timeDisplay.style.display = 'none';
    });
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

// Step 2 and 3 remain the same as before...
// (I'll keep the existing location and review steps)

async function initializeStep2() {
    const content = document.getElementById('wizardContent');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    backBtn.style.display = 'block';
    nextBtn.textContent = 'Next →';

    content.innerHTML = `
        <div class="step-content step-2">
            <h2>📍 Where is it?</h2>
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
                ` : '<p class="text-muted">Click "Use My Current Location" or click on the map</p>'}
            </div>
        </div>
    `;

    await initializeMap();
    document.getElementById('useMyLocation').addEventListener('click', getCurrentLocation);

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
    const L = window.L;
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    map = L.map('map').setView(formData.location ? [formData.location.lat, formData.location.lng] : defaultCenter, formData.location ? 15 : defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (formData.location) {
        marker = L.marker([formData.location.lat, formData.location.lng], { draggable: true }).addTo(map);
        marker.on('dragend', updateLocationFromMarker);
    }

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
            map.setView([latitude, longitude], 15);

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
            alert('Unable to get your location');
            btn.disabled = false;
            btn.textContent = '📍 Use My Current Location';
        }
    );
}

async function updateLocation(lat, lng) {
    formData.location = { lat, lng };

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        formData.location.address = data.display_name;
    } catch (error) {
        formData.location.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

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
            <h2>✅ Review Your Complaint</h2>
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

                ${formData.mediaFile ? `
                    <div class="review-section">
                        <div class="review-header">
                            <strong>Evidence (${formData.mediaType})</strong>
                            <button class="edit-btn" data-step="1">Edit</button>
                        </div>
                        ${formData.mediaType === 'photo' ? `
                            <img src="${URL.createObjectURL(formData.mediaFile)}" class="review-photo">
                        ` : formData.mediaType === 'video' ? `
                            <video src="${URL.createObjectURL(formData.mediaFile)}" controls class="review-video"></video>
                        ` : `
                            <audio src="${URL.createObjectURL(formData.mediaFile)}" controls class="review-audio"></audio>
                        `}
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

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step);
            currentStep = step;
            if (step === 1) initializeStep1();
            else if (step === 2) initializeStep2();
        });
    });

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

        if (formData.mediaFile) {
            submitData.append('media', formData.mediaFile);
        }

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

    document.getElementById('copyId').addEventListener('click', () => {
        navigator.clipboard.writeText(complaintId);
        const btn = document.getElementById('copyId');
        btn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
        setTimeout(() => {
            btn.innerHTML = '<span class="copy-icon">📋</span> Copy';
        }, 2000);
    });
}
