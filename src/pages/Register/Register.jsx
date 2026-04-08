import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Register = () => {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // xử lý input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate đơn giản
    if (formData.password !== formData.confirmPassword) {
      setToastType("error");
      setToastMessage("Mật khẩu không khớp!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8889/client/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber
        })
      });

      const data = await response.json();


      if (data.status === 200) {
        setToastType("success");
        setToastMessage("Đăng ký thành công!");
      } else {
        setToastType("error");
        setToastMessage(data.message || "Tài khoản đã tồn tại hoặc có lỗi xảy ra!");
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Không thể kết nối tới Server1!");
      console.error(error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tạo tài khoản mới để sử dụng dịch vụ của chúng tôi
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Họ"
                  className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4"
                />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tên"
                  className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4"
                />
              </div>

              {/* Email */}
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4 pr-10"
              />

              {/* Phone */}
              <input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Số điện thoại"
                className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4 pr-10"
              />

              {/* Password */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                  className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu"
                  className="w-full bg-transparent border border-gray-500/30 outline-none rounded-full py-2.5 px-4 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition mt-2"
            >
              Đăng ký
            </button>
          </form>

          {/* Toast */}
          {toastMessage && (
            <div className={`text-center p-2 rounded ${toastType === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              {toastMessage}
            </div>
          )}
        </div>

        {/* Link login */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;