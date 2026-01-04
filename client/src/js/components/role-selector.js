/**
 * Role Selector Component
 * Allows users to choose their registration type
 */

export default class RoleSelector {
    constructor(onRoleSelect) {
        this.onRoleSelect = onRoleSelect;
        this.selectedRole = null;
    }

    render() {
        return `
            <div class="role-selector-container">
                <h2 class="role-selector-title">Who are you registering as?</h2>
                <p class="role-selector-subtitle">Choose the option that best describes you</p>
                
                <div class="role-cards-grid">
                    <!-- General User Card -->
                    <div class="role-card" data-role="general_user">
                        <div class="role-card-icon">👤</div>
                        <h3 class="role-card-title">General User</h3>
                        <p class="role-card-description">File and track complaints in your area</p>
                        <ul class="role-card-features">
                            <li>✓ Submit complaints</li>
                            <li>✓ Track status</li>
                            <li>✓ Get updates</li>
                        </ul>
                        <div class="role-card-badge instant">Instant Activation</div>
                    </div>

                    <!-- Admin Card -->
                    <div class="role-card" data-role="admin">
                        <div class="role-card-icon">🛡️</div>
                        <h3 class="role-card-title">Admin</h3>
                        <p class="role-card-description">Manage and resolve complaints for your department</p>
                        <ul class="role-card-features">
                            <li>✓ Manage complaints</li>
                            <li>✓ Update status</li>
                            <li>✓ Assign tasks</li>
                        </ul>
                        <div class="role-card-badge approval">Requires Approval</div>
                    </div>

                    <!-- Contractor Card -->
                    <div class="role-card" data-role="contractor">
                        <div class="role-card-icon">🏗️</div>
                        <h3 class="role-card-title">Contractor</h3>
                        <p class="role-card-description">Work on assigned complaints and update progress</p>
                        <ul class="role-card-features">
                            <li>✓ View assignments</li>
                            <li>✓ Update work status</li>
                            <li>✓ Track earnings</li>
                        </ul>
                        <div class="role-card-badge verification">Requires Verification</div>
                    </div>

                    <!-- Super Admin Card -->
                    <div class="role-card super-admin-card" data-role="super_admin">
                        <div class="role-card-icon">⭐</div>
                        <h3 class="role-card-title">Super Admin</h3>
                        <p class="role-card-description">Oversee departments and manage the entire system</p>
                        <ul class="role-card-features">
                            <li>✓ Full system access</li>
                            <li>✓ Manage admins</li>
                            <li>✓ View analytics</li>
                        </ul>
                        <div class="role-card-badge invitation">Invitation Only</div>
                    </div>
                </div>

                <div class="role-selector-note">
                    <span class="note-icon">ℹ️</span>
                    <span><strong>Note:</strong> Admin and Contractor accounts require approval before activation. You'll receive an email notification once your account is reviewed.</span>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const roleCards = document.querySelectorAll('.role-card');

        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                roleCards.forEach(c => c.classList.remove('active'));

                // Add active class to clicked card
                card.classList.add('active');

                // Get selected role
                const role = card.dataset.role;
                this.selectedRole = role;

                // Trigger callback
                if (this.onRoleSelect) {
                    this.onRoleSelect(role);
                }
            });

            // Keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Select ${card.querySelector('.role-card-title').textContent} role`);

            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    getSelectedRole() {
        return this.selectedRole;
    }
}
