/**
 * How It Works Page - Professional Redesign
 * [U] UI/UX Engineer Implementation
 */

import { generateNavbar, initializeNavbar } from '../components/navbar.js';

export function renderHowItWorksPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="legal-page how-it-works-page">
            ${generateNavbar({ showAuth: true, showLanguage: false })}
            
            <div class="page-header-section">
                <div class="container">
                    <h1 class="page-title">How It Works</h1>
                    <p class="page-subtitle">From reporting to resolution in 4 simple steps</p>
                </div>
            </div>
            
            <main class="legal-content">
                <div class="container">
                    <!-- Introduction -->
                    <section class="legal-section intro-section">
                        <div class="info-box">
                            <div class="info-icon">💡</div>
                            <div class="info-content">
                                <h3>Simple, Fast, Effective</h3>
                                <p>Meri Shikayat makes civic engagement effortless. Report issues, track progress, and see real results - all in one platform.</p>
                            </div>
                        </div>
                    </section>

                    <!-- 4 Steps Process -->
                    <section class="legal-section">
                        <div class="section-header">
                            <h2>The 4-Step Process</h2>
                        </div>
                        
                        <div class="process-steps">
                            <!-- Step 1 -->
                            <div class="process-step-card">
                                <div class="step-number">1</div>
                                <div class="step-icon-large">📝</div>
                                <h3>Report the Issue</h3>
                                <p>Spot a problem in your area? Take a photo, record a video, or capture audio evidence.</p>
                                <ul class="step-details">
                                    <li>✓ Select issue category (Sanitation, Roads, Water, etc.)</li>
                                    <li>✓ Add location (GPS auto-detect or manual)</li>
                                    <li>✓ Upload evidence (photos/videos/audio)</li>
                                    <li>✓ Provide description</li>
                                    <li>✓ Submit in under 2 minutes</li>
                                </ul>
                            </div>

                            <!-- Step 2 -->
                            <div class="process-step-card">
                                <div class="step-number">2</div>
                                <div class="step-icon-large">🤖</div>
                                <h3>AI Verification & Routing</h3>
                                <p>Our intelligent system analyzes and routes your complaint automatically.</p>
                                <ul class="step-details">
                                    <li>✓ AI categorizes the issue type</li>
                                    <li>✓ Verifies location and details</li>
                                    <li>✓ Detects priority level (Low/Medium/High/Critical)</li>
                                    <li>✓ Routes to correct department</li>
                                    <li>✓ Sends acknowledgment to you</li>
                                </ul>
                            </div>

                            <!-- Step 3 -->
                            <div class="process-step-card">
                                <div class="step-number">3</div>
                                <div class="step-icon-large">👷</div>
                                <h3>Action & Resolution</h3>
                                <p>Authorities receive the alert and take action to resolve your complaint.</p>
                                <ul class="step-details">
                                    <li>✓ Department receives notification</li>
                                    <li>✓ Status updates: Received → In Progress → Resolved</li>
                                    <li>✓ You get SMS/Email notifications</li>
                                    <li>✓ Track progress in real-time</li>
                                    <li>✓ Escalate if needed</li>
                                </ul>
                            </div>

                            <!-- Step 4 -->
                            <div class="process-step-card">
                                <div class="step-number">4</div>
                                <div class="step-icon-large">⭐</div>
                                <h3>Feedback & Closure</h3>
                                <p>Once resolved, verify the solution and provide feedback.</p>
                                <ul class="step-details">
                                    <li>✓ Receive proof of completion (photo/video)</li>
                                    <li>✓ Verify the resolution</li>
                                    <li>✓ Rate the service (1-5 stars)</li>
                                    <li>✓ Provide feedback comments</li>
                                    <li>✓ Close the ticket</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <!-- Routing Architecture -->
                    <section class="legal-section">
                        <div class="section-header">
                            <h2>Complaint Routing Architecture</h2>
                        </div>
                        
                        <div class="content-card">
                            <p>Here's how your complaint flows through our system:</p>
                            
                            <div class="routing-flow">
                                <div class="flow-step">
                                    <div class="flow-icon">📱</div>
                                    <h4>You (Citizen)</h4>
                                    <p>Submit complaint with evidence</p>
                                </div>
                                
                                <div class="flow-arrow">↓</div>
                                
                                <div class="flow-step platform">
                                    <div class="flow-icon">💻</div>
                                    <h4>Meri Shikayat Platform</h4>
                                    <p>AI categorization & routing</p>
                                </div>
                                
                                <div class="flow-arrow">↓</div>
                                
                                <div class="flow-departments">
                                    <div class="flow-step dept">
                                        <div class="flow-icon">🏛️</div>
                                        <h4>Department 1</h4>
                                        <p>Sanitation</p>
                                    </div>
                                    <div class="flow-step dept">
                                        <div class="flow-icon">🏛️</div>
                                        <h4>Department 2</h4>
                                        <p>Road Works</p>
                                    </div>
                                    <div class="flow-step dept">
                                        <div class="flow-icon">🏛️</div>
                                        <h4>Department 3</h4>
                                        <p>Water Supply</p>
                                    </div>
                                </div>
                                
                                <div class="flow-arrow">↓</div>
                                
                                <div class="flow-step platform">
                                    <div class="flow-icon">💻</div>
                                    <h4>Meri Shikayat Platform</h4>
                                    <p>Status updates & tracking</p>
                                </div>
                                
                                <div class="flow-arrow">↓</div>
                                
                                <div class="flow-step">
                                    <div class="flow-icon">📱</div>
                                    <h4>You (Citizen)</h4>
                                    <p>Notifications & feedback</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Key Features -->
                    <section class="legal-section">
                        <div class="section-header">
                            <h2>Key Features</h2>
                        </div>
                        
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon">📸</div>
                                <h4>Multimedia Support</h4>
                                <p>Upload photos, videos, or audio as evidence</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">📍</div>
                                <h4>GPS Location</h4>
                                <p>Auto-detect or manually set complaint location</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🔔</div>
                                <h4>Real-Time Alerts</h4>
                                <p>SMS/Email notifications at every stage</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">📊</div>
                                <h4>Live Tracking</h4>
                                <p>Monitor complaint status 24/7</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🎯</div>
                                <h4>Priority Detection</h4>
                                <p>AI identifies urgent issues automatically</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🔄</div>
                                <h4>Escalation System</h4>
                                <p>Escalate unresolved complaints easily</p>
                            </div>
                        </div>
                    </section>

                    <!-- Timeline -->
                    <section class="legal-section">
                        <div class="section-header">
                            <h2>Average Resolution Timeline</h2>
                        </div>
                        
                        <div class="timeline-grid">
                            <div class="timeline-card">
                                <div class="timeline-duration">Instant</div>
                                <h4>Acknowledgment</h4>
                                <p>Immediate confirmation upon submission</p>
                            </div>
                            <div class="timeline-card">
                                <div class="timeline-duration">1-2 Days</div>
                                <h4>Review & Assignment</h4>
                                <p>Department reviews and assigns to team</p>
                            </div>
                            <div class="timeline-card">
                                <div class="timeline-duration">2-7 Days</div>
                                <h4>Simple Issues</h4>
                                <p>Quick fixes like garbage collection, streetlights</p>
                            </div>
                            <div class="timeline-card">
                                <div class="timeline-duration">1-2 Weeks</div>
                                <h4>Moderate Issues</h4>
                                <p>Road repairs, water supply fixes</p>
                            </div>
                            <div class="timeline-card">
                                <div class="timeline-duration">2-4 Weeks</div>
                                <h4>Complex Issues</h4>
                                <p>Major infrastructure, multi-department coordination</p>
                            </div>
                        </div>
                    </section>

                    <!-- CTA Section -->
                    <section class="support-cta">
                        <h2>Ready to Make a Difference?</h2>
                        <p>Join thousands of active citizens improving their community</p>
                        <div class="support-buttons">
                            <a href="/register" class="btn btn-primary">Register Now</a>
                            <a href="/about" class="btn btn-outline-primary">Learn More</a>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    `;

    // Initialize navbar
    initializeNavbar();
}
