import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userName = localStorage.getItem("userName");
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (userName || "Tài khoản");

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userName");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        setIsProfileMenuOpen(false);
        window.location.reload();
    };

    return (
        <nav className="font-playfair flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
            <Link to="/">
                <img className="h-9" src={logo} alt="Hotel Logo" />
            </Link>

            <button
                aria-label="Menu"
                id="menu-toggle"
                className="sm:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="21" height="1.5" rx=".75" fill="#426287" />
                    <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
                    <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
                </svg>
            </button>

            <div id="mobile-menu" className={`${isMenuOpen ? "flex" : "hidden"} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
                <a href="#" className="block">Trang Chủ</a>
                <a href="#" className="block">Khách sạn</a>
                <a href="#" className="block">Hỗ trợ</a>
                <a href="MyBooking">Chỗ Đặt Của Tôi</a>
                {isAuthenticated ? (
                    <div className="w-full relative text-center">
                        <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-full cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm block">
                            {displayName}
                        </button>
                        {isProfileMenuOpen && (
                            <div className="mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1">
                                <button onClick={handleLogout} className="block w-full text-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm block text-center">
                        Đăng Nhập
                    </Link>
                )}
            </div>

            <div className="hidden sm:flex items-center gap-8">
                <a href="Home">Trang Chủ</a>
                <a href="About">Khách sạn</a>
                <a href="Contact">Hỗ trợ</a>
                <a href="MyBooking">Chỗ Đặt Của Tôi</a>
                {isAuthenticated ? (
                    <div className="relative">
                        <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full inline-block text-center">
                            {displayName}
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
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