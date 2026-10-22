import {
  StyleSheet, Text, View, TextInput, Pressable,
  ActivityIndicator, FlatList, TouchableOpacity,
} from 'react-native';
import { User, Target, Dumbbell, Zap, Search, X, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDailyWorkout } from '../hooks/useDailyWorkout';
import { useExerciseSearch } from '../hooks/useExerciseSearch';
import ExerciseCard from '../components/exercise/ExerciseCard';
import QuickPromptList from '../components/exercise/QuickPromptList';
import ReadinessScoreCard from '../components/exercise/ReadinessScoreCard';
import Badge from '../components/common/Badge';
import ErrorView from '../components/common/ErrorView';
import { colors, radius, spacing, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const { dailyWorkout } = useDailyWorkout();
  const {
    description,
    setDescription,
    predictionData,
    exercises,
    loading,
    error,
    executeSearch,
    clearSearch,
  } = useExerciseSearch();

  const handleSearchSubmit = () => {
    executeSearch(description);
  };

  const handleSelectQuickPrompt = (promptQuery) => {
    setDescription(promptQuery);
    executeSearch(promptQuery);
  };

  const handleSwitchAlternate = (bodyPartName) => {
    executeSearch(description, bodyPartName);
  };

  // If no search executed, display daily workout exercises with high suitability percentage
  const displayList = exercises.length > 0
    ? exercises
    : (dailyWorkout?.exercises?.map((ex, idx) => ({
        ...ex,
        match_score: ex.match_score || (94 - idx * 2),
      })) || []);

  const renderConfidenceBadge = (confidence, level) => {
    const percent = Math.round(confidence * 100);
    const variant = (level === 'high' || percent >= 70)
      ? 'success'
      : (level === 'medium' || percent >= 45)
      ? 'warning'
      : 'default';

    return (
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>{t('aiConfidence')}:</Text>
          <Badge label={`${percent}% · ${level.toUpperCase()}`} variant={variant} />
        </View>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, Math.max(10, percent))}%`,
                backgroundColor: variant === 'success' ? colors.success : variant === 'warning' ? colors.warning : colors.error,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP FIXED SECTION: Header & Search are OUTSIDE FlatList so typing never loses focus */}
      <View style={styles.topSection}>
        {/* User Greeting & Status */}
        <View style={styles.heroHeader}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.userNameRow}>
                <User size={16} color={colors.primary} />
                <Text style={styles.greetingText} numberOfLines={1}>
                  {user?.name ? user.name : 'Neny Athlete'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                {profile?.fitness_goal ? (
                  <View style={styles.metaChip}>
                    <Target size={11} color={colors.primary} />
                    <Text style={styles.greetingSub}>{profile.fitness_goal.toUpperCase()}</Text>
                  </View>
                ) : (
                  <View style={styles.metaChip}>
                    <Zap size={11} color={colors.primary} />
                    <Text style={styles.greetingSub}>THỂ LỰC THÍCH ỨNG</Text>
                  </View>
                )}
                {profile?.available_equipment ? (
                  <View style={styles.metaChip}>
                    <Dumbbell size={11} color={colors.info} />
                    <Text style={styles.greetingSub}>{profile.available_equipment.toUpperCase()}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.readinessWidget}>
              <Text style={styles.readinessScoreVal}>
                {profile?.daily_readiness_score || 88}
              </Text>
              <Text style={styles.readinessScoreLabel}>{t('readinessScoreLabel')}</Text>
            </View>
          </View>
        </View>

        {/* Search Input Section */}
        <View style={styles.searchSection}>
          <View style={styles.inputWrapper}>
            <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('inputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoCorrect={false}
            />
            {description.length > 0 && (
              <Pressable style={styles.clearButton} onPress={clearSearch}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={handleSearchSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.actionButtonContent}>
                <Search size={15} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('getSuggestions')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Focus Prompts */}
        <QuickPromptList onSelect={handleSelectQuickPrompt} lang={lang} />
      </View>

      {/* 2. SCROLLABLE RESULTS SECTION */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => (item.id ? item.id.toString() : item.name)}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            lang={lang}
            onPress={(ex) => navigation.navigate('Detail', { exercise: ex })}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Error View */}
            {error ? <ErrorView message={error} onRetry={handleSearchSubmit} /> : null}

            {/* Daily Adaptive Routine Banner (when not searching) */}
            {!exercises.length && dailyWorkout ? (
              <ReadinessScoreCard
                workout={dailyWorkout}
                lang={lang}
                onPress={() => navigation.navigate('WorkoutTab')}
              />
            ) : null}

            {/* AI Prediction & Keywords Banner (when searching) */}
            {predictionData && (
              <View style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <View style={styles.predictionTagRow}>
                    <Sparkles size={13} color={colors.primary} />
                    <Text style={styles.predictionTag}>NHẬN DIỆN MỤC TIÊU TẬP</Text>
                  </View>
                  <Text style={styles.predictedMuscle}>
                    {predictionData.predicted_body_part.toUpperCase()}
                  </Text>
                </View>

                {renderConfidenceBadge(predictionData.confidence, predictionData.confidence_level)}

                {predictionData.interpreted_keywords && predictionData.interpreted_keywords.length > 0 ? (
                  <View style={styles.keywordsBox}>
                    <View style={styles.keywordsHeaderRow}>
                      <Search size={12} color={colors.textSecondary} />
                      <Text style={styles.keywordsTitle}>Từ khóa nhận diện được:</Text>
                    </View>
                    <View style={styles.keywordsRow}>
                      {predictionData.interpreted_keywords.map((kw, i) => (
                        <Badge key={i} label={kw} variant="info" style={{ marginBottom: 4 }} />
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Top 3 Alternative Candidates */}
                {predictionData.top_3 && predictionData.top_3.length > 1 ? (
                  <View style={styles.alternatesContainer}>
                    <Text style={styles.alternatesTitle}>Các nhóm cơ có liên quan:</Text>
                    <View style={styles.alternatesRow}>
                      {predictionData.top_3.map((cand, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.altPill,
                            cand.body_part === predictionData.predicted_body_part && styles.altPillActive,
                          ]}
                          onPress={() => handleSwitchAlternate(cand.body_part)}
                        >
                          <Text
                            style={[
                              styles.altPillText,
                              cand.body_part === predictionData.predicted_body_part && styles.altPillTextActive,
                            ]}
                          >
                            {cand.body_part} ({Math.round(cand.confidence * 100)}%)
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            <Text style={styles.sectionTitle}>
              {exercises.length > 0
                ? `${t('recommendedExercises')} (${exercises.length})`
                : 'Bài Tập Gợi Ý Trong Ngày'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSection: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroHeader: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    ...typography.h3,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  readinessWidget: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  readinessScoreVal: {
    ...typography.h3,
    color: colors.primary,
  },
  readinessScoreLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  searchSection: {
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
    zIndex: 1,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },
  listHeader: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  predictionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  predictionHeader: {
    marginBottom: spacing.md,
  },
  predictionTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  predictionTag: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  predictedMuscle: {
    ...typography.h2,
    color: colors.text,
    marginTop: 2,
  },
  confidenceContainer: {
    marginVertical: spacing.sm,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  confidenceLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  meterTrack: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  keywordsBox: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  keywordsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: spacing.xs,
  },
  keywordsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  alternatesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  alternatesTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  alternatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  altPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  altPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  altPillText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  altPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});