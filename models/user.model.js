const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: { type: Number, enum: [1, 2], default: 2 }, // 1 = admin, 2 = guest

  is_active: { type: Number, enum: [0, 1], default: 0 },

  email_verified: {
    type: Boolean,
    default: false
  },

  verification_code: String,
  verification_expires: Date,

  guest_expiry: Date,

  total_budget: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);