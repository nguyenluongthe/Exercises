import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, Pressable,
  ActivityIndicator, FlatList, Image, TouchableOpacity,
} from 'react-native';
import { API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const { t, lang } = useLanguage();
  const [description, setDescription] = useState('');
  const [predictedBodyPart, setPredictedBodyPart] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePress = async () => {
    if (description.trim().length < 3) {
      setError(t('enterLongerDescription'));
      return;
    }

    setLoading(true);
    setError('');
    setPredictedBodyPart(null);
    setExercises([]);

    try {
      const predictRes = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description }),
      });
      if (!predictRes.ok) throw new Error(`Predict failed: ${predictRes.status}`);
      const predictData = await predictRes.json();
      setPredictedBodyPart(predictData.predicted_body_part);
      setConfidence(predictData.confidence);

      const recommendRes = await fetch(`${API_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, top_k: 5 }),
      });
      if (!recommendRes.ok) throw new Error(`Recommend failed: ${recommendRes.status}`);
      const recommendData = await recommendRes.json();
      setExercises(recommendData.results);
    } catch (err) {
      console.log('Error detail:', err);
      setError(`${t('failedToConnect')}: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.title}>{t('inputPlaceholder')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('inputPlaceholder')}
        placeholderTextColor="#5A6690"
        value={description}
        onChangeText={setDescription}
      />
      

      <Pressable style={styles.button} onPress={handlePress} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('loading') : t('getSuggestions')}</Text>
      </Pressable>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {predictedBodyPart && (
        <Text style={styles.predictionText}>
          {t('recommendedFor')}: <Text style={styles.bold}>{predictedBodyPart}</Text>
        </Text>
      )}

      <FlatList
        style={styles.list}
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        ListEmptyComponent={
          !loading && predictedBodyPart ? <Text style={styles.emptyText}>{t('noExercisesFound')}</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B', paddingTop: 24, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#F5F3ED', letterSpacing: 0.5 },
  profileLink: { color: '#FF5A1F', fontWeight: '700', fontSize: 14 },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#2E3760', borderRadius: 10,
    padding: 14, marginBottom: 12, backgroundColor: '#1C2340',
    color: '#F5F3ED', fontSize: 15,
  },
  button: { backgroundColor: '#FF5A1F', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#12172B', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontSize: 14 },
  error: { color: '#FF7A7A', marginTop: 16, textAlign: 'center' },
  predictionText: { marginTop: 18, fontSize: 14, textAlign: 'center', color: '#9AA3C7' },
  bold: { fontWeight: '700', color: '#FF5A1F' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9AA3C7' },
  list: { marginTop: 20 },
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