import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import type { Alert } from '../../hooks/useAlert';
import AlertDetailModal from './AlertDetailModal';
import logoImg from '../../assets/img/logo.png';

const HeaderLECpn: React.FC = () => {
    const { logout } = useAuth();
    const { getMyAlerts, alerts, loading, unreadCount, pages, currentPage } = useAlert();

    const [showAlertBox, setShowAlertBox] = useState(false);
    const [alertPage, setAlertPage] = useState(1);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const alertBoxRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Lấy thông tin lecturer từ localStorage
    const lecturerName = localStorage.getItem('lecturer_name') || '';
    const lecturerAvatar = localStorage.getItem('lecturer_avatar_url') || '';

    // Load alerts khi mở alert box hoặc thay đổi trang
    useEffect(() => {
        if (showAlertBox) {
            getMyAlerts(alertPage, 10);
        }
    }, [showAlertBox, alertPage, getMyAlerts]);

    // Load unread count khi component mount
    useEffect(() => {
        getMyAlerts(1, 10);
    }, [getMyAlerts]);

    // Đóng alert box và mobile menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alertBoxRef.current && !alertBoxRef.current.contains(event.target as Node)) {
                setShowAlertBox(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        };

        if (showAlertBox || showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAlertBox, showMobileMenu]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleBellClick = () => {
        setShowAlertBox(!showAlertBox);
        if (!showAlertBox) {
            setAlertPage(1);
        }
    };

    const handlePageChange = (page: number) => {
        setAlertPage(page);
    };

    const handleAlertClick = (alert: Alert) => {
        setSelectedAlert(alert);
        setShowDetailModal(true);
        setShowAlertBox(false);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedAlert(null);
    };

    const formatTargetScope = (targetScope: string) => {
        return targetScope === 'all' ? 'Toàn trường' : 'Cá nhân';
    };

    const handleMobileMenuToggle = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    return (
        <header className="bg-white shadow-md border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Left side - Logo and Hamburger */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <img src={logoImg} alt="CoolKing Logo" className="h-8 sm:h-10 w-8 sm:w-10 object-contain" />
                            <span className="text-lg sm:text-xl font-bold text-blue-600">CoolKing</span>
                        </div>

                        {/* Hamburger Button - Mobile */}
                        <button
                            onClick={handleMobileMenuToggle}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Mở menu</span>
                            {!showMobileMenu ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-6">
                            <a
                                href="/lecturer/schedule"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                                Lịch dạy/gác thi
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                                Lớp học phần
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                                Điểm danh
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                                Gửi thông báo
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                                Nhắn tin
                            </a>
                        </nav>
                    </div>

                    {/* Alert bell icon, unread count */}
                    <div className="relative" ref={alertBoxRef}>
                        <button
                            onClick={handleBellClick}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none relative"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.002 2.002 0 0018 14V10a6 6 0 00-12 0v4a2.002 2.002 0 00-.595 1.595L4 17h5m6 0a3 3 0 01-6 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Alert Box */}
                        {showAlertBox && (
                            <div
                                className="absolute right-1/2 translate-x-1/3 sm:right-0 sm:translate-x-0 top-12 w-[90vw] sm:w-96 bg-white rounded-lg shadow-xl border z-50"
                            >
                                <div className="p-4 border-b bg-gray-50">
                                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-600">Đang tải...</p>
                                        </div>
                                    ) : alerts.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            Không có thông báo nào
                                        </div>
                                    ) : (
                                        alerts.map((alert) => (
                                            <div
                                                key={alert._id}
                                                onClick={() => handleAlertClick(alert)}
                                                className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-gray-800 text-sm overflow-hidden" style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}>
                                                        {alert.header}
                                                    </h4>
                                                    {!alert.isRead && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-xs mb-2 overflow-hidden" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {alert.body}
                                                </p>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Từ: {alert.senderID}</span>
                                                    <span>{formatTargetScope(alert.targetScope)}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {alert.createdAt}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Pagination */}
                                <div className="p-3 border-t bg-gray-50 sticky bottom-0">
                                    <div className="flex justify-center space-x-1">
                                        {pages.map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1 text-sm rounded ${currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Right side - User info and logout */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* User info - Hidden on small screens */}
                        <a
                            href="/lecturer/profile"
                            className="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group cursor-pointer"
                        >
                            {lecturerAvatar && (
                                <img
                                    src={lecturerAvatar}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32?text=U';
                                    }}
                                />
                            )}
                            <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors duration-200">
                                {lecturerName || 'Giảng viên'}
                            </span>
                        </a>


                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && (
                    <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {/* User info on mobile */}
                            <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-100 mb-2">
                                {lecturerAvatar && (
                                    <img
                                        src={lecturerAvatar}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32?text=U';
                                        }}
                                    />
                                )}
                                <span className="text-gray-700 text-sm font-medium">
                                    {lecturerName || 'Giảng viên'}
                                </span>
                            </div>

                            {/* Navigation links */}
                            <a
                                href="/lecturer/schedule"
                                onClick={closeMobileMenu}
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                            >
                                Lịch dạy/gác thi
                            </a>
                            <a
                                href="#"
                                onClick={closeMobileMenu}
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                            >
                                Lớp học phần
                            </a>
                            <a
                                href="#"
                                onClick={closeMobileMenu}
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                            >
                                Điểm danh
                            </a>
                            <a
                                href="#"
                                onClick={closeMobileMenu}
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                            >
                                Gửi thông báo
                            </a>
                            <a
                                href="#"
                                onClick={closeMobileMenu}
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                            >
                                Nhắn tin
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Alert Detail Modal */}
            <AlertDetailModal
                alert={selectedAlert}
                isOpen={showDetailModal}
                onClose={closeDetailModal}
            />
        </header>
    );
};

export default HeaderLECpn;
