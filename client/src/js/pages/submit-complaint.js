import { ComplaintForms } from '../components/complaint-forms.js';
import { complaintService } from '../api/complaint.service.js';

export function renderSubmitComplaintPage() {
    const app = document.getElementById('app');
    let currentType = 'text';
    let mediaRecorder = null;
    let audioChunks = [];
    let videoChunks = [];

    app.innerHTML = `
        <div class="page-container">
            <header class="page-header">
                <div class="header-content">
                    <button class="back-btn" onclick="window.router.navigate('/dashboard')">← Back</button>
                    <h1>New Complaint</h1>
                </div>
            </header>

            <main class="main-content">
                <div class="complaint-tabs">
                    <button class="tab-btn active" data-type="text">📝 Text</button>
                    <button class="tab-btn" data-type="image">📷 Image</button>
                    <button class="tab-btn" data-type="audio">🎤 Audio</button>
                    <button class="tab-btn" data-type="video">📹 Video</button>
                </div>

                <div id="complaintFormContainer" class="form-container">
                    <!-- Form will be rendered here -->
                </div>
            </main>
        </div>
    `;

    const formContainer = document.getElementById('complaintFormContainer');
    const tabs = document.querySelectorAll('.tab-btn');

    // Function to render the correct form
    const renderForm = (type) => {
        currentType = type;
        if (type === 'text') {
            formContainer.innerHTML = ComplaintForms.renderTextForm();
        } else {
            formContainer.innerHTML = ComplaintForms.renderMediaForm(type);
        }
        setupFormListeners(type);
    };

    // Initial render
    renderForm('text');

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderForm(tab.dataset.type);
        });
    });

    // Setup listeners for the rendered form
    function setupFormListeners(type) {
        const form = document.querySelector('.complaint-form');
        const locationBtn = document.getElementById('refreshLocation');
        const locationInput = document.getElementById('locationAddress');
        const locationDataInput = document.getElementById('locationData');

        // Location Logic
        const updateLocation = () => {
            locationInput.value = 'Fetching location...';
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    locationDataInput.value = JSON.stringify({ lat: latitude, lng: longitude });

                    // Reverse geocoding (using OpenStreetMap Nominatim)
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        locationInput.value = data.display_name;
                    } catch (e) {
                        locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    }
                }, (error) => {
                    locationInput.value = 'Location access denied';
                    console.error(error);
                });
            } else {
                locationInput.value = 'Geolocation not supported';
            }
        };

        // Auto-fetch location on load
        updateLocation();
        locationBtn?.addEventListener('click', updateLocation);

        // Media Handling
        if (type !== 'text') {
            const fileInput = document.getElementById('mediaFile');
            const placeholder = document.getElementById('uploadPlaceholder');
            const preview = document.getElementById('mediaPreview');

            if (type === 'audio' || type === 'video') {
                const recordBtn = document.getElementById('startRecording');

                recordBtn?.addEventListener('click', async () => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        recordBtn.textContent = 'Start Recording';
                        recordBtn.classList.remove('recording-active');

                        // Stop all tracks to release camera/mic
                        mediaRecorder.stream.getTracks().forEach(track => track.stop());
                    } else {
                        try {
                            const constraints = type === 'audio' ? { audio: true } : { video: true, audio: true };
                            const stream = await navigator.mediaDevices.getUserMedia(constraints);

                            mediaRecorder = new MediaRecorder(stream);

                            if (type === 'audio') {
                                audioChunks = [];
                            } else {
                                videoChunks = [];
                                // Show live preview for video
                                preview.innerHTML = `<video autoplay muted playsinline></video>`;
                                preview.querySelector('video').srcObject = stream;
                                preview.style.display = 'block';
                            }

                            mediaRecorder.ondataavailable = (e) => {
                                if (e.data.size > 0) {
                                    if (type === 'audio') {
                                        audioChunks.push(e.data);
                                    } else {
                                        videoChunks.push(e.data);
                                    }
                                }
                            };

                            mediaRecorder.onstop = () => {
                                const mimeType = type === 'audio' ? 'audio/mp3' : 'video/webm';
                                const chunks = type === 'audio' ? audioChunks : videoChunks;
                                const blob = new Blob(chunks, { type: mimeType });
                                const url = URL.createObjectURL(blob);

                                if (type === 'audio') {
                                    preview.innerHTML = `<audio controls src="${url}"></audio>`;
                                } else {
                                    preview.innerHTML = `<video controls src="${url}"></video>`;
                                }
                                preview.style.display = 'block';

                                // Create a file from blob to simulate input
                                const fileName = type === 'audio' ? "recording.mp3" : "recording.webm";
                                const file = new File([blob], fileName, { type: mimeType });
                                const container = new DataTransfer();
                                container.items.add(file);
                                fileInput.files = container.files;
                            };

                            mediaRecorder.start();
                            recordBtn.textContent = 'Stop Recording';
                            recordBtn.classList.add('recording-active');
                        } catch (err) {
                            console.error(err);
                            alert(`${type === 'audio' ? 'Microphone' : 'Camera'} access denied or not available`);
                        }
                    }
                });
            }

            // Click placeholder to trigger file input
            placeholder?.addEventListener('click', (e) => {
                if (e.target.id !== 'startRecording') {
                    fileInput.click();
                }
            });

            // File selection preview
            fileInput?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    if (type === 'image') {
                        preview.innerHTML = `<img src="${url}" alt="Preview">`;
                    } else if (type === 'video') {
                        preview.innerHTML = `<video controls src="${url}"></video>`;
                    } else if (type === 'audio') {
                        preview.innerHTML = `<audio controls src="${url}"></audio>`;
                    }
                    preview.style.display = 'block';
                }
            });
        }

        // Form Submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                const formData = new FormData(form);
                formData.append('type', type);

                // Add location data
                const locData = locationDataInput.value;
                if (locData) {
                    formData.append('location', locData);
                }

                await complaintService.createComplaint(formData);
                alert('Complaint submitted successfully!');
                window.router.navigate('/dashboard');
            } catch (error) {
                alert(error.response?.data?.message || 'Submission failed');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Complaint';
            }
        });
    }
}
