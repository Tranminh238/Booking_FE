import React, { useState } from "react";

const InputField = ({
    label,
    name,
    showKey,
    placeholder,
    hint,
    form,
    showPass,
    handleChange,
    setShowPass,
}) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>

            <div className="relative">
                <input
                    type={showPass[showKey] ? "text" : "password"}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />

                <button
                    type="button"
                    onClick={() =>
                        setShowPass((prev) => ({
                            ...prev,
                            [showKey]: !prev[showKey],
                        }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                    {showPass[showKey] ? (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {hint && (
                <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
            )}
        </div>
    );
};

const ChangePassword = () => {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});

    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState({
        msg: "",
        type: "",
    });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });

        setTimeout(() => {
            setToast({ msg: "", type: "" });
        }, 3000);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors((prev) => ({
                ...prev,
                [e.target.name]: "",
            }));
        }
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

    const strength = getStrength(form.newPassword);

    const strengthLabel = [
        "",
        "Yếu",
        "Trung bình",
        "Khá mạnh",
        "Mạnh",
    ];

    const strengthColor = [
        "",
        "bg-red-400",
        "bg-orange-400",
        "bg-yellow-400",
        "bg-green-500",
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const token = sessionStorage.getItem("token");

            const res = await fetch(
                "http://localhost:8889/account/change-password",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (data.code !== 200) {
                const backendMsg = data.message || "";
                const newErrors = {};

                if (backendMsg.includes("Mật khẩu hiện tại")) {
                    newErrors.currentPassword = backendMsg;
                } else if (backendMsg.includes("Xác nhận mật khẩu") || backendMsg.includes("mật khẩu xác nhận")) {
                    newErrors.confirmPassword = backendMsg;
                } else if (backendMsg.includes("Mật khẩu mới") || backendMsg.includes("tối thiểu 8 ký tự")) {
                    newErrors.newPassword = backendMsg;
                } else {
                    // Fallback to putting the message in currentPassword or general if we don't match
                    newErrors.general = backendMsg;
                }

                setErrors(newErrors);
                showToast(backendMsg || "Đổi mật khẩu thất bại!", "error");
                return;
            }   

            showToast(data.message || "Đổi mật khẩu thành công!");

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setErrors({});

        } catch (error) {
            console.error(error);
            showToast("Không thể kết nối server!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-10 px-4">
            {toast.msg && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
                        toast.type === "error"
                            ? "bg-red-500"
                            : "bg-green-500"
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            <div className="max-w-lg mx-auto">
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-6 overflow-hidden shadow-xl">
                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            🔒
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Đổi mật khẩu
                            </h1>

                            <p className="text-purple-200 text-sm mt-1">
                                Bảo vệ tài khoản của bạn
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
                        <span className="text-blue-500 text-xl">🛡️</span>

                        <div>
                            <p className="text-blue-700 text-sm font-medium">
                                Mẹo bảo mật
                            </p>

                            <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                                Sử dụng mật khẩu có chữ hoa, số và ký tự đặc
                                biệt.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            showKey="current"
                            placeholder="Nhập mật khẩu hiện tại"
                            form={form}
                            showPass={showPass}
                            handleChange={handleChange}
                            setShowPass={setShowPass}
                        />

                        <div>
                            <InputField
                                label="Mật khẩu mới"
                                name="newPassword"
                                showKey="new"
                                placeholder="Nhập mật khẩu mới"
                                form={form}
                                showPass={showPass}
                                handleChange={handleChange}
                                setShowPass={setShowPass}
                            />
                         

                            {form.newPassword && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full ${
                                                    i <= strength
                                                        ? strengthColor[
                                                              strength
                                                          ]
                                                        : "bg-gray-200"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <p
                                        className={`text-xs font-medium ${
                                            strength <= 1
                                                ? "text-red-500"
                                                : strength === 2
                                                ? "text-orange-500"
                                                : strength === 3
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                        }`}
                                    >
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
                            form={form}
                            showPass={showPass}
                            handleChange={handleChange}
                            setShowPass={setShowPass}
                        />

                        {form.confirmPassword && (
                            <div
                                className={`text-xs font-medium ${
                                    form.newPassword === form.confirmPassword
                                        ? "text-green-600"
                                        : "text-red-500"
                                }`}
                            >
                                {form.newPassword === form.confirmPassword
                                    ? "Mật khẩu khớp"
                                    : "Mật khẩu không khớp"}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60"
                        >
                            {loading
                                ? "Đang cập nhật..."
                                : "Cập nhật mật khẩu"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;