# Meri Shikayat
![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Production Ready](https://img.shields.io/badge/production-ready-green.svg)
![Security](https://img.shields.io/badge/security-A--grade-brightgreen.svg)

Meri Shikayat is an enterprise-grade citizen grievance redressal platform designed to bridge the gap between citizens and municipal authorities. It allows users to report issues like potholes, garbage, and street light failures, track their status, and ensures accountability through a transparent, secure process.

## ✨ Features

### Core Features
- **Citizen Reporting**: Submit complaints with text, images, audio, and video
- **Location Tracking**: Auto-detect location for accurate issue reporting
- **Real-time Status**: Track complaint progress from 'Pending' to 'Resolved'
- **Admin Dashboard**: Manage, assign, and update complaints efficiently
- **Department Integration**: Auto-routing to 12 government departments (PWD, Water, Sanitation, etc.)
- **Connected Authorities**: Dynamic directory with real-time statistics and personnel
- **Private Contractors**: Verified contractor management with performance tracking
- **User Profiles**: Comprehensive profile system with location and complaint history
- **Gamification**: Points, badges, and achievements for civic engagement
- **Community Features**: Success stories, leaderboards, and social engagement

### 🔒 Security Features (v1.1.0)
- **Enterprise Authentication**: JWT with refresh tokens, 2FA support
- **RBAC System**: Role-based access control with granular permissions
- **Input Validation**: Comprehensive Joi schemas with XSS prevention
- **CSRF Protection**: Cookie-based CSRF tokens for state-changing requests
- **Rate Limiting**: Redis-backed distributed rate limiting
- **Request Signing**: HMAC SHA-256 for API security
- **Audit Logging**: Comprehensive event tracking for compliance
- **GDPR Compliance**: Data export, deletion, and consent management
- **Security Headers**: Strict CSP, HSTS, and additional protections

### 🚀 Production Infrastructure (v1.1.0)
- **Monitoring**: DataDog APM with custom metrics and distributed tracing
- **Logging**: CloudWatch centralized logging with 30-day retention
- **Alerting**: PagerDuty integration with predefined alert templates
- **Health Checks**: Kubernetes-ready liveness and readiness probes
- **Performance**: Database indexes (10x speedup), Redis caching, CDN integration
- **Image Optimization**: WebP conversion with 60% compression
- **CI/CD**: GitHub Actions pipeline with automated testing and deployment
- **Disaster Recovery**: Automated backups with RTO < 4hr, RPO < 24hr
- **Load Testing**: k6 scripts for 1000+ req/s capacity validation

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Modern, Responsive)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with optimized indexes
- **Cache**: Redis for distributed caching and rate limiting
- **Authentication**: JWT with 2FA support
- **Monitoring**: DataDog APM, CloudWatch Logs
- **Alerting**: PagerDuty
- **CI/CD**: GitHub Actions
- **Infrastructure**: Docker, Kubernetes-ready

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/shoraj1551/meri-shikayat.git
    ```

2.  **Install Dependencies**
    ```bash
    npm run install-all
    ```

3.  **Environment Setup**
    - Create `.env` in `server/` and `client/` based on `.env.example`.

4.  **Run the Application**
    - **Server**:
      ```bash
      cd server
      npm run dev
      ```
    - **Client**:
      ```bash
      cd client
      npm run dev
      ```

## License

This project is licensed under the ISC License.
