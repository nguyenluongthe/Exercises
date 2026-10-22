import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Dumbbell, Target } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme';
import Badge from '../common/Badge';

export default function ExerciseCard({ exercise, onPress, lang = 'vi' }) {
  const imageUrl = exercise.gif_url || exercise.image;
  const displayName = (lang === 'vi' && exercise.name_vi) ? exercise.name_vi : exercise.name;
  const secondaryName = (lang === 'vi' && exercise.name_vi) ? exercise.name : null;

  const rawScore = exercise.match_score != null
    ? exercise.match_score
    : (exercise.similarity_score != null ? exercise.similarity_score * 100 : null);
  const matchScore = rawScore != null ? Math.round(rawScore) : null;
  const matchVariant = (matchScore && matchScore >= 80) ? 'success' : (matchScore && matchScore >= 60) ? 'warning' : 'default';
  const matchLabel = lang === 'vi' ? 'Thích hợp' : 'Match';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress && onPress(exercise)}
      accessibilityRole="button"
      accessibilityLabel={`Bài tập: ${displayName}`}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Dumbbell size={28} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {displayName}
          </Text>
          {matchScore != null ? (
            <Badge
              label={`${matchScore}% ${matchLabel}`}
              variant={matchVariant}
            />
          ) : null}
        </View>

        {secondaryName ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {secondaryName}
          </Text>
        ) : null}

        <View style={styles.badgeRow}>
          <Badge label={exercise.body_part} variant="primary" />
          <Badge label={exercise.equipment} variant="default" />
          {exercise.target ? (
            <View style={styles.targetWrapper}>
              <Target size={11} color={colors.secondary} />
              <Text style={styles.targetText} numberOfLines={1}>
                {exercise.target}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  targetWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 4,
  },
  targetText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
});
