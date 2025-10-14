import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import TopNavigations_Message from '@/src/components/navigations/TopNavigations_Message';
const CURRENT_USER_ID = 'user_01';

type MessageType = {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
};

const DUMMY_MESSAGES: MessageType[] = [
  {
    id: 'm7',
    text: 'Ok, mình sẽ xem ngay đây. Cảm ơn bạn nhé!',
    timestamp: '14:35',
    senderId: 'user_01', // Tin nhắn gửi đi
  },
  {
    id: 'm6',
    text: 'Mình vừa đẩy lên một bản cập nhật mới cho component `ChatItem` đó.',
    timestamp: '14:34',
    senderId: 'user_02', // Tin nhắn nhận được
  },
  {
    id: 'm5',
    text: 'Chào bạn, bạn có đang online không?',
    timestamp: '14:30',
    senderId: 'user_02',
  },
  {
    id: 'm4',
    text: 'Chào bạn',
    timestamp: '14:29',
    senderId: 'user_01',
  },
];

// Thông tin người đang chat cùng
const CHAT_PARTNER = {
  name: 'Alice',
  avatar: 'https://i.pravatar.cc/150?u=alice',
  isOnline: true,
};

// Component cho một bong bóng chat
const MessageBubble = ({ message }: { message: MessageType }) => {
  const isSent = message.senderId === CURRENT_USER_ID;

  return (
    <View
      style={[
        styles.messageContainer,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}>
      <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={isSent ? styles.sentText : styles.receivedText}>{message.text}</Text>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      </View>
    </View>
  );
};

export default function MessageScreen() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const newMsg = {
      id: `m${Date.now()}`,
      text: newMessage.trim(),
      timestamp: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      senderId: CURRENT_USER_ID,
    };

    setMessages(prevMessages => [newMsg, ...prevMessages]);
    setNewMessage('');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <TopNavigations_Message navigation={navigation} chatPartner={CHAT_PARTNER} />

        {/* BƯỚC 1: Xóa bỏ <View style={styles.container}> không cần thiết ở đây.
          KeyboardAvoidingView sẽ là component chính quản lý layout.
        */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container} // style `container` được chuyển vào đây
          // BƯỚC 2: Thêm `keyboardVerticalOffset` để tính cả chiều cao của header
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} 
        >
          {/* Danh sách tin nhắn */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <MessageBubble message={item} />}
            keyExtractor={item => item.id}
            style={styles.messageList}
            inverted // Rất quan trọng cho màn hình chat
            contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
          />

          {/* Khu vực nhập liệu */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#98A2B3"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            
            {/* BƯỚC 3: Cải tiến UI - Hiển thị nút gửi khi có text, 
              nếu không thì hiển thị các nút chức năng khác.
            */}
            {newMessage.trim().length > 0 ? (
              // Nút gửi khi có tin nhắn
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="paper-plane" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              // Các nút chức năng khi ô nhập trống
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="happy-outline" size={24} color="#667085" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="camera-outline" size={24} color="#667085" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Giữ màu trắng cho khu vực an toàn
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Nền hơi xám cho khu vực chat
  },
  // Message List
  messageList: {
    flex: 1,
    // paddingHorizontal đã được chuyển vào contentContainerStyle của FlatList
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: '#6A3DE8', // Cập nhật màu tím cho đồng bộ
  },
  receivedBubble: {
    backgroundColor: '#EAECF0',
  },
  sentText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  receivedText: {
    color: '#101828',
    fontSize: 15,
  },
  timestamp: {
    fontSize: 11,
    color: '#98A2B3',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Đổi thành 'flex-end' để các nút thẳng hàng với text input khi nó có nhiều dòng
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    minHeight: 42, // Tăng chiều cao tối thiểu một chút
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12, // Dùng paddingTop để text không bị nhảy khi gõ trên iOS
    paddingBottom: 12,
    fontSize: 15,
    marginRight: 8,
  },
  // Nút gửi tin nhắn (khi có text)
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6A3DE8', // Đồng bộ màu tím
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2, // Căn chỉnh với text input
  },
  // Container cho các nút chức năng (khi không có text)
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Các nút chức năng
  actionButton: {
    padding: 10,
  }
});