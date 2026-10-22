import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Play, Flame, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useDailyWorkout } from '../hooks/useDailyWorkout';
import { colors, radius, spacing, typography } from '../theme';

const WorkoutScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const { dailyWorkout, loading } = useDailyWorkout();
  const [time, setTime] = useState('45 Phút');
  const [equipment, setEquipment] = useState('Gym Đầy Đủ');

  const times = ['15 Phút', '30 Phút', '45 Phút', '60 Phút'];
  const equipments = ['Gym Đầy Đủ', 'Tại Nhà', 'Tạ Đơn'];

  const exercises = dailyWorkout?.exercises || [
    { name: 'Barbell Squat', meta: '4 Sets × 8 Reps' },
    { name: 'Romanian Deadlift', meta: '3 Sets × 10 Reps' },
    { name: 'Leg Extension', meta: '3 Sets × 12 Reps' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Bài Tập Hôm Nay</Text>

        <View style={styles.chipGroupWrapper}>
          <Text style={styles.chipGroupTitle}>Thời gian dự kiến</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipGroup}>
            {times.map((t) => (
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
          <Text style={styles.chipGroupTitle}>Dụng cụ tập luyện</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipGroup}>
            {equipments.map((e) => (
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
              {dailyWorkout ? (dailyWorkout.routine_title_vi || dailyWorkout.routine_title) : 'Chuyên Sâu Đùi & Mông'}
            </Text>
            <Flame color={colors.primary} size={20} />
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.workoutList}>
              {exercises.map((ex, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.workoutItem}
                  activeOpacity={0.8}
                  onPress={() => navigation && navigation.navigate('Detail', { exercise: ex })}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.workoutName}>{ex.name_vi || ex.name}</Text>
                    <Text style={styles.workoutMeta}>{ex.meta || `${ex.body_part || ''} · ${ex.equipment || ''}`}</Text>
                  </View>
                  <View style={styles.playBtn}>
                    <Play color="#FFFFFF" size={16} fill="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.injuryGuard}>
            <ShieldAlert color={colors.primary} size={20} />
            <View style={styles.injuryGuardTextContainer}>
              <Text style={styles.injuryGuardTitle}>Bảo vệ chấn thương</Text>
              <Text style={styles.injuryGuardDesc}>
                {profile?.avoid_injury && profile.avoid_injury !== 'none'
                  ? `AI tự động thay thế bài tập để tránh vùng chấn thương (${profile.avoid_injury}) theo hồ sơ của bạn.`
                  : 'Không phát hiện chấn thương trong hồ sơ. Bạn có thể tập toàn bộ các bài theo lộ trình.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.8}
            onPress={() => {
              if (exercises.length > 0 && navigation) {
                navigation.navigate('Detail', { exercise: exercises[0] });
              }
            }}
          >
            <Text style={styles.btnPrimaryText}>Bắt Đầu Buổi Tập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  sectionTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  chipGroupWrapper: { marginBottom: spacing.lg },
  chipGroupTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  chipGroup: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  highlightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md, marginBottom: spacing.lg },
  highlightText: { ...typography.bodyLarge, fontWeight: '700', color: colors.text },
  workoutList: { gap: spacing.md },
  workoutItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  workoutName: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 2 },
  workoutMeta: { ...typography.caption, color: colors.textSecondary },
  playBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  injuryGuard: { marginTop: spacing.md, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: colors.primary },
  injuryGuardTextContainer: { marginLeft: spacing.md, flex: 1 },
  injuryGuardTitle: { ...typography.bodySmall, fontWeight: '700', color: colors.text },
  injuryGuardDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  btnPrimary: { width: '100%', paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', marginTop: spacing.xl },
  btnPrimaryText: { color: '#FFFFFF', ...typography.body, fontWeight: '700' },
});

export default WorkoutScreen;
