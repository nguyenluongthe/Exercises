import { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { adminApi } from '../api/adminApi';
import { exerciseApi } from '../api/exerciseApi';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

const EMPTY_FORM = {
  name: '', body_part: '', equipment: '', target: '',
  muscle_group: '', instructions_en: '', image: '', gif_url: '',
};

export default function AdminExercisesScreen() {
  const { t } = useLanguage();

  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseApi.listExercises({
        search: search.trim() || undefined,
        pageSize: 30,
      });
      setExercises(data.results || []);
    } catch (err) {
      console.warn('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchExercises(); }, [search]));

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (exercise) => {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name || '',
      body_part: exercise.body_part || '',
      equipment: exercise.equipment || '',
      target: exercise.target || '',
      muscle_group: exercise.muscle_group || '',
      instructions_en: exercise.instructions_en || '',
      image: exercise.image || '',
      gif_url: exercise.gif_url || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body_part.trim() || !form.equipment.trim()) {
      Alert.alert(t('error'), 'Tên bài tập, Nhóm cơ và Dụng cụ là bắt buộc');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateExercise(editingId, form);
      } else {
        await adminApi.createExercise(form);
      }
      setModalVisible(false);
      fetchExercises();
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (exercise) => {
    Alert.alert(
      t('confirmDelete'),
      `Xác nhận xóa "${exercise.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteExercise(exercise.id);
              fetchExercises();
            } catch (err) {
              Alert.alert(t('error'), err.message || 'Xóa thất bại');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchByName')}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ {t('addExercise')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>{item.body_part} · {item.equipment}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                  <Text style={styles.editBtnText}>{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteBtnText}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('noResultsFound')}</Text>}
        />
      )}

      {/* Modal Add / Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? t('editExercise') : t('addExercise')}
            </Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {['name', 'body_part', 'equipment', 'target', 'muscle_group', 'instructions_en', 'image', 'gif_url'].map((field) => (
                <View key={field} style={styles.formGroup}>
                  <Text style={styles.label}>{field}</Text>
                  <TextInput
                    style={[styles.input, field === 'instructions_en' && { height: 70 }]}
                    value={form[field]}
                    onChangeText={(val) => setForm((prev) => ({ ...prev, [field]: val }))}
                    multiline={field === 'instructions_en'}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? t('saving') : t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    height: 44,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', ...typography.bodySmall },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: { flex: 1 },
  cardTitle: { color: colors.text, ...typography.body, fontWeight: '700' },
  cardMeta: { color: colors.textSecondary, ...typography.caption, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.xs },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: { color: colors.text, ...typography.caption, fontWeight: '700' },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteBtnText: { color: colors.error, ...typography.caption, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  formGroup: { marginBottom: spacing.sm },
  label: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    color: colors.text,
    fontSize: 13,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  cancelBtnText: { color: colors.textSecondary, ...typography.bodySmall, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  saveBtnText: { color: '#FFFFFF', ...typography.bodySmall, fontWeight: '700' },
});