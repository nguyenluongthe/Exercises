import apiClient from './client';

export const adminApi = {
  getStats: async () => {
    return apiClient.get('/admin/stats');
  },

  createExercise: async (exerciseData) => {
    return apiClient.post('/admin/exercises', exerciseData);
  },

  updateExercise: async (id, exerciseData) => {
    return apiClient.put(`/admin/exercises/${id}`, exerciseData);
  },

  deleteExercise: async (id) => {
    return apiClient.delete(`/admin/exercises/${id}`);
  },
};
