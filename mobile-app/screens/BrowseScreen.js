import { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { exerciseApi } from '../api/exerciseApi';
import { useLanguage } from '../context/LanguageContext';
import ExerciseCard from '../components/exercise/ExerciseCard';
import { colors, radius, spacing, typography } from '../theme';

const BODY_PARTS = [
  'chest', 'back', 'shoulders', 'upper arms', 'lower arms',
  'upper legs', 'lower legs', 'waist', 'cardio', 'neck',
];

const EQUIPMENT_LIST = [
  'body weight', 'dumbbell', 'barbell', 'cable',
  'kettlebell', 'band', 'machine', 'medicine ball',
];

const PAGE_SIZE = 20;

export default function BrowseScreen({ navigation }) {
  const { t, lang } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchExercises = async (pageNum, append) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await exerciseApi.listExercises({
        bodyPart: selectedBodyPart || undefined,
        equipment: selectedEquipment || undefined,
        search: search.trim() || undefined,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });

      setTotal(data.total);
      setExercises((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(pageNum);
    } catch (err) {
      console.warn('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchExercises(1, false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedBodyPart, selectedEquipment]);

  const handleLoadMore = () => {
    if (loadingMore || loading) return;
    if (exercises.length >= total) return;
    fetchExercises(page + 1, true);
  };

  const toggleBodyPart = (bp) => {
    setSelectedBodyPart((prev) => (prev === bp ? null : bp));
  };

  const toggleEquipment = (eq) => {
    setSelectedEquipment((prev) => (prev === eq ? null : eq));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('searchByName')}
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedBodyPart && styles.chipActive]}
          onPress={() => setSelectedBodyPart(null)}
        >
          <Text style={[styles.chipText, !selectedBodyPart && styles.chipTextActive]}>{t('all')}</Text>
        </TouchableOpacity>
        {BODY_PARTS.map((bp) => (
          <TouchableOpacity
            key={bp}
            style={[styles.chip, selectedBodyPart === bp && styles.chipActive]}
            onPress={() => toggleBodyPart(bp)}
          >
            <Text style={[styles.chipText, selectedBodyPart === bp && styles.chipTextActive]}>{bp}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedEquipment && styles.chipActive]}
          onPress={() => setSelectedEquipment(null)}
        >
          <Text style={[styles.chipText, !selectedEquipment && styles.chipTextActive]}>{t('all')}</Text>
        </TouchableOpacity>
        {EQUIPMENT_LIST.map((eq) => (
          <TouchableOpacity
            key={eq}
            style={[styles.chip, selectedEquipment === eq && styles.chipActive]}
            onPress={() => toggleEquipment(eq)}
          >
            <Text style={[styles.chipText, selectedEquipment === eq && styles.chipTextActive]}>{eq}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={styles.list}
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              lang={lang}
              onPress={(ex) => navigation.navigate('Detail', { exercise: ex })}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('noResultsFound')}</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.md, paddingHorizontal: spacing.lg },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
  },
  chipRow: { flexGrow: 0, marginBottom: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, ...typography.caption, textTransform: 'uppercase' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  list: { marginTop: spacing.sm },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, ...typography.body },
});