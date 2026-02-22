const io = require('socket.io-client');
const axios = require('axios');

async function test() {
  const API_URL = 'http://localhost:8000/api/auth';
  const SOCKET_URL = 'http://localhost:8000';
  
  const uniqueUser = 'testuser_' + Date.now();
  const password = 'password123';

  console.log('1. Registering user:', uniqueUser);
  try {
    await axios.post(`${API_URL}/register`, { username: uniqueUser, password });
    console.log('   - Registration success');
  } catch (e) {
    console.error('   - Registration failed:', e.response?.data || e.message);
    process.exit(1);
  }

  console.log('2. Logging in...');
  let userId, token;
  try {
    const res = await axios.post(`${API_URL}/login`, { username: uniqueUser, password });
    userId = res.data.userId;
    token = res.data.token;
    console.log('   - Login success, userId:', userId);
  } catch (e) {
    console.error('   - Login failed:', e.response?.data || e.message);
    process.exit(1);
  }

  console.log('3. Connecting to Socket.io...');
  const socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('   - Socket connected, id:', socket.id);
    console.log('4. Joining room:', userId);
    socket.emit('join_room', userId);
    
    console.log('5. Sending self-message...');
    socket.emit('send_message', {
      sender: userId,
      receiver: userId,
      content: 'Hello World from Test Script',
      type: 'text'
    });
  });

  socket.on('receive_message', (msg) => {
    console.log('   - Message received:', msg.content);
    if (msg.content === 'Hello World from Test Script') {
        console.log('SUCCESS: Full flow test passed!');
        socket.disconnect();
        process.exit(0);
    }
  });

  setTimeout(() => {
    console.error('TIMEOUT: Message not received within 5s');
    process.exit(1);
  }, 5000);
}

test();
