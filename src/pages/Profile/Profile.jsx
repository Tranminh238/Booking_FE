import React, { useState, useEffect } from "react";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: "", type: "" });

    const userId = sessionStorage.getItem("userId");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        nationality: "",
    });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "" }), 3500);
    };

    // Fetch thông tin user từ API
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                showToast("Vui lòng đăng nhập!", "error");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`http://localhost:8889/account/info/${userId}`);
                const data = await res.json();
                if (data.status === 200 && data.data) {
                    const d = data.data;
                    setForm({
                        firstName: d.firstName || "",
                        lastName: d.lastName || "",
                        email: d.email || "",
                        phoneNumber: d.phoneNumber || "",
                        address: d.address || "",
                        dateOfBirth: d.dateOfBirth || "",
                        gender: d.gender || "",
                        nationality: d.nationality || "",
                    });
                    // Đồng bộ sessionStorage
                    sessionStorage.setItem("firstName", d.firstName || "");
                    sessionStorage.setItem("lastName", d.lastName || "");
                } else {
                    showToast("Không thể tải thông tin tài khoản.", "error");
                }
            } catch (err) {
                console.error(err);
                showToast("Lỗi kết nối server.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const displayName = `${form.firstName} ${form.lastName}`.trim() || "Người dùng";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);

        try {
            const payload = {
                userId: Number(userId),
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                dateOfBirth: form.dateOfBirth || null,
                gender: form.gender,
                nationality: form.nationality,
            };

            const res = await fetch("http://localhost:8889/account/edit-info", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            // Nếu backend trả lỗi
            if (!res.ok || data.status !== 200) {
                showToast(data.message || "Cập nhật thất bại!", "error");
                return;
            }

            // Success
            showToast("Cập nhật thông tin thành công!");

            sessionStorage.setItem("firstName", form.firstName);
            sessionStorage.setItem("lastName", form.lastName);

            setIsEditing(false);

        } catch (err) {
            console.error(err);

            // Mất kết nối server / backend chưa chạy
            showToast("Không thể kết nối đến server!", "error");

        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        // Reload từ API để reset form về dữ liệu gốc
        setIsEditing(false);
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8889/account/info/${userId}`);
            const data = await res.json();
            if (data.status === 200 && data.data) {
                const d = data.data;
                setForm({
                    firstName: d.firstName || "",
                    lastName: d.lastName || "",
                    email: d.email || "",
                    phoneNumber: d.phoneNumber || "",
                    address: d.address || "",
                    dateOfBirth: d.dateOfBirth || "",
                    gender: d.gender || "",
                    nationality: d.nationality || "",
                });
            }
        } catch {}
        setLoading(false);
    };

    const fields = [
        { label: "Họ", name: "firstName", icon: "👤", type: "text", col: 1 },
        { label: "Tên", name: "lastName", icon: "👤", type: "text", col: 1 },
        { label: "Email", name: "email", icon: "📧", type: "email", disabled: true, col: 2 },
        { label: "Số điện thoại", name: "phoneNumber", icon: "📱", type: "tel", col: 1 },
        { label: "Ngày sinh", name: "dateOfBirth", icon: "🎂", type: "date", col: 1 },
        { label: "Địa chỉ", name: "address", icon: "🏠", type: "text", col: 2 },
        { label: "Quốc tịch", name: "nationality", icon: "🌏", type: "text", col: 1 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
            {/* Toast */}
            {toast.msg && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
                    {toast.type === "error" ? "❌" : "✅"} {toast.msg}
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                {/* Header Card */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-6 overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {loading ? "..." : avatarLetter}
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-white">{loading ? "Đang tải..." : displayName}</h1>
                            <p className="text-indigo-200 text-sm mt-1">{form.email}</p>
                            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                                    Thành viên
                                </span>
                                {form.nationality && (
                                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                                        🌏 {form.nationality}
                                    </span>
                                )}
                                {form.gender && (
                                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                                        {form.gender === "MALE" ? "👨 Nam" : form.gender === "FEMALE" ? "👩 Nữ" : form.gender}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            Thông tin cá nhân
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Chỉnh sửa
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition disabled:opacity-60"
                                >
                                    {saving && (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    )}
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {fields.map((field) => (
                                <div key={field.name} className={field.col === 2 ? "sm:col-span-2" : ""}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        {field.label}
                                    </label>
                                    {isEditing && !field.disabled ? (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                                            placeholder={`Nhập ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 border border-gray-100 bg-gray-50 rounded-xl px-4 py-3">
                                            <span className="text-base">{field.icon}</span>
                                            <span className="text-sm text-gray-700">
                                                {form[field.name]
                                                    ? field.name === "dateOfBirth"
                                                        ? new Date(form[field.name]).toLocaleDateString("vi-VN")
                                                        : form[field.name]
                                                    : <span className="text-gray-400 italic">Chưa cập nhật</span>
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Gender — select khi edit */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Giới tính
                                </label>
                                {isEditing ? (
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition bg-white"
                                    >
                                        <option value="">-- Chọn giới tính --</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-3 border border-gray-100 bg-gray-50 rounded-xl px-4 py-3">
                                        <span className="text-base">⚧</span>
                                        <span className="text-sm text-gray-700">
                                            {form.gender === "MALE" ? "Nam"
                                                : form.gender === "FEMALE" ? "Nữ"
                                                : form.gender === "OTHER" ? "Khác"
                                                : <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
