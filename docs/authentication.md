# Authentication & Authorization – API Gateway

## Overview
This module implements **JWT-based authentication** for the AI-Powered Mobile Stock Screener & Advisory Platform.  
It provides secure user registration, login, and protected API access.

---

## Tech Stack
- Backend: Node.js (Express)
- Database: PostgreSQL
- Authentication: JWT (JSON Web Tokens)
- Password Hashing: bcrypt

---

## Environment Variables
Configure the following in `.env`:

env
JWT_SECRET_KEY=supersecretkey
TOKEN_EXPIRY=7d

## Database Schema
users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP
);

## API Endpoints
1. Signup

POST /api/v1/auth/signup

Request Body

{
  "email": "user@example.com",
  "password": "StrongPassword123"
}


Response

{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com"
  }
}

2. Login

POST /api/v1/auth/login

Request Body

{
  "email": "user@example.com",
  "password": "StrongPassword123"
}


Response

{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}

JWT Token Payload
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1690000000,
  "exp": 1690600000
}

## Protected Routes
### Authorization Header

All protected routes require:

Authorization: Bearer <JWT_TOKEN>

### Example Protected Endpoint

GET /api/v1/secure-test

Response

{
  "success": true,
  "message": "You accessed a protected route",
  "user": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}

## Authentication Middleware

- Extracts token from Authorization header

- Verifies JWT signature

- Attaches decoded user info to req.user

- Blocks unauthorized requests

## Security Notes

- Passwords are never stored in plain text

- bcrypt hashing with salt is used

- JWT is stateless (logout handled client-side)

- HTTPS required in production