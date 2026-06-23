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

  const [mealType, setMealType] = useState("아침");
  const [customMeal, setCustomMeal] = useState(false);
  const [customMealText, setCustomMealText] = useState("");

  const MEAL_TYPES = ["아침", "점심", "저녁", "간식"];

  const router = useRouter();

  const actualCalorie =
    parseFloat(String(calorie)) * (parseFloat(amount) / 100);

  const actualCarb = parseFloat(String(carb)) * (parseFloat(amount) / 100);
  const actualProtein =
    parseFloat(String(protein)) * (parseFloat(amount) / 100);
  const actualFat = parseFloat(String(fat)) * (parseFloat(amount) / 100);

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("토큰: ", token);
    console.log("추가할 데이터: ", { foodName, amount, actualCalorie });

    const response = await fetch("http://localhost:8080/api/diet/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        foodName: foodName,
        calorie: actualCalorie,
        carb: actualCarb,
        protein: actualProtein,
        fat: actualFat,
        amount: parseFloat(amount),
        mealType: customMeal ? customMealText : mealType, // 나중에 동적 변경
        date: new Date().toISOString().split("T")[0],
      }),
    });

    if (response.ok) {
      router.replace("/(tabs)" as any);
    }
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

      <View style={styles.mealTypeContainer}>
        <Text style={styles.mealTypeLabel}>끼니 선택</Text>

        <View style={styles.mealTypeBtns}>
          {MEAL_TYPES.map((meal) => (
            <TouchableOpacity
              key={meal}
              style={mealType === meal ? styles.selectedBtn : styles.mealBtn}
              onPress={() => {
                setMealType(meal);
                setCustomMeal(false);
              }}
            >
              <Text
                style={
                  mealType === meal
                    ? styles.selectedBtnText
                    : styles.mealBtnText
                }
              >
                {meal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => setCustomMeal(true)}>
          <Text>+ 직접 입력</Text>
        </TouchableOpacity>

        {customMeal && (
          <TextInput
            placeholder="예) 야식, 운동 전"
            value={customMealText}
            onChangeText={setCustomMealText}
          />
        )}
      </View>

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

  mealTypeContainer: { marginBottom: 16 },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  mealTypeBtns: { flexDirection: "row", gap: 8, marginBottom: 8 },
  mealBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#185FA5",
  },
  mealBtnText: { color: "#333" },
  selectedBtnText: { color: "#fff" },
});
