// ============================================================
// app/_layout.tsx
// Expo Router 방식의 네비게이션 설정
//
// ─────────────────────────────────────────────
// Expo Router vs React Navigation 차이:
//
// React Navigation (이전 방식):
//   → NavigationContainer, Stack.Navigator를 직접 설정
//   → navigation prop을 각 화면에 수동으로 전달
//
// Expo Router (현재 방식):
//   → 파일 구조 = 라우팅 구조 (Next.js와 동일한 개념)
//   → app/index.tsx → "/" 경로
//   → app/home.tsx  → "/home" 경로
//   → useRouter() 훅으로 어디서든 네비게이션 가능
//   → navigation prop 필요 없음!
// ─────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
// Stack → Expo Router의 스택 네비게이터
// router → 코드에서 직접 화면 이동할 때 사용

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (token !== null) {
        // 토큰 있으면 홈으로 리다이렉트
        // router.replace → 뒤로가기 불가 (스택 교체)
        router.replace("/(tabs)" as any);
      } else {
        // 토큰 없으면 온보딩으로
        router.replace("/onboarding" as any);
      }
    } catch (error) {
      console.error("토큰 확인 실패:", error);

      router.replace("/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  return (
    // Stack → 화면 스택 구성
    // screenOptions → 모든 화면에 공통 적용되는 옵션
    <Stack
      screenOptions={{
        headerShown: false,
        // headerShown: false → 상단 기본 헤더 숨김
        animation: "slide_from_right",
      }}
    >
      {/*
        Expo Router는 app/ 폴더 안의 파일을 자동으로 라우트로 등록함.
        여기서 Stack.Screen은 각 화면의 옵션만 추가로 설정하는 용도.
        파일이 있으면 자동 등록되므로 component 속성 불필요.
      */}
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="join" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="food-input" />
    </Stack>
  );
}
