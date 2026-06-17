// ============================================================
// screens/OnboardingScreen.tsx
// Nutri-Track — 온보딩 슬라이드 화면 (Expo Router 버전)
//
// 핵심 변경점:
//   기존: navigation prop 받아서 navigation.replace("Login") 사용
//   변경: router 객체로 router.replace("/login") 사용
//
//   Expo Router에서 navigation prop이 없는 이유:
//   → 파일 기반 라우팅이므로 경로가 파일명으로 결정됨
//   → router를 import해서 어디서든 화면 이동 가능
//   → props 없이도 동작 → 컴포넌트가 더 단순해짐
// ============================================================

import { router } from "expo-router";
// router.replace("/경로") → 현재 화면을 교체 (뒤로가기 불가)
// router.push("/경로")    → 스택에 추가 (뒤로가기 가능)

import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─────────────────────────────────────────────
// 📐 타입 정의
// ─────────────────────────────────────────────
type SlideItem = {
  id: string;
  emoji: string;
  bgColor: string;
  title: string;
  description: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES: SlideItem[] = [
  {
    id: "1",
    emoji: "🥗",
    bgColor: "#E1F5EE",
    title: "내 식단을 한눈에",
    description:
      "아침, 점심, 저녁 식사를\n간편하게 기록하고\n하루 영양소를 파악해 보세요.",
  },
  {
    id: "2",
    emoji: "📊",
    bgColor: "#E6F1FB",
    title: "칼로리 & 영양소 분석",
    description:
      "탄수화물, 단백질, 지방을\n자동으로 계산해서\n목표에 맞게 관리해 드려요.",
  },
  {
    id: "3",
    emoji: "🤖",
    bgColor: "#EEEDFE",
    title: "AI 맞춤 식단 추천",
    description:
      "냉장고 재료와 운동 목표를 알려주면\nAI가 딱 맞는 식단을\n추천해 드려요.",
  },
];

// ─────────────────────────────────────────────
// props 타입 없음 — Expo Router에서는 불필요
// ─────────────────────────────────────────────
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = (): void => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  // ─────────────────────────────────────────────
  // navigation.replace("Login") → router.replace("/login")
  //
  //   Expo Router 경로 규칙:
  //   app/login.tsx 파일 → "/login" 경로
  //   app/join.tsx 파일  → "/join" 경로
  //   app/home.tsx 파일  → "/home" 경로
  // ─────────────────────────────────────────────
  const handleSkip = (): void => {
    router.replace("/login");
  };

  const handleLogin = (): void => {
    router.replace("/login");
  };

  const handleJoin = (): void => {
    router.push("/join");
    // push: 뒤로가기로 온보딩 돌아올 수 있게 (회원가입은 뒤로가기 허용)
  };

  const renderSlide = ({ item }: ListRenderItemInfo<SlideItem>) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.emojiContainer, { backgroundColor: item.bgColor }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {!isLastSlide && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item: SlideItem) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        bounces={false}
      />

      <View style={styles.bottomArea}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_: SlideItem, index: number) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
              <Text style={styles.btnPrimaryText}>로그인하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleJoin}>
              <Text style={styles.btnSecondaryText}>
                처음이신가요? 회원가입
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
            <Text style={styles.btnPrimaryText}>다음</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: "#888",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emojiContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  emoji: {
    fontSize: 80,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#185FA5",
  },
  authButtons: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: "#185FA5",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnSecondary: {
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnSecondaryText: {
    color: "#555",
    fontSize: 15,
  },
});
