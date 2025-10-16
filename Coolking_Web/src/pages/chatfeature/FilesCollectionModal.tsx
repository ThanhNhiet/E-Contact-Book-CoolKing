import React, { useEffect } from 'react';
import { useMessage } from '../../hooks/useMessage';

interface FilesCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
}

const FilesCollectionModal: React.FC<FilesCollectionModalProps> = ({ isOpen, onClose, chatId }) => {
    const { getAllFilesInChat, loading, error, messages } = useMessage();

    useEffect(() => {
        if (isOpen && chatId) {
            loadFiles();
        }
    }, [isOpen, chatId, getAllFilesInChat]);

    const loadFiles = async () => {
        try {
            await getAllFilesInChat(chatId);
        } catch (error) {
            console.error('Error loading files:', error);
            showToast('Lỗi khi tải danh sách file', 'error');
        }
    };

    // Sử dụng messages từ hook thay vì state local
    const files = messages || [];

    const handleFileClick = (fileUrl: string, filename: string | null) => {
        // Mở file trong tab mới
        window.open(fileUrl, '_blank');
        showToast(`Đang mở file: ${filename || 'File'}`, 'success');
    };

    const getFileExtension = (filename: string | null, url: string) => {
        if (filename) {
            return filename.split('.').pop()?.toLowerCase() || '';
        }
        // Lấy extension từ URL nếu không có filename
        try {
            const urlPath = new URL(url).pathname;
            return urlPath.split('.').pop()?.toLowerCase() || '';
        } catch {
            return '';
        }
    };

    const getFileIcon = (extension: string) => {
        const ext = extension.toLowerCase();
        switch (ext) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📋';
            case 'txt':
                return '📃';
            case 'zip':
            case 'rar':
            case '7z':
                return '🗜️';
            default:
                return '📁';
        }
    };

    const formatFileSize = () => {
        // Không thể lấy được file size từ URL, chỉ hiển thị placeholder
        return 'Unknown size';
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
                    <h2 className="text-lg font-semibold text-gray-900">File trong cuộc trò chuyện</h2>
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
                            <span className="ml-2 text-gray-500">Đang tải file...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p>{error}</p>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-6xl mb-4">📁</div>
                            <p className="text-lg">Chưa có file nào trong cuộc trò chuyện</p>
                        </div>
                    ) : (
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="space-y-2">
                                {files.map((file) => {
                                    const extension = getFileExtension(file.filename, file.content);
                                    const icon = getFileIcon(extension);
                                    
                                    return (
                                        <div
                                            key={file._id}
                                            onClick={() => handleFileClick(file.content, file.filename)}
                                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                            <div className="text-3xl mr-3">
                                                {icon}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {file.filename || 'Unnamed file'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                        {file.createdAt}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <span className="uppercase font-mono bg-gray-200 px-1 rounded text-xs">
                                                            {extension || 'FILE'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatFileSize()}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center text-blue-500 hover:text-blue-600">
                                                        <span className="text-sm mr-1">Mở file</span>
                                                        <span>↗</span>
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

export default FilesCollectionModal;
