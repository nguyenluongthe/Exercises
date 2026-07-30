import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function FavoritesScreen() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/favorites`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.log('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); }, []));

  const removeFavorite = async (exerciseId) => {
    try {
      await fetch(`${API_URL}/favorites/${exerciseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((f) => f.exercise_id !== exerciseId));
    } catch (err) {
      console.log('Failed to remove favorite:', err);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color="#FF5A1F" size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.exercise_id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.exercise_name}</Text>
            <Pressable onPress={() => removeFavorite(item.exercise_id)}>
              <Text style={styles.removeText}>{t('remove')}</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('noFavorites')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B', padding: 20 },
  centered: { flex: 1, backgroundColor: '#12172B', justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1C2340', borderRadius: 10, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#2E3760',
  },
  cardTitle: { color: '#F5F3ED', fontSize: 15, fontWeight: '600', flex: 1 },
  removeText: { color: '#FF5A1F', fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#9AA3C7', textAlign: 'center', marginTop: 40 },
});