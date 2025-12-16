# Meri Shikayat
![Version](https://img.shields.io/badge/version-1.0.4-blue.svg)

Meri Shikayat is a citizen grievance redressal platform designed to bridge the gap between citizens and municipal authorities. It allows users to report issues like potholes, garbage, and street light failures, track their status, and ensures accountability through a transparent process.

## Features

- **Citizen Reporting**: Submit complaints with text, images, audio, and video.
- **Location Tracking**: Auto-detect location for accurate issue reporting.
- **Real-time Status**: Track complaint progress from 'Pending' to 'Resolved'.
- **Admin Dashboard**: Manage, assign, and update complaints efficiently.
- **Department Integration**: Auto-routing of complaints to relevant departments (PWD, Water, Sanitation, etc.).
- **Connected Authorities**: Dynamic directory of 12 government departments with real-time statistics, offices, and personnel.
- **Private Contractors**: Management system for verified contractors with performance tracking and job assignments.
- **User Profile Management**: Comprehensive profile system with personal information, location tracking, and complaint history.
- **Gamification System**: Earn points, badges, and achievements for civic engagement and community participation.
- **Community Features**: Success stories, leaderboards, and social engagement to foster community involvement.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Modern, Responsive)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

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
