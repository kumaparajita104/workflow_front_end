import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  console.log("✅ UserProvider Mounted");

  const [user, setUser] = useState({ username: '', roles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 useEffect in UserProvider running");
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("⚠️ No token found");
      setLoading(false);
      return;
    }

    fetch('http://localhost:9091/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("✅ User fetched:", data);
        setUser({
          username: data.username,
          roles: data.roles,
        });
      })
      .catch(err => {
        console.error('❌ Error fetching user:', err);
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
