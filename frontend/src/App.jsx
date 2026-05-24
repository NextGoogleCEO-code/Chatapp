import React, { useState, useEffect } from 'react';
import Auth from './Auth.jsx';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import './App.css';

const BASE = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('chat_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('chat_username') || '');
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_username');
    setToken('');
    setUsername('');
    setConversations([]);
    setActiveConv(null);
  };

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/conversations`, { headers: authHeaders });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setConversations(data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Start or open a conversation with a user from search results
  const openConversation = async (userId) => {
    try {
      const res = await fetch(`${BASE}/conversations`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const conv = await res.json();
      if (!res.ok) return;

      // Add to list if not already present
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conv._id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConv(conv);
    } catch (_) {}
  };

  const onMessageSent = (convId, text) => {
    // Update lastMessage preview in the sidebar without waiting for a poll
    setConversations((prev) =>
      prev.map((c) =>
        c._id === convId
          ? { ...c, lastMessage: { text, sender: username, timestamp: new Date() } }
          : c
      )
    );
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="chat-app">
      <Sidebar
        conversations={conversations}
        activeConvId={activeConv?._id}
        username={username}
        token={token}
        onSelectConv={setActiveConv}
        onOpenConv={openConversation}
        onLogout={handleLogout}
      />
      <ChatWindow
        conversation={activeConv}
        username={username}
        token={token}
        onMessageSent={onMessageSent}
        onUnauthorized={handleLogout}
      />
    </div>
  );
}

export default App;
