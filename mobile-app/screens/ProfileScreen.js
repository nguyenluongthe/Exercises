import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
  const { user, profile, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profileTitle')}</Text>

      {/* Account Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>{t('name')}</Text>
        <Text style={styles.value}>{user?.name || '—'}</Text>
        <Text style={styles.label}>{t('email')}</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      {/* Fitness Profile Summary (FR-002, FR-004 SRS) */}
      {user?.role !== 'admin' && (
        <View style={styles.fitnessBox}>
          <View style={styles.fitnessBoxHeader}>
            <Text style={styles.fitnessBoxTitle}>⚡ {t('fitnessScoreLabel')}: {profile?.fitness_score || 70}/100</Text>
            {profile?.bmi && (
              <Text style={styles.bmiBadge}>BMI: {profile.bmi}</Text>
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

          <Pressable
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('Onboarding', { isEditing: true })}
          >
            <Text style={styles.editProfileBtnText}>✏️ {t('editProfile')}</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.label}>{t('language')}</Text>
      <View style={styles.langRow}>
        <Pressable
          style={[styles.langButton, lang === 'en' && styles.langButtonActive]}
          onPress={() => changeLanguage('en')}
        >
          <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>English</Text>
        </Pressable>
        <Pressable
          style={[styles.langButton, lang === 'vi' && styles.langButtonActive]}
          onPress={() => changeLanguage('vi')}
        >
          <Text style={[styles.langText, lang === 'vi' && styles.langTextActive]}>Tiếng Việt</Text>
        </Pressable>
      </View>

      {user?.role !== 'admin' && (
        <>
          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.menuText}>  {t('favoriteExercises')}</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('WorkoutHistory')}>
            <Text style={styles.menuText}>{t('workoutHistory')}</Text>
          </Pressable>
        </>
      )}

      

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>{t('logOut')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B', padding: 20, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#F5F3ED', marginBottom: 20, letterSpacing: 1 },
  infoBox: { backgroundColor: '#1C2340', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2E3760' },
  fitnessBox: { backgroundColor: '#171D36', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#252F52' },
  fitnessBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fitnessBoxTitle: { fontSize: 14, fontWeight: '800', color: '#00E599' },
  bmiBadge: { backgroundColor: 'rgba(0, 229, 153, 0.12)', color: '#00E599', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, fontSize: 12, fontWeight: '700' },
  fitnessGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  fitnessGridItem: { flex: 1, backgroundColor: '#0F1322', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#252F52' },
  fitnessGridLabel: { fontSize: 11, color: '#8A99AD', marginBottom: 4, fontWeight: '600' },
  fitnessGridVal: { fontSize: 13, color: '#FFFFFF', fontWeight: '700', textTransform: 'capitalize' },
  editProfileBtn: { backgroundColor: '#252F52', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#3B487A' },
  editProfileBtnText: { color: '#FF5A1F', fontSize: 13, fontWeight: '800' },
  label: { fontSize: 11, color: '#9AA3C7', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  value: { fontSize: 16, color: '#F5F3ED', fontWeight: '600', marginTop: 2 },
  langRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 24 },
  langButton: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#2E3760',
  },
  langButtonActive: { backgroundColor: '#FF5A1F', borderColor: '#FF5A1F' },
  langText: { color: '#9AA3C7', fontWeight: '600' },
  langTextActive: { color: '#12172B' },
  menuItem: {
    backgroundColor: '#1C2340', borderRadius: 10, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2E3760',
  },
  menuText: { fontSize: 15, color: '#F5F3ED', fontWeight: '600' },
  logoutButton: {
    marginTop: 24, backgroundColor: 'rgba(255,90,31,0.12)',
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  logoutText: { color: '#FF5A1F', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontSize: 14 },
});