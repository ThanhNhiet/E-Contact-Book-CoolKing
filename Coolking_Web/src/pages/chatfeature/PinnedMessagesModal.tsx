import React from 'react';
import type { Message } from '../../hooks/useMessage';
import type { ChatMember } from '../../hooks/useChat';

interface PinnedMessagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pinnedMessages: Message[];
    onUnpinMessage: (messageId: string) => void;
    onNavigateToMessage: (messageId: string) => void;
    getSenderName: (senderID: string) => string;
    members?: ChatMember[];
}

const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
    isOpen,
    onClose,
    pinnedMessages,
    onUnpinMessage,
    onNavigateToMessage,
    getSenderName
}) => {
    const formatMessageContent = (message: Message) => {
        switch (message.type.toLowerCase()) {
            case 'image':
                return '🖼️ Hình ảnh';
            case 'file':
                return `📁 ${message.filename || 'File'}`;
            case 'link':
                return `🔗 ${message.content}`;
            default:
                return message.content;
        }
    };

    const formatReplyContent = (replyTo: any) => {
        switch (replyTo.type.toLowerCase()) {
            case 'image':
                return '🖼️ Hình ảnh';
            case 'file':
                return '📁 File';
            default:
                return replyTo.content;
        }
    };

    const handleNavigateAndClose = (messageId: string) => {
        onNavigateToMessage(messageId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl h-4/5 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Tin nhắn đã ghim</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {pinnedMessages.length > 0 
                                ? `${pinnedMessages.length} tin nhắn đã ghim` 
                                : 'Không có tin nhắn nào được ghim'
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {pinnedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-6xl mb-4">📌</div>
                            <p className="text-lg mb-2">Chưa có tin nhắn nào được ghim</p>
                            <p className="text-sm">Nhấp chuột phải vào tin nhắn để ghim</p>
                        </div>
                    ) : (
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="space-y-4">
                                {pinnedMessages.map((message) => (
                                    <div
                                        key={message._id}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                    >
                                        {/* Reply Reference if exists */}
                                        {message.replyTo && (
                                            <div className="mb-2 pl-4 border-l-2 border-gray-300">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    Trả lời {message.replyTo.senderInfo?.userName || 'Unknown User'}
                                                </div>
                                                <div className="text-sm text-gray-600 italic">
                                                    {formatReplyContent(message.replyTo)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {getSenderName(message.senderInfo?.userID || message.senderID || '')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {message.createdAt}
                                                    </span>
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                        📌 Đã ghim
                                                    </span>
                                                </div>

                                                <div className="mb-2">
                                                    <p className="text-gray-800 break-words">
                                                        {formatMessageContent(message)}
                                                    </p>
                                                </div>

                                                {/* Pinned Info */}
                                                {message.pinnedInfo && (
                                                    <div className="text-xs text-gray-500">
                                                        Được ghim bởi {message.pinnedInfo.pinnedByinfo?.userName || 'Unknown'} • {message.pinnedInfo.pinnedDate}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleNavigateAndClose(message._id)}
                                                    className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Đi đến tin nhắn"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => onUnpinMessage(message._id)}
                                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Gỡ ghim"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            Tin nhắn được ghim sẽ hiển thị cho tất cả thành viên
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PinnedMessagesModal;
