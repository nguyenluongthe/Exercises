import { useState, useEffect } from 'react';
import {
  ScrollView, StyleSheet, Text, View, Image, Pressable,
  TextInput, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Bookmark, ClipboardList, Check, Sliders, RefreshCw, BookOpen, Dumbbell, Target } from 'lucide-react-native';
import { exerciseApi } from '../api/exerciseApi';
import { favoriteApi } from '../api/favoriteApi';
import { workoutApi } from '../api/workoutApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Badge from '../components/common/Badge';
import { colors, radius, spacing, typography } from '../theme';

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
    const fetchSubstitutions = async () => {
      if (!exercise?.id) return;
      setLoadingSubs(true);
      try {
        const data = await exerciseApi.getSubstitutions(exercise.id, 4);
        setSubstitutions(data || []);
      } catch (err) {
        console.warn('Failed to fetch substitutions:', err);
      } finally {
        setLoadingSubs(false);
      }
    };
    fetchSubstitutions();
  }, [exercise?.id]);

  const handleSaveFavorite = async () => {
    if (!token) {
      Alert.alert(t('error'), 'Vui lòng đăng nhập để lưu bài tập');
      return;
    }
    setSaving(true);
    try {
      await favoriteApi.addFavorite(exercise.id, exercise.name);
      setSaved(true);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogWorkout = async () => {
    if (!token) {
      Alert.alert(t('error'), 'Vui lòng đăng nhập để ghi nhận bài tập');
      return;
    }
    setLoggingWorkout(true);
    try {
      await workoutApi.logWorkout({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: parseInt(sets, 10) || 3,
        reps: parseInt(reps, 10) || 10,
      });
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
      {/* Exercise Image / GIF */}
      {exercise.gif_url ? (
        <Image source={{ uri: exercise.gif_url }} style={styles.image} resizeMode="cover" />
      ) : exercise.image ? (
        <Image source={{ uri: exercise.image }} style={styles.image} resizeMode="cover" />
      ) : null}

      <Text style={styles.title}>
        {lang === 'vi' && exercise.name_vi ? exercise.name_vi : exercise.name}
      </Text>

      {/* Meta Badges */}
      <View style={styles.tagRow}>
        <Badge label={exercise.body_part} variant="primary" />
        <Badge label={exercise.equipment} variant="default" />
        {exercise.target ? (
          <View style={styles.targetBadge}>
            <Target size={12} color={colors.secondary} />
            <Text style={styles.targetBadgeText}>{exercise.target}</Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, saved && styles.actionButtonDisabled]}
          onPress={handleSaveFavorite}
          disabled={saving || saved}
          activeOpacity={0.8}
        >
          <View style={styles.btnContentRow}>
            <Bookmark size={15} color="#09090B" />
            <Text style={styles.actionButtonText}>
              {saved ? t('saved') : saving ? t('saving') : t('saveToFavorites')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonOutline}
          onPress={() => setShowLogForm(!showLogForm)}
          activeOpacity={0.8}
        >
          <View style={styles.btnContentRow}>
            <ClipboardList size={15} color={colors.text} />
            <Text style={styles.actionButtonOutlineText}>{t('logWorkout')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Log Form Modal / Inline Box */}
      {showLogForm && (
        <View style={styles.logForm}>
          <View style={styles.headerIconRow}>
            <ClipboardList size={16} color={colors.primary} />
            <Text style={styles.logHeaderTitle}>{t('logWorkout')}</Text>
          </View>
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

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleLogWorkout}
            disabled={loggingWorkout}
            activeOpacity={0.8}
          >
            <View style={styles.btnContentRow}>
              <Check size={16} color="#09090B" />
              <Text style={styles.confirmButtonText}>
                {loggingWorkout ? t('saving') : t('confirmLog')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Form Guidance Card */}
      <View style={styles.aiGuidanceCard}>
        <View style={styles.aiGuidanceHeader}>
          <View style={styles.headerIconRow}>
            <Sliders size={15} color={colors.primary} />
            <Text style={styles.aiGuidanceTitle}>{t('formGuidance')}</Text>
          </View>
          <Badge label={t('formAccuracyTarget')} variant="success" />
        </View>
        <Text style={styles.aiGuidanceBody}>{getFormGuidanceTip()}</Text>
      </View>

      {/* Alternative Substitutions */}
      <View style={styles.substitutionsSection}>
        <View style={styles.headerIconRow}>
          <RefreshCw size={15} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t('substitutionsTitle')}</Text>
        </View>
        {loadingSubs ? (
          <ActivityIndicator color={colors.primary} size="small" style={{ marginVertical: 10 }} />
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
                    <Dumbbell size={20} color={colors.textMuted} />
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
      <View style={styles.headerIconRow}>
        <BookOpen size={15} color={colors.primary} />
        <Text style={styles.sectionTitle}>{t('instructions')}</Text>
      </View>
      <Text style={styles.instructions}>
        {(lang === 'vi' ? exercise.instructions_vi : exercise.instructions_en) || t('noInstructions')}
      </Text>

      {/* Secondary Muscles */}
      {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.headerIconRow}>
            <Dumbbell size={15} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('secondaryMuscles')}</Text>
          </View>
          <Text style={styles.instructions}>{exercise.secondary_muscles.join(', ')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 60 },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    ...typography.caption,
    textTransform: 'uppercase',
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  actionButtonOutlineText: {
    color: colors.primary,
    fontWeight: '700',
    ...typography.caption,
    textTransform: 'uppercase',
  },
  logForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logHeaderTitle: {
    color: colors.text,
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  logInputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  logCol: {
    flex: 1,
  },
  logLabel: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: 4,
  },
  logInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rpeChip: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rpeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rpeChipText: {
    color: colors.textSecondary,
    ...typography.caption,
    fontWeight: '700',
  },
  rpeChipTextActive: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    ...typography.bodySmall,
  },
  aiGuidanceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiGuidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aiGuidanceTitle: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiGuidanceBody: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    lineHeight: 18,
  },
  substitutionsSection: {
    marginBottom: spacing.lg,
  },
  subsScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  subCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subImage: {
    width: '100%',
    height: 75,
    backgroundColor: colors.surfaceElevated,
  },
  subImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subContent: {
    padding: spacing.xs + 2,
  },
  subTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  subEquipment: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  noSubsText: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  instructions: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});