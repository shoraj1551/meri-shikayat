# Meri Shikayat

![Version](https://img.shields.io/badge/version-0.0097-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Current Version**: v0.0097
**Last Updated**: December 7, 2025

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

- 📝 **Multi-channel Complaints**: Text, Audio, Video, Image support
- 👤 **User Management**: Registration, Profiles, Authentication
- 👨‍💼 **Admin System**: RBAC, Dashboard, Status Management
- 🗺️ **Location Services**: GPS & Manual selection
- 🔔 **Notifications**: Email/SMS alerts
- 🌍 **Multi-Environment**: Dev, UAT, Production support

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT + Refresh Tokens + OTP
- **Deployment**: Vercel

## 📁 Project Structure

```
meri-shikayat/
├── client/              # Frontend (Vite + Vanilla JS)
├── server/              # Backend API (Express)
├── vercel.json          # Production config
└── docs/                # Documentation
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.
