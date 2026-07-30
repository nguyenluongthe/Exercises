import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DetailScreen({ route }) {
  const { exercise } = route.params;
  const { token } = useAuth();
  const { t, lang } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [loggingWorkout, setLoggingWorkout] = useState(false);

  const handleSaveFavorite = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ exercise_id: exercise.id, exercise_name: exercise.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
      }
      setSaved(true);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogWorkout = async () => {
    setLoggingWorkout(true);
    try {
      const res = await fetch(`${API_URL}/workout-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          sets: parseInt(sets, 10),
          reps: parseInt(reps, 10),
        }),
      });
      if (!res.ok) throw new Error('Failed to log workout');
      Alert.alert(t('success'), t('workoutLogged'));
      setShowLogForm(false);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoggingWorkout(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {exercise.gif_url ? (
        <Image source={{ uri: exercise.gif_url }} style={styles.image} resizeMode="cover" />
      ) : exercise.image ? (
        <Image source={{ uri: exercise.image }} style={styles.image} resizeMode="cover" />
      ) : null}

      <Text style={styles.title}>
  {lang === 'vi' && exercise.name_vi ? exercise.name_vi : exercise.name}
</Text>

      <View style={styles.tagRow}>
        <Text style={styles.tag}>{exercise.body_part}</Text>
        <Text style={styles.tag}>{exercise.equipment}</Text>
        <Text style={styles.tag}>{exercise.target}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, saved && styles.actionButtonDisabled]}
          onPress={handleSaveFavorite}
          disabled={saving || saved}
        >
          <Text style={styles.actionButtonText}>
            {saved ? `★ ${t('saved')}` : saving ? t('saving') : `☆ ${t('saveToFavorites')}`}
          </Text>
        </Pressable>

        <Pressable style={styles.actionButtonOutline} onPress={() => setShowLogForm(!showLogForm)}>
          <Text style={styles.actionButtonOutlineText}>{t('logWorkout')}</Text>
        </Pressable>
      </View>

      {showLogForm && (
        <View style={styles.logForm}>
          <Text style={styles.logLabel}>{t('sets')}</Text>
          <TextInput style={styles.logInput} value={sets} onChangeText={setSets} keyboardType="number-pad" />
          <Text style={styles.logLabel}>{t('reps')}</Text>
          <TextInput style={styles.logInput} value={reps} onChangeText={setReps} keyboardType="number-pad" />
          <Pressable style={styles.actionButton} onPress={handleLogWorkout} disabled={loggingWorkout}>
            <Text style={styles.actionButtonText}>{loggingWorkout ? t('saving') : t('confirmLog')}</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>{t('instructions')}</Text>
      <Text style={styles.instructions}>
        {(lang === 'vi' ? exercise.instructions_vi : exercise.instructions_en) || t('noInstructions')}
      </Text>

      {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('secondaryMuscles')}</Text>
          <Text style={styles.instructions}>{exercise.secondary_muscles.join(', ')}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B' },
  content: { padding: 20 },
  image: {
    width: '100%', maxWidth: 500, aspectRatio: 4 / 3,
    borderRadius: 12, marginBottom: 16, backgroundColor: '#1C2340', alignSelf: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#F5F3ED', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: {
    backgroundColor: 'rgba(255,90,31,0.12)', color: '#FF5A1F',
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999,
    fontSize: 11, marginRight: 8, marginBottom: 8, overflow: 'hidden',
    textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionButton: { flex: 1, backgroundColor: '#FF5A1F', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionButtonDisabled: { backgroundColor: '#5A6690' },
  actionButtonText: { color: '#12172B', fontWeight: '800', fontSize: 13, textTransform: 'uppercase' },
  actionButtonOutline: { flex: 1, borderWidth: 1, borderColor: '#FF5A1F', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionButtonOutlineText: { color: '#FF5A1F', fontWeight: '800', fontSize: 13, textTransform: 'uppercase' },
  logForm: { backgroundColor: '#1C2340', borderRadius: 10, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2E3760' },
  logLabel: { color: '#9AA3C7', fontSize: 12, textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  logInput: { borderWidth: 1, borderColor: '#2E3760', borderRadius: 8, padding: 10, color: '#F5F3ED', backgroundColor: '#12172B', marginBottom: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: '#FF5A1F', marginTop: 16, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 1,
    borderBottomWidth: 1, borderBottomColor: '#2E3760', paddingBottom: 6,
  },
  instructions: { fontSize: 15, lineHeight: 23, color: '#D5D9EC' },
});