import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function LoadingView({ message = 'Đang tải dữ liệu...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
