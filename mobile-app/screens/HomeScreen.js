import { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, Pressable,
  ActivityIndicator, FlatList, Image, TouchableOpacity, ScrollView,
} from 'react-native';
import { API_URL, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const QUICK_PROMPTS = [
  { labelVi: '🔥 Ngực', labelEn: '🔥 Chest', queryVi: 'tập ngực với tạ đơn', queryEn: 'chest workout with dumbbell' },
  { labelVi: '🏋️ Lưng xô', labelEn: '🏋️ Back/Lats', queryVi: 'tập lưng xô kéo xà tại nhà', queryEn: 'back and lats workout at home' },
  { labelVi: '🦾 Tay trước/sau', labelEn: '🦾 Arms/Biceps', queryVi: 'độ bắp tay trước và tay sau', queryEn: 'biceps and triceps workout' },
  { labelVi: '⚡ Bụng 6 múi', labelEn: '⚡ Abs/Core', queryVi: 'gập bụng siết mỡ 6 múi tại nhà', queryEn: 'abs core sixpack workout' },
  { labelVi: '🦵 Chân mông', labelEn: '🦵 Legs/Glutes', queryVi: 'gánh tạ phát triển cơ đùi và mông', queryEn: 'squats for legs and glutes' },
  { labelVi: '🏃 Cardio đốt mỡ', labelEn: '🏃 Cardio Fat Burn', queryVi: 'cardio hiit đốt mỡ toàn thân', queryEn: 'cardio hiit fat burning' },
  { labelVi: '🏠 Không tạ (Home)', labelEn: '🏠 Bodyweight', queryVi: 'chống đẩy và bài tập không cần tạ tại nhà', queryEn: 'bodyweight home workout' },
  { labelVi: '🏋️ Tạ đơn (Dumbbell)', labelEn: '🏋️ Dumbbell', queryVi: 'bài tập toàn thân với tạ đơn', queryEn: 'full body dumbbell workout' },
];

export default function HomeScreen({ navigation }) {
  const { token, user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const [description, setDescription] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [dailyWorkout, setDailyWorkout] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tải buổi tập đề xuất thích nghi hôm nay dựa trên hồ sơ người dùng
  useEffect(() => {
    const loadDailyAdaptiveWorkout = async () => {
      if (!token) return;
      setDailyLoading(true);
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
        setDailyLoading(false);
      }
    };
    loadDailyAdaptiveWorkout();
  }, [token, profile?.fitness_goal, profile?.available_equipment]);

  const executeSearch = async (textToSearch, filterBodyPart = null) => {
    if (textToSearch.trim().length < 3) {
      setError(t('enterLongerDescription'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Gọi API Predict phân loại nhóm cơ & đo độ tin cậy
      const predictRes = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSearch }),
      });
      if (!predictRes.ok) throw new Error(`Predict failed: ${predictRes.status}`);
      const pred = await predictRes.json();
      setPredictionData(pred);

      // 2. Gọi API Recommend lấy danh sách bài tập khớp nhất
      const targetBodyPart = filterBodyPart || pred.predicted_body_part;
      const recommendRes = await fetch(`${API_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSearch,
          body_part: filterBodyPart ? filterBodyPart : undefined,
          top_k: 6,
        }),
      });
      if (!recommendRes.ok) throw new Error(`Recommend failed: ${recommendRes.status}`);
      const recData = await recommendRes.json();
      setExercises(recData.results);
    } catch (err) {
      console.log('Error detail:', err);
      setError(`${t('failedToConnect')}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    executeSearch(description);
  };

  const handleSelectQuickPrompt = (prompt) => {
    const text = lang === 'vi' ? prompt.queryVi : prompt.queryEn;
    setDescription(text);
    executeSearch(text);
  };

  const handleSwitchAlternate = (bodyPartName) => {
    if (predictionData) {
      setPredictionData((prev) => ({ ...prev, predicted_body_part: bodyPartName }));
    }
    executeSearch(description, bodyPartName);
  };

  const renderConfidenceBadge = (confidence, level) => {
    const percent = Math.round(confidence * 100);
    let badgeColor = '#00E599'; // High
    let levelText = t('confidenceHigh');

    if (level === 'medium' || (percent >= 45 && percent < 70)) {
      badgeColor = '#F59E0B'; // Medium
      levelText = t('confidenceMedium');
    } else if (level === 'low' || percent < 45) {
      badgeColor = '#EF4444'; // Low
      levelText = t('confidenceLow');
    }

    return (
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>{t('aiConfidence')}:</Text>
          <View style={[styles.confidencePill, { borderColor: badgeColor, backgroundColor: `${badgeColor}15` }]}>
            <View style={[styles.confidenceDot, { backgroundColor: badgeColor }]} />
            <Text style={[styles.confidenceValue, { color: badgeColor }]}>{percent}% · {levelText}</Text>
          </View>
        </View>

        {/* Confidence Progress Meter */}
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.min(100, Math.max(10, percent))}%`, backgroundColor: badgeColor }]} />
        </View>
      </View>
    );
  };

  const renderExercise = ({ item }) => {
    const matchScore = item.match_score || Math.round((item.similarity_score || 0.5) * 100);
    const isHighMatch = matchScore >= 80;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Detail', { exercise: item })}
      >
        {item.image || item.gif_url ? (
          <Image source={{ uri: item.gif_url || item.image }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.cardImagePlaceholderText}>🏋️</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {lang === 'vi' && item.name_vi ? item.name_vi : item.name}
            </Text>
            <View style={[styles.matchBadge, isHighMatch ? styles.matchBadgeHigh : styles.matchBadgeMedium]}>
              <Text style={[styles.matchBadgeText, isHighMatch ? styles.matchTextHigh : styles.matchTextMedium]}>
                {matchScore}% {t('match')}
              </Text>
            </View>
          </View>

          <View style={styles.cardMetaRow}>
            <Text style={styles.cardPill}>{item.body_part}</Text>
            <Text style={styles.cardPillSecondary}>{item.equipment}</Text>
          </View>

          {item.target ? (
            <Text style={styles.cardTarget} numberOfLines={1}>
              🎯 {item.target}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* User Greeting & AI Readiness Bar */}
      <View style={styles.heroHeader}>
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>
              👋 {user?.name ? `${user.name}` : 'Neny Athlete'}
            </Text>
            <Text style={styles.greetingSub}>
              {profile?.fitness_goal ? `🎯 ${profile.fitness_goal.toUpperCase()}` : '⚡ ADAPTIVE FITNESS'}
              {profile?.available_equipment ? ` · 🏋️ ${profile.available_equipment.toUpperCase()}` : ''}
            </Text>
          </View>

          {/* Readiness Gauge Widget */}
          <View style={styles.readinessWidget}>
            <Text style={styles.readinessScoreVal}>
              {profile?.daily_readiness_score || 88}
            </Text>
            <Text style={styles.readinessScoreLabel}>{t('readinessScoreLabel')}</Text>
          </View>
        </View>

        <View style={styles.aiStatusBadge}>
          <View style={styles.aiStatusPulse} />
          <Text style={styles.aiStatusText}>{t('aiAccuracy')}</Text>
        </View>
      </View>

      {/* Input Prompt Section */}
      <View style={styles.searchSection}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('inputPlaceholder')}
            placeholderTextColor="#5A6690"
            value={description}
            onChangeText={setDescription}
            multiline={false}
            returnKeyType="search"
            onSubmitEditing={handlePress}
          />
          {description.length > 0 && (
            <Pressable style={styles.clearButton} onPress={() => { setDescription(''); setPredictionData(null); setExercises([]); }}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.actionButton} onPress={handlePress} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#12172B" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>⚡ {t('getSuggestions')}</Text>
          )}
        </Pressable>
      </View>

      {/* Quick Focus Chips */}
      <View style={styles.quickSection}>
        <Text style={styles.quickTitle}>{t('quickPrompts')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
          {QUICK_PROMPTS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickChip}
              onPress={() => handleSelectQuickPrompt(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickChipText}>{lang === 'vi' ? item.labelVi : item.labelEn}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {/* TODAY'S ADAPTIVE WORKOUT (Hiển thị khi chưa tìm kiếm) */}
      {!predictionData && dailyWorkout && dailyWorkout.exercises && dailyWorkout.exercises.length > 0 && (
        <View style={styles.dailyRoutineSection}>
          <View style={styles.dailyRoutineHeader}>
            <View>
              <Text style={styles.dailyRoutineTag}>⚡ AI DAILY ROUTINE</Text>
              <Text style={styles.dailyRoutineTitle}>
                {lang === 'vi' && dailyWorkout.routine_title_vi ? dailyWorkout.routine_title_vi : dailyWorkout.routine_title}
              </Text>
            </View>
            <View style={styles.dailyStatusBadge}>
              <Text style={styles.dailyStatusText}>
                {lang === 'vi' ? dailyWorkout.readiness_status_vi : dailyWorkout.readiness_status}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* AI Prediction & Explainability Card */}
      {predictionData && (
        <View style={styles.aiInsightsCard}>
          <View style={styles.aiInsightsHeader}>
            <Text style={styles.aiInsightsTitle}>🤖 {t('recommendedFor')}:</Text>
            <Text style={styles.aiPredictedMuscle}>{predictionData.predicted_body_part.toUpperCase()}</Text>
          </View>

          {/* Confidence Meter Bar */}
          {renderConfidenceBadge(predictionData.confidence, predictionData.confidence_level)}

          {/* Identified Keywords / AI Explainability */}
          {predictionData.interpreted_keywords && predictionData.interpreted_keywords.length > 0 && (
            <View style={styles.keywordsBlock}>
              <Text style={styles.keywordsHeader}>💡 {t('identifiedKeywords')}:</Text>
              <View style={styles.keywordsRow}>
                {predictionData.interpreted_keywords.map((kw, idx) => (
                  <View key={idx} style={styles.keywordTag}>
                    <Text style={styles.keywordTagText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* One-tap Switch for Top 3 Muscle Alternates */}
          {predictionData.top_3 && predictionData.top_3.length > 1 && (
            <View style={styles.alternatesBlock}>
              <Text style={styles.alternatesHeader}>🔄 {t('alternativeSuggestions')}:</Text>
              <View style={styles.alternatesRow}>
                {predictionData.top_3
                  .filter((item) => item.body_part !== predictionData.predicted_body_part)
                  .map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.alternateBtn}
                      onPress={() => handleSwitchAlternate(item.body_part)}
                    >
                      <Text style={styles.alternateBtnText}>
                        👉 {item.body_part} ({Math.round(item.confidence * 100)}%)
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}

          {/* Low Confidence Clarification Tip */}
          {predictionData.clarification_needed && (
            <View style={styles.clarificationBox}>
              <Text style={styles.clarificationText}>ℹ️ {t('clarificationTip')}</Text>
            </View>
          )}
        </View>
      )}

      {/* Suggested Exercises List */}
      <FlatList
        style={styles.list}
        data={exercises.length > 0 ? exercises : (!predictionData && dailyWorkout?.exercises ? dailyWorkout.exercises : [])}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExercise}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && predictionData ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('noExercisesFound')}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  heroHeader: {
    marginBottom: 14,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  readinessWidget: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30d158',
  },
  readinessScoreVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#30d158',
  },
  readinessScoreLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
  },
  dailyRoutineSection: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38383a',
    marginBottom: 12,
  },
  dailyRoutineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyRoutineTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  dailyRoutineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dailyStatusBadge: {
    backgroundColor: 'rgba(0, 229, 153, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 153, 0.3)',
  },
  dailyStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#30d158',
  },
  aiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38383a',
    alignSelf: 'flex-start',
  },
  aiStatusPulse: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#30d158',
    marginRight: 6,
  },
  aiStatusText: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  searchSection: {
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#38383a',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    paddingRight: 40,
    backgroundColor: '#1c1c1e',
    color: '#f2f2f7',
    fontSize: 14,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  clearButtonText: {
    color: '#9AA3C7',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
    letterSpacing: 0.5,
    fontSize: 14,
  },
  quickSection: {
    marginBottom: 14,
  },
  quickTitle: {
    color: '#7E8BB6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quickScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#38383a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  quickChipText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '500',
  },
  aiInsightsCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#38383a',
  },
  aiInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiInsightsTitle: {
    color: '#9AA3C7',
    fontSize: 13,
    fontWeight: '700',
  },
  aiPredictedMuscle: {
    color: '#FF5A1F',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    marginBottom: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  confidenceLabel: {
    color: '#9AA3C7',
    fontSize: 12,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  confidenceValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  meterTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#263056',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  keywordsBlock: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#263056',
  },
  keywordsHeader: {
    color: '#7E8BB6',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keywordTag: {
    backgroundColor: '#1E2749',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#344172',
  },
  keywordTagText: {
    color: '#00E599',
    fontSize: 11,
    fontWeight: '600',
  },
  alternatesBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#263056',
  },
  alternatesHeader: {
    color: '#7E8BB6',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  alternatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alternateBtn: {
    backgroundColor: '#1C2442',
    borderWidth: 1,
    borderColor: '#FF5A1F',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  alternateBtnText: {
    color: '#FF7A47',
    fontSize: 11,
    fontWeight: '700',
  },
  clarificationBox: {
    marginTop: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  clarificationText: {
    color: '#F59E0B',
    fontSize: 11,
    lineHeight: 16,
  },
  list: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#38383a',
  },
  cardImage: {
    width: 90,
    height: 90,
    backgroundColor: '#1E2749',
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#F5F3ED',
    marginRight: 6,
  },
  matchBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  matchBadgeHigh: {
    backgroundColor: 'rgba(0, 229, 153, 0.12)',
    borderColor: 'rgba(0, 229, 153, 0.4)',
  },
  matchBadgeMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  matchTextHigh: {
    color: '#00E599',
  },
  matchTextMedium: {
    color: '#F59E0B',
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  cardPill: {
    backgroundColor: '#202A4E',
    color: '#9AA3C7',
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  cardPillSecondary: {
    backgroundColor: '#1C2340',
    color: '#7E8BB6',
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  cardTarget: {
    color: '#FF5A1F',
    fontSize: 11,
    fontWeight: '600',
  },
  error: {
    color: '#FF7A7A',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  emptyText: {
    color: '#9AA3C7',
    fontSize: 13,
  },
});