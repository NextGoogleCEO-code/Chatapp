import React, { useState, useEffect, useRef } from 'react';
import Auth from './Auth.jsx';
import './App.css';

const API_URL = 'http://localhost:5000/api/messages';

function App() {
  const [token, setToken] = useState(localStorage.getItem('chat_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('chat_username') || '');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_username');
    setToken('');
    setUsername('');
    setMessages([]);
  };

  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      // server might be down, do nothing
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setError('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: inputText.trim() })
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const saved = await res.json();
      if (!res.ok) {
        setError(saved.error || 'Failed to send.');
        return;
      }

      setMessages((prev) => [...prev, saved]);
      setInputText('');
    } catch (err) {
      setError('Server not reachable.');
    }
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  // Group messages by date
  const grouped = {};
  messages.forEach((msg) => {
    const dateKey = new Date(msg.timestamp).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(msg);
  });

  return (
    <div className="chat-app">
      <header className="chat-header">
        <span className="chat-title">ChatApp</span>
        <div className="header-right">
          <span className="logged-in-user">Logged in as <strong>{username}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="messages-area">
        {Object.keys(grouped).length === 0 ? (
          <p className="no-messages">No messages yet. Say something!</p>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {msgs.map((msg) => {
                const isOwn = msg.sender === username;
                const time = new Date(msg.timestamp).toLocaleTimeString(undefined, {
                  hour: '2-digit', minute: '2-digit'
                });
                return (
                  <div key={msg._id} className={`message-row ${isOwn ? 'own' : 'other'}`}>
                    <div className="bubble">
                      {!isOwn && <span className="bubble-sender">{msg.sender}</span>}
                      <p className="bubble-text">{msg.text}</p>
                      <span className="bubble-time">{time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form className="message-form" onSubmit={handleSend}>
        {error && <p className="send-error">{error}</p>}
        <div className="form-row">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={500}
          />
          <button type="submit" disabled={!inputText.trim()}>Send</button>
        </div>
      </form>
    </div>
  );
}

export default App;
