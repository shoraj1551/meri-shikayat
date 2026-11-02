/**
 * Professional Complaint Submission Form
 * Single-page design with manual location input and full media support
 */

import { categoryService } from '../api/category.service.js';
import { escapeHtml, escapeHtmlDeep, escapeJsString } from '../utils/html.js';

let formData = {
    title: '',
    description: '',
    category: null,
    customCategory: '',
    location: null,
    mediaType: null,
    mediaFile: null
};
let categories = [];
let map = null;
let marker = null;
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
const activeIntervals = new Set();
let activeLifecycleSignal = null;
const activeObjectUrls = new Set();
let leafletPromise = null;

async function loadLeaflet() {
    leafletPromise ||= Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
    ]).then(([module]) => module.default || module).catch((error) => {
        // A transient network failure must not permanently poison later attempts.
        leafletPromise = null;
        throw error;
    });
    return leafletPromise;
}

function createTrackedObjectUrl(value) {
    const url = URL.createObjectURL(value);
    activeObjectUrls.add(url);
    return url;
}

export async function renderFileComplaintNew(_params, lifecycle) {
    const app = document.getElementById('app');
    activeLifecycleSignal = lifecycle?.signal || null;

    // Only server-issued ObjectIds are submitted as categories.
    categories = [];

    // Render page immediately
    app.innerHTML = generatePageHTML();
    setupEventListeners();

    lifecycle?.onCleanup(() => {
        if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
        mediaStream?.getTracks?.().forEach((track) => track.stop());
        activeIntervals.forEach((interval) => clearInterval(interval));
        activeIntervals.clear();
        activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
        activeObjectUrls.clear();
        map?.remove?.();
        map = null;
        marker = null;
        mediaStream = null;
        mediaRecorder = null;
    });

    // Load categories from API in background
    categoryService.getCategories()
        .then(response => {
            if (lifecycle?.signal.aborted) return;
            if (response && response.length > 0) {
                categories = escapeHtmlDeep(response);
                updateCategoryDropdown();
            }
        })
        .catch(() => console.warn('Category list unavailable; custom category entry remains available.'));
}

function updateCategoryDropdown() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;

    const currentValue = categorySelect.value;
    categorySelect.innerHTML = `
        <option value="">Choose a category...</option>
        ${categories.map(cat => `
            <option value="${cat._id}">
                ${cat.icon || '📋'} ${cat.name}
            </option>
        `).join('')}
        <option value="other">✏️ Other (Specify below)</option>
    `;
    if (currentValue) categorySelect.value = currentValue;
}

function generatePageHTML() {
    return `
        <div class="complaint-page">
            <div class="complaint-container">
                <div class="complaint-header">
                    <h1>📢 Register Your Complaint</h1>
                    <p>Your voice matters. Help us make your community better.</p>
                </div>

                <form class="complaint-form" id="complaintForm">
                    <div class="form-section">
                        <label class="section-label" for="complaintTitle">Complaint title</label>
                        <input
                            type="text"
                            id="complaintTitle"
                            class="form-input"
                            placeholder="Briefly summarize the issue"
                            minlength="5"
                            maxlength="100"
                            required
                            value="${escapeHtml(formData.title)}"
                        >
                    </div>
                    <!-- Description Section -->
                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">📝</span>
                            <span>Describe Your Issue</span>
                        </label>
                        <textarea 
                            id="description" 
                            placeholder="Please describe the problem in detail..."
                            rows="6"
                            required
                        >${formData.description}</textarea>
                        <div class="char-counter">
                            <span id="charCount">0</span>/500 characters
                        </div>
                    </div>

                    <!-- Category Section -->
                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">🏷️</span>
                            <span>Select Category</span>
                        </label>
                        <select id="categorySelect" class="form-select" required>
                            <option value="">Choose a category...</option>
                            ${categories.map(cat => `
                                <option value="${cat._id}">
                                    ${cat.icon || '📋'} ${cat.name}
                                </option>
                            `).join('')}
                            <option value="other">✏️ Other (Specify below)</option>
                        </select>
                        
                        <div id="customCategoryContainer" style="display: none;">
                            <input 
                                type="text" 
                                id="customCategory" 
                                class="form-input"
                                placeholder="Enter your category..."
                                maxlength="50"
                            >
                        </div>
                    </div>

                    <!-- Location Section -->
                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">📍</span>
                            <span>Location</span>
                        </label>
                        
                        <div class="location-options">
                            <button type="button" class="location-option-btn active" data-mode="auto">
                                📍 Use GPS
                            </button>
                            <button type="button" class="location-option-btn" data-mode="manual">
                                ✏️ Enter Manually
                            </button>
                        </div>
                        
                        <!-- Auto Location Mode -->
                        <div id="autoLocationMode" class="location-mode">
                            <button type="button" class="location-btn" id="getLocationBtn">
                                <span>📍</span>
                                <span>Use My Current Location</span>
                            </button>
                            
                            <div id="mapContainer" style="display: none;">
                                <div id="map" style="height: 350px; border-radius: 12px; margin-top: 1rem;"></div>
                                <div id="locationInfo" class="location-info"></div>
                            </div>
                        </div>
                        
                        <!-- Manual Location Mode -->
                        <div id="manualLocationMode" class="location-mode" style="display: none;">
                            <input 
                                type="text" 
                                id="manualAddress" 
                                class="form-input"
                                placeholder="Enter full address (e.g., 123 Main Street, City, State, PIN)"
                                style="margin-top: 1rem;"
                            >
                            <small style="color: var(--text-gray); display: block; margin-top: 0.5rem;">
                                Please provide complete address with landmarks if possible
                            </small>
                        </div>
                    </div>

                    <!-- Evidence Section -->
                    <div class="form-section">
                        <label class="section-label">
                            <span class="label-icon">📎</span>
                            <span>Add Evidence (Optional)</span>
                        </label>
                        
                        <div class="evidence-grid">
                            <button type="button" class="evidence-card" data-type="photo">
                                <span class="evidence-icon">📷</span>
                                <span class="evidence-label">Photo</span>
                                <span class="evidence-desc">Upload or capture</span>
                            </button>
                            <button type="button" class="evidence-card" data-type="video">
                                <span class="evidence-icon">🎥</span>
                                <span class="evidence-label">Video</span>
                                <span class="evidence-desc">Upload or record</span>
                            </button>
                            <button type="button" class="evidence-card" data-type="audio">
                                <span class="evidence-icon">🎤</span>
                                <span class="evidence-label">Audio</span>
                                <span class="evidence-desc">Upload or record</span>
                            </button>
                        </div>

                        <div id="evidenceArea" style="display: none;"></div>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="submit-btn" id="submitBtn">
                        <span>Submit Complaint</span>
                        <span>→</span>
                    </button>
                </form>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    const form = document.getElementById('complaintForm');
    const titleInput = document.getElementById('complaintTitle');
    const descInput = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    const categorySelect = document.getElementById('categorySelect');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const manualAddress = document.getElementById('manualAddress');

    titleInput.addEventListener('input', (e) => {
        formData.title = e.target.value;
    });

    // Character counter
    descInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = length;
        formData.description = e.target.value;

        if (length > 500) {
            e.target.value = e.target.value.substring(0, 500);
            charCount.textContent = '500';
        }
    });
    charCount.textContent = formData.description.length;

    // Category selection
    categorySelect.addEventListener('change', (e) => {
        const customContainer = document.getElementById('customCategoryContainer');
        if (e.target.value === 'other') {
            customContainer.style.display = 'block';
            formData.category = 'other';
        } else {
            customContainer.style.display = 'none';
            formData.category = e.target.value;
            formData.customCategory = '';
        }
    });

    // Custom category input
    document.getElementById('customCategory')?.addEventListener('input', (e) => {
        formData.customCategory = e.target.value;
    });

    // Location mode switching
    document.querySelectorAll('.location-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.location-option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            document.querySelectorAll('.location-mode').forEach(m => m.style.display = 'none');
            document.getElementById(`${mode}LocationMode`).style.display = 'block';

            formData.location = null;
        });
    });

    // Manual address input
    manualAddress.addEventListener('input', (e) => {
        if (e.target.value.trim()) {
            formData.location = {
                address: e.target.value.trim(),
                manual: true
            };
        } else {
            formData.location = null;
        }
    });

    // Get location
    getLocationBtn.addEventListener('click', async () => {
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML = '<span>📍</span><span>Getting location...</span>';

        if (!navigator.geolocation) {
            window.appFeedback.notify('Geolocation is not supported by your browser.', { type: 'warning' });
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = '<span>📍</span><span>Use My Current Location</span>';
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                formData.location = { lat: latitude, lng: longitude };

                document.getElementById('mapContainer').style.display = 'block';
                await initializeMap(latitude, longitude);

                getLocationBtn.innerHTML = '<span>✓</span><span>Location Set</span>';
                getLocationBtn.style.background = '#10b981';
            },
            (error) => {
                window.appFeedback.notify('Unable to get your location. Please try again.', { type: 'error' });
                getLocationBtn.disabled = false;
                getLocationBtn.innerHTML = '<span>📍</span><span>Use My Current Location</span>';
            }
        );
    });

    // Evidence cards
    document.querySelectorAll('.evidence-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            formData.mediaType = type;
            showEvidenceOptions(type);
        });
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitComplaint();
    });
}

async function initializeMap(lat, lng) {
    const L = await loadLeaflet();

    map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng();
        formData.location = { lat, lng };
        await updateLocationInfo(lat, lng);
    });

    await updateLocationInfo(lat, lng);
}

async function updateLocationInfo(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        formData.location.address = data.display_name;

        document.getElementById('locationInfo').innerHTML = `
            <strong>📍 Selected Location:</strong>
            <p>${escapeHtml(data.display_name)}</p>
        `;
    } catch (error) {
        formData.location.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        document.getElementById('locationInfo').innerHTML = `
            <strong>📍 Coordinates:</strong>
            <p>${formData.location.address}</p>
        `;
    }
}

function showEvidenceOptions(type) {
    const evidenceArea = document.getElementById('evidenceArea');
    evidenceArea.style.display = 'block';

    const config = {
        photo: { icon: '📷', label: 'Photo', accept: 'image/*' },
        video: { icon: '🎥', label: 'Video', accept: 'video/*' },
        audio: { icon: '🎤', label: 'Audio', accept: 'audio/*' }
    };

    const typeConfig = config[type];

    evidenceArea.innerHTML = `
        <div class="evidence-options">
            <div class="option-tabs">
                <button type="button" class="tab-option active" data-mode="upload">
                    📤 Upload
                </button>
                <button type="button" class="tab-option" data-mode="capture">
                    ${type === 'photo' ? '📸 Capture' : type === 'video' ? '🎥 Record' : '🎤 Record'}
                </button>
            </div>
            
            <div class="option-content">
                <!-- Upload Mode -->
                <div id="uploadMode" class="mode-content">
                    <input type="file" id="fileInput" accept="${typeConfig.accept}" style="display: none;">
                    <div class="upload-box" id="uploadBox">
                        ${formData.mediaFile ? `
                            <div class="file-preview">
                                <span class="preview-icon">${typeConfig.icon}</span>
                                <span class="preview-name">${escapeHtml(formData.mediaFile.name)}</span>
                                <button type="button" class="remove-file" id="removeFile">✕</button>
                            </div>
                        ` : `
                            <div class="upload-placeholder">
                                <span class="upload-icon">${typeConfig.icon}</span>
                                <p>Click to upload ${typeConfig.label.toLowerCase()}</p>
                                <small>or drag and drop here</small>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Capture/Record Mode -->
                <div id="captureMode" class="mode-content" style="display: none;">
                    ${type === 'photo' ? `
                        <video id="cameraPreview" autoplay playsinline style="width: 100%; border-radius: 12px; display: none;"></video>
                        <canvas id="photoCanvas" style="display: none;"></canvas>
                        <div id="capturedPhoto" style="display: none;">
                            <img id="capturedImage" style="width: 100%; border-radius: 12px;">
                        </div>
                        <div class="capture-controls">
                            <button type="button" class="btn-capture" id="startCamera">📸 Start Camera</button>
                            <button type="button" class="btn-capture" id="capturePhoto" style="display: none;">📸 Capture Photo</button>
                            <button type="button" class="btn-secondary" id="stopCamera" style="display: none;">Stop</button>
                        </div>
                    ` : type === 'video' ? `
                        <video id="videoPreview" autoplay playsinline muted style="width: 100%; border-radius: 12px; display: none;"></video>
                        <div class="record-controls">
                            <button type="button" class="btn-capture" id="startRecording">🎥 Start Recording</button>
                            <button type="button" class="btn-danger" id="stopRecording" style="display: none;">⏹ Stop Recording</button>
                            <span id="recordTimer" style="display: none;">00:00</span>
                        </div>
                    ` : `
                        <div class="audio-visualizer">
                            <div class="recording-indicator" id="recordingIndicator">
                                <span>Ready to record</span>
                            </div>
                        </div>
                        <audio id="audioPlayback" controls style="width: 100%; display: none;"></audio>
                        <div class="record-controls">
                            <button type="button" class="btn-capture" id="startRecording">🎤 Start Recording</button>
                            <button type="button" class="btn-danger" id="stopRecording" style="display: none;">⏹ Stop Recording</button>
                            <span id="recordTimer" style="display: none;">00:00</span>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    setupEvidenceListeners(type);
}

function setupEvidenceListeners(type) {
    // Tab switching
    document.querySelectorAll('.tab-option').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-option').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const mode = tab.dataset.mode;
            document.querySelectorAll('.mode-content').forEach(m => m.style.display = 'none');
            document.getElementById(`${mode}Mode`).style.display = 'block';
        });
    });

    // Upload functionality
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.getElementById('uploadBox');

    uploadBox?.addEventListener('click', () => {
        if (!formData.mediaFile) fileInput.click();
    });

    fileInput?.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            formData.mediaFile = e.target.files[0];
            showEvidenceOptions(type);
        }
    });

    document.getElementById('removeFile')?.addEventListener('click', (e) => {
        e.stopPropagation();
        formData.mediaFile = null;
        showEvidenceOptions(type);
    });

    // Capture/Record functionality
    if (type === 'photo') {
        setupPhotoCapture();
    } else if (type === 'video') {
        setupVideoRecording();
    } else if (type === 'audio') {
        setupAudioRecording();
    }
}

function setupPhotoCapture() {
    const startBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('capturePhoto');
    const stopBtn = document.getElementById('stopCamera');
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('photoCanvas');
    const capturedDiv = document.getElementById('capturedPhoto');
    const capturedImg = document.getElementById('capturedImage');

    startBtn.addEventListener('click', async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (activeLifecycleSignal?.aborted) {
                mediaStream.getTracks().forEach((track) => track.stop());
                return;
            }
            video.srcObject = mediaStream;
            video.style.display = 'block';
            startBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
        } catch (err) {
            window.appFeedback.notify('Camera access was denied or is unavailable.', { type: 'error' });
        }
    });

    captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            formData.mediaFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            capturedImg.src = createTrackedObjectUrl(blob);
            video.style.display = 'none';
            capturedDiv.style.display = 'block';

            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }

            captureBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            startBtn.style.display = 'inline-block';
            startBtn.textContent = '📸 Retake Photo';
        });
    });

    stopBtn.addEventListener('click', () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        video.style.display = 'none';
        startBtn.style.display = 'inline-block';
        captureBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    });
}

function setupVideoRecording() {
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const video = document.getElementById('videoPreview');
    const timer = document.getElementById('recordTimer');
    let startTime;
    let timerInterval;

    startBtn.addEventListener('click', async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (activeLifecycleSignal?.aborted) {
                mediaStream.getTracks().forEach((track) => track.stop());
                return;
            }
            video.srcObject = mediaStream;
            video.style.display = 'block';

            recordedChunks = [];
            mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                formData.mediaFile = new File([blob], 'video.webm', { type: 'video/webm' });
                if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
                clearInterval(timerInterval);
            };

            mediaRecorder.start();
            startTime = Date.now();
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            timer.style.display = 'inline-block';

            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);
            activeIntervals.add(timerInterval);
        } catch (err) {
            window.appFeedback.notify('Camera or microphone access was denied or is unavailable.', { type: 'error' });
        }
    });

    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        video.style.display = 'none';
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        timer.style.display = 'none';
    });
}

function setupAudioRecording() {
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const indicator = document.getElementById('recordingIndicator');
    const playback = document.getElementById('audioPlayback');
    const timer = document.getElementById('recordTimer');
    let startTime;
    let timerInterval;

    startBtn.addEventListener('click', async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (activeLifecycleSignal?.aborted) {
                mediaStream.getTracks().forEach((track) => track.stop());
                return;
            }

            recordedChunks = [];
            mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                formData.mediaFile = new File([blob], 'audio.webm', { type: 'audio/webm' });
                playback.src = createTrackedObjectUrl(blob);
                playback.style.display = 'block';
                if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
                clearInterval(timerInterval);
                indicator.innerHTML = '<span>Recording saved</span>';
            };

            mediaRecorder.start();
            startTime = Date.now();
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            timer.style.display = 'inline-block';
            indicator.innerHTML = '<span class="pulse"></span><span>Recording...</span>';

            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);
            activeIntervals.add(timerInterval);
        } catch (err) {
            window.appFeedback.notify('Microphone access was denied or is unavailable.', { type: 'error' });
        }
    });

    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        timer.style.display = 'none';
    });
}

async function submitComplaint() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.appFeedback.notify('Please sign in to submit a complaint. Your draft has not been submitted.', { type: 'warning' });
        return;
    }
    const submitBtn = document.getElementById('submitBtn');

    // Validation
    formData.title = formData.title.trim();
    if (formData.title.length < 5) {
        window.appFeedback.notify('Please provide a title of at least 5 characters.', { type: 'warning' });
        return;
    }

    if (!formData.description || formData.description.length < 20) {
        window.appFeedback.notify('Please provide a description of at least 20 characters.', { type: 'warning' });
        return;
    }

    if (!formData.category) {
        window.appFeedback.notify('Please select a category.', { type: 'warning' });
        return;
    }

    if (formData.category === 'other' && !formData.customCategory) {
        window.appFeedback.notify('Please specify your custom category.', { type: 'warning' });
        return;
    }

    if (!formData.location) {
        window.appFeedback.notify('Please set your location using GPS or enter it manually.', { type: 'warning' });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';

    let normalizedLocation;
    let submitData;
    try {
        normalizedLocation = await normalizeLocationForApi(formData.location);
        submitData = buildComplaintFormData(formData, normalizedLocation);

        const endpoint = '/complaints';
        const { apiUrl } = await import('../config/api.js');
        const url = apiUrl(endpoint);

        const response = await fetch(url, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: submitData
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(result.data.complaintId);
        } else {
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        // Offline Handling
        if (!navigator.onLine && submitData) {
            console.log('Network failed, attempting offline save...');
            const saved = await window.pwaManager.saveOfflineComplaint(submitData);

            if (saved) {
                showSuccess('OFFLINE-PENDING');
                return;
            }
        }

        console.error('Submit error:', error);
        window.appFeedback.notify(`Failed to submit complaint: ${error.message}`, { type: 'error' });
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Complaint</span><span>→</span>';
    }
}

export function buildComplaintFormData(data, normalizedLocation, FormDataCtor = FormData) {
    const payload = new FormDataCtor();
    const type = data.mediaFile
        ? ({ photo: 'image', video: 'video', audio: 'audio' }[data.mediaType] || 'text')
        : 'text';
    payload.append('title', data.title.trim());
    payload.append('type', type);
    payload.append('description', data.description.trim());
    if (data.category === 'other') payload.append('customCategory', data.customCategory.trim());
    else payload.append('category', data.category);
    payload.append('location', JSON.stringify(normalizedLocation));
    if (data.mediaFile) payload.append('media', data.mediaFile);
    return payload;
}

export async function normalizeLocationForApi(location, fetchImpl = fetch) {
    if (Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
        return {
            address: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
            coordinates: { lat: location.lat, lng: location.lng }
        };
    }

    if (location.manual && location.address) {
        const response = await fetchImpl(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location.address)}`
        );
        if (!response.ok) throw new Error('Unable to validate the entered location');
        const [match] = await response.json();
        if (!match) throw new Error('Unable to find coordinates for the entered address');
        return {
            address: location.address,
            coordinates: { lat: Number(match.lat), lng: Number(match.lon) }
        };
    }

    throw new Error('A valid complaint location is required');
}

function showSuccess(complaintId) {
    const app = document.getElementById('app');
    const isAuth = !!localStorage.getItem('token');

    app.innerHTML = `
        <div class="success-page">
            <div class="success-card">
                <div class="success-icon">✅</div>
                <h1>${complaintId === 'OFFLINE-PENDING' ? 'Saved Offline' : 'Complaint Submitted Successfully!'}</h1>
                <p>${complaintId === 'OFFLINE-PENDING'
            ? 'You are offline. Your complaint has been saved and will be submitted automatically when you are back online.'
            : 'Your complaint has been registered and will be reviewed soon.'}</p>
                
                ${complaintId !== 'OFFLINE-PENDING' ? `
                <div class="complaint-id-card">
                    <label>Your Complaint ID</label>
                    <div class="id-box">
                        <code>${escapeHtml(complaintId)}</code>
                        <button onclick="navigator.clipboard.writeText('${escapeJsString(complaintId)}'); this.textContent='Copied!'">Copy</button>
                    </div>
                    <small>Save this ID to track your complaint</small>
                </div>
                ` : ''}
                
                <div class="success-actions">
                    ${isAuth ? `
                        <button onclick="window.router.navigate('/dashboard')" class="primary-btn">
                            Go to Dashboard
                        </button>
                    ` : `
                        <button onclick="window.router.navigate('/login')" class="primary-btn">
                            Login to Track
                        </button>
                    `}
                    <button onclick="window.router.navigate('/')" class="secondary-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    `;
}
