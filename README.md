# Meri Shikayat

![Version](https://img.shields.io/badge/version-0.006-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Current Version**: v0.006  
**Last Updated**: December 3, 2025

A comprehensive complaint registration system that allows users to submit complaints through multiple channels including text, audio, video, and images.

## Features

- 📝 **Text Complaints** - Submit detailed written complaints
- 🎤 **Audio Complaints** - Record and submit voice complaints
- 📹 **Video Complaints** - Upload video evidence with complaints
- 📷 **Image Complaints** - Attach images to support complaints
- 👤 **User Management** - User registration and authentication
- 📊 **Dashboard** - Track and manage submitted complaints
- 🔔 **Notifications** - Real-time updates on complaint status

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **File Storage**: Cloud storage for media files
- **Authentication**: JWT-based authentication

## Project Structure

```
meri-shikayat/
├── client/              # Frontend application
├── server/              # Backend API
├── shared/              # Shared utilities and types
├── docs/                # Documentation
└── tests/               # Test suites
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies for client
cd client
npm install

# Install dependencies for server
cd ../server
npm install
```

### Running the Application

```bash
# Start the backend server
cd server
npm run dev

# Start the frontend (in a new terminal)
cd client
npm run dev
```

### Access the Application

Once both servers are running, you can access:

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Version History

### v0.006 (Current) - December 3, 2025
**Admin Dashboard Enhancement & Notification System**

**Admin Dashboard:**
- ✅ **Glassmorphism UI**: Premium glassmorphic design for all admin pages with animations and hover effects
- ✅ **Enhanced Dashboard**: Animated stat cards with real-time data (Total Complaints, Pending, Resolved, Active Users)
- ✅ **Pending Admins Management**: Card-based layout with detailed admin information and smooth animations
- ✅ **Permission Requests**: Dedicated page for Super Admin to manage permission requests
- ✅ **Responsive Design**: Mobile-first design with breakpoints for tablets and desktops

**Notification System:**
- ✅ **Email Notifications**: Professional email templates for admin approval/rejection
- ✅ **SMS Notifications**: Concise SMS messages for mobile alerts
- ✅ **Approval Workflow**: Modal dialog for role selection with email/SMS notification
- ✅ **Rejection Workflow**: Modal dialog with mandatory 20-character reason and validation
- ✅ **Console Logging**: Notifications logged for testing (ready for Nodemailer/Twilio integration)

**UI/UX Improvements:**
- ✅ **Modal Dialogs**: Glassmorphic modals for approval/rejection with smooth animations
- ✅ **Form Validation**: Real-time character counter and validation for rejection reasons
- ✅ **Success Messages**: Clear feedback confirming notification delivery
- ✅ **CSS Architecture**: Organized modal styles integrated into main.css

**Bug Fixes:**
- ✅ **CSS Loading Error**: Fixed null character corruption in main.css caused by PowerShell append
- ✅ **Dashboard Routing**: Added missing route for permission requests page

### v0.005 - December 2, 2025
**Video Camera Integration & Critical Fixes**

**New Features:**
- ✅ **Direct Video Recording**: Integrated `getUserMedia` and `MediaRecorder` to allow users to record video complaints directly using their device camera.
- ✅ **Live Preview**: Added live camera preview during recording and playback preview before submission.

**Bug Fixes:**
- ✅ **Frontend Loading Fix**: Resolved a critical issue where the application failed to load due to an incorrect named import in `complaint.service.js`.
- ✅ **Module Exports**: Fixed `client.js` export structure to ensure consistent module loading.

### v0.004 - December 2, 2025
**Admin System, OTP Authentication & Unified Login**

**Admin System:**
- ✅ **Role-Based Access Control (RBAC)**: Super Admin, Manager, Moderator, Viewer roles.
- ✅ **Approval Workflow**: New admin registrations require Super Admin approval.
- ✅ **Permission Management**: Granular permissions with request/approval system.
- ✅ **Admin Dashboard**: Dedicated dashboard with permission-aware navigation.

**Authentication & Security:**
- ✅ **2-Factor Authentication (OTP)**: Secure admin login with OTP verification.
- ✅ **Unified Login UI**: Seamless toggle between User and Admin login/registration.
- ✅ **Password Security**: "Show Password" toggle with auto-hide feature.
- ✅ **Mandatory Fields**: Enforced Email & Phone for admin registration.

**UI/UX Improvements:**
- ✅ **Premium Design**: Glassmorphic toggle buttons and refined aesthetics.
- ✅ **Fixed Navigation**: Corrected broken links on the Home page.

### v0.003 - December 2, 2025
**Enhanced Registration & Login with Location Selection**

**User Experience:**
- ✅ Split name fields (firstName, lastName)
- ✅ Date of birth with age validation (13+)
- ✅ Flexible contact (email OR phone required, not both mandatory)
- ✅ Case-insensitive email and phone inputs
- ✅ Improved form design (600px width)

**Location Selection:**
- ✅ Three methods: Pincode entry, GPS detection, Manual search
- ✅ India Post API integration for pincode lookup
- ✅ OpenStreetMap integration for GPS and search
- ✅ Auto-fill location details with editable preview
- ✅ Smart routing based on location setup status

**Backend:**
- ✅ Updated User model with new schema
- ✅ Location management system with 4 API endpoints
- ✅ Enhanced authentication (email OR phone login)
- ✅ Comprehensive validation for all inputs
- ✅ Axios integration for external APIs

**Frontend:**
- ✅ Enhanced registration form with DOB picker
- ✅ Updated login with flexible identifier
- ✅ Location setup page with 3 selection options
- ✅ Dashboard placeholder
- ✅ Premium UI styling with glassmorphism

### v0.002 - December 2, 2025
**Complete Development Setup**

**Frontend:**
- ✅ Premium UI design with gradients and glassmorphism
- ✅ Home page with hero section and feature cards
- ✅ Login and registration pages
- ✅ Client-side routing (SPA)
- ✅ API services (authentication, complaints)
- ✅ Smooth animations and responsive design

**Backend:**
- ✅ Complete authentication system (register, login, logout)
- ✅ JWT-based authentication with middleware
- ✅ Complaint CRUD operations
- ✅ Multi-channel media upload (text, audio, video, images)
- ✅ File upload middleware with Multer
- ✅ Input validation with express-validator
- ✅ MongoDB integration
- ✅ Comment system for complaints

**Infrastructure:**
- ✅ Environment configuration
- ✅ MongoDB Atlas ready
- ✅ Git repository with dev branch
- ✅ Comprehensive documentation

### v0.001 - December 2, 2025
**Initial Project Structure**

- ✅ Basic folder structure (client/server/shared/docs)
- ✅ MIT License
- ✅ Package.json for client and server
- ✅ Database models (User, Complaint)
- ✅ Middleware setup (auth, upload, validation)
- ✅ API route structure
- ✅ Documentation (API.md, ARCHITECTURE.md)
- ✅ Contributing guidelines

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## Support

For support, please open an issue in the GitHub repository.
