import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    browse: 'Browse',
browseTitle: 'Exercise Library',
searchByName: 'Search by name (English or Vietnamese)',
all: 'All',
noResultsFound: 'No exercises found.',
loadingMore: 'Loading more...',
    appTitle: 'Fitness Recommender',
    profile: 'Profile',
    inputPlaceholder: 'Describe what you want to train, in English or Vietnamese',
    getSuggestions: 'Get Suggestions',
    loading: 'Loading...',
    recommendedFor: 'Recommended for',
    noExercisesFound: 'No exercises found.',
    enterLongerDescription: 'Please enter a longer description (at least 3 characters)',
    failedToConnect: 'Failed to connect to backend',
    instructions: 'Instructions',
    secondaryMuscles: 'Secondary Muscles',
    noInstructions: 'No instructions available for this exercise.',
    saveToFavorites: 'Save to Favorites',
    saved: 'Saved',
    saving: 'Saving...',
    logWorkout: 'Log Workout',
    sets: 'Sets',
    reps: 'Reps',
    confirmLog: 'Confirm Log',
    workoutLogged: 'Workout logged!',
    success: 'Success',
    error: 'Error',
    login: 'Log In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    passwordMin: 'Password (min 6 characters)',
    name: 'Name',
    noAccount: "Don't have an account? Register",
    haveAccount: 'Already have an account? Log In',
    createAccount: 'Create Account',
    passwordTooShort: 'Password must be at least 6 characters',
    favoriteExercises: '⭐ Favorite Exercises',
    workoutHistory: '📋 Workout History',
    logOut: 'Log Out',
    noFavorites: 'No favorite exercises yet.',
    remove: 'Remove',
    noWorkoutLogs: 'No workout logs yet.',
    language: 'Language',
    detail: 'Exercise Detail',
    favoritesTitle: 'Favorites',
    historyTitle: 'Workout History',
    profileTitle: 'Profile',
    adminDashboard: 'Admin Dashboard',
adminExercises: 'Manage Exercises',
totalUsers: 'Total Users',
totalExercises: 'Total Exercises',
totalFavorites: 'Total Favorites',
totalWorkoutLogs: 'Total Workout Logs',
mostFavorited: 'Most Favorited Exercises',
addExercise: 'Add Exercise',
editExercise: 'Edit Exercise',
deleteExercise: 'Delete',
confirmDelete: 'Are you sure you want to delete this exercise?',
save: 'Save',
cancel: 'Cancel',
bodyPart: 'Body Part',
equipment: 'Equipment',
exerciseName: 'Exercise Name',
  },
  vi: {
    browse: 'Tra cứu',
browseTitle: 'Thư viện bài tập',
searchByName: 'Tìm theo tên (tiếng Anh hoặc tiếng Việt)',
all: 'Tất cả',
noResultsFound: 'Không tìm thấy bài tập nào.',
loadingMore: 'Đang tải thêm...',
    appTitle: 'Gợi Ý Bài Tập',
    profile: 'Hồ sơ',
    inputPlaceholder: 'Mô tả bài tập bạn muốn, bằng tiếng Anh hoặc tiếng Việt   ',
    getSuggestions: 'Nhận Gợi Ý',
    loading: 'Đang tải...',
    recommendedFor: 'Gợi ý cho',
    noExercisesFound: 'Không tìm thấy bài tập nào.',
    enterLongerDescription: 'Vui lòng nhập mô tả dài hơn (ít nhất 3 ký tự)',
    failedToConnect: 'Không kết nối được backend',
    instructions: 'Hướng dẫn',
    secondaryMuscles: 'Cơ phụ',
    noInstructions: 'Chưa có hướng dẫn cho bài tập này.',
    saveToFavorites: 'Lưu vào Yêu thích',
    saved: 'Đã lưu',
    saving: 'Đang lưu...',
    logWorkout: 'Ghi nhận tập luyện',
    sets: 'Số hiệp',
    reps: 'Số lần',
    confirmLog: 'Xác nhận',
    workoutLogged: 'Đã ghi nhận buổi tập!',
    success: 'Thành công',
    error: 'Lỗi',
    login: 'Đăng nhập',
    signUp: 'Đăng ký',
    email: 'Email',
    password: 'Mật khẩu',
    passwordMin: 'Mật khẩu (tối thiểu 6 ký tự)',
    name: 'Tên',
    noAccount: 'Chưa có tài khoản? Đăng ký',
    haveAccount: 'Đã có tài khoản? Đăng nhập',
    createAccount: 'Tạo tài khoản',
    passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
    favoriteExercises: '⭐ Bài tập yêu thích',
    workoutHistory: '📋 Lịch sử tập luyện',
    logOut: 'Đăng xuất',
    noFavorites: 'Chưa có bài tập yêu thích nào.',
    remove: 'Xóa',
    noWorkoutLogs: 'Chưa có lịch sử tập luyện nào.',
    language: 'Ngôn ngữ',
    detail: 'Chi Tiết Bài Tập',
    favoritesTitle: 'Yêu Thích',
    historyTitle: 'Lịch Sử Tập',
    profileTitle: 'Hồ Sơ',
    adminDashboard: 'Thống kê hệ thống',
adminExercises: 'Quản lý bài tập',
totalUsers: 'Tổng người dùng',
totalExercises: 'Tổng bài tập',
totalFavorites: 'Tổng lượt yêu thích',
totalWorkoutLogs: 'Tổng nhật ký tập',
mostFavorited: 'Bài tập được yêu thích nhất',
addExercise: 'Thêm bài tập',
editExercise: 'Sửa bài tập',
deleteExercise: 'Xóa',
confirmDelete: 'Bạn có chắc muốn xóa bài tập này?',
save: 'Lưu',
cancel: 'Hủy',
bodyPart: 'Nhóm cơ',
equipment: 'Dụng cụ',
exerciseName: 'Tên bài tập',

  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      const stored = await AsyncStorage.getItem('app_language');
      if (stored === 'en' || stored === 'vi') setLang(stored);
      setLoaded(true);
    };
    loadLang();
  }, []);

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem('app_language', newLang);
  };

  const t = (key) => translations[lang]?.[key] ?? key;

  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
