import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profileTitle')}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>{t('name')}</Text>
        <Text style={styles.value}>{user?.name || '—'}</Text>
        <Text style={styles.label}>{t('email')}</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

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
            <Text style={styles.menuText}>⭐ {t('favoriteExercises')}</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('WorkoutHistory')}>
            <Text style={styles.menuText}>📋 {t('workoutHistory')}</Text>
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
  infoBox: { backgroundColor: '#1C2340', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2E3760' },
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