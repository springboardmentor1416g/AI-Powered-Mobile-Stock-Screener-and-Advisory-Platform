import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  createUser,
  findUserByEmail,
  updateLastLogin
} from '../services/user.service.js';

/**
 * POST /auth/signup
 */
export async function signup(req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await createUser(email, password);

    return res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Signup failed' });
  }
}

/**
 * POST /auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    await updateLastLogin(user.id);

    return res.json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
}
