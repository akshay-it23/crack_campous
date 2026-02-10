# Smart Placement Prep Platform - Backend

Production-ready authentication system built with MERN stack + TypeScript.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Password Hashing**: bcrypt

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── types/           # TypeScript interfaces
│   ├── validators/      # Zod schemas
│   ├── services/        # Business logic
│   ├── utils/           # JWT utilities
│   ├── routes/          # API endpoints
│   ├── middleware/      # Express middleware
│   └── server.ts        # Entry point
├── package.json
├── tsconfig.json
└── .env
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string (min 32 characters)

3. **Start development server**:
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- **POST /api/auth/register** - Register new user
- **POST /api/auth/login** - Login with email/password
- **POST /api/auth/refresh** - Refresh access token
- **POST /api/auth/logout** - Logout (invalidate refresh token)

### User Profile (Protected)

- **GET /api/users/me** - Get current user profile
- **PUT /api/users/me** - Update current user profile

## 🧪 Testing

### Manual Testing with cURL

1. **Register**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPass123",
       "fullName": "Test User",
       "college": "MIT",
       "graduationYear": 2026
     }'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPass123"
     }'
   ```

3. **Get Profile** (use access token from login):
   ```bash
   curl -X GET http://localhost:5000/api/users/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## 🔐 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry)
- Refresh token storage in database (enables logout)
- Token hash storage (defense in depth)
- Input validation with Zod
- MongoDB injection prevention (Mongoose)
- CORS configuration

## 📝 Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)
- `npm run type-check` - Check TypeScript types without compiling

## 🎓 Learning Resources

### Key Concepts Covered

1. **TypeScript**: Interfaces, types, generics
2. **Express.js**: Routing, middleware, error handling
3. **MongoDB + Mongoose**: Schemas, models, queries
4. **JWT Authentication**: Token generation, verification, refresh flow
5. **Zod Validation**: Runtime type checking
6. **Async/Await**: Promise handling
7. **Security**: Password hashing, token storage, CORS
8. **Project Structure**: Clean architecture, separation of concerns

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running locally, or
- Use MongoDB Atlas and update `MONGODB_URI` in `.env`

### Port Already in Use

- Change `PORT` in `.env` to a different port (e.g., 5001)

### JWT Secret Error

- Ensure `JWT_SECRET` in `.env` is at least 32 characters long

## 📚 Next Steps

Phase 2 will add:
- Topic & Practice Tracking
- Progress Calculation Engine
- Recommendation System
- Daily Task Planning

---

Built with ❤️ for placement preparation
