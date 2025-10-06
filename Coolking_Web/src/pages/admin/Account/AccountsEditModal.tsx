import React, { useState, useEffect } from 'react';
import { useAccount, type Account } from '../../../hooks/useAccount';

interface AccountsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  account: Account | null;
}

interface EditAccountData {
  status: 'ACTIVE' | 'INACTIVE';
  email: string;
  phone_number: string;
}

const AccountsEditModal: React.FC<AccountsEditModalProps> = ({ isOpen, onClose, onSuccess, account }) => {
  const { updateAccount } = useAccount();
  
  const [formData, setFormData] = useState<EditAccountData>({
    status: 'ACTIVE',
    email: '',
    phone_number: ''
  });

  const [originalData, setOriginalData] = useState<EditAccountData>({
    status: 'ACTIVE',
    email: '',
    phone_number: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load account data when modal opens
  useEffect(() => {
    if (isOpen && account) {
      const data = {
        status: account.status as 'ACTIVE' | 'INACTIVE',
        email: account.email || '',
        phone_number: account.phone_number || ''
      };
      setFormData(data);
      setOriginalData(data);
      setServerError(null);
    }
  }, [isOpen, account]);

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    // Email is optional, but if provided must be valid format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
    // Phone is optional, but if provided must be 10 digits
    if (formData.phone_number && formData.phone_number.length !== 10) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !validateForm() || !hasChanges()) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await updateAccount(account.user_id, formData);
      onSuccess(`Đã cập nhật tài khoản ${account.user_id} thành công!`);
      onClose();
    } catch (error: any) {
      console.error('Update account error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi server không xác định';
      setServerError(`Lỗi cập nhật tài khoản: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa tài khoản</h2>
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
          <form id="edit-account-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={account.user_id}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <input
              type="text"
              value={account.role}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày tạo
            </label>
            <input
              type="text"
              value={account.createdAt}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cập nhật lần cuối
            </label>
            <input
              type="text"
              value={account.updatedAt}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          {/* Editable fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              pattern="[0-9]{10}"
              maxLength={10}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
            form="edit-account-form"
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

export default AccountsEditModal;
