import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import TopNavigations_ProfileDetail from "@/src/components/navigations/TopNavigations_Profile_Screen";
import {useProfile} from "@/src/services/useapi/profile/UseProfile";



export default function ProfileDetailScreen() {
  const navigation = useNavigation<any>();
  const { profile, profileNavigation,labelMap, getUpdateAvatar, avatarUrl, setAvatarUrl } = useProfile();

  const [fileAvatar, setFileAvatar] = React.useState<Object | null>(null);
  


  const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: false,
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            // API mới trả về mảng assets
            const asset = result.assets?.[0] || result;
            if (asset) {
                setFileAvatar(asset);
                setAvatarUrl(asset.uri);
            }
        } catch (err) {
            console.log("Lỗi chọn file:", err);
        }
    };

   const handleUpdateAvatar = async (file: any) => {
        if (!file) return;
        Alert.alert("Cập nhật ảnh đại diện", "Bạn có chắc chắn muốn cập nhật ảnh đại diện không?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Đồng ý",
                onPress: async () => {
                    // Gọi API cập nhật ảnh đại diện ở đây
                  const data =   await getUpdateAvatar(file);
                  if (!data){
                    Alert.alert("Lỗi", "Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.");
                  }
                  else {
                    Alert.alert("Thành công", data.message || "Cập nhật ảnh đại diện thành công.");
                    setFileAvatar(null);
                  }
                },
            },
        ]);
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {/* Thanh điều hướng trên */}
        <TopNavigations_ProfileDetail navigation={navigation} name="Thông tin chi tiết" />

        {/* Nội dung chi tiết */}
        <View style={styles.contentContainer} ></View>
        <ScrollView contentContainerStyle={styles.content}>

            {/* Ảnh đại diện */}
            <TouchableOpacity onPress={pickFile}>
            <Image
              source={{ uri: avatarUrl || " " }}
              style={styles.avatar}
            />
            </TouchableOpacity>

            {/* Nút cập nhật ảnh đại diện */}
            {fileAvatar && (
              <TouchableOpacity style={styles.buttonAvatar} onPress={() => handleUpdateAvatar(fileAvatar)}>
                <Text style={styles.buttonText}>Cập nhật ảnh đại diện</Text>
              </TouchableOpacity>
            )}

            {/*Thông tin chi tiết*/}
            {Object.entries(profile || {})
              .map(([key, value]) => (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.label}>{labelMap[key] || key}</Text>
                  <Text style={styles.value}>{String(value)}</Text>
                </View>
              ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  contentContainer: {
    height: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  /* Ảnh đại diện */
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: "center",
    marginVertical: 20,
    borderWidth: 3,
    borderColor: "#4a90e2",
    backgroundColor: "#eaeaea",
  },

  /* Nút cập nhật ảnh đại diện */
  buttonAvatar: {
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  /* Hàng thông tin */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },

  label: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "700",
  },

  value: {
    flex: 1.2,
    textAlign: "right",
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
});
