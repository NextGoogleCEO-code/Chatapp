import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api/auth';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/login' : '/register';
    const body =
      mode === 'login'
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

    try {
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        localStorage.setItem('chat_token', data.token);
        localStorage.setItem('chat_username', data.username);
        onLogin(data.token, data.username);
      }
    } catch (err) {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="e.g. aneekesh"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
