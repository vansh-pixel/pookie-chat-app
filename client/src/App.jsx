import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Chat from './pages/Chat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'kitty'); // 'kitty' or 'teddy'

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, [token, userId]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen font-cute text-gray-800">
        <Routes>
          <Route 
            path="/auth" 
            element={!token ? <Auth setToken={setToken} setUserId={setUserId} theme={theme} setTheme={setTheme} /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/chat" 
            element={token ? <Chat token={token} userId={userId} setToken={setToken} theme={theme} /> : <Navigate to="/auth" />} 
          />
          <Route path="*" element={<Navigate to={token ? "/chat" : "/auth"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
