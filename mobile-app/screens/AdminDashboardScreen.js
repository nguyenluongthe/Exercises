import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboardScreen() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4F46E5" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const statCards = [
    { label: t('totalUsers'), value: stats.total_users, accent: '#4F46E5' },
    { label: t('totalExercises'), value: stats.total_exercises, accent: '#0EA5E9' },
    { label: t('totalFavorites'), value: stats.total_favorites, accent: '#F59E0B' },
    { label: t('totalWorkoutLogs'), value: stats.total_workout_logs, accent: '#10B981' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>ADMIN MODE</Text>
      </View>

      <View style={styles.statGrid}>
        {statCards.map((card) => (
          <View key={card.label} style={styles.statCard}>
            <View style={[styles.statAccent, { backgroundColor: card.accent }]} />
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('mostFavorited')}</Text>
      <View style={styles.tableCard}>
        {stats.most_favorited_exercises.length === 0 ? (
          <Text style={styles.emptyText}>—</Text>
        ) : (
          stats.most_favorited_exercises.map((item, index) => (
            <View
              key={index}
              style={[
                styles.listRow,
                index < stats.most_favorited_exercises.length - 1 && styles.listRowBorder,
              ]}
            >
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.listName}>{item.exercise_name}</Text>
              <Text style={styles.listCount}>{item.count}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  centered: { flex: 1, backgroundColor: '#F4F6FB', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#DC2626' },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE',
    borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 16,
  },
  badgeText: { color: '#4F46E5', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  statValue: { fontSize: 30, fontWeight: '800', color: '#1E293B', fontVariant: ['tabular-nums'], marginTop: 6 },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 4 },
  emptyText: { color: '#94A3B8', padding: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rankCircle: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rankText: { color: '#4F46E5', fontWeight: '800', fontSize: 12 },
  listName: { flex: 1, color: '#1E293B', fontSize: 14, fontWeight: '600' },
  listCount: { color: '#64748B', fontWeight: '700', fontVariant: ['tabular-nums'] },
});