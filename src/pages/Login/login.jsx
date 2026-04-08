import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8889/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email,
                    password: password
                })
            });

            const data = await response.json();


            if (response.ok && data.status === 200) {
                setToastType("success");
                setToastMessage("Đăng nhập thành công!");
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("userName", email.split('@')[0]); // Lấy phần trước ký tự @ làm tên hiển thị

                // Lưu firstName, lastName từ API trả về
                if (data.data) {
                    localStorage.setItem("firstName", data.data.firstName || "");
                    localStorage.setItem("lastName", data.data.lastName || "");
                }

                // Lưu token ở đây nếu cần
                setTimeout(() => {
                    window.location.href = "/";
                }, 100);
            } else {
                setToastType("error");
                setToastMessage(data.message || "Sai tài khoản hoặc mật khẩu!");
            }
        } catch (error) {
            setToastType("error");
            setToastMessage("Không thể kết nối tới Server!");
            console.error(error);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100">
            <div className="bg-white text-gray-500 max-w-96 w-full mx-4 md:p-6 p-4 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10">

                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                    Welcome back
                </h2>

                {toastMessage && (
                    <div className={`mb-4 text-center p-2 rounded ${toastType === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {toastMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border my-3 border-gray-500/30 outline-none rounded-full py-2.5 px-4"
                        type="email"
                        placeholder="Enter your email"

                    />
                    <input
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border mt-1 border-gray-500/30 outline-none rounded-full py-2.5 px-4"
                        type="password"
                        placeholder="Enter your password"

                    />
                    <div className="text-right py-4">
                        <a className="text-blue-600 underline" href="#">
                            Forgot Password
                        </a>
                    </div>
                    <button
                        type="submit"
                        className="w-full mb-3 bg-indigo-500 py-2.5 rounded-full text-white"
                    >
                        Log in
                    </button>
                </form>
                <p className="text-center mt-4">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-blue-500 underline">
                        Signup
                    </Link>
                </p>
                {/* Apple */}
                <button
                    type="button"
                    className="w-full flex items-center gap-2 justify-center mt-5 bg-black py-2.5 rounded-full text-white"
                >
                    <img
                        className="h-4 w-4"
                        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/appleLogo.png"
                        alt="appleLogo"
                    />
                    Log in with Apple
                </button>
                {/* Google */}
                <button
                    type="button"
                    className="w-full flex items-center gap-2 justify-center my-3 bg-white border border-gray-500/30 py-2.5 rounded-full text-gray-800"
                >
                    <img
                        className="h-4 w-4"
                        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png"
                        alt="googleFavicon"
                    />
                    Log in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;