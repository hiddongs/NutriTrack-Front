// ============================================================
// screens/HomeScreen.tsx
// Nutri-Track — 메인 홈 화면 (Expo Router 버전)
//
// 핵심 변경점:
//   기존: ({ navigation }: HomeScreenProps) — navigation prop 사용
//   변경: props 없이 router import해서 사용
//
//   왜 더 좋냐면:
//   → 어떤 컴포넌트에서든 router를 import만 하면 화면 이동 가능
//   → props로 전달할 필요 없어서 코드가 깔끔해짐 (prop drilling 제거)
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─────────────────────────────────────────────
// 📐 타입 정의
// ─────────────────────────────────────────────
type NutrientData = {
  current: number;
  target: number;
};

type MealData = {
  id: string;
  type: string;
  emoji: string;
  bgColor: string;
  foods: string | null;
  calorie: number;
  logged: boolean;
};

type TodayData = {
  totalCalorie: number;
  carb: NutrientData;
  protein: NutrientData;
  fat: NutrientData;
  meals: MealData[];
};

type UserData = {
  name: string;
  targetCalorie: number;
};

// ─────────────────────────────────────────────
// 더미 데이터 (API 연동 전 임시)
// ─────────────────────────────────────────────

const DUMMY_USER: UserData = {
  name: "김민준",
  targetCalorie: 2000,
};

const DUMMY_TODAY: TodayData = {
  totalCalorie: 1320,
  carb: { current: 142, target: 250 },
  protein: { current: 58, target: 120 },
  fat: { current: 34, target: 65 },
  meals: [
    {
      id: "1",
      type: "아침",
      emoji: "🌅",
      bgColor: "#E6F1FB",
      foods: "닭가슴살 샐러드, 바나나",
      calorie: 420,
      logged: true,
    },
    {
      id: "2",
      type: "점심",
      emoji: "☀️",
      bgColor: "#E1F5EE",
      foods: "현미밥, 된장찌개, 나물",
      calorie: 620,
      logged: true,
    },
    {
      id: "3",
      type: "저녁",
      emoji: "🌙",
      bgColor: "#FAECE7",
      foods: "고구마, 달걀 2개",
      calorie: 280,
      logged: true,
    },
    {
      id: "4",
      type: "간식",
      emoji: "🍎",
      bgColor: "#F9F1FB",
      foods: null,
      calorie: 0,
      logged: false,
    },
  ],
};

// ============================================================
// 🧩 서브 컴포넌트
// ============================================================
type CalorieCardProps = {
  current: number;
  target: number;
};

function CalorieCard({ current, target }: CalorieCardProps) {
  const progress = Math.min(current / target, 1);
  const remaining = Math.max(target - current, 0);
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.calorieCard}>
      <View style={styles.calorieRow}>
        <View>
          <Text style={styles.calorieLabel}>섭취 칼로리</Text>
          <View style={styles.calorieNumRow}>
            <Text style={styles.calorieNum}>{current.toLocaleString()}</Text>
            <Text style={styles.calorieUnit}> kcal</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.calorieLabel}>목표</Text>
          <View style={styles.calorieNumRow}>
            <Text style={styles.calorieGoalNum}>{target.toLocaleString()}</Text>
            <Text style={styles.calorieUnit}> kcal</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabelText}>
          남은 칼로리 {remaining.toLocaleString()} kcal
        </Text>
        <Text style={styles.progressLabelText}>{percent}%</Text>
      </View>
    </View>
  );
}

type NutrientBarProps = {
  label: string;
  current: number;
  target: number;
  color: string;
};

function NutrientBar({ label, current, target, color }: NutrientBarProps) {
  const progress = Math.min(current / target, 1);
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.nutrientCard}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>
        {current}
        <Text style={styles.nutrientUnit}>g</Text>
      </Text>
      <View style={styles.nutrientBarBg}>
        <View
          style={[
            styles.nutrientBarFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.nutrientPercent}>{percent}%</Text>
    </View>
  );
}

type MealCardProps = {
  meal: MealData;
  onPress: () => void;
};

function MealCard({ meal, onPress }: MealCardProps) {
  if (!meal.logged) {
    return (
      <TouchableOpacity
        style={[styles.mealCard, styles.mealCardEmpty]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.mealIcon, { backgroundColor: meal.bgColor }]}>
          <Text style={styles.mealEmoji}>{meal.emoji}</Text>
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealType}>{meal.type}</Text>
          <Text style={styles.mealEmpty}>아직 기록이 없어요</Text>
        </View>
        <View style={styles.addIconCircle}>
          <Text style={styles.addIcon}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.mealIcon, { backgroundColor: meal.bgColor }]}>
        <Text style={styles.mealEmoji}>{meal.emoji}</Text>
      </View>
      <View style={styles.mealInfo}>
        <Text style={styles.mealType}>{meal.type}</Text>
        <Text style={styles.mealFoods} numberOfLines={1}>
          {meal.foods}
        </Text>
      </View>
      <Text style={styles.mealCalorie}>{meal.calorie} kcal</Text>
    </TouchableOpacity>
  );
}

// ============================================================
// 🧩 메인 컴포넌트 — props 없음 (Expo Router)
// ============================================================
export default function HomeScreen() {
  const [loading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>(DUMMY_USER);
  const [todayData, setTodayData] = useState<TodayData>(DUMMY_TODAY);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const decoded = jwtDecode<{ sub: string }>(token);
      const userId = decoded.sub;

      const userResponse = await fetch(
        `http://localhost:8080/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const userData = await userResponse.json(); // ← 이게 없어요!

      const dietResponse = await fetch(
        // ← 이것도 없어요!
        `http://localhost:8080/api/diet/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const dietData = await dietResponse.json();

      setUserData({ name: userData.name, targetCalorie: 2000 });

      const todayDate = new Date().toISOString().split("T")[0];
      const todayRecords = dietData.filter(
        (record: any) => record.date === todayDate,
      );

      const totalCalorie = todayRecords.reduce(
        (sum: number, record: any) => sum + record.calorie,
        0,
      );
      const totalCarb = todayRecords.reduce(
        (sum: number, record: any) => sum + record.carb,
        0,
      );
      const totalProtein = todayRecords.reduce(
        (sum: number, record: any) => sum + record.protein,
        0,
      );
      const totalFat = todayRecords.reduce(
        (sum: number, record: any) => sum + record.fat,
        0,
      );

      setTodayData((prev) => ({
        ...prev,
        totalCalorie,
        carb: { ...prev.carb, current: totalCarb },
        protein: { ...prev.protein, current: totalProtein },
        fat: { ...prev.fat, current: totalFat },
      }));
    } catch (error) {
      console.error(error);
    }
  };
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요 👋</Text>
            <Text style={styles.username}>{userData.name}님</Text>
          </View>
          <View>
            <Text style={styles.dateText}>{today}</Text>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.avatarText}>{userData.name.charAt(0)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 칼로리 카드 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 칼로리</Text>
          <CalorieCard
            current={todayData.totalCalorie}
            target={userData.targetCalorie}
          />
        </View>

        {/* ── 영양소 현황 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>영양소 현황</Text>
          <View style={styles.nutrientGrid}>
            <NutrientBar
              label="탄수화물"
              current={todayData.carb.current}
              target={todayData.carb.target}
              color="#185FA5"
            />
            <NutrientBar
              label="단백질"
              current={todayData.protein.current}
              target={todayData.protein.target}
              color="#1D9E75"
            />
            <NutrientBar
              label="지방"
              current={todayData.fat.current}
              target={todayData.fat.target}
              color="#D85A30"
            />
          </View>
        </View>

        {/* ── 오늘의 식사 ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>오늘의 식사</Text>
            <TouchableOpacity onPress={() => router.push("/food-input")}>
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealList}>
            {todayData.meals.map((meal: MealData) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() =>
                  router.push({
                    pathname: "/food-input",
                    params: { mealType: meal.type },
                    // Expo Router params 전달 방식
                    // 받는 쪽에서: const { mealType } = useLocalSearchParams();
                  })
                }
              />
            ))}
          </View>
        </View>

        {/* ── FAB ── */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/food-input")}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+ 음식 추가하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
  },
  dateText: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "right",
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6F1FB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#185FA5",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sectionMore: {
    fontSize: 13,
    color: "#185FA5",
    marginBottom: 12,
  },
  calorieCard: {
    backgroundColor: "#185FA5",
    borderRadius: 16,
    padding: 20,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  calorieLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  calorieNumRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  calorieNum: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
  },
  calorieGoalNum: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  calorieUnit: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  progressBg: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 99,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#fff",
    borderRadius: 99,
    height: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabelText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  nutrientGrid: {
    flexDirection: "row",
    gap: 10,
  },
  nutrientCard: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  nutrientLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 6,
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  nutrientUnit: {
    fontSize: 12,
    fontWeight: "400",
    color: "#888",
  },
  nutrientBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 4,
  },
  nutrientBarFill: {
    height: 4,
    borderRadius: 99,
  },
  nutrientPercent: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 2,
  },
  mealList: {
    gap: 10,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    padding: 14,
    gap: 12,
  },
  mealCardEmpty: {
    borderStyle: "dashed",
    borderColor: "#ddd",
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mealEmoji: {
    fontSize: 22,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 3,
  },
  mealFoods: {
    fontSize: 12,
    color: "#888",
  },
  mealEmpty: {
    fontSize: 12,
    color: "#bbb",
  },
  mealCalorie: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  addIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#185FA5",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 22,
  },
  fab: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: "#185FA5",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
