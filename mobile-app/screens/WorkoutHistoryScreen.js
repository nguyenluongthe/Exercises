import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { workoutApi } from '../api/workoutApi';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

export default function WorkoutHistoryScreen() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await workoutApi.getWorkoutHistory();
      setLogs(data || []);
    } catch (err) {
      console.warn('Failed to load workout logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{item.exercise_name}</Text>
              <Text style={styles.repsBadge}>{item.sets} × {item.reps} {t('reps')}</Text>
            </View>
            <Text style={styles.cardDate}>🕒 {item.logged_at}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>{t('noWorkoutLogs')}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: { color: colors.text, ...typography.body, fontWeight: '700', flex: 1 },
  repsBadge: { color: colors.primary, ...typography.caption, fontWeight: '700', marginLeft: spacing.sm },
  cardDate: { color: colors.textSecondary, ...typography.caption, marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { color: colors.textSecondary, ...typography.body, textAlign: 'center' },
});