import React from 'react';
import type { StudentWithScore } from '../../../hooks/useStudent';

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithScore;
  studentInfo: any;
  loading: boolean;
}

const StudentInfoModal: React.FC<StudentInfoModalProps> = ({
  isOpen,
  onClose,
  student,
  studentInfo,
  loading
}) => {
  if (!isOpen) return null;

  const formatScore = (score: number | null) => {
    return score !== null && score !== undefined ? score.toFixed(1) : '-';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Thông tin chi tiết sinh viên</h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center">
                <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Đang tải thông tin...</span>
              </div>
            </div>
          ) : studentInfo ? (
            <div className="space-y-6">
              {/* Basic Student Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Thông tin cá nhân</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">MSSV:</span>
                    <div className="text-base font-semibold text-gray-800">{studentInfo.student_id}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Họ tên:</span>
                    <div className="text-base font-semibold text-gray-800">{studentInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ngày sinh:</span>
                    <div className="text-base text-gray-800">{studentInfo.dob}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Giới tính:</span>
                    <div className="text-base text-gray-800">{studentInfo.gender}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Số điện thoại:</span>
                    <div className="text-base text-gray-800">{studentInfo.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <div className="text-base text-gray-800">{studentInfo.email}</div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Địa chỉ:</span>
                    <div className="text-base text-gray-800">{studentInfo.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Thông tin học tập</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Lớp:</span>
                    <div className="text-base font-semibold text-gray-800">{studentInfo.className}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Khoa:</span>
                    <div className="text-base font-semibold text-gray-800">{studentInfo.facultyName}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ngành:</span>
                    <div className="text-base font-semibold text-gray-800">{studentInfo.majorName}</div>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              {studentInfo.parent && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Thông tin phụ huynh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Mã phụ huynh:</span>
                      <div className="text-base font-semibold text-gray-800">{studentInfo.parent.parent_id}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Họ tên:</span>
                      <div className="text-base font-semibold text-gray-800">{studentInfo.parent.name}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Giới tính:</span>
                      <div className="text-base text-gray-800">{studentInfo.parent.gender}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Số điện thoại:</span>
                      <div className="text-base text-gray-800">{studentInfo.parent.phone}</div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <div className="text-base text-gray-800">{studentInfo.parent.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scores Info */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Điểm số trong lớp học phần</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">LT TK1</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.theo_regular1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">LT TK2</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.theo_regular2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">LT TK3</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.theo_regular3)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">TH TK1</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.pra_regular1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">TH TK2</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.pra_regular2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">TH TK3</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.pra_regular3)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">Giữa kỳ</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.mid)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">Cuối kỳ</div>
                    <div className="text-lg font-semibold text-gray-800">{formatScore(student.score.final)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">Trung bình</div>
                    <div className="text-xl font-bold text-blue-600">{formatScore(student.score.avr)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">Đánh giá</div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded ${
                      student.initial_evaluate === 'ok' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.initial_evaluate === 'ok' ? 'Bình thường' : 'Cần cảnh báo'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không thể tải thông tin sinh viên
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentInfoModal;
