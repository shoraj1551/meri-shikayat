# Meri Shikayat

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## Support

For support, please open an issue in the GitHub repository.
