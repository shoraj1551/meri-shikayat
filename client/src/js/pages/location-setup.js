/**
 * Location setup page component
 */

import { locationService } from '../api/location.service.js';
import { geolocation } from '../utils/geolocation.js';

export function renderLocationSetupPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="location-setup-page">
            <div class="location-container">
                <div class="location-card">
                    <h2 class="location-title">Set Your Location</h2>
                    <p class="location-subtitle">Please select your residential location to continue</p>

                    <div class="location-options">
                        <!-- Option 1: Pincode -->
                        <div class="location-option-card" id="pincodeOption">
                            <div class="option-icon">📮</div>
                            <h3>Enter Pincode</h3>
                            <p>Enter your 6-digit pincode</p>
                        </div>

                        <!-- Option 2: GPS -->
                        <div class="location-option-card" id="gpsOption">
                            <div class="option-icon">📍</div>
                            <h3>Use GPS</h3>
                            <p>Detect current location</p>
                        </div>

                        <!-- Option 3: Search -->
                        <div class="location-option-card" id="searchOption">
                            <div class="option-icon">🔍</div>
                            <h3>Search Location</h3>
                            <p>Search by village/city/district</p>
                        </div>
                    </div>

                    <!-- Pincode Form -->
                    <div id="pincodeForm" class="location-form" style="display: none;">
                        <h3>Enter Your Pincode</h3>
                        <div class="form-group">
                            <input 
                                type="text" 
                                id="pincodeInput" 
                                class="form-input" 
                                placeholder="Enter 6-digit pincode"
                                maxlength="6"
                                pattern="[0-9]{6}"
                            />
                            <button type="button" id="fetchPincode" class="btn btn-primary">Fetch Location</button>
                        </div>
                        <div id="pincodeError" class="error-message" style="display: none;"></div>
                        <div id="pincodeLoading" class="loading-message" style="display: none;">Fetching location...</div>
                    </div>

                    <!-- GPS Form -->
                    <div id="gpsForm" class="location-form" style="display: none;">
                        <h3>Detect Your Location</h3>
                        <p>Click the button below to allow location access</p>
                        <button type="button" id="detectLocation" class="btn btn-primary">Detect My Location</button>
                        <div id="gpsError" class="error-message" style="display: none;"></div>
                        <div id="gpsLoading" class="loading-message" style="display: none;">Detecting location...</div>
                    </div>

                    <!-- Search Form -->
                    <div id="searchForm" class="location-form" style="display: none;">
                        <h3>Search Your Location</h3>
                        <div class="form-group">
                            <input 
                                type="text" 
                                id="searchInput" 
                                class="form-input" 
                                placeholder="Search village, city, or district"
                            />
                        </div>
                        <div id="searchResults" class="search-results"></div>
                        <div id="searchError" class="error-message" style="display: none;"></div>
                        <div id="searchLoading" class="loading-message" style="display: none;">Searching...</div>
                    </div>

                    <!-- Location Preview -->
                    <div id="locationPreview" class="location-preview" style="display: none;">
                        <h3>Confirm Your Location</h3>
                        <div class="location-details">
                            <div class="detail-row">
                                <label>Pincode:</label>
                                <input type="text" id="previewPincode" class="form-input-sm" />
                            </div>
                            <div class="detail-row">
                                <label>Village:</label>
                                <input type="text" id="previewVillage" class="form-input-sm" />
                            </div>
                            <div class="detail-row">
                                <label>City:</label>
                                <input type="text" id="previewCity" class="form-input-sm" />
                            </div>
                            <div class="detail-row">
                                <label>District:</label>
                                <input type="text" id="previewDistrict" class="form-input-sm" />
                            </div>
                            <div class="detail-row">
                                <label>State:</label>
                                <input type="text" id="previewState" class="form-input-sm" />
                            </div>
                        </div>
                        <div class="location-actions">
                            <button type="button" id="backButton" class="btn btn-secondary">Back</button>
                            <button type="button" id="saveLocation" class="btn btn-primary">Save & Continue</button>
                        </div>
                        <div id="saveError" class="error-message" style="display: none;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let currentLocationData = null;

    // Option selection handlers
    document.getElementById('pincodeOption').addEventListener('click', () => {
        showForm('pincode');
    });

    document.getElementById('gpsOption').addEventListener('click', () => {
        showForm('gps');
    });

    document.getElementById('searchOption').addEventListener('click', () => {
        showForm('search');
    });

    // Pincode handler
    document.getElementById('fetchPincode').addEventListener('click', async () => {
        const pincode = document.getElementById('pincodeInput').value.trim();
        const errorDiv = document.getElementById('pincodeError');
        const loadingDiv = document.getElementById('pincodeLoading');

        if (!/^[0-9]{6}$/.test(pincode)) {
            errorDiv.textContent = 'Please enter a valid 6-digit pincode';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            errorDiv.style.display = 'none';
            loadingDiv.style.display = 'block';

            const response = await locationService.getLocationByPincode(pincode);

            if (response.success) {
                currentLocationData = response.data;
                showLocationPreview(response.data);
            }
        } catch (error) {
            errorDiv.textContent = error.response?.data?.message || 'Failed to fetch location. Please try again.';
            errorDiv.style.display = 'block';
        } finally {
            loadingDiv.style.display = 'none';
        }
    });

    // GPS handler
    document.getElementById('detectLocation').addEventListener('click', async () => {
        const errorDiv = document.getElementById('gpsError');
        const loadingDiv = document.getElementById('gpsLoading');

        try {
            errorDiv.style.display = 'none';
            loadingDiv.style.display = 'block';

            const coords = await geolocation.getCurrentPosition();
            const response = await locationService.reverseGeocode(coords.latitude, coords.longitude);

            if (response.success) {
                currentLocationData = response.data;
                showLocationPreview(response.data);
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'Failed to detect location. Please try another method.';
            errorDiv.style.display = 'block';
        } finally {
            loadingDiv.style.display = 'none';
        }
    });

    // Search handler
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }

        searchTimeout = setTimeout(async () => {
            const errorDiv = document.getElementById('searchError');
            const loadingDiv = document.getElementById('searchLoading');
            const resultsDiv = document.getElementById('searchResults');

            try {
                errorDiv.style.display = 'none';
                loadingDiv.style.display = 'block';

                const response = await locationService.searchLocations(query);

                if (response.success && response.data.length > 0) {
                    resultsDiv.innerHTML = response.data.map((location, index) => `
                        <div class="search-result-item" data-index="${index}">
                            <div class="result-name">${location.displayName}</div>
                            <div class="result-details">${location.city || ''}, ${location.district || ''}, ${location.state || ''}</div>
                        </div>
                    `).join('');

                    // Add click handlers to results
                    resultsDiv.querySelectorAll('.search-result-item').forEach((item, index) => {
                        item.addEventListener('click', () => {
                            currentLocationData = response.data[index];
                            showLocationPreview(response.data[index]);
                        });
                    });
                } else {
                    resultsDiv.innerHTML = '<div class="no-results">No locations found</div>';
                }
            } catch (error) {
                errorDiv.textContent = 'Search failed. Please try again.';
                errorDiv.style.display = 'block';
            } finally {
                loadingDiv.style.display = 'none';
            }
        }, 500);
    });

    // Back button
    document.getElementById('backButton').addEventListener('click', () => {
        document.getElementById('locationPreview').style.display = 'none';
        document.querySelector('.location-options').style.display = 'grid';
    });

    // Save location
    document.getElementById('saveLocation').addEventListener('click', async () => {
        const saveButton = document.getElementById('saveLocation');
        const errorDiv = document.getElementById('saveError');

        console.log('Save button clicked'); // Debug log

        const locationData = {
            pincode: document.getElementById('previewPincode').value.trim(),
            village: document.getElementById('previewVillage').value.trim(),
            city: document.getElementById('previewCity').value.trim(),
            district: document.getElementById('previewDistrict').value.trim(),
            state: document.getElementById('previewState').value.trim(),
            country: 'India',
            coordinates: currentLocationData?.coordinates
        };

        console.log('Location data:', locationData); // Debug log

        // Validate required fields
        if (!locationData.pincode || !locationData.city || !locationData.state) {
            errorDiv.textContent = 'Please fill in all required fields (Pincode, City, State)';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            errorDiv.style.display = 'none';

            // Show loading state
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';

            console.log('Calling updateUserLocation API...'); // Debug log
            const response = await locationService.updateUserLocation(locationData);
            console.log('API Response:', response); // Debug log

            if (response.success) {
                saveButton.textContent = 'Saved! Redirecting...';
                // Redirect to dashboard
                setTimeout(() => {
                    window.router.navigate('/dashboard');
                }, 500);
            } else {
                throw new Error(response.message || 'Failed to save location');
            }
        } catch (error) {
            console.error('Save location error:', error); // Debug log
            errorDiv.textContent = error.response?.data?.message || error.message || 'Failed to save location. Please try again.';
            errorDiv.style.display = 'block';

            // Reset button
            saveButton.disabled = false;
            saveButton.textContent = 'Save & Continue';
        }
    });

    function showForm(type) {
        // Hide all forms
        document.getElementById('pincodeForm').style.display = 'none';
        document.getElementById('gpsForm').style.display = 'none';
        document.getElementById('searchForm').style.display = 'none';
        document.getElementById('locationPreview').style.display = 'none';
        document.querySelector('.location-options').style.display = 'none';

        // Show selected form
        document.getElementById(`${type}Form`).style.display = 'block';
    }

    function showLocationPreview(data) {
        document.getElementById('pincodeForm').style.display = 'none';
        document.getElementById('gpsForm').style.display = 'none';
        document.getElementById('searchForm').style.display = 'none';

        document.getElementById('previewPincode').value = data.pincode || '';
        document.getElementById('previewVillage').value = data.village || '';
        document.getElementById('previewCity').value = data.city || '';
        document.getElementById('previewDistrict').value = data.district || '';
        document.getElementById('previewState').value = data.state || '';

        document.getElementById('locationPreview').style.display = 'block';
    }
}
