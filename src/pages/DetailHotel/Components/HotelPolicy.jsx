import { useState, useEffect } from "react";

// Format Time: "HH:MM:SS" -> "HH:MM"
const formatTime = (time) => {
  if (!time) return null;
  return time.toString().substring(0, 5);
};

const PolicyRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div style={styles.sectionTitle}>{children}</div>
);

export default function HotelPolicy({ hotelId, hotel }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hotel) {
      setData(hotel);
      setLoading(false);
      return;
    }

    if (!hotelId) {
      // Fallback demo data nếu không truyền prop nào
      setData({
        checkin_time_start: "14:00:00",
        checkin_time_end: "22:00:00",
        checkout_time_start: "06:00:00",
        checkout_time_end: "12:00:00",
        amenities: ["Nhà hàng", "Lễ tân 24h", "Chỗ đậu xe", "Thang máy", "WiFi"],
        identificationDocuments: "CMND / Hộ chiếu / Căn cước công dân",
        checkInInstructions: "Khách cần xuất trình giấy tờ tuỳ thân khi nhận phòng. Thanh toán tiền đặt cọc tại quầy lễ tân.",
        smokePolicy: "Không hút thuốc trong phòng. Khu vực hút thuốc riêng tại tầng 1.",
        petPolicy: "Không cho phép mang thú cưng vào khách sạn.",
        isRefund: 1,
        minDateRefund: 3,
        refundPercentage: 80,
      });
      setLoading(false);
      return;
    }

    const fetchHotelDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8889/api/hotel/gethoteldetail/${hotelId}`);
        const result = await response.json();
        if (result.status === 200 || result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching hotel policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [hotelId, hotel]);

  if (loading) {
    return (
      <div style={styles.container}>
        <SectionTitle>Thông tin chung</SectionTitle>
        <div style={{ padding: "30px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          Đang tải thông tin khách sạn...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const checkinStart = formatTime(data.checkin_time_start);
  const checkinEnd = formatTime(data.checkin_time_end);
  const checkoutStart = formatTime(data.checkout_time_start);
  const checkoutEnd = formatTime(data.checkout_time_end);

  const checkinStr =
    checkinStart && checkinEnd
      ? `Từ ${checkinStart} - đến ${checkinEnd}`
      : checkinStart
      ? `Từ ${checkinStart}`
      : null;

  const checkoutStr =
    checkoutStart && checkoutEnd
      ? `Từ ${checkoutStart} - đến ${checkoutEnd}`
      : checkoutEnd
      ? `Trước ${checkoutEnd}`
      : null;

  const amenitiesStr = Array.isArray(data.amenities)
    ? data.amenities.join(", ")
    : data.amenities;

  const refundInfo =
    data.isRefund === 1
      ? `Có hoàn tiền — Huỷ trước ${data.minDateRefund} ngày được hoàn ${data.refundPercentage}%`
      : data.isRefund === 0
      ? "Không hoàn tiền"
      : null;

  const rows = [
    { label: "Tiện ích chung", value: amenitiesStr },
    { label: "Thời gian nhận phòng", value: checkinStr },
    { label: "Thời gian trả phòng", value: checkoutStr },
    { label: "Giấy tờ tuỳ thân", value: data.identificationDocuments },
    { label: "Hướng dẫn nhận phòng", value: data.checkInInstructions },
    { label: "Chính sách hút thuốc", value: data.smokePolicy },
    { label: "Chính sách thú cưng", value: data.petPolicy },
    { label: "Chính sách hoàn tiền", value: refundInfo },
  ];

  return (
    <div style={styles.container}>
      <SectionTitle>Thông tin chung</SectionTitle>
      <div style={styles.table}>
        {rows.map((row, i) => (
          <PolicyRow key={i} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: 860,
    margin: "24px auto",
    background: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1a6faf",
    padding: "14px 20px",
    borderBottom: "2px solid #1a6faf",
    background: "#f0f7ff",
    letterSpacing: 0.1,
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    borderBottom: "1px solid #e5e7eb",
    },

    label: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#374151",
    background: "#f5f5f5",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "flex-start",
    lineHeight: 1.6,
    },

    value: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#111827",
    background: "#ffffff",
    lineHeight: 1.8,
    wordBreak: "break-word",
    },
};