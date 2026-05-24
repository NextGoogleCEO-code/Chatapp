import React, { useState, useEffect, useCallback } from 'react';

const BASE = 'http://localhost:5000/api';

export default function Sidebar({
  conversations,
  activeConvId,
  username,
  token,
  onSelectConv,
  onOpenConv,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${BASE}/users?search=${encodeURIComponent(searchQuery.trim())}`,
          { headers: authHeaders }
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (_) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  const handleSelectUser = (user) => {
    onOpenConv(user._id);
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">ChatApp</div>
        <div className="sidebar-user">
          <span>{username}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="search-area">
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery.trim() && (
          <div className="search-results">
            {searching && <p className="search-hint">Searching...</p>}
            {!searching && searchResults.length === 0 && (
              <p className="search-hint">No users found.</p>
            )}
            {searchResults.map((user) => (
              <button
                key={user._id}
                className="search-result-item"
                onClick={() => handleSelectUser(user)}
              >
                <div className="user-avatar">{user.username[0].toUpperCase()}</div>
                <span>{user.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="conversations-label">Messages</div>

      <div className="conversations-list">
        {conversations.length === 0 && (
          <p className="no-convs">Search for a user above to start chatting.</p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv._id}
            className={`conv-item ${activeConvId === conv._id ? 'active' : ''}`}
            onClick={() => onSelectConv(conv)}
          >
            <div className="conv-avatar">
              {conv.otherUser?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="conv-info">
              <div className="conv-name">{conv.otherUser?.username || 'Unknown'}</div>
              <div className="conv-preview">
                {conv.lastMessage?.text
                  ? (conv.lastMessage.sender === username ? 'You: ' : '') +
                    conv.lastMessage.text.slice(0, 32) +
                    (conv.lastMessage.text.length > 32 ? '...' : '')
                  : 'No messages yet'}
              </div>
            </div>
            <div className="conv-time">{formatTime(conv.lastMessage?.timestamp)}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}
