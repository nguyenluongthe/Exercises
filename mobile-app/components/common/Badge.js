import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export default function Badge({ label, variant = 'default', style, textStyle }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
          text: { color: colors.primary },
        };
      case 'success':
        return {
          container: { backgroundColor: colors.successLight, borderColor: colors.success },
          text: { color: colors.success },
        };
      case 'warning':
        return {
          container: { backgroundColor: colors.warningLight, borderColor: colors.warning },
          text: { color: colors.warning },
        };
      case 'info':
        return {
          container: { backgroundColor: colors.infoLight, borderColor: colors.info },
          text: { color: colors.info },
        };
      default:
        return {
          container: { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          text: { color: colors.textSecondary },
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <View style={[styles.badge, vStyles.container, style]}>
      <Text style={[styles.text, vStyles.text, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
