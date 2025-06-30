import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateForm from './components/CreateForm';
import CreateWorkflow from './components/CreateWorkflow';
import { UserProvider } from './components/UserProvider';
import AutoForm from './components/AutoForm';
import keycloak from './auth/keycloak';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
      })
      .then(authenticated => {
        if (authenticated) {
          setIsAuthenticated(true);
          setToken(keycloak.token);
          localStorage.setItem('token', keycloak.token); // ✅ Store for UserProvider
        } else {
          keycloak.login(); // not authenticated
        }
      })
      .catch(err => {
        console.error('Keycloak init error:', err);
        setIsAuthenticated(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token'); // clear token on logout
    keycloak.logout({ redirectUri: window.location.origin });
  };

  if (!isAuthenticated) {
    return <div>Loading authentication...</div>;
  }

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard token={token} logout={logout} />} />
          <Route path="/create-form" element={<CreateForm token={token} />} />
          <Route path="/create-workflow" element={<CreateWorkflow token={token} />} />
          <Route path="/auto-form" element={<AutoForm token={token} />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
