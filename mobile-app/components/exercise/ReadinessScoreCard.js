import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Activity, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme';
import Badge from '../common/Badge';

export default function ReadinessScoreCard({ workout, onPress, lang = 'vi' }) {
  if (!workout) return null;

  const score = workout.readiness_score || 88;
  const isOptimal = score >= 80;
  const isModerate = score >= 60 && score < 80;

  const scoreColor = isOptimal ? colors.success : isModerate ? colors.warning : colors.error;
  const scoreGlow = isOptimal ? colors.successLight : isModerate ? colors.warningLight : colors.errorLight;

  const title = (lang === 'vi' && workout.routine_title_vi)
    ? workout.routine_title_vi
    : workout.routine_title;

  const status = (lang === 'vi' && workout.readiness_status_vi)
    ? workout.readiness_status_vi
    : workout.readiness_status;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Readiness Score ${score}`}
    >
      <View style={styles.topRow}>
        <View style={styles.info}>
          <View style={styles.badgeRow}>
            <Activity size={13} color={colors.primary} />
            <Text style={styles.badgeText}>LỘ TRÌNH THỂ LỰC HÔM NAY</Text>
            <View style={[styles.statusDot, { backgroundColor: scoreColor }]} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.status}>{status}</Text>
        </View>

        <View style={[styles.scoreRing, { borderColor: scoreColor, backgroundColor: scoreGlow }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
          <Text style={styles.scoreLabel}>READINESS</Text>
        </View>
      </View>

      <View style={styles.biometricRow}>
        <View style={styles.bioChip}>
          <Text style={styles.bioChipLabel}>HRV STATUS</Text>
          <Text style={[styles.bioChipVal, { color: colors.secondary }]}>OPTIMAL</Text>
        </View>
        <View style={styles.bioChip}>
          <Text style={styles.bioChipLabel}>TRAINING LOAD</Text>
          <Text style={[styles.bioChipVal, { color: colors.primary }]}>MODERATE</Text>
        </View>
        <View style={styles.bioChip}>
          <Text style={styles.bioChipLabel}>TARGET BODY</Text>
          <Text style={styles.bioChipVal}>{workout.target_body_parts ? workout.target_body_parts[0] : 'UPPER'}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Badge
          label={`${workout.exercises ? workout.exercises.length : 5} BÀI TẬP ĐỀ XUẤT`}
          variant="primary"
        />
        <View style={styles.ctaWrapper}>
          <Text style={styles.ctaText}>Bắt đầu buổi tập</Text>
          <ChevronRight size={15} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderHighlight,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    paddingRight: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  status: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  scoreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    ...typography.h2,
    lineHeight: 26,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  biometricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioChip: {
    flex: 1,
    alignItems: 'center',
  },
  bioChipLabel: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bioChipVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  ctaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  ctaArrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
