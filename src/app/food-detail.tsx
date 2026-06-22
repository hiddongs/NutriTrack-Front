import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function FoodDetailScreen() {
  const {
    foodName,
    calorie = "0",
    carb,
    protein,
    fat,
  } = useLocalSearchParams();
  const [amount, setAmount] = useState("100");

  const router = useRouter();

  const actualCalorie =
    parseFloat(String(calorie)) * (parseFloat(amount) / 100);

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("토큰: ", token);
    console.log("추가할 데이터: ", { foodName, amount, actualCalorie });

    fetch("http://localhost:8080/api/diet/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        foodName: foodName,
        calorie: actualCalorie,
        carb: parseFloat(String(carb)),
        protein: parseFloat(String(protein)),
        fat: parseFloat(String(fat)),
        amount: parseFloat(amount),
        mealType: "아침", // 나중에 동적 변경
        date: new Date().toISOString().split("T")[0],
      }),
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>← 뒤로</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{foodName} </Text>
      <Text style={styles.calorie}>
        칼로리 :{actualCalorie.toFixed(2)} kcal
      </Text>
      <Text style={styles.carb}>탄수화물 :{carb}</Text>
      <Text style={styles.protein}>단백질 : {protein}</Text>
      <Text style={styles.fat}>지방 : {fat}</Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>식단에 추가</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
  },
  calorie: {
    fontSize: 28,
    fontWeight: "700",
    color: "#185FA5",
    marginBottom: 16,
  },
  carb: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  protein: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  fat: {
    fontSize: 15,
    color: "#555",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  addBtn: {
    backgroundColor: "#185FA5",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
