import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import TopNavigations_Message from '@/src/components/navigations/TopNavigations_Message';
import { useMessages } from '@/src/services/useapi/chat/UseMessage';
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from 'expo-image-picker';
import { set } from 'date-fns';



// --- Interfaces (không đổi) ---
type ItemSenderInfo = { userID: string; name: string; avatar: string | null; role: string; muted: boolean; joninDate?: string | null; lastReadAt?: string | null; }
type ItemPinnedInfo = { messageID: string; pinnedByinfo : ItemSenderInfo; pinnedDate: string; }
type ItemReplyInfo = { messageID: string; senderInfo: ItemSenderInfo; content: string; type: string; }
type ItemMessage = { _id: string; chatID: string; type: 'text' | 'image' | string; content: string; filename: string | null; status: string; isDeleted: boolean; senderInfo: ItemSenderInfo; pinnedInfo: ItemPinnedInfo | null; replyTo: ItemReplyInfo | null; createdAt: string; updatedAt: string; };

// --- Component MessageBubble (Không đổi) ---
const MessageBubble = ({
    message,
    userId,
    onStartReply // Callback function to initiate reply
}: {
    message: ItemMessage;
    userId: string | null;
    onStartReply: (messageToReply: ItemMessage) => void;
}) => {
    const isSent = message.senderInfo?.userID === userId; // Add safe navigation
    const time = message.createdAt.split(' ')[1]?.substring(0, 5) || '';
    const avatarSource = message.senderInfo?.avatar
        ? { uri: message.senderInfo.avatar }
        : { uri: "https://example.com/default-avatar.png" };

    // --- Action Handler ---
    const handleLongPress = () => {
        // Example: Show options on long press
        Alert.alert(
            "Message Actions",
            "What would you like to do?",
            [
                { text: "Reply", onPress: () => onStartReply(message) },
                // TODO: Add Pin/Unpin logic here
                { text: "Pin", onPress: () => console.log("Pin action (Not implemented)") },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        // Wrap bubble in TouchableOpacity for long press
        <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.8}>
            <View style={[styles.messageRow, isSent ? styles.sentRow : styles.receivedRow]}>
                {!isSent && <Image source={avatarSource} style={styles.avatar} />}
                <View style={styles.contentAndMetaContainer}>
                    <View style={styles.nameAndPinContainer}>
                         {/* --- PIN INDICATOR --- */}
                        {message.pinnedInfo && (
                            <Ionicons name="pin" size={12} color="#6B7280" style={styles.pinIcon} />
                        )}
                        <Text style={[styles.senderName, isSent ? styles.sentName : styles.receivedName]} numberOfLines={1}>
                            {message.senderInfo?.name ?? 'Unknown'} {/* Add fallback */}
                        </Text>
                    </View>

                    {/* --- REPLY PREVIEW (If this message is a reply) --- */}
                    {message.replyTo && (
                        <View style={[styles.replyPreviewBubble, isSent ? styles.sentReplyPreview : styles.receivedReplyPreview]}>
                            <Text style={styles.replyPreviewSender} numberOfLines={1}>
                                {message.replyTo.senderInfo?.name ?? 'Unknown'}
                            </Text>
                            <Text style={styles.replyPreviewContent} numberOfLines={1}>
                                {message.replyTo.type === 'image' ? '📷 Image' : message.replyTo.content}
                            </Text>
                        </View>
                    )}

                    {/* Bubble and Timestamp */}
                    <View style={[ styles.messageContainer, isSent ? styles.sentContainer : styles.receivedContainer ]}>
                        <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
                           {/* Content rendering */}
                            {message.type === 'text' ? (
                            <Text style={isSent ? styles.sentText : styles.receivedText}>{message.content}</Text>
                        ) : message.type === 'image' ? (
                            <Image source={{ uri: message.content }} style={styles.imageMessage} resizeMode="contain" />
                        ) : message.type === 'file' ? (
                            <Text style={styles.fileMessage} >{message.filename}</Text>
                        ) : (
                            <Text style={styles.unsupportedText}>[Tin nhắn không được hỗ trợ]</Text>
                        )}
                        </View>
                        <Text style={[styles.timestamp, isSent ? styles.sentTimestamp : styles.receivedTimestamp]}>
                            {time}
                        </Text>
                    </View>
                </View>
                {isSent && <Image source={avatarSource} style={styles.avatar} />}
            </View>
        </TouchableOpacity>
    );
};

// --- Reply Bar Component ---
const ReplyBar = ({ message, onCancel }: { message: ItemMessage; onCancel: () => void }) => {
    return (
        <View style={styles.replyBarContainer}>
            <View style={styles.replyBarContent}>
                 <Ionicons name="arrow-undo" size={16} color="#6B7280" style={styles.replyIcon} />
                 <View style={styles.replyTextContainer}>
                    <Text style={styles.replyBarSender} numberOfLines={1}>
                        Reply to {message.senderInfo?.name ?? 'Unknown'}
                    </Text>
                    <Text style={styles.replyBarMessage} numberOfLines={1}>
                        {message.type === 'image' ? '📷 Image' : message.content}
                    </Text>
                 </View>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.cancelReplyButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </View>
    );
};

// --- Màn hình chính ---
export default function MessageScreen() {
   
    const [isPinning, setIsPinning] = useState<boolean>(false);
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const flatListRef = useRef<FlatList>(null);
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { chat } = route.params as { chat: { _id: string, name: string, avatar: string } };
    // Sử dụng hook
    const { 
      // States
        loading,
        loadingMore, 
        hasMore, 
        error, 


        messages,
        userId,
        senderInfo,
        newMessage,
        replyingTo,
        file,
        image,
        fileName,
        imageName,

        // Functions
        loadMoreMessages ,
        sendMessageText,
        handleSendMessageText,
        handleSendReply,
        handleSendMessageImage,

        // Setters
        setNewMessage,
        setMessages, 
        setReplyingTo,
        setFile,
        setImage,
        setFileName,
        setImageName

    } = useMessages(chat._id);


   const pickMultipleFiles = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        multiple: true, // Allow multiple files
        copyToCacheDirectory: true, // Recommended
      });
      console.log("Multi-file pick result:", result);
      if (result.canceled) {
        console.log('User cancelled file picker');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        console.log("Selected Files:", result.assets);
        setFile(result.assets);
        setFileName(result.assets.map(asset => asset.name)); 
      }
    } catch (err) {
      console.error("Error picking files:", err);
    }
  };
const pickMultipleImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsMultipleSelection: true, 
      quality: 0.8,
    });

    console.log("Multiple pick result:", result);

    if (!result.canceled) {
       if (result.assets && result.assets.length > 0) {
          console.log("Selected URIs:", result.assets);
          setImage(result.assets); // Lưu mảng các assets
          setImageName(result.assets.map(asset => asset.uri)); // Hiển thị ảnh đầu tiên làm preview (ví dụ)
       }
    }
  };

  const handleSendMessage = async() => {
    if (image != null) {
        try {
            await handleSendMessageImage(chat._id, image);
        } catch (error) {
            console.error("Error sending image message:", error);
        }
    } else if (file != null) {
        try {
            // await sendMessageFile(chat._id, file);
            setFile(null);
            setFileName(null);
        } catch (error) {
            console.error("Error sending file message:", error);
        }
    } else if (newMessage.trim().length > 0) {

        await handleSendMessageText(chat._id, newMessage.trim());
    }
  };
    


   // --- Start Reply Handler ---
    const handleStartReply = (messageToReply: ItemMessage) => {
        setReplyingTo(messageToReply);
        // Optionally focus the TextInput here
    };

    // --- Cancel Reply Handler ---
    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    
   

    // Component hiển thị loading khi tải thêm tin nhắn cũ
    const renderListHeader = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#8A8A8E" />
            </View>
        );
    };
    if (userId === null) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                     <View style={styles.centeredContainer}>
                         <ActivityIndicator size="large" color="#007AFF" />
                     </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }
    // --- RENDER MESSAGE BUBBLE ---
     const renderMessageItem = ({ item }: { item: ItemMessage }) => (
        <MessageBubble
            message={item}
            userId={userId} // Pass userId as prop
            onStartReply={handleStartReply}
        />
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <TopNavigations_Message navigation={navigation} chatPartner={{ name: chat.name, avatar: chat.avatar, isOnline: true /* Lấy trạng thái online thực tế */ }} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Điều chỉnh nếu cần
                >
                    {/* Chỉ báo loading ban đầu */}
                    {loading && messages.length === 0 && (
                        <View style={styles.centeredContainer}>
                           <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    )}

                    {/* Hiển thị lỗi ban đầu */}
                    {error && messages.length === 0 && (
                         <View style={styles.centeredContainer}>
                           <Text style={styles.errorText}>{error}</Text>
                           {/* Có thể thêm nút Thử lại */}
                        </View>
                    )}

                    {/* Chỉ hiển thị danh sách khi không loading ban đầu HOẶC đã có sẵn tin nhắn */}
                    {(!loading || messages.length > 0) && (
                       <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessageItem}
                            keyExtractor={item => item._id}
                            style={styles.messageList}
                      
                            contentContainerStyle={styles.listContentContainer}
                            onEndReached={loadMoreMessages}
                            onEndReachedThreshold={0.5}
                            ListHeaderComponent={renderListHeader} 
                            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                        />
                    )}
                  {/* --- Input Container with Reply Bar --- */}
                    <View style={styles.inputAreaWrapper}>
                        {replyingTo && (
                            <ReplyBar message={replyingTo} onCancel={handleCancelReply} />
                        )}  
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
                       {newMessage.trim().length > 0 || image != null ? (
                           <View style={styles.attachmentContainer}>
                            <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage()}>
                                <Ionicons name="paper-plane" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                            {(image != null || file != null) && (
                            <TouchableOpacity style={styles.closeButton} onPress={() => { setImage(null); setFile(null); setImageName(null); setFileName(null); }}>
                                <Ionicons name="close-circle" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                            )}
                           </View>
                       )  : (
                           <View style={styles.actionButtonsContainer}>
                               <TouchableOpacity style={styles.actionButton}>
                                   <Ionicons name="happy-outline" size={24} color="#667085" />
                               </TouchableOpacity>
                               <TouchableOpacity style={styles.actionButton} onPress={pickMultipleImages}>
                                   <Ionicons name="image-outline" size={24} color="#667085" />
                               </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={pickMultipleFiles}>
                                    <Ionicons name="attach-outline" size={24} color="#667085" />
                                </TouchableOpacity>
                               {/* Thêm các nút khác nếu cần */}
                           </View>
                       )}
                    </View>
                  </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#F9FAFB' }, // Màu nền khu vực chat
    messageList: { flex: 1 },
    listContentContainer: { // Style cho nội dung bên trong FlatList
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16, padding: 20, textAlign: 'center' },
    loadingMoreContainer: { paddingVertical: 15, alignItems: 'center' },

    messageRow: { flexDirection: 'row', marginVertical: 8, alignItems: 'flex-end' },
    sentRow: { justifyContent: 'flex-end', paddingLeft: Dimensions.get('window').width * 0.15 },
    receivedRow: { justifyContent: 'flex-start', paddingRight: Dimensions.get('window').width * 0.15 },
    avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8, marginBottom: 5 },
    contentAndMetaContainer: { maxWidth: '75%' },
    nameAndPinContainer: { // Container for Name and Pin Icon
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinIcon: {
        marginRight: 4,
    },
    replyPreviewBubble: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)', // Slightly darker background
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderLeftWidth: 3,
        marginBottom: 4, // Space between reply and main bubble
        borderRadius: 8,
        maxWidth: '90%', // Limit width
    },
    sentReplyPreview: {
        borderLeftColor: '#007AFF', // Blue indicator for sent
        alignSelf: 'flex-end',
    },
    receivedReplyPreview: {
        borderLeftColor: '#8A8A8E', // Gray indicator for received
        alignSelf: 'flex-start',
    },
    replyPreviewSender: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    replyPreviewContent: {
        fontSize: 13,
        color: '#555',
    },


    // --- Input Area Wrapper (Includes Reply Bar + Input Container) ---
    inputAreaWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        backgroundColor: '#FFFFFF',
    },
    // --- Reply Bar Styles ---
    replyBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 8, // Add padding top
        paddingBottom: 4, // Small padding bottom
        backgroundColor: '#F2F2F7', // Slightly different background
        borderBottomWidth: 1, // Separator line
        borderBottomColor: '#E5E5EA',
    },
    replyIcon: {
        marginRight: 8,
    },
    replyBarContent: {
        flex: 1,
        flexDirection: 'row', // Align icon and text horizontally
        alignItems: 'center',
        paddingRight: 10, // Space before cancel button
    },
    replyTextContainer: {
        flex: 1, // Take remaining space
    },
    replyBarSender: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007AFF',
    },
    replyBarMessage: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    cancelReplyButton: {
        padding: 5, // Make it easier to press
    },
    senderName: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    sentName: { textAlign: 'right', marginRight: 5 },
    receivedName: { textAlign: 'left', marginLeft: 5 },
    messageContainer: {},
    sentContainer: { alignItems: 'flex-end' },
    receivedContainer: { alignItems: 'flex-start' },
    bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, minWidth: 40 },
    sentBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
    receivedBubble: { backgroundColor: '#E5E5EA', borderBottomLeftRadius: 4 },
    sentText: { color: '#FFFFFF', fontSize: 15 },
    receivedText: { color: '#1C1C1E', fontSize: 15 },
    imageMessage: { width: Dimensions.get('window').width * 0.6, height: 200, borderRadius: 10 },
    fileMessage: { color: '#1C1C1E', fontSize: 15, textDecorationLine: 'underline' },
    unsupportedText: { color: '#8A8A8E', fontSize: 14, fontStyle: 'italic' },
    timestamp: { fontSize: 11, color: '#8A8A8E', marginTop: 5 },
    sentTimestamp: { marginRight: 5 },
    receivedTimestamp: { marginLeft: 5 },

    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
    textInput: { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 8 },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
    closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    actionButtonsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    attachmentContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    actionButton: { padding: 8 }
});