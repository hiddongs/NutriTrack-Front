import { ActivityIndicator, View } from "react-native";

export default function Index() {
  // _layout.tsx에서 토큰 확인 후 알아서 이동시켜줌
  // 이 화면은 잠깐 보이는 로딩 화면
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#185FA5" />
    </View>
  );
}
