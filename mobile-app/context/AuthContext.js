import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { API_URL } from '../api/config';

// Re-export API_URL để đảm bảo tính tương thích ngược cho các component cũ
export { API_URL };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app khởi động, kiểm tra xem có token đã lưu từ lần trước không
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('access_token');
        if (storedToken) {
          setToken(storedToken);
          await loadUserAndProfile();
        }
      } catch (err) {
        console.warn('Failed to load stored auth token:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const loadUserAndProfile = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      const profData = await authApi.getProfile();
      setProfile(profData);
      return { user: userData, profile: profData };
    } catch (err) {
      console.warn('Failed to fetch user or profile:', err);
      if (err.status === 401) {
        await logout();
      }
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      const profData = await authApi.getProfile();
      setProfile(profData);
      return profData;
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    const updated = await authApi.updateProfile(profileData);
    setProfile(updated);
    if (user) {
      setUser({ ...user, onboarding_completed: true, ...updated });
    }
    return updated;
  };

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    await AsyncStorage.setItem('access_token', data.access_token);
    await loadUserAndProfile();
    return data;
  };

  const register = async (email, password, name) => {
    await authApi.register(email, password, name);
    // Tự động đăng nhập sau khi đăng ký thành công
    return await login(email, password);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (e) {
      console.warn('Error removing token:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}