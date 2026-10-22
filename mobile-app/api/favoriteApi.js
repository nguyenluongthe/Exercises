import apiClient from './client';

export const favoriteApi = {
  listFavorites: async () => {
    return apiClient.get('/favorites');
  },

  addFavorite: async (exerciseId, exerciseName) => {
    return apiClient.post('/favorites', {
      exercise_id: exerciseId,
      exercise_name: exerciseName,
    });
  },

  removeFavorite: async (exerciseId) => {
    return apiClient.delete(`/favorites/${exerciseId}`);
  },
};
