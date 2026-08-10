import { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList, Pressable,
  ActivityIndicator, Modal, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, API_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const EMPTY_FORM = {
  name: '', body_part: '', equipment: '', target: '',
  muscle_group: '', instructions_en: '', image: '', gif_url: '',
};

export default function AdminExercisesScreen() {
  const { token } = useAuth();
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
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      params.append('page_size', 30);
      const res = await fetch(`${API_URL}/exercises?${params.toString()}`);
      const data = await res.json();
      setExercises(data.results);
    } catch (err) {
      console.log('Failed to fetch exercises:', err);
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
      Alert.alert(t('error'), 'Name, Body Part, Equipment are required');
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `${API_URL}/admin/exercises/${editingId}`
        : `${API_URL}/admin/exercises`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Save failed');
      }

      setModalVisible(false);
      fetchExercises();
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (exercise) => {
    Alert.alert(t('deleteExercise'), t('confirmDelete'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteExercise'),
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_URL}/admin/exercises/${exercise.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            setExercises((prev) => prev.filter((e) => e.id !== exercise.id));
          } catch (err) {
            Alert.alert(t('error'), err.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSubtitle}>{item.body_part} · {item.equipment}</Text>
      </View>
      <Pressable style={styles.iconButton} onPress={() => openEditModal(item)}>
        <Text style={styles.iconButtonText}>✎</Text>
      </Pressable>
      <Pressable style={[styles.iconButton, styles.iconButtonDanger]} onPress={() => handleDelete(item)}>
        <Text style={styles.iconButtonText}>✕</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchByName')}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#4F46E5" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList data={exercises} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingId ? t('editExercise') : t('addExercise')}
              </Text>

              <Text style={styles.fieldLabel}>{t('exerciseName')} *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
              />

              <Text style={styles.fieldLabel}>{t('bodyPart')} *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.body_part}
                onChangeText={(v) => setForm({ ...form, body_part: v })}
                placeholder="chest, back, upper legs..."
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.fieldLabel}>{t('equipment')} *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.equipment}
                onChangeText={(v) => setForm({ ...form, equipment: v })}
                placeholder="dumbbell, barbell, body weight..."
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.fieldLabel}>Target</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.target}
                onChangeText={(v) => setForm({ ...form, target: v })}
              />

              <Text style={styles.fieldLabel}>Instructions</Text>
              <TextInput
                style={[styles.fieldInput, { height: 90, textAlignVertical: 'top' }]}
                value={form.instructions_en}
                onChangeText={(v) => setForm({ ...form, instructions_en: v })}
                multiline
              />

              <Text style={styles.fieldLabel}>Image URL</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.image}
                onChangeText={(v) => setForm({ ...form, image: v })}
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  <Text style={styles.saveButtonText}>{saving ? '...' : t('save')}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB', paddingTop: 16, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    padding: 12, backgroundColor: '#FFFFFF', color: '#1E293B', fontSize: 14,
  },
  addButton: {
    width: 46, height: 46, borderRadius: 10, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0',
  },
  rowTitle: { color: '#1E293B', fontSize: 14, fontWeight: '700' },
  rowSubtitle: { color: '#64748B', fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
  iconButton: {
    width: 34, height: 34, borderRadius: 8, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  iconButtonDanger: { backgroundColor: '#FEF2F2' },
  iconButtonText: { color: '#1E293B', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  fieldLabel: { color: '#64748B', fontSize: 12, textTransform: 'uppercase', marginBottom: 4, marginTop: 10 },
  fieldInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10,
    color: '#1E293B', backgroundColor: '#F8FAFC',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  cancelButton: {
    flex: 1, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center',
  },
  cancelButtonText: { color: '#64748B', fontWeight: '700' },
  saveButton: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800' },
});