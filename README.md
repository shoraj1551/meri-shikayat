# Meri Shikayat

![Version](https://img.shields.io/badge/version-0.002-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Current Version**: v0.002  
**Last Updated**: December 2, 2025

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

### v0.002 (Current) - December 2, 2025
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
