import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { token, loading } = useAuth();
  const { t } = useLanguage();

  const screenOptions = {
    headerStyle: { backgroundColor: '#12172B' },
    headerTintColor: '#F5F3ED',
    headerTitleStyle: { fontWeight: '700', letterSpacing: 0.5 },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#12172B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FF5A1F" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {token ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('appTitle').toUpperCase() }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: t('detail').toUpperCase() }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: t('profileTitle').toUpperCase() }} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('favoritesTitle').toUpperCase() }} />
          <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ title: t('historyTitle').toUpperCase() }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}