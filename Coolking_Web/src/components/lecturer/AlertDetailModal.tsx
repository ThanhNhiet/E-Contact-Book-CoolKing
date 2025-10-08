import React from 'react';
import type { Alert } from '../../hooks/useAlert';

interface AlertDetailModalProps {
    alert: Alert | null;
    isOpen: boolean;
    onClose: () => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, isOpen, onClose }) => {
    if (!isOpen || !alert) return null;

    const formatTargetScope = (targetScope: string) => {
        return targetScope === 'all' ? 'Toàn trường' : 'Cá nhân';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[100vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Chi tiết thông báo</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Header Info */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {alert.header}
                            </h3>
                            {!alert.isRead && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Chưa đọc
                                </span>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium text-gray-800">Người gửi:</span>
                                <div className="mt-1">{alert.senderID}</div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-800">Phạm vi:</span>
                                <div className="mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        alert.targetScope === 'all' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        {formatTargetScope(alert.targetScope)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-800">Ngày gửi:</span>
                                <div className="mt-1">{alert.createdAt}</div>
                            </div>
                        </div>
                        
                        {alert.updatedAt && (
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium text-gray-800">Cập nhật lần cuối:</span>
                                <span className="ml-2">{alert.updatedAt}</span>
                            </div>
                        )}
                    </div>

                    {/* Body Content */}
                    <div className="border-t pt-6">
                        <h4 className="font-medium text-gray-800 mb-3">Nội dung:</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {alert.body}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-2 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertDetailModal;