import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WorkoutHistoryScreen() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/workout-logs`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.log('Failed to load workout logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchLogs(); }, []));

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color="#FF5A1F" size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.exercise_name}</Text>
            <Text style={styles.cardSubtitle}>{item.sets} × {item.reps} — {t('reps')}</Text>
            <Text style={styles.cardDate}>{item.logged_at}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('noWorkoutLogs')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B', padding: 20 },
  centered: { flex: 1, backgroundColor: '#12172B', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#1C2340', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2E3760' },
  cardTitle: { color: '#F5F3ED', fontSize: 15, fontWeight: '600' },
  cardSubtitle: { color: '#9AA3C7', fontSize: 13, marginTop: 4 },
  cardDate: { color: '#5A6690', fontSize: 11, marginTop: 4 },
  emptyText: { color: '#9AA3C7', textAlign: 'center', marginTop: 40 },
});