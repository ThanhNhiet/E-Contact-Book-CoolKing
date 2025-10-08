import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // icon
import { useLogin_out } from "@/src/services/useapi/Login/UseLogin_Forgot";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const {
    email,
    setEmail,
    checkemail,
    isLoading
  } = useLogin_out();

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const isEmail = (s: string) => emailRegex.test(String(s || '').trim());


  const onSubmit = async () => {
    if (!email) return Alert.alert("Thông báo", "Vui lòng nhập email đã đăng ký.");
    if (!isEmail(email)) return Alert.alert("Thông báo", "Email không hợp lệ.");
     const data = await checkemail();
    if (!data || !data.success) {
      return Alert.alert("Lỗi", "Email không tồn tại trong hệ thống.");
    } else {
      Alert.alert("Thành công", data.message || "Email hợp lệ. Vui lòng kiểm tra hộp thư đến để nhận mã OTP.");
      navigation.navigate("OtpVerifyScreen", { email: data.email });
      }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Quên mật khẩu</Text>

      <Text style={styles.label}>Email đăng ký</Text>
      <TextInput
        placeholder="nhap@email.com"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Gửi yêu cầu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  backButton: { marginBottom: 10, alignSelf: "flex-start" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  label: { fontSize: 15, fontWeight: "500", marginBottom: 6, color: "#444" },
  input: {
    height: 45,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
    marginBottom: 22,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
