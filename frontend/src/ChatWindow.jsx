import React, { useState, useEffect, useRef } from 'react';

const BASE = 'http://localhost:5000/api';

export default function ChatWindow({ socket, conversation, username, token, onUnauthorized }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchMessages = async () => {
    if (!conversation) return;
    try {
      const res = await fetch(`${BASE}/messages/${conversation._id}`, {
        headers: authHeaders
      });
      if (res.status === 401) { onUnauthorized(); return; }
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (_) {}
  };

  useEffect(() => {
    setMessages([]);
    setInputText('');
    setError('');
    if (conversation) {
      fetchMessages();
    }
  }, [conversation?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket.io room management and message listening
  useEffect(() => {
    if (!socket || !conversation) return;

    socket.emit('join_conversation', conversation._id);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_conversation', conversation._id);
    };
  }, [socket, conversation?._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation) return;
    setError('');

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await fetch(`${BASE}/messages/${conversation._id}`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.status === 401) { onUnauthorized(); return; }
      const saved = await res.json();
      if (!res.ok) { setError(saved.error || 'Failed to send.'); return; }
      // We don't manually append the message here because the socket will broadcast it back to us
    } catch (_) {
      setError('Server not reachable.');
    }
  };

  // Group messages by date
  const grouped = {};
  messages.forEach((msg) => {
    const key = new Date(msg.timestamp).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(msg);
  });

  if (!conversation) {
    return (
      <div className="chat-window empty-state">
        <p>Select a conversation or search for a user to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="conv-avatar sm">{conversation.otherUser?.username?.[0]?.toUpperCase() || '?'}</div>
        <span className="conv-header-name">{conversation.otherUser?.username || 'Chat'}</span>
      </div>

      <div className="messages-area">
        {Object.keys(grouped).length === 0 ? (
          <p className="no-messages">No messages yet. Say hi!</p>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider"><span>{date}</span></div>
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
            placeholder={`Message ${conversation.otherUser?.username || ''}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={500}
            autoFocus
          />
          <button type="submit" disabled={!inputText.trim()}>Send</button>
        </div>
      </form>
    </div>
  );
}
