/**
 * How It Works Page
 */

export function renderHowItWorksPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="platform-page">
            <header class="platform-header">
                <div class="container">
                    <a href="/" class="back-link">← Back to Home</a>
                    <h1 class="animate-fade-up">Simplifying Civic Grievances</h1>
                    <p class="subtitle animate-fade-up delay-100">From reporting to resolution in 4 simple steps</p>
                </div>
            </header>
            
            <main class="platform-content">
                <div class="container">
                    <!-- Process Flow Section -->
                    <div class="process-flow">
                        <div class="process-line"></div>
                        
                        <!-- Step 1 -->
                        <div class="process-step animate-on-scroll">
                            <div class="step-marker">1</div>
                            <div class="step-content">
                                <div class="step-icon">📝</div>
                                <h2>Report the Issue</h2>
                                <p>Spot a problem? Snap a photo or record a video. Select the category (Sanitation, Roads, etc.), add the location, and submit. It takes less than 2 minutes.</p>
                            </div>
                        </div>

                        <!-- Step 2 -->
                        <div class="process-step right animate-on-scroll">
                            <div class="step-marker">2</div>
                            <div class="step-content">
                                <div class="step-icon">🤖</div>
                                <h2>AI Verification & Routing</h2>
                                <p>Our AI instantly analyzes your complaint, verifies the details, and automatically routes it to the exact local authority responsible for that specific area and issue type.</p>
                            </div>
                        </div>

                        <!-- Step 3 -->
                        <div class="process-step animate-on-scroll">
                            <div class="step-marker">3</div>
                            <div class="step-content">
                                <div class="step-icon">👷</div>
                                <h2>Action & Resolution</h2>
                                <p>Authorities receive the alert and take action. You get real-time updates via SMS/Email as the status changes from 'Received' to 'In Progress' to 'Resolved'.</p>
                            </div>
                        </div>

                        <!-- Step 4 -->
                        <div class="process-step right animate-on-scroll">
                            <div class="step-marker">4</div>
                            <div class="step-content">
                                <div class="step-icon">⭐</div>
                                <h2>Feedback & Closure</h2>
                                <p>Once resolved, you receive a proof of completion (photo/video). You can then rate the service and close the ticket, ensuring accountability.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Visual Graph Section -->
                    <section class="visual-graph-section animate-fade-up">
                        <h2>Complaint Routing Architecture</h2>
                        <div class="routing-diagram-vertical">
                            
                            <!-- User (Start) -->
                            <div class="diagram-node user-node">
                                <div class="node-icon">📱</div>
                                <div class="node-label">USER</div>
                            </div>
                            
                            <!-- Arrow Down -->
                            <div class="diagram-arrow-down">
                                <div class="arrow-line"></div>
                                <div class="arrow-head">▼</div>
                            </div>
                            
                            <!-- Meri Shikayat Platform -->
                            <div class="diagram-node platform-node">
                                <div class="node-icon">💻</div>
                                <div class="node-label">MERI SHIKAYAT</div>
                                <div class="node-sublabel">Platform</div>
                            </div>
                            
                            <!-- Arrow Up to Departments -->
                            <div class="diagram-arrow-up">
                                <div class="arrow-line"></div>
                                <div class="arrow-head">▲</div>
                                <div class="arrow-label">Routed with Acknowledgement</div>
                            </div>
                            
                            <!-- Multiple Departments -->
                            <div class="diagram-departments">
                                <div class="diagram-node dept-node">
                                    <div class="node-label">Department 1</div>
                                    <div class="node-sublabel">Sanitation</div>
                                </div>
                                <div class="diagram-node dept-node">
                                    <div class="node-label">Department 2</div>
                                    <div class="node-sublabel">Road Works</div>
                                </div>
                                <div class="diagram-node dept-node">
                                    <div class="node-label">Department 3</div>
                                    <div class="node-sublabel">Water Supply</div>
                                </div>
                            </div>
                            
                            <!-- Arrow Down from Departments -->
                            <div class="diagram-arrow-down">
                                <div class="arrow-line"></div>
                                <div class="arrow-head">▼</div>
                                <div class="arrow-label">Pending Update, Completed,<br/>Completed with Proof</div>
                            </div>
                            
                            <!-- Meri Shikayat Platform (Return) -->
                            <div class="diagram-node platform-node-return">
                                <div class="node-icon">💻</div>
                                <div class="node-label">MERI SHIKAYAT</div>
                                <div class="node-sublabel">Update & Tracking</div>
                            </div>
                            
                            <!-- Arrow Down to User -->
                            <div class="diagram-arrow-down">
                                <div class="arrow-line"></div>
                                <div class="arrow-head">▼</div>
                                <div class="arrow-label">Notification</div>
                            </div>
                            
                            <!-- User (End) -->
                            <div class="diagram-node user-node-end">
                                <div class="node-icon">📱</div>
                                <div class="node-label">USER</div>
                                <div class="node-sublabel">Selection and Close</div>
                            </div>
                            
                        </div>
                    </section>

                    <!-- CTA Section -->
                    <section class="platform-cta animate-fade-up">
                        <h2>Ready to make a difference?</h2>
                        <p>Join thousands of active citizens improving their community.</p>
                        <a href="/register" class="btn btn-primary btn-lg">Register Now</a>
                    </section>
                </div>
            </main>
        </div>
    `;

    // Add scroll animation observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // Add event listener for back link
    app.querySelector('.back-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Add event listener for register button
    app.querySelector('.btn-primary').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', '/register');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}
