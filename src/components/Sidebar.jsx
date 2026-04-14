import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ role }) {
  const location = useLocation();

  const adminMenu = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Quản lý người dùng', path: '/admin-dashboard/users' },
    { label: 'Quản lý khách sạn', path: '/admin-dashboard/hotels' },
    { label: 'Quản lý đặt phòng', path: '/admin-dashboard/bookings' },
  ];

  const partnerMenu = [
    { label: 'Dashboard', path: '/partner-dashboard' },
    { label: 'Khách sạn của tôi', path: '/partner-dashboard/my-hotels' },
    { label: 'Đặt phòng', path: '/partner-dashboard/bookings' },
    { label: 'Đánh giá', path: '/partner-dashboard/reviews' },
    { label: 'Hồ sơ', path: '/partner-dashboard/profile' },
  ];

  const currentRole = role || localStorage.getItem('role') || localStorage.getItem('admin_role') || (localStorage.getItem('partner_userId') ? 'partner' : null);

  const menuItems = currentRole === 'admin' ? adminMenu : partnerMenu;

  return (
    <aside className="w-50 h-full bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {/* <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-indigo-700">
          {currentRole === 'admin' ? 'Hệ thống Admin' : 'Quản lý Đối tác'}
        </h2>
      </div> */}
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, idx) => {
          // Kiểm tra xem trang hiện tại có khớp với menu không để đánh dấu thẻ đang active
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/partner-dashboard' && item.path !== '/admin-dashboard');
          
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Nút nhỏ ở đáy sidebar nếu cần */}
      <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
        &copy; 2026 Hotel System
      </div>
    </aside>
  );
}
