import apiClient from './client';

export const authApi = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return apiClient.postForm('/auth/login', params.toString());
  },

  register: async (email, password, name) => {
    return apiClient.post('/auth/register', { email, password, name });
  },

  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  getProfile: async () => {
    return apiClient.get('/user/profile');
  },

  updateProfile: async (profileData) => {
    return apiClient.put('/user/profile', profileData);
  },
};
