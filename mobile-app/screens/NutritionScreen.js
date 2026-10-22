import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Coffee, CheckCircle2, UtensilsCrossed, Check, RefreshCw, Apple, Utensils, Flame } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';

const INITIAL_MEALS = [
  {
    id: 'breakfast',
    title: 'Bữa Sáng (Breakfast)',
    stats: '540 kcal • 38g Pro',
    desc: 'Yến mạch sữa hạnh nhân + 1 muỗng Whey Isolate',
    done: true,
    icon: 'coffee',
  },
  {
    id: 'lunch',
    title: 'Bữa Trưa (Lunch)',
    stats: '680 kcal • 52g Pro',
    desc: '200g Ức gà nướng thảo mộc + Cơm gạo lứt + Bông cải xanh',
    done: false,
    icon: 'utensils-crossed',
  },
  {
    id: 'snack',
    title: 'Bữa Phụ (Pre-workout Snack)',
    stats: '320 kcal • 26g Pro',
    desc: 'Sinh tố việt quất hạt chia + Sữa chua Hy Lạp',
    done: false,
    icon: 'apple',
  },
  {
    id: 'dinner',
    title: 'Bữa Tối (Dinner)',
    stats: '510 kcal • 42g Pro',
    desc: '180g Cá hồi áp chảo + Khoai lang nướng + Măng tây',
    done: false,
    icon: 'utensils',
  },
];

const NutritionScreen = () => {
  const [meals, setMeals] = useState(INITIAL_MEALS);

  const toggleMealDone = (id) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'coffee':
        return <Coffee color={colors.text} size={20} />;
      case 'utensils-crossed':
        return <UtensilsCrossed color={colors.text} size={20} />;
      case 'apple':
        return <Apple color={colors.text} size={20} />;
      default:
        return <Utensils color={colors.text} size={20} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Dinh Dưỡng & Năng Lượng</Text>

        {/* Calorie Target Hero Card */}
        <View style={styles.card}>
          <View style={styles.calorieHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.chipGroupTitle}>MỤC TIÊU CALO HÔM NAY</Text>
              <Flame color={colors.primary} size={18} />
            </View>
            <Text style={styles.calorieValue}>
              1,850 <Text style={styles.calorieTarget}>/ 2,450 kcal</Text>
            </Text>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          {/* Macronutrients Grid */}
          <View style={styles.macroGrid}>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>PROTEIN</Text>
              <Text style={[styles.macroValue, { color: colors.secondary }]}>
                145<Text style={styles.macroMeta}>/180g</Text>
              </Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>CARBS</Text>
              <Text style={[styles.macroValue, { color: colors.warning }]}>
                210<Text style={styles.macroMeta}>/280g</Text>
              </Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>FATS</Text>
              <Text style={[styles.macroValue, { color: colors.primary }]}>
                48<Text style={styles.macroMeta}>/65g</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Meal List */}
        <Text style={styles.subHeader}>Thực Đơn Đề Xuất (Meal Plan)</Text>
        <View style={styles.mealList}>
          {meals.map((meal) => (
            <View
              key={meal.id}
              style={[
                styles.mealItem,
                meal.done ? styles.mealItemDone : styles.mealItemActive,
              ]}
            >
              <View style={styles.mealIconBox}>{renderIcon(meal.icon)}</View>
              <View style={styles.mealContent}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                  {meal.done ? (
                    <View style={styles.statusDone}>
                      <CheckCircle2 color={colors.success} size={14} />
                      <Text style={styles.statusDoneText}>Đã nạp</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.mealStats}>{meal.stats}</Text>
                <Text style={styles.mealDesc}>{meal.desc}</Text>

                <View style={styles.mealActions}>
                  <TouchableOpacity
                    style={[styles.btnSm, meal.done && styles.btnSmActive]}
                    onPress={() => toggleMealDone(meal.id)}
                    activeOpacity={0.8}
                  >
                    <Check color={meal.done ? '#09090B' : colors.text} size={14} />
                    <Text style={[styles.btnSmText, meal.done && styles.btnSmTextActive]}>
                      {meal.done ? 'Hoàn thành' : 'Ghi nhận'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSm} activeOpacity={0.8}>
                    <RefreshCw color={colors.textSecondary} size={14} />
                    <Text style={styles.btnSmText}>Gợi ý khác</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  sectionTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  subHeader: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calorieHeader: { alignItems: 'center', marginBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  chipGroupTitle: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1 },
  calorieValue: { ...typography.h1, fontSize: 34, color: colors.text, marginTop: 4 },
  calorieTarget: { fontSize: 16, fontWeight: '400', color: colors.textSecondary },
  progressBar: { width: '100%', height: 8, backgroundColor: colors.surfaceElevated, borderRadius: radius.full, marginTop: spacing.md, overflow: 'hidden' },
  progressFill: { width: '75%', height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  macroBox: { alignItems: 'center', flex: 1 },
  macroLabel: { ...typography.caption, fontSize: 10, color: colors.textSecondary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  macroValue: { ...typography.bodyLarge, fontWeight: '800' },
  macroMeta: { fontSize: 11, fontWeight: '400', color: colors.textSecondary },
  mealList: { gap: spacing.md },
  mealItem: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  mealItemDone: { opacity: 0.7, borderColor: colors.border },
  mealItemActive: { borderColor: colors.borderHighlight },
  mealIconBox: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  mealContent: { flex: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  mealTitle: { ...typography.body, fontWeight: '700', color: colors.text },
  mealStats: { ...typography.caption, color: colors.secondary, fontWeight: '600', marginBottom: 4 },
  mealDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  statusDone: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDoneText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  mealActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnSm: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnSmActive: { backgroundColor: colors.success, borderColor: colors.success },
  btnSmText: { color: colors.text, ...typography.caption, fontWeight: '600' },
  btnSmTextActive: { color: '#09090B', fontWeight: '800' },
});

export default NutritionScreen;
