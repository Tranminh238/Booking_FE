import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const PartnerNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate(); 

    const isAuthenticated = localStorage.getItem("partner_isAuthenticated") === "true";
    const role = localStorage.getItem("partner_role"); 
    const userName = localStorage.getItem("partner_userName");
    const firstName = localStorage.getItem("partner_firstName") || "";      
    const lastName = localStorage.getItem("partner_lastName") || "";
    
    const displayName = (firstName || lastName) 
        ? `${firstName} ${lastName}`.trim() 
        : (userName || "Tài khoản");

    const handleLogout = () => {
        localStorage.removeItem("partner_isAuthenticated");
        localStorage.removeItem("partner_userName");
        localStorage.removeItem("partner_firstName");
        localStorage.removeItem("partner_lastName");
        localStorage.removeItem("partner_role");
        
        setIsProfileMenuOpen(false);
        
        navigate("/partner");
        window.location.reload(); 
    };

    return (
        <nav className="font-playfair flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
            <Link to="/partner">
                <img className="h-9" src={logo} alt="Hotel Logo" />
            </Link>
            <div className="hidden sm:flex items-center gap-8">
                <Link to="/" className="hidden sm:flex items-center gap-8">
                    Trang Chủ
                </Link> 
                {isAuthenticated ? (
                    <div className="relative">
                        <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full inline-block text-center">
                            {displayName}
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                                <Link to="/partner-dashboard" onClick={() => setIsProfileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 font-bold">
                                    Trang Quản Lý
                                </Link>
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
                    <Link to="/login-partner" className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full inline-block text-center">
                        Đăng Nhập
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default PartnerNavbar;