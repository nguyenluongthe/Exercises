import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Badge from '../components/common/Badge';
import { colors, radius, spacing, typography } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { user, profile, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t('profileTitle')}</Text>

      {/* Account Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>{t('name')}</Text>
        <Text style={styles.value}>{user?.name || '—'}</Text>
        <Text style={styles.label}>{t('email')}</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      {/* Fitness Profile Summary */}
      {user?.role !== 'admin' && (
        <View style={styles.fitnessBox}>
          <View style={styles.fitnessBoxHeader}>
            <Text style={styles.fitnessBoxTitle}>
              ⚡ {t('fitnessScoreLabel')}: {profile?.fitness_score || 70}/100
            </Text>
            {profile?.bmi && (
              <Badge label={`BMI: ${profile.bmi}`} variant="success" />
            )}
          </View>

          <View style={styles.fitnessGrid}>
            <View style={styles.fitnessGridItem}>
              <Text style={styles.fitnessGridLabel}>🎯 {t('goalTitle')}</Text>
              <Text style={styles.fitnessGridVal} numberOfLines={1}>{profile?.fitness_goal || 'Tăng cơ'}</Text>
            </View>
            <View style={styles.fitnessGridItem}>
              <Text style={styles.fitnessGridLabel}>🏋️ {t('equipment')}</Text>
              <Text style={styles.fitnessGridVal} numberOfLines={1}>{profile?.available_equipment || 'Tạ đơn'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Onboarding', { isEditing: true })}
          >
            <Text style={styles.editProfileBtnText}>✏️ {t('editProfile')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Language Toggle */}
      <Text style={styles.label}>{t('language')}</Text>
      <View style={styles.langRow}>
        <TouchableOpacity
          style={[styles.langButton, lang === 'en' && styles.langButtonActive]}
          onPress={() => changeLanguage('en')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langButton, lang === 'vi' && styles.langButtonActive]}
          onPress={() => changeLanguage('vi')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langText, lang === 'vi' && styles.langTextActive]}>Tiếng Việt</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Shortcuts */}
      {user?.role !== 'admin' && (
        <>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.menuText}>⭐ {t('favoriteExercises')}</Text>
            <Text style={styles.menuArrow}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <Text style={styles.menuText}>🕒 {t('workoutHistory')}</Text>
            <Text style={styles.menuArrow}>➔</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>{t('logOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 60 },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fitnessBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  fitnessBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fitnessBoxTitle: { ...typography.body, fontWeight: '800', color: colors.text },
  fitnessGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  fitnessGridItem: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fitnessGridLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  fitnessGridVal: { ...typography.bodySmall, color: colors.text, fontWeight: '700', textTransform: 'capitalize' },
  editProfileBtn: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editProfileBtnText: { color: colors.primary, ...typography.bodySmall, fontWeight: '700' },
  label: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm },
  value: { ...typography.bodyLarge, color: colors.text, fontWeight: '600', marginTop: 2, marginBottom: spacing.xs },
  langRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg },
  langButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { color: colors.textSecondary, ...typography.bodySmall, fontWeight: '600' },
  langTextActive: { color: '#FFFFFF', fontWeight: '800' },
  menuItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: { ...typography.body, color: colors.text, fontWeight: '600' },
  menuArrow: { color: colors.primary, fontWeight: '700' },
  logoutButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  logoutText: { color: colors.error, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
});