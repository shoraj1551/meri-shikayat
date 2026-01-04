/**
 * Home page component - Bilingual (English/Hindi) landing page
 * [U] UI/UX Engineer Implementation
 */

import { translations, t, getCurrentLanguage, setLanguage } from '../i18n/translations.js';

export function renderHomePage() {
    const app = document.getElementById('app');
    const currentLang = getCurrentLanguage();

    // Set HTML lang attribute
    document.documentElement.lang = currentLang;

    // Render page with translations
    app.innerHTML = generateHomeHTML(currentLang);

    // Initialize event listeners
    initializeEventListeners();
}

/**
 * Generate HTML with translations
 */
function generateHomeHTML(lang) {
    return `
        <div class="home-page">
            <!-- Enhanced Header -->
            <header class="home-header">
                <div class="container">
                    <nav class="home-navbar">
                        <div class="logo">
                            <h1 class="logo-gradient">मेरी शिकायत</h1>
                            <p class="tagline">Your Voice, Our Priority</p>
                        </div>
                        
                        <!-- Desktop Navigation -->
                        <div class="nav-actions">
                            <div class="language-toggle">
                                <button class="lang-btn ${lang === 'en' ? 'active' : ''}" data-lang="en">English</button>
                                <span class="lang-divider">|</span>
                                <button class="lang-btn ${lang === 'hi' ? 'active' : ''}" data-lang="hi">हिन्दी</button>
                            </div>
                            <a href="/login" class="btn btn-outline-light" data-i18n="nav.login">${t('nav.login', lang)}</a>
                            <a href="/register" class="btn btn-primary" data-i18n="nav.signup">${t('nav.signup', lang)}</a>
                        </div>
                        
                        <!-- Mobile Menu Toggle -->
                        <button class="mobile-menu-toggle" aria-label="Toggle menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </nav>
                </div>
            </header>

            <!-- Mobile Navigation Drawer -->
            <div class="mobile-nav-overlay"></div>
            <nav class="mobile-nav">
                <div class="mobile-nav-items">
                    <div class="language-toggle">
                        <button class="lang-btn ${lang === 'en' ? 'active' : ''}" data-lang="en">English</button>
                        <button class="lang-btn ${lang === 'hi' ? 'active' : ''}" data-lang="hi">हिन्दी</button>
                    </div>
                    <a href="/login" class="btn btn-outline-light" data-i18n="nav.login">${t('nav.login', lang)}</a>
                    <a href="/register" class="btn btn-primary" data-i18n="nav.signup">${t('nav.signup', lang)}</a>
                </div>
            </nav>

            <!-- Enhanced Hero Section -->
            <section class="enhanced-hero">
                <div class="container">
                    <div class="hero-content-wrapper">
                        <h2 class="hero-main-title" data-i18n="hero.title">${t('hero.title', lang)}</h2>
                        <p class="hero-description" data-i18n="hero.subtitle">
                            ${t('hero.subtitle', lang)}
                        </p>
                        <div class="hero-cta-group">
                            <a href="/file-complaint" class="btn btn-primary btn-lg">
                                📝 <span data-i18n="hero.cta.primary">${t('hero.cta.primary', lang)}</span>
                            </a>
                            <a href="/how-it-works" class="btn btn-primary btn-lg">
                                ℹ️ <span data-i18n="hero.cta.secondary">${t('hero.cta.secondary', lang)}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Trust & Social Proof Section -->
            <section class="trust-section">
                <div class="container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-number">5,480+</div>
                            <div class="stat-label" data-i18n="trust.complaints.label">${t('trust.complaints.label', lang)}</div>
                            <div class="stat-description">${lang === 'hi' ? 'नागरिकों द्वारा दर्ज' : 'Filed by citizens'}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-number">4,100+</div>
                            <div class="stat-label" data-i18n="trust.resolved.label">${t('trust.resolved.label', lang)}</div>
                            <div class="stat-description">${lang === 'hi' ? 'सफलतापूर्वक हल किया गया' : 'Successfully resolved'}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-number">3.5</div>
                            <div class="stat-label">${lang === 'hi' ? 'दिन औसत समाधान समय' : 'Days Avg. Resolution Time'}</div>
                            <div class="stat-description">${lang === 'hi' ? 'तेज़ प्रतिक्रिया' : 'Quick response'}</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="how-it-works-section" id="how-it-works">
                <div class="container">
                    <h2 class="section-title" data-i18n="how.title">${t('how.title', lang)}</h2>
                    <div class="steps-container">
                        <div class="step-card">
                            <div class="step-number">1</div>
                            <div class="step-icon">📋</div>
                            <h3 class="step-title" data-i18n="how.step1.title">${t('how.step1.title', lang)}</h3>
                            <p class="step-description" data-i18n="how.step1.desc">
                                ${t('how.step1.desc', lang)}
                            </p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">2</div>
                            <div class="step-icon">⚙️</div>
                            <h3 class="step-title" data-i18n="how.step2.title">${t('how.step2.title', lang)}</h3>
                            <p class="step-description" data-i18n="how.step2.desc">
                                ${t('how.step2.desc', lang)}
                            </p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">3</div>
                            <div class="step-icon">🎯</div>
                            <h3 class="step-title" data-i18n="how.step3.title">${t('how.step3.title', lang)}</h3>
                            <p class="step-description" data-i18n="how.step3.desc">
                                ${t('how.step3.desc', lang)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Feature Showcase Section -->
            <section class="features-section">
                <div class="container">
                    <h2 class="section-title" data-i18n="features.title">${t('features.title', lang)}</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">📝</div>
                            <h3 data-i18n="features.multimodal.title">${t('features.multimodal.title', lang)}</h3>
                            <p data-i18n="features.multimodal.desc">${t('features.multimodal.desc', lang)}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">⏱️</div>
                            <h3 data-i18n="features.realtime.title">${t('features.realtime.title', lang)}</h3>
                            <p data-i18n="features.realtime.desc">${t('features.realtime.desc', lang)}</p>
                        </div>
                        <div class="feature-card highlight-feature">
                            <div class="feature-badge">${lang === 'hi' ? 'नया' : 'NEW'}</div>
                            <div class="feature-icon">🤖</div>
                            <h3>${lang === 'hi' ? 'AI/ML संचालित' : 'AI/ML Powered'}</h3>
                            <p>${lang === 'hi' ? 'स्वचालित श्रेणीकरण और प्राथमिकता के लिए उन्नत मशीन लर्निंग' : 'Advanced machine learning for auto-categorization and priority'}</p>
                        </div>
                        <div class="feature-card highlight-feature">
                            <div class="feature-badge">${lang === 'hi' ? 'नया' : 'NEW'}</div>
                            <div class="feature-icon">🎮</div>
                            <h3>${lang === 'hi' ? 'गेमिफिकेशन' : 'Gamification'}</h3>
                            <p>${lang === 'hi' ? 'बैज, प्रभाव स्कोर और उपलब्धियों के साथ जुड़ाव बढ़ाएं' : 'Earn badges, impact scores, and achievements for engagement'}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🔒</div>
                            <h3 data-i18n="features.secure.title">${t('features.secure.title', lang)}</h3>
                            <p data-i18n="features.secure.desc">${t('features.secure.desc', lang)}</p>
                        </div>
                        <div class="feature-card highlight-feature">
                            <div class="feature-badge">${lang === 'hi' ? 'नया' : 'NEW'}</div>
                            <div class="feature-icon">💬</div>
                            <h3>${lang === 'hi' ? 'सामाजिक सुविधाएं' : 'Social Features'}</h3>
                            <p>${lang === 'hi' ? 'टिप्पणियां, हाइप और शेयर करें - सामुदायिक जुड़ाव' : 'Comments, hype, and share - community engagement'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Working with Local Authorities Section -->
            <section class="authorities-section">
                <div class="container">
                    <h2 class="section-title" data-i18n="authorities.title">${t('authorities.title', lang)}</h2>
                    <p class="section-subtitle" data-i18n="authorities.subtitle">${t('authorities.subtitle', lang)}</p>
                    <div class="authorities-logos">
                        <a href="/authorities/municipal" class="authority-logo">
                            <div class="logo-placeholder">🏛️</div>
                            <span data-i18n="authorities.municipal">${t('authorities.municipal', lang)}</span>
                        </a>
                        <a href="/authorities/police" class="authority-logo">
                            <div class="logo-placeholder">👮</div>
                            <span data-i18n="authorities.police">${t('authorities.police', lang)}</span>
                        </a>
                        <a href="/authorities/electricity" class="authority-logo">
                            <div class="logo-placeholder">⚡</div>
                            <span data-i18n="authorities.electricity">${t('authorities.electricity', lang)}</span>
                        </a>
                        <a href="/authorities/water" class="authority-logo">
                            <div class="logo-placeholder">💧</div>
                            <span data-i18n="authorities.water">${t('authorities.water', lang)}</span>
                        </a>
                        <a href="/authorities" class="authority-logo and-more">
                            <div class="logo-placeholder">➕</div>
                            <span>${lang === 'hi' ? 'और अधिक.......' : 'and more.......'}</span>
                        </a>
                    </div>
                </div>
            </section>

            <!-- Recent Community Impact Section -->
            <section class="impact-section">
                <div class="container">
                    <h2 class="section-title" data-i18n="impact.title">${t('impact.title', lang)}</h2>
                    <div class="impact-feed-container">
                        <div class="impact-feed" id="impactFeed">
                            ${generateImpactCards(lang)}
                        </div>
                    </div>
                </div>
            </section>

            <!-- User Feedback Section -->
            <section class="feedback-section">
                <div class="container">
                    <h2 class="section-title" data-i18n="testimonials.title">${t('testimonials.title', lang)}</h2>
                    <div class="feedback-carousel">
                        ${generateTestimonials(lang)}
                    </div>
                </div>
            </section>

            <!-- Scope of Service Section -->
            <section class="scope-section">
                <div class="container">
                    <h2 class="section-title" data-i18n="scope.title">${t('scope.title', lang)}</h2>
                    <div class="scope-grid">
                        <div class="scope-column yes-scope">
                            <div class="scope-header">
                                <span class="scope-icon">✅</span>
                                <h3 data-i18n="scope.yes.title">${t('scope.yes.title', lang)}</h3>
                            </div>
                            <ul class="scope-list">
                                <li data-i18n="scope.yes.1">${t('scope.yes.1', lang)}</li>
                                <li data-i18n="scope.yes.2">${t('scope.yes.2', lang)}</li>
                                <li data-i18n="scope.yes.3">${t('scope.yes.3', lang)}</li>
                                <li data-i18n="scope.yes.4">${t('scope.yes.4', lang)}</li>
                                <li data-i18n="scope.yes.5">${t('scope.yes.5', lang)}</li>
                            </ul>
                        </div>
                        <div class="scope-column no-scope">
                            <div class="scope-header">
                                <span class="scope-icon">❌</span>
                                <h3 data-i18n="scope.no.title">${t('scope.no.title', lang)}</h3>
                            </div>
                            <ul class="scope-list">
                                <li data-i18n="scope.no.1">${t('scope.no.1', lang)}</li>
                                <li data-i18n="scope.no.2">${t('scope.no.2', lang)}</li>
                                <li class="emergency-item">${t('scope.no.3', lang)}</li>
                                <li data-i18n="scope.no.4">${t('scope.no.4', lang)}</li>
                                <li class="emergency-item" data-i18n="scope.emergency">${t('scope.emergency', lang)}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Enhanced Footer -->
            <footer class="enhanced-footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-col footer-about">
                            <div class="footer-logo">
                                <h2>मेरी शिकायत</h2>
                                <p data-i18n="footer.tagline">${t('footer.tagline', lang)}</p>
                            </div>
                            <div class="about-section">
                                <h4>${lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</h4>
                                <p>${lang === 'hi' ? 'मेरी शिकायत एक नागरिक-केंद्रित मंच है जो नागरिकों को सरकारी अधिकारियों के साथ सीधे जोड़ता है। हम पारदर्शिता, जवाबदेही और तेज़ समाधान में विश्वास करते हैं।' : 'Meri Shikayat is a citizen-centric platform connecting people directly with government authorities. We believe in transparency, accountability, and quick resolution.'}</p>
                            </div>
                        </div>
                        <div class="footer-col">
                            <h3 data-i18n="footer.quick.title">${t('footer.quick.title', lang)}</h3>
                            <ul class="footer-links-list">
                                <li><a href="/about">${lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</a></li>
                                <li><a href="/how-it-works">${lang === 'hi' ? 'यह कैसे काम करता है' : 'How It Works'}</a></li>
                                <li><a href="/success-stories">${lang === 'hi' ? 'सफलता की कहानियां' : 'Success Stories'}</a></li>
                                <li><a href="/contact" data-i18n="footer.quick.contact">${t('footer.quick.contact', lang)}</a></li>
                                <li><a href="/faq" data-i18n="footer.quick.faq">${t('footer.quick.faq', lang)}</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h3 data-i18n="footer.legal.title">${t('footer.legal.title', lang)}</h3>
                            <ul class="footer-links-list">
                                <li><a href="/privacy" data-i18n="footer.legal.privacy">${t('footer.legal.privacy', lang)}</a></li>
                                <li><a href="/terms" data-i18n="footer.legal.terms">${t('footer.legal.terms', lang)}</a></li>
                                <li><a href="/disclaimer" data-i18n="footer.legal.disclaimer">${t('footer.legal.disclaimer', lang)}</a></li>
                                <li><a href="/guidelines">${lang === 'hi' ? 'सामुदायिक दिशानिर्देश' : 'Community Guidelines'}</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h3 data-i18n="footer.contact.title">${t('footer.contact.title', lang)}</h3>
                            <ul class="footer-links-list">
                                <li><a href="/contact">${lang === 'hi' ? 'संपर्क पृष्ठ' : 'Contact Page'}</a></li>
                                <li><a href="/help">${lang === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Social Media Section - Bottom of Footer -->
                    <div class="footer-social-section">
                        <h3 class="social-title">${lang === 'hi' ? 'सोशल मीडिया' : 'Social Media'}</h3>
                        <div class="footer-social-icons">
                            <a href="https://facebook.com/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon facebook" title="Facebook">
                                <span>📘</span>
                            </a>
                            <a href="https://instagram.com/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon instagram" title="Instagram">
                                <span>📷</span>
                            </a>
                            <a href="https://twitter.com/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon twitter" title="X (Twitter)">
                                <span>𝕏</span>
                            </a>
                            <a href="https://reddit.com/user/merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon reddit" title="Reddit">
                                <span>🤖</span>
                            </a>
                            <a href="https://youtube.com/@merishikayat" target="_blank" rel="noopener noreferrer" class="social-icon youtube" title="YouTube">
                                <span>▶️</span>
                            </a>
                        </div>
                        <a href="/follow-us" class="view-all-feeds">${lang === 'hi' ? 'सभी फीड देखें' : 'View All Feeds'}</a>
                    </div>
                    
                    <div class="footer-bottom">
                        <p data-i18n="footer.copyright">${t('footer.copyright', lang)}</p>
                    </div>
                </div>
            </footer>
        </div>
    `;
}

/**
 * Generate impact cards with sample data
 */
function generateImpactCards(lang) {
    const impacts = [
        { status: 'resolved', time: lang === 'hi' ? '1 घंटे पहले' : '1 hour ago', text: lang === 'hi' ? 'MG रोड (सेक्टर 12) पर गड्ढा भरा गया।' : 'Pothole repaired on MG Road (Sector 12).' },
        { status: 'in-progress', time: lang === 'hi' ? '3 घंटे पहले' : '3 hours ago', text: lang === 'hi' ? 'सिटी पार्क के पास स्ट्रीटलाइट की समस्या रिपोर्ट की गई।' : 'Streetlight issue reported near City Park.' },
        { status: 'resolved', time: lang === 'hi' ? 'कल' : 'Yesterday', text: lang === 'hi' ? 'वार्ड 5 में कचरा संग्रहण में सुधार।' : 'Waste collection improved in Ward 5.' },
        { status: 'new', time: lang === 'hi' ? 'कल' : 'Yesterday', text: lang === 'hi' ? 'मुख्य सड़क पर पानी का रिसाव रिपोर्ट किया गया।' : 'Water leakage reported on Main Street.' },
        { status: 'resolved', time: lang === 'hi' ? '2 दिन पहले' : '2 days ago', text: lang === 'hi' ? 'बाजार क्षेत्र में सार्वजनिक स्वच्छता में सुधार।' : 'Public sanitation improved in Market Area.' }
    ];

    return impacts.map(impact => `
        <div class="impact-card ${impact.status}">
            <div class="impact-header">
                <span class="status-badge ${impact.status}">${getStatusLabel(impact.status, lang)}</span>
                <span class="timestamp">${impact.time}</span>
            </div>
            <p class="impact-text">${impact.text}</p>
        </div>
    `).join('') + impacts.map(impact => `
        <div class="impact-card ${impact.status}">
            <div class="impact-header">
                <span class="status-badge ${impact.status}">${getStatusLabel(impact.status, lang)}</span>
                <span class="timestamp">${impact.time}</span>
            </div>
            <p class="impact-text">${impact.text}</p>
        </div>
    `).join(''); // Duplicate for infinite scroll effect
}

/**
 * Generate testimonials
 */
function generateTestimonials(lang) {
    const testimonials = lang === 'hi' ? [
        { text: '"आखिरकार गड्ढे भरवाने का एक तरीका! प्रतिक्रिया मेरी अपेक्षा से तेज थी।"', name: 'राहुल शर्मा', location: 'निवासी, सेक्टर 4' },
        { text: '"वीडियो अपलोड सुविधा से समस्या दिखाना बहुत आसान हो गया। बढ़िया पहल!"', name: 'प्रिया सिंह', location: 'निवासी, वार्ड 12' },
        { text: '"मैं रियल-टाइम में अपनी शिकायत की स्थिति देख सकता हूं। बहुत पारदर्शी प्रक्रिया।"', name: 'अमित पटेल', location: 'दुकान मालिक, मुख्य बाजार' }
    ] : [
        { text: '"Finally a way to get potholes fixed! The response was quicker than I expected."', name: 'Rahul Sharma', location: 'Resident, Sector 4' },
        { text: '"The video upload feature makes it so easy to show the exact problem. Great initiative!"', name: 'Priya Singh', location: 'Resident, Ward 12' },
        { text: '"I can see my complaint status in real-time. Very transparent process."', name: 'Amit Patel', location: 'Shop Owner, Main Market' }
    ];

    return testimonials.map((testimonial, index) => `
        <div class="feedback-card ${index === 0 ? 'active' : ''}">
            <p class="feedback-text">${testimonial.text}</p>
            <div class="feedback-author">
                <div class="author-avatar">👤</div>
                <div class="author-info">
                    <h4>${testimonial.name}</h4>
                    <span>${testimonial.location}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Get status label in current language
 */
function getStatusLabel(status, lang) {
    const labels = {
        'resolved': lang === 'hi' ? 'हल हो गया' : 'Resolved',
        'in-progress': lang === 'hi' ? 'प्रगति में' : 'In Progress',
        'new': lang === 'hi' ? 'नई शिकायत' : 'New Complaint'
    };
    return labels[status] || status;
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    const app = document.getElementById('app');

    // Language toggle buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            setLanguage(lang);
            renderHomePage();
        });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    if (mobileMenuToggle && mobileNav && mobileNavOverlay) {
        // Toggle menu on button click
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on overlay click
        mobileNavOverlay.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu on link click
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Feedback carousel
    const feedbackCards = app.querySelectorAll('.feedback-card');
    if (feedbackCards.length > 0) {
        let currentFeedback = 0;
        setInterval(() => {
            feedbackCards[currentFeedback].classList.remove('active');
            currentFeedback = (currentFeedback + 1) % feedbackCards.length;
            feedbackCards[currentFeedback].classList.add('active');
        }, 5000);
    }
}
