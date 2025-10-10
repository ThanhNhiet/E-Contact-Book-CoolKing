import React from 'react';

interface GradeDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  fail: number;
}

interface LecturerDetailData {
  lecturer_id: string;
  lecturer_name: string;
  faculty_name: string;
  session_name: string;
  total_course_sections: number;
  total_subjects: number;
  total_students: number;
  students_with_scores: number;
  students_passed: number;
  pass_rate: number;
  average_score: number;
  attendance_rate: number;
  subjects_teaching: string[];
  grade_distribution: GradeDistribution;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: LecturerDetailData | null;
}

const LecturerStatisticsDetailModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const {
    lecturer_id,
    lecturer_name,
    faculty_name,
    session_name,
    total_course_sections,
    total_subjects,
    total_students,
    students_with_scores,
    students_passed,
    pass_rate,
    average_score,
    attendance_rate,
    subjects_teaching,
    grade_distribution
  } = data;

  // Calculate percentages for grade distribution chart
  const totalGrades = Object.values(grade_distribution).reduce((sum, count) => sum + count, 0);
  const gradePercentages = totalGrades > 0 ? {
    excellent: (grade_distribution.excellent / totalGrades) * 100,
    good: (grade_distribution.good / totalGrades) * 100,
    fair: (grade_distribution.fair / totalGrades) * 100,
    poor: (grade_distribution.poor / totalGrades) * 100,
    fail: (grade_distribution.fail / totalGrades) * 100
  } : { excellent: 0, good: 0, fair: 0, poor: 0, fail: 0 };

  const statsData = [
    { label: 'Tổng lớp học phần', value: total_course_sections, icon: '🏛️' },
    { label: 'Tổng môn học', value: total_subjects, icon: '📚' },
    { label: 'Tổng sinh viên', value: total_students, icon: '👥' },
    { label: 'Sinh viên có điểm', value: students_with_scores, icon: '📊' },
    { label: 'Sinh viên đậu', value: students_passed, icon: '✅' },
    { label: 'Tỷ lệ đậu', value: `${pass_rate}%`, icon: '🎯' },
    { label: 'Điểm trung bình', value: average_score.toFixed(2), icon: '📈' },
    { label: 'Tỷ lệ điểm danh', value: `${attendance_rate}%`, icon: '📅' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Chi tiết thống kê giảng viên</h2>
              <p className="text-blue-100">
                <span className="font-semibold">{lecturer_name}</span> ({lecturer_id})
              </p>
              <p className="text-blue-100 text-sm">
                {faculty_name} - {session_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors duration-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Subjects Teaching */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📖</span>
              Môn học đang giảng dạy
            </h3>
            {subjects_teaching.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects_teaching.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800"
                  >
                    {subject}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Không có môn học nào</p>
            )}
          </div>

          {/* Grade Distribution Chart */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Phân bố điểm số
            </h3>
            
            {/* Chart Bars */}
            <div className="space-y-4 mb-6">
              {[
                { key: 'excellent', label: 'Xuất sắc (8.5-10)', color: 'bg-green-500', count: grade_distribution.excellent },
                { key: 'good', label: 'Giỏi (7.0-8.4)', color: 'bg-blue-500', count: grade_distribution.good },
                { key: 'fair', label: 'Khá (5.5-6.9)', color: 'bg-yellow-500', count: grade_distribution.fair },
                { key: 'poor', label: 'Trung bình (4.0-5.4)', color: 'bg-orange-500', count: grade_distribution.poor },
                { key: 'fail', label: 'Yếu (<4.0)', color: 'bg-red-500', count: grade_distribution.fail }
              ].map((grade) => (
                <div key={grade.key} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700 mr-4">
                    {grade.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className={`${grade.color} h-6 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${gradePercentages[grade.key as keyof typeof gradePercentages]}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {grade.count} ({gradePercentages[grade.key as keyof typeof gradePercentages].toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grade Distribution Summary */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {Object.entries(grade_distribution).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    excellent: 'Xuất sắc',
                    good: 'Giỏi',
                    fair: 'Khá',
                    poor: 'Trung bình',
                    fail: 'Yếu'
                  };
                  const colors: Record<string, string> = {
                    excellent: 'text-green-600',
                    good: 'text-blue-600',
                    fair: 'text-yellow-600',
                    poor: 'text-orange-600',
                    fail: 'text-red-600'
                  };
                  return (
                    <div key={key} className="text-center">
                      <div className={`text-xl font-bold ${colors[key]}`}>
                        {value}
                      </div>
                      <div className="text-sm text-gray-600">{labels[key]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerStatisticsDetailModal;
