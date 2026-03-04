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

// API endpoint to send a message (useful for sharing content outside the main chat socket loop)
router.post('/send', async (req, res) => {
  try {
    const { sender, receiver, content, type } = req.body;
    
    // Save message to DB
    const message = new Message({ sender, receiver, content, type, read: false });
    await message.save();

    const User = require('../models/User'); // Required locally to avoid circular dependency
    const senderUser = await User.findById(sender);
    const messageWithUser = { ...message.toObject(), senderUsername: senderUser ? senderUser.username : 'Your Pookie' };

    // Emit via the io instance we attached to app
    const io = req.app.get('io');
    if (io) {
        io.to(receiver).emit('receive_message', messageWithUser);
        io.to(sender).emit('message_sent', messageWithUser);
    }
    
    res.json({ success: true, message: messageWithUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
