import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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

  const buildQuery = (pageNum) => {
    const params = new URLSearchParams();
    if (search.trim().length > 0) params.append('search', search.trim());
    if (selectedBodyPart) params.append('body_part', selectedBodyPart);
    if (selectedEquipment) params.append('equipment', selectedEquipment);
    params.append('page', pageNum);
    params.append('page_size', PAGE_SIZE);
    return params.toString();
  };

  const fetchExercises = async (pageNum, append) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_URL}/exercises?${buildQuery(pageNum)}`);
      const data = await res.json();
      setTotal(data.total);
      setExercises((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(pageNum);
    } catch (err) {
      console.log('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Tải lại từ đầu mỗi khi search hoặc bộ lọc thay đổi
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchExercises(1, false);
    }, 400); // Chờ 0.4s sau khi ngừng gõ mới gọi API, tránh gọi liên tục từng ký tự

    return () => clearTimeout(delayDebounce);
  }, [search, selectedBodyPart, selectedEquipment]);

  const handleLoadMore = () => {
    if (loadingMore || loading) return;
    if (exercises.length >= total) return; // Đã tải hết
    fetchExercises(page + 1, true);
  };

  const toggleBodyPart = (bp) => {
    setSelectedBodyPart((prev) => (prev === bp ? null : bp));
  };

  const toggleEquipment = (eq) => {
    setSelectedEquipment((prev) => (prev === eq ? null : eq));
  };

  const renderExercise = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { exercise: item })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      ) : null}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {lang === 'vi' && item.name_vi ? item.name_vi : item.name}
        </Text>
        <Text style={styles.cardSubtitle}>{item.body_part} · {item.equipment}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('searchByName')}
        placeholderTextColor="#5A6690"
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
        <ActivityIndicator color="#FF5A1F" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={styles.list}
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('noResultsFound')}</Text>}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color="#FF5A1F" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B', paddingTop: 16, paddingHorizontal: 20 },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#2E3760', borderRadius: 10,
    padding: 14, marginBottom: 12, backgroundColor: '#1C2340',
    color: '#F5F3ED', fontSize: 15,
  },
  chipRow: { flexGrow: 0, marginBottom: 10 },
  chip: {
    borderWidth: 1, borderColor: '#2E3760', borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 14, marginRight: 8,
  },
  chipActive: { backgroundColor: '#FF5A1F', borderColor: '#FF5A1F' },
  chipText: { color: '#9AA3C7', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipTextActive: { color: '#12172B', fontWeight: '700' },
  list: { marginTop: 12 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#9AA3C7' },
  card: {
    flexDirection: 'row', backgroundColor: '#1C2340', borderRadius: 12,
    marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2E3760',
  },
  cardImage: { width: 88, height: 88 },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#F5F3ED' },
  cardSubtitle: {
    fontSize: 11, color: '#9AA3C7', marginTop: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
});