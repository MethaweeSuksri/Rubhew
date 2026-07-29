import React, { useState } from 'react';
import './css/login.css';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        alert('Login failed: ' + (errorData.message || 'Server error'));
        return;
      }

      const data = await response.json();

      if (data.message == "Success") {
        alert('Login successful! Redirecting...');
        navigate('/home');
      } else {
        alert('Login failed: ' + (data.message || 'Invalid credentials'));
      }
    } catch (error) {
      alert('Wrong Username or Password. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Forgot password functionality is not implemented yet.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>LOGIN</h2>
        <input
          type="text"
          id="username"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          id="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={handleLogin}>Login</button>

        <div className="extra-options">
          <p><Link to="/signin" className="sign-in">Sign In</Link></p>
          <p>
            <a href="#" className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
