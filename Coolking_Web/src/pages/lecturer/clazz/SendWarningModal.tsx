import React, { useState } from 'react';
import type { StudentWithScore, courseSectionWithStudents } from '../../../hooks/useStudent';

interface SendWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithScore;
  courseSectionData: courseSectionWithStudents;
}

const SendWarningModal: React.FC<SendWarningModalProps> = ({
  isOpen,
  onClose,
  student,
  courseSectionData
}) => {
  const defaultTitle = `Cảnh báo học vụ - ${student.name} - ${student.student_id}`;
  const defaultContent = `Thông báo đến sinh viên ${student.name} (MSSV: ${student.student_id}) và Quý Phụ huynh.

Trong môn học '${courseSectionData.subjectName}' (mã lớp học phần: ${courseSectionData.course_section_id}), thuộc lớp ${courseSectionData.className}, học kỳ ${courseSectionData.sessionName}, tôi nhận thấy rằng:

Kết quả học tập vừa qua của em đang ở mức dưới trung bình. Đây là kết quả rất đáng lo ngại và có ảnh hưởng lớn đến điểm tổng kết của môn học. Kết quả này cho thấy em đang bị hổng kiến thức nghiêm trọng và có nguy cơ rất cao sẽ không đạt môn học này.

Đề nghị sinh viên nghiêm túc xem lại và củng cố lại toàn bộ kiến thức đã học và bài kiểm tra vừa rồi. Lên kế hoạch học tập chi tiết cho phần còn lại của học kỳ.

Nhà trường và giảng viên luôn tạo điều kiện hỗ trợ, nhưng sự nỗ lực từ chính bản thân em mới là yếu tố quyết định.

Trân trọng,
${courseSectionData.lecturerName}`;

  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      // TODO: Call actual API to send warning
      console.log('Sending warning:', { title, content, student });
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Gửi cảnh báo học vụ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={sending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Student Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Thông tin sinh viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Họ tên:</span> {student.name}</div>
              <div><span className="font-medium">MSSV:</span> {student.student_id}</div>
              <div><span className="font-medium">Ngày sinh:</span> {student.dob}</div>
              <div><span className="font-medium">Đánh giá:</span> {student.initial_evaluate}</div>
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập tiêu đề cảnh báo"
              disabled={sending}
            />
          </div>

          {/* Content Textarea */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Nhập nội dung cảnh báo"
              disabled={sending}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !content.trim()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {sending && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {sending ? 'Đang gửi...' : 'Gửi cảnh báo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendWarningModal;
