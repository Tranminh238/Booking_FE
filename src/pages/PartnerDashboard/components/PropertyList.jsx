import React, { useState } from 'react';
import { useHotels } from '../../../api/HotelContext';
import '../partnerDashboard.css';

const formatVND = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "tr ₫"
    : n.toLocaleString("vi-VN") + " ₫";

function PropertyCard({ p, onDelete }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="pd-card" style={{ paddingLeft: '16px' }}>
      <div className="pd-card__thumbnail" style={{ width: '120px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {p.img && !imgError ? (
          <img 
            src={p.img} 
            alt={p.img} 
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <span style={{ fontSize: '24px', color: '#9ca3af', fontWeight: 'bold' }}>{p.initials}</span>
        )}
      </div>

      <div className="pd-card__info">
        <div className="pd-card__name">{p.name}</div>
        <div className="pd-card__location">📍 {p.location}</div>
      </div>

      {/* Rating */}
      <div className="pd-card__stat">
        <div className="pd-card__stat-value pd-card__stat-value--rating">{p.rating ?? "—"}</div>
        <div className="pd-card__stat-label">{p.reviews} đánh giá</div>
      </div>

      {/* Bookings */}
      <div className="pd-card__stat">
        <div className="pd-card__stat-value">{p.bookings}</div>
        <div className="pd-card__stat-label">Đặt phòng</div>
      </div>

      {/* Revenue */}
      <div className="pd-card__stat pd-card__stat--wide">
        <div className="pd-card__stat-value pd-card__stat-value--revenue">{formatVND(p.revenue)}</div>
        <div className="pd-card__stat-label">Doanh thu</div>
      </div>

      <button onClick={() => onDelete(p.id)} className="pd-card__delete-btn">🗑Xóa Khách Sạn</button>
      
    </div>
  );
}

export default function PropertyList() {
  const { active, wait, handleDelete: onDelete } = useHotels();
  const [activeFilter, setActiveFilter] = useState("Hoạt động");
  const [search, setSearch] = useState("");

  const filtered = (activeFilter === "Hoạt động" ? active : wait).filter(
    (p) => (p.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  return (
    <div className="pd-list">
      {/* Header row */}
      <div className="pd-list__header">
        <h2 className="pd-list__title">Các chỗ nghỉ đang hoạt động</h2>
        <div className="pd-list__filters">
          {["Hoạt động", "Chờ duyệt"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`pd-list__filter-btn${activeFilter === f ? ' pd-list__filter-btn--active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="pd-list__search-wrap">
        <span className="pd-list__search-icon">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc theo ID chỗ nghỉ, tên..."
          className="pd-list__search-input"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="pd-list__empty">
          <div className="pd-list__empty-icon">🏨</div>
          <div className="pd-list__empty-text">Không tìm thấy chỗ nghỉ nào</div>
        </div>
      ) : (
        <div className="pd-list__grid">
          {filtered.map((p) => (
            <PropertyCard key={p.id} p={p} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
