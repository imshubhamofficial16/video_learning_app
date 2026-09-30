# Video Learning Platform

Interactive video learning platform with timestamp-based quizzes.

## Features

- JWT authentication with role-based access (Admin/Learner)
- Video management with CRUD operations
- Interactive questions (single/multiple choice, short answer)
- Auto-pause video at question timestamps
- Progress tracking with auto-save
- Assignment system
- Admin reporting dashboard

## Tech Stack

**Frontend:** React 18, Vite, React Router, React Player, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT

## Quick Start

### 1. Start MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Create Accounts
Register at http://localhost:5173/register

**Admin account:**
- Email: admin@test.com
- Password: admin123
- Role: Admin

**Learner account:**
- Email: learner@test.com
- Password: learner123
- Role: Learner

## Environment Variables

**server/.env**
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/video-learning-platform
JWT_SECRET=dev-secret-key-12345-change-in-prod
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:5001/api
```

## Project Structure

```
├── client/          # React frontend
│   └── src/
│       ├── api/     # API clients
│       ├── components/
│       ├── pages/
│       └── context/
└── server/          # Express backend
    └── src/
        ├── models/
        ├── controllers/
        ├── routes/
        └── middleware/
```

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/videos` - List videos
- `POST /api/videos` - Create video (admin)
- `POST /api/responses` - Submit answer
- `GET /api/progress/my-progress` - Get progress
- `POST /api/assignments` - Assign video (admin)
- `GET /api/reports/learners` - Learner stats (admin)
# video_learning_app
# video_learning_app
