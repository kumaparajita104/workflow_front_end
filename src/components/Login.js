import React, { useState } from 'react';
import { loginWithKeycloak } from './auth/loginWithKeycloak';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const token = await loginWithKeycloak(username, password);
      onLogin(token);
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Keycloak Login</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
