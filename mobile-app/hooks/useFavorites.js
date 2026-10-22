import { useState, useEffect, useCallback } from 'react';
import { favoriteApi } from '../api/favoriteApi';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await favoriteApi.listFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.warn('Failed to fetch favorites:', err);
      setError(err.message || 'Lỗi khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (exerciseId) => favorites.some((fav) => fav.exercise_id === exerciseId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (exercise) => {
      const exists = isFavorite(exercise.id);
      try {
        if (exists) {
          await favoriteApi.removeFavorite(exercise.id);
          setFavorites((prev) => prev.filter((f) => f.exercise_id !== exercise.id));
        } else {
          const newFav = await favoriteApi.addFavorite(exercise.id, exercise.name);
          setFavorites((prev) => [newFav, ...prev]);
        }
        return !exists;
      } catch (err) {
        console.warn('Toggle favorite failed:', err);
        throw err;
      }
    },
    [isFavorite]
  );

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
