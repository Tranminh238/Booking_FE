import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const InputField = ({
    label,
    name,
    type = "text",
    value,
    placeholder,
    handleChange,
    required = true,
    showPassButton = false,
    showPass = false,
    toggleShowPass,
}) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassButton ? (showPass ? "text" : "password") : type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />
                {showPassButton && (
                    <button
                        type="button"
                        onClick={toggleShowPass}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                        {showPass ? (
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
                )}
            </div>
        </div>
    );
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Reset Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [toast, setToast] = useState({ msg: "", type: "" });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => {
            setToast({ msg: "", type: "" });
        }, 4000);
    };

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const getStrength = (password) => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const strength = getStrength(newPassword);
    const strengthLabel = ["", "Yếu", "Trung bình", "Khá mạnh", "Mạnh"];
    const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

    // Handle step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            showToast("Vui lòng nhập email!", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8889/account/forgot-password/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.status === 200) {
                showToast("Mã OTP đã được gửi đến email của bạn!");
                setStep(2);
                setResendCooldown(60);
            } else {
                showToast(data.message || "Email không tồn tại trong hệ thống!", "error");
            }
        } catch (error) {
            showToast("Không thể kết nối đến máy chủ!", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8889/account/forgot-password/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.status === 200) {
                showToast("Đã gửi lại mã OTP thành công!");
                setResendCooldown(60);
            } else {
                showToast(data.message || "Gửi lại OTP thất bại!", "error");
            }
        } catch (error) {
            showToast("Không thể kết nối đến máy chủ!", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle step 2: Verify OTP
    const handleVerifyOtpTransition = async (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            showToast("Mã OTP phải gồm 6 chữ số!", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8889/account/forgot-password/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (data.status === 200) {
                showToast("Mã OTP đã được xác thực thành công!");
                setStep(3);
            } else {
                showToast(data.message || "Mã OTP không chính xác hoặc đã hết hạn!", "error");
            }
        } catch (error) {
            showToast("Không thể kết nối đến máy chủ!", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showToast("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp!", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8889/account/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword,
                    confirmPassword,
                }),
            });
            const data = await res.json();
            if (data.status === 200) {
                showToast("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                showToast(data.message || "Mã OTP không chính xác hoặc hết hạn!", "error");
                // If OTP expired, maybe let them go back to step 2 or keep them there
                if (data.message && data.message.includes("OTP")) {
                    setStep(2);
                }
            }
        } catch (error) {
            showToast("Đã xảy ra lỗi, vui lòng thử lại!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-12 px-4 flex items-center justify-center">
            {toast.msg && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
                        toast.type === "error" ? "bg-red-500 animate-bounce" : "bg-green-500"
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            <div className="max-w-md w-full">
                {/* Header Title Card */}
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-6 overflow-hidden shadow-xl">
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                            🔑
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Quên mật khẩu</h1>
                            <p className="text-indigo-200 text-xs mt-1">Lấy lại mật khẩu tài khoản của bạn</p>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-between items-center px-6 mb-6">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step >= 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white text-gray-400 border border-gray-200"
                        }`}>
                            1
                        </div>
                        <span className="text-[10px] mt-1 font-medium text-gray-500">Gửi OTP</span>
                    </div>
                    <div className={`h-[2px] flex-1 mx-2 transition-all ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step >= 2 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white text-gray-400 border border-gray-200"
                        }`}>
                            2
                        </div>
                        <span className="text-[10px] mt-1 font-medium text-gray-500">Xác nhận</span>
                    </div>
                    <div className={`h-[2px] flex-1 mx-2 transition-all ${step >= 3 ? "bg-indigo-600" : "bg-gray-200"}`} />
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step >= 3 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white text-gray-400 border border-gray-200"
                        }`}>
                            3
                        </div>
                        <span className="text-[10px] mt-1 font-medium text-gray-500">Mật khẩu mới</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 transition-all">
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                                <span className="text-blue-500 text-lg">📧</span>
                                <div>
                                    <p className="text-blue-700 text-xs font-semibold">Nhập email tài khoản</p>
                                    <p className="text-blue-600 text-[11px] mt-0.5 leading-relaxed">
                                        Chúng tôi sẽ gửi một mã OTP gồm 6 chữ số đến hòm thư này để xác minh quyền sở hữu tài khoản.
                                    </p>
                                </div>
                            </div>

                            <InputField
                                label="Địa chỉ Email"
                                name="email"
                                type="email"
                                value={email}
                                placeholder="example@gmail.com"
                                handleChange={(e) => setEmail(e.target.value)}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60"
                            >
                                {loading ? "Đang xử lý..." : "Gửi mã OTP"}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/login" className="text-xs text-indigo-600 hover:underline">
                                    Quay lại trang Đăng nhập
                                </Link>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtpTransition} className="space-y-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                                <span className="text-indigo-500 text-lg">🔑</span>
                                <div>
                                    <p className="text-indigo-700 text-xs font-semibold">Kiểm tra hòm thư của bạn</p>
                                    <p className="text-indigo-600 text-[11px] mt-0.5 leading-relaxed">
                                        Mã xác minh đã được gửi đến: <strong className="text-indigo-800">{email}</strong>. Vui lòng nhập mã để tiếp tục.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nhập mã xác minh OTP
                                </label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                    placeholder="xxxxxx"
                                    required
                                    className="w-full tracking-[10px] text-center text-xl font-bold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition text-gray-700"
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-gray-500 hover:text-gray-700 hover:underline"
                                >
                                    Thay đổi Email
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || loading}
                                    className={`font-medium ${
                                        resendCooldown > 0
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-indigo-600 hover:text-indigo-700 hover:underline"
                                    }`}
                                >
                                    {resendCooldown > 0 ? `Gửi lại mã sau ${resendCooldown}s` : "Gửi lại OTP"}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60"
                            >
                                {loading ? "Đang xác thực..." : "Tiếp tục"}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3">
                                <span className="text-green-500 text-lg">🛡️</span>
                                <div>
                                    <p className="text-green-700 text-xs font-semibold">Tạo mật khẩu an toàn</p>
                                    <p className="text-green-600 text-[11px] mt-0.5 leading-relaxed">
                                        Vui lòng nhập mật khẩu mới phức tạp chứa ký tự đặc biệt, số và chữ viết hoa để nâng cao bảo mật.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <InputField
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    value={newPassword}
                                    placeholder="Nhập mật khẩu mới"
                                    handleChange={(e) => setNewPassword(e.target.value)}
                                    showPassButton={true}
                                    showPass={showNewPass}
                                    toggleShowPass={() => setShowNewPass(!showNewPass)}
                                />

                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full ${
                                                        i <= strength ? strengthColor[strength] : "bg-gray-200"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p
                                            className={`text-[11px] font-semibold ${
                                                strength <= 1
                                                    ? "text-red-500"
                                                    : strength === 2
                                                    ? "text-orange-500"
                                                    : strength === 3
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            Mức độ bảo mật: {strengthLabel[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <InputField
                                    label="Xác nhận mật khẩu mới"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    placeholder="Nhập lại mật khẩu mới"
                                    handleChange={(e) => setConfirmPassword(e.target.value)}
                                    showPassButton={true}
                                    showPass={showConfirmPass}
                                    toggleShowPass={() => setShowConfirmPass(!showConfirmPass)}
                                />

                                {confirmPassword && (
                                    <div
                                        className={`text-xs mt-1.5 font-medium ${
                                            newPassword === confirmPassword ? "text-green-600" : "text-red-500"
                                        }`}
                                    >
                                        {newPassword === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60"
                            >
                                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
