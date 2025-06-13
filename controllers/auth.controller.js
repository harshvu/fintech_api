const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Token = require('../models/token.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

exports.signup = async (req, res) => {
  const { name, phone, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ error: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    email,
    password: hashed,
  });

  res.json({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token
  await Token.create({ userId: user._id, token: refreshToken });

  // Return tokens and user info
  res.json({
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    },
  });
};

exports.refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  const existingToken = await Token.findOne({ token });
  if (!existingToken) return res.sendStatus(403);

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken({ _id: payload.id });
    res.json({ accessToken });
  } catch {
    res.sendStatus(403);
  }
};
