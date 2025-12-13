# Meri Shikayat
![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)

Meri Shikayat is a citizen grievance redressal platform designed to bridge the gap between citizens and municipal authorities. It allows users to report issues like potholes, garbage, and street light failures, track their status, and ensures accountability through a transparent process.

## Features

- **Citizen Reporting**: Submit complaints with text, images, audio, and video.
- **Location Tracking**: Auto-detect location for accurate issue reporting.
- **Real-time Status**: Track complaint progress from 'Pending' to 'Resolved'.
- **Admin Dashboard**: Manage, assign, and update complaints efficiently.
- **Department Integration**: Auto-routing of complaints to relevant departments (PWD, Water, Sanitation, etc.).

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
