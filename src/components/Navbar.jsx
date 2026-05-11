import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate(); // Khởi tạo điều hướng
    const profileMenuRef = useRef(null);

    // Lấy dữ liệu từ sessionStorage 
    const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
    const role = sessionStorage.getItem("role"); // Lấy role (ADMIN, PARTNER, v.v.)
    const userName = sessionStorage.getItem("userName");
    const firstName = sessionStorage.getItem("firstName") || "";
    const lastName = sessionStorage.getItem("lastName") || "";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const displayName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : (userName || "Tài khoản");

    const handleLogout = () => {
        // Xóa sạch thông tin đăng nhập
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("firstName");
        sessionStorage.removeItem("lastName");
        sessionStorage.removeItem("role"); // Xóa cả role khi đăng xuất

        setIsProfileMenuOpen(false);

        // Chuyển hướng về trang chủ và làm mới trạng thái
        navigate("/");
        window.location.reload();
    };

    return (
        <nav className="font-playfair flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-16 py-2 border-b border-gray-300 bg-white relative transition-all">
            <Link to="/">
                <img className="h-9" src={logo} alt="Hotel Logo" />
            </Link>
            <div className="hidden sm:flex items-center gap-8">
                <Link to="/">Trang Chủ</Link>
                <Link to="/About">Khách sạn</Link>
                <Link to="/partner">Đăng chỗ nghỉ của bạn</Link>
                <Link to="/MyBooking">Chỗ Đặt Của Tôi</Link>

                {isAuthenticated ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="cursor-pointer px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full inline-flex items-center gap-2 text-center"
                        >
                            <span className="w-7 h-7 rounded-full bg-indigo-300 text-indigo-900 font-bold flex items-center justify-center text-sm">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                            {displayName}
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                                style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.15)" }}>
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <p className="text-xs text-gray-400 font-medium">Đang đăng nhập với</p>
                                    <p className="text-sm font-semibold text-indigo-700 truncate">{displayName}</p>
                                </div>

                                {/* Menu items */}
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 group"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4 text-blue-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </span>
                                        Thông tin cá nhân
                                    </Link>

                                    <Link
                                        to="/my-bookings"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 group"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-green-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4 text-green-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </span>
                                        Quản lý chỗ nghỉ
                                    </Link>

                                    <Link
                                        to="/my-reviews"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 group"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-yellow-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4 text-yellow-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </span>
                                        Đánh Giá
                                    </Link>

                                    <Link
                                        to="/change-password"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 group"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4 text-purple-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                        </span>
                                        Đổi Mật Khẩu
                                    </Link>
                                </div>

                                {/* Divider + Logout */}
                                <div className="border-t border-gray-100 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 group"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4 text-red-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full inline-block text-center">
                        Đăng Nhập
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;