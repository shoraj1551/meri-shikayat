# Meri Shikayat

![Version](https://img.shields.io/badge/version-0.0096-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Current Version**: v0.0096  
**Last Updated**: December 6, 2025

A comprehensive complaint registration system that allows users to submit complaints through multiple channels including text, audio, video, and images.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (v5+)
- npm or yarn

### Installation & Running

```bash
# Clone the repository
git clone <repository-url>

# Install & run backend
cd server
npm install
npm run dev

# Install & run frontend (new terminal)
cd client
npm install
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📝 **Text Complaints** | Submit detailed written complaints |
| 🎤 **Audio Complaints** | Record and submit voice complaints |
| 📹 **Video Complaints** | Upload or record video evidence |
| 📷 **Image Complaints** | Attach photos to support complaints |
| 👤 **User Management** | Registration, authentication & profiles |
| 👨‍💼 **Admin System** | Role-based access control (RBAC) |
| 📊 **Dashboard** | Track and manage complaints |
| 🔔 **Notifications** | Email/SMS alerts for status updates |
| 🗺️ **Location Services** | GPS, pincode & manual location selection |
| 🔐 **Remember Me** | Persistent login with refresh tokens |
| 🔑 **Password Recovery** | 3-step OTP-based password reset |
| 🌍 **Multi-Environment** | Dev, UAT, and Production deployments |

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB (10 models with indexes)
- **Authentication**: JWT + Refresh Tokens + OTP (2FA)
- **Email**: NodeMailer
- **Deployment**: Vercel (Multi-environment)
- **File Storage**: Multer (Cloud-ready)

## 📁 Project Structure

```
meri-shikayat/
├── client/              # Frontend (Vite + Vanilla JS)
├── server/              # Backend API (Express)
│   ├── src/
│   │   ├── models/      # 10 MongoDB models
│   │   ├── seeds/       # Database seeders
│   │   ├── services/    # Business logic
│   │   └── controllers/ # Route handlers
├── vercel.json          # Production config
├── vercel.dev.json      # Development config
├── vercel.uat.json      # UAT config
└── docs/                # Documentation
```

## 📋 Recent Updates

### v0.0096 (Current) - December 6, 2025
**Feature Enhancements & UX Fixes**

**New Features:**
- ✨ **Department Reference**: Added `department` field to Complaint model with auto-assignment logic
  - Complaints can now be routed to specific government departments
  - Added department index for performance
  - Updated controllers to populate department data
- ✨ **Media Model Integration**: Integrated `Media` model with Complaint
  - Replaced simple `mediaUrl` string with `media` array of ObjectIds
  - Captures rich metadata: file type, size, mimeType, original name
  - Supports multiple file attachments (future-proof)
  - Auto-detects media type (image, video, audio, document)

**Bug Fixes & UX Improvements:**
- 🐛 **Fixed Floating Labels**: Re-enabled floating labels and focus animations in all auth forms (Login, Register, Admin)
  - Restored Phase 2 visual enhancements
- 🐛 **Fixed CSS Regression**: Resolved alignment issue where labels were "out of sync"
  - Adjusted CSS positioning for floating labels in `main.css`
- ✅ **Verified Login Page**: Confirmed correct imports and functionality

### v0.0095 - December 5, 2025
**Critical Bug Fixes - Auth Service & Category Schema**

**Bug Fixes:**
- 🐛 **Fixed Missing Auth Imports**: Added missing import statements in `register.js` for `authService` and form utilities
  - Registration page was broken due to missing imports
  - Added imports for: `authService`, `initPasswordToggle`, `initPasswordStrength`, `isValidEmail`, `isValidPhone`, `showError`, `hideError`
  - All auth pages now load without console errors
  
- 🐛 **Fixed Category Schema Mismatch**: Converted Complaint category from hardcoded string enum to Category ObjectId reference
  - Changed category field from `String` to `ObjectId` reference
  - Added category index for better query performance
  - Updated all controllers to populate category data (icons, colors, departments)
  - Seed data Categories are now actually used instead of being wasted
  - **Breaking Change**: Frontend needs updates to send category ObjectIds
  - **Note**: Tests need updating to use Category ObjectIds

**Technical Changes:**
- Modified: `client/src/js/pages/register.js` (10 insertions)
- Modified: `server/src/models/Complaint.js` (schema change + index)
- Modified: `server/src/controllers/complaint.controller.js` (2 populate calls)
- Modified: `server/src/controllers/complaint-admin.controller.js` (2 populate calls)

### v0.0094 - December 5, 2025
**Multi-Environment Deployment & Complete Database Schema**

**Vercel Deployment:**
- ✅ **3 Environment Configs**: Separate configs for dev, UAT, and production
- ✅ **Auto-Deployment**: Branch-specific automatic deployments
- ✅ **Environment Variables**: Isolated settings per environment
- ✅ **Complete Setup Guide**: Step-by-step Vercel deployment instructions

**Database Models (10 Total):**
- ✅ **Category Model**: Complaint categorization with icons and colors
- ✅ **Department Model**: Government departments with routing logic
- ✅ **Media Model**: File upload tracking (images, videos, audio, documents)
- ✅ **Notification Model**: User and admin notifications with TTL
- ✅ **AuditLog Model**: System-wide audit trail with 90-day retention
- ✅ **Session Model**: Active session tracking with device info
- ✅ **OTPLog Model**: OTP audit trail for security compliance

**Database Enhancements:**
- ✅ **Indexes**: Performance-optimized queries on all models
- ✅ **TTL Indexes**: Auto-delete old logs and expired sessions
- ✅ **Validation**: Comprehensive data validation rules
- ✅ **Helper Methods**: Built-in model methods for common operations

**Seed Data:**
- ✅ **Development Seeds**: 10 test users, 5 admins, 10 categories, 5 departments
- ✅ **UAT Seeds**: 50 realistic users, 10 admins, production-like data
- ✅ **Environment-Aware**: Automatic seeding based on NODE_ENV
- ✅ **NPM Scripts**: `npm run seed:dev` and `npm run seed:uat`

**Documentation:**
- ✅ **VERCEL_SETUP.md**: Complete Vercel deployment guide
- ✅ **DEPLOYMENT.md**: General deployment documentation
- ✅ **Enhanced .env.example**: All environment variables documented

### v0.0093 - December 5, 2025
**Complete Authentication System - Remember Me & Forgot Password**

**Frontend Features:**
- ✅ **Remember Me**: Token-based persistent login with localStorage/sessionStorage
- ✅ **Forgot Password Flow**: Complete 3-step process (Request → Verify OTP → Reset)
- ✅ **OTP Verification Page**: 5-minute countdown timer with resend functionality
- ✅ **Password Reset Page**: New password entry with strength validation
- ✅ **Form Alignment Fixes**: Disabled floating labels for better UX
- ✅ **Auto-login**: Automatic authentication on app load with valid tokens

**Backend APIs:**
- ✅ **Enhanced Login**: Refresh token generation, account locking (5 attempts)
- ✅ **Refresh Token Endpoint**: Token rotation for security
- ✅ **Enhanced Logout**: Single device or all devices logout
- ✅ **Forgot Password**: OTP generation with email delivery
- ✅ **Verify OTP**: OTP validation with attempt limiting (5 max)
- ✅ **Reset Password**: Secure password update with token verification
- ✅ **Rate Limiting**: Protection against abuse (3 requests/hour for password reset)

**Services & Security:**
- ✅ **Token Service**: JWT access (15min), refresh (30d), reset (10min) tokens
- ✅ **OTP Service**: Generation, hashing, verification with bcrypt
- ✅ **Email Service**: Beautiful HTML emails via NodeMailer
- ✅ **Rate Limiters**: Login (10/15min), Register (5/hour), Password Reset (3/hour)
- ✅ **Account Security**: Failed login tracking, automatic locking, session management

### v0.0092 - December 5, 2025
**Advanced Form UX - Phase 2 & 3**

**Phase 2 - Visual Enhancements:**
- ✅ **Floating Labels**: Modern floating label animations on all forms
- ✅ **Enhanced Focus States**: Ripple effects and smooth transitions
- ✅ **OTP Timer**: 5-minute countdown with resend functionality (admin login)
- ✅ **Smooth Transitions**: Fade animations between form states
- ✅ **Improved Checkboxes**: Custom styled checkboxes with animations

**Phase 3 - Complaint Form Enhancements:**
- ✅ **Draft Auto-Save**: Auto-saves complaint drafts every 2 seconds
- ✅ **Enhanced Character Counter**: Color-coded feedback (red/orange/green)
- ✅ **Draft Recovery**: Auto-loads saved drafts on page refresh
- ✅ **Visual Save Indicator**: Animated feedback for draft saves

**Technical Improvements:**
- Added `initFloatingLabels()` and `initFocusAnimations()` utilities
- Enhanced CSS with advanced animations and transitions
- Improved form state management
- localStorage integration for draft persistence

### v0.0091 - December 5, 2025
**Form Improvements & UX Enhancements**

**New Features:**
- ✅ **Password Visibility Toggles**: All password fields now have show/hide buttons
- ✅ **Real-time Validation**: Instant feedback with success/error icons on all forms
- ✅ **Password Strength Indicators**: Visual strength meter for registration forms
- ✅ **Password Requirements**: Clear checklist showing password criteria
- ✅ **Loading States**: Professional loading animations on all submit buttons
- ✅ **Autocomplete Attributes**: Improved browser autofill support
- ✅ **Forgot Password Links**: Added to both user and admin login
- ✅ **Remember Me Checkboxes**: Session persistence options
- ✅ **Terms & Conditions**: Required checkboxes with links on registration forms
- ✅ **Form Utilities Library**: Reusable components for consistent UX

**Forms Enhanced:**
- User Login, Admin Login, User Register, Admin Register, Complaint Forms

### v0.0090 - December 5, 2025
**Vercel Deployment Configuration**

**New Features:**
- ✅ **Full Stack Deployment**: Configured project for seamless deployment on Vercel (Frontend + Backend)
- ✅ **Serverless Adaptation**: Optimized Express backend to run as Vercel Serverless Functions
- ✅ **Build Configuration**: Added root `package.json` and `vercel.json` for automated builds
- ✅ **Monorepo Support**: Structured project to handle both client and server dependencies in a single deployment

### v0.0089 - December 5, 2025
**Platform Pages UI & Routing Architecture**

**New Features:**
- ✅ **Vertical Routing Diagram**: Professional visual representation of complaint lifecycle with device icons (📱/💻) and status labels
- ✅ **Horizontal Process Flow**: Modernized "How It Works" steps with horizontal layout and staggered animations
- ✅ **Enhanced Animations**: Pulsing arrows, hover effects, and smooth transitions for a premium feel
- ✅ **Navigation Fixes**: Resolved "Back to Home" navigation issues on Platform and Feature pages
- ✅ **UI Polish**: Improved spacing and layout consistency across platform pages

### v0.0088 - December 4, 2025
**Platform Pages (How It Works & Features)**

**New Features:**
- ✅ **How It Works Page**: Animated process flow showing the 4-step complaint resolution journey
- ✅ **Features Page**: Modern bento-grid layout showcasing platform capabilities
- ✅ **Visual Animations**: Scroll-triggered fade-up and slide-in effects for premium feel
- ✅ **Interactive Elements**: Hover effects on cards and process steps
- ✅ **Routing Graph**: Visual architecture diagram of complaint routing

### v0.0087 - December 4, 2025
**Authentication UI Polish**

**Enhancements:**
- ✅ **Premium Styling**: Added `auth-page`, `auth-card`, and `auth-form` styles matching the dark/purple theme
- ✅ **Improved Navigation**: Added "← Back to Home" links to Login and Register pages
- ✅ **Visual Polish**: Centered cards, radial gradients, and better typography
- ✅ **Responsive Design**: Optimized authentication pages for mobile devices

### v0.0086 - December 4, 2025
**Support Pages & FAQ Grid Layout**

**New Features:**
- ✅ **Help Center**: Comprehensive guide on registration, complaint submission, and troubleshooting
- ✅ **FAQ Page**: Grid-based layout with 20+ Q&As organized by category
- ✅ **Contact Us Page**: Multi-channel support info including email, phone, and live chat details
- ✅ **Grid Layout for FAQ**: Modern 2-3 column grid design for better readability
- ✅ **Responsive Design**: All support pages fully optimized for mobile and desktop

**Technical:**
- Created `help.js`, `faq.js`, and `contact.js` components
- Implemented CSS Grid for FAQ cards with hover effects
- Integrated new routes in `app.js`
- Added comprehensive placeholder content for all support sections

### v0.0085 - December 4, 2025
**Functional Testing - Legal Pages Implementation**

**New Features:**
- ✅ **Privacy Policy Page**: Comprehensive privacy policy with 9 sections covering data collection, usage, security, and user rights
- ✅ **Terms of Service Page**: Detailed terms with 13 sections including user responsibilities, prohibited activities, and liability
- ✅ **Community Guidelines Page**: Clear community standards with 10 sections on respectful communication and platform usage
- ✅ **Professional Styling**: Dark header design with "Back to Home" navigation
- ✅ **Responsive Layout**: Mobile-friendly legal pages with proper formatting

**Technical:**
- Created three new page components (privacy.js, terms.js, guidelines.js)
- Added legal page CSS styles to main.css
- Integrated routes in app.js router
- Placeholder content ready for customization

### v0.0084 - December 4, 2025
**UI Refinements - Button Consistency & Social Media Integration**

**Enhancements:**
- ✅ **Button Consistency**: Made "How It Works" button match primary CTA styling for visual consistency
- ✅ **Social Media Icons**: Added professional SVG icons for Facebook, Instagram, YouTube, and LinkedIn
- ✅ **Follow Us Tagline**: Clear call-to-action above social media links
- ✅ **Icon Animations**: Smooth scale-up hover effect for better UX
- ✅ **Accessibility**: Proper aria-labels and external link handling

**Technical:**
- Replaced emoji placeholders with scalable SVG icons
- Added hover animations using CSS transforms
- Implemented proper link security (target="_blank", rel="noopener noreferrer")

### v0.0083 - December 4, 2025
**Homepage UI/UX Refinements - Dynamic Content & Dark Theme**

**Enhancements:**
- ✅ **Dark Header & Footer**: Premium dark theme (#1a1a2e) with white text for improved contrast
- ✅ **Language Toggle**: Restored "English | हिन्दी" toggle format with consistent styling
- ✅ **Parallel Footer Layout**: 4-column grid (Logo, Platform, Support, Legal) for better organization
- ✅ **Dynamic Impact Feed**: Auto-scrolling vertical ticker showing recent complaint resolutions
- ✅ **User Feedback Carousel**: Rotating testimonials section ("Citizen Voices")

**Technical:**
- Fixed CSS corruption issues
- Implemented smooth animations for dynamic sections
- Improved responsive design

### v0.0081 - December 3, 2025
**Homepage Refinement - Trust Building & Expectation Setting**

**New Sections:**
- ✅ **Working with Local Authorities**: Displays partner government entities with logos
- ✅ **Recent Community Impact**: Live feed showing resolved/in-progress complaints
- ✅ **Scope of Service**: Clear "What We Address" vs "What We Don't Address" with emergency numbers

**Design:**
- Clean, modern white/light gradient background
- Purple/lavender accent colors
- Fully responsive with hover effects
- Premium glassmorphic styling

### v0.007 - December 3, 2025
**Admin Complaint Detail View**
- Comprehensive complaint detail modal
- Media display (images, videos, audio)
- Status history timeline
- Internal notes system
- Responsive grid layout

### v0.006 - December 3, 2025
**Admin Dashboard & Notifications**
- Glassmorphism UI design
- Email/SMS notification system
- Permission request management
- Approval/rejection workflows

### v0.005 - December 2, 2025
**Video Camera Integration**
- Direct video recording via device camera
- Live preview during recording
- Critical frontend loading fixes

### v0.004 - December 2, 2025
**Admin System & OTP Authentication**
- Role-based access control (Super Admin, Manager, Moderator, Viewer)
- 2-Factor authentication with OTP
- Unified login UI
- Permission management system

### v0.003 - December 2, 2025
**Enhanced Registration & Location**
- Split name fields with age validation (13+)
- Flexible contact (email OR phone)
- Location selection (Pincode/GPS/Manual)
- India Post & OpenStreetMap integration

### v0.002 - December 2, 2025
**Complete Development Setup**
- Premium UI with glassmorphism
- JWT authentication
- Complaint CRUD operations
- Multi-channel media upload

### v0.001 - December 2, 2025
**Initial Project Structure**
- Basic folder structure
- Database models
- API route structure
- Documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

## 💬 Support

Open an issue in the GitHub repository for support.
