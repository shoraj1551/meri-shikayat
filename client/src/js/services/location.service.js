/**
 * Location Service
 * Provides GPS-based location detection and geocoding
 */

class LocationService {
    constructor() {
        this.currentPosition = null;
    }

    /**
     * Get current GPS location
     * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                position => {
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.currentPosition);
                },
                error => {
                    let errorMessage = 'Unable to retrieve your location';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.';
                            break;
                    }

                    reject(new Error(errorMessage));
                },
                options
            );
        });
    }

    /**
     * Reverse geocode coordinates to address
     * Uses OpenStreetMap Nominatim API (free, no API key required)
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object>} Address details
     */
    async reverseGeocode(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'MeriShikayat/1.0'
                }
            });

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            return {
                formattedAddress: data.display_name,
                address: {
                    road: data.address.road || '',
                    suburb: data.address.suburb || data.address.neighbourhood || '',
                    city: data.address.city || data.address.town || data.address.village || '',
                    state: data.address.state || '',
                    postcode: data.address.postcode || '',
                    country: data.address.country || 'India'
                },
                raw: data
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw new Error('Failed to get address from coordinates');
        }
    }

    /**
     * Get current location with address
     * @returns {Promise<{coordinates: Object, address: Object}>}
     */
    async getCurrentLocationWithAddress() {
        try {
            // Get GPS coordinates
            const coords = await this.getCurrentLocation();

            // Get address from coordinates
            const addressData = await this.reverseGeocode(coords.latitude, coords.longitude);

            return {
                coordinates: coords,
                address: addressData
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Auto-fill form fields with location data
     * @param {Object} locationData - Location data from getCurrentLocationWithAddress
     * @param {Object} formFields - Object mapping field names to input elements
     */
    autoFillLocationFields(locationData, formFields) {
        const { address } = locationData;

        if (formFields.address && address.formattedAddress) {
            formFields.address.value = address.formattedAddress;
        }

        if (formFields.street && address.address.road) {
            formFields.street.value = address.address.road;
        }

        if (formFields.area && address.address.suburb) {
            formFields.area.value = address.address.suburb;
        }

        if (formFields.city && address.address.city) {
            formFields.city.value = address.address.city;
        }

        if (formFields.state && address.address.state) {
            formFields.state.value = address.address.state;
        }

        if (formFields.pincode && address.address.postcode) {
            formFields.pincode.value = address.address.postcode;
        }

        if (formFields.latitude && locationData.coordinates.latitude) {
            formFields.latitude.value = locationData.coordinates.latitude;
        }

        if (formFields.longitude && locationData.coordinates.longitude) {
            formFields.longitude.value = locationData.coordinates.longitude;
        }
    }

    /**
     * Check if geolocation is available
     * @returns {boolean}
     */
    isGeolocationAvailable() {
        return 'geolocation' in navigator;
    }

    /**
     * Request location permission
     * @returns {Promise<PermissionState>}
     */
    async requestPermission() {
        if (!('permissions' in navigator)) {
            // Fallback: try to get location (will trigger permission prompt)
            try {
                await this.getCurrentLocation();
                return 'granted';
            } catch (error) {
                return 'denied';
            }
        }

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.error('Permission query error:', error);
            return 'prompt';
        }
    }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;
