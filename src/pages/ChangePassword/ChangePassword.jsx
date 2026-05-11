import React, { useState } from "react";

const ChangePassword = () => {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: "", type: "" });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "" }), 3500);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getStrength = (password) => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const strengthLabel = ["", "Yếu", "Trung bình", "Khá mạnh", "Mạnh"];
    const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
    const strength = getStrength(form.newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp!", "error");
            return;
        }
        if (form.newPassword.length < 6) {
            showToast("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
            return;
        }
        setLoading(true);
        try {
            const email = sessionStorage.getItem("email");
            // TODO: Gọi API đổi mật khẩu
            // await fetch("http://localhost:8889/api/user/change-password", { ... })
            await new Promise((r) => setTimeout(r, 1000));
            showToast("Đổi mật khẩu thành công!");
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch {
            showToast("Có lỗi xảy ra, vui lòng thử lại!", "error");
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, name, showKey, placeholder, hint }) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <input
                    type={showPass[showKey] ? "text" : "password"}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />
                <button
                    type="button"
                    onClick={() => setShowPass((prev) => ({ ...prev, [showKey]: !prev[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                    {showPass[showKey] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>
            {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-10 px-4">
            {/* Toast */}
            {toast.msg && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
                    {toast.type === "error" ? "❌" : "✅"} {toast.msg}
                </div>
            )}

            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-6 overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Đổi mật khẩu</h1>
                            <p className="text-purple-200 text-sm mt-1">Bảo vệ tài khoản của bạn</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    {/* Security Tips */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
                        <span className="text-blue-500 text-xl">🛡️</span>
                        <div>
                            <p className="text-blue-700 text-sm font-medium">Mẹo bảo mật</p>
                            <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                                Sử dụng mật khẩu dài ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            showKey="current"
                            placeholder="Nhập mật khẩu hiện tại"
                        />

                        <div>
                            <InputField
                                label="Mật khẩu mới"
                                name="newPassword"
                                showKey="new"
                                placeholder="Nhập mật khẩu mới"
                            />
                            {/* Strength bar */}
                            {form.newPassword && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-orange-500" : strength === 3 ? "text-yellow-600" : "text-green-600"}`}>
                                        {strengthLabel[strength]}
                                    </p>
                                </div>
                            )}
                        </div>

                        <InputField
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            showKey="confirm"
                            placeholder="Nhập lại mật khẩu mới"
                        />

                        {/* Match indicator */}
                        {form.confirmPassword && (
                            <div className={`flex items-center gap-2 text-xs font-medium ${form.newPassword === form.confirmPassword ? "text-green-600" : "text-red-500"}`}>
                                {form.newPassword === form.confirmPassword ? (
                                    <>✅ Mật khẩu khớp</>
                                ) : (
                                    <>❌ Mật khẩu không khớp</>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Cập nhật mật khẩu
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
