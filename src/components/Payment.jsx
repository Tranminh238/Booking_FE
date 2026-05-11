import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hotel, room, searchInfo = {}, numberOfNights = 1, totalPrice = 0, bookingFormData } = location.state || {};

    const [user, setUser] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Parse VNPAY return URL query params ---
    const searchParams = new URLSearchParams(location.search);
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
    const vnpAmount = searchParams.get('vnp_Amount');
    const vnpBankCode = searchParams.get('vnp_BankCode');
    const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
    const vnpPayDate = searchParams.get('vnp_PayDate');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');

    const isVnpayReturn = !!vnpResponseCode;
    const isPaymentSuccess = vnpResponseCode === '00' && vnpTransactionStatus === '00';

    // Format VNPAY pay date string (yyyyMMddHHmmss)
    const formatVnpayDate = (dateStr) => {
        if (!dateStr || dateStr.length < 14) return dateStr;
        const y = dateStr.slice(0, 4);
        const mo = dateStr.slice(4, 6);
        const d = dateStr.slice(6, 8);
        const h = dateStr.slice(8, 10);
        const mi = dateStr.slice(10, 12);
        const s = dateStr.slice(12, 14);
        return `${h}:${mi}:${s} ${d}/${mo}/${y}`;
    };

    // Format VNPAY amount (unit: VND * 100)
    const formatVnpayAmount = (amountStr) => {
        if (!amountStr) return '';
        const amount = parseInt(amountStr, 10) / 100;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            setUser({ id: sessionStorage.getItem('userId') || null });
        }
    }, []);

    // =============================================
    // VNPAY RETURN: Payment Result Screen
    // =============================================
    if (isVnpayReturn) {
        return (
            <div className="bg-gray-100 min-h-screen pb-10">
                <div className="max-w-3xl mx-auto px-10 py-16">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header Banner */}
                        <div
                            style={{
                                padding: '10px 32px',
                                textAlign: 'center',
                                background: isPaymentSuccess
                                    ? 'linear-gradient(135deg, #22c55e, #059669)'
                                    : 'linear-gradient(135deg, #ef4444, #be123c)',
                            }}
                        >
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                }}
                            >
                                {isPaymentSuccess ? (
                                    <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                                {isPaymentSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                            </h1>
                            <p style={{ color: isPaymentSuccess ? '#d1fae5' : '#fecdd3', fontSize: 15 }}>
                                {isPaymentSuccess
                                    ? 'Đặt phòng của bạn đã được xác nhận. Chúc bạn có kỳ nghỉ tuyệt vời!'
                                    : 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.'}
                            </p>
                        </div>

                        {/* Transaction Details */}
                        <div style={{ padding: '24px 32px' }}>
                            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>
                                Chi tiết giao dịch
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {[
                                    vnpTxnRef && { label: 'Mã giao dịch', value: vnpTxnRef, mono: true },
                                    vnpAmount && { label: 'Số tiền', value: formatVnpayAmount(vnpAmount), colored: true },
                                    vnpBankCode && { label: 'Ngân hàng', value: vnpBankCode },
                                    vnpPayDate && { label: 'Thời gian giao dịch', value: formatVnpayDate(vnpPayDate) },
                                    vnpOrderInfo && { label: 'Nội dung', value: decodeURIComponent(vnpOrderInfo.replace(/\+/g, ' ')) },
                                ].filter(Boolean).map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: '1px solid #f3f4f6',
                                        }}
                                    >
                                        <span style={{ fontSize: 14, color: '#6b7280' }}>{item.label}</span>
                                        <span
                                            style={{
                                                fontSize: item.colored ? 16 : 14,
                                                fontWeight: 600,
                                                fontFamily: item.mono ? 'monospace' : undefined,
                                                color: item.colored
                                                    ? isPaymentSuccess ? '#16a34a' : '#dc2626'
                                                    : '#1f2937',
                                                maxWidth: '55%',
                                                textAlign: 'right',
                                            }}
                                        >
                                            {item.value}
                                        </span>
                                    </div>
                                ))}

                                {/* Status row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                                    <span style={{ fontSize: 14, color: '#6b7280' }}>Trạng thái</span>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            padding: '4px 12px',
                                            borderRadius: 999,
                                            background: isPaymentSuccess ? '#dcfce7' : '#fee2e2',
                                            color: isPaymentSuccess ? '#15803d' : '#b91c1c',
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: isPaymentSuccess ? '#22c55e' : '#ef4444',
                                            }}
                                        />
                                        {isPaymentSuccess ? 'Thành công' : `Thất bại (Mã: ${vnpResponseCode})`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{
                                        flex: 1,
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        fontWeight: 600,
                                        padding: '12px 24px',
                                        borderRadius: 12,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 15,
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                                    onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                                >
                                    Về trang chủ
                                </button>
                                {isPaymentSuccess ? (
                                    <button
                                        onClick={() => navigate('/my-bookings')}
                                        style={{
                                            flex: 1,
                                            background: '#16a34a',
                                            color: 'white',
                                            fontWeight: 600,
                                            padding: '12px 24px',
                                            borderRadius: 12,
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 15,
                                            boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#15803d'}
                                        onMouseOut={e => e.currentTarget.style.background = '#16a34a'}
                                    >
                                        Xem đặt phòng của tôi
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(-1)}
                                        style={{
                                            flex: 1,
                                            background: '#2563eb',
                                            color: 'white',
                                            fontWeight: 600,
                                            padding: '12px 24px',
                                            borderRadius: 12,
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 15,
                                            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                                        onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                                    >
                                        Thử lại
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // =============================================
    // Normal: No booking info => fallback
    // =============================================
    if (!hotel || !room || !bookingFormData) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h3>Không tìm thấy thông tin thanh toán.</h3>
                <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-4 py-2 mt-4 rounded">Quay lại trang chủ</button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const userId = sessionStorage.getItem('userId') || null;

        // 🔍 DEBUG: Kiểm tra userId trước khi gửi request
        console.log('=== BOOKING DEBUG ===');
        console.log('sessionStorage userId:', sessionStorage.getItem('userId'));
        console.log('sessionStorage isAuthenticated:', sessionStorage.getItem('isAuthenticated'));
        console.log('sessionStorage role:', sessionStorage.getItem('role'));
        console.log('userId to send:', userId);
        console.log('====================');

        const bookingRequest = {
            userId: userId ? Number(userId) : null,
            roomId: room.id,
            hotelId: hotel.id,
            checkInDate: searchInfo.checkIn,
            checkOutDate: searchInfo.checkOut,
            totalPrice: totalPrice,
            numRoom: searchInfo.roomCount,
            numAdults: searchInfo.adults,
            numChildren: searchInfo.children,
            pricePerNight: room.pricePerNight,
            paymentMethod: paymentMethod,
            message: bookingFormData.message,
            contactName: bookingFormData.contactName.trim(),
            contactPhone: bookingFormData.contactPhone,
            contactEmail: bookingFormData.contactEmail,
        };

        console.log('bookingRequest:', JSON.stringify(bookingRequest));

        try {
            const response = await fetch('http://localhost:8889/api/booking/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingRequest)
            });
            const resultText = await response.text();
            let result;
            try {
                result = JSON.parse(resultText);
            } catch (e) {
                result = { message: resultText };
            }

            if (response.ok) {
                if (paymentMethod === 'VNPAY' && result && result.id) {
                    const payResponse = await fetch(`http://localhost:8889/api/booking/payment/${result.id}`, {
                        method: 'POST'
                    });
                    const payUrl = await payResponse.text();
                    if (payUrl && payUrl.startsWith('http')) {
                        window.location.href = payUrl;
                        return;
                    }
                }

                alert("Đặt phòng thành công!");
                navigate('/');
            } else {
                alert("Lỗi khi đặt phòng: " + (result.message || ""));
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Có lỗi xảy ra khi tạo đặt phòng.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <div className="text-sm text-gray-700 mb-1 mt-2">Tổng cộng (Đã bao gồm thuế và phí)</div>
                            <div className="font-bold text-blue-600 text-lg">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="text-sm text-gray-600 mb-1">Bạn đã chọn</div>
                            <div className="font-bold text-gray-900 mb-2">{searchInfo.roomCount} phòng cho {searchInfo.adults} người lớn{searchInfo.children > 0 ? `, ${searchInfo.children} trẻ em` : ''}</div>
                            <div className="text-sm text-blue-600">
                                {searchInfo.roomCount} x {room.name || 'Phòng Tiêu Chuẩn'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Payment Form */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bạn muốn thanh toán thế nào?</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-8">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <label className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${paymentMethod === 'VNPAY' ? 'bg-blue-50 border-b border-gray-200' : 'border-b border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-blue-600" />
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900">Thanh toán trực tuyến bằng VNPay</div>
                                            <div className="text-sm text-gray-600 mt-1">An toàn và bảo mật. Hỗ trợ thẻ ATM, thẻ tín dụng, quét mã QR.</div>
                                        </div>
                                        <div className="w-16">
                                            <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" className="w-full" />
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${paymentMethod === 'CASH' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-blue-600" />
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900">Thanh toán tại chỗ nghỉ (Tiền mặt)</div>
                                            <div className="text-sm text-gray-600 mt-1">Thanh toán trực tiếp khi bạn nhận phòng.</div>
                                        </div>
                                        <div className="w-16 flex justify-center text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-blue-700 font-bold mb-1">Tổng cộng (Đã bao gồm thuế và phí)</div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                                    </div>
                                </div>
                                <button type="submit" disabled={isSubmitting} className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md text-lg ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Payment;
