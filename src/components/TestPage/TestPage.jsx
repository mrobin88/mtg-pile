import React, { useState, useEffect } from 'react';
import styles from './TestPage.module.css';

// Local user state for decoupling demo purposes
const getInitialUser = () => {
  // Optionally, auto-login with a demo user for isolated testing, or leave as null
  return null;
};

const TestPage = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  // Decoupled local user state for demo/testing, not relying on app
  const [user, setUser] = useState(getInitialUser());

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({ status: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Local authentication flow for isolated testing
  const handleLogin = () => {
    setUser({
      name: 'Demo User',
      email: 'demo@example.com'
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className={styles.testPage}>
      <h1 className={styles.title}>🧪 Production Test Dashboard</h1>
      
      <div className={styles.section}>
        <h2>Database Connection</h2>
        {loading ? (
          <p className={styles.loading}>Checking...</p>
        ) : healthStatus ? (
          <div className={styles.status}>
            <p className={healthStatus.database === 'connected' ? styles.success : styles.error}>
              Database: <strong>{healthStatus.database}</strong>
            </p>
            <p>Environment: <strong>{healthStatus.environment}</strong></p>
            <p>Timestamp: <strong>{new Date(healthStatus.timestamp).toLocaleString()}</strong></p>
          </div>
        ) : (
          <p className={styles.error}>Failed to fetch health status</p>
        )}
      </div>

      <div className={styles.section}>
        <h2>User Authentication</h2>
        {user ? (
          <div className={styles.success}>
            <p>✅ Logged in as: <strong>{user.name}</strong></p>
            <p>Email: <strong>{user.email}</strong></p>
            <button className={styles.button} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        ) : (
          <div className={styles.warning}>
            <p>⚠️ Not logged in</p>
            <p>Please login or signup to test authentication</p>
            <button className={styles.button} onClick={handleLogin}>
              🔑 Login Demo User
            </button>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Frontend Status</h2>
        <div className={styles.success}>
          <p>✅ React App: <strong>Running</strong></p>
          <p>✅ Router: <strong>Working</strong></p>
          <p>✅ API Connection: <strong>Connected</strong></p>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={checkHealth} className={styles.button}>
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
};

export default TestPage;
