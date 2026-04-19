import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate(); // Khởi tạo điều hướng
    const profileMenuRef = useRef(null);

    // Lấy dữ liệu từ localStorage
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const role = localStorage.getItem("role"); // Lấy role (ADMIN, PARTNER, v.v.)
    const userName = localStorage.getItem("userName");
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";

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
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userName");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("role"); // Xóa cả role khi đăng xuất
        
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
                        <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full inline-block text-center">
                            {displayName}
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50" >
                                {(role === "ADMIN") &&
                                    <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 font-bold">
                                        Trang Quản Lý
                                    </Link>
                                }
                                <button 
                                    onClick={handleLogout} 
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Đăng xuất
                                </button>
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