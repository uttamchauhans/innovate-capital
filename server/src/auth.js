import express from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = express.Router();

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});
