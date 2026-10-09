# Mini Social Media Platform (MERN)
Features: register/login (JWT), profiles with photo, private accounts + follow requests, photo/video posts, comments, likes, follow, user search.

## Run
1. Install MongoDB locally (or use a MongoDB Atlas URI).
2. Backend:
   cd server && cp .env.example .env && npm install && npm run dev   (http://localhost:5000)
3. Frontend (new terminal):
   cd client && npm install && npm run dev   (http://localhost:5173)

## API
POST /api/auth/register | POST /api/auth/login | GET /api/auth/me
GET /api/users/:username | PUT /api/users/me/bio | POST /api/users/:id/follow
GET /api/posts (feed) | GET /api/posts/user/:id | POST /api/posts | DELETE /api/posts/:id
POST /api/posts/:id/like | POST /api/posts/:id/comments
