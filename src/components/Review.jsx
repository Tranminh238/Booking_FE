import React, { useState, useEffect } from 'react';
import { useHotels } from '../api/HotelContext';

/* ─────────────────────────── Toast Component ─────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;

  if (toast.type === 'confirm') {
    return (
      <div style={{
        position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
        padding: '16px 24px', borderRadius: '10px', fontWeight: 500, fontSize: '14px',
        background: '#fff', color: '#333', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        animation: 'fadeInDown 0.3s ease', border: '1px solid #e5e7eb',
        minWidth: '300px', fontFamily: "'Be Vietnam Pro', sans-serif"
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 700, fontSize: '15px' }}>⚠️ Xác nhận</div>
        <div style={{ marginBottom: '16px', lineHeight: 1.5 }}>{toast.msg}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={toast.onCancel}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
          >Hủy</button>
          <button
            onClick={toast.onConfirm}
            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >Xóa</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      background: toast.type === 'success' ? '#16a34a' : '#dc2626',
      color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      animation: 'fadeInDown 0.3s ease',
      fontFamily: "'Be Vietnam Pro', sans-serif"
    }}>
      {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
    </div>
  );
}

/* ─────────────────────────── Star Rating Helper ─────────────────────────── */
function StarRating({ rating }) {
  const stars = [];
  const roundedRating = Math.round(rating || 0);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= roundedRating ? '#f59e0b' : '#d1d5db', fontSize: '16px', marginRight: '2px' }}>
        ★
      </span>
    );
  }
  return <div style={{ display: 'inline-flex', alignItems: 'center' }}>{stars}</div>;
}

export default function Review() {
  const { active, fetchHotels, loading: hotelsLoading } = useHotels();
  const [search, setSearch] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reviewCounts, setReviewCounts] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lấy role từ sessionStorage
  const role = sessionStorage.getItem('partner_role') || sessionStorage.getItem('role') || sessionStorage.getItem('admin_role') || '';
  const isAdmin = role.toUpperCase() === 'ADMIN';

  // Hiển thị toast thông báo
  const showToastMsg = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Tải số lượng đánh giá cho các khách sạn hoạt động
  useEffect(() => {
    if (active && active.length > 0) {
      active.forEach(async (p) => {
        try {
          const res = await fetch(`http://localhost:8889/api/reviews/total/${p.id}`);
          if (res.ok) {
            const count = await res.json();
            setReviewCounts(prev => ({ ...prev, [p.id]: count }));
          }
        } catch (err) {
          console.error(`Lỗi khi lấy số lượng đánh giá cho khách sạn ${p.id}:`, err);
        }
      });
    }
  }, [active]);

  // Tải danh sách đánh giá của khách sạn được chọn
  const loadReviewsForHotel = async (hotelId, pageNum = 1) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`http://localhost:8889/api/reviews/hotel/${hotelId}?page=${pageNum - 1}&size=${itemsPerPage}`);
      if (res.ok) {
        const data = await res.json();
        // data trả về dạng Page từ Spring Boot, danh sách nằm trong content
        const reviewList = data.content || (Array.isArray(data) ? data : []);
        setReviews(reviewList);
        const totalPagesVal = data.page ? (data.page.totalPages || 1) : (data.totalPages || 1);
        setTotalPages(totalPagesVal);
      } else {
        setReviews([]);
        setTotalPages(1);
        showToastMsg('error', 'Không thể tải danh sách đánh giá.');
      }
    } catch (err) {
      console.error(err);
      setReviews([]);
      setTotalPages(1);
      showToastMsg('error', 'Lỗi kết nối tới hệ thống.');
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleOpenReviews = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
    setCurrentPage(1);
  };

  const handleCloseReviews = () => {
    setShowModal(false);
    setSelectedHotel(null);
    setReviews([]);
    setTotalPages(1);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (showModal && selectedHotel) {
      loadReviewsForHotel(selectedHotel.id, currentPage);
    }
  }, [currentPage, selectedHotel?.id, showModal]);

  // Đảm bảo trang hiện tại không vượt quá tổng số trang sau khi cập nhật danh sách đánh giá
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Xóa đánh giá (chỉ dành cho Admin)
  const handleDeleteReview = (bookingId) => {
    setToast({
      type: 'confirm',
      msg: 'Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.',
      onCancel: () => setToast(null),
      onConfirm: async () => {
        setToast(null);
        try {
          const res = await fetch(`http://localhost:8889/api/reviews/delete/${bookingId}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            showToastMsg('success', 'Xóa đánh giá thành công!');
            // Tải lại danh sách đánh giá của khách sạn hiện tại
            if (selectedHotel) {
              loadReviewsForHotel(selectedHotel.id);
              // Cập nhật lại số lượng đánh giá tổng quan
              const totalRes = await fetch(`http://localhost:8889/api/reviews/total/${selectedHotel.id}`);
              if (totalRes.ok) {
                const count = await totalRes.json();
                setReviewCounts(prev => ({ ...prev, [selectedHotel.id]: count }));
              }
            }
            // Gọi fetchHotels để đồng bộ lại dữ liệu Context nếu cần
            fetchHotels();
          } else {
            const errorText = await res.text();
            showToastMsg('error', errorText || 'Xóa đánh giá thất bại.');
          }
        } catch (err) {
          console.error(err);
          showToastMsg('error', 'Lỗi kết nối khi xóa đánh giá.');
        }
      },
    });
  };

  // Lọc danh sách khách sạn theo từ khóa tìm kiếm
  const filteredHotels = active.filter(h =>
    (h.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.location || '').toLowerCase().includes(search.toLowerCase())
  );
  const formatDateTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <Toast toast={toast} />

      {/* Tiêu đề & mô tả */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
          Quản lý Đánh giá
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
          {isAdmin 
            ? 'Xem, quản lý và kiểm duyệt tất cả các đánh giá của khách sạn trên hệ thống.' 
            : 'Xem ý kiến phản hồi và đánh giá từ khách hàng đã trải nghiệm tại các khách sạn của bạn.'}
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '16px' }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên khách sạn hoặc địa chỉ..."
          style={{
            width: '100%',
            padding: '12px 16px 12px 42px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            background: '#fff',
            color: '#1a1a2e',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.2s'
          }}
        />
      </div>

      {/* Trạng thái Loading */}
      {hotelsLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px', animation: 'spin 1s infinite linear' }}>⏳</div>
          <p style={{ fontWeight: 500 }}>Đang tải danh sách khách sạn...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#9ca3af' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
          <p style={{ fontSize: '15px', fontWeight: 500 }}>Không tìm thấy khách sạn nào.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredHotels.map((h) => {
            const totalReviews = reviewCounts[h.id] !== undefined ? reviewCounts[h.id] : 0;
            return (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px',
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default'
                }}
              >
                {/* Ảnh thumbnail */}
                <div
                  style={{
                    width: '130px',
                    height: '100px',
                    flexShrink: 0,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {h.img ? (
                    <img src={h.img} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '28px', color: '#9ca3af', fontWeight: 'bold' }}>{h.initials}</span>
                  )}
                </div>

                {/* Thông tin khách sạn */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.name}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#ef4444' }}>📍</span> {h.location}
                  </div>
                  
                  {/* Điểm đánh giá trung bình */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {h.rating !== null ? (
                      <>
                        <span style={{
                          background: '#003580',
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}>
                          {h.rating.toFixed(1)}
                        </span>
                        <StarRating rating={h.rating} />
                      </>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Chưa có điểm đánh giá</span>
                    )}
                  </div>
                </div>

                {/* Thống kê đánh giá */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', borderLeft: '1px solid #f3f4f6', paddingLeft: '24px', paddingRight: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '19px', color: '#003580' }}>
                      {totalReviews}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>đánh giá</div>
                  </div>
                </div>

                {/* Nút hành động */}
                <div style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpenReviews(h)}
                    style={{
                      padding: '10px 18px',
                      background: '#f0f9ff',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
                  >
                    Xem đánh giá
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────── Reviews Modal ─────────────────────────── */}
      {showModal && selectedHotel && (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',

                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',

                overflowY: 'auto',

                zIndex: 1000,
                padding: '24px',
                boxSizing: 'border-box'
            }}
            onClick={handleCloseReviews}
            >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '780px',
              maxWidth: '100%',
              maxHeight: '90vh',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              animation: 'pd-slide-up 0.25s ease',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
                  Danh sách đánh giá
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {selectedHotel.name}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#fcfcfd' }}>
              {loadingReviews ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px', animation: 'spin 1s infinite linear' }}>⏳</div>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Đang tải danh sách đánh giá từ khách hàng...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                  <p style={{ fontSize: '14px', fontStyle: 'italic' }}>Chưa có đánh giá nào cho khách sạn này.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((r) => {
                      const initials = (r.firstName && r.lastName)
                        ? (r.lastName[0] + r.firstName[0]).toUpperCase()
                        : (r.firstName ? r.firstName.slice(0, 2).toUpperCase() : 'KH');

                      return (
                        <div
                          key={r.id}
                          style={{
                            background: '#fff',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            padding: '16px',
                            display: 'flex',
                            gap: '14px',
                            position: 'relative'
                          }}
                        >


                          {/* Nội dung đánh giá */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Tên khách hàng & Ngày đánh giá */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '14px' }}>
                                {(r.firstName || r.lastName) ? `${r.lastName || ''} ${r.firstName || ''}`.trim() : 'Khách ẩn danh'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {formatDateTime(r.createdAt)}
                              </span>
                            </div>

                            {/* Điểm sao */}
                            <div style={{ marginBottom: '8px' }}>
                              <StarRating rating={r.rating} />
                            </div>

                            {/* Bình luận */}
                            <p style={{
                              margin: 0,
                              fontSize: '13.5px',
                              color: '#374151',
                              lineHeight: '1.6',
                              background: '#f9fafb',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #f3f4f6',
                              wordBreak: 'break-word'
                            }}>
                              {r.comment || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Khách hàng không để lại bình luận.</span>}
                            </p>
                          </div>

                          {/* Nút xóa đánh giá (Chỉ Admin) */}
                          {role == 'PARTNER' && (
                            <div style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                              <button
                                onClick={() => handleDeleteReview(r.bookingId)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  transition: 'all 0.15s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#fecaca'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Phân trang */}
                    {totalPages > 1 && (
                      <div style={{
                        display: 'flex',
                        justify: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '20px',
                        paddingTop: '16px',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: currentPage === 1 ? '#f3f4f6' : '#fff',
                            color: currentPage === 1 ? '#9ca3af' : '#374151',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            transition: 'all 0.15s'
                          }}
                        >
                          « Trước
                        </button>

                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor: currentPage === pageNum ? '#003580' : '#d1d5db',
                              background: currentPage === pageNum ? '#003580' : '#fff',
                              color: currentPage === pageNum ? '#fff' : '#374151',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                            color: currentPage === totalPages ? '#9ca3af' : '#374151',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            transition: 'all 0.15s'
                          }}
                        >
                          Sau »
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#f9fafb'
              }}
            >
              <button
                onClick={handleCloseReviews}
                style={{
                  padding: '9px 20px',
                  background: '#003580',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13.5px'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
