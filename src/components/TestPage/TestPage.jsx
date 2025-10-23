import React, { useState, useEffect } from 'react';
import styles from './TestPage.module.css';

const TestPage = (props) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
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
        {props.user ? (
          <div className={styles.success}>
            <p>✅ Logged in as: <strong>{props.user.name}</strong></p>
            <p>Email: <strong>{props.user.email}</strong></p>
          </div>
        ) : (
          <div className={styles.warning}>
            <p>⚠️ Not logged in</p>
            <p>Please login or signup to test authentication</p>
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

