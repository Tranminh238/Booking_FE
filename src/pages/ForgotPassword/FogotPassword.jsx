import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../utils/request';
import validations from '../../utils/validations';
import Toast from '../../components/ux/toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const dismissError = () => {
    setErrorMessage('');
  };

  const handleforgotsubmit = async (e) => {
    e.preventDefault();

    if (validations.validate('email', loginData.email)) {
      try {
        const response = await post('auth/request-otp', loginData);
        if (response && response.message) {
          setSuccess(true);
          navigate('/verify-otp', {
            state: { email: loginData.email }
          });
        } else {
          setErrorMessage('Email không tồn tại trong hệ thống.');
        }
      } catch (error) {
        setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } else {
      setErrorMessage('Email không hợp lệ.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-indigo-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Quên mật khẩu?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nhập email để gửi mã OTP 
            </p>
          </div>

          <form onSubmit={handleforgotsubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 
                             rounded-md placeholder-gray-500 text-gray-900 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 
                             focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                    placeholder="Nhập địa chỉ email của bạn"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Chúng tôi sẽ gửi mã xác thực đến email này nếu tài khoản tồn tại
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         text-sm font-medium rounded-md text-white bg-indigo-600 
                         hover:bg-indigo-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500 
                         transition-colors duration-200"
              >
                Gửi mã xác thực
              </button>

              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 
                         border border-gray-300 rounded-md text-sm font-medium 
                         text-gray-700 bg-white hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-indigo-500 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Quay lại đăng nhập
              </Link>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4">
              <Toast
                type="error"
                message={errorMessage}
                dismissError={dismissError}
              />
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;