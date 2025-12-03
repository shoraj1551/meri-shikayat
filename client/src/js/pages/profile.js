/**
 * User Profile Page
 * View and edit profile, change password, update location
 */

import { authService } from '../api/auth.service.js';
import * as userService from '../api/user.service.js';

export async function renderProfilePage() {
    const app = document.getElementById('app');
    const user = authService.getCurrentUser();

    if (!user) {
        window.router.navigate('/login');
        return;
    }

    app.innerHTML = `
        <div class="dashboard-layout">
            <header class="dashboard-header glass-card">
                <div class="header-left">
                    <div class="logo">Meri Shikayat</div>
                </div>
                <div class="header-right">
                    <button class="btn btn-outline" onclick="window.router.navigate('/dashboard')">
                        Back to Dashboard
                    </button>
                    <div class="user-profile">
                        <div class="avatar">${user.firstName[0]}${user.lastName[0]}</div>
                        <span class="user-name">${user.firstName} ${user.lastName}</span>
                    </div>
                </div>
            </header>

            <main class="main-content container">
                <h1 class="page-title">My Profile</h1>

                <div class="profile-grid">
                    <!-- Profile Info Card -->
                    <div class="glass-card profile-card">
                        <div class="card-header">
                            <h3>Personal Information</h3>
                            <button class="btn btn-sm btn-outline" onclick="openEditProfileModal()">
                                Edit Profile
                            </button>
                        </div>
                        <div class="profile-info">
                            <div class="info-group">
                                <label>Full Name</label>
                                <p>${user.firstName} ${user.lastName}</p>
                            </div>
                            <div class="info-group">
                                <label>Email</label>
                                <p>${user.email || 'Not provided'}</p>
                            </div>
                            <div class="info-group">
                                <label>Phone</label>
                                <p>${user.phone || 'Not provided'}</p>
                            </div>
                            <div class="info-group">
                                <label>Date of Birth</label>
                                <p>${new Date(user.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Security Card -->
                    <div class="glass-card profile-card">
                        <div class="card-header">
                            <h3>Security</h3>
                        </div>
                        <div class="profile-info">
                            <div class="info-group">
                                <label>Password</label>
                                <p>••••••••</p>
                                <button class="btn btn-sm btn-outline mt-2" onclick="openChangePasswordModal()">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Location Card -->
                    <div class="glass-card profile-card">
                        <div class="card-header">
                            <h3>Location</h3>
                            <button class="btn btn-sm btn-outline" onclick="openLocationModal()">
                                Update Location
                            </button>
                        </div>
                        <div class="profile-info">
                            <div class="info-group">
                                <label>Current Location</label>
                                <p>${user.location?.address || 'Address not set'}</p>
                            </div>
                            <div class="info-group">
                                <label>Pincode</label>
                                <p>${user.location?.pincode || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Edit Profile Modal -->
        <div id="editProfileModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card">
                <h3>Edit Profile</h3>
                <form id="editProfileForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" id="editFirstName" class="form-input" value="${user.firstName}" required>
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" id="editLastName" class="form-input" value="${user.lastName}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="editEmail" class="form-input" value="${user.email || ''}">
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="editPhone" class="form-input" value="${user.phone || ''}">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('editProfileModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Change Password Modal -->
        <div id="changePasswordModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card">
                <h3>Change Password</h3>
                <form id="changePasswordForm">
                    <div class="form-group">
                        <label>Current Password</label>
                        <input type="password" id="currentPassword" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="newPassword" class="form-input" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" id="confirmPassword" class="form-input" required minlength="6">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('changePasswordModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Change Password</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Location Modal -->
        <div id="locationModal" class="modal-overlay" style="display: none;">
            <div class="modal-dialog glass-card">
                <h3>Update Location</h3>
                <form id="locationForm">
                    <div class="form-group">
                        <label>Pincode</label>
                        <input type="text" id="editPincode" class="form-input" value="${user.location?.pincode || ''}" required pattern="[0-9]{6}">
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea id="editAddress" class="form-input" rows="3" required>${user.location?.address || ''}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('locationModal')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Location</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Event Listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Edit Profile Form
    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const updates = {
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value
            };

            const response = await userService.updateUserProfile(updates);

            // Update local storage user data
            const currentUser = authService.getCurrentUser();
            const updatedUser = { ...currentUser, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('✅ Profile updated successfully');
            closeModal('editProfileModal');
            renderProfilePage(); // Reload page
        } catch (error) {
            alert('❌ Failed to update profile: ' + (error.response?.data?.message || error.message));
        }
    });

    // Change Password Form
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('❌ New passwords do not match');
            return;
        }

        try {
            await userService.changePassword(currentPassword, newPassword);
            alert('✅ Password changed successfully');
            closeModal('changePasswordModal');
            document.getElementById('changePasswordForm').reset();
        } catch (error) {
            alert('❌ Failed to change password: ' + (error.response?.data?.message || error.message));
        }
    });

    // Location Form
    document.getElementById('locationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const locationData = {
                pincode: document.getElementById('editPincode').value,
                address: document.getElementById('editAddress').value
            };

            const response = await userService.updateLocation(locationData);

            // Update local storage
            const currentUser = authService.getCurrentUser();
            currentUser.location = response.data;
            localStorage.setItem('user', JSON.stringify(currentUser));

            alert('✅ Location updated successfully');
            closeModal('locationModal');
            renderProfilePage();
        } catch (error) {
            alert('❌ Failed to update location: ' + (error.response?.data?.message || error.message));
        }
    });
}

// Global modal functions
window.openEditProfileModal = () => document.getElementById('editProfileModal').style.display = 'flex';
window.openChangePasswordModal = () => document.getElementById('changePasswordModal').style.display = 'flex';
window.openLocationModal = () => document.getElementById('locationModal').style.display = 'flex';
window.closeModal = (modalId) => document.getElementById(modalId).style.display = 'none';
