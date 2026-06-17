// app/login.tsx
// "/login" 경로 → 임시 로그인 화면
// 나중에 LoginScreen 컴포넌트로 교체 예정
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
export default function LoginScreen() {
  // 힌트 1: email, password 두 개 state 필요해요
  // const [???, set???] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 힌트 2: 로그인 버튼 누르면 실행할 함수 필요해요
  // const handleLogin = async () => { ... }

  const handleLogin = async () => {
    const loginData = {
      email: email,
      password: password,
    };
    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      // 200이 오면
      if (response.ok) {
        const responseData = await response.json();
        const accessToken = responseData.accessToken;
        console.log("=== 로그인 성공 ==== : ", accessToken);
        // 토큰을 AsyncStorage에 저장
        await AsyncStorage.setItem("accessToken", accessToken);

        router.replace("/home" as any);
      }
    } catch (error) {
      console.error("로그인 실패 : ", error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <Text style={styles.sub}>이메일과 비밀번호를 입력하세요</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>로그인</Text>
      </TouchableOpacity>

      {/* 임시 홈 이동 버튼 — 개발 중 테스트용 */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.btnText}>홈으로 이동 (임시)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  sub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 40,
  },
  btn: {
    backgroundColor: "#185FA5",
    borderRadius: 12,
    paddingHorizontal: 32,
    width: "100%",
    height: 52,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
