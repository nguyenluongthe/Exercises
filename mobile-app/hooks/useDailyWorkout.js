import { useState, useEffect, useCallback } from 'react';
import { workoutApi } from '../api/workoutApi';
import { useAuth } from '../context/AuthContext';

export function useDailyWorkout() {
  const { token, profile } = useAuth();
  const [dailyWorkout, setDailyWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDailyWorkout = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getDailyAdaptiveWorkout();
      setDailyWorkout(data);
    } catch (err) {
      console.warn('Failed to fetch daily workout:', err);
      setError(err.message || 'Không thể tải buổi tập hôm nay');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDailyWorkout();
  }, [fetchDailyWorkout, profile?.fitness_goal, profile?.available_equipment]);

  return { dailyWorkout, loading, error, refetch: fetchDailyWorkout };
}
