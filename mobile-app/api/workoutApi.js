import apiClient from './client';

export const workoutApi = {
  getDailyAdaptiveWorkout: async () => {
    return apiClient.get('/adaptive/daily-workout');
  },

  logWorkout: async ({ exerciseId, exerciseName, sets, reps }) => {
    return apiClient.post('/workout-logs', {
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      sets,
      reps,
    });
  },

  getWorkoutHistory: async () => {
    return apiClient.get('/workout-logs');
  },
};
