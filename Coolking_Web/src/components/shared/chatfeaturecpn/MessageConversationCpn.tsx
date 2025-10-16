import React, { useState } from 'react';
import { useMessage } from '../../../hooks/useMessage';
import type { ChatMember } from '../../../hooks/useChat';

interface MessageConversationCpnProps {
    selectedChatId?: string;
    onShowSearchResults: (results: any[], members: ChatMember[]) => void;
    members?: ChatMember[];
}

const MessageConversationCpn: React.FC<MessageConversationCpnProps> = ({
    selectedChatId,
    onShowSearchResults,
    members
}) => {
    const [messageText, setMessageText] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { searchMessagesInChat, loading, searchResults } = useMessage();

    const handleSearchMessages = async () => {
        if (!selectedChatId || !searchKeyword.trim()) return;

        try {
            await searchMessagesInChat(selectedChatId, searchKeyword.trim());
        } catch (error) {
            console.error('Error searching messages:', error);
            showToast('Lỗi khi tìm kiếm tin nhắn', 'error');
        }
    };

    // Theo dõi kết quả tìm kiếm từ hook
    React.useEffect(() => {
        if (searchResults && searchResults.length > 0) {
            onShowSearchResults(searchResults, members || []);
        }
    }, [searchResults]);

    // Theo dõi members được truyền từ ChatInfoCpn
    React.useEffect(() => {
        if (members && members.length > 0) {
            console.log('MessageConversation nhận được members:', members);
            // Bạn có thể sử dụng members ở đây để hiển thị thông tin thành viên
            // Ví dụ: hiển thị danh sách thành viên trong dropdown khi @ mention
        }
    }, [members]);

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchMessages();
        }
    };

    const handleSendMessage = () => {
        if (!selectedChatId) return;
        if (!messageText.trim() && !selectedImage && !selectedFile) return;

        // TODO: Implement send message functionality
        if (selectedImage) {
            console.log('Sending image:', selectedImage.name, 'to chat:', selectedChatId);
            showToast(`Đã gửi ảnh: ${selectedImage.name}`, 'success');
        } else if (selectedFile) {
            console.log('Sending file:', selectedFile.name, 'to chat:', selectedChatId);
            showToast(`Đã gửi file: ${selectedFile.name}`, 'success');
        } else {
            console.log('Sending message:', messageText, 'to chat:', selectedChatId);
            showToast('Tin nhắn đã được gửi', 'success');
        }

        // Clear all inputs
        setMessageText('');
        clearSelection();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        setMessageText(e.target.value);
        
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate the new height based on content
        const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
        textarea.style.height = `${newHeight}px`;
    };

    const handleImageSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Kiểm tra kích thước file (25MB = 25 * 1024 * 1024 bytes)
                if (file.size > 25 * 1024 * 1024) {
                    showToast('Kích thước ảnh phải <= 25MB', 'error');
                    return;
                }

                // Clear file nếu đang chọn ảnh
                setSelectedFile(null);
                setSelectedImage(file);

                // Tạo preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);

                showToast(`Đã chọn ảnh: ${file.name}`, 'success');
            }
        };
        input.click();
    };

    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Kiểm tra kích thước file (25MB)
                if (file.size > 25 * 1024 * 1024) {
                    showToast('Kích thước file phải <= 25MB', 'error');
                    return;
                }

                // Clear image nếu đang chọn file
                setSelectedImage(null);
                setImagePreview(null);
                setSelectedFile(file);

                showToast(`Đã chọn file: ${file.name}`, 'success');
            }
        };
        input.click();
    };

    const clearSelection = () => {
        setSelectedImage(null);
        setSelectedFile(null);
        setImagePreview(null);
    };

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
            <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin nhắn..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearchMessages}
                        disabled={loading || !searchKeyword.trim()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v4H9v-4" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 flex flex-col justify-center items-center text-gray-500 bg-gray-50">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-lg font-medium mb-2">Cuộc trò chuyện</h3>
                <p className="text-sm">Tin nhắn sẽ hiển thị ở đây</p>
            </div>


            {/* Message Input */}
            <div className="p-2 border-t border-gray-200">
                {/* Preview Section */}
                {(selectedImage || selectedFile) && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {selectedImage && imagePreview && (
                                    <>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-12 h-12 object-cover rounded border"
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{selectedImage.name}</p>
                                            <p className="text-gray-500">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </>
                                )}
                                {selectedFile && (
                                    <>
                                        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-gray-500">
                                                {getFileExtension(selectedFile.name).toUpperCase()} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={clearSelection}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                title="Xóa file đã chọn"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Section */}
                <div className="flex items-end space-x-2">
                    {/* Left Action Buttons */}
                    <div className="flex items-center space-x-1 pb-2">
                        <button
                            onClick={handleImageSelect}
                            className="w-10 h-10 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Chọn ảnh"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleFileSelect}
                            className="w-10 h-10 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Chọn file"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                    </div>

                    {/* Message Input */}
                    <div className="flex-1">
                        <textarea
                            value={messageText}
                            onChange={handleTextareaChange}
                            onKeyPress={handleKeyPress}
                            placeholder={selectedImage || selectedFile ? "Không thể soạn tin nhắn khi có file đính kèm" : "Nhập tin nhắn..."}
                            disabled={!!(selectedImage || selectedFile)}
                            rows={1}
                            className="text-base w-full p-2 outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed overflow-hidden"
                            style={{ minHeight: '40px', maxHeight: '120px', height: '40px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <div className="pb-1">
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() && !selectedImage && !selectedFile}
                            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center justify-center"
                            title="Gửi tin nhắn (Enter)"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageConversationCpn;
