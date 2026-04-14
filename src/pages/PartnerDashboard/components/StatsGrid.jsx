import React from 'react';
import { useHotels } from '../../../api/HotelContext';
import '../partnerDashboard.css';

const formatVND = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "tr ₫"
    : n.toLocaleString("vi-VN") + " ₫";

export default function StatsGrid() {
  const { active } = useHotels();
  const totalRevenue = active.reduce((s, p) => s + p.revenue, 0);
  const totalBookings = active.reduce((s, p) => s + p.bookings, 0);
  const avgRating =
    active.length > 0
      ? (active.reduce((s, p) => s + p.rating, 0) / active.length).toFixed(1)
      : "—";

  const stats = [
    { label: "Chỗ nghỉ hoạt động", value: active.length, icon: "🏨", color: "#003580" },
    { label: "Tổng đặt phòng", value: totalBookings, icon: "📅", color: "#0ea5e9" },
    { label: "Doanh thu tháng", value: formatVND(totalRevenue), icon: "💰", color: "#10b981" },
    { label: "Đánh giá trung bình", value: avgRating, icon: "⭐", color: "#f59e0b" },
  ];

  return (
    <div className="pd-stats">
      {stats.map((s) => (
        <div
          key={s.label}
          className="pd-stats__card"
          style={{ borderLeft: `4px solid ${s.color}` }}
        >
          <div className="pd-stats__icon">{s.icon}</div>
          <div className="pd-stats__value">{s.value}</div>
          <div className="pd-stats__label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
