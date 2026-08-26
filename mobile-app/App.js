import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import BrowseScreen from './screens/BrowseScreen';
import DetailScreen from './screens/DetailScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminExercisesScreen from './screens/AdminExercisesScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const userScreenOptions = {
  headerStyle: { backgroundColor: '#12172B' },
  headerTintColor: '#F5F3ED',
  headerTitleStyle: { fontWeight: '700', letterSpacing: 0.5 },
};

const adminScreenOptions = {
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTintColor: '#1E293B',
  headerTitleStyle: { fontWeight: '700', letterSpacing: 0.5 },
};

function TabIcon({ symbol, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>;
}

// Bộ tab dành cho người dùng thường
function UserTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        ...userScreenOptions,
        tabBarStyle: { backgroundColor: '#1C2340', borderTopColor: '#2E3760' },
        tabBarActiveTintColor: '#FF5A1F',
        tabBarInactiveTintColor: '#9AA3C7',
      }}
    >
      <Tab.Screen
        name="BrowseTab"
        component={BrowseScreen}
        options={{
          title: t('browseTitle').toUpperCase(),
          tabBarLabel: t('browse'),
          tabBarIcon: ({ focused }) => <TabIcon symbol="📚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: t('appTitle').toUpperCase(),
          tabBarLabel: t('getSuggestions'),
          tabBarIcon: ({ focused }) => <TabIcon symbol="✨" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: t('profileTitle').toUpperCase(),
          tabBarLabel: t('profile'),
          tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Bộ tab RIÊNG dành cho Admin — hoàn toàn khác, không có Tra cứu/AI/Yêu thích
function AdminTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        ...adminScreenOptions,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{
          title: t('adminDashboard').toUpperCase(),
          tabBarLabel: t('adminDashboard'),
          tabBarIcon: ({ focused }) => <TabIcon symbol="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AdminExercisesTab"
        component={AdminExercisesScreen}
        options={{
          title: t('adminExercises').toUpperCase(),
          tabBarLabel: t('adminExercises'),
          tabBarIcon: ({ focused }) => <TabIcon symbol="🛠️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={ProfileScreen}
        options={{
          title: t('profileTitle').toUpperCase(),
          tabBarLabel: t('profile'),
          tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#12172B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FF5A1F" size="large" />
      </View>
    );
  }

  const isAdmin = user?.role === 'admin';
  const needsOnboarding = token && !isAdmin && user?.onboarding_completed === false;

  return (
    <Stack.Navigator screenOptions={isAdmin ? adminScreenOptions : userScreenOptions}>
      {token ? (
        isAdmin ? (
          // Đăng nhập bằng Admin -> chỉ thấy 3 tab: Thống kê / Quản lý bài tập / Hồ sơ
          <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
        ) : needsOnboarding ? (
          // Người dùng mới chưa hoàn tất khảo sát thể lực -> mở Onboarding
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        ) : (
          // Người dùng thường đã có hồ sơ -> 3 tab: Tra cứu / Gợi ý / Hồ sơ, cùng các màn hình phụ
          <>
            <Stack.Screen name="MainTabs" component={UserTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'EXERCISE DETAIL' }} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'FAVORITES' }} />
            <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ title: 'WORKOUT HISTORY' }} />
          </>
        )
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