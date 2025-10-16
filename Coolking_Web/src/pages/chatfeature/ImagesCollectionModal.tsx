import React, { useState, useEffect } from 'react';
import { useMessage } from '../../hooks/useMessage';

interface ImagesCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
}

const ImagesCollectionModal: React.FC<ImagesCollectionModalProps> = ({ isOpen, onClose, chatId }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { getAllImagesInChat, loading, error, messages } = useMessage();

    useEffect(() => {
        if (isOpen && chatId) {
            loadImages();
        }
    }, [isOpen, chatId, getAllImagesInChat]);

    const loadImages = async () => {
        try {
            await getAllImagesInChat(chatId);
        } catch (error) {
            console.error('Error loading images:', error);
            showToast('Lỗi khi tải danh sách ảnh', 'error');
        }
    };

    // Sử dụng messages từ hook thay vì state local
    const images = messages || [];

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const closeImageViewer = () => {
        setSelectedImage(null);
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
                    <h2 className="text-lg font-semibold text-gray-900">Ảnh trong cuộc trò chuyện</h2>
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
                            <span className="ml-2 text-gray-500">Đang tải ảnh...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p>{error}</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-6xl mb-4">🖼️</div>
                            <p className="text-lg">Chưa có ảnh nào trong cuộc trò chuyện</p>
                        </div>
                    ) : (
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((image) => (
                                    <div
                                        key={image._id}
                                        className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => handleImageClick(image.content)}
                                    >
                                        <div className="aspect-square relative">
                                            <img
                                                src={image.content}
                                                alt="Chat image"
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://via.placeholder.com/200x200/6B7280/FFFFFF?text=Lỗi+ảnh';
                                                }}
                                            />
                                        </div>
                                        <div className="p-2">
                                            <p className="text-xs text-gray-500 truncate">
                                                {image.createdAt}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-60 flex items-center justify-center p-4"
                    onClick={closeImageViewer}
                >
                    <div className="relative max-w-full max-h-full">
                        <button
                            onClick={closeImageViewer}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 z-10"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/400x400/6B7280/FFFFFF?text=Không+thể+tải+ảnh';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagesCollectionModal;
