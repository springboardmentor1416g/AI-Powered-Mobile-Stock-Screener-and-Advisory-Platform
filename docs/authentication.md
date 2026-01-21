# Authentication System

## Flow
Signup → Login → JWT issued → Protected APIs

## Security
- Passwords hashed with bcrypt
- JWT used for stateless auth

## Token Payload
userId, email

## Protected Routes
Require Authorization: Bearer <token>
