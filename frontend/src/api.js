import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  timeout: 35000,
});

export const loginUser       = (initData)              => API.post('/api/users/login', { init_data: initData });
export const getUser         = (telegramId)            => API.get(`/api/users/${telegramId}`);
export const getFreeFeed     = ()                      => API.get('/api/posts/feed?tier=free');
export const getFullFeed     = ()                      => API.get('/api/posts/feed');
export const getPost         = (postId)                => API.get(`/api/posts/${postId}`);
export const getSubscription = (telegramId)            => API.get(`/api/subscriptions/${telegramId}`);
export const createInvoice   = (telegramId, productKey) => API.post('/api/payments/invoice', { telegram_id: telegramId, product_key: productKey });
