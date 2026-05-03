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

  const role = localStorage.getItem("partner_role") || localStorage.getItem("role");
  const userId = localStorage.getItem("partner_userId");

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
          return list.map((item, index) => ({
            id: index, // Tạm thời dùng index vì API List<Object[]> không trả về ID booking
            firstName: item[0],
            lastName: item[1],
            email: item[2],
            phone: item[3],
            hotelName: item[4],
            roomTypeName: item[5],
            checkIn: item[6],
            checkOut: item[7],
            totalPrice: item[8],
            paymentStatus: item[9],
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
                <th style={{ padding: '16px', borderRadius: '0 8px 8px 0', fontWeight: 600 }}>Trạng thái TT</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s', ':hover': { background: '#f9fafb' } }}>
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{b.lastName} {b.firstName}</div>
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
                      background: b.paymentStatus === 1 ? '#dcfce7' : (b.paymentStatus === 2 ? '#dbeafe' : '#fef3c7'),
                      color: b.paymentStatus === 1 ? '#16a34a' : (b.paymentStatus === 2 ? '#1e40af' : '#b45309'),
                      display: 'inline-block'
                    }}>
                      {b.paymentStatus === 2 ? 'Đã thanh toán' : (b.paymentStatus === 1 ? 'Chưa thanh toán' : 'Hoàn thành')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
