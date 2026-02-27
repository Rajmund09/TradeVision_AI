import api from './axios';

export const portfolioApi = {
  // Use trailing slash to avoid 307 redirect
  getPortfolio: () => api.get('/portfolio/'),
  addStock: (data) => api.post('/portfolio/add', data),
  removeStock: (symbol) => api.delete(`/portfolio/${symbol}`),
  getRiskAnalysis: () => api.get('/portfolio/risk'),
};
