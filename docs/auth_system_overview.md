# Authentication Module – Dec 12

## Login / Signup
Endpoints:
POST /api/v1/auth/signup  
POST /api/v1/auth/login  

## JWT Token
Payload:
{
  "userId": "",
  "email": "",
  "iat": "",
  "exp": ""
}

## Protected Routes
Example:
GET /api/v1/watchlist

Requires:
Authorization: Bearer <token>
