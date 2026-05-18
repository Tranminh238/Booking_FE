import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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

const MyBookings = () => {
    const navigate = useNavigate();
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem("userId");

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // reviewModal: booking object or null
    const [reviewModal, setReviewModal] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    // reviews map: bookingId -> review object
    const [reviewsMap, setReviewsMap] = useState({});

    // expanded review dropdown: bookingId or null
    const [expandedReview, setExpandedReview] = useState(null);

    // Fetch all reviews for this user to build reviewsMap
    const fetchUserReviews = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8889/api/reviews/user/${userId}`);
            if (!res.ok) return;
            const data = await res.json();
            // data is array of review objects with bookingId field
            const map = {};
            (Array.isArray(data) ? data : []).forEach((r) => {
                if (r.bookingId) map[r.bookingId] = r;
            });
            setReviewsMap(map);
        } catch (err) {
            console.error("Failed to fetch user reviews:", err);
        }
    };
    const handleHotelClick = (hotelId) => {
        navigate(`/hotels/${hotelId}`);
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
            alert(isEditing ? "Cập nhật đánh giá thành công!" : "Đăng đánh giá thành công!");
            setReviewModal(null);
            // Refresh reviews map so button updates to "Xem đánh giá"
            await fetchUserReviews();
        } catch (err) {
            setReviewError(err.message);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) return;
        try {
            const res = await fetch(`http://localhost:8889/api/booking/cancel/${bookingId}`, { method: "PUT" });
            if (!res.ok) throw new Error(await res.text() || "Lỗi khi hủy đặt phòng");
            alert("Hủy đặt phòng thành công!");
            setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, bookingStatus: 0 } : b));
        } catch (err) {
            alert(err.message);
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

    const statusConfig = {
        0: { label: "Đã hủy", color: "bg-red-100 text-red-600", dot: "bg-red-500" },
        1: { label: "Chưa thanh toán", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
        2: { label: "Đã xác nhận", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
        3: { label: "Hoàn thành", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
    };

    const tabs = [
        { key: "all", label: "Tất cả", status: null },
        { key: "pending", label: "Chờ xác nhận", status: 1 },
        { key: "confirmed", label: "Đã xác nhận", status: 2 },
        { key: "completed", label: "Hoàn thành", status: 3 },
        { key: "cancelled", label: "Đã hủy", status: 0 },
    ];

    const filtered =
        activeTab === "all"
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
                                <p className="text-teal-100 text-sm mt-1">{bookings.length} lượt đặt phòng</p>
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
                            { label: "Tổng đặt", value: bookings.length, icon: "📋" },
                            { label: "Hoàn thành", value: getTabCount(3), icon: "✅" },
                            { label: "Sắp tới", value: getTabCount(2), icon: "🗓️" },
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

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 mb-4 text-sm">
                        ❌ {error}
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
                        <div className="text-6xl mb-4"></div>
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
                                    <div className="flex flex-col sm:flex-row cursor-pointer" >
                                        {/* Hotel Image */}
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

                                        <div className="p-5 flex-1 flex flex-col justify-between" >
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-base" onClick={() => handleHotelClick(booking.hotelId)}>{booking.hotelName || "—"}</h3>
                                                        {booking.district && booking.city && (
                                                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                {booking.district}, {booking.city}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                        {cfg.label}
                                                    </span>
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
                                                    <p className="text-xs text-gray-400">Tổng tiền</p>
                                                    <p className="text-lg font-bold text-teal-600">{formatVND(booking.totalPrice)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {booking.bookingStatus === 3 && (
                                                        existingReview ? (
                                                            /* Already reviewed → "Xem đánh giá" toggle button */
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
                                                            /* Not yet reviewed → "Đánh giá" button */
                                                            <button
                                                                onClick={() => { setReviewModal(booking); setRating(0); setComment(""); setReviewError(""); }}
                                                                className="text-xs px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                                                            >
                                                                Đánh giá
                                                            </button>
                                                        )
                                                    )}
                                                    {(booking.bookingStatus === 1 || booking.bookingStatus === 2) && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.id)}
                                                            className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg hover:bg-red-100 transition"
                                                        >
                                                            Hủy
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Inline review dropdown ── */}
                                    {isExpanded && existingReview && (
                                        <div className="border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4 animate-slide-down">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-indigo-700">Đánh giá của bạn</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ratingColor(existingReview.rating)}`}>
                                                        {existingReview.rating}/10
                                                    </span>
                                                </div>
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
                                            </div>
                                            <StarDisplay rating={existingReview.rating} max={10} />
                                            <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-white/60 rounded-xl px-4 py-3 border border-indigo-100 italic">
                                                "{existingReview.comment}"
                                            </p>
                                            {existingReview.createdAt && (
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Đã đánh giá vào {new Date(existingReview.createdAt).toLocaleDateString("vi-VN")}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Review Modal ── */}
            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {reviewsMap[reviewModal.id] ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
                                    </h2>
                                    <p className="text-teal-100 text-sm mt-0.5 truncate">{reviewModal.hotelName}</p>
                                </div>
                                <button onClick={() => setReviewModal(null)} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">✕</button>
                            </div>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm đánh giá <span className="text-red-500">*</span></label>
                                <StarPicker value={rating} onChange={setRating} max={10} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nhận xét <span className="text-red-500">*</span></label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none resize-none text-sm text-gray-700 transition"
                                />
                                <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
                            </div>
                            {reviewError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                    <span>⚠️</span> {reviewError}
                                </div>
                            )}
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setReviewModal(null)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">Huỷ</button>
                                <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
                                >
                                    {reviewSubmitting && (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    )}
                                    {reviewSubmitting ? "Đang gửi..." : (reviewsMap[reviewModal.id] ? "Lưu thay đổi" : "Gửi đánh giá")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down { animation: slide-down 0.22s ease; }
            `}</style>
        </div>
    );
};

export default MyBookings;