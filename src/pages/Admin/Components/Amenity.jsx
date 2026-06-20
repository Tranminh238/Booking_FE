import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Search, Edit2, Trash2, X, AlertTriangle, Loader2, Building, Bed
} from "lucide-react";
import { message } from "antd";

const API_BASE = "http://localhost:8889/api/amenities";

export default function Amenity() {
    const [activeTab, setActiveTab] = useState("HOTEL"); // "HOTEL" or "ROOM"
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    // Form states
    const [currentAmenity, setCurrentAmenity] = useState(null);
    const [formData, setFormData] = useState({ name: "", type: "HOTEL" });
    const [validationError, setValidationError] = useState("");

    // Fetch amenities
    const fetchAmenities = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}?type=${activeTab}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAmenities(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải danh sách tiện ích.");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchAmenities();
    }, [fetchAmenities]);

    // Open modal for Create
    const handleOpenCreate = () => {
        setCurrentAmenity(null);
        setFormData({ name: "", type: activeTab });
        setValidationError("");
        setIsModalOpen(true);
    };

    // Open modal for Edit
    const handleOpenEdit = (amenity) => {
        setCurrentAmenity(amenity);
        setFormData({ name: amenity.name, type: amenity.type });
        setValidationError("");
        setIsModalOpen(true);
    };

    // Open confirmation modal for Delete
    const handleOpenDelete = (amenity) => {
        setCurrentAmenity(amenity);
        setIsDeleteConfirmOpen(true);
    };

    // Handle Create / Update Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setValidationError("Tên tiện ích không được để trống.");
            return;
        }
        setValidationError("");
        setSubmitting(true);

        try {
            const isEdit = !!currentAmenity;
            const url = isEdit
                ? `${API_BASE}/update-amenity/${currentAmenity.id}`
                : `${API_BASE}/create-amenity`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: formData.name.trim(), type: formData.type }),
            });

            const text = await res.text();
            if (!res.ok) {
                let errorMsg = text || "Thao tác thất bại.";
                try {
                    const json = JSON.parse(text);
                    if (json.message) errorMsg = json.message;
                } catch (_) { }
                throw new Error(errorMsg);
            }

            message.success(isEdit ? "Cập nhật tiện ích thành công!" : "Tạo tiện ích thành công!");
            setIsModalOpen(false);
            fetchAmenities();
        } catch (err) {
            console.error(err);
            setValidationError(err.message);
            message.error(err.message || "Đã xảy ra lỗi.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete Confirmation
    const handleDeleteConfirm = async () => {
        if (!currentAmenity) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/delete-amenity/${currentAmenity.id}`, {
                method: "DELETE",
            });
            const text = await res.text();
            if (!res.ok) {
                let errorMsg = text || "Xóa thất bại.";
                try {
                    const json = JSON.parse(text);
                    if (json.message) errorMsg = json.message;
                } catch (_) { }
                throw new Error(errorMsg);
            }
            message.success("Xóa tiện ích thành công!");
            setIsDeleteConfirmOpen(false);
            fetchAmenities();
        } catch (err) {
            console.error(err);
            message.error(err.message || "Không thể xóa tiện ích.");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter list by name
    const filteredAmenities = amenities.filter((a) =>
        a.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

            <div className="min-h-screen bg-slate-50/50 p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                {activeTab === "HOTEL" ? <Building className="w-6 h-6 text-white" /> : <Bed className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 leading-tight">Quản lý tiện ích</h1>
                                <p className="text-xs text-slate-400 mt-0.5">Tổng số tiện ích {activeTab === "HOTEL" ? "khách sạn" : "phòng"}: {amenities.length}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm tiện ích
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => { setActiveTab("HOTEL"); setSearch(""); }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                                activeTab === "HOTEL"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                        >
                            <Building className="w-4 h-4" />
                            Tiện ích khách sạn
                        </button>
                        <button
                            onClick={() => { setActiveTab("ROOM"); setSearch(""); }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                                activeTab === "ROOM"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                        >
                            <Bed className="w-4 h-4" />
                            Tiện ích phòng
                        </button>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative max-w-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tiện ích..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                <p className="text-sm text-slate-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredAmenities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-slate-700 font-semibold text-lg">Không tìm thấy tiện ích</h3>
                                <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                                    {search ? "Vui lòng kiểm tra lại từ khóa tìm kiếm của bạn hoặc thử từ khóa khác." : "Hệ thống chưa có dữ liệu tiện ích nào."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <th className="px-6 py-4 w-24">ID</th>
                                            <th className="px-6 py-4">Tên tiện ích</th>
                                            <th className="px-6 py-4 text-center w-40">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                        {filteredAmenities.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-slate-400 font-medium">#{a.id}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{a.name}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                        <button
                                                            onClick={() => handleOpenEdit(a)}
                                                            className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                            title="Sửa"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDelete(a)}
                                                            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !submitting && setIsModalOpen(false)}
                    />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 border border-slate-100 animate-fade-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">
                                {currentAmenity ? "Cập nhật tiện ích" : "Thêm tiện ích mới"}
                            </h2>
                            <button
                                disabled={submitting}
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <label htmlFor="name" className="block mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Tên tiện ích
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        autoFocus
                                        placeholder="Ví dụ: Hồ bơi, Wifi miễn phí..."
                                        disabled={submitting}
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (validationError) setValidationError("");
                                        }}
                                        className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 outline-none transition-all focus:bg-white focus:ring-4
                      ${validationError
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                                                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"}`}
                                    />
                                    {validationError && (
                                        <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                            {validationError}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="type" className="block mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Loại tiện ích
                                    </label>
                                    <select
                                        id="type"
                                        disabled={submitting}
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none transition-all focus:bg-white focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100"
                                    >
                                        <option value="HOTEL">Tiện ích khách sạn</option>
                                        <option value="ROOM">Tiện ích phòng</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-indigo-100 transition-all cursor-pointer"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !submitting && setIsDeleteConfirmOpen(false)}
                    />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 border border-slate-100 animate-fade-in">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-900 font-bold text-lg">Xác nhận xóa tiện ích?</h3>
                            <p className="text-slate-400 text-sm mt-2">
                                Bạn có chắc chắn muốn xóa tiện ích <span className="font-semibold text-slate-700">"{currentAmenity?.name}"</span>? Hành động này không thể được hoàn tác.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleDeleteConfirm}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-rose-100 transition-all cursor-pointer"
                            >
                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
