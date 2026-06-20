import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// ── Toast System ──────────────────────────────────────────────────────
let toastIdCounter = 0;

function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onRemove(toast.id), 350);
    }, toast.duration || 3500);
    return () => clearTimeout(hideTimer);
  }, [toast.id, toast.duration, onRemove]);

  const configs = {
    success: {
      icon: '✓',
      bg: '#f0fdf4',
      border: '#86efac',
      iconBg: '#22c55e',
      titleColor: '#15803d',
      textColor: '#166534',
    },
    error: {
      icon: '✕',
      bg: '#fef2f2',
      border: '#fca5a5',
      iconBg: '#ef4444',
      titleColor: '#b91c1c',
      textColor: '#991b1b',
    },
    warning: {
      icon: '!',
      bg: '#fffbeb',
      border: '#fcd34d',
      iconBg: '#f59e0b',
      titleColor: '#b45309',
      textColor: '#92400e',
    },
    info: {
      icon: 'i',
      bg: '#eff6ff',
      border: '#93c5fd',
      iconBg: '#3b82f6',
      titleColor: '#1d4ed8',
      textColor: '#1e40af',
    },
    confirm: {
      icon: '?',
      bg: '#fafafa',
      border: '#d1d5db',
      iconBg: '#6b7280',
      titleColor: '#111827',
      textColor: '#374151',
    },
  };

  const c = configs[toast.type] || configs.info;

  return (
    <div
      style={{
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        minWidth: '300px',
        maxWidth: '380px',
        transform: visible && !leaving ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
      }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: c.iconBg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 700, flexShrink: 0,
      }}>
        {c.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: '14px', fontWeight: 700, color: c.titleColor, marginBottom: '2px' }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: c.textColor, lineHeight: 1.4 }}>
          {toast.message}
        </div>
        {toast.type === 'confirm' && toast.onConfirm && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={() => { toast.onConfirm(); setLeaving(true); setTimeout(() => onRemove(toast.id), 350); }}
              style={{
                padding: '5px 14px', borderRadius: '6px', border: 'none',
                background: toast.confirmColor || '#ef4444', color: '#fff',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {toast.confirmLabel || 'Xác nhận'}
            </button>
            <button
              onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 350); }}
              style={{
                padding: '5px 14px', borderRadius: '6px',
                border: '1px solid #d1d5db', background: '#fff',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', color: '#374151',
              }}
            >
              Huỷ bỏ
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 350); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9ca3af', fontSize: '16px', padding: '0', lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, ...options }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Thành công') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Lỗi') => addToast({ type: 'error', title, message, duration: 5000 }),
    warning: (message, title = 'Cảnh báo') => addToast({ type: 'warning', title, message }),
    info: (message, title = '') => addToast({ type: 'info', title, message }),
    confirm: (message, onConfirm, options = {}) =>
      addToast({
        type: 'confirm',
        title: options.title || 'Xác nhận hành động',
        message,
        onConfirm,
        confirmLabel: options.confirmLabel,
        confirmColor: options.confirmColor,
        duration: 15000,
      }),
  };

  return { toasts, removeToast, toast };
}

// ── Constants ─────────────────────────────────────────────────────────
const formatVND = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + 'tr ₫'
    : n.toLocaleString('vi-VN') + ' ₫';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const BOOKING_STATUS_TABS = [
  { key: 'all', label: 'Tất cả', color: '#6b7280', bg: '#f3f4f6' },
  { key: 1, label: 'Chờ xác nhận', color: '#b45309', bg: '#fef3c7' },
  { key: 2, label: 'Đã xác nhận', color: '#16a34a', bg: '#dcfce7' },
  { key: 5, label: 'Từ chối', color: '#bf6f6b', bg: '#fee2e2' },
  { key: 3, label: 'Hoàn thành', color: '#1e40af', bg: '#dbeafe' },
  { key: 4, label: 'Yêu cầu huỷ', color: '#1e40af', bg: '#dbeafe' },
  { key: 0, label: 'Đã huỷ', color: '#991b1b', bg: '#fee2e2' },
];

const PAYMENT_STATUS = {
  1: { label: 'Chưa thanh toán', color: '#b45309', bg: '#fef3c7' },
  2: { label: 'Đã thanh toán', color: '#16a34a', bg: '#dcfce7' },
  3: { label: 'Đã hoàn tiền', color: '#7c3aed', bg: '#ede9fe' },
};

const PaymentBadge = ({ status }) => {
  const s = PAYMENT_STATUS[status];
  if (!s) return <span style={{ color: '#6b7280' }}>—</span>;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
      fontWeight: 600, background: s.bg, color: s.color,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────
export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { toasts, removeToast, toast } = useToast();

  const role = sessionStorage.getItem('partner_role') || sessionStorage.getItem('role');
  const userId = sessionStorage.getItem('partner_userId');

  // ── Đọc refundResult từ URL params khi redirect về sau hoàn tiền ──
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const refundResult = searchParams.get('refundResult');
    if (refundResult !== null) {
      if (refundResult === '1') {
        toast.success('Hoàn tiền cho khách hàng đã được xử lý thành công.', 'Hoàn tiền thành công');
      } else if (refundResult === '0') {
        toast.error('Hoàn tiền thất bại. Vui lòng thử lại hoặc liên hệ VNPay.', 'Hoàn tiền thất bại');
      } else {
        toast.warning('Không thể xác thực kết quả hoàn tiền từ VNPay.', 'Cảnh báo');
      }
      // Xoá param khỏi URL để không hiển thị lại khi reload
      setSearchParams((prev) => {
        prev.delete('refundResult');
        return prev;
      });
    }
  }, []); // chỉ chạy một lần khi mount

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (role === 'ADMIN') {
        url = 'http://localhost:8889/api/booking/all';
      } else {
        if (!userId) {
          setError('Không tìm thấy thông tin đối tác.');
          setLoading(false);
          return;
        }
        url = `http://localhost:8889/api/booking/partner/${userId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Lỗi khi tải dữ liệu đặt phòng');
      const data = await res.json();

      const parseBookings = (list) =>
        list.map((item) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email || item.contactEmail,
          phone: item.phone || item.contactPhone,
          hotelName: item.hotelName,
          roomTypeName: item.roomTypeName,
          checkIn: item.checkInDate,
          checkOut: item.checkOutDate,
          totalPrice: item.totalPrice,
          paymentStatus: item.paymentStatus,
          bookingStatus: item.bookingStatus,
          contactName: item.contactName,
          contactPhone: item.contactPhone,
          contactEmail: item.contactEmail,
          numRoom: item.numRoom,
          refundId: item.refundId,
          refundStatus: item.refundStatus,
          refundAmount: item.refundAmount,
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
  }, [role, userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Actions ───────────────────────────────────────────────────────
  const handleConfirm = (bookingId) => {
    toast.confirm(
      'Bạn có chắc chắn muốn xác nhận đặt phòng này?',
      async () => {
        try {
          const res = await fetch(
            `http://localhost:8889/api/booking/confirm/${bookingId}`,
            { method: 'PUT' }
          );
          if (!res.ok) throw new Error((await res.text()) || 'Lỗi xác nhận đặt phòng');
          toast.success('Đặt phòng đã được xác nhận thành công.');
          setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 2 } : b))
          );
        } catch (err) {
          toast.error(err.message);
        }
      },
      { title: 'Xác nhận đặt phòng', confirmLabel: 'Xác nhận', confirmColor: '#16a34a' }
    );
  };

  const handleComplete = (bookingId) => {
    toast.confirm(
      'Bạn có chắc chắn muốn đánh dấu hoàn thành đặt phòng này?',
      async () => {
        try {
          const res = await fetch(
            `http://localhost:8889/api/booking/complete/${bookingId}`,
            { method: 'PUT' }
          );
          if (!res.ok) throw new Error((await res.text()) || 'Lỗi khi hoàn thành đặt phòng');
          toast.success('Đặt phòng đã được đánh dấu hoàn thành.');
          setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 3 } : b))
          );
        } catch (err) {
          toast.error(err.message);
        }
      },
      { title: 'Hoàn thành đặt phòng', confirmLabel: 'Hoàn thành', confirmColor: '#3b82f6' }
    );
  };

  const handleReject = (bookingId) => {
    toast.confirm(
      'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn từ chối đặt phòng này?',
      async () => {
        try {
          const res = await fetch(
            `http://localhost:8889/api/booking/reject/${bookingId}`,
            { method: 'PUT' }
          );
          if (!res.ok) throw new Error((await res.text()) || 'Lỗi khi từ chối đặt phòng');
          toast.success('Đặt phòng đã bị từ chối.');
          await fetchBookings();
        } catch (err) {
          toast.error(err.message);
        }
      },
      { title: 'Từ chối đặt phòng', confirmLabel: 'Từ chối', confirmColor: '#ef4444' }
    );
  };

  const handleCancel = (bookingId) => {
    toast.confirm(
      'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn huỷ đặt phòng này?',
      async () => {
        try {
          const res = await fetch(
            `http://localhost:8889/api/booking/cancel/${bookingId}`,
            { method: 'PUT' }
          );
          if (!res.ok) throw new Error((await res.text()) || 'Lỗi khi huỷ đặt phòng');
          toast.success('Đặt phòng đã được huỷ thành công.');
          setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 0 } : b))
          );
        } catch (err) {
          toast.error(err.message);
        }
      },
      { title: 'Huỷ đặt phòng', confirmLabel: 'Huỷ đặt phòng', confirmColor: '#ef4444' }
    );
  };

  /**
   * Xử lý hoàn tiền: gọi API backend -> trả JSON response từ VNPay ngay (sandbox).
   * Trong môi trường production, VNPay sẽ gọi IPN callback riêng.
   */
  const handleRefund = (booking) => {
    toast.confirm(
      `Xác nhận hoàn tiền ${formatVND(booking.refundAmount || booking.totalPrice)} cho khách hàng?`,
      async () => {
        try {
          const res = await fetch(
            `http://localhost:8889/api/booking/refund/${booking.refundId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // vnpTxnRef và transactionDate để trống vì sandbox không bắt buộc
              body: JSON.stringify({ vnpTxnRef: '', transactionDate: '' }),
            }
          );
          const text = await res.text();
          if (!res.ok) throw new Error(text || 'Lỗi khi gửi yêu cầu hoàn tiền');

          // Parse response JSON từ VNPay
          let vnpResponse = {};
          try { vnpResponse = JSON.parse(text); } catch (_) {}

          const code = vnpResponse.vnp_ResponseCode;
          if (code === '00') {
            toast.success('Hoàn tiền thành công! Tiền sẽ được chuyển về tài khoản khách hàng.', 'Hoàn tiền thành công');
            // Refresh danh sách để cập nhật paymentStatus & refundStatus
            await fetchBookings();
          } else {
            const msg = vnpResponse.vnp_Message || `Mã lỗi VNPay: ${code || 'không xác định'}`;
            toast.error(msg, 'Hoàn tiền thất bại');
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
      {
        title: 'Xác nhận hoàn tiền',
        confirmLabel: 'Hoàn tiền ngay',
        confirmColor: '#7c3aed',
      }
    );
  };

  // ── Filter ────────────────────────────────────────────────────────
  const countByStatus = (statusKey) =>
    statusKey === 'all'
      ? bookings.length
      : bookings.filter((b) => b.bookingStatus === statusKey).length;

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      `${b.lastName || ''} ${b.firstName || ''}`.toLowerCase().includes(q) ||
      (b.hotelName && b.hotelName.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.roomTypeName && b.roomTypeName.toLowerCase().includes(q));
    const matchesTab = activeTab === 'all' || b.bookingStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  // Điều kiện hiển thị nút Hoàn tiền:
  // booking ở trạng thái "Từ chối" (5) hoặc "Yêu cầu huỷ" (4)
  // VÀ paymentStatus = 2 (đã thanh toán)
  // VÀ refundStatus = 1 (chưa được hoàn, đang chờ xử lý)
  const shouldShowRefundButton = (b) =>
    (b.bookingStatus === 5 || b.bookingStatus === 4) &&
    b.paymentStatus === 2 &&
    b.refundStatus === 1 &&
    b.refundId != null;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div style={{
        padding: '24px', backgroundColor: '#fff',
        borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Danh sách đặt phòng
          </h2>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', marginBottom: '20px',
          background: '#f9fafb', padding: '12px 16px',
          borderRadius: '8px', border: '1px solid #e5e7eb',
        }}>
          <span style={{ marginRight: '12px', color: '#6b7280', fontSize: '18px' }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lọc theo tên khách, email, sđt, tên khách sạn..."
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px' }}
          />
        </div>

        {/* Status Tabs */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px',
          flexWrap: 'wrap', borderBottom: '2px solid #f3f4f6', paddingBottom: '0',
        }}>
          {BOOKING_STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = countByStatus(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px', border: 'none',
                  borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                  background: 'transparent', cursor: 'pointer', fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? tab.color : '#6b7280',
                  borderRadius: '0', transition: 'all 0.15s',
                  marginBottom: '-2px', whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? tab.bg : '#f3f4f6',
                  color: isActive ? tab.color : '#6b7280',
                  borderRadius: '12px', padding: '1px 8px',
                  fontSize: '12px', fontWeight: 700,
                  minWidth: '22px', textAlign: 'center',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: '#6b7280', fontSize: '16px' }}>
            ⏳ Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: '#ef4444', fontSize: '16px' }}>
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>Không tìm thấy đặt phòng nào</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#374151', fontSize: '14px', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Khách hàng</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Khách sạn &amp; Phòng</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Thời gian</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Tổng tiền</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Thanh toán</th>
                  <th style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Customer */}
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px', marginBottom: '4px' }}>
                        {b.contactName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✉️</span> {b.email || '—'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span>📞</span> {b.phone || '—'}
                      </div>
                    </td>

                    {/* Hotel & Room */}
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '15px', marginBottom: '4px' }}>
                        {b.hotelName}
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#4b5563',
                        padding: '2px 8px', background: '#f3f4f6',
                        borderRadius: '4px', display: 'inline-block',
                      }}>
                        {b.roomTypeName}
                      </div>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: '10px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, display: 'inline-block', width: '80px' }}>Check-in:</span>
                        {formatDate(b.checkIn)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>
                        <span style={{ fontWeight: 600, display: 'inline-block', width: '80px' }}>Check-out:</span>
                        {formatDate(b.checkOut)}
                      </div>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '16px', verticalAlign: 'top', fontWeight: 700, color: '#003580', fontSize: '16px' }}>
                      {formatVND(b.totalPrice)}
                      {b.refundAmount != null && b.refundStatus != null && (
                        <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500, marginTop: '4px' }}>
                          Hoàn: {formatVND(b.refundAmount)}
                        </div>
                      )}
                    </td>

                    {/* Payment */}
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <PaymentBadge status={b.paymentStatus} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'center' }}>
                      {role !== 'ADMIN' ? (
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'center' }}>
                          {b.bookingStatus === 1 && (
                            <button
                              onClick={() => handleConfirm(b.id)}
                              style={{
                                padding: '6px 12px', background: '#16a34a', color: '#fff',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, width: '120px',
                              }}
                            >
                              Xác nhận
                            </button>
                          )}
                          {b.bookingStatus === 2 && (
                            <button
                              onClick={() => handleComplete(b.id)}
                              style={{
                                padding: '6px 12px', background: '#3b82f6', color: '#fff',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, width: '120px',
                              }}
                            >
                              Hoàn thành
                            </button>
                          )}
                          {b.bookingStatus === 1 && (
                            <button
                              onClick={() => handleReject(b.id)}
                              style={{
                                padding: '6px 12px', background: '#ef4444', color: '#fff',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, width: '120px',
                              }}
                            >
                              Từ chối
                            </button>
                          )}
                          {/* Nút Hoàn tiền: chỉ hiển thị khi refundStatus=1 & paymentStatus=2 */}
                          {shouldShowRefundButton(b) && (
                            <button
                              onClick={() => handleRefund(b)}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                color: '#fff',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 600, width: '120px',
                                boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
                                transition: 'opacity 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                              title={`Hoàn tiền ${formatVND(b.refundAmount || b.totalPrice)}`}
                            >
                              Hoàn tiền
                            </button>
                          )}
                          {b.bookingStatus !== 1 && b.bookingStatus !== 2 &&
                           !shouldShowRefundButton(b) && (
                            <span style={{ fontSize: '13px', color: '#d1d5db' }}>—</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#d1d5db' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}