import React, { useEffect } from 'react';
import { useMessage } from '../../hooks/useMessage';

interface LinksCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
}

const LinksCollectionModal: React.FC<LinksCollectionModalProps> = ({ isOpen, onClose, chatId }) => {
    const { getAllLinksInChat, loading, error, collectionMessages } = useMessage();

    useEffect(() => {
        if (isOpen && chatId) {
            loadLinks();
        }
    }, [isOpen, chatId, getAllLinksInChat]);

    const loadLinks = async () => {
        try {
            await getAllLinksInChat(chatId);
        } catch (error) {
            console.error('Error loading links:', error);
            showToast('Lỗi khi tải danh sách link', 'error');
        }
    };

    // Sử dụng messages từ hook thay vì state local
    const links = collectionMessages || [];

    const handleLinkClick = (linkUrl: string) => {
        // Mở link trong tab mới
        window.open(linkUrl, '_blank');
        showToast('Đang mở link...', 'success');
    };

    const getDomainFromUrl = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return 'Unknown domain';
        }
    };

    const getLinkIcon = (url: string) => {
        const domain = getDomainFromUrl(url).toLowerCase();
        
        if (domain.includes('youtube') || domain.includes('youtu.be')) {
            return '📺';
        } else if (domain.includes('facebook') || domain.includes('fb.com')) {
            return '📘';
        } else if (domain.includes('instagram')) {
            return '📷';
        } else if (domain.includes('twitter') || domain.includes('x.com')) {
            return '🐦';
        } else if (domain.includes('github')) {
            return '🐙';
        } else if (domain.includes('google')) {
            return '🔍';
        } else if (domain.includes('drive.google')) {
            return '📁';
        } else if (domain.includes('docs.google')) {
            return '📝';
        } else {
            return '🔗';
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Link trong cuộc trò chuyện</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-500">Đang tải link...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p>{error}</p>
                        </div>
                    ) : links.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-6xl mb-4">🔗</div>
                            <p className="text-lg">Chưa có link nào trong cuộc trò chuyện</p>
                        </div>
                    ) : (
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="space-y-3">
                                {links.map((link) => {
                                    const icon = getLinkIcon(link.content);
                                    const domain = getDomainFromUrl(link.content);
                                    
                                    return (
                                        <div
                                            key={link._id}
                                            onClick={() => handleLinkClick(link.content)}
                                            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-3xl mt-1">
                                                    {icon}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-medium text-gray-900">
                                                            {domain}
                                                        </h3>
                                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                                            {link.createdAt}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-sm text-blue-600 hover:text-blue-800 truncate mb-2">
                                                        {link.content}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                            Link
                                                        </span>
                                                        
                                                        <div className="flex items-center text-blue-500 hover:text-blue-600">
                                                            <span className="text-sm mr-1">Mở link</span>
                                                            <span>↗</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinksCollectionModal;
