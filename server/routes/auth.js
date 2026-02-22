const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'pookie_secret', { expiresIn: '1h' });
    res.json({ token, userId: user._id, username: user.username, partnerId: user.partnerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/set-partner', async (req, res) => {
  try {
    const { userId, partnerId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { partnerId }, { new: true });
    
    // Also try to find the partner's username to return it
    const partner = await User.findById(partnerId);
    
    res.json({ 
        success: true, 
        partnerId: user.partnerId, 
        partnerUsername: partner ? partner.username : 'Pookie' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.error(`Invalid User ID format: ${req.params.id}`);
            return res.status(400).json({ error: 'Invalid User ID format' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ username: user.username, partnerId: user.partnerId });
    } catch (err) {
        console.error("Error in GET /user/:id:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
