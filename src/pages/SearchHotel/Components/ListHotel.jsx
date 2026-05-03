import React from 'react';
import { useNavigate } from 'react-router-dom';

const StarDisplay = ({ star }) => {
    const count = Math.round(star || 0);
    return (
        <span style={{ color: '#f59e0b', fontSize: '13px', letterSpacing: '1px' }}>
            {'★'.repeat(Math.min(count, 5))}{'☆'.repeat(Math.max(0, 5 - count))}
        </span>
    );
};

const RatingBadge = ({ rating }) => {
    if (!rating) return null;
    const r = parseFloat(rating).toFixed(1);
    let color = '#22c55e';
    if (r < 7) color = '#f59e0b';
    if (r < 5) color = '#ef4444';
    return (
        <div style={{
            background: color,
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            borderRadius: '8px 8px 8px 0',
            padding: '4px 10px',
            minWidth: '40px',
            textAlign: 'center',
            lineHeight: 1.3
        }}>
            {r}
        </div>
    );
};

const HotelCard = ({ hotel }) => {
    const navigate = useNavigate();
    const mainImage = (hotel.images && hotel.images.length > 0) ? hotel.images[0] : null;
    const fallbackImage = `https://picsum.photos/seed/hotel-${hotel.id}/400/260`;

    const formatPrice = (price) => {
        if (!price) return null;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleViewDetail = () => {
        navigate(`/hotels/${hotel.id}`);
    };

    return (
        <div className="hotel-card" onClick={handleViewDetail}>
            {/* Image */}
            <div className="hotel-card-img-wrap">
                <img
                    src={mainImage || fallbackImage}
                    alt={hotel.name}
                    className="hotel-card-img"
                    onError={e => { e.target.src = fallbackImage; }}
                />
                {hotel.star >= 4 && (
                    <div className="hotel-card-badge">
                        ⭐ Nổi bật
                    </div>
                )}
                {/* Image count */}
                {hotel.images && hotel.images.length > 1 && (
                    <div className="hotel-card-img-count">
                        📷 {hotel.images.length}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="hotel-card-info">
                <div className="hotel-card-top">
                    <div className="hotel-card-meta">
                        <h3 className="hotel-card-name">{hotel.name}</h3>
                        <div className="hotel-card-star-row">
                            <StarDisplay star={hotel.star} />
                            {hotel.roomTypeName && (
                                <span className="hotel-card-room-type">{hotel.roomTypeName}</span>
                            )}
                        </div>
                        {(hotel.city || hotel.district) && (
                            <p className="hotel-card-location">
                                📍 {[hotel.district, hotel.city, hotel.country].filter(Boolean).join(', ')}
                            </p>
                        )}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="hotel-card-amenities">
                                {hotel.amenities.slice(0, 4).map((a, i) => (
                                    <span key={i} className="hotel-card-amenity-tag">{a}</span>
                                ))}
                                {hotel.amenities.length > 4 && (
                                    <span className="hotel-card-amenity-more">+{hotel.amenities.length - 4}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rating + Price */}
                    <div className="hotel-card-right">
                        <div className="hotel-card-rating-wrap">
                            <RatingBadge rating={hotel.rating_avg} />
                            {hotel.rating_avg && (
                                <span className="hotel-card-rating-label">
                                    {hotel.rating_avg >= 9 ? 'Xuất sắc' : hotel.rating_avg >= 8 ? 'Rất tốt' : hotel.rating_avg >= 7 ? 'Tốt' : 'Trung bình'}
                                </span>
                            )}
                        </div>
                        <div className="hotel-card-price-wrap">
                            {hotel.roomPricePerNight ? (
                                <>
                                    <span className="hotel-card-price-label">Giá từ</span>
                                    <span className="hotel-card-price">{formatPrice(hotel.roomPricePerNight)}</span>
                                    <span className="hotel-card-price-unit">/đêm</span>
                                </>
                            ) : (
                                <span className="hotel-card-price-na">Liên hệ</span>
                            )}
                            <button className="hotel-card-btn" onClick={e => { e.stopPropagation(); handleViewDetail(); }}>
                                Xem phòng →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hotel-card {
                    display: flex;
                    background: #fff;
                    border-radius: 14px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                    overflow: hidden;
                    cursor: pointer;
                    transition: box-shadow 0.25s, transform 0.25s;
                    border: 1.5px solid #f1f5f9;
                }
                .hotel-card:hover {
                    box-shadow: 0 8px 32px rgba(79,70,229,0.13);
                    transform: translateY(-2px);
                    border-color: #c7d2fe;
                }
                .hotel-card-img-wrap {
                    width: 240px;
                    min-width: 200px;
                    position: relative;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .hotel-card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s;
                    min-height: 160px;
                }
                .hotel-card:hover .hotel-card-img { transform: scale(1.05); }
                .hotel-card-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: linear-gradient(135deg, #f59e0b, #f97316);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 3px 8px;
                    border-radius: 6px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                .hotel-card-img-count {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.5);
                    color: #fff;
                    font-size: 11px;
                    padding: 2px 7px;
                    border-radius: 5px;
                }
                .hotel-card-info {
                    flex: 1;
                    padding: 16px 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-width: 0;
                }
                .hotel-card-top {
                    display: flex;
                    gap: 16px;
                    justify-content: space-between;
                }
                .hotel-card-meta { flex: 1; min-width: 0; }
                .hotel-card-name {
                    font-size: 17px;
                    font-weight: 700;
                    color: #1e1b4b;
                    margin: 0 0 6px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .hotel-card-star-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                }
                .hotel-card-room-type {
                    font-size: 11px;
                    background: #eef2ff;
                    color: #4f46e5;
                    border-radius: 5px;
                    padding: 2px 8px;
                    font-weight: 600;
                }
                .hotel-card-location {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0 0 8px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .hotel-card-amenities {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    margin-top: 6px;
                }
                .hotel-card-amenity-tag {
                    font-size: 11px;
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 1px solid #bbf7d0;
                    border-radius: 5px;
                    padding: 2px 7px;
                }
                .hotel-card-amenity-more {
                    font-size: 11px;
                    color: #9ca3af;
                    border: 1px solid #e5e7eb;
                    border-radius: 5px;
                    padding: 2px 7px;
                    background: #f9fafb;
                }
                .hotel-card-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: space-between;
                    min-width: 140px;
                    padding-left: 8px;
                }
                .hotel-card-rating-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 4px;
                }
                .hotel-card-rating-label {
                    font-size: 12px;
                    color: #374151;
                    font-weight: 500;
                }
                .hotel-card-price-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 4px;
                }
                .hotel-card-price-label {
                    font-size: 11px;
                    color: #9ca3af;
                }
                .hotel-card-price {
                    font-size: 18px;
                    font-weight: 800;
                    color: #003580;
                }
                .hotel-card-price-unit {
                    font-size: 11px;
                    color: #6b7280;
                }
                .hotel-card-price-na {
                    font-size: 14px;
                    color: #9ca3af;
                    font-style: italic;
                }
                .hotel-card-btn {
                    margin-top: 8px;
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 18px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .hotel-card-btn:hover {
                    background: linear-gradient(135deg, #4338ca, #4f46e5);
                    transform: translateX(2px);
                }
                @media (max-width: 640px) {
                    .hotel-card { flex-direction: column; }
                    .hotel-card-img-wrap { width: 100%; min-height: 180px; }
                    .hotel-card-right { flex-direction: row; align-items: flex-end; justify-content: space-between; min-width: unset; padding-left: 0; margin-top: 10px; }
                }
            `}</style>
        </div>
    );
};

const ListHotel = ({ hotels, loading, total, page, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(total / pageSize);

    if (loading) {
        return (
            <div className="list-hotel-loading">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="hotel-card-skeleton">
                        <div className="skeleton-img" />
                        <div className="skeleton-body">
                            <div className="skeleton-line w-60" />
                            <div className="skeleton-line w-40" />
                            <div className="skeleton-line w-80" />
                            <div className="skeleton-line w-32" />
                        </div>
                    </div>
                ))}
                <style>{`
                    .list-hotel-loading { display: flex; flex-direction: column; gap: 16px; }
                    .hotel-card-skeleton { display: flex; background: #fff; border-radius: 14px; overflow: hidden; border: 1.5px solid #f1f5f9; }
                    .skeleton-img { width: 240px; min-height: 160px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink: 0; }
                    .skeleton-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
                    .skeleton-line { height: 14px; border-radius: 6px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
                    .w-60 { width: 60%; }
                    .w-40 { width: 40%; }
                    .w-80 { width: 80%; }
                    .w-32 { width: 32%; }
                    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                `}</style>
            </div>
        );
    }

    if (!hotels || hotels.length === 0) {
        return (
            <div className="list-hotel-empty">
                <h3>Không tìm thấy khách sạn nào</h3>
                <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <style>{`
                    .list-hotel-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: #fff; border-radius: 14px; border: 1.5px dashed #e2e8f0; }
                    .empty-icon { font-size: 56px; margin-bottom: 12px; }
                    .list-hotel-empty h3 { font-size: 18px; font-weight: 700; color: #374151; margin: 0 0 6px 0; }
                    .list-hotel-empty p { font-size: 14px; color: #9ca3af; margin: 0; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="list-hotel-wrap">
            {hotels.map(hotel => (
                <HotelCard key={hotel.id} hotel={hotel} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="list-hotel-pagination">
                    <button
                        className="page-btn"
                        disabled={page === 0}
                        onClick={() => onPageChange(page - 1)}
                    >‹ Trước</button>

                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                        // smart pagination: show first, last, current ±1, and ellipsis
                        let pageNum = i;
                        if (totalPages > 7) {
                            const pages = new Set([0, totalPages - 1, page, page - 1, page + 1].filter(p => p >= 0 && p < totalPages));
                            const sorted = Array.from(pages).sort((a, b) => a - b);
                            pageNum = sorted[i] ?? -1;
                        }
                        if (pageNum === -1) return null;
                        return (
                            <button
                                key={pageNum}
                                className={`page-btn ${page === pageNum ? 'active' : ''}`}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}

                    <button
                        className="page-btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(page + 1)}
                    >Sau ›</button>
                </div>
            )}

            <style>{`
                .list-hotel-wrap { display: flex; flex-direction: column; gap: 16px; }
                .list-hotel-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; }
                .page-btn { padding: 6px 14px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.18s; }
                .page-btn:hover:not(:disabled) { background: #eef2ff; border-color: #4f46e5; color: #4f46e5; }
                .page-btn.active { background: #4f46e5; border-color: #4f46e5; color: #fff; font-weight: 700; }
                .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ListHotel;
