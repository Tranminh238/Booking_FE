import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { startConversation } from "../../api/chatApi";

const StarPicker = ({ value, onChange, max = 10 }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1 flex-wrap">
            {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                    title={`${s} sao`}
                >
                    <svg className={`w-7 h-7 transition-colors ${s <= (hovered || value) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 self-center">{value || hovered || 0}/10</span>
        </div>
    );
};

const StarDisplay = ({ rating, max = 10 }) => (
    <div className="flex gap-0.5 flex-wrap">
        {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
            <svg key={s} className={`w-4 h-4 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const Toast = ({ toasts, onRemove }) => (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto animate-slide-in">
                <div className={`min-w-[300px] max-w-sm px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm flex items-start gap-3 ${toast.type === "error"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}>
                    <div className="mt-0.5 shrink-0">
                        {toast.type === "error" ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                            {toast.type === "error" ? "Thao tác thất bại" : "Thành công"}
                        </p>
                        <p className="text-sm opacity-90 mt-0.5 leading-relaxed">{toast.msg}</p>
                    </div>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="opacity-40 hover:opacity-80 transition shrink-0 mt-0.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const MyBookings = () => {
    const navigate = useNavigate();
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem("userId");

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleContactHotel = async (hotelId) => {
        if (!userId) {
            showToast("Vui lòng đăng nhập để liên hệ khách sạn.", "error");
            return;
        }
        try {
            const res = await startConversation(Number(userId), hotelId);
            if (res.status === 200 && res.data) {
                navigate(`/my-messages?conversationId=${res.data.id}`);
            } else {
                showToast(res.message || "Không thể kết nối với khách sạn.", "error");
            }
        } catch (err) {
            console.error("Lỗi liên hệ khách sạn:", err);
            showToast("Có lỗi xảy ra khi liên hệ với khách sạn.", "error");
        }
    };
    const [activeTab, setActiveTab] = useState("all");
    const [deleteModal, setDeleteModal] = useState(null);

    const [reviewModal, setReviewModal] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const [reviewsMap, setReviewsMap] = useState({});
    const [expandedReview, setExpandedReview] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { bookingId }

    // Booking Details & Policy Modal state
    const [bookingDetailsModal, setBookingDetailsModal] = useState(null); // { booking, hotelDetails }
    const [loadingHotelDetails, setLoadingHotelDetails] = useState(false);

    // Cancel modal state
    const [cancelModal, setCancelModal] = useState(null); // { bookingId, bookingStatus }
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [cancelSubmitting, setCancelSubmitting] = useState(false);

    const CANCEL_REASONS = [
        "Không còn nhu cầu lưu trú.",
        "Đặt nhầm ngày nhận/trả phòng.",
        "Đặt nhầm loại phòng.",
        "Đặt nhầm khách sạn.",
        "Lý do khác...",
    ];

    const showToast = (msg, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    };

    const handleRemoveToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchUserReviews = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8889/api/reviews/user/${userId}`);
            if (!res.ok) return;
            const data = await res.json();
            const map = {};
            (Array.isArray(data) ? data : []).forEach((r) => {
                if (r.bookingId) map[r.bookingId] = r;
            });
            setReviewsMap(map);
        } catch (err) {
            console.error("Failed to fetch user reviews:", err);
        }
    };

    const fetchAndShowDetails = async (booking) => {
        setLoadingHotelDetails(true);
        try {
            const res = await fetch(`http://localhost:8889/api/hotel/gethoteldetail/${booking.hotelId}`);
            if (!res.ok) throw new Error("Không thể lấy thông tin khách sạn");
            const data = await res.json();
            setBookingDetailsModal({ booking, hotelDetails: data.data });
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoadingHotelDetails(false);
        }
    };

    const handleHotelClick = (hotelId) => {
        navigate(`/hotels/${hotelId}`);
    };

    const handleDeleteReview = (bookingId) => {
        setDeleteConfirm({ bookingId });
    };

    const executeDeleteReview = async (bookingId) => {
        setDeleteConfirm(null);
        try {
            const res = await fetch(`http://localhost:8889/api/reviews/delete/${bookingId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Xóa đánh giá thất bại");
            }

            setReviewsMap((prev) => {
                const updated = { ...prev };
                delete updated[bookingId];
                return updated;
            });

            setExpandedReview(null);
            setDeleteModal(null);
            showToast("Xóa đánh giá thành công!");
        } catch (err) {
            showToast(err.message || "Xóa đánh giá thất bại!", "error");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { setReviewError("Vui lòng chọn số sao đánh giá."); return; }
        if (!comment.trim()) { setReviewError("Vui lòng nhập nhận xét."); return; }

        setReviewError("");
        setReviewSubmitting(true);
        try {
            const isEditing = !!reviewsMap[reviewModal.id];
            const url = isEditing
                ? `http://localhost:8889/api/reviews/update/${reviewModal.id}?hotelId=${reviewModal.hotelId}`
                : `http://localhost:8889/api/reviews/create/${reviewModal.hotelId}?userId=${userId}&bookingId=${reviewModal.id}`;
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment }),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Có lỗi xảy ra khi gửi đánh giá.");
            }
            showToast(isEditing ? "Cập nhật đánh giá thành công!" : "Đăng đánh giá thành công!");
            setReviewModal(null);
            await fetchUserReviews();
        } catch (err) {
            setReviewError(err.message);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const openCancelModal = (booking, hotelDetails) => {
        let refundAmount = 0;
        let canRefund = false;
        const isUnpaid = booking.paymentStatus === 1;

        if (!isUnpaid && hotelDetails?.isRefund === 1) {
            const checkIn = new Date(booking.checkIn);
            const today = new Date();
            const diffTime = checkIn.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= (hotelDetails.minDateRefund || 0)) {
                canRefund = true;
                refundAmount = Math.round(booking.totalPrice * (hotelDetails.refundPercentage || 0) / 100);
            }
        }

        setCancelModal({ 
            bookingId: booking.id, 
            bookingStatus: booking.bookingStatus,
            refundAmount,
            canRefund,
            isUnpaid
        });
        setSelectedReason("");
        setCustomReason("");
        setBookingDetailsModal(null); // Close details modal when opening cancel modal
    };

    const handleRequestCancel = async () => {
        const reason = selectedReason === "Lý do khác..." ? customReason.trim() : selectedReason;
        if (!reason) {
            showToast("Vui lòng chọn hoặc nhập lý do hủy.", "error");
            return;
        }
        setCancelSubmitting(true);
        try {
            const res = await fetch(
                `http://localhost:8889/api/booking/request-cancel/${cancelModal.bookingId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookingId: cancelModal.bookingId, reason }),
                }
            );
            if (!res.ok) throw new Error((await res.text()) || "Lỗi khi yêu cầu hủy đặt phòng");
            const data = await res.json();
            const newStatus = data?.status ?? 4;
            if (newStatus === 4) {
                showToast("Yêu cầu hủy đặt phòng thành công! Chúng tôi sẽ xử lý hoàn tiền cho bạn.");
            } else {
                showToast("Đặt phòng đã được hủy. Theo chính sách khách sạn, đơn này không được hoàn tiền.");
            }
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === cancelModal.bookingId ? { ...b, bookingStatus: newStatus } : b
                )
            );
            setCancelModal(null);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setCancelSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError("");
            try {
                if (!userId) {
                    setError("Vui lòng đăng nhập để xem đặt phòng.");
                    setLoading(false);
                    return;
                }
                const res = await fetch(`http://localhost:8889/api/booking/user/${userId}`);
                if (!res.ok) throw new Error("Lỗi khi tải dữ liệu đặt phòng");
                const data = await res.json();

                const parseBookings = (list) =>
                    list.map((item) => ({
                        id: item.id,
                        hotelId: item.hotelId,
                        hotelName: item.hotelName,
                        hotelImg: item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : null,
                        roomTypeName: item.roomTypeName,
                        city: item.city,
                        district: item.district,
                        checkIn: item.checkInDate,
                        checkOut: item.checkOutDate,
                        totalPrice: item.totalPrice,
                        refundAmount: item.refundAmount,
                        bookingStatus: item.bookingStatus,
                        paymentStatus: item.paymentStatus,
                        contactName: item.contactName,
                        contactPhone: item.contactPhone,
                        contactEmail: item.contactEmail,
                        numRoom: item.numRoom,
                        numAdults: item.numAdults,
                        numChildren: item.numChildren,
                    }));

                if (Array.isArray(data)) {
                    setBookings(parseBookings(data));
                } else if (data?.data && Array.isArray(data.data)) {
                    setBookings(parseBookings(data.data));
                } else {
                    setBookings([]);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
        fetchUserReviews();
    }, []);
    const paymentConfig = {
        1: { label: "Chưa thanh toán", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
        2: { label: "Đã thanh toán", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
    }

    const statusConfig = {
        0: { label: "Đã hủy", color: "bg-red-100 text-red-600", dot: "bg-red-500" },
        1: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
        2: { label: "Đã xác nhận", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
        3: { label: "Hoàn thành", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
        4: { label: "Yêu cầu huỷ", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
        5: { label: "Từ chối", color: "bg-red-100 text-red-600", dot: "bg-red-500" },
    };

    const tabs = [
        { key: "all", label: "Tất cả", status: null },
        { key: "pending", label: "Chờ xác nhận", status: 1 },
        { key: "confirmed", label: "Đã xác nhận", status: 2 },
        { key: "request_cancel", label: "Yêu cầu huỷ", status: 4 },
        { key: "completed", label: "Hoàn thành", status: 3 },
        { key: "cancelled", label: "Đã hủy", status: 0 },
        { key: "rejected", label: "Từ chối", status: 5 },
    ];


    const filtered = activeTab === "all"
        ? bookings
        : bookings.filter((b) => {
            const tab = tabs.find((t) => t.key === activeTab);
            return tab && b.bookingStatus === tab.status;
        });

    const formatVND = (n) => (n || 0).toLocaleString("vi-VN") + " ₫";
    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    };
    const countNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        return Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
    };
    const getTabCount = (status) => bookings.filter((b) => b.bookingStatus === status).length;

    const ratingColor = (r) => {
        if (r >= 9) return "bg-emerald-100 text-emerald-700";
        if (r >= 7) return "bg-blue-100 text-blue-700";
        if (r >= 5) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-600";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 py-10 px-4">
            <Toast toasts={toasts} onRemove={handleRemoveToast} />

            {/* Confirm Delete Review Toast */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
                    padding: '16px 20px', borderRadius: '12px', fontWeight: 500, fontSize: '14px',
                    background: '#fff', color: '#333', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb', minWidth: '300px', maxWidth: '360px',
                    animation: 'slideIn 0.25s ease',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700, fontSize: '15px', color: '#dc2626' }}>
                        <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        Xác nhận xóa
                    </div>
                    <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5 }}>
                        Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '13px', color: '#374151' }}
                        >Hủy</button>
                        <button
                            onClick={() => executeDeleteReview(deleteConfirm.bookingId)}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                        >Xóa</button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 mb-6 overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Đặt phòng của tôi</h1>
                            </div>
                        </div>
                        {(role === "PARTNER" || role === "ADMIN") && (
                            <button
                                onClick={() => navigate("/partner-dashboard")}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl text-sm font-medium transition backdrop-blur"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Dashboard Partner
                            </button>
                        )}
                    </div>
                    {/* Stats */}
                    <div className="relative mt-6 grid grid-cols-3 gap-4">
                        {[
                            { label: "Tổng đặt", value: bookings.length, icon: "" },
                            { label: "Hoàn thành", value: getTabCount(3), icon: "" },
                            { label: "Sắp tới", value: getTabCount(2), icon: "" },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/15 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                                <div className="text-xl">{s.icon}</div>
                                <div className="text-white font-bold text-lg">{s.value}</div>
                                <div className="text-teal-100 text-xs">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-1 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${activeTab === tab.key ? "bg-teal-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                            {tab.label}
                            {tab.key !== "all" && (
                                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"}`}>
                                    {getTabCount(tab.status)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 mb-4 text-sm">
                         {error}
                    </div>
                )}

                {/* Bookings List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-8 h-8 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <h3 className="text-gray-700 font-semibold text-lg mb-2">Chưa có đặt phòng nào</h3>
                        <p className="text-gray-400 text-sm mb-6">Hãy khám phá và đặt phòng khách sạn yêu thích!</p>
                        <Link to="/hotels" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition">
                            Tìm khách sạn
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((booking) => {
                            const cfg = statusConfig[booking.bookingStatus] ?? statusConfig[1];
                            const nights = countNights(booking.checkIn, booking.checkOut);
                            const existingReview = reviewsMap[booking.id];
                            const isExpanded = expandedReview === booking.id;

                            return (
                                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row">
                                        {booking.hotelImg ? (
                                            <img
                                                src={booking.hotelImg}
                                                alt={booking.hotelName}
                                                className="w-full sm:w-44 h-44 sm:h-auto object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-full sm:w-44 h-44 sm:h-auto flex-shrink-0 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                                                <svg className="w-12 h-12 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 onClick={() => fetchAndShowDetails(booking)} className="font-semibold text-gray-800 text-base hover:text-teal-600 cursor-pointer">
                                                                {booking.hotelName || "—"}
                                                            </h3>
                                                            {loadingHotelDetails && <span className="text-xs text-gray-400">...</span>}
                                                        </div>
                                                        {booking.district && booking.city && (
                                                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                {booking.district}, {booking.city}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                            {cfg.label}
                                                        </span>
                                                        {(() => {
                                                            const pCfg = paymentConfig[booking.paymentStatus];
                                                            return pCfg ? (
                                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${pCfg.color}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                                                                    {pCfg.label}
                                                                </span>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-2 gap-3">
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                                                        <p className="text-sm font-semibold text-gray-700">{formatDate(booking.checkIn)}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                                                        <p className="text-sm font-semibold text-gray-700">{formatDate(booking.checkOut)}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                                    {booking.roomTypeName && (
                                                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-medium">{booking.roomTypeName}</span>
                                                    )}
                                                    {nights > 0 && <><span>•</span><span>{nights} đêm</span></>}
                                                    {booking.numRoom > 0 && <><span>•</span><span>{booking.numRoom} phòng</span></>}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        {booking.bookingStatus === 4 ? "Tiền hoàn trả" : "Tổng tiền"}
                                                    </p>
                                                    <p className="text-lg font-bold text-teal-600">
                                                        {booking.bookingStatus === 4
                                                            ? formatVND(booking.refundAmount || 0)
                                                            : formatVND(booking.totalPrice)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleContactHotel(booking.hotelId)}
                                                        className="text-xs px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-600 rounded-lg hover:bg-teal-100 transition"
                                                    >
                                                        Liên hệ khách sạn
                                                    </button>
                                                    {booking.bookingStatus === 3 && (
                                                        existingReview ? (
                                                            <button
                                                                onClick={() => setExpandedReview(isExpanded ? null : booking.id)}
                                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Xem đánh giá
                                                                <svg
                                                                    className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setReviewModal(booking); setRating(0); setComment(""); setReviewError(""); }}
                                                                className="text-xs px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                                                            >
                                                                Đánh giá
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline review dropdown view */}
                                    {isExpanded && existingReview && (
                                        <div className="border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-indigo-700">Đánh giá của bạn</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ratingColor(existingReview.rating)}`}>
                                                        {existingReview.rating}/10 ★
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => {
                                                            setReviewModal(booking);
                                                            setRating(existingReview.rating);
                                                            setComment(existingReview.comment);
                                                            setReviewError("");
                                                        }}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Chỉnh sửa
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteReview(booking.id)}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
                                                            />
                                                        </svg>
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-xl border border-indigo-100/50 leading-relaxed">
                                                {existingReview.comment || "Không có nhận xét."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Edit/Create Modal Overlay */}
            {reviewModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {reviewsMap[reviewModal.id] ? "Cập nhật đánh giá" : "Viết đánh giá"}
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">{reviewModal.hotelName}</p>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Số sao (1 - 10)</label>
                                <StarPicker value={rating} onChange={setRating} max={10} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nhận xét của bạn</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm lưu trú của bạn tại đây..."
                                    rows={4}
                                    className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                                />
                            </div>

                            {reviewError && (
                                <p className="text-xs font-medium text-red-500">⚠️ {reviewError}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewModal(null)}
                                    disabled={reviewSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className="px-5 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-xl shadow-sm disabled:opacity-50 transition"
                                >
                                    {reviewSubmitting ? "Đang gửi..." : "Hoàn tất"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {bookingDetailsModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl my-8">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Chi tiết đặt phòng & Chính sách</h2>
                            <button onClick={() => setBookingDetailsModal(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Chi tiết booking */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-2">Thông tin đặt phòng</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500">Khách sạn:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.hotelName}</span></div>
                                <div><span className="text-gray-500">Loại phòng:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.roomTypeName}</span></div>
                                <div><span className="text-gray-500">Check-in:</span> <span className="font-medium text-gray-800">{formatDate(bookingDetailsModal.booking.checkIn)}</span></div>
                                <div><span className="text-gray-500">Check-out:</span> <span className="font-medium text-gray-800">{formatDate(bookingDetailsModal.booking.checkOut)}</span></div>
                                <div><span className="text-gray-500">Tổng tiền:</span> <span className="font-bold text-teal-600">{formatVND(bookingDetailsModal.booking.totalPrice)}</span></div>
                                <div><span className="text-gray-500">Thanh toán:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.paymentStatus === 1 ? "Chưa thanh toán" : "Đã thanh toán"}</span></div>
                                <div><span className="text-gray-500">Người đặt:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.contactName}</span></div>
                                <div><span className="text-gray-500">Số điện thoại:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.contactPhone}</span></div>
                                <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.contactEmail}</span></div>
                                <div><span className="text-gray-500">Số người:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.numAdults + bookingDetailsModal.booking.numChildren}</span></div>
                                <div><span className="text-gray-500">Số phòng:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.numRoom}</span></div>                                
                            </div>
                            <div className="mt-6"><span className="text-gray-500">Yêu cầu đặc biệt:</span> <span className="font-medium text-gray-800">{bookingDetailsModal.booking.specialRequests ? bookingDetailsModal.booking.specialRequests : "Không có yêu cầu đặc biệt"}</span></div>                                
                        </div>

                        {/* Chính sách khách sạn */}
                        <div className="mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <div className="space-y-3 text-sm text-gray-700">                                
                                    <p className="font-semibold text-blue-800 mb-1">Chính sách hoàn tiền:</p>
                                    {bookingDetailsModal.hotelDetails?.isRefund === 1 ? (
                                        <ul className="list-disc list-inside space-y-1 ml-1 text-gray-700">
                                            <li>Khách sạn cho phép hoàn tiền.</li>
                                            <li>Thời gian hủy miễn phí tối thiểu: <span className="font-medium text-red-500">{bookingDetailsModal.hotelDetails.minDateRefund} ngày</span> trước ngày check-in.</li>
                                            <li>Tỷ lệ hoàn tiền: <span className="font-medium text-teal-600">{bookingDetailsModal.hotelDetails.refundPercentage}%</span></li>
                                        </ul>
                                    ) : (
                                        <p className="text-red-500 font-medium">Khách sạn không hỗ trợ hoàn tiền cho đơn đặt phòng này.</p>
                                    )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setBookingDetailsModal(null)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Đóng</button>
                            {(bookingDetailsModal.booking.bookingStatus === 1 || bookingDetailsModal.booking.bookingStatus === 2) && (
                                <button
                                    onClick={() => openCancelModal(bookingDetailsModal.booking, bookingDetailsModal.hotelDetails)}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition"
                                >
                                    Yêu cầu hủy
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Request Modal */}
            {cancelModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Yêu cầu hủy đặt phòng</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Vui lòng cho chúng tôi biết lý do bạn muốn hủy</p>
                            </div>
                        </div>

                        {/* Refund Info */}
                        <div className="mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100 text-sm">
                            {cancelModal.isUnpaid ? (
                                <p className="text-orange-700 font-medium">Đơn đặt phòng chưa thanh toán sẽ được hủy ngay lập tức mà không cần hoàn trả tiền.</p>
                            ) : cancelModal.canRefund ? (
                                <p className="text-orange-700 font-medium">Số tiền dự kiến hoàn trả: <span className="font-bold">{formatVND(cancelModal.refundAmount)}</span> ({cancelModal.refundAmount > 0 ? "Theo chính sách khách sạn" : ""})</p>
                            ) : (
                                <p className="text-red-600 font-medium">Rất tiếc, theo chính sách của khách sạn hoặc do quá hạn, đơn này không được hoàn tiền.</p>
                            )}
                        </div>

                        {/* Preset reasons */}
                        <div className="space-y-2 mb-4">
                            {CANCEL_REASONS.map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => { setSelectedReason(reason); setCustomReason(""); }}
                                    className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition ${
                                        selectedReason === reason
                                            ? "border-red-400 bg-red-50 text-red-700 font-medium"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-red-200 hover:bg-red-50/50"
                                    }`}
                                >
                                    <span className={`inline-block w-4 h-4 rounded-full border-2 mr-2 align-middle transition ${
                                        selectedReason === reason ? "border-red-500 bg-red-500" : "border-gray-300"
                                    }`} />
                                    {reason}
                                </button>
                            ))}
                        </div>

                        {/* Custom reason textarea */}
                        {selectedReason === "Lý do khác..." && (
                            <div className="mb-4">
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Nhập lý do hủy của bạn..."
                                    rows={3}
                                    className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition resize-none"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setCancelModal(null)}
                                disabled={cancelSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition"
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                onClick={handleRequestCancel}
                                disabled={cancelSubmitting || !selectedReason || (selectedReason === "Lý do khác..." && !customReason.trim())}
                                className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {cancelSubmitting ? "Đang gửi..." : "Xác nhận yêu cầu hủy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;