const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  partnerId: { type: String }, // Store the partner's user ID
  profilePic: { type: String },
  chatBgUrl: { type: String },
  chatBgSize: { type: String, default: 'cover' },
  chatBgPosition: { type: String, default: '50% 50%' },
  lastSeen: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
