import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const BookingDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hotel, room, searchInfo = {}, numberOfNights = 1, totalPrice = 0 } = location.state || {};

    const [user, setUser] = useState(null);

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {

            const email = sessionStorage.getItem('email') || '';
            const userName = sessionStorage.getItem('name') || '';

            setUser({
                userName: userName,
                email: email
            });
        }
    }, []);

    const [formData, setFormData] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        country: 'Việt Nam',
        message: '',
        paymentMethod: 'VNPAY', // default to VNPAY
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                contactEmail: user.email || prev.contactEmail,
                contactName: user.userName || user.name || prev.contactName,
                contactPhone: user.phone || prev.contactPhone,
            }));
        }
    }, [user]);

    if (!hotel || !room) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h3>Không tìm thấy thông tin đặt phòng.</h3>
                <button onClick={() => navigate('/')} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#0056b3', color: 'white', border: 'none', borderRadius: '5px' }}>Quay lại trang chủ</button>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.contactName || !formData.contactEmail || !formData.contactPhone) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        navigate('/payment', {
            state: {
                hotel,
                room,
                searchInfo,
                numberOfNights,
                totalPrice,
                bookingFormData: formData
            }
        });
    };

    // calculate formatted dates
    const checkInDateObj = searchInfo.checkIn ? new Date(searchInfo.checkIn) : new Date();
    const checkOutDateObj = searchInfo.checkOut ? new Date(searchInfo.checkOut) : new Date(Date.now() + 86400000);

    const formatDate = (date) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const wd = date.getDay();
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return `${days[wd]}, ${d} tháng ${m} ${y}`;
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT SIDE: Hotel Info & Booking Summary */}
                <div className="md:col-span-1 flex flex-col gap-6">
                    {/* Hotel Card */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <img
                            src={hotel.images?.[0] || 'https://via.placeholder.com/400x200'}
                            alt={hotel.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-yellow-400 text-sm">{'★'.repeat(Math.min(hotel.star || 0, 5))}</span>
                                <span className="bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center ml-1">👍 +</span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h2>
                            <p className="text-sm text-gray-600 mb-3">{[hotel.district, hotel.city, hotel.country].filter(Boolean).join(', ')}</p>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-blue-800 text-white text-sm font-bold px-1.5 py-0.5 rounded">{hotel.rating_avg || '0.0'}</span>
                                {hotel.rating_avg >= 9 ? "Tuyệt vời" : hotel.rating_avg >= 8 ? "Rất tốt" : hotel.rating_avg >= 7 ? "Tốt" : hotel.rating_avg >= 5 ? "Dễ chịu" : "Chưa có đánh giá"}
                            </div>


                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <h3 className="font-bold text-gray-900 mb-4">Chi tiết đặt phòng của bạn</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Nhận phòng</div>
                                <div className="font-bold text-gray-900">{formatDate(checkInDateObj)}</div>
                            </div>
                            <div className="border-l border-gray-200 pl-4">
                                <div className="text-sm text-gray-600 mb-1">Trả phòng</div>
                                <div className="font-bold text-gray-900">{formatDate(checkOutDateObj)}</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Tổng thời gian lưu trú:</div>
                            <div className="font-bold text-gray-900">{numberOfNights} đêm</div>
                            <div className="text-sm text-gray-700 mb-1">Tổng cộng (Đã bao gồm thuế và phí)</div>
                            <div className="font-bold text-blue-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="text-sm text-gray-600 mb-1">Bạn đã chọn</div>
                            <div className="font-bold text-gray-900 mb-2">{searchInfo.roomCount} phòng cho {searchInfo.adults} người lớn{searchInfo.children > 0 ? `, ${searchInfo.children} trẻ em` : ''}</div>
                            <div className="text-sm text-blue-600">
                                {searchInfo.roomCount} x {room.name || 'Phòng Tiêu Chuẩn Giường Đôi'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Form */}
                <div className="md:col-span-2 flex flex-col gap-6">


                    {/* Form Details */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nhập thông tin chi tiết của bạn</h2>

                        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-bold border rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 border-gray-400">i</span>
                                <div>
                                    <div className="font-medium text-gray-900 mb-1">Gần xong rồi! Chỉ cần điền phần thông tin <span className="text-red-500">*</span> bắt buộc</div>
                                    <div className="text-sm text-gray-600">Vui lòng nhập thông tin của bạn bằng ký tự Latin để chỗ nghỉ có thể hiểu được</div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Địa chỉ email <span className="text-red-500">*</span></label>
                                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required className="w-full border border-gray-300 rounded px-2 py-2 outline-none focus:border-blue-500" />
                                <div className="text-xs text-gray-500 mt-1">Email xác nhận đặt phòng sẽ được gửi đến địa chỉ này</div>
                            </div>


                            <div className="mb-6">
                                <div className="flex items-center gap-3 mt-2">
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-2">
                                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Để xác minh đơn đặt và để chỗ nghỉ liên lạc khi cần</div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Yêu cầu đặc biệt</label>
                                <label className="block text-xs text-gray-800 mb-1">Các yêu cầu đặc biệt không đảm bảo sẽ được đáp ứng – tuy nhiên, chỗ nghỉ sẽ cố gắng hết sức để thực hiện. Bạn luôn có thể gửi yêu cầu đặc biệt sau khi hoàn tất đặt phòng của mình!</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" placeholder="Vui lòng cho biết bạn có yêu cầu gì..."></textarea>
                            </div>
                            <div className='flex justify-end'>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md text-lg">
                                    Tiếp tục
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
