import api from './axios';

export const advisorApi = {
  // chat endpoint defined in backend
  chat: (message) => api.post('/advisor/chat', { query: message }),
  getStrategy: () => api.get('/advisor/strategy'),
};