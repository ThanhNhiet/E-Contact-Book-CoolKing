import React, { useState, useEffect } from 'react';
import { useAlert } from '../../../hooks/useAlertAD';
import type { Alert } from '../../../hooks/useAlertAD';

interface EditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  alert: Alert | null;
}

interface EditAlertData {
  header: string;
  body: string;
}

const EditFormModal: React.FC<EditFormModalProps> = ({ isOpen, onClose, onSuccess, alert }) => {
  const { updateAlert } = useAlert();
  
  const [formData, setFormData] = useState<EditAlertData>({
    header: '',
    body: ''
  });

  const [originalData, setOriginalData] = useState<EditAlertData>({
    header: '',
    body: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load alert data when modal opens
  useEffect(() => {
    if (isOpen && alert) {
      const data = {
        header: alert.header,
        body: alert.body
      };
      setFormData(data);
      setOriginalData(data);
      setServerError(null);
    }
  }, [isOpen, alert]);

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    return formData.header.trim() && formData.body.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alert || !validateForm() || !hasChanges()) return;

    setIsSubmitting(true);
    setServerError(null);
    
    try {
      await updateAlert(alert._id, formData.header, formData.body);
      onSuccess(`Đã cập nhật thông báo "${formData.header}" thành công!`);
      onClose();
    } catch (error: any) {
      console.error('Update alert error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi server không xác định';
      setServerError(`Lỗi cập nhật thông báo: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa thông báo</h2>
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
          <form id="edit-alert-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Read-only fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID thông báo
              </label>
              <input
                type="text"
                value={alert._id}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <input
                type="text"
                value={alert.createdAt}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Editable fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.header}
                onChange={(e) => setFormData(prev => ({ ...prev, header: e.target.value }))}
                placeholder="Nhập tiêu đề thông báo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Nhập nội dung thông báo"
                rows={6}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Server Error Display */}
            {serverError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{serverError}</p>
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="edit-alert-form"
            disabled={!validateForm() || !hasChanges() || isSubmitting}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFormModal;