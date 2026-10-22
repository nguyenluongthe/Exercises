import { useState, useCallback } from 'react';
import { exerciseApi } from '../api/exerciseApi';

export function useExerciseSearch() {
  const [description, setDescription] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeSearch = useCallback(async (textToSearch, filterBodyPart = null) => {
    if (!textToSearch || textToSearch.trim().length < 3) {
      setError('Vui lòng nhập mô tả ít nhất 3 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Phân loại nhóm cơ bằng AI
      const pred = await exerciseApi.predictBodyPart(textToSearch);
      setPredictionData(pred);

      // 2. Gợi ý bài tập tương tự
      const recData = await exerciseApi.recommendExercises({
        text: textToSearch,
        bodyPart: filterBodyPart || undefined,
        topK: 6,
      });

      setExercises(recData.results || []);
    } catch (err) {
      console.warn('Search failed:', err);
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setDescription('');
    setPredictionData(null);
    setExercises([]);
    setError('');
  }, []);

  return {
    description,
    setDescription,
    predictionData,
    exercises,
    loading,
    error,
    executeSearch,
    clearSearch,
  };
}
