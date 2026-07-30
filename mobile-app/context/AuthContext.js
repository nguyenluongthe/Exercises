import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

//export const API_URL = 'http://192.168.0.21:8000';// ⚠️ Sửa đúng IP máy bạn
export const API_URL = 'http://10.0.1.219:8000';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
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

  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        await logout(); // Token hết hạn hoặc không hợp lệ -> đăng xuất luôn
      }
    } catch (err) {
      console.log('Failed to fetch user:', err);
    }
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
    await AsyncStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}