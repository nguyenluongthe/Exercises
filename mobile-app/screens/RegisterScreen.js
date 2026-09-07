import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
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
              <Text style={styles.title}>{t('signUp').toUpperCase()}</Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput 
                style={styles.input} 
                placeholder={t('name')} 
                placeholderTextColor="#A1A1AA" 
                value={name} 
                onChangeText={setName} 
              />
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
                placeholder={t('passwordMin')} 
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
                onPress={handleRegister} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#09090B" />
                ) : (
                  <Text style={styles.buttonText}>{t('createAccount')}</Text>
                )}
              </Pressable>

              <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
                <Text style={styles.linkText}>{t('haveAccount')} <Text style={styles.linkHighlight}>{t('login')}</Text></Text>
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
    color: '#FF4500', 
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