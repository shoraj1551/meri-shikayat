/**
 * Contact Us Page - With Escalation Matrix
 * [U] UI/UX Engineer Implementation
 */

import { loadContactInfo } from '../services/contact.service.js';
import { getCurrentLanguage } from '../i18n/translations.js';

export function renderContactPage() {
    const app = document.getElementById('app');
    const lang = getCurrentLanguage() || 'en';

    // Load contact info and then render
    loadContactInfo().then(data => {
        const contact = data.contact;

        app.innerHTML = `
            <div class="contact-page">
                <header class="contact-header">
                    <div class="container">
                        <a href="/" class="back-link">← ${lang === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}</a>
                        <h1 class="page-title">${lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}</h1>
                        <p class="page-subtitle">${lang === 'hi' ? 'हम यहाँ मदद के लिए हैं। किसी भी तरह से संपर्क करें।' : 'We\'re here to help. Reach out through any of these channels.'}</p>
                    </div>
                </header>
                
                <main class="contact-content">
                    <div class="container">
                        <!-- Quick Contact Summary -->
                        <div class="contact-grid">
                            <!-- Email Card -->
                            <div class="contact-card">
                                <div class="contact-icon">📧</div>
                                <h3>${lang === 'hi' ? 'ईमेल सहायता' : 'Email Support'}</h3>
                                <div class="contact-details">
                                    <div class="contact-item">
                                        <span class="contact-label">${lang === 'hi' ? 'मुख्य' : 'Primary'}:</span>
                                        <a href="mailto:${contact.email.primary}" class="contact-link">${contact.email.primary}</a>
                                    </div>
                                    <div class="contact-item">
                                        <span class="contact-label">${lang === 'hi' ? 'सहायता' : 'Support'}:</span>
                                        <a href="mailto:${contact.email.support}" class="contact-link">${contact.email.support}</a>
                                    </div>
                                </div>
                                <p class="contact-note"><em>${lang === 'hi' ? '24-48 घंटे में जवाब' : 'Response within 24-48 hours'}</em></p>
                            </div>

                            <!-- Phone Card -->
                            <div class="contact-card">
                                <div class="contact-icon">📞</div>
                                <h3>${lang === 'hi' ? 'फोन सहायता' : 'Phone Support'}</h3>
                                <div class="contact-details">
                                    <div class="contact-item">
                                        <span class="contact-label">${lang === 'hi' ? 'हेल्पलाइन' : 'Helpline'}:</span>
                                        <a href="tel:${contact.phone.primary.replace(/\s/g, '')}" class="contact-link">${contact.phone.primary}</a>
                                    </div>
                                    <div class="contact-item">
                                        <span class="contact-label">${lang === 'hi' ? 'टोल फ्री' : 'Toll Free'}:</span>
                                        <a href="tel:${contact.phone.tollfree.replace(/\s/g, '')}" class="contact-link">${contact.phone.tollfree}</a>
                                    </div>
                                </div>
                                <p class="contact-note"><em>${lang === 'hi' ? 'सोमवार-शनिवार, 9 AM - 6 PM' : 'Mon-Sat, 9 AM - 6 PM'}</em></p>
                            </div>

                            <!-- Address Card -->
                            <div class="contact-card">
                                <div class="contact-icon">📍</div>
                                <h3>${lang === 'hi' ? 'कार्यालय पता' : 'Office Address'}</h3>
                                <div class="contact-details">
                                    <p class="address-line">${contact.address.line1}</p>
                                    <p class="address-line">${contact.address.line2}</p>
                                    <p class="address-line">${contact.address.city}, ${contact.address.state} ${contact.address.pincode}</p>
                                </div>
                                <a href="https://maps.google.com/?q=${encodeURIComponent(contact.address.line1 + ' ' + contact.address.city)}" target="_blank" class="btn btn-outline-primary btn-sm" style="margin-top: 1rem;">
                                    🗺️ ${lang === 'hi' ? 'मानचित्र देखें' : 'View on Map'}
                                </a>
                            </div>
                        </div>

                        <!-- Email Escalation Matrix -->
                        <section class="escalation-section">
                            <h2 class="section-title">
                                <span class="escalation-icon">📧</span>
                                ${lang === 'hi' ? 'ईमेल एस्केलेशन मैट्रिक्स' : 'Email Escalation Matrix'}
                            </h2>
                            <p class="section-description">${lang === 'hi' ? 'अपनी समस्या के अनुसार सही व्यक्ति से संपर्क करें' : 'Contact the right person based on your issue'}</p>
                            
                            <div class="escalation-grid">
                                ${contact.escalation.email.map(item => `
                                    <div class="escalation-card">
                                        <div class="escalation-level">
                                            <span class="level-badge">Level ${item.level}</span>
                                            <span class="response-time">${item.responseTime}</span>
                                        </div>
                                        <h3 class="escalation-title">${item.title}</h3>
                                        <p class="escalation-role">${item.role}</p>
                                        <a href="mailto:${item.email}" class="escalation-contact">
                                            <span class="contact-icon-small">📧</span>
                                            ${item.email}
                                        </a>
                                        <p class="escalation-description">${item.description}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <!-- Phone Escalation Matrix -->
                        <section class="escalation-section">
                            <h2 class="section-title">
                                <span class="escalation-icon">📞</span>
                                ${lang === 'hi' ? 'फोन एस्केलेशन मैट्रिक्स' : 'Phone Escalation Matrix'}
                            </h2>
                            <p class="section-description">${lang === 'hi' ? 'तत्काल सहायता के लिए सही हेल्पलाइन पर कॉल करें' : 'Call the right helpline for immediate assistance'}</p>
                            
                            <div class="escalation-grid">
                                ${contact.escalation.phone.map(item => `
                                    <div class="escalation-card">
                                        <div class="escalation-level">
                                            <span class="level-badge">Level ${item.level}</span>
                                            <span class="availability-badge">${item.availability}</span>
                                        </div>
                                        <h3 class="escalation-title">${item.title}</h3>
                                        <p class="escalation-role">${item.role}</p>
                                        <a href="tel:${item.phone.replace(/\s/g, '')}" class="escalation-contact">
                                            <span class="contact-icon-small">📞</span>
                                            ${item.phone}
                                        </a>
                                        <p class="escalation-description">${item.description}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <!-- Escalation Guidelines -->
                        <section class="guidelines-section">
                            <h2 class="section-title">${lang === 'hi' ? 'एस्केलेशन दिशानिर्देश' : 'Escalation Guidelines'}</h2>
                            <div class="guidelines-grid">
                                <div class="guideline-card">
                                    <div class="guideline-icon">1️⃣</div>
                                    <h4>${lang === 'hi' ? 'पहले Level 1 से शुरू करें' : 'Start with Level 1'}</h4>
                                    <p>${lang === 'hi' ? 'हमेशा पहले सामान्य सहायता से संपर्क करें' : 'Always contact general support first'}</p>
                                </div>
                                <div class="guideline-card">
                                    <div class="guideline-icon">⏰</div>
                                    <h4>${lang === 'hi' ? 'प्रतिक्रिया समय दें' : 'Allow Response Time'}</h4>
                                    <p>${lang === 'hi' ? 'अगले स्तर पर जाने से पहले प्रतिक्रिया समय का इंतजार करें' : 'Wait for response time before escalating'}</p>
                                </div>
                                <div class="guideline-card">
                                    <div class="guideline-icon">📋</div>
                                    <h4>${lang === 'hi' ? 'विवरण शामिल करें' : 'Include Details'}</h4>
                                    <p>${lang === 'hi' ? 'शिकायत ID और पिछली बातचीत का उल्लेख करें' : 'Mention complaint ID and previous communications'}</p>
                                </div>
                                <div class="guideline-card">
                                    <div class="guideline-icon">🚨</div>
                                    <h4>${lang === 'hi' ? 'केवल आवश्यक होने पर एस्केलेट करें' : 'Escalate Only When Necessary'}</h4>
                                    <p>${lang === 'hi' ? 'गंभीर या अनसुलझे मामलों के लिए उच्च स्तर का उपयोग करें' : 'Use higher levels for serious or unresolved cases'}</p>
                                </div>
                            </div>
                        </section>

                        <!-- Office Hours -->
                        <section class="hours-section">
                            <h2 class="section-title">${lang === 'hi' ? 'कार्यालय समय' : 'Office Hours'}</h2>
                            <div class="hours-grid">
                                <div class="hours-item">
                                    <span class="hours-day">${lang === 'hi' ? 'सोमवार - शुक्रवार' : 'Monday - Friday'}</span>
                                    <span class="hours-time">${contact.hours.weekdays}</span>
                                </div>
                                <div class="hours-item">
                                    <span class="hours-day">${lang === 'hi' ? 'शनिवार' : 'Saturday'}</span>
                                    <span class="hours-time">${contact.hours.saturday}</span>
                                </div>
                                <div class="hours-item">
                                    <span class="hours-day">${lang === 'hi' ? 'रविवार' : 'Sunday'}</span>
                                    <span class="hours-time closed">${contact.hours.sunday}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        `;

        // Add event listener for back link
        const backLink = app.querySelector('.back-link');
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.router.navigate('/');
            });
        }
    }).catch(error => {
        console.error('Failed to render contact page:', error);
        app.innerHTML = `<p>Error loading contact information. Please try again later.</p>`;
    });
}
