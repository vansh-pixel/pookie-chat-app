const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const Message = require('./models/Message');
const User = require('./models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for dev, restrict in prod
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pookie-chat-v2')
  .then(() => console.log('MongoDB connected (pookie-chat-v2)'))
  .catch(err => console.error(err));

const messageRoutes = require('./routes/messages');
const storyRoutes = require('./routes/stories');

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stories', storyRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { sender, receiver, content, type } = data;
      const message = new Message({ sender, receiver, content, type, read: false });
      await message.save();

      // Get sender details for notification
      const senderUser = await User.findById(sender);
      const messageWithUser = { ...message.toObject(), senderUsername: senderUser ? senderUser.username : 'Your Pookie' };

      // Emit to receiver and sender (for real-time update)
      io.to(receiver).emit('receive_message', messageWithUser);
      io.to(sender).emit('message_sent', messageWithUser); 
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('mark_read', async (data) => {
      try {
          const { sender, receiver } = data; // sender is the one who SENT the message (Partner), receiver is ME reading it
          // Update in DB
          await Message.updateMany(
              { sender: sender, receiver: receiver, read: false },
              { $set: { read: true } }
          );
          // Notify the sender that I (receiver) read their messages
          io.to(sender).emit('messages_read', { reader: receiver });
      } catch (err) {
          console.error(err);
      }
  });
  
  socket.on('send_miss_you', async (data) => {
       try {
        const { sender, receiver } = data;
        const message = new Message({ sender, receiver, content: "I miss you! ❤️", type: 'missYou', read: false });
        await message.save();

        const senderUser = await User.findById(sender);
        const messageWithUser = { ...message.toObject(), senderUsername: senderUser ? senderUser.username : 'Your Pookie' };
        
        io.to(receiver).emit('receive_message', messageWithUser);
        io.to(sender).emit('message_sent', messageWithUser);
       } catch (err) {
           console.error(err);
       }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 Catch-All Logger
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
