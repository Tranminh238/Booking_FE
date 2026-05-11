import React, { useState, useEffect } from 'react';
import '../pages/PartnerDashboard/partnerDashboard.css';

const formatVND = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "tr ₫"
    : n.toLocaleString("vi-VN") + " ₫";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const role = sessionStorage.getItem("partner_role") || sessionStorage.getItem("role");
  const userId = sessionStorage.getItem("partner_userId");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = "";
        if (role === "ADMIN") {
          url = "http://localhost:8889/api/booking/all";
        } else {
          if (!userId) {
            setError("Không tìm thấy thông tin đối tác.");
            setLoading(false);
            return;
          }
          url = `http://localhost:8889/api/booking/partner/${userId}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Lỗi khi tải dữ liệu đặt phòng");
        }
        const data = await res.json();

        const parseBookings = (list) => {
          return list.map((item) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email || item.contactEmail,
            phone: item.phone || item.contactPhone,
            hotelName: item.hotelName,
            roomTypeName: item.roomTypeName,
            checkIn: item.checkInDate,   // ← DTO dùng checkInDate
            checkOut: item.checkOutDate, // ← DTO dùng checkOutDate
            totalPrice: item.totalPrice,
            paymentStatus: item.paymentStatus,
            bookingStatus: item.bookingStatus,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            contactEmail: item.contactEmail,
            numRoom: item.numRoom,
          }));
        };

        if (Array.isArray(data)) {
          setBookings(parseBookings(data));
        } else if (data && data.data && Array.isArray(data.data)) {
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
  }, [role, userId]);

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    const customerName = `${b.lastName || ""} ${b.firstName || ""}`.toLowerCase();
    return (
      customerName.includes(q) ||
      (b.hotelName && b.hotelName.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.roomTypeName && b.roomTypeName.toLowerCase().includes(q))
    );
  });

  const handleComplete = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hoàn thành đặt phòng này?")) return;
    try {
      const res = await fetch(`http://localhost:8889/api/booking/complete/${bookingId}`, {
        method: 'PUT'
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Lỗi khi hoàn thành đặt phòng");
      }
      alert("Hoàn thành đặt phòng thành công!");
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: 3 } : b));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ đặt phòng này?")) return;
    try {
      const res = await fetch(`http://localhost:8889/api/booking/cancel/${bookingId}`, {
        method: 'PUT'
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Lỗi khi huỷ đặt phòng");
      }
      alert("Huỷ đặt phòng thành công!");
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: 0 } : b));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="pd-list" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
      <div className="pd-list__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="pd-list__title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Danh sách đặt phòng</h2>
      </div>

      <div className="pd-list__search-wrap" style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', background: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <span className="pd-list__search-icon" style={{ marginRight: '12px', color: '#6b7280', fontSize: '18px' }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc theo tên khách, email, sđt, tên khách sạn..."
          className="pd-list__search-input"
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: '#6b7280', fontSize: '16px' }}>⏳ Đang tải dữ liệu...</div>
      ) : error ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: '#ef4444', fontSize: '16px' }}>❌ {error}</div>
      ) : filteredBookings.length === 0 ? (
        <div className="pd-list__empty" style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="pd-list__empty-icon" style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }}>📋</div>
          <div className="pd-list__empty-text" style={{ fontSize: '16px', color: '#6b7280' }}>Không tìm thấy đặt phòng nào</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', color: '#374151', fontSize: '14px', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', borderRadius: '8px 0 0 8px', fontWeight: 600 }}>Khách hàng</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Khách sạn & Phòng</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Thời gian</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Tổng tiền</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Trạng thái</th>
                {role !== 'ADMIN' && <th style={{ padding: '16px', borderRadius: '0 8px 8px 0', fontWeight: 600, textAlign: 'center' }}>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s', ':hover': { background: '#f9fafb' } }}>
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{b.contactName}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><span>✉️</span> {b.email || '—'}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><span>📞</span> {b.phone || '—'}</div>
                  </td>
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '15px', marginBottom: '4px' }}>🏨 {b.hotelName}</div>
                    <div style={{ fontSize: '13px', color: '#4b5563', padding: '2px 8px', background: '#f3f4f6', borderRadius: '4px', display: 'inline-block' }}>🛏️ {b.roomTypeName}</div>
                  </td>
                  <td style={{ padding: '10px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, display: 'inline-block', width: '80px' }}>Check-in:</span> {formatDate(b.checkIn)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      <span style={{ fontWeight: 600, display: 'inline-block', width: '80px' }}>Check-out:</span> {formatDate(b.checkOut)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', verticalAlign: 'top', fontWeight: 700, color: '#003580', fontSize: '16px' }}>
                    {formatVND(b.totalPrice)}
                  </td>
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: b.bookingStatus === 3 ? '#dbeafe' : b.bookingStatus === 0 ? '#fee2e2' : b.bookingStatus === 2 ? '#dcfce7' : '#fef3c7',
                      color: b.bookingStatus === 3 ? '#1e40af' : b.bookingStatus === 0 ? '#991b1b' : b.bookingStatus === 2 ? '#16a34a' : '#b45309',
                      display: 'inline-block'
                    }}>
                      {b.bookingStatus === 1 ? 'Chờ xác nhận' : b.bookingStatus === 2 ? 'Đã xác nhận' : b.bookingStatus === 3 ? 'Hoàn thành' : b.bookingStatus === 0 ? 'Đã huỷ' : 'Không xác định'}
                    </span>
                  </td>
                  {role !== 'ADMIN' && (
                    <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'center' }}>
                        {b.bookingStatus === 2 && (
                          <button
                            onClick={() => handleComplete(b.id)}
                            style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, width: '100px' }}
                          >
                            Hoàn thành
                          </button>
                        )}
                        {(b.bookingStatus === 1 || b.bookingStatus === 2) && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, width: '100px' }}
                          >
                            Huỷ
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
