import React, { useState } from 'react';
import '../CSS/AuthPage.css'; 

function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [user_psw, setUserPsw] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setIdentifier('');
    setEmail('');
    setUserPsw('');
    setConfirmPassword('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && user_psw !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const endpoint = isLogin ? '/api/User/login' : '/api/User/register';
      const payload = isLogin
        ? { Identifier: identifier, Password: user_psw }
        : { UserName: identifier, Email: email, Password: user_psw };

      const response = await fetch(`https://localhost:7019${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || (isLogin ? 'Login failed' : 'Registration failed'));
      }

      const data = await response.json();

      // Save userId temporarily in localStorage
      localStorage.setItem('userId', data.userId);
      console.log(`Authorized User ID: ${data.userId}`);

      // Notify parent (App.js) of successful authentication
      onAuthSuccess(data.userId);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-page">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form className="auth-form" onSubmit={handleAuth}>
        <input
          type="text"
          placeholder={isLogin ? 'Username or Email' : 'Username'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={user_psw}
          onChange={(e) => setUserPsw(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <button className="auth-toggle-btn" onClick={toggleForm}>
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </button>
    </div>
  );
}

export default AuthPage;
