const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, enum: [1, 2], default: 2 },
  is_active: { type: Number, enum: [0, 1], default: 1 },

  // 👇 New field
  total_budget: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema);
