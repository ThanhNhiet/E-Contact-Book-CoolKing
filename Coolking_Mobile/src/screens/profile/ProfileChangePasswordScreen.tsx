import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TopNavigations_Profile from "@/src/components/navigations/TopNavigations_Profile_Screen";
import { useProfile } from "@/src/services/useapi/profile/UseProfile";

export default function ProfileChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { getchangePassword } = useProfile();

  const [currentPwd, setCurrentPwd] = useState("");
  const [nextPwd, setNextPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const onChangePassword = async () => {
    if (!nextPwd || !confirm || !currentPwd)
      return Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường.");
    if (nextPwd.length < 6)
      return Alert.alert("Yêu cầu", "Mật khẩu mới phải tối thiểu 6 ký tự.");
    if (nextPwd !== confirm)
      return Alert.alert("Lỗi", "Xác nhận mật khẩu không khớp.");
    const result = await getchangePassword(currentPwd, nextPwd);
    if (result) {
      setCurrentPwd("");
      setNextPwd("");
      setConfirm("");
      Alert.alert("Thành công", result.message || "Đổi mật khẩu thành công.");
    } else {
      Alert.alert("Lỗi", result.message || "Đổi mật khẩu thất bại.");
    }
  };

  const renderPwdRow = (
    label: string,
    value: string,
    setVal: (v: string) => void,
    secure: boolean,
    setSecure: (v: boolean) => void
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder={label}
          value={value}
          onChangeText={setVal}
          secureTextEntry={!secure}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={22} color="#777" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopNavigations_Profile navigation={navigation} name="Đổi mật khẩu" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>

          {renderPwdRow("Mật khẩu hiện tại", currentPwd, setCurrentPwd, show1, setShow1)}
          {renderPwdRow("Mật khẩu mới", nextPwd, setNextPwd, show2, setShow2)}
          {renderPwdRow("Xác nhận mật khẩu mới", confirm, setConfirm, show3, setShow3)}

          <TouchableOpacity style={styles.button} onPress={onChangePassword}>
            <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 15.5,
    color: "#222",
  },
  button: {
    backgroundColor: "#6e2febff",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6e2febff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
