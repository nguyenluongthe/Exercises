import { Platform } from 'react-native';

/**
 * Cấu hình địa chỉ Backend API.
 * Mặc định:
 * - Web: http://localhost:8000
 * - Android Emulator: http://10.0.2.2:8000
 * - Thiết bị thật (Expo Go): Địa chỉ IP Wi-Fi
 */
const DEFAULT_LOCAL_IP = '192.168.0.23'; // IP Wi-Fi hiện tại của máy tính

export const getBaseApiUrl = () => {
  // 1. Chạy trên trình duyệt Web (Chrome/Edge/Firefox)
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // 2. Chạy trên điện thoại thật (qua Expo Go) hoặc máy ảo
  // Lưu ý: 
  // - Điện thoại thật (Expo Go): Dùng IP Wi-Fi của máy tính (ví dụ: 192.168.0.23)
  // - Máy ảo Android Studio (AVD): Nếu không vào được mạng, đổi thành 'http://10.0.2.2:8000'
  // - Máy ảo iOS Simulator (Mac): Dùng 'http://localhost:8000'
  return `http://${DEFAULT_LOCAL_IP}:8000`;
};

export const API_URL = getBaseApiUrl();
