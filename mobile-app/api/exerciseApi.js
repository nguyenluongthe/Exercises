import apiClient from './client';

export const exerciseApi = {
  listExercises: async ({ bodyPart, equipment, target, search, page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams();
    if (bodyPart) params.append('body_part', bodyPart);
    if (equipment) params.append('equipment', equipment);
    if (target) params.append('target', target);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    return apiClient.get(`/exercises?${params.toString()}`);
  },

  getExerciseById: async (id) => {
    return apiClient.get(`/exercises/${id}`);
  },

  getSubstitutions: async (id, topK = 4) => {
    return apiClient.get(`/exercises/${id}/substitutions?top_k=${topK}`);
  },

  predictBodyPart: async (text) => {
    return apiClient.post('/predict', { text });
  },

  recommendExercises: async ({ text, topK = 6, bodyPart, equipment }) => {
    const payload = { text, top_k: topK };
    if (bodyPart) payload.body_part = bodyPart;
    if (equipment) payload.equipment = equipment;
    return apiClient.post('/recommend', payload);
  },
};
