# Architecture Documentation

## System Overview

Meri Shikayat is a full-stack web application built with a modern architecture separating frontend and backend concerns.

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript (ES6+)**: Core web technologies
- **Vite**: Build tool and development server
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Multer**: File upload handling

## Architecture Layers

### 1. Presentation Layer (Client)
```
client/
├── src/
│   ├── js/          # JavaScript modules
│   ├── styles/      # CSS stylesheets
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page-level components
│   └── utils/       # Utility functions
```

**Responsibilities:**
- User interface rendering
- User interaction handling
- API communication
- Client-side validation
- State management

### 2. Application Layer (Server)
```
server/
├── src/
│   ├── routes/      # API route definitions
│   ├── controllers/ # Request handlers
│   ├── middleware/  # Custom middleware
│   ├── models/      # Database models
│   ├── utils/       # Utility functions
│   └── config/      # Configuration files
```

**Responsibilities:**
- API endpoint handling
- Business logic execution
- Authentication & authorization
- File upload processing
- Data validation

### 3. Data Layer (Database)
```
MongoDB Collections:
├── users         # User accounts
├── complaints    # Complaint records
└── sessions      # User sessions (optional)
```

**Responsibilities:**
- Data persistence
- Data retrieval
- Data relationships
- Indexing for performance

## Data Flow

### Complaint Submission Flow
```
User Interface
    ↓
Form Validation (Client)
    ↓
API Request (POST /api/complaints)
    ↓
Authentication Middleware
    ↓
File Upload Middleware (Multer)
    ↓
Validation Middleware
    ↓
Complaint Controller
    ↓
Database (MongoDB)
    ↓
Response to Client
    ↓
UI Update
```

## Security Measures

1. **Authentication**: JWT-based token authentication
2. **Authorization**: Role-based access control
3. **Input Validation**: Server-side validation using express-validator
4. **File Upload Security**: File type and size restrictions
5. **Password Security**: Bcrypt hashing
6. **CORS**: Configured for specific origins
7. **Environment Variables**: Sensitive data in .env files

## Media Handling

### Upload Process
1. Client selects media files (image/video/audio)
2. Files sent via multipart/form-data
3. Multer middleware processes uploads
4. Files stored in categorized directories
5. File metadata saved in database
6. URLs returned to client

### Storage Structure
```
uploads/
├── images/    # Image files
├── videos/    # Video files
├── audio/     # Audio files
└── others/    # Other file types
```

## Scalability Considerations

1. **Database Indexing**: Optimized queries with indexes
2. **File Storage**: Ready for cloud storage integration (S3, etc.)
3. **API Pagination**: Limit data transfer per request
4. **Modular Architecture**: Easy to extend and maintain
5. **Microservices Ready**: Can be split into separate services

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live notifications
2. **Cloud Storage**: Migration to AWS S3 or similar
3. **Caching**: Redis for improved performance
4. **Message Queue**: For async processing of media files
5. **Analytics**: Dashboard for complaint statistics
6. **Mobile App**: React Native or Flutter application
7. **Multi-language Support**: i18n implementation
