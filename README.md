# AetherTimeline - MERN Chat Application Skeleton

A modern, visually stunning Chat Application built using the MERN stack (MongoDB, Express, React, Node.js) with a premium, glassmorphic layout displaying a chronological chat history timeline.

## Features
- **Chronological Timeline UI**: Displays messages linked on a vertical timeline spine, grouped dynamically by day.
- **Identity Switcher Sidebar**: Toggle who sends the message (e.g. `Aneekesh`, `Alex`, or custom names) to easily simulate developer chat flows.
- **Smart Bot Responder**: Toggling `Alex` or messaging `Alex` triggers custom animated typing states and replies.
- **Resilient Fallback Mode**: If MongoDB is not running locally, the application automatically triggers offline `localStorage` caching so the app remains 100% interactive.
- **Premium Glassmorphic Design**: Customized using custom HSL properties, Outfit & Inter google fonts, layout alignments, neon shadows, and smooth micro-animations.

---

## Folder Structure
```
Chatapp/
├── backend/
│   ├── models/Message.js     # Mongoose Message Schema
│   ├── routes/messages.js    # REST Endpoints (GET/POST)
│   ├── package.json          # Node Dependencies
│   └── server.js             # Express Server with Connection Logic
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main Interactive UI
│   │   ├── index.css         # Premium Glassmorphic Styles
│   │   └── main.jsx
│   └── package.json          # Vite React Dependencies
└── README.md                 # Project Documentation
```

---

## How to Run Locally

### 1. Run the Express Backend
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. The server will run on `http://localhost:5000`.
3. *(Optional)* Add a `.env` file in `backend/` with a `MONGODB_URI` environment variable if you want to connect to a custom MongoDB instance.

### 2. Run the React Frontend
1. Open a second terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser to `http://localhost:5173`.
