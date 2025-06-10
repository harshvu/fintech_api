const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Token = require('../models/token.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ error: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });

  res.json({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Token.create({ userId: user._id, token: refreshToken });

  res.json({ accessToken, refreshToken });
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
