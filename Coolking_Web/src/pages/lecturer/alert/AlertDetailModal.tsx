import React from 'react';
import type { Alert } from '../../../hooks/useAlert';

interface AlertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ isOpen, onClose, alert }) => {
  if (!isOpen || !alert) return null;

  const getScopeText = (scope: string) => {
    return scope === 'all' ? 'Hệ thống' : 'Cá nhân';
  };

  const getReceiverText = (receiverID: string) => {
    return receiverID === 'All' ? 'Tất cả người dùng' : `${receiverID}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết thông báo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Alert Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID thông báo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {alert._id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phạm vi
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {getScopeText(alert.targetScope)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người gửi
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {alert.senderID}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người nhận
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {getReceiverText(alert.receiverID)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tạo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {alert.createdAt}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {alert.updatedAt}
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-lg font-semibold text-blue-900">
                  {alert.header}
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung
              </label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {alert.body}
                </p>
              </div>
            </div>

            {/* Read Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái đọc
              </label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                alert.isRead 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  alert.isRead ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                {alert.isRead ? 'Đã đọc' : 'Chưa đọc'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
