import api from './axios';

// simple CRUD interface for alerts; backend routes should be implemented
// if/when alerts are supported.
// Use trailing slash to avoid 307 redirect
export const alertApi = {
  getAlerts: () => api.get('/alerts/'),
  createAlert: (alert) => api.post('/alerts/', alert),
  updateAlert: (id, alert) => api.put(`/alerts/${id}/`, alert),
  deleteAlert: (id) => api.delete(`/alerts/${id}/`),
};
