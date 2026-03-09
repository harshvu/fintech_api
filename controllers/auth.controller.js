const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Token = require('../models/token.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail } = require('../utils/sendEmail');

exports.signup = async (req, res) => {

  try {

    const { name, phone, email, password } = req.body;

    // Gmail validation
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({
        error: "Only Gmail accounts allowed"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const user = await User.create({
      name,
      phone,
      email,
      password: hashed,
      verification_code: verificationCode,
      verification_expires: Date.now() + 10 * 60 * 1000,
      guest_expiry: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    await sendVerificationEmail(email, verificationCode);

    res.json({
      message: "Signup successful. Please verify your email."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

};
exports.verifyEmail = async (req, res) => {

  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.verification_code != code) {
    return res.status(400).json({ error: "Invalid code" });
  }

  if (user.verification_expires < Date.now()) {
    return res.status(400).json({ error: "Code expired" });
  }

  user.email_verified = true;
  user.is_active = 1;
  user.verification_code = null;

  await user.save();

  res.json({
    message: "Email verified successfully"
  });

};
exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.email_verified) {
    return res.status(403).json({
      error: "Please verify your email first"
    });
  }

  if (user.is_active === 0) {
    return res.status(403).json({
      error: "Account inactive"
    });
  }

  // Guest expiry check
  if (user.role === 2 && user.guest_expiry < Date.now()) {
    return res.status(403).json({
      error: "Guest access expired after 7 days"
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Token.create({ userId: user._id, token: refreshToken });

  res.json({
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email
    }
  });

};
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt with:", email, password);

    const admin = await User.findOne({ email });
    if (!admin) {
      console.log("Admin not found for email:", email);
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    if (admin.role !== 1) {
      console.log("User role is not admin:", admin.role);
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    await Token.create({ userId: admin._id, token: refreshToken });

    res.json({
      message: "Admin login successful",
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
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
