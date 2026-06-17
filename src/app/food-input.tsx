// app/food-input.tsx
// "/food-input" 경로 → 임시 화면 (나중에 FoodInputScreen으로 교체)
//
// useLocalSearchParams → Expo Router에서 params 받는 방법
// HomeScreen에서 router.push({ pathname: "/food-input", params: { mealType: "아침" } })
// 로 보낸 값을 여기서 꺼냄
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function FoodInputScreen() {
  const { mealType } = useLocalSearchParams<{ mealType?: string }>();
  // useLocalSearchParams → URL params를 객체로 반환
  // <{ mealType?: string }> → 제네릭으로 타입 지정

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, color: "#333" }}>
        {mealType ? `${mealType} 음식 입력` : "음식 입력"}
      </Text>
      <Text style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
        준비 중입니다
      </Text>
    </View>
  );
}
