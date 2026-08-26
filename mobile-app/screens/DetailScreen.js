import { useState, useEffect } from 'react';
import {
  ScrollView, StyleSheet, Text, View, Image, Pressable,
  TextInput, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RPE_LEVELS = [
  { value: 4, label: '4 - Vừa sức', desc: 'Moderate' },
  { value: 6, label: '6 - Khá nặng', desc: 'Challenging' },
  { value: 8, label: '8 - Nặng (1-2 RIR)', desc: 'Heavy' },
  { value: 10, label: '10 - Hết sức', desc: 'Max Effort' },
];

export default function DetailScreen({ route, navigation }) {
  const { exercise } = route.params;
  const { token } = useAuth();
  const { t, lang } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [rpe, setRpe] = useState(8);
  const [loggingWorkout, setLoggingWorkout] = useState(false);

  const [substitutions, setSubstitutions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    // Tải danh sách bài tập thay thế (FR-007 SRS)
    const fetchSubstitutions = async () => {
      if (!exercise?.id) return;
      setLoadingSubs(true);
      try {
        const res = await fetch(`${API_URL}/exercises/${exercise.id}/substitutions?top_k=4`);
        if (res.ok) {
          const data = await res.json();
          setSubstitutions(data);
        }
      } catch (err) {
        console.log('Failed to fetch substitutions:', err);
      } finally {
        setLoadingSubs(false);
      }
    };
    fetchSubstitutions();
  }, [exercise?.id]);

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
          sets: parseInt(sets, 10) || 3,
          reps: parseInt(reps, 10) || 10,
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

  const getFormGuidanceTip = () => {
    const bp = (exercise.body_part || '').toLowerCase();
    if (bp.includes('chest')) return t('formTipChest');
    if (bp.includes('back')) return t('formTipBack');
    if (bp.includes('leg')) return t('formTipLegs');
    if (bp.includes('shoulder')) return t('formTipShoulders');
    return t('formTipDefault');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Exercise Image / GIF Display */}
      {exercise.gif_url ? (
        <Image source={{ uri: exercise.gif_url }} style={styles.image} resizeMode="cover" />
      ) : exercise.image ? (
        <Image source={{ uri: exercise.image }} style={styles.image} resizeMode="cover" />
      ) : null}

      <Text style={styles.title}>
        {lang === 'vi' && exercise.name_vi ? exercise.name_vi : exercise.name}
      </Text>

      {/* Meta Tags */}
      <View style={styles.tagRow}>
        <Text style={styles.tagPrimary}>{exercise.body_part}</Text>
        <Text style={styles.tagSecondary}>{exercise.equipment}</Text>
        {exercise.target ? <Text style={styles.tagTarget}>🎯 {exercise.target}</Text> : null}
      </View>

      {/* Action Buttons */}
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

      {/* Interactive Workout Logging Form (FR-006 & FR-008 SRS) */}
      {showLogForm && (
        <View style={styles.logForm}>
          <Text style={styles.logHeaderTitle}>📋 {t('logWorkout')}</Text>
          <View style={styles.logInputsRow}>
            <View style={styles.logCol}>
              <Text style={styles.logLabel}>{t('sets')}</Text>
              <TextInput style={styles.logInput} value={sets} onChangeText={setSets} keyboardType="number-pad" />
            </View>
            <View style={styles.logCol}>
              <Text style={styles.logLabel}>{t('reps')}</Text>
              <TextInput style={styles.logInput} value={reps} onChangeText={setReps} keyboardType="number-pad" />
            </View>
            <View style={styles.logCol}>
              <Text style={styles.logLabel}>{t('weightKg')}</Text>
              <TextInput style={styles.logInput} value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>
          </View>

          {/* RPE Selector */}
          <Text style={styles.logLabel}>{t('rpeScore')}:</Text>
          <View style={styles.rpeRow}>
            {RPE_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.rpeChip, rpe === item.value && styles.rpeChipActive]}
                onPress={() => setRpe(item.value)}
              >
                <Text style={[styles.rpeChipText, rpe === item.value && styles.rpeChipTextActive]}>
                  RPE {item.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Pressable style={styles.confirmButton} onPress={handleLogWorkout} disabled={loggingWorkout}>
            <Text style={styles.confirmButtonText}>
              {loggingWorkout ? t('saving') : `✓ ${t('confirmLog')}`}
            </Text>
          </Pressable>
        </View>
      )}

      {/* AI Form Guidance & Computer Vision Standard Card (Mục 6.2 SRS) */}
      <View style={styles.aiGuidanceCard}>
        <View style={styles.aiGuidanceHeader}>
          <Text style={styles.aiGuidanceTitle}>📐 {t('formGuidance')}</Text>
          <View style={styles.aiGuidanceBadge}>
            <Text style={styles.aiGuidanceBadgeText}>{t('formAccuracyTarget')}</Text>
          </View>
        </View>
        <Text style={styles.aiGuidanceBody}>{getFormGuidanceTip()}</Text>
      </View>

      {/* AI Exercise Substitutions (FR-007 SRS) */}
      <View style={styles.substitutionsSection}>
        <Text style={styles.sectionTitle}>🔄 {t('substitutionsTitle')}</Text>
        {loadingSubs ? (
          <ActivityIndicator color="#FF5A1F" size="small" style={{ marginVertical: 10 }} />
        ) : substitutions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subsScroll}>
            {substitutions.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.subCard}
                activeOpacity={0.8}
                onPress={() => navigation.push('Detail', { exercise: sub })}
              >
                {sub.image || sub.gif_url ? (
                  <Image source={{ uri: sub.gif_url || sub.image }} style={styles.subImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.subImage, styles.subImagePlaceholder]}>
                    <Text style={{ fontSize: 20 }}>🏋️</Text>
                  </View>
                )}
                <View style={styles.subContent}>
                  <Text style={styles.subTitle} numberOfLines={1}>
                    {lang === 'vi' && sub.name_vi ? sub.name_vi : sub.name}
                  </Text>
                  <Text style={styles.subEquipment}>{sub.equipment}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noSubsText}>{t('noSubstitutions')}</Text>
        )}
      </View>

      {/* Execution Instructions */}
      <Text style={styles.sectionTitle}>📖 {t('instructions')}</Text>
      <Text style={styles.instructions}>
        {(lang === 'vi' ? exercise.instructions_vi : exercise.instructions_en) || t('noInstructions')}
      </Text>

      {/* Secondary Muscles */}
      {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>💪 {t('secondaryMuscles')}</Text>
          <Text style={styles.instructions}>{exercise.secondary_muscles.join(', ')}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1322',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#171D36',
    borderWidth: 1,
    borderColor: '#263056',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F5F3ED',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tagPrimary: {
    backgroundColor: 'rgba(255, 90, 31, 0.15)',
    color: '#FF5A1F',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagSecondary: {
    backgroundColor: '#1E2749',
    color: '#9AA3C7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  tagTarget: {
    backgroundColor: '#202A4E',
    color: '#00E599',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF5A1F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#5A6690',
  },
  actionButtonText: {
    color: '#12172B',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF5A1F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 31, 0.08)',
  },
  actionButtonOutlineText: {
    color: '#FF5A1F',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logForm: {
    backgroundColor: '#161D36',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2E3B68',
  },
  logHeaderTitle: {
    color: '#F5F3ED',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  logInputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  logCol: {
    flex: 1,
  },
  logLabel: {
    color: '#9AA3C7',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  logInput: {
    borderWidth: 1,
    borderColor: '#2E3760',
    borderRadius: 8,
    padding: 8,
    color: '#F5F3ED',
    backgroundColor: '#0F1322',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  rpeChip: {
    backgroundColor: '#1E2749',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#344172',
  },
  rpeChipActive: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
  },
  rpeChipText: {
    color: '#9AA3C7',
    fontSize: 11,
    fontWeight: '700',
  },
  rpeChipTextActive: {
    color: '#12172B',
  },
  confirmButton: {
    backgroundColor: '#00E599',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0F1322',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiGuidanceCard: {
    backgroundColor: '#131A30',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 153, 0.3)',
  },
  aiGuidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiGuidanceTitle: {
    color: '#00E599',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiGuidanceBadge: {
    backgroundColor: 'rgba(0, 229, 153, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  aiGuidanceBadgeText: {
    color: '#00E599',
    fontSize: 10,
    fontWeight: '700',
  },
  aiGuidanceBody: {
    color: '#D5D9EC',
    fontSize: 12,
    lineHeight: 18,
  },
  substitutionsSection: {
    marginBottom: 16,
  },
  subsScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  subCard: {
    width: 140,
    backgroundColor: '#161D36',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#263056',
  },
  subImage: {
    width: '100%',
    height: 75,
    backgroundColor: '#1E2749',
  },
  subImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subContent: {
    padding: 8,
  },
  subTitle: {
    color: '#F5F3ED',
    fontSize: 11,
    fontWeight: '700',
  },
  subEquipment: {
    color: '#7E8BB6',
    fontSize: 10,
    marginTop: 2,
  },
  noSubsText: {
    color: '#7E8BB6',
    fontSize: 12,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF5A1F',
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 22,
    color: '#D5D9EC',
    marginBottom: 12,
  },
});