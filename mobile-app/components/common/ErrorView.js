import { StyleSheet, View, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import Button from './Button';

export default function ErrorView({ message, onRetry = null }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'}</Text>
      {onRetry ? (
        <Button
          title="Thử lại"
          variant="secondary"
          onPress={onRetry}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.md,
    marginVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
});
