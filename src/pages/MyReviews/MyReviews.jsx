import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8889/api";

/* ─── Toast notification ─────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    const colors = type === "success"
        ? "bg-emerald-500 text-white"
        : "bg-red-500 text-white";
    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl ${colors} animate-fade-in`}>
            <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
    );
};

/* ─── Interactive star picker ────────────────────────────────────── */
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
                    <svg
                        className={`w-7 h-7 transition-colors ${s <= (hovered || value) ? "text-yellow-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 self-center">{value || hovered || 0}/10</span>
        </div>
    );
};

/* ─── Read-only star display ─────────────────────────────────────── */
const StarDisplay = ({ rating, max = 10 }) => (
    <div className="flex gap-0.5 flex-wrap">
        {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
            <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

/* ─── Review Modal (Add / Edit) ──────────────────────────────────── */
const ReviewModal = ({ mode, review, hotelId, bookingId, userId, onClose, onSaved }) => {
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.comment || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const isEdit = mode === "edit";
    const hotelName = review?.hotelName || "khách sạn";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { setError("Vui lòng chọn số sao đánh giá."); return; }
        if (!comment.trim()) { setError("Vui lòng nhập nhận xét."); return; }
        setError("");
        setSubmitting(true);
        try {
            const body = JSON.stringify({ rating, comment });
            let res;
            if (isEdit) {
                res = await fetch(
                    `${API_BASE}/reviews/update/${review.bookingId}?hotelId=${review.hotelId}`,
                    { method: "PUT", headers: { "Content-Type": "application/json" }, body }
                );
            } else {
                res = await fetch(
                    `${API_BASE}/reviews/create/${hotelId}?userId=${userId}&bookingId=${bookingId}`,
                    { method: "POST", headers: { "Content-Type": "application/json" }, body }
                );
            }
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Có lỗi xảy ra.");
            }
            onSaved(isEdit ? "Cập nhật đánh giá thành công!" : "Đăng đánh giá thành công!");
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal card */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isEdit ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
                            </h2>
                            <p className="text-yellow-100 text-sm mt-0.5 truncate">{review?.name || hotelName || "Khách sạn"}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Rating picker */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Điểm đánh giá <span className="text-red-500">*</span>
                        </label>
                        <StarPicker value={rating} onChange={setRating} max={10} />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nhận xét <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none resize-none text-sm text-gray-700 transition"
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
                        >
                            {submitting && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            )}
                            {submitting ? "Đang gửi..." : isEdit ? "Lưu thay đổi" : "Gửi đánh giá"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────── */
const MyReviews = () => {
    const userId = sessionStorage.getItem("userId");

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [modal, setModal] = useState(null); // { mode: "add"|"edit", review?, hotelId?, bookingId? }
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchReviews = useCallback(async () => {
        console.log("[MyReviews] userId:", userId);
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/reviews/user/${userId}`);
            console.log("[MyReviews] response status:", res.status);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log("[MyReviews] data:", data);
            setReviews(data);
        } catch (err) {
            console.error("[MyReviews] fetch error:", err);
            showToast("Không thể tải danh sách đánh giá.", "error");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    /* After modal closes with success, reload */
    const handleSaved = (msg) => {
        showToast(msg, "success");
        fetchReviews();
    };

    /* Filtering by rating */
    const filteredReviews = filter === "all"
        ? reviews
        : reviews.filter((r) => r.rating === parseInt(filter));

    /* Rating buckets for filter pills */
    const ratingOptions = [
        { label: "Tất cả", value: "all" },
        { label: "9–10 ★ Tuyệt vời", value: "9" },
        { label: "7–8 ★ Tốt", value: "7" },
        { label: "5–6 ★ Khá", value: "5" },
        { label: "≤ 4 ★ Kém", value: "3" },
    ];

    const filterMatches = (r) => {
        if (filter === "all") return true;
        const v = parseInt(filter);
        if (v === 9) return r.rating >= 9;
        if (v === 7) return r.rating >= 7 && r.rating <= 8;
        if (v === 5) return r.rating >= 5 && r.rating <= 6;
        if (v === 3) return r.rating <= 4;
        return true;
    };
    const displayReviews = reviews.filter(filterMatches);

    const ratingColor = (r) => {
        if (r >= 9) return "bg-emerald-100 text-emerald-700";
        if (r >= 7) return "bg-blue-100 text-blue-700";
        if (r >= 5) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-600";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50 py-10 px-4">
            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Review modal */}
            {modal && (
                <ReviewModal
                    mode={modal.mode}
                    review={modal.review}
                    hotelId={modal.hotelId}
                    bookingId={modal.bookingId}
                    userId={userId}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}

            <div className="max-w-4xl mx-auto">
                {/* ── Header ── */}
                <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 mb-6 overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-32 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                    <div className="relative flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Đánh giá của tôi</h1>
                                <p className="text-yellow-100 text-sm mt-1">{reviews.length} đánh giá đã gửi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Filter pills ── */}
                {!loading && reviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-5">
                        {ratingOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                                    filter === opt.value
                                        ? "bg-yellow-500 text-white border-yellow-500 shadow"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Content ── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-8 h-8 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                ) : !userId ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="text-5xl mb-4">🔒</div>
                        <h3 className="text-gray-700 font-semibold text-lg mb-2">Bạn chưa đăng nhập</h3>
                        <p className="text-gray-400 text-sm mb-6">Vui lòng đăng nhập để xem đánh giá của bạn.</p>
                        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition">
                            Đăng nhập
                        </Link>
                    </div>
                ) : displayReviews.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="text-6xl mb-4">⭐</div>
                        <h3 className="text-gray-700 font-semibold text-lg mb-2">
                            {filter === "all" ? "Chưa có đánh giá nào" : "Không có đánh giá phù hợp"}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {filter === "all"
                                ? "Hãy đặt phòng và chia sẻ trải nghiệm của bạn!"
                                : "Thử chọn bộ lọc khác."}
                        </p>
                        {filter === "all" && (
                            <Link to="/hotels" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition">
                                Khám phá khách sạn
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayReviews.map((review) => (
                            <div
                                key={`review-${review.id ?? review.bookingId}`}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    {/* Hotel image */}
                                    {review.hotelImageUrl ? (
                                        <img
                                            src={review.hotelImageUrl}
                                            alt={review.hotelName}
                                            className="w-full sm:w-36 h-40 sm:h-auto object-cover"
                                        />
                                    ) : (
                                        <div className="w-full sm:w-36 h-40 sm:h-auto bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="p-5 flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-800 text-base truncate">{review.name || "Khách sạn"}</h3>
                                                {review.city && (
                                                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        {review.city}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-bold ${ratingColor(review.rating)}`}>
                                                    {review.rating}/10
                                                </span>
                                                <div className="mt-1.5">
                                                    <StarDisplay rating={review.rating} max={10} />
                                                </div>
                                                {review.createdAt && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                                            "{review.comment}"
                                        </p>

                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => setModal({ mode: "edit", review })}
                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 transition font-medium"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Chỉnh sửa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.25s ease; }
            `}</style>
        </div>
    );
};

export default MyReviews;
