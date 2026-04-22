import React, { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, MapPin, RefreshCw, User as UserIcon } from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8889/auth/all-user");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchString = `${u.name || ""} ${u.email || ""} ${u.phone || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Avatar Background Color Generator
  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500", "bg-orange-500"
    ];
    return colors[(id || 0) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              Quản lý người dùng
            </h1>
            <p className="mt-1 text-sm text-gray-500 ml-11">
              Xem và quản lý tất cả người dùng trong hệ thống
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
              />
            </div>
            <button 
              onClick={fetchUsers}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy người dùng</h3>
              <p className="text-gray-500">Thử một từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người dùng</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Liên hệ</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0 ${getAvatarColor(user.id)}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name && user.name.trim() !== "" ? user.name : "Người dùng ẩn danh"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {user.email ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate max-w-[180px]" title={user.email}>{user.email}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">Chưa có email</div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100' : user.role === 'PARTNER' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                          <UserIcon className="w-3 h-3" />
                          {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'PARTNER' ? 'Đối tác' : user.role || 'Khách hàng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Hiển thị <span className="font-medium text-gray-900">{filteredUsers.length}</span> kết quả
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
