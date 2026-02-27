import api from './axios';

export const newsApi = {
  getStockNews: (symbol, limit = 10) => api.get(`/news/stock/${symbol}`, { params: { limit } }),
  getMarketNews: (limit = 10) => api.get('/news/market', { params: { limit } }),
  analyzeSentiment: (articles) => api.post('/news/sentiment', articles),
};