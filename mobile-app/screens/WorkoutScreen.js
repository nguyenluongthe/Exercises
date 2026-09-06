import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Play, Flame, ShieldAlert } from 'lucide-react-native';
import { API_URL, useAuth } from '../context/AuthContext';

const CHIP_COLORS = {
  bg: 'transparent',
  text: '#8e8e93',
  activeBg: '#ffffff',
  activeText: '#000000',
  border: '#38383a'
};

const WorkoutScreen = () => {
  const { token, profile } = useAuth();
  const [time, setTime] = useState('45 Phút');
  const [equipment, setEquipment] = useState('Gym Đầy Đủ');
  const [dailyWorkout, setDailyWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const times = ['15 Phút', '30 Phút', '45 Phút', '60 Phút'];
  const equipments = ['Gym Đầy Đủ', 'Tại Nhà', 'Tạ Đơn'];

  useEffect(() => {
    const loadDailyAdaptiveWorkout = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/adaptive/daily-workout`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDailyWorkout(data);
        }
      } catch (err) {
        console.log('Failed to fetch daily workout:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDailyAdaptiveWorkout();
  }, [token]);

  const exercises = dailyWorkout?.exercises || [
    { name: 'Barbell Squat', meta: '4 Sets × 8 Reps' },
    { name: 'Romanian Deadlift', meta: '3 Sets × 10 Reps' },
    { name: 'Leg Extension', meta: '3 Sets × 12 Reps' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Bài Tập</Text>

        <View style={styles.chipGroupWrapper}>
          <Text style={styles.chipGroupTitle}>Thời gian</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipGroup}>
            {times.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, time === t && styles.chipActive]}
                onPress={() => setTime(t)}
              >
                <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.chipGroupWrapper}>
          <Text style={styles.chipGroupTitle}>Thiết bị</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipGroup}>
            {equipments.map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.chip, equipment === e && styles.chipActive]}
                onPress={() => setEquipment(e)}
              >
                <Text style={[styles.chipText, equipment === e && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.highlightHeader}>
            <Text style={styles.highlightText}>
              {dailyWorkout ? dailyWorkout.routine_title_vi || dailyWorkout.routine_title : 'Chuyên Sâu Đùi & Mông'}
            </Text>
            <Flame color="#ff9f0a" size={20} />
          </View>
          
          {loading ? (
            <ActivityIndicator color="#ffffff" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.workoutList}>
              {exercises.map((ex, index) => (
                <View key={index} style={styles.workoutItem}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.workoutName}>{ex.name_vi || ex.name}</Text>
                    <Text style={styles.workoutMeta}>{ex.meta || `${ex.body_part || ''} · ${ex.equipment || ''}`}</Text>
                  </View>
                  <View style={styles.playBtn}>
                    <Play color="#ffffff" size={16} fill="#ffffff" />
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.injuryGuard}>
            <ShieldAlert color="#ff9f0a" size={20} />
            <View style={styles.injuryGuardTextContainer}>
              <Text style={styles.injuryGuardTitle}>Bảo vệ chấn thương</Text>
              <Text style={styles.injuryGuardDesc}>
                {profile?.injury_history 
                  ? `AI tự động thay thế bài tập để tránh vùng ${profile.injury_history} theo hồ sơ của bạn.`
                  : 'Không phát hiện chấn thương trong hồ sơ. Bạn có thể tập toàn bộ các bài.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Bắt Đầu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#f2f2f7', marginBottom: 20 },
  chipGroupWrapper: { marginBottom: 20 },
  chipGroupTitle: { fontSize: 14, fontWeight: '500', color: '#8e8e93', marginBottom: 12 },
  chipGroup: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CHIP_COLORS.border,
    backgroundColor: CHIP_COLORS.bg,
    marginRight: 8
  },
  chipActive: { backgroundColor: CHIP_COLORS.activeBg, borderColor: CHIP_COLORS.activeBg },
  chipText: { fontSize: 14, fontWeight: '500', color: CHIP_COLORS.text },
  chipTextActive: { color: CHIP_COLORS.activeText },
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 20, marginBottom: 16 },
  highlightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#38383a', paddingBottom: 12, marginBottom: 16 },
  highlightText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  workoutList: { gap: 16 },
  workoutItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  workoutName: { fontSize: 16, fontWeight: '500', color: '#f2f2f7', marginBottom: 4 },
  workoutMeta: { fontSize: 14, color: '#8e8e93' },
  playBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2c2c2e', justifyContent: 'center', alignItems: 'center' },
  injuryGuard: { marginTop: 10, backgroundColor: 'rgba(255, 159, 10, 0.1)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start' },
  injuryGuardTextContainer: { marginLeft: 12, flex: 1 },
  injuryGuardTitle: { fontSize: 13, fontWeight: '600', color: '#f2f2f7' },
  injuryGuardDesc: { fontSize: 13, color: '#8e8e93', marginTop: 4, lineHeight: 18 },
  btnPrimary: { width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#ffffff', alignItems: 'center', marginTop: 24 },
  btnPrimaryText: { color: '#000000', fontSize: 16, fontWeight: '600' }
});

export default WorkoutScreen;
