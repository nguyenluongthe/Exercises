import { StyleSheet, Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { Flame, Dumbbell, Zap, Target, Activity, Sparkles } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme';

export const QUICK_PROMPTS = [
  { id: 'chest', labelVi: 'Ngực', labelEn: 'Chest', queryVi: 'tập ngực với tạ đơn', queryEn: 'chest workout with dumbbell', icon: Flame },
  { id: 'back', labelVi: 'Lưng xô', labelEn: 'Back/Lats', queryVi: 'tập lưng xô kéo xà tại nhà', queryEn: 'back and lats workout at home', icon: Dumbbell },
  { id: 'arms', labelVi: 'Tay trước/sau', labelEn: 'Arms/Biceps', queryVi: 'độ bắp tay trước và tay sau', queryEn: 'biceps and triceps workout', icon: Zap },
  { id: 'abs', labelVi: 'Bụng 6 múi', labelEn: 'Abs/Core', queryVi: 'gập bụng siết mỡ 6 múi tại nhà', queryEn: 'abs core sixpack workout', icon: Target },
  { id: 'legs', labelVi: 'Chân mông', labelEn: 'Legs/Glutes', queryVi: 'gánh tạ phát triển cơ đùi và mông', queryEn: 'squats for legs and glutes', icon: Activity },
  { id: 'cardio', labelVi: 'Cardio đốt mỡ', labelEn: 'Cardio Fat Burn', queryVi: 'cardio hiit đốt mỡ toàn thân', queryEn: 'cardio hiit fat burning', icon: Flame },
  { id: 'bodyweight', labelVi: 'Không cần tạ', labelEn: 'Bodyweight', queryVi: 'chống đẩy và bài tập không cần tạ tại nhà', queryEn: 'bodyweight home workout', icon: Sparkles },
  { id: 'dumbbell', labelVi: 'Tạ đơn', labelEn: 'Dumbbell', queryVi: 'bài tập toàn thân với tạ đơn', queryEn: 'full body dumbbell workout', icon: Dumbbell },
];

export default function QuickPromptList({ onSelect, lang = 'vi' }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QUICK_PROMPTS.map((prompt) => {
        const label = lang === 'vi' ? prompt.labelVi : prompt.labelEn;
        const query = lang === 'vi' ? prompt.queryVi : prompt.queryEn;
        const IconComponent = prompt.icon;
        return (
          <TouchableOpacity
            key={prompt.id}
            style={styles.chip}
            activeOpacity={0.8}
            onPress={() => onSelect && onSelect(query)}
          >
            <IconComponent size={13} color={colors.primary} />
            <Text style={styles.chipText}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
});
