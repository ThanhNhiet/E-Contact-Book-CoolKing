import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { useChat } from "@/src/services/useapi/chat/UseChat";
import { set } from "date-fns";

// --- Interfaces không đổi ---
type ChatItemType = {
    _id: string;
    type: string;
    name: string;
    avatar: string;
    course_section_id: string;
    lastMessage: lastMessageType | null;
    createdAt: string;
    updatedAt: string;
    unread: boolean;
}
type lastMessageType = {
    senderID: string;
    content: string;
    type: string;
    createdAt: string;
}
type ChatItemProps = {
    item: ChatItemType;
    onChange: () => void;
};



// --- Định nghĩa kiểu dữ liệu cho props ---
type SearchChatModalProps = {
  visible: boolean;
  onClose: () => void;
  navigation: any; // Truyền navigation vào để điều hướng
};

// Render mỗi item trong danh sách kết quả
  const ChatItem = ({ item, onChange }: ChatItemProps) => {
  
      const formatTimeUTC = (dateString: string) => {
          // Tách chuỗi đầu vào thành các phần ngày và giờ
          const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
          if (!parts) {
              return "Invalid Date"; // Trả về nếu định dạng sai
          }
          
          // Tạo đối tượng Date từ các phần đã tách (tháng trong JS bắt đầu từ 0)
          // parts[0] là toàn bộ chuỗi, parts[1] là ngày, [2] là tháng, [3] là năm, ...
          const date = new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]), Number(parts[4]), Number(parts[5]), Number(parts[6]));
  
          const today = new Date();
  
          // So sánh ngày, tháng, năm của 2 ngày
          const isToday = date.getDate() === today.getDate() &&
                          date.getMonth() === today.getMonth() &&
                          date.getFullYear() === today.getFullYear();
  
          if (isToday) {
              // Nếu là hôm nay, chỉ hiển thị giờ và phút
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${hours}:${minutes}`;
          } else {
              // Nếu không phải hôm nay, hiển thị ngày/tháng
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 vì tháng bắt đầu từ 0
              return `${day}/${month}`;
          }
      };
  
      return (
          <TouchableOpacity style={styles.itemContainer} onPress={onChange} activeOpacity={0.7}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.contentContainer}>
                  <View style={styles.textContainer}>
                      <Text style={[styles.userName, item.lastMessage && !item.unread && styles.userNameUnread]} numberOfLines={1}>
                          {item.name}
                      </Text>
                      <Text
                          style={[styles.lastMessage, item.lastMessage && !item.unread && styles.lastMessageUnread]}
                          numberOfLines={1}
                      >
                          {item.lastMessage?.content ?? "Chưa có tin nhắn"}
                      </Text>
                  </View>
                  <View style={styles.metaContainer}>
                      <Text style={styles.time}>{item.lastMessage ? formatTimeUTC(item.lastMessage.createdAt) : ""}</Text>
                      {item.lastMessage && !item.unread && (
                          <View style={styles.unreadBadge}>
                              {/* Bạn có thể thay isUnread bằng item.unreadCount nếu có */}
                              <Text style={styles.unreadText}>1</Text> 
                          </View>
                      )}
                  </View>
              </View>
          </TouchableOpacity>
      );
  };

const SearchChatModal = ({ visible, onClose, navigation }: SearchChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<ChatItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { searchChats } = useChat();

  // Hook useEffect để thực hiện tìm kiếm có độ trễ (debounce)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Tạo độ trễ 500ms trước khi "gọi API"
    const timerId = setTimeout(async () => {
      // --- Thay thế logic này bằng API call thật của bạn ---
     const data =   await  searchChats(searchQuery);
        setResults(data || []);
      setIsLoading(false);
    }, 500);

    // Cleanup function: Hủy timeout nếu người dùng gõ tiếp
    return () => clearTimeout(timerId);
  }, [searchQuery]); // Chỉ chạy lại khi searchQuery thay đổi

  const handlePressChat = (chat: ChatItemType) => {
        navigation.navigate("MessageScreen", { chat });
        setSearchQuery("");
        onClose();
    };

    const renderChatItem = ({ item }: { item: ChatItemType }) => (
        <ChatItem item={item} onChange={() => handlePressChat(item)} />
    );
  

  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              {/* --- Search Bar --- */}
              <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true} // Tự động focus vào ô input khi modal mở
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#aaa" />
                  </TouchableOpacity>
                )}
              </View>

              {/* --- Loading hoặc Danh sách kết quả --- */}
              {isLoading ? (
                <ActivityIndicator size="large" color="#6e2feb" style={{ marginTop: 40 }} />
              ) : (
                <FlatList
                  data={results}
                  renderItem={renderChatItem}
                  keyExtractor={(item) => item._id}
                  ListEmptyComponent={() => (
                    searchQuery.trim().length > 0 ? (
                      <Text style={styles.emptyText}>Không tìm thấy kết quả nào</Text>
                    ) : null
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  modalContent: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    fontSize: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  avatarIcon: {
    marginRight: 15,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
  itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 6, 
        borderRadius: 12,
        padding: 16, 
       
        shadowColor: "#475569",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16, 
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 12, 
        justifyContent: 'center',
    },
    userName: {
        fontSize: 17, 
        fontWeight: '600',
        color: '#1F2937',
    },
    userNameUnread: {
        fontWeight: '700',
    },
    lastMessage: {
        fontSize: 15, 
        color: '#6B7280',
        marginTop: 5,
    },
    lastMessageUnread: {
        color: '#111827', 
        fontWeight: '600',
    },
    metaContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    time: {
        fontSize: 13, 
        color: '#9CA3AF',
    },
    unreadBadge: {
        backgroundColor: '#007AFF', 
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        borderWidth: 2, 
        borderColor: '#FFFFFF',
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#007AFF',
        borderRadius: 10,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
    }
});

export default SearchChatModal;