import { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

export default function FavoritesScreen({ navigation }) {
  const { t } = useLanguage();
  const { favorites, loading, refetch, toggleFavorite } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
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
        data={favorites}
        keyExtractor={(item) => item.exercise_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation && navigation.navigate('Detail', { exercise: { id: item.exercise_id, name: item.exercise_name } })}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.exercise_name}</Text>
              <Text style={styles.cardId}>ID: #{item.exercise_id}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite({ id: item.exercise_id, name: item.exercise_name })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.removeText}>{t('remove')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>{t('noFavorites')}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInfo: { flex: 1, paddingRight: spacing.md },
  cardTitle: { color: colors.text, ...typography.body, fontWeight: '600' },
  cardId: { color: colors.textSecondary, ...typography.caption, marginTop: 2 },
  removeText: { color: colors.primary, ...typography.bodySmall, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { color: colors.textSecondary, ...typography.body, textAlign: 'center' },
});