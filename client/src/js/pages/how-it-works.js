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
                        <div class="routing-graph-horizontal">
                            <!-- Forward Flow -->
                            <div class="flow-step">
                                <div class="graph-node user">USER</div>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="graph-node platform">MERI SHIKAYAT</div>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="graph-node dept">RESPECTIVE DEPARTMENT</div>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="graph-node action">ACKNOWLEDGE</div>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="graph-node action">UPDATE STATUS</div>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="graph-node action">COMPLETED</div>
                            </div>
                        </div>
                        
                        <!-- Return Flow -->
                        <div class="routing-graph-return">
                            <div class="flow-step">
                                <div class="graph-node action-complete">COMPLETED</div>
                            </div>
                            <div class="flow-arrow-return">→</div>
                            <div class="flow-step">
                                <div class="graph-node platform-return">MERI SHIKAYAT</div>
                            </div>
                            <div class="flow-arrow-return">→</div>
                            <div class="flow-step">
                                <div class="graph-node user-verify">USER<br/><span style="font-size: 0.7em;">(VERIFY PROOF)</span></div>
                            </div>
                            <div class="flow-arrow-return">→</div>
                            <div class="flow-step">
                                <div class="graph-node close">CLOSE</div>
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
