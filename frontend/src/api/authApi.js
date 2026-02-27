import api from './axios';

// convert object to application/x-www-form-urlencoded data
function toFormUrlEncoded(obj) {
  const p = new URLSearchParams();
  for (const k in obj) {
    p.append(k, obj[k]);
  }
  return p;
}

export const authApi = {
  login: (username, password) => {
    const data = toFormUrlEncoded({ username, password });
    return api.post('/auth/login', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  register: (username, password) => api.post('/auth/register', { username, password }),
};