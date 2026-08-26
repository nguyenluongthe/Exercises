import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function OnboardingScreen({ navigation, route }) {
  const { profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const isEditing = route?.params?.isEditing || false;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '24');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [height, setHeight] = useState(profile?.height ? String(profile.height) : '172');
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : '68');
  const [goal, setGoal] = useState(profile?.fitness_goal || 'muscle_gain');
  const [level, setLevel] = useState(profile?.experience_level || 'beginner');
  const [equipment, setEquipment] = useState(profile?.available_equipment || 'dumbbell');
  const [injury, setInjury] = useState(profile?.avoid_injury || 'none');

  // Real-time BMI calculation
  const bmiInfo = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return { bmi: null, category: '' };
    const hm = h / 100;
    const bmiVal = +(w / (hm * hm)).toFixed(1);
    let cat = 'Normal';
    let color = '#00E599';
    if (bmiVal < 18.5) {
      cat = 'Underweight';
      color = '#38BDF8';
    } else if (bmiVal < 24.9) {
      cat = 'Normal / Fit';
      color = '#00E599';
    } else if (bmiVal < 29.9) {
      cat = 'Overweight';
      color = '#F59E0B';
    } else {
      cat = 'Obese';
      color = '#EF4444';
    }
    return { bmi: bmiVal, category: cat, color };
  }, [height, weight]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const a = parseInt(age, 10);
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (!a || a < 10 || a > 100) {
        setError('Vui lòng nhập tuổi hợp lệ (10 - 100)');
        return;
      }
      if (!h || h < 80 || h > 250) {
        setError('Vui lòng nhập chiều cao hợp lệ (80 - 250 cm)');
        return;
      }
      if (!w || w < 25 || w > 250) {
        setError('Vui lòng nhập cân nặng hợp lệ (25 - 250 kg)');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await updateProfile({
        age: parseInt(age, 10),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        fitness_goal: goal,
        experience_level: level,
        available_equipment: equipment,
        avoid_injury: injury,
        onboarding_completed: true,
      });

      if (isEditing) {
        navigation.goBack();
      } else {
        // App.js will naturally show MainTabs because onboarding_completed = true
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTag}>NENY FETNESS · AI ONBOARDING</Text>
          <Text style={styles.title}>{t('onboardingTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboardingSubtitle')}</Text>

          {/* Step Progress Bar */}
          <View style={styles.stepBar}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepSegment,
                  step >= s && styles.stepSegmentActive,
                  step === s && styles.stepSegmentCurrent,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepLabel}>
            {step === 1 ? t('step1Title') : step === 2 ? t('step2Title') : t('step3Title')}
          </Text>
        </View>

        {error !== '' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* STEP 1: BODY METRICS */}
        {step === 1 && (
          <View style={styles.card}>
            {/* Gender Selector */}
            <Text style={styles.fieldLabel}>{t('genderLabel')}</Text>
            <View style={styles.rowChoices}>
              <Pressable
                style={[styles.choiceBtn, gender === 'male' && styles.choiceBtnActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.choiceText, gender === 'male' && styles.choiceTextActive]}>
                  👨 {t('male')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.choiceBtn, gender === 'female' && styles.choiceBtnActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.choiceText, gender === 'female' && styles.choiceTextActive]}>
                  👩 {t('female')}
                </Text>
              </Pressable>
            </View>

            {/* Age */}
            <Text style={styles.fieldLabel}>{t('ageLabel')}</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="24"
              placeholderTextColor="#5A6690"
            />

            {/* Height & Weight */}
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>{t('heightLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="172"
                  placeholderTextColor="#5A6690"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.fieldLabel}>{t('weightLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="68"
                  placeholderTextColor="#5A6690"
                />
              </View>
            </View>

            {/* BMI Real-Time Card */}
            {bmiInfo.bmi && (
              <View style={[styles.bmiCard, { borderColor: bmiInfo.color }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bmiTitle}>{t('calculatedBmi')}</Text>
                  <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>
                    {bmiInfo.category}
                  </Text>
                </View>
                <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>{bmiInfo.bmi}</Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: GOALS & LEVEL */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>{t('goalTitle')}</Text>
            <View style={styles.verticalChoices}>
              {[
                { key: 'muscle_gain', label: t('goalMuscleGain'), desc: 'Tăng khối lượng cơ bắp & độ nét' },
                { key: 'weight_loss', label: t('goalWeightLoss'), desc: 'Đốt mỡ thừa & săn chắc vóc dáng' },
                { key: 'endurance', label: t('goalEndurance'), desc: 'Nâng cao sức chịu đựng & tim mạch' },
                { key: 'recovery', label: t('goalRecovery'), desc: 'Giãn cơ, giảm đau mỏi & tăng độ dẻo' },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.goalOption, goal === item.key && styles.goalOptionActive]}
                  onPress={() => setGoal(item.key)}
                >
                  <Text style={[styles.goalOptionText, goal === item.key && styles.goalOptionTextActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.goalOptionDesc}>{item.desc}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>{t('experienceTitle')}</Text>
            <View style={styles.verticalChoices}>
              {[
                { key: 'beginner', label: t('beginner') },
                { key: 'intermediate', label: t('intermediate') },
                { key: 'advanced', label: t('advanced') },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.levelOption, level === item.key && styles.levelOptionActive]}
                  onPress={() => setLevel(item.key)}
                >
                  <Text style={[styles.levelOptionText, level === item.key && styles.levelOptionTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: EQUIPMENT & INJURIES */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>{t('equipmentTitle')}</Text>
            <View style={styles.verticalChoices}>
              {[
                { key: 'body_weight', label: t('equipBodyweight') },
                { key: 'dumbbell', label: t('equipDumbbell') },
                { key: 'full_gym', label: t('equipFullGym') },
                { key: 'bands', label: t('equipBands') },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.levelOption, equipment === item.key && styles.levelOptionActive]}
                  onPress={() => setEquipment(item.key)}
                >
                  <Text style={[styles.levelOptionText, equipment === item.key && styles.levelOptionTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>{t('injuryTitle')}</Text>
            <View style={styles.verticalChoices}>
              {[
                { key: 'none', label: t('injuryNone') },
                { key: 'knee', label: t('injuryKnee') },
                { key: 'lower_back', label: t('injuryBack') },
                { key: 'shoulder', label: t('injuryShoulder') },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.levelOption, injury === item.key && styles.levelOptionActive]}
                  onPress={() => setInjury(item.key)}
                >
                  <Text style={[styles.levelOptionText, injury === item.key && styles.levelOptionTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {step > 1 && (
            <Pressable style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.backBtnText}>◀ {t('prevStep')}</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.nextBtn, step === 1 && { flex: 1 }]}
            onPress={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#0F1322" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step === 3 ? t('finishOnboarding') : t('nextStep')}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1322',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  brandTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF5A1F',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#8A99AD',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  stepBar: {
    flexDirection: 'row',
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E2640',
    marginVertical: 10,
  },
  stepSegment: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 3,
    backgroundColor: '#1E2640',
  },
  stepSegmentActive: {
    backgroundColor: '#FF5A1F',
  },
  stepSegmentCurrent: {
    backgroundColor: '#00E599',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00E599',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#171D36',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#252F52',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C7D2E3',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F1322',
    borderWidth: 1,
    borderColor: '#2A365D',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  rowChoices: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  choiceBtn: {
    flex: 1,
    backgroundColor: '#0F1322',
    borderWidth: 1,
    borderColor: '#2A365D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  choiceBtnActive: {
    backgroundColor: '#252F52',
    borderColor: '#FF5A1F',
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A99AD',
  },
  choiceTextActive: {
    color: '#FF5A1F',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  bmiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1322',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  bmiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A99AD',
  },
  bmiCategory: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  verticalChoices: {
    gap: 10,
  },
  goalOption: {
    backgroundColor: '#0F1322',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A365D',
    marginBottom: 8,
  },
  goalOptionActive: {
    borderColor: '#00E599',
    backgroundColor: '#132832',
  },
  goalOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  goalOptionTextActive: {
    color: '#00E599',
  },
  goalOptionDesc: {
    fontSize: 12,
    color: '#8A99AD',
  },
  levelOption: {
    backgroundColor: '#0F1322',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A365D',
    marginBottom: 6,
  },
  levelOptionActive: {
    borderColor: '#FF5A1F',
    backgroundColor: '#2A2027',
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  levelOptionTextActive: {
    color: '#FF5A1F',
    fontWeight: '800',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A365D',
    backgroundColor: '#171D36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#8A99AD',
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
    backgroundColor: '#FF5A1F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#0F1322',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  errorBanner: {
    backgroundColor: '#451A1A',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
});
