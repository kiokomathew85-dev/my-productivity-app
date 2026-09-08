import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH ENDPOINTS ============

export const authAPI = {
  signup: (username, email, password) =>
    api.post('/auth/signup', { username, email: email.trim().toLowerCase(), password }),

  login: (email, password) =>
    api.post('/auth/login', { email: email.trim().toLowerCase(), password }),

  getCurrentUser: () =>
    api.get('/auth/me'),
  updateProfile: (username, email) =>
    api.put('/auth/me', { username, email }),
};

// ============ PROJECT ENDPOINTS ============

export const projectAPI = {
  getAll: (page = 1, per_page = 10) =>
    api.get('/projects', { params: { page, per_page } }),

  search: (query) =>
    api.get('/projects/search', { params: { q: query } }),

  getById: (id) =>
    api.get(`/projects/${id}`),

  create: (name, description = '', priority = 'medium', due_date = null) =>
    api.post('/projects', { name, description, priority, due_date }),

  update: (id, name, description, priority = 'medium', due_date = null) =>
    api.put(`/projects/${id}`, { name, description, priority, due_date }),

  delete: (id) =>
    api.delete(`/projects/${id}`),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  askAssistant: (question) => api.post('/assistant', { question }),
  getSuggestions: () => api.get('/assistant/suggestions'),
};

// ============ TASK ENDPOINTS ============

export const taskAPI = {
  getByProject: (projectId, page = 1, per_page = 10) =>
    api.get(`/projects/${projectId}/tasks`, { params: { page, per_page } }),

  getById: (id) =>
    api.get(`/tasks/${id}`),

  create: (projectId, title, description = '', status = 'pending', due_date = null, priority = 'medium') =>
    api.post(`/projects/${projectId}/tasks`, { title, description, status, due_date, priority }),

  update: (id, title, description, status, due_date, priority = 'medium') =>
    api.put(`/tasks/${id}`, { title, description, status, due_date, priority }),

  delete: (id) =>
    api.delete(`/tasks/${id}`),
  reorder: (projectId, task_ids) =>
    api.put(`/projects/${projectId}/tasks/reorder`, { task_ids }),
};

export default api;
