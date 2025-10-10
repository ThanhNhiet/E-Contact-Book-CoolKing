import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderLeCpn from '../../../components/lecturer/HeaderLeCpn';
import FooterLeCpn from '../../../components/lecturer/FooterLeCpn';
import { useSchedule, type Schedule } from '../../../hooks/useSchedule';

// Custom styles for react-datepicker
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: auto;
  }
  .react-datepicker__input-container input {
    width: 120px;
    text-align: center;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    outline: none;
    cursor: pointer;
  }
  .react-datepicker__input-container input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const SchedulePage: React.FC = () => {
    const { loading, error, schedules, linkPrev, linkNext, weekStart, getSchedulesByUser } = useSchedule();
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Khởi tạo với ngày hiện tại
    useEffect(() => {
        const today = new Date();
        const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        setSelectedDate(formattedToday);
        getSchedulesByUser(formattedToday);
    }, [getSchedulesByUser]);



    // Chuyển đổi định dạng ngày từ dd-MM-yyyy sang dd/MM/yyyy
    const convertDateFormat = (dateString: string): string => {
        if (!dateString) return '';
        return dateString.replace(/-/g, '/');
    };

    // Chuyển đổi từ string dd/MM/yyyy sang Date object
    const convertStringToDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
    };

    // Chuyển đổi từ Date object sang string dd/MM/yyyy
    const convertDateToString = (date: Date): string => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };



    // Xử lý nút tuần trước
    const handlePrevWeek = () => {
        if (linkPrev) {
            const urlParams = new URLSearchParams(linkPrev.split('?')[1]);
            const prevDate = urlParams.get('currentDate');
            if (prevDate) {
                const formattedDate = convertDateFormat(prevDate);
                setSelectedDate(formattedDate);
                getSchedulesByUser(formattedDate);
            }
        }
    };

    // Xử lý nút tuần sau
    const handleNextWeek = () => {
        if (linkNext) {
            const urlParams = new URLSearchParams(linkNext.split('?')[1]);
            const nextDate = urlParams.get('currentDate');
            if (nextDate) {
                const formattedDate = convertDateFormat(nextDate);
                setSelectedDate(formattedDate);
                getSchedulesByUser(formattedDate);
            }
        }
    };



    // Xử lý click vào ô ngày để chuyển trực tiếp đến ngày đó
    const handleDateCellClick = (dayDate: Date) => {
        const formattedDate = `${dayDate.getDate().toString().padStart(2, '0')}/${(dayDate.getMonth() + 1).toString().padStart(2, '0')}/${dayDate.getFullYear()}`;
        setSelectedDate(formattedDate);
        getSchedulesByUser(formattedDate);
    };

    // Xử lý nút "Hiện tại" để chuyển về ngày hôm nay
    const handleTodayClick = () => {
        const today = new Date();
        const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        setSelectedDate(formattedToday);
        getSchedulesByUser(formattedToday);
    };

    // Lấy màu sắc cho từng loại lịch
    const getScheduleColor = (schedule: Schedule): string => {
        if (schedule.type === 'EXAM') {
            return 'bg-yellow-200 border-yellow-400 text-yellow-800'; // Vàng - Lịch thi
        }
        if (schedule.status === 'CANCELED') {
            return 'bg-red-200 border-red-400 text-red-800'; // Đỏ - Lịch tạm ngưng
        }
        if (schedule.type !== 'EXAM' && schedule.room.startsWith('TH_')) {
            return 'bg-green-200 border-green-400 text-green-800'; // Xanh lá - Lịch thực hành
        }
        if (schedule.type !== 'EXAM' && !schedule.room.startsWith('TH_')) {
            return 'bg-gray-200 border-gray-400 text-gray-800'; // Xám - Lịch lý thuyết
        }
        return 'bg-blue-200 border-blue-400 text-blue-800'; // Mặc định
    };

    // Lấy nhãn loại lịch
    const getScheduleTypeLabel = (schedule: Schedule): string => {
        if (schedule.type === 'EXAM') return 'Lịch thi';
        if (schedule.status === 'CANCELED') return 'Lịch tạm ngưng';
        if (schedule.type !== 'EXAM' && schedule.room.startsWith('TH_')) return 'Lịch học thực hành';
        if (schedule.type !== 'EXAM' && !schedule.room.startsWith('TH_')) return 'Lịch học lý thuyết';
        return 'Lịch học';
    };

    // Lấy tên ngày trong tuần
    const getDayName = (dayOfWeek: number): string => {
        const days: Record<number, string> = {
            1: 'Thứ 2',
            2: 'Thứ 3',
            3: 'Thứ 4',
            4: 'Thứ 5',
            5: 'Thứ 6',
            6: 'Thứ 7',
            7: 'Chủ nhật'
        };
        return days[dayOfWeek] || 'N/A';
    };

    // Sắp xếp lịch theo ngày và tiết
    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const dayKey = schedule.day_of_week;
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(schedule);
        return acc;
    }, {} as Record<number, Schedule[]>);

    // Sắp xếp lịch trong mỗi ngày theo tiết học
    Object.keys(groupedSchedules).forEach(day => {
        groupedSchedules[parseInt(day)].sort((a, b) => a.start_lesson - b.start_lesson);
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <style dangerouslySetInnerHTML={{ __html: datePickerStyles }} />
            <HeaderLeCpn />
            
            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {/* Navigation Controls */}
                            <div className="flex items-center gap-4">
                                {/* Legend */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                                        <span>Lịch học lý thuyết</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                                        <span>Lịch học thực hành</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                                        <span>Lịch học trực tuyến</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                                        <span>Lịch thi</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                                        <span>Lịch tạm ngưng</span>
                                    </span>
                                </div>

                                {/* Date picker */}
                                <div className="flex items-center gap-2">
                                    <DatePicker
                                        selected={convertStringToDate(selectedDate)}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                const formattedDate = convertDateToString(date);
                                                setSelectedDate(formattedDate);
                                                getSchedulesByUser(formattedDate);
                                            }
                                        }}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="dd/MM/yyyy"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        autoComplete="off"
                                    />
                                    <button
                                        onClick={handleTodayClick}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                    >
                                        📅 Hiện tại
                                    </button>
                                </div>

                                {/* Navigation buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevWeek}
                                        disabled={!linkPrev}
                                        className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={handleNextWeek}
                                        disabled={!linkNext}
                                        className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2">Đang tải lịch...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-600">
                                Lỗi: {error}
                            </div>
                        ) : (
                            <div className="grid grid-cols-8 gap-1 h-auto">
                                {/* Header row */}
                                <div className="bg-yellow-100 border border-gray-300 p-2 text-center font-medium">
                                    Ca học
                                </div>
                                {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek, index) => {
                                    let dayDate = new Date();
                                    
                                    if (weekStart) {
                                        // Parse weekStart từ định dạng dd-MM-yyyy
                                        const [day, month, year] = weekStart.split('-');
                                        const mondayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                        
                                        // Tính ngày thực tế cho mỗi cột (Thứ 2 = 0, Thứ 3 = 1, ..., Chủ nhật = 6)
                                        dayDate = new Date(mondayDate);
                                        dayDate.setDate(mondayDate.getDate() + index);
                                    }
                                    
                                    return (
                                        <div 
                                            key={dayOfWeek} 
                                            className="bg-blue-100 border border-gray-300 p-2 text-center cursor-pointer hover:bg-blue-200 transition-colors"
                                            onClick={() => handleDateCellClick(dayDate)}
                                        >
                                            <div className="font-medium">{getDayName(dayOfWeek)}</div>
                                            <div className="text-sm">
                                                {dayDate.getDate().toString().padStart(2, '0')}/{(dayDate.getMonth() + 1).toString().padStart(2, '0')}/{dayDate.getFullYear()}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Time slots */}
                                {['Sáng', 'Chiều', 'Tối'].map((period, periodIndex) => (
                                    <React.Fragment key={period}>
                                        <div className="bg-yellow-100 border border-gray-300 p-2 text-center font-medium">
                                            {period}
                                        </div>
                                        {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
                                            const daySchedules = groupedSchedules[dayOfWeek] || [];
                                            const periodSchedules = daySchedules.filter(schedule => {
                                                if (periodIndex === 0) return schedule.start_lesson >= 1 && schedule.start_lesson <= 6; // Sáng
                                                if (periodIndex === 1) return schedule.start_lesson >= 7 && schedule.start_lesson <= 12; // Chiều
                                                return schedule.start_lesson >= 13; // Tối
                                            });

                                            return (
                                                <div key={`${dayOfWeek}-${period}`} className="border border-gray-300 p-1 min-h-[100px]">
                                                    {periodSchedules.map((schedule, index) => (
                                                        <div
                                                            key={index}
                                                            className={`mb-1 p-2 rounded text-xs border ${getScheduleColor(schedule)}`}
                                                        >
                                                            <div className="font-medium">{schedule.subjectName}</div>
                                                            <div>{schedule.clazzName}</div>
                                                            <div>Phòng: {schedule.room}</div>
                                                            <div>Tiết: {schedule.start_lesson}-{schedule.end_lesson}</div>
                                                            <div>GV: {schedule.lecturerName}</div>
                                                            <div className="mt-1 text-xs opacity-80">
                                                                {getScheduleTypeLabel(schedule)}
                                                            </div>
                                                            {schedule.type === 'MAKEUP' && (
                                                                <div className="text-xs text-blue-600 font-medium">Học bù</div>
                                                            )}
                                                            {schedule.status === 'ROOM_CHANGED' && (
                                                                <div className="text-xs text-orange-600 font-medium">Đổi phòng</div>
                                                            )}
                                                            {schedule.status === 'LECTURER_CHANGED' && (
                                                                <div className="text-xs text-purple-600 font-medium">Đổi GV</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>



            <FooterLeCpn />
        </div>
    );
};

export default SchedulePage;
