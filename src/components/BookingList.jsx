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

const STATUS_TABS = [
  {
    key: "all",
    label: "Tất cả",
    color: "#6b7280",
    bg: "#f3f4f6",
  },
  {
    key: 1,
    label: "Chưa thanh toán",
    color: "#b45309",
    bg: "#fef3c7",
  },
  {
    key: 2,
    label: "Đã xác nhận",
    color: "#16a34a",
    bg: "#dcfce7",
  },
  {
    key: 3,
    label: "Hoàn thành",
    color: "#1e40af",
    bg: "#dbeafe",
  },
  {
    key: 0,
    label: "Đã huỷ",
    color: "#991b1b",
    bg: "#fee2e2",
  },
];

const StatusBadge = ({ status }) => {
  const tab = STATUS_TABS.find((t) => t.key === status);
  if (!tab || tab.key === "all") return <span style={{ color: "#6b7280" }}>Không xác định</span>;
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        background: tab.bg,
        color: tab.color,
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {tab.label}
    </span>
  );
};

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu đặt phòng");
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
          }));

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

  const handleComplete = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hoàn thành đặt phòng này?")) return;
    try {
      const res = await fetch(`http://localhost:8889/api/booking/complete/${bookingId}`, { method: "PUT" });
      if (!res.ok) throw new Error((await res.text()) || "Lỗi khi hoàn thành đặt phòng");
      alert("Hoàn thành đặt phòng thành công!");
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 3 } : b)));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ đặt phòng này?")) return;
    try {
      const res = await fetch(`http://localhost:8889/api/booking/cancel/${bookingId}`, { method: "PUT" });
      if (!res.ok) throw new Error((await res.text()) || "Lỗi khi huỷ đặt phòng");
      alert("Huỷ đặt phòng thành công!");
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 0 } : b)));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Count by status for badge
  const countByStatus = (statusKey) =>
    statusKey === "all"
      ? bookings.length
      : bookings.filter((b) => b.bookingStatus === statusKey).length;

  // Filter by search + active tab
  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      `${b.lastName || ""} ${b.firstName || ""}`.toLowerCase().includes(q) ||
      (b.hotelName && b.hotelName.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.roomTypeName && b.roomTypeName.toLowerCase().includes(q));

    const matchesTab = activeTab === "all" || b.bookingStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div
      className="pd-list"
      style={{
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#111827",
            margin: 0,
          }}
        >
          Danh sách đặt phòng
        </h2>
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          background: "#f9fafb",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <span style={{ marginRight: "12px", color: "#6b7280", fontSize: "18px" }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc theo tên khách, email, sđt, tên khách sạn..."
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            width: "100%",
            fontSize: "15px",
          }}
        />
      </div>

      {/* Status Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
          borderBottom: "2px solid #f3f4f6",
          paddingBottom: "0",
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = countByStatus(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                border: "none",
                borderBottom: isActive ? `3px solid ${tab.color}` : "3px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? tab.color : "#6b7280",
                borderRadius: "0",
                transition: "all 0.15s",
                marginBottom: "-2px",
                whiteSpace: "nowrap",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? tab.bg : "#f3f4f6",
                  color: isActive ? tab.color : "#6b7280",
                  borderRadius: "12px",
                  padding: "1px 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  minWidth: "22px",
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "50px 0", textAlign: "center", color: "#6b7280", fontSize: "16px" }}>
          ⏳ Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div style={{ padding: "50px 0", textAlign: "center", color: "#ef4444", fontSize: "16px" }}>
         {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "64px", color: "#d1d5db", marginBottom: "16px" }}>📋</div>
          <div style={{ fontSize: "16px", color: "#6b7280" }}>Không tìm thấy đặt phòng nào</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  fontSize: "14px",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <th style={{ padding: "16px", fontWeight: 600 }}>Khách hàng</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Khách sạn & Phòng</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Thời gian</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Tổng tiền</th>
                {activeTab === "all" && (
                  <th style={{ padding: "16px", fontWeight: 600 }}>Trạng thái</th>
                )}
                {role !== "ADMIN" && (
                  <th style={{ padding: "16px", fontWeight: 600, textAlign: "center" }}>
                    Hành động
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Customer */}
                  <td style={{ padding: "16px", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: "15px", marginBottom: "4px" }}>
                      {b.contactName}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>✉️</span> {b.email || "—"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span>📞</span> {b.phone || "—"}
                    </div>
                  </td>

                  {/* Hotel & Room */}
                  <td style={{ padding: "16px", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 700, color: "#0369a1", fontSize: "15px", marginBottom: "4px" }}>
                      {b.hotelName}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#4b5563",
                        padding: "2px 8px",
                        background: "#f3f4f6",
                        borderRadius: "4px",
                        display: "inline-block",
                      }}
                    >
                      {b.roomTypeName}
                    </div>
                  </td>

                  {/* Dates */}
                  <td style={{ padding: "10px 16px", verticalAlign: "top" }}>
                    <div style={{ fontSize: "14px", color: "#111827", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, display: "inline-block", width: "80px" }}>Check-in:</span>
                      {formatDate(b.checkIn)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#111827" }}>
                      <span style={{ fontWeight: 600, display: "inline-block", width: "80px" }}>Check-out:</span>
                      {formatDate(b.checkOut)}
                    </div>
                  </td>

                  {/* Price */}
                  <td style={{ padding: "16px", verticalAlign: "top", fontWeight: 700, color: "#003580", fontSize: "16px" }}>
                    {formatVND(b.totalPrice)}
                  </td>

                  {/* Status (only in "all" tab) */}
                  {activeTab === "all" && (
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      <StatusBadge status={b.bookingStatus} />
                    </td>
                  )}

                  {/* Actions */}
                  <td style={{ padding: "16px", verticalAlign: "top", textAlign: "center" }}>
                    {role !== "ADMIN" ? (
                      <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "center" }}>
                        {b.bookingStatus === 2 && (
                          <button
                            onClick={() => handleComplete(b.id)}
                            style={{
                              padding: "6px 12px",
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 500,
                              width: "100px",
                            }}
                          >
                            Hoàn thành
                          </button>
                        )}
                        {(b.bookingStatus === 1 || b.bookingStatus === 2) && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            style={{
                              padding: "6px 12px",
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 500,
                              width: "100px",
                            }}
                          >
                            Huỷ
                          </button>
                        )}
                        {b.bookingStatus !== 1 && b.bookingStatus !== 2 && (
                          <span style={{ fontSize: "13px", color: "#d1d5db" }}>—</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#d1d5db" }}>—</span>
                    )}
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