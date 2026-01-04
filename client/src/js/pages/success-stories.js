/**
 * Success Stories Page
 * Showcase real impact, testimonials, and community success
 */

export function renderSuccessStoriesPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="success-stories-page">
            <!-- Header -->
            <header class="success-header">
                <div class="container">
                    <nav class="success-navbar">
                        <div class="logo">
                            <h1>मेरी शिकायत</h1>
                        </div>
                        <div class="nav-links">
                            <a href="/" class="nav-link">Home</a>
                            <a href="/dashboard" class="nav-link">Dashboard</a>
                            <a href="/file-complaint" class="btn btn-primary btn-sm">File Complaint</a>
                        </div>
                    </nav>
                </div>
            </header>

            <!-- Hero Section -->
            <section class="success-hero">
                <div class="container">
                    <div class="hero-content">
                        <h1 class="hero-title">Real Impact, Real Results</h1>
                        <p class="hero-subtitle">See how Meri Shikayat is transforming communities across India</p>
                        
                        <!-- Impact Statistics -->
                        <div class="impact-stats">
                            <div class="stat-box">
                                <div class="stat-number">5,480+</div>
                                <div class="stat-label">Complaints Filed</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-number">4,100+</div>
                                <div class="stat-label">Issues Resolved</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-number">75%</div>
                                <div class="stat-label">Resolution Rate</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-number">3.5</div>
                                <div class="stat-label">Days Avg. Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Featured Success Stories -->
            <section class="featured-stories">
                <div class="container">
                    <h2 class="section-title">Featured Success Stories</h2>
                    <p class="section-subtitle">Real problems solved by real people in your community</p>
                    
                    <div class="stories-grid">
                        <!-- Story Card 1 -->
                        <div class="story-card">
                            <div class="story-header">
                                <span class="category-badge infrastructure">Infrastructure</span>
                                <span class="resolution-time">✓ Resolved in 2 days</span>
                            </div>
                            <div class="story-images">
                                <div class="before-after-container">
                                    <div class="image-box before">
                                        <span class="image-label">Before</span>
                                        <div class="placeholder-image">🚧</div>
                                    </div>
                                    <div class="image-box after">
                                        <span class="image-label">After</span>
                                        <div class="placeholder-image">✨</div>
                                    </div>
                                </div>
                            </div>
                            <h3>Dangerous Pothole Fixed on MG Road</h3>
                            <blockquote class="story-quote">
                                "I reported a dangerous pothole that had been there for months. Within 2 days, 
                                it was completely repaired. The response was incredible!"
                            </blockquote>
                            <div class="story-author">
                                <div class="author-avatar">👤</div>
                                <div class="author-info">
                                    <strong>Rahul Sharma</strong>
                                    <span>Sector 12, Delhi</span>
                                </div>
                            </div>
                            <div class="story-stats">
                                <span>📅 March 2025</span>
                                <span>⭐ 5.0 Rating</span>
                            </div>
                        </div>

                        <!-- Story Card 2 -->
                        <div class="story-card">
                            <div class="story-header">
                                <span class="category-badge sanitation">Sanitation</span>
                                <span class="resolution-time">✓ Resolved in 1 day</span>
                            </div>
                            <div class="story-images">
                                <div class="before-after-container">
                                    <div class="image-box before">
                                        <span class="image-label">Before</span>
                                        <div class="placeholder-image">🗑️</div>
                                    </div>
                                    <div class="image-box after">
                                        <span class="image-label">After</span>
                                        <div class="placeholder-image">✨</div>
                                    </div>
                                </div>
                            </div>
                            <h3>Overflowing Garbage Bins Cleared</h3>
                            <blockquote class="story-quote">
                                "The garbage bins near my house were overflowing for weeks. I used the video 
                                feature to show the problem, and it was resolved the very next day!"
                            </blockquote>
                            <div class="story-author">
                                <div class="author-avatar">👤</div>
                                <div class="author-info">
                                    <strong>Priya Singh</strong>
                                    <span>Ward 12, Mumbai</span>
                                </div>
                            </div>
                            <div class="story-stats">
                                <span>📅 March 2025</span>
                                <span>⭐ 5.0 Rating</span>
                            </div>
                        </div>

                        <!-- Story Card 3 -->
                        <div class="story-card">
                            <div class="story-header">
                                <span class="category-badge utilities">Utilities</span>
                                <span class="resolution-time">✓ Resolved in 3 days</span>
                            </div>
                            <div class="story-images">
                                <div class="before-after-container">
                                    <div class="image-box before">
                                        <span class="image-label">Before</span>
                                        <div class="placeholder-image">💡</div>
                                    </div>
                                    <div class="image-box after">
                                        <span class="image-label">After</span>
                                        <div class="placeholder-image">✨</div>
                                    </div>
                                </div>
                            </div>
                            <h3>Street Lights Restored in Park Area</h3>
                            <blockquote class="story-quote">
                                "Our park was dark and unsafe at night. After filing a complaint with photos, 
                                all streetlights were fixed within 3 days. Thank you!"
                            </blockquote>
                            <div class="story-author">
                                <div class="author-avatar">👤</div>
                                <div class="author-info">
                                    <strong>Amit Patel</strong>
                                    <span>Sector 5, Bangalore</span>
                                </div>
                            </div>
                            <div class="story-stats">
                                <span>📅 February 2025</span>
                                <span>⭐ 4.8 Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Video Testimonials -->
            <section class="video-testimonials">
                <div class="container">
                    <h2 class="section-title">Hear From Our Community</h2>
                    <p class="section-subtitle">Watch real citizens share their success stories</p>
                    
                    <div class="video-grid">
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <div class="play-button">▶</div>
                                <div class="video-duration">2:30</div>
                            </div>
                            <h4>Road Repair Success - Rahul's Story</h4>
                            <p>How a simple complaint fixed a major road hazard</p>
                        </div>
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <div class="play-button">▶</div>
                                <div class="video-duration">1:45</div>
                            </div>
                            <h4>Sanitation Improvement - Priya's Experience</h4>
                            <p>From complaint to resolution in 24 hours</p>
                        </div>
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <div class="play-button">▶</div>
                                <div class="video-duration">3:15</div>
                            </div>
                            <h4>Community Impact - Multiple Stories</h4>
                            <p>How Meri Shikayat is changing neighborhoods</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Social Media Integration -->
            <section class="social-proof">
                <div class="container">
                    <h2 class="section-title">Follow Our Journey</h2>
                    <p class="section-subtitle">Stay connected on social media</p>
                    
                    <div class="social-tabs">
                        <button class="social-tab active" data-platform="twitter">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            Twitter
                        </button>
                        <button class="social-tab" data-platform="instagram">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Instagram
                        </button>
                        <button class="social-tab" data-platform="facebook">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </button>
                        <button class="social-tab" data-platform="youtube">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            YouTube
                        </button>
                    </div>

                    <div class="social-feed" id="socialFeed">
                        <!-- Twitter Feed (Default) -->
                        <div class="feed-content active" data-platform="twitter">
                            <div class="social-post">
                                <div class="post-header">
                                    <strong>@MeriShikayat</strong>
                                    <span>2 hours ago</span>
                                </div>
                                <p>🎉 Another success! Pothole on MG Road fixed within 48 hours. Thank you to our active citizens! #CommunityFirst</p>
                                <div class="post-stats">
                                    <span>❤️ 245</span>
                                    <span>🔄 89</span>
                                    <span>💬 34</span>
                                </div>
                            </div>
                            <div class="social-post">
                                <div class="post-header">
                                    <strong>@MeriShikayat</strong>
                                    <span>1 day ago</span>
                                </div>
                                <p>📊 This week: 127 complaints filed, 98 resolved! Our resolution rate is at an all-time high of 77%! 🚀</p>
                                <div class="post-stats">
                                    <span>❤️ 412</span>
                                    <span>🔄 156</span>
                                    <span>💬 67</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="social-links-section">
                        <h3>Connect With Us</h3>
                        <div class="social-buttons">
                            <a href="https://twitter.com/merishikayat" target="_blank" class="social-button twitter">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                Follow on Twitter
                            </a>
                            <a href="https://instagram.com/merishikayat" target="_blank" class="social-button instagram">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                Follow on Instagram
                            </a>
                            <a href="https://facebook.com/merishikayat" target="_blank" class="social-button facebook">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Like on Facebook
                            </a>
                            <a href="https://youtube.com/@merishikayat" target="_blank" class="social-button youtube">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                Subscribe on YouTube
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Blog/Articles Section -->
            <section class="blog-section">
                <div class="container">
                    <h2 class="section-title">Latest from Our Blog</h2>
                    <p class="section-subtitle">Tips, updates, and success stories from the community</p>
                    
                    <div class="blog-grid">
                        <article class="blog-card">
                            <div class="blog-image">
                                <div class="placeholder-blog-image">📝</div>
                                <span class="blog-category">Success Story</span>
                            </div>
                            <div class="blog-content">
                                <h3>How One Complaint Transformed an Entire Neighborhood</h3>
                                <p>Read about how a single citizen's complaint led to a complete sanitation overhaul in Ward 12...</p>
                                <div class="blog-meta">
                                    <span>📅 March 15, 2025</span>
                                    <span>⏱️ 5 min read</span>
                                </div>
                                <a href="#" class="read-more">Read More →</a>
                            </div>
                        </article>

                        <article class="blog-card">
                            <div class="blog-image">
                                <div class="placeholder-blog-image">💡</div>
                                <span class="blog-category">Tips</span>
                            </div>
                            <div class="blog-content">
                                <h3>5 Tips for Filing Effective Complaints</h3>
                                <p>Learn how to make your complaints more effective with photos, videos, and detailed descriptions...</p>
                                <div class="blog-meta">
                                    <span>📅 March 12, 2025</span>
                                    <span>⏱️ 3 min read</span>
                                </div>
                                <a href="#" class="read-more">Read More →</a>
                            </div>
                        </article>

                        <article class="blog-card">
                            <div class="blog-image">
                                <div class="placeholder-blog-image">📊</div>
                                <span class="blog-category">Update</span>
                            </div>
                            <div class="blog-content">
                                <h3>February 2025: Monthly Impact Report</h3>
                                <p>See the numbers behind our success - complaints filed, resolved, and the impact on communities...</p>
                                <div class="blog-meta">
                                    <span>📅 March 1, 2025</span>
                                    <span>⏱️ 4 min read</span>
                                </div>
                                <a href="#" class="read-more">Read More →</a>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <!-- Statistics Dashboard -->
            <section class="stats-dashboard">
                <div class="container">
                    <h2 class="section-title">Impact by the Numbers</h2>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h4>Complaints by Category</h4>
                            <div class="category-bars">
                                <div class="category-bar">
                                    <span class="category-name">Infrastructure</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 35%"></div>
                                    </div>
                                    <span class="category-count">1,918</span>
                                </div>
                                <div class="category-bar">
                                    <span class="category-name">Sanitation</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 28%"></div>
                                    </div>
                                    <span class="category-count">1,534</span>
                                </div>
                                <div class="category-bar">
                                    <span class="category-name">Utilities</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 22%"></div>
                                    </div>
                                    <span class="category-count">1,206</span>
                                </div>
                                <div class="category-bar">
                                    <span class="category-name">Safety</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 15%"></div>
                                    </div>
                                    <span class="category-count">822</span>
                                </div>
                            </div>
                        </div>

                        <div class="dashboard-card">
                            <h4>Resolution Timeline</h4>
                            <div class="timeline-stats">
                                <div class="timeline-item">
                                    <span class="timeline-label">< 24 hours</span>
                                    <div class="timeline-value">32%</div>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-label">1-3 days</span>
                                    <div class="timeline-value">43%</div>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-label">4-7 days</span>
                                    <div class="timeline-value">18%</div>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-label">> 7 days</span>
                                    <div class="timeline-value">7%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Testimonials Carousel -->
            <section class="testimonials-carousel">
                <div class="container">
                    <h2 class="section-title">What Citizens Are Saying</h2>
                    
                    <div class="carousel-container">
                        <div class="testimonial-slide active">
                            <div class="testimonial-content">
                                <div class="quote-icon">"</div>
                                <p class="testimonial-text">
                                    "Meri Shikayat has completely changed how I interact with local authorities. 
                                    The transparency and quick response time are incredible!"
                                </p>
                                <div class="testimonial-author">
                                    <div class="author-avatar">👤</div>
                                    <div>
                                        <strong>Anjali Verma</strong>
                                        <span>Delhi</span>
                                        <div class="rating">⭐⭐⭐⭐⭐</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Call to Action -->
            <section class="cta-section">
                <div class="container">
                    <div class="cta-content">
                        <h2>Be Part of the Change</h2>
                        <p>Your voice matters. File a complaint today and help make your community better.</p>
                        <div class="cta-buttons">
                            <a href="/file-complaint" class="btn btn-primary btn-lg">File Your Complaint</a>
                            <a href="/register" class="btn btn-outline-light btn-lg">Join Our Community</a>
                        </div>
                        
                        <div class="share-section">
                            <p>Share our success stories:</p>
                            <div class="share-buttons">
                                <button class="share-btn" onclick="shareOnSocial('twitter')">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                </button>
                                <button class="share-btn" onclick="shareOnSocial('facebook')">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </button>
                                <button class="share-btn" onclick="shareOnSocial('whatsapp')">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                </button>
                                <button class="share-btn" onclick="shareOnSocial('linkedin')">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="success-footer">
                <div class="container">
                    <p>&copy; 2025 Meri Shikayat. Making communities better, one complaint at a time.</p>
                </div>
            </footer>
        </div>
    `;

    // Add event listeners
    initSuccessStoriesPage();
}

function initSuccessStoriesPage() {
    // Social tabs switching
    const socialTabs = document.querySelectorAll('.social-tab');
    socialTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            socialTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // In a real app, this would load different social feeds
            console.log('Switched to:', tab.dataset.platform);
        });
    });

    // Navigation links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('href');
            window.router.navigate(path);
        });
    });
}

// Social sharing function
window.shareOnSocial = function (platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out these amazing success stories from Meri Shikayat!');

    let shareUrl;
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
};
