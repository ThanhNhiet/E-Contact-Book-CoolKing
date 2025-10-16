import React, { useState } from 'react';
import { useMessage } from '../../../hooks/useMessage';

interface MessageConversationCpnProps {
    selectedChatId?: string;
    onShowSearchResults: (results: any[]) => void;
}

const MessageConversationCpn: React.FC<MessageConversationCpnProps> = ({ 
    selectedChatId, 
    onShowSearchResults 
}) => {
    const [messageText, setMessageText] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { searchMessagesInChat } = useMessage();

    const handleSearchMessages = async () => {
        if (!selectedChatId || !searchKeyword.trim()) return;

        try {
            setIsLoading(true);
            const results = await searchMessagesInChat(selectedChatId, searchKeyword.trim());
            onShowSearchResults(results || []);
        } catch (error) {
            console.error('Error searching messages:', error);
            showToast('Lỗi khi tìm kiếm tin nhắn', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchMessages();
        }
    };

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedChatId) return;
        
        // TODO: Implement send message functionality
        console.log('Sending message:', messageText, 'to chat:', selectedChatId);
        setMessageText('');
        showToast('Tin nhắn đã được gửi', 'success');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleImageSelect = () => {
        // TODO: Implement image selection
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                console.log('Selected image:', file.name);
                showToast(`Đã chọn ảnh: ${file.name}`, 'success');
            }
        };
        input.click();
    };

    const handleFileSelect = () => {
        // TODO: Implement file selection
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                console.log('Selected file:', file.name);
                showToast(`Đã chọn file: ${file.name}`, 'success');
            }
        };
        input.click();
    };

    const insertEmoji = () => {
        // Simple emoji insertion
        const emojis = ['😀', '😂', '❤️', '👍', '👏', '🔥', '💯', '🎉'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        setMessageText(prev => prev + randomEmoji);
    };

    const insertNewLine = () => {
        setMessageText(prev => prev + '\n');
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    };

    if (!selectedChatId) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">Chào mừng đến với Chat</h3>
                <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin nhắn..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearchMessages}
                        disabled={isLoading || !searchKeyword.trim()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                    >
                        {isLoading ? '⏳' : '🔍'}
                    </button>
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 flex flex-col justify-center items-center text-gray-500 bg-gray-50">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-lg font-medium mb-2">Cuộc trò chuyện</h3>
                <p className="text-sm">Tin nhắn sẽ hiển thị ở đây</p>
            </div>

            {/* Message Input Area */}
            <div className="border-t border-gray-200 bg-white">
                {/* File Actions Bar */}
                <div className="flex justify-end items-center p-2 border-b border-gray-100">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleImageSelect}
                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chọn hình ảnh"
                        >
                            🖼️
                        </button>
                        <button
                            onClick={handleFileSelect}
                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chọn file"
                        >
                            📁
                        </button>
                    </div>
                </div>

                {/* Message Input */}
                <div className="p-4">
                    <div className="flex items-end space-x-2">
                        {/* Left Action Buttons */}
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={insertEmoji}
                                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Chèn biểu cảm"
                            >
                                😀
                            </button>
                            <button
                                onClick={insertNewLine}
                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xuống hàng"
                            >
                                ↵
                            </button>
                        </div>

                        {/* Message Input */}
                        <div className="flex-1">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                rows={1}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                            title="Gửi tin nhắn (Enter)"
                        >
                            📤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageConversationCpn;
