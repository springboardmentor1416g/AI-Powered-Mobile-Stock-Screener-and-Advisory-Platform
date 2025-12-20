## Authentication APIs

### POST /auth/signup
Request:
{
  "email": "test@mail.com",
  "password": "123456"
}

### POST /auth/login
Returns JWT token

### Protected Routes
Authorization: Bearer <token>
