import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { router } from "expo-router";

type FoodItem = {
  FOOD_CD: string; // 고유 코드
  FOOD_NM_KR: string; // 음식 이름
  AMT_NUM1: string; // 칼로리
  AMT_NUM3: string; // 탄수화물
  AMT_NUM6: string; // 단백질
  AMT_NUM4: string; // 지방
};

const API_KEY =
  "sTgbSFeoWpY3deI2weMVUdG9jRdFdxeEZtSKPb3bvGDSfqxSJk8IUeMJIScOqmiuyKiJMJmKAdVWiObYbaCpMA%3D%3D";

export default function DietScreen() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    // trim() 공백 제거 함수

    setLoading(true);
    try {
      const url = `https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02?serviceKey=${API_KEY}&FOOD_NM_KR=${encodeURIComponent(
        searchText,
      )}&type=json&numOfRows=10&pageNo=1`;

      const response = await fetch(url);
      const data = await response.json();

      setResults(data.body.items || []);
    } catch (error) {
      console.error("검색 실패: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() =>
        router.push({
          pathname: "/food-detail",
          params: {
            foodName: item.FOOD_NM_KR,
            calorie: item.AMT_NUM1,
            carb: item.AMT_NUM3,
            protein: item.AMT_NUM6,
            fat: item.AMT_NUM4,
          },
        })
      }
    >
      <Text style={styles.foodName}>{item.FOOD_NM_KR}</Text>
      <Text style={styles.calorie}>칼로리: {item.AMT_NUM1}</Text>
      <Text style={styles.carbohydrate}>탄수화물: {item.AMT_NUM3}</Text>
      <Text style={styles.protein}>단백질: {item.AMT_NUM6}</Text>
      <Text style={styles.fat}>지방: {item.AMT_NUM4}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="음식 검색"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#185FA5" />}

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.FOOD_CD}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    flex: 1,
    height: 48,

    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchBtn: {
    backgroundColor: "#185FA5",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  resultCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#eee",
    marginBottom: 10,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  calorie: {
    fontSize: 14,
    color: "#185FA5",
    fontWeight: "600",
  },
  carbohydrate: {
    fontSize: 14,
    color: "#666",
  },
  protein: {
    fontSize: 14,
    color: "#666",
  },
  fat: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  resultText: { fontSize: 14, color: "#111" },
  loader: { marginTop: 20 },
});
