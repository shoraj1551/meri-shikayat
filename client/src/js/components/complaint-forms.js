export const ComplaintForms = {
    renderTextForm() {
        return `
            <form id="textComplaintForm" class="complaint-form">
                <div class="form-group">
                    <label for="category">Category *</label>
                    <select id="category" name="category" class="form-input" required>
                        <option value="">Select Category</option>
                        <option value="Roads">Roads & Potholes</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water Supply</option>
                        <option value="Sanitation">Sanitation & Garbage</option>
                        <option value="Street Lights">Street Lights</option>
                        <option value="Parks">Parks & Gardens</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="title">Subject *</label>
                    <input type="text" id="title" name="title" class="form-input" placeholder="Brief summary of the issue" required maxlength="100">
                </div>

                <div class="form-group">
                    <label for="description">Detailed Description *</label>
                    <textarea id="description" name="description" class="form-input" rows="5" placeholder="Please describe the issue in detail..." required></textarea>
                </div>

                <div class="form-group">
                    <label>Location</label>
                    <div class="location-preview">
                        <input type="text" id="locationAddress" class="form-input" placeholder="Fetching location..." readonly>
                        <input type="hidden" id="locationData">
                        <button type="button" id="refreshLocation" class="btn btn-sm btn-secondary mt-2">
                            📍 Update Location
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block">Submit Complaint</button>
            </form>
        `;
    },

    renderMediaForm(type) {
        const icons = {
            image: '📷',
            audio: '🎤',
            video: '📹'
        };

        const acceptTypes = {
            image: 'image/*',
            audio: 'audio/*',
            video: 'video/*'
        };

        return `
            <form id="${type}ComplaintForm" class="complaint-form">
                <div class="media-upload-section">
                    <div class="upload-placeholder" id="uploadPlaceholder">
                        <span class="upload-icon">${icons[type]}</span>
                        <p>Click to upload ${type}</p>
                        ${(type === 'audio' || type === 'video') ? '<button type="button" id="startRecording" class="btn btn-secondary">Start Recording</button>' : ''}
                    </div>
                    <input type="file" id="mediaFile" name="media" accept="${acceptTypes[type]}" style="display: none" required>
                    <div id="mediaPreview" class="media-preview" style="display: none"></div>
                </div>

                <div class="form-group mt-4">
                    <label for="category">Category *</label>
                    <select id="category" name="category" class="form-input" required>
                        <option value="">Select Category</option>
                        <option value="Roads">Roads & Potholes</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water Supply</option>
                        <option value="Sanitation">Sanitation & Garbage</option>
                        <option value="Street Lights">Street Lights</option>
                        <option value="Parks">Parks & Gardens</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="title">Subject *</label>
                    <input type="text" id="title" name="title" class="form-input" placeholder="Brief summary" required maxlength="100">
                </div>

                <div class="form-group">
                    <label for="description">Description (Optional)</label>
                    <textarea id="description" name="description" class="form-input" rows="3" placeholder="Add any additional details..."></textarea>
                </div>

                <div class="form-group">
                    <label>Location</label>
                    <div class="location-preview">
                        <input type="text" id="locationAddress" class="form-input" placeholder="Fetching location..." readonly>
                        <input type="hidden" id="locationData">
                        <button type="button" id="refreshLocation" class="btn btn-sm btn-secondary mt-2">
                            📍 Update Location
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block">Submit ${type.charAt(0).toUpperCase() + type.slice(1)} Complaint</button>
            </form>
        `;
    }
};
