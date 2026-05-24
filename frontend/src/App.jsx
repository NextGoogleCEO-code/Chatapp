import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/messages';

// Standard bot avatars or initials generator
const getAvatar = (name) => {
  if (name.toLowerCase() === 'alex') return '🚀';
  if (name.toLowerCase() === 'aneekesh') return '👨‍💻';
  return '👤';
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState('Aneekesh');
  const [customUser, setCustomUser] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const messagesEndRef = useRef(null);

  // Fetch messages from backend on mount and periodically
  const fetchMessages = async (showStatus = false) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Server returned error status');
      const data = await response.json();
      setMessages(data);
      setConnectionStatus('online');
    } catch (error) {
      console.warn('Backend server connection failed, using localStorage fallback. Error:', error.message);
      setConnectionStatus('offline');
      // Load fallback from localStorage if backend is down
      const saved = localStorage.getItem('chatapp_messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Pre-populate with initial seed timeline
        const initialTimeline = [
          {
            _id: "seed-1",
            sender: "Aneekesh",
            text: "Hey, did we get the empty GitHub repository cloned?",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "seed-2",
            sender: "Alex",
            text: "Yes, I successfully cloned it locally! It's completely empty.",
            timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "seed-3",
            sender: "Aneekesh",
            text: "Awesome. Let's make it a MERN stack app today.",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "seed-4",
            sender: "Alex",
            text: "Perfect, starting by building the Node.js + Express backend first.",
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "seed-5",
            sender: "Aneekesh",
            text: "Great, let's make sure the chat history renders as a timeline in the UI, and keep git commits sequential so we can see the development history too.",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ];
        setMessages(initialTimeline);
        localStorage.setItem('chatapp_messages', JSON.stringify(initialTimeline));
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(), 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of chat history when messages change or typing status triggers
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Save to localStorage helper when offline
  const saveOfflineMessage = (msg) => {
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('chatapp_messages', JSON.stringify(updated));
  };

  // Bot response simulator
  const simulateBotResponse = async (userMsgText) => {
    setIsTyping(true);
    
    // Custom simulated response based on keywords
    let responseText = "That's awesome! Let's keep building the MERN chat stack.";
    const lowerText = userMsgText.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('hi')) {
      responseText = `Hey there! Alex here. I see we have our development timeline active! How's the workspace looking?`;
    } else if (lowerText.includes('timeline') || lowerText.includes('history')) {
      responseText = `The timeline is looking clean! We've made commits for project setup, the Express REST APIs, the React client bootstrap, and now the timeline UI integration.`;
    } else if (lowerText.includes('mern') || lowerText.includes('stack')) {
      responseText = `MERN is great! Node & Express serving API endpoints, MongoDB storing the message logs, and Vite + React creating this visual chat timeline.`;
    } else if (lowerText.includes('github') || lowerText.includes('push')) {
      responseText = `I'll run the push commands as soon as we finish coding the frontend. We will have a beautiful commit graph showing our step-by-step progress.`;
    } else if (lowerText.includes('database') || lowerText.includes('mongodb')) {
      responseText = `Yes, if MongoDB is running, I'll save these messages straight to the database. If not, the application uses local storage caching.`;
    }

    setTimeout(async () => {
      const botMessage = {
        sender: 'Alex',
        text: responseText
      };

      if (connectionStatus === 'online') {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botMessage)
          });
          if (response.ok) {
            const saved = await response.json();
            setMessages((prev) => [...prev, saved]);
          } else {
            throw new Error('Server error');
          }
        } catch (e) {
          saveOfflineMessage({
            _id: 'mock-bot-' + Date.now(),
            ...botMessage,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        saveOfflineMessage({
          _id: 'mock-bot-' + Date.now(),
          ...botMessage,
          timestamp: new Date().toISOString()
        });
      }
      setIsTyping(false);
    }, 1800);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = currentUser === 'Other' && customUser.trim() ? customUser.trim() : currentUser;
    const userMessage = {
      sender: senderName,
      text: inputText.trim()
    };

    setInputText('');

    if (connectionStatus === 'online') {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userMessage)
        });
        if (response.ok) {
          const saved = await response.json();
          setMessages((prev) => [...prev, saved]);
          
          // Trigger bot response if sent by someone else
          if (senderName.toLowerCase() !== 'alex') {
            simulateBotResponse(userMessage.text);
          }
        } else {
          throw new Error('Server returned error status');
        }
      } catch (error) {
        console.warn('Failed to send to server. Saving to localStorage.', error.message);
        saveOfflineMessage({
          _id: 'mock-user-' + Date.now(),
          ...userMessage,
          timestamp: new Date().toISOString()
        });
        if (senderName.toLowerCase() !== 'alex') {
          simulateBotResponse(userMessage.text);
        }
      }
    } else {
      // Local offline mode saving
      saveOfflineMessage({
        _id: 'mock-user-' + Date.now(),
        ...userMessage,
        timestamp: new Date().toISOString()
      });
      if (senderName.toLowerCase() !== 'alex') {
        simulateBotResponse(userMessage.text);
      }
    }
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      if (connectionStatus === 'online') {
        // Can build a delete route, but for skeleton, we just clean up local state/localStorage
        setMessages([]);
        localStorage.removeItem('chatapp_messages');
      } else {
        setMessages([]);
        localStorage.removeItem('chatapp_messages');
      }
    }
  };

  // Group messages by Date for the timeline visual representation
  const getGroupedMessages = () => {
    const groups = {};
    messages.forEach((msg) => {
      const dateStr = new Date(msg.timestamp).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(msg);
    });
    return groups;
  };

  const groupedMessages = getGroupedMessages();

  return (
    <div className="app-container">
      {/* Header Panel */}
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon">💬</span>
          <div className="logo-text">
            <h1>AetherTimeline</h1>
            <p>MERN Chat Development History</p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="header-actions">
          <div className={`status-badge ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-label">
              {connectionStatus === 'online' ? 'Database Connected' : 'Local Storage Cache'}
            </span>
          </div>
          <button onClick={clearChatHistory} className="clear-btn" title="Reset Logs">
            🗑️ Clear
          </button>
        </div>
      </header>

      {/* Main Sandbox Layout */}
      <main className="app-main">
        {/* Left Control Sidebar */}
        <aside className="control-sidebar">
          <div className="sidebar-section">
            <h3>💬 Identity Switcher</h3>
            <p className="section-desc">Change who is sending the message on the timeline.</p>
            
            <div className="user-selector">
              <label className={`user-option ${currentUser === 'Aneekesh' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="user" 
                  value="Aneekesh" 
                  checked={currentUser === 'Aneekesh'}
                  onChange={() => setCurrentUser('Aneekesh')}
                />
                <span className="option-avatar">👨‍💻</span>
                <span className="option-name">Aneekesh (User)</span>
              </label>

              <label className={`user-option ${currentUser === 'Alex' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="user" 
                  value="Alex" 
                  checked={currentUser === 'Alex'}
                  onChange={() => setCurrentUser('Alex')}
                />
                <span className="option-avatar">🚀</span>
                <span className="option-name">Alex (Collaborator)</span>
              </label>

              <label className={`user-option ${currentUser === 'Other' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="user" 
                  value="Other" 
                  checked={currentUser === 'Other'}
                  onChange={() => setCurrentUser('Other')}
                />
                <span className="option-avatar">👤</span>
                <span className="option-name">Custom Identity</span>
              </label>
            </div>

            {currentUser === 'Other' && (
              <div className="custom-user-input slide-down">
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={customUser}
                  onChange={(e) => setCustomUser(e.target.value)}
                  maxLength={15}
                />
              </div>
            )}
          </div>

          <div className="sidebar-section info-card">
            <h3>📈 Git History Timeline</h3>
            <div className="history-flow">
              <div className="flow-step completed">
                <span className="flow-badge">1</span>
                <div>
                  <h4>Project Init</h4>
                  <p>Backend skeleton & structure</p>
                </div>
              </div>
              <div className="flow-step completed">
                <span className="flow-badge">2</span>
                <div>
                  <h4>REST APIs</h4>
                  <p>Messages endpoints operational</p>
                </div>
              </div>
              <div className="flow-step completed">
                <span className="flow-badge">3</span>
                <div>
                  <h4>React Setup</h4>
                  <p>Vite bootstrapped client</p>
                </div>
              </div>
              <div className="flow-step active">
                <span className="flow-badge">4</span>
                <div>
                  <h4>Timeline UI</h4>
                  <p>Connected components</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Chat Timeline Window */}
        <section className="chat-window">
          <div className="timeline-container">
            {Object.keys(groupedMessages).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📨</div>
                <h3>No history logs yet</h3>
                <p>Type a message below to start building the visual development timeline!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="timeline-date-group">
                  {/* Visual Date Divider on Timeline */}
                  <div className="timeline-date-header">
                    <span>{date}</span>
                  </div>

                  <div className="messages-list">
                    {dateMessages.map((msg) => {
                      const isMe = msg.sender.toLowerCase() === (currentUser === 'Other' ? customUser.toLowerCase() : currentUser.toLowerCase());
                      const timeStr = new Date(msg.timestamp).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit'
                      });

                      return (
                        <div 
                          key={msg._id || msg.timestamp} 
                          className={`timeline-item ${isMe ? 'item-right' : 'item-left'}`}
                        >
                          {/* Circle dot connecting to the timeline vertical spine */}
                          <div className="timeline-spine-dot"></div>
                          
                          <div className="message-card">
                            <div className="message-header">
                              <span className="message-avatar">{getAvatar(msg.sender)}</span>
                              <span className="message-sender">{msg.sender}</span>
                              <span className="message-time">{timeStr}</span>
                            </div>
                            <div className="message-content">
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Simulated Typing Indicator */}
            {isTyping && (
              <div className="timeline-item item-left">
                <div className="timeline-spine-dot typing-dot"></div>
                <div className="message-card typing-card">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">Alex is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form Composer */}
          <form onSubmit={handleSendMessage} className="message-composer">
            <input
              type="text"
              placeholder={`Send message as ${currentUser === 'Other' ? (customUser || 'Custom Identity') : currentUser}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={500}
            />
            <button type="submit" disabled={!inputText.trim()} className="send-btn">
              Send 🚀
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
