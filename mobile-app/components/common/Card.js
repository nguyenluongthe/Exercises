import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export default function Card({ children, style, elevated = false, borderHighlight = false }) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        borderHighlight && styles.borderHighlight,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  borderHighlight: {
    borderColor: colors.primary,
  },
});
