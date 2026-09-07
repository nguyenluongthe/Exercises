import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.brandName}>NENY FITNESS</Text>
              <Text style={styles.title}>{t('login').toUpperCase()}</Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input} 
                placeholder={t('email')} 
                placeholderTextColor="#A1A1AA"
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input} 
                placeholder={t('password')} 
                placeholderTextColor="#A1A1AA"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry
              />

              {error !== '' && <Text style={styles.error}>{error}</Text>}

              <Pressable 
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled
                ]} 
                onPress={handleLogin} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#09090B" />
                ) : (
                  <Text style={styles.buttonText}>{t('login')}</Text>
                )}
              </Pressable>

              <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
                <Text style={styles.linkText}>{t('noAccount')} <Text style={styles.linkHighlight}>{t('signUp')}</Text></Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09090B' },
  container: { flex: 1, backgroundColor: '#09090B' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 },
  headerContainer: { marginBottom: 40, alignItems: 'center' },
  brandName: {
    fontSize: 34, 
    fontWeight: '900', 
    color: '#FF4500', // Vibrant OrangeRed
    textAlign: 'center', 
    letterSpacing: 2, 
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#FAFAFA', letterSpacing: 3, textAlign: 'center' },
  formContainer: { width: '100%', gap: 16 },
  input: { 
    borderWidth: 1, 
    borderColor: '#27272A', 
    borderRadius: 12, 
    padding: 16, 
    backgroundColor: '#18181B', 
    color: '#FAFAFA', 
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: { 
    backgroundColor: '#FF4500', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#09090B', fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 15 },
  error: { color: '#EF4444', textAlign: 'center', fontSize: 14, fontWeight: '500' },
  linkContainer: { marginTop: 24, padding: 8, alignItems: 'center' },
  linkText: { color: '#A1A1AA', fontSize: 14 },
  linkHighlight: { color: '#FF4500', fontWeight: '700' },
});
