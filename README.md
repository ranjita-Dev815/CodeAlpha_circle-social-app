# Circle - Mini Social Media App

> Share photos, videos and short posts with people you follow.

A full-stack social media web application built with the **MERN stack** (MongoDB, Express, React, Node.js) as part of my **CodeAlpha Internship** (Task 2: Social Media Platform).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://code-alpha-circle-social-app.vercel.app)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://codealpha-circle-social-app.onrender.com)

---

## Live Demo

- **Frontend:** https://code-alpha-circle-social-app.vercel.app
- **Backend API:** https://codealpha-circle-social-app.onrender.com

> **Note:** The backend is hosted on Render's free plan, so the first request after a period of inactivity can take 30-50 seconds while the server wakes up.

---

## Screenshots

<!-- Add your screenshots to a /screenshots folder and update the paths below -->

| Login / Register | Home Feed | Profile |
|---|---|---|
| ![Login](screenshots/login.png) | ![Feed](screenshots/feed.png) | ![Profile](screenshots/profile.png) |

---

## Features

- **User Authentication:** secure registration and login using JWT and password hashing
- **Create Posts:** share photos, videos and short text posts
- **Media Uploads:** file upload support for images and videos
- **Social Interactions:** like and comment on posts
- **Follow System:** follow other users and see their posts
- **Responsive UI:** mobile-first design with a bottom navigation bar
- **Protected Routes:** API endpoints secured with JWT middleware

---

## Tech Stack

**Frontend**
- React 18
- Vite
- React Router DOM
- React Icons
- CSS (custom theme)

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- Multer for file uploads

**Deployment**
- Frontend on **Vercel**
- Backend on **Render**
- Database on **MongoDB Atlas**

---

## Project Structure

```
social-app/
├── client/                  # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/      # BottomNav, PostActions, etc.
│   │   ├── api.js           # Fetch wrapper with JWT support
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
│
└── server/                  # Express backend
    ├── middleware/          # Auth middleware (JWT)
    ├── models/              # Mongoose schemas
    ├── routes/              # API routes
    ├── uploads/             # Uploaded media
    ├── index.js             # Server entry point
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ranjita-Dev815/CodeAlpha_circle-social-app.git
cd CodeAlpha_circle-social-app
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder (see `.env.example`):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Start the server:

```bash
node index.js
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

> For local development, make sure your Vite config proxies `/api` requests to the backend, or set `VITE_API_URL=http://localhost:5000` in a `client/.env` file.

---

## Environment Variables

**Backend (`server/.env`)**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `PORT` | Server port (default 5000) |

**Frontend (Vercel / `client/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the deployed backend |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new account | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |

> Additional endpoints for posts, likes, comments and follows are available under `/api/posts` and `/api/users`.

---

## Deployment

1. **Database:** created a free cluster on MongoDB Atlas and allowed network access.
2. **Backend:** deployed `server/` on Render as a Web Service (Root Directory: `server`, Start Command: `node index.js`) with environment variables configured.
3. **Frontend:** deployed `client/` on Vercel with `VITE_API_URL` pointing to the Render backend.
4. **CORS:** enabled on the backend for the Vercel domain.

---

## What I Learned

- Building a REST API with Express and MongoDB
- JWT-based authentication and protected routes
- Handling file uploads with Multer
- Connecting a React frontend to a separately deployed backend
- Debugging real deployment issues (404 errors, CORS, environment variables)
- Deploying a full-stack app across Vercel, Render and MongoDB Atlas

---

## Known Limitations

- Render's free plan does not keep uploaded files permanently. For production use, media storage should be moved to a service like Cloudinary or AWS S3.
- The backend may take a few seconds to wake up after inactivity.

## Future Improvements

- Cloud-based media storage (Cloudinary / S3)
- Real-time notifications and chat with Socket.io
- Search and explore page
- Stories and saved posts
- Dark mode

---

## About the Internship

This project was developed as **Task 2** during my **Full Stack Development Internship at [CodeAlpha](https://www.codealpha.tech/)**.

---

## Author

**Ranjita Kumari Prusty**

- GitHub: [@ranjita-Dev815](https://github.com/ranjita-Dev815)
- LinkedIn: [Add your LinkedIn profile link here]

---

If you found this project useful, consider giving it a star.
