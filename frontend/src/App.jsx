import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Auth from './Auth.jsx';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import './App.css';

const BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('chat_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('chat_username') || '');
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [socket, setSocket] = useState(null);

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
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
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
  }, [token]);

  // Socket.io connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      if (err.message === 'Invalid token.') {
        handleLogout();
      }
    });

    newSocket.on('conversation_updated', (update) => {
      setConversations((prev) => {
        let found = false;
        const next = prev.map((c) => {
          if (c._id === update.conversationId) {
            found = true;
            return { ...c, lastMessage: update.lastMessage, updatedAt: update.updatedAt };
          }
          return c;
        });

        // If the conversation isn't in our list yet, fetch the whole list again to grab it
        // Or if it was found, sort them so the updated one is at the top
        if (!found) {
          fetchConversations();
          return prev;
        }

        return next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
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

      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conv._id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConv(conv);
    } catch (_) {}
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
        socket={socket}
        conversation={activeConv}
        username={username}
        token={token}
        onUnauthorized={handleLogout}
      />
    </div>
  );
}

export default App;
