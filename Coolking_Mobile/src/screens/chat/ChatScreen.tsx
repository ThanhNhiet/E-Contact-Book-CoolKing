import React,{useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RootTagContext,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import TopNavigations_Chat from '@/src/components/navigations/TopNavigations';
import { UseChat } from '@/src/services/useapi/chat/UseChat';





type ChatItemType = {
    _id: string;
    type: string;
    name: string;
    avatar: string;
    course_section_id: string;
    lastMessage: lastMessageType | null;
    createdAt: string;
    updatedAt: string;
    currentMember:{
        userID: string;
        userName: string;
        role: string;
        joninedAt: string;
        muted: boolean;
    }
}
type lastMessageType = {
  
            _id: string;
            messageID: string;
            chatID: string;
            senderID: string;
            content: string;
            type: string;
            status: string;
            filename: string;
            replyTo: Object | null;
            pinnedInfor : Object | null;
            createdAt: string;
            updatedAt: string;
}



type ChatItemProps = {
  item: ChatItemType;
  onPress: () => void;
};

const ChatItem = ({ item, onPress }: ChatItemProps) => {
  const isUnread = 3;
  //item.unreadCount > 0;

  // Hàm tiện ích để định dạng thời gian
  const formatTimeUTC = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getUTCHours()}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      {/* Phần nội dung chính */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.userName, isUnread && styles.userNameUnread]}>
            {item.name}
          </Text>
          <Text
            style={[styles.lastMessage, isUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {item.lastMessage?.content ?? ""}
          </Text>
        </View>

        {/* Phần thời gian và trạng thái */}
        <View style={styles.metaContainer}>
          <Text style={styles.time}>{item.lastMessage ? formatTimeUTC(item.lastMessage.createdAt) : ""}</Text>
          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{isUnread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const { chats, loading, error, refresh } = UseChat();


  // Hàm xử lý khi nhấn vào một cuộc trò chuyện
  const handlePressChat = (chat: ChatItemType) => {
    navigation.navigate("MessageScreen",{chat});
  };
    // Hàm render mỗi item trong FlatList
  const renderChatItem = ({ item }: { item: ChatItemType }) => (
    <ChatItem 
      item={item} 
      onPress={() => handlePressChat(item)} 
    />
  );

  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
        
        <TopNavigations_Chat navigation={navigation} name='Tin nhắn' />

        {loading && chats.length === 0 && (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0A58FF" />
            </View>
        )}

        {error && (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{typeof error === 'string' ? error : error?.message ?? String(error)}</Text>
                <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        )}

        {!loading && !error && chats.length === 0 && (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
            </View>
        )}

        <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item._id}
            style={styles.list}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
        />
        </SafeAreaView>
    </SafeAreaProvider>
  );
};


const styles = StyleSheet.create({
  // ===================================
  // Styles cho màn hình chính (Screen)
  // ===================================
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Thay đổi: Màu nền tổng thể để tạo chiều sâu
  },
  list: {
    flex: 1,
    paddingTop: 8, // Thêm khoảng trống ở trên cùng của danh sách
  },

  // ===================================
  // Styles cho một Item trong danh sách (ChatItem)
  // ===================================
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Nền trắng cho thẻ
    marginHorizontal: 16,      // Thay đổi: Tạo khoảng cách hai bên
    marginBottom: 12,          // Thay đổi: Tạo khoảng cách giữa các thẻ
    borderRadius: 12,          // Thay đổi: Bo góc để tạo dạng card
    padding: 12,               // Điều chỉnh lại padding bên trong card

    // (Tùy chọn) Thêm shadow để tạo hiệu ứng nổi bật hơn
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28, // Giữ nguyên bo tròn cho avatar
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101828', // Thay đổi: Màu đen-xám hiện đại
  },
  userNameUnread: {
    fontWeight: '700', // Tăng độ đậm cho tên chưa đọc
  },
  lastMessage: {
    fontSize: 14,
    color: '#667085', // Thay đổi: Màu xám cho text phụ
    marginTop: 4,      // Tăng khoảng cách với tên
  },
  lastMessageUnread: {
    color: '#344054', // Thay đổi: Màu đậm hơn cho tin nhắn chưa đọc
    fontWeight: '500',
  },
  metaContainer: {
    alignItems: 'flex-end',
    paddingTop: 2, // Căn chỉnh lại một chút
  },
  time: {
    fontSize: 12,
    color: '#98A2B3', // Thay đổi: Màu xám nhạt hơn cho thời gian
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: '#0A58FF', // Giữ nguyên màu xanh nổi bật
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
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
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#0A58FF',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#667085',
  },
});

