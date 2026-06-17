import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function JoinScreen() {
  // 백엔드로 보낼 데이터 변수 선언 (메모장)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // 회원가입 버튼 함수
  const handleJoin = async () => {
    const joinData = {
      name: name,
      email: email,
      password: password,
      nickName: nickname,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender: "MALE", // 성별은 고정해서 일단 테스트
      activityLevel: "MODERATELY_ACTIVE",
      targetPurpose: "GAIN",
    };

    try {
      // 백엔드 주소로 포스트 방식으로 보내기
      const response = await fetch("http://localhost:8080/api/users/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // json 형태로 전송
        },
        body: JSON.stringify(joinData),
      });

      // 200으로 반환이 오면
      if (response.ok) {
        console.log("=== 백엔드로 쏠 데이터 준비 완료 ===");
        console.log(JSON.stringify(joinData, null, 2));

        Alert.alert("확인", "데이터가 콘솔에 출력되었습니다");

        Alert.alert("가입 성공 ! ! ! ", "DB 데이터 저장 완료.");
        console.log("에러 상태 코드 : ", response.status);
      }
    } catch (error) {
      // 오류가 반환되면
      Alert.alert("가입 실패", "스프링 부트 서버 확인 요망");
      console.error("통신 실패 상세 원인 : ", error);
    }
  };

  // 화면 그리기
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nutri-Track 가입하기</Text>

      <TextInput
        style={styles.input}
        placeholder="이름 (실명)"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
      />

      <TextInput
        style={styles.input}
        placeholder="나이"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        style={styles.input}
        placeholder="키 (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="몸무게 (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>회원가입 완료</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    paddingTop: 80,
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
