import React, { useState, useEffect } from 'react';
import { useMessage } from '../../../hooks/useMessage';
import { useMessageConversation } from '../../../hooks/hookSP_MessageConversation';
import type { ChatMember } from '../../../hooks/useChat';
import type { Message } from '../../../hooks/useMessage';
import authService from '../../../services/authService';
import PinnedMessagesModal from '../../../pages/chatfeature/PinnedMessagesModal';

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
    // User info
    const tokenData = authService.parseToken();
    const current_user_id = tokenData?.user_id;

    // Search states
    const [searchKeyword, setSearchKeyword] = useState('');
    const [hasShownResults, setHasShownResults] = useState(false);
    const { searchMessagesInChat, loading: searchLoading, searchResults, clearSearchResults } = useMessage();

    // Main conversation hook
    const {
        messageText,
        setMessageText,
        selectedFiles,
        replyState,
        contextMenu,
        showImageZoom,
        setShowImageZoom,
        showPinnedModal,
        setShowPinnedModal,
        allMessages,
        loading,
        latestPinnedMessage,
        pinnedMessages,
        messagesEndRef,
        messagesContainerRef,
        fileInputRef,
        handleFileSelect,
        handlePaste,
        removeFile,
        handleSendMessage,
        startReply,
        clearReply,
        handleContextMenu,
        closeContextMenu,
        handlePinMessage,
        handleUnpinMessage,
        handleDeleteMessage,
        scrollToMessage,
        showToast,
        hasSelectedFiles,
        isAutoLoading
    } = useMessageConversation(selectedChatId, current_user_id);

    // Search functionality
    const handleSearchMessages = async () => {
        if (!selectedChatId || !searchKeyword.trim()) return;

        try {
            await searchMessagesInChat(selectedChatId, searchKeyword.trim());
        } catch (error) {
            console.error('Error searching messages:', error);
            showToast('Lỗi khi tìm kiếm tin nhắn', 'error');
        }
    };

    // Handle search results - chỉ gọi 1 lần cho mỗi search
    useEffect(() => {
        if (searchResults && searchResults.length > 0 && !hasShownResults) {
            console.log('MessageConversationCpn calling onShowSearchResults due to searchResults change');
            onShowSearchResults(searchResults, members || []);
            setHasShownResults(true);
        }
    }, [searchResults]); // Chỉ theo dõi searchResults, không theo dõi members và onShowSearchResults

    // Reset hasShownResults khi search keyword thay đổi
    useEffect(() => {
        setHasShownResults(false);
    }, [searchKeyword]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeContextMenu();
                clearReply();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchMessages();
        }
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
        
        // Auto-resize
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = `${newHeight}px`;
    };

    // Message rendering helpers
    const formatMessageContent = (message: Message) => {
        if (message.isDeleted) {
            return (
                <span className="text-gray-400 italic">Tin nhắn đã bị thu hồi</span>
            );
        }

        switch (message.type.toLowerCase()) {
            case 'image':
                // Handle multiple images separated by commas
                const imageUrls = message.content.split(',').map(url => url.trim()).filter(url => url);
                
                if (imageUrls.length === 1) {
                    // Single image
                    return (
                        <img 
                            src={imageUrls[0]} 
                            alt="Shared image"
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowImageZoom({ show: true, src: imageUrls[0] })}
                        />
                    );
                } else if (imageUrls.length > 1) {
                    // Multiple images in a grid
                    return (
                        <div className={`grid gap-2 max-w-xs ${
                            imageUrls.length === 2 ? 'grid-cols-2' : 
                            imageUrls.length === 3 ? 'grid-cols-2' :
                            'grid-cols-2'
                        }`}>
                            {imageUrls.slice(0, 4).map((url, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={url} 
                                        alt={`Shared image ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setShowImageZoom({ show: true, src: url })}
                                    />
                                    {index === 3 && imageUrls.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-semibold">+{imageUrls.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                } else {
                    return <span className="text-gray-400">Không có hình ảnh</span>;
                }
            case 'file':
                return (
                    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg max-w-xs">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {message.filename || 'File'}
                            </p>
                            <a 
                                href={message.content} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-600"
                            >
                                Tải xuống
                            </a>
                        </div>
                    </div>
                );
            case 'link':
                return (
                    <a 
                        href={message.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 underline break-words"
                    >
                        {message.content}
                    </a>
                );
            default:
                return <span className="break-words">{message.content}</span>;
        }
    };

    const renderReplyReference = (replyTo: any) => {
        let replyContent = replyTo.content;
        
        if (replyTo.type === 'image') {
            const imageUrls = replyTo.content.split(',').map((url: string) => url.trim()).filter((url: string) => url);
            replyContent = imageUrls.length > 1 ? `🖼️ ${imageUrls.length} hình ảnh` : '🖼️ Hình ảnh';
        } else if (replyTo.type === 'file') {
            replyContent = '📁 File';
        }
        
        return (
            <div 
                className="mb-2 pl-3 border-l-2 border-blue-400 bg-blue-50 rounded-r cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => scrollToMessage(replyTo.messageID)}
            >
                <div className="text-xs text-blue-600 font-medium">
                    {replyTo.senderInfo?.userName || replyTo.senderInfo?.name || 'Unknown User'}
                </div>
                <div className="text-sm text-gray-700 truncate">
                    {replyContent}
                </div>
            </div>
        );
    };

    const renderMessage = (message: Message) => {
        const isOwnMessage = (message.senderInfo?.userID || message.senderID) === current_user_id;
        const senderName = message.senderInfo?.name || 'Unknown User';

        // Touch events for mobile
        let touchTimer: number;
        const handleTouchStart = (e: React.TouchEvent) => {
            touchTimer = window.setTimeout(() => {
                // Simulate context menu on long press
                const touch = e.touches[0];
                const syntheticEvent = {
                    preventDefault: () => {},
                    clientX: touch.clientX,
                    clientY: touch.clientY
                } as React.MouseEvent;
                handleContextMenu(syntheticEvent, message);
            }, 500); // 500ms long press
        };

        const handleTouchEnd = () => {
            clearTimeout(touchTimer);
        };

        return (
            <div
                key={message._id}
                id={`message-${message._id}`}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}
                onContextMenu={(e) => handleContextMenu(e, message)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                } transition-all duration-200`}>
                    
                    {/* Sender name for group chats */}
                    {!isOwnMessage && (
                        <div className="text-xs text-gray-600 mb-1 font-medium">
                            {senderName}
                        </div>
                    )}

                    {/* Reply reference */}
                    {message.replyTo && renderReplyReference(message.replyTo)}

                    {/* Message content */}
                    <div className="mb-1">
                        {formatMessageContent(message)}
                    </div>

                    {/* Timestamp and status */}
                    <div className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'} flex items-center justify-between`}>
                        <span>{message.createdAt}</span>
                        {message.pinnedInfo && (
                            <span className="ml-2">📌</span>
                        )}
                    </div>
                </div>
            </div>
        );
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

    try {
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
                        disabled={searchLoading || !searchKeyword.trim()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                    >
                        {searchLoading ? (
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

            {/* Pinned Message Bar */}
            {latestPinnedMessage && (
                <div 
                    className="p-3 bg-yellow-50 border-b border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => setShowPinnedModal(true)}
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">📌</span>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-yellow-800 truncate">
                                <strong>{latestPinnedMessage.senderInfo?.name || 'Unknown User'}:</strong> {' '}
                                {(() => {
                                    if (latestPinnedMessage.type === 'image') {
                                        const imageUrls = latestPinnedMessage.content.split(',').map((url: string) => url.trim()).filter((url: string) => url);
                                        return imageUrls.length > 1 ? `🖼️ ${imageUrls.length} hình ảnh` : '🖼️ Hình ảnh';
                                    } else if (latestPinnedMessage.type === 'file') {
                                        return '📁 File';
                                    } else {
                                        return latestPinnedMessage.content;
                                    }
                                })()}
                            </div>
                        </div>
                        <span className="text-xs text-yellow-600">
                            {pinnedMessages.length > 1 && `+${pinnedMessages.length - 1}`}
                        </span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {/* Auto loading indicator at top */}
                {isAutoLoading && (
                    <div className="flex justify-center items-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-500 text-xs">Đang tải thêm tin nhắn...</span>
                    </div>
                )}

                {loading && !isAutoLoading && (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-500 text-sm">Đang tải tin nhắn...</span>
                    </div>
                )}

                {allMessages.map((message) => renderMessage(message))}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Bar */}
            {replyState.isReplying && replyState.message && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-blue-600">
                                Trả lời {replyState.message.senderInfo?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                                {replyState.message.type === 'image' ? '🖼️ Hình ảnh' : 
                                 replyState.message.type === 'file' ? '📁 File' : 
                                 replyState.message.content}
                            </div>
                        </div>
                        <button
                            onClick={clearReply}
                            className="p-1 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* File Preview */}
            {hasSelectedFiles && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((fileWithPreview) => (
                            <div key={fileWithPreview.id} className="relative">
                                {fileWithPreview.file.type.startsWith('image/') ? (
                                    <div className="relative">
                                        <img 
                                            src={fileWithPreview.preview} 
                                            alt="Preview" 
                                            className="w-16 h-16 object-cover rounded border"
                                        />
                                        <button
                                            onClick={() => removeFile(fileWithPreview.id)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative p-2 bg-blue-100 rounded border w-16 h-16 flex flex-col items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs text-blue-600 truncate w-full text-center">
                                            {fileWithPreview.file.name.split('.').pop()?.toUpperCase()}
                                        </span>
                                        <button
                                            onClick={() => removeFile(fileWithPreview.id)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                    {/* Left Action Buttons */}
                    <div className="flex items-center space-x-1 pb-2">
                        <button
                            onClick={() => handleFileSelect(true, 'image/*')}
                            className="w-10 h-10 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Chọn ảnh (tối đa 10)"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleFileSelect(true, '*/*')}
                            className="w-10 h-10 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Chọn file (tối đa 10)"
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
                            onPaste={handlePaste}
                            placeholder={hasSelectedFiles ? "Không thể soạn tin nhắn khi có file đính kèm" : "Nhập tin nhắn... (Ctrl+V để dán ảnh)"}
                            disabled={hasSelectedFiles}
                            rows={1}
                            className="text-base w-full p-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-hidden disabled:bg-gray-100 disabled:cursor-not-allowed"
                            style={{ minHeight: '40px', maxHeight: '120px', height: '40px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <div className="pb-1">
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() && !hasSelectedFiles || loading}
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

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
            />

            {/* Context Menu */}
            {contextMenu.isOpen && contextMenu.message && (
                <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 min-w-[150px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <button
                        onClick={() => startReply(contextMenu.message!)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    >
                        Trả lời
                    </button>
                    <button
                        onClick={() => handlePinMessage(contextMenu.message!)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    >
                        Ghim tin nhắn
                    </button>
                    {((contextMenu.message.senderInfo?.userID || contextMenu.message.senderID) === current_user_id) && (
                        <button
                            onClick={() => handleDeleteMessage(contextMenu.message!._id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
                        >
                            Thu hồi tin nhắn
                        </button>
                    )}
                </div>
            )}

            {/* Image Zoom Modal */}
            {showImageZoom.show && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageZoom({ show: false, src: '' })}
                >
                    <img 
                        src={showImageZoom.src} 
                        alt="Zoomed image"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setShowImageZoom({ show: false, src: '' })}
                        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Pinned Messages Modal */}
            <PinnedMessagesModal
                isOpen={showPinnedModal}
                onClose={() => setShowPinnedModal(false)}
                pinnedMessages={pinnedMessages}
                onUnpinMessage={handleUnpinMessage}
                onNavigateToMessage={scrollToMessage}
                getSenderName={(senderID) => {
                    // Tìm từ pinnedMessages hoặc members
                    const message = pinnedMessages.find(msg => 
                        (msg.senderInfo?.userID || msg.senderID) === senderID
                    );
                    if (message?.senderInfo?.name) {
                        return message.senderInfo.name;
                    }
                    const member = members?.find(m => m.userID === senderID);
                    return member ? member.userName : senderID;
                }}
                members={members}
            />

            {/* Click outside to close context menu */}
            {contextMenu.isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeContextMenu}
                />
            )}
        </div>
    );
    } catch (error) {
        console.error('Error in MessageConversationCpn:', error);
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium mb-2">Có lỗi xảy ra</h3>
                <p className="text-sm">Vui lòng tải lại trang hoặc chọn chat khác</p>
            </div>
        );
    }
};

export default MessageConversationCpn;
