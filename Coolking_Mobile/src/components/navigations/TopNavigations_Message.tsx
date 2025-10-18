import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";

interface Props {
  navigation: any;
  chatPartner: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
}

export default function TopNavigations_Message({ navigation, chatPartner }: Props) {
  const ICON_COLOR = "#FFFFFF";

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={ICON_COLOR} />
      </TouchableOpacity>

      {/* Avatar */}
      <Image source={{ uri: chatPartner.avatar }} style={styles.headerAvatar} />

      {/* FIX: Wrap Name and Status in a flexible View */}
      <View style={styles.headerInfo}>
        <Text
          style={styles.headerName}
          numberOfLines={1} // Limit to 1 line
          ellipsizeMode='tail' // Add '...' at the end if too long
        >
          {chatPartner.name}
        </Text>
        {chatPartner.isOnline && <Text style={styles.headerStatus}>Đang hoạt động</Text>}
      </View>

      {/* Action Icons */}
      <View style={styles.headerActions}>
        {/* <TouchableOpacity style={{ marginRight: 12 }}>
          <Ionicons name="call-outline" size={24} color={ICON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginRight: 16 }}>
          <Ionicons name="videocam-outline" size={26} color={ICON_COLOR} />
        </TouchableOpacity> */}
        <TouchableOpacity style={{ marginRight: 8 }} onPress={()=>navigation.navigate("MessageDetailScreen")}>
          <Ionicons name="information-circle-outline" size={24} color={ICON_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#6A3DE8",
  },
  backButton: {
    paddingRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,       // Let it grow
    flexShrink: 1, // !! Tell it to shrink if necessary !!
    justifyContent: 'center',
    marginRight: 10,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    // Ellipsis is handled by numberOfLines/ellipsizeMode on the Text itself
  },
  headerStatus: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    // Should stay fixed on the right now
  },
  actionButton: {
      marginLeft: 12,
  }
});