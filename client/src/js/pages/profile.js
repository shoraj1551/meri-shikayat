/**
 * User Profile Page Component - Comprehensive Edition
 * Profile picture upload, education, work, social links, preferences, badges
 */

import { profileService } from '../api/profile.service.js';
import Loading from '../components/loading.js';

export async function renderProfilePage() {
    const app = document.getElementById('app');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Show loading state
    app.innerHTML = Loading.spinner('Loading your profile...');

    try {
        // Fetch complete profile data
        const profileData = await profileService.getProfile();

        // Render profile page
        renderProfileContent(app, profileData);

        // Initialize event listeners
        initializeProfileListeners(profileData);

    } catch (error) {
        console.error('Profile Error:', error);
        app.innerHTML = `
            <div class="container">
                <div class="error-message">
                    <h3>😕 Failed to load profile</h3>
                    <p>${error.message || 'Please try again later.'}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
                </div>
            </div>
        `;
    }
}

function renderProfileContent(app, profile) {
    const completion = calculateProfileCompletion(profile);
    const missingFields = getMissingFields(profile);

    app.innerHTML = `
        <div class="profile-page">
            <div class="container">
                <!-- Profile Header -->
                <div class="profile-header">
                    <button class="btn-back" onclick="window.router.navigate('/dashboard')">
                        ← Back to Dashboard
                    </button>
                    <h1>My Profile</h1>
                </div>

                <!-- Profile Overview Section -->
                <div class="profile-overview">
                    <!-- Profile Picture Section -->
                    <div class="profile-picture-section">
                        <div class="profile-picture-container">
                            ${profile.profilePicture?.url ?
            `<img src="${profile.profilePicture.url}" alt="Profile Picture" class="profile-picture" id="profilePictureImg">` :
            `<div class="profile-picture-placeholder" id="profilePicturePlaceholder">
                                    <span class="placeholder-initials">${getInitials(profile)}</span>
                                </div>`
        }
                            <button class="btn-upload-picture" id="uploadPictureBtn" title="Upload Profile Picture">
                                📷
                            </button>
                            <input type="file" id="profilePictureInput" accept="image/*" style="display: none;">
                        </div>
                        <div class="profile-name-display">
                            <h2>${profile.firstName} ${profile.lastName}</h2>
                            <p class="profile-email">${profile.email} ${profile.verification?.email ? '✓' : ''}</p>
                            <p class="member-since">Member since ${new Date(profile.memberSince || profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <!-- Profile Completion Card -->
                    <div class="profile-completion-card">
                        <h3>Profile Completion</h3>
                        <div class="completion-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completion}%"></div>
                            </div>
                            <span class="completion-percentage">${completion}%</span>
                        </div>
                        ${missingFields.length > 0 ? `
                            <div class="missing-fields">
                                <p><strong>Complete your profile:</strong></p>
                                <ul>
                                    ${missingFields.map(field => `<li>• ${field}</li>`).join('')}
                                </ul>
                            </div>
                        ` : `
                            <div class="profile-complete">
                                <p>🎉 Your profile is complete!</p>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Stats Dashboard -->
                <div class="profile-stats-dashboard">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-value">${profile.stats?.totalComplaints || 0}</div>
                        <div class="stat-label">Complaints Filed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${profile.stats?.resolvedComplaints || 0}</div>
                        <div class="stat-label">Resolved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${profile.stats?.impactScore || 0}</div>
                        <div class="stat-label">Impact Score</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${profile.badges?.length || 0}</div>
                        <div class="stat-label">Badges Earned</div>
                    </div>
                </div>

                <!-- Profile Tabs -->
                <div class="profile-tabs-container">
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-tab="personal">Personal Info</button>
                        <button class="tab-btn" data-tab="education">Education</button>
                        <button class="tab-btn" data-tab="work">Work</button>
                        <button class="tab-btn" data-tab="social">Social Links</button>
                        <button class="tab-btn" data-tab="preferences">Preferences</button>
                        <button class="tab-btn" data-tab="badges">Badges</button>
                    </div>

                    <div class="tab-content-container">
                        <!-- Personal Info Tab -->
                        <div class="tab-content active" id="personal-tab">
                            ${renderPersonalInfoTab(profile)}
                        </div>

                        <!-- Education Tab -->
                        <div class="tab-content" id="education-tab">
                            ${renderEducationTab(profile)}
                        </div>

                        <!-- Work Tab -->
                        <div class="tab-content" id="work-tab">
                            ${renderWorkTab(profile)}
                        </div>

                        <!-- Social Links Tab -->
                        <div class="tab-content" id="social-tab">
                            ${renderSocialTab(profile)}
                        </div>

                        <!-- Preferences Tab -->
                        <div class="tab-content" id="preferences-tab">
                            ${renderPreferencesTab(profile)}
                        </div>

                        <!-- Badges Tab -->
                        <div class="tab-content" id="badges-tab">
                            ${renderBadgesTab(profile)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPersonalInfoTab(profile) {
    return `
        <div class="tab-section">
            <div class="section-header">
                <h3>Personal Information</h3>
                <button class="btn btn-secondary" id="editPersonalBtn">Edit</button>
            </div>

            <form class="profile-form" id="personalInfoForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" name="firstName" value="${profile.firstName || ''}" required disabled>
                    </div>
                    <div class="form-group">
                        <label>Middle Name</label>
                        <input type="text" name="middleName" value="${profile.middleName || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" name="lastName" value="${profile.lastName || ''}" required disabled>
                    </div>
                    <div class="form-group">
                        <label>Display Name</label>
                        <input type="text" name="displayName" value="${profile.displayName || ''}" placeholder="How you want to be called" disabled>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date" name="dateOfBirth" value="${profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Gender</label>
                        <select name="gender" disabled>
                            <option value="">Select Gender</option>
                            <option value="Male" ${profile.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${profile.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${profile.gender === 'Other' ? 'selected' : ''}>Other</option>
                            <option value="Prefer not to say" ${profile.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phoneNumber" value="${profile.phoneNumber || ''}" placeholder="+91 XXXXX XXXXX" disabled>
                    </div>
                    <div class="form-group full-width">
                        <label>Bio (150 characters max)</label>
                        <textarea name="bio" maxlength="150" rows="3" placeholder="Tell us about yourself..." disabled>${profile.bio || ''}</textarea>
                        <small class="char-count">0/150</small>
                    </div>
                </div>

                <div class="section-divider"></div>

                <h4>Location Details</h4>
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label>Address</label>
                        <input type="text" name="address" value="${profile.location?.address || ''}" placeholder="Street address" disabled>
                    </div>
                    <div class="form-group">
                        <label>Pincode *</label>
                        <input type="text" name="pincode" value="${profile.location?.pincode || ''}" pattern="[0-9]{6}" placeholder="110001" disabled>
                    </div>
                    <div class="form-group">
                        <label>City *</label>
                        <input type="text" name="city" value="${profile.location?.city || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>State *</label>
                        <input type="text" name="state" value="${profile.location?.state || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>District</label>
                        <input type="text" name="district" value="${profile.location?.district || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Landmark</label>
                        <input type="text" name="landmark" value="${profile.location?.landmark || ''}" placeholder="Near..." disabled>
                    </div>
                    <div class="form-group">
                        <label>Residential Type</label>
                        <select name="residentialType" disabled>
                            <option value="">Select Type</option>
                            <option value="Own" ${profile.location?.residentialType === 'Own' ? 'selected' : ''}>Own</option>
                            <option value="Rent" ${profile.location?.residentialType === 'Rent' ? 'selected' : ''}>Rent</option>
                            <option value="Other" ${profile.location?.residentialType === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions" style="display: none;">
                    <button type="button" class="btn btn-secondary" id="cancelPersonalBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function renderEducationTab(profile) {
    return `
        <div class="tab-section">
            <div class="section-header">
                <h3>Education Information</h3>
                <button class="btn btn-secondary" id="editEducationBtn">Edit</button>
            </div>

            <form class="profile-form" id="educationForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Highest Qualification</label>
                        <select name="highestQualification" disabled>
                            <option value="">Select Qualification</option>
                            <option value="High School" ${profile.education?.highestQualification === 'High School' ? 'selected' : ''}>High School</option>
                            <option value="Diploma" ${profile.education?.highestQualification === 'Diploma' ? 'selected' : ''}>Diploma</option>
                            <option value="Bachelor" ${profile.education?.highestQualification === 'Bachelor' ? 'selected' : ''}>Bachelor's Degree</option>
                            <option value="Master" ${profile.education?.highestQualification === 'Master' ? 'selected' : ''}>Master's Degree</option>
                            <option value="PhD" ${profile.education?.highestQualification === 'PhD' ? 'selected' : ''}>PhD</option>
                            <option value="Other" ${profile.education?.highestQualification === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Institution Name</label>
                        <input type="text" name="institutionName" value="${profile.education?.institutionName || ''}" placeholder="University/College name" disabled>
                    </div>
                    <div class="form-group">
                        <label>Field of Study</label>
                        <input type="text" name="fieldOfStudy" value="${profile.education?.fieldOfStudy || ''}" placeholder="e.g., Computer Science" disabled>
                    </div>
                    <div class="form-group">
                        <label>Year of Completion</label>
                        <input type="number" name="yearOfCompletion" value="${profile.education?.yearOfCompletion || ''}" min="1950" max="${new Date().getFullYear()}" placeholder="2020" disabled>
                    </div>
                    <div class="form-group full-width">
                        <label>Certifications (comma separated)</label>
                        <input type="text" name="certifications" value="${profile.education?.certifications?.join(', ') || ''}" placeholder="AWS Certified, PMP, etc." disabled>
                    </div>
                </div>

                <div class="form-actions" style="display: none;">
                    <button type="button" class="btn btn-secondary" id="cancelEducationBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function renderWorkTab(profile) {
    return `
        <div class="tab-section">
            <div class="section-header">
                <h3>Work Information</h3>
                <button class="btn btn-secondary" id="editWorkBtn">Edit</button>
            </div>

            <form class="profile-form" id="workForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Employment Status</label>
                        <select name="employmentStatus" disabled>
                            <option value="">Select Status</option>
                            <option value="Employed" ${profile.work?.employmentStatus === 'Employed' ? 'selected' : ''}>Employed</option>
                            <option value="Self-employed" ${profile.work?.employmentStatus === 'Self-employed' ? 'selected' : ''}>Self-employed</option>
                            <option value="Student" ${profile.work?.employmentStatus === 'Student' ? 'selected' : ''}>Student</option>
                            <option value="Retired" ${profile.work?.employmentStatus === 'Retired' ? 'selected' : ''}>Retired</option>
                            <option value="Unemployed" ${profile.work?.employmentStatus === 'Unemployed' ? 'selected' : ''}>Unemployed</option>
                            <option value="Other" ${profile.work?.employmentStatus === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Company/Organization</label>
                        <input type="text" name="companyName" value="${profile.work?.companyName || ''}" placeholder="Company name" disabled>
                    </div>
                    <div class="form-group">
                        <label>Job Title/Position</label>
                        <input type="text" name="jobTitle" value="${profile.work?.jobTitle || ''}" placeholder="Software Engineer" disabled>
                    </div>
                    <div class="form-group">
                        <label>Industry</label>
                        <input type="text" name="industry" value="${profile.work?.industry || ''}" placeholder="Technology, Healthcare, etc." disabled>
                    </div>
                    <div class="form-group">
                        <label>Years of Experience</label>
                        <input type="number" name="yearsOfExperience" value="${profile.work?.yearsOfExperience || ''}" min="0" max="50" placeholder="5" disabled>
                    </div>
                    <div class="form-group">
                        <label>Work Location</label>
                        <input type="text" name="workLocation" value="${profile.work?.workLocation || ''}" placeholder="City, State" disabled>
                    </div>
                </div>

                <div class="form-actions" style="display: none;">
                    <button type="button" class="btn btn-secondary" id="cancelWorkBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function renderSocialTab(profile) {
    return `
        <div class="tab-section">
            <div class="section-header">
                <h3>Social & Professional Links</h3>
                <button class="btn btn-secondary" id="editSocialBtn">Edit</button>
            </div>

            <form class="profile-form" id="socialForm">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label>LinkedIn Profile</label>
                        <input type="url" name="linkedin" value="${profile.socialLinks?.linkedin || ''}" placeholder="https://linkedin.com/in/username" disabled>
                    </div>
                    <div class="form-group full-width">
                        <label>Twitter/X Handle</label>
                        <input type="url" name="twitter" value="${profile.socialLinks?.twitter || ''}" placeholder="https://twitter.com/username" disabled>
                    </div>
                    <div class="form-group full-width">
                        <label>Facebook Profile</label>
                        <input type="url" name="facebook" value="${profile.socialLinks?.facebook || ''}" placeholder="https://facebook.com/username" disabled>
                    </div>
                    <div class="form-group full-width">
                        <label>Website/Portfolio</label>
                        <input type="url" name="website" value="${profile.socialLinks?.website || ''}" placeholder="https://yourwebsite.com" disabled>
                    </div>
                </div>

                <div class="form-actions" style="display: none;">
                    <button type="button" class="btn btn-secondary" id="cancelSocialBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function renderPreferencesTab(profile) {
    return `
        <div class="tab-section">
            <div class="section-header">
                <h3>Preferences & Settings</h3>
                <button class="btn btn-secondary" id="editPreferencesBtn">Edit</button>
            </div>

            <form class="profile-form" id="preferencesForm">
                <h4>Notifications</h4>
                <div class="preferences-grid">
                    <div class="preference-item">
                        <label class="switch">
                            <input type="checkbox" name="emailNotifications" ${profile.preferences?.emailNotifications !== false ? 'checked' : ''} disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="preference-label">
                            <strong>Email Notifications</strong>
                            <p>Receive updates via email</p>
                        </div>
                    </div>
                    <div class="preference-item">
                        <label class="switch">
                            <input type="checkbox" name="smsNotifications" ${profile.preferences?.smsNotifications !== false ? 'checked' : ''} disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="preference-label">
                            <strong>SMS Notifications</strong>
                            <p>Receive updates via SMS</p>
                        </div>
                    </div>
                    <div class="preference-item">
                        <label class="switch">
                            <input type="checkbox" name="pushNotifications" ${profile.preferences?.pushNotifications !== false ? 'checked' : ''} disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="preference-label">
                            <strong>Push Notifications</strong>
                            <p>Receive browser notifications</p>
                        </div>
                    </div>
                    <div class="preference-item">
                        <label class="switch">
                            <input type="checkbox" name="newsletter" ${profile.preferences?.newsletter ? 'checked' : ''} disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="preference-label">
                            <strong>Newsletter</strong>
                            <p>Subscribe to monthly newsletter</p>
                        </div>
                    </div>
                </div>

                <div class="section-divider"></div>

                <h4>Privacy & Language</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Profile Visibility</label>
                        <select name="profileVisibility" disabled>
                            <option value="public" ${profile.preferences?.profileVisibility === 'public' ? 'selected' : ''}>Public</option>
                            <option value="private" ${profile.preferences?.profileVisibility === 'private' ? 'selected' : ''}>Private</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Language Preference</label>
                        <select name="language" disabled>
                            <option value="en" ${profile.preferences?.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="hi" ${profile.preferences?.language === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions" style="display: none;">
                    <button type="button" class="btn btn-secondary" id="cancelPreferencesBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function renderBadgesTab(profile) {
    const badges = profile.badges || [];

    return `
        <div class="tab-section">
            <h3>Badges & Achievements</h3>
            
            ${badges.length > 0 ? `
                <div class="badges-grid">
                    ${badges.map(badge => `
                        <div class="badge-card">
                            <div class="badge-icon">${badge.icon || '🏆'}</div>
                            <h4>${badge.name}</h4>
                            <p>${badge.description}</p>
                            <small>Earned: ${new Date(badge.earnedAt).toLocaleDateString()}</small>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">🏆</div>
                    <h4>No badges yet</h4>
                    <p>Keep filing and resolving complaints to earn badges!</p>
                </div>
            `}

            <div class="section-divider"></div>

            <h4>Available Badges</h4>
            <div class="available-badges">
                ${renderAvailableBadges(badges)}
            </div>
        </div>
    `;
}

function renderAvailableBadges(earnedBadges) {
    const allBadges = [
        { name: 'Welcome Badge', icon: '👋', description: 'Complete your profile', requirement: 'Profile 100% complete' },
        { name: 'Active Citizen', icon: '📝', description: 'File 10 complaints', requirement: '10 complaints filed' },
        { name: 'Problem Solver', icon: '✅', description: '5 complaints resolved', requirement: '5 resolved complaints' },
        { name: 'Community Hero', icon: '🦸', description: '25 complaints resolved', requirement: '25 resolved complaints' },
        { name: 'Verified User', icon: '✓', description: 'Complete all verifications', requirement: 'Email + Phone verified' },
        { name: 'Social Butterfly', icon: '💬', description: '50 interactions', requirement: '50 comments/hypes' },
        { name: 'Trendsetter', icon: '🔥', description: '100 hypes received', requirement: '100 total hypes' },
        { name: 'Influencer', icon: '⭐', description: '500+ impact score', requirement: 'Impact score ≥ 500' },
        { name: 'Early Adopter', icon: '🎖️', description: 'Member for 1 year', requirement: '1 year membership' },
        { name: 'Champion', icon: '👑', description: '100 complaints resolved', requirement: '100 resolved complaints' }
    ];

    const earnedNames = earnedBadges.map(b => b.name);

    return allBadges.map(badge => {
        const earned = earnedNames.includes(badge.name);
        return `
            <div class="available-badge ${earned ? 'earned' : 'locked'}">
                <div class="badge-icon-small">${badge.icon}</div>
                <div class="badge-info">
                    <strong>${badge.name}</strong>
                    <p>${badge.description}</p>
                    <small>${badge.requirement}</small>
                </div>
                ${earned ? '<span class="earned-check">✓</span>' : '<span class="locked-icon">🔒</span>'}
            </div>
        `;
    }).join('');
}

// Helper Functions
function getInitials(profile) {
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
}

function calculateProfileCompletion(profile) {
    let completion = 0;

    // Basic info (20%)
    if (profile.firstName && profile.lastName && profile.phoneNumber) completion += 20;

    // Profile picture (10%)
    if (profile.profilePicture?.url) completion += 10;

    // Location (15%)
    if (profile.location?.pincode && profile.location?.city) completion += 15;

    // Education (15%)
    if (profile.education?.highestQualification) completion += 15;

    // Work (15%)
    if (profile.work?.employmentStatus) completion += 15;

    // Social links (10%)
    if (profile.socialLinks && Object.values(profile.socialLinks).some(link => link)) completion += 10;

    // Verification (15%)
    if (profile.verification?.email && profile.verification?.phone) completion += 15;

    return completion;
}

function getMissingFields(profile) {
    const missing = [];

    if (!profile.profilePicture?.url) missing.push('Profile Picture');
    if (!profile.phoneNumber) missing.push('Phone Number');
    if (!profile.location?.pincode || !profile.location?.city) missing.push('Complete Location');
    if (!profile.education?.highestQualification) missing.push('Education Information');
    if (!profile.work?.employmentStatus) missing.push('Work Information');
    if (!profile.socialLinks || !Object.values(profile.socialLinks).some(link => link)) missing.push('Social Links');
    if (!profile.verification?.email || !profile.verification?.phone) missing.push('Verify Email/Phone');

    return missing;
}

// Event Listeners
function initializeProfileListeners(profile) {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Profile picture upload
    const uploadBtn = document.getElementById('uploadPictureBtn');
    const fileInput = document.getElementById('profilePictureInput');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleProfilePictureUpload);
    }

    // Edit buttons
    setupEditMode('personal', profile);
    setupEditMode('education', profile);
    setupEditMode('work', profile);
    setupEditMode('social', profile);
    setupEditMode('preferences', profile);
}

function setupEditMode(section, profile) {
    const editBtn = document.getElementById(`edit${capitalize(section)}Btn`);
    const cancelBtn = document.getElementById(`cancel${capitalize(section)}Btn`);
    const form = document.getElementById(`${section}Form`);
    const formActions = form?.querySelector('.form-actions');
    const inputs = form?.querySelectorAll('input, select, textarea');

    if (!editBtn || !form) return;

    editBtn.addEventListener('click', () => {
        // Enable all inputs
        inputs.forEach(input => input.disabled = false);

        // Show form actions
        if (formActions) formActions.style.display = 'flex';

        // Hide edit button
        editBtn.style.display = 'none';
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            // Disable all inputs
            inputs.forEach(input => input.disabled = true);

            // Hide form actions
            if (formActions) formActions.style.display = 'none';

            // Show edit button
            editBtn.style.display = 'block';

            // Reset form
            form.reset();
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit(section, form, profile);
    });
}

async function handleProfilePictureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    try {
        Loading.show('Uploading profile picture...');

        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await profileService.uploadProfilePicture(formData);

        // Update UI
        const placeholder = document.getElementById('profilePicturePlaceholder');
        const img = document.getElementById('profilePictureImg');

        if (placeholder) {
            placeholder.outerHTML = `<img src="${response.data.url}" alt="Profile Picture" class="profile-picture" id="profilePictureImg">`;
        } else if (img) {
            img.src = response.data.url;
        }

        Loading.hide();
        alert('Profile picture updated successfully!');

    } catch (error) {
        Loading.hide();
        console.error('Upload error:', error);
        alert('Failed to upload profile picture. Please try again.');
    }
}

async function handleFormSubmit(section, form, profile) {
    const formData = new FormData(form);
    const data = {};

    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        // Handle checkboxes
        if (form.elements[key].type === 'checkbox') {
            data[key] = form.elements[key].checked;
        } else {
            data[key] = value;
        }
    }

    try {
        Loading.show('Saving changes...');

        await profileService.updateProfile(section, data);

        // Disable inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.disabled = true);

        // Hide form actions
        const formActions = form.querySelector('.form-actions');
        if (formActions) formActions.style.display = 'none';

        // Show edit button
        const editBtn = document.getElementById(`edit${capitalize(section)}Btn`);
        if (editBtn) editBtn.style.display = 'block';

        Loading.hide();
        alert('Profile updated successfully!');

        // Reload page to show updated completion
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        Loading.hide();
        console.error('Update error:', error);
        alert('Failed to update profile. Please try again.');
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
