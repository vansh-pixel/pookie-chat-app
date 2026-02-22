const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get chat history between two users
router.get('/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
router.post('/mark-read', async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    // Mark messages sent by 'sender' to 'receiver' as read
    // Wait, if I am the receiver reading messages, I mark messages where sender=Partner and receiver=Me as read.
    await Message.updateMany(
      { sender: sender, receiver: receiver, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
