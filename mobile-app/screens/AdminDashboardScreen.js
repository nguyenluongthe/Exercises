import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { adminApi } from '../api/adminApi';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

export default function AdminDashboardScreen() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
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
    { label: t('totalUsers'), value: stats.total_users, accent: colors.primary },
    { label: t('totalExercises'), value: stats.total_exercises, accent: colors.info },
    { label: t('totalFavorites'), value: stats.total_favorites, accent: colors.warning },
    { label: t('totalWorkoutLogs'), value: stats.total_workout_logs, accent: colors.success },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🛡️ ADMIN SYSTEM DASHBOARD</Text>
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
              <Text style={styles.listCount}>{item.count} lượt</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.error, ...typography.body },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  badgeText: { color: colors.primary, ...typography.caption, fontWeight: '800', letterSpacing: 0.5 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  statValue: { ...typography.h1, color: colors.text, fontVariant: ['tabular-nums'], marginTop: 6 },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  tableCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 4 },
  emptyText: { color: colors.textSecondary, padding: spacing.lg },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  listName: { flex: 1, color: colors.text, ...typography.body, fontWeight: '600' },
  listCount: { color: colors.textSecondary, fontWeight: '700', fontVariant: ['tabular-nums'] },
});