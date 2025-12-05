# Meri Shikayat

![Version](https://img.shields.io/badge/version-0.0092-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Current Version**: v0.0092  
**Last Updated**: December 5, 2025

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

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT + OTP (2FA)
- **File Storage**: Multer (Cloud-ready)

## 📁 Project Structure

```
meri-shikayat/
├── client/              # Frontend (Vite + Vanilla JS)
├── server/              # Backend API (Express)
├── shared/              # Shared utilities
└── docs/                # Documentation
```

## 📋 Recent Updates

### v0.0092 (Current) - December 5, 2025
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
