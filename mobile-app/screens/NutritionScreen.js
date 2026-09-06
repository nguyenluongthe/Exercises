import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Coffee, CheckCircle2, UtensilsCrossed, Check, RefreshCw, Apple, Utensils } from 'lucide-react-native';

const NutritionScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Dinh Dưỡng & Bữa Ăn</Text>

        <View style={styles.card}>
          <View style={styles.calorieHeader}>
            <Text style={styles.chipGroupTitle}>Mục Tiêu Calo Hôm Nay</Text>
            <Text style={styles.calorieValue}>1,850 <Text style={styles.calorieTarget}>/ 2,450 kcal</Text></Text>
            
            <View style={styles.progressBar}>
              <View style={styles.progressFill}></View>
            </View>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>145<Text style={styles.macroMeta}>/180g</Text></Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>210<Text style={styles.macroMeta}>/280g</Text></Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>48<Text style={styles.macroMeta}>/65g</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.mealList}>
          {/* Breakfast */}
          <View style={[styles.mealItem, styles.mealItemDone]}>
            <View style={styles.mealIconBox}><Coffee color="#f2f2f7" size={20} /></View>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>Bữa Sáng</Text>
                <View style={styles.statusDone}>
                  <CheckCircle2 color="#30d158" size={14} />
                  <Text style={styles.statusDoneText}>Đã ăn</Text>
                </View>
              </View>
              <Text style={styles.mealStats}>540 kcal • 38g Pro</Text>
              <Text style={styles.mealDesc}>Yến mạch sữa hạnh nhân + 1 muỗng Whey</Text>
            </View>
          </View>

          {/* Lunch */}
          <View style={[styles.mealItem, styles.mealItemActive]}>
            <View style={styles.mealIconBox}><UtensilsCrossed color="#f2f2f7" size={20} /></View>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>Bữa Trưa</Text>
              </View>
              <Text style={[styles.mealStats, { color: '#30d158' }]}>680 kcal • 52g Pro</Text>
              <Text style={styles.mealDesc}>200g Ức gà nướng thảo mộc + Cơm gạo lứt</Text>
              
              <View style={styles.mealActions}>
                <TouchableOpacity style={styles.btnSm}>
                  <Check color="#f2f2f7" size={14} />
                  <Text style={styles.btnSmText}>Ghi nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSm}>
                  <RefreshCw color="#f2f2f7" size={14} />
                  <Text style={styles.btnSmText}>Đổi món</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Snack */}
          <View style={styles.mealItem}>
            <View style={styles.mealIconBox}><Apple color="#f2f2f7" size={20} /></View>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>Bữa Phụ</Text>
              </View>
              <Text style={styles.mealStats}>320 kcal • 26g Pro</Text>
              <Text style={styles.mealDesc}>Sinh tố việt quất hạt chia + Sữa chua Hy Lạp</Text>
            </View>
          </View>

          {/* Dinner */}
          <View style={styles.mealItem}>
            <View style={styles.mealIconBox}><Utensils color="#f2f2f7" size={20} /></View>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>Bữa Tối</Text>
              </View>
              <Text style={styles.mealStats}>510 kcal • 42g Pro</Text>
              <Text style={styles.mealDesc}>180g Cá hồi áp chảo + Khoai lang + Măng tây</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#f2f2f7', marginBottom: 20 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 20, marginBottom: 16 },
  calorieHeader: { alignItems: 'center', marginBottom: 20 },
  chipGroupTitle: { fontSize: 14, fontWeight: '500', color: '#8e8e93', marginBottom: 8 },
  calorieValue: { fontSize: 32, fontWeight: '700', color: '#f2f2f7' },
  calorieTarget: { fontSize: 16, fontWeight: '400', color: '#8e8e93' },
  progressBar: { width: '100%', height: 6, backgroundColor: '#2c2c2e', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  progressFill: { width: '75%', height: '100%', backgroundColor: '#30d158', borderRadius: 999 },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#38383a', paddingTop: 20 },
  macroBox: { alignItems: 'center', flex: 1 },
  macroLabel: { fontSize: 12, color: '#8e8e93', fontWeight: '500', marginBottom: 4 },
  macroValue: { fontSize: 16, fontWeight: '600', color: '#f2f2f7' },
  macroMeta: { fontSize: 12, fontWeight: '400', color: '#8e8e93' },
  mealList: { gap: 16, marginTop: 10 },
  mealItem: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: 'transparent' },
  mealItemDone: { opacity: 0.6 },
  mealItemActive: { borderColor: '#38383a' },
  mealIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#2c2c2e', justifyContent: 'center', alignItems: 'center' },
  mealContent: { flex: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mealTitle: { fontWeight: '600', fontSize: 15, color: '#f2f2f7' },
  mealStats: { fontSize: 13, color: '#8e8e93', marginBottom: 4 },
  mealDesc: { fontSize: 14, color: '#8e8e93', lineHeight: 20 },
  statusDone: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDoneText: { color: '#30d158', fontSize: 12, fontWeight: '500' },
  mealActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnSm: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#38383a', backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnSmText: { color: '#f2f2f7', fontSize: 13, fontWeight: '500' }
});

export default NutritionScreen;
