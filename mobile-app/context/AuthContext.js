import { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tự động nhận diện: Trình duyệt Web dùng localhost:8000, Điện thoại Expo Go dùng IP Wi-Fi
const LOCAL_IP = '192.168.0.21';
export const API_URL = Platform.OS === 'web' ? 'http://localhost:8000' : `http://${LOCAL_IP}:8000`;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app mở lên, kiểm tra xem có token đã lưu từ lần trước không
  useEffect(() => {
    const loadStoredToken = async () => {
      const storedToken = await AsyncStorage.getItem('access_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchCurrentUser(storedToken);
      }
      setLoading(false);
    };
    loadStoredToken();
  }, []);

  const fetchProfile = async (authToken = token) => {
    if (!authToken) return null;
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const profData = await res.json();
        setProfile(profData);
        return profData;
      }
    } catch (err) {
      console.log('Failed to fetch user profile:', err);
    }
    return null;
  };

  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        await fetchProfile(authToken);
      } else {
        await logout(); // Token hết hạn hoặc không hợp lệ -> đăng xuất luôn
      }
    } catch (err) {
      console.log('Failed to fetch user:', err);
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Update profile failed');
    }

    const updated = await res.json();
    setProfile(updated);
    if (user) {
      setUser({ ...user, onboarding_completed: true, ...updated });
    }
    return updated;
  };

  const login = async (email, password) => {
    const formBody = new URLSearchParams();
    formBody.append('username', email);
    formBody.append('password', password);

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Login failed');
    }

    const data = await res.json();
    setToken(data.access_token);
    await AsyncStorage.setItem('access_token', data.access_token);
    await fetchCurrentUser(data.access_token);
  };

  const register = async (email, password, name) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Registration failed');
    }

    // Đăng ký xong, tự động đăng nhập luôn cho tiện
    await login(email, password);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    await AsyncStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ token, user, profile, loading, login, register, logout, fetchProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}