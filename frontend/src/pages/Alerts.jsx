import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { alertApi } from "../api/alertApi";
import AlertModal from "../components/AlertModal";
import AlertBanner from "../components/AlertBanner";

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Use ref to track auth error
  const authErrorRef = useRef(false);

  const fetchAlerts = async () => {
    if (authErrorRef.current) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const resp = await alertApi.getAlerts();
      console.log("[Alerts] API Response:", resp.data);
      setAlerts(resp.data || []);
    } catch (err) {
      console.error("[Alerts] Failed to load alerts", err);
      if (err.response && err.response.status === 401) {
        authErrorRef.current = true;
        setError("Please login to view alerts");
      } else {
        setError("Could not load alerts");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading before fetching
    if (!user) {
      setLoading(false);
      setAlerts([]);
      return;
    }
    
    fetchAlerts();

    // Polling every 5 seconds
    const interval = setInterval(() => {
      if (!authErrorRef.current && user) {
        fetchAlerts();
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleCreate = (alert) => {
    setAlerts((prev) => [...prev, alert]);
  };

  const handleDelete = async (id) => {
    try {
      await alertApi.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete alert", err);
      setError("Unable to delete alert");
    }
  };

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h1>Price Alerts</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>New Alert</button>
      </div>

      {error && <AlertBanner message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 && <div>No alerts configured.</div>}
          {alerts.map((a) => (
            <div key={a.id} className="alert-row">
              <span>{a.symbol} {a.direction} {a.threshold}</span>
              <button className="btn btn-sm" onClick={() => handleDelete(a.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AlertModal
          onClose={() => setModalOpen(false)}
          onCreate={async (payload) => {
            try {
              const resp = await alertApi.createAlert(payload);
              handleCreate(resp.data);
              setModalOpen(false);
            } catch (err) {
              console.error("Alert create failed", err);
            }
          }}
        />
      )}

      <style>{`
        .alerts-page .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .alerts-list { display: flex; flex-direction: column; gap: 8px; }
        .alert-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .btn-sm { font-size: 12px; padding: 4px 8px; }
      `}</style>
    </div>
  );
}
