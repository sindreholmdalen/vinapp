import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// === Dashboard ===
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getValueHistory = (months = 12) => api.get('/dashboard/value-history', { params: { months } });

// === Vinmonopolet ===
export const searchVinmonopolet = (query, limit = 20) =>
    api.get('/vinmonopolet/search', { params: { query, limit } });

export const lookupBarcode = (barcode) =>
    api.post('/vinmonopolet/barcode', { barcode });

export const getVinmonopoletProduct = (productId) =>
    api.get(`/vinmonopolet/product/${productId}`);

// === Vinkjeller ===
export const getCellar = (params = {}) =>
    api.get('/cellar', { params });

export const getCellarItem = (id) =>
    api.get(`/cellar/${id}`);

export const addToCellar = (data) =>
    api.post('/cellar', data);

export const updateCellarItem = (id, data) =>
    api.put(`/cellar/${id}`, data);

export const removeFromCellar = (id, data) =>
    api.post(`/cellar/${id}/remove`, data);

export const deleteCellarItem = (id) =>
    api.delete(`/cellar/${id}`);

// === Transaksjoner ===
export const getTransactions = (params = {}) =>
    api.get('/transactions', { params });

// === Matpairing ===
export const getPairingsForWine = (wineId) =>
    api.get(`/pairing/wine/${wineId}`);

export const getPairingsForFood = (food) =>
    api.post('/pairing/food', { food });

export default api;
