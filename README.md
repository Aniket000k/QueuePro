# Queue Management System

A full-stack queue management system for hospitals and banks, featuring real-time updates, token generation, and admin controls. Built with Node.js, Express, MongoDB, React, Vite, Tailwind CSS, and Socket.IO.

## 🚀 Live Demo

👉 [Click here to view the project](https://queuepro.onrender.com)


## Features
- User registration and login (JWT-based authentication)
- Token generation for different services (resets daily per service)
- Real-time queue updates via Socket.IO
- Email notifications for token confirmation and serving
- Admin dashboard for managing queues
- Responsive, modern UI (React + Tailwind CSS)

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Axios, Socket.IO Client
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, Nodemailer, JWT
- **Deployment:** Render (serves frontend build from backend)

## Folder Structure
```
backend/           # Express API, MongoDB models, routes
  public/dist/     # Frontend build output (served in production)
frontend/          # React app source code
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud, e.g. MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Aniket000k/QueuePro.git
cd <project-root>
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/queue-management
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password-or-app-password
```
- For Gmail, you may need an App Password if 2FA is enabled.

### 4. Run in Development
**Backend:**
```bash
cd backend
npm run dev
```
**Frontend:**
```bash
cd frontend
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 5. Build Frontend for Production
```bash
cd frontend
npm run build
```
This outputs the build to `frontend/dist`. Copy or move the contents to `backend/public/dist`:
```bash
cp -r dist ../backend/public/
```

### 6. Deploy to Render
- Connect your repo to [Render](https://render.com/)
- Set up a **Web Service** for the backend (`backend/` as root)
- Set environment variables in Render dashboard (see above)
- Render will run `npm install` and `npm start` by default
- The backend will serve the frontend from `public/dist`

## API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/token` — Generate a new token (authenticated)
- `GET /api/token/:tokenNumber` — Get token details (authenticated)
- `GET /api/user/tokens` — Get all tokens for the logged-in user
- `GET /api/admin/queue` — Admin: Get queue for a branch/service
- `POST /api/admin/serve-next` — Admin: Serve next token

## Customization
- **Services:** Edit `backend/routes/token.js` in the `SERVICES` object to add/remove services.
- **Email:** Uses Nodemailer with Gmail by default. Update config as needed.

