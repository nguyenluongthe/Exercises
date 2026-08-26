import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.brandName}>NENY FETNESS</Text>
<Text style={styles.title}>{t('signUp').toUpperCase()}</Text>

      <TextInput style={styles.input} placeholder={t('name')} placeholderTextColor="#5A6690" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input} placeholder={t('email')} placeholderTextColor="#5A6690"
        value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
      />
      <TextInput
        style={styles.input} placeholder={t('passwordMin')} placeholderTextColor="#5A6690"
        value={password} onChangeText={setPassword} secureTextEntry
      />

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('creatingAccount') : t('createAccount')}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>{t('haveAccount')}</Text>
      </Pressable>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12172B', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#F5F3ED', marginBottom: 28, letterSpacing: 1, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#2E3760', borderRadius: 10, padding: 14, marginBottom: 12, backgroundColor: '#1C2340', color: '#F5F3ED', fontSize: 15 },
  button: { backgroundColor: '#FF5A1F', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#12172B', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontSize: 14 },
  error: { color: '#FF7A7A', marginBottom: 8, textAlign: 'center' },
  link: { color: '#9AA3C7', textAlign: 'center', marginTop: 20, fontSize: 14 },
  brandName: {
  fontSize: 32, fontWeight: '900', color: '#FF5A1F',
  textAlign: 'center', letterSpacing: 2, marginBottom: 4,
},
});