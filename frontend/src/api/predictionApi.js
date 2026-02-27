import api from './axios';

export const predictionApi = {
  // backend expects a POST to /predictions/predict with { symbol }
  getPrediction: (symbol) => api.post('/predictions/predict', { symbol }),
  // additional endpoints can be added as they are implemented
  getHistoricalData: (symbol) => api.get(`/predictions/history/${symbol}`),
  getMarketSentiment: () => api.get('/news/market'),
};