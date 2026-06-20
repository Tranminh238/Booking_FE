import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { message } from 'antd';
import { FaLocationDot } from "react-icons/fa6";

const getTodayAndTomorrow = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        today: formatDate(today),
        tomorrow: formatDate(tomorrow)
    };
};

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

export const HotelCard = ({ hotel, isWishlisted, onWishlistToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';

    const [priceData, setPriceData] = useState(null);
    const [priceLoading, setPriceLoading] = useState(false);

    const mainImage = (hotel.images && hotel.images.length > 0) ? hotel.images[0] : null;
    const fallbackImage = `https://picsum.photos/seed/hotel-${hotel.id}/400/260`;
    const roomTypes = hotel.roomTypeName
        ? Array.isArray(hotel.roomTypeName)
            ? hotel.roomTypeName
            : hotel.roomTypeName.split(',')
        : [];

    const formatPrice = (price) => {
        if (!price) return null;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleViewDetail = () => {
        navigate(`/hotels/${hotel.id}${location.search}`);
    };

    useEffect(() => {
        const fetchPrice = async () => {
            if (!hotel.id) return;
            
            let start = checkIn;
            let end = checkOut;
            if (!start || !end) {
                const dates = getTodayAndTomorrow();
                start = dates.today;
                end = dates.tomorrow;
            }

            setPriceLoading(true);
            try {
                const res = await fetch(`http://localhost:8889/api/room/hotel/${hotel.id}/discounted-prices?checkIn=${start}&checkOut=${end}`);
                const json = await res.json();
                if (json.status === 200 && Array.isArray(json.data) && json.data.length > 0) {
                    const cheapest = json.data.reduce((min, room) => 
                        room.discountedTotalPrice < min.discountedTotalPrice ? room : min
                    , json.data[0]);
                    setPriceData(cheapest);
                } else {
                    setPriceData(null);
                }
            } catch (err) {
                console.error("Error fetching price for hotel:", hotel.id, err);
                setPriceData(null);
            } finally {
                setPriceLoading(false);
            }
        };

        fetchPrice();
    }, [hotel.id, checkIn, checkOut]);

    return (
        <div className="hotel-card" onClick={handleViewDetail}>
            {/* Image */}
            <div className="hotel-card-img-wrap">
                <img
                    src={mainImage}
                    alt={hotel.name}
                    className="hotel-card-img"
                    onError={e => { e.target.src = fallbackImage; }}
                />
                {hotel.star >= 4 && (
                    <div className="hotel-card-badge">
                        ⭐ Nổi bật
                    </div>
                )}
                {/* Heart Button */}
                {onWishlistToggle && (
                    <button
                        className="wishlist-btn"
                        onClick={(e) => onWishlistToggle(e, hotel.id)}
                    >
                        {isWishlisted ? (
                            <HeartFilled style={{ color: '#ef4444', fontSize: '18px' }} />
                        ) : (
                            <HeartOutlined style={{ color: '#9ca3af', fontSize: '18px' }} />
                        )}
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="hotel-card-info">
                <div className="hotel-card-top">
                    <div className="hotel-card-meta">
                        <h3 className="hotel-card-name">{hotel.name}</h3>
                        <div className="hotel-card-star-row">
                            <StarDisplay star={hotel.star} />
                        </div>
                        <div className="hotel-card-room-types">
                            {roomTypes
                                .map(type => type.trim())
                                .filter(Boolean)
                                .slice(0, 3)
                                .map((type, i) => (
                                    <span key={i} className="hotel-card-room-type">
                                        {type}
                                    </span>
                                ))}

                            {/* Hiển thị +N nếu có nhiều hơn 3 loại */}
                            {roomTypes.length > 3 && (
                                <span className="hotel-card-room-type-more">
                                    +{(Array.isArray(hotel.roomTypeName)
                                        ? hotel.roomTypeName
                                        : hotel.roomTypeName.split(",")
                                    ).length - 3}
                                </span>
                            )}
                        </div>
                        {(hotel.city || hotel.district || hotel.country) && (
                            <p className="hotel-card-location">
                                <FaLocationDot /> {[hotel.city, hotel.country].filter(Boolean).join(', ')}
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
                            {hotel.rating_avg > 0 && (
                                <span className="hotel-card-rating-label">
                                    {hotel.rating_avg >= 9 ? 'Xuất sắc' : hotel.rating_avg >= 8 ? 'Rất tốt' : hotel.rating_avg >= 7 ? 'Tốt' : 'Trung bình'}
                                </span>
                            )}
                        </div>
                        <div className="hotel-card-price-wrap">
                            {priceLoading ? (
                                <span className="hotel-card-price-loading" style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>Đang tải giá...</span>
                            ) : priceData ? (
                                <>
                                    {priceData.hasDiscount && (
                                        <span className="hotel-card-price-original" style={{ textDecoration: 'line-through', color: 'red', fontSize: '14px', marginRight: '6px' }}>
                                            {formatPrice(priceData.originalTotalPrice)}
                                        </span>
                                    )}
                                    <div className="hotel-card-price-row">
                                        <span className="hotel-card-price">{formatPrice(priceData.discountedTotalPrice)}</span>
                                    </div>
                                    
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
                    height: 190px;
                    min-height: 190px;
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
                .wishlist-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.85);
                    border: none;
                    border-radius: 50%;
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                    transition: all 0.2s ease;
                    z-index: 10;
                }
                .wishlist-btn:hover {
                    background: #fff;
                    transform: scale(1.1);
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
                
                    .hotel-card-star-text {
                        font-size: 13px;
                        font-weight: 600;
                        color: #374151;
                    }
                .hotel-card-room-types {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-bottom: 6px;
                }
                .hotel-card-room-type {
                    font-size: 11px;
                    background: #eef2ff;
                    color: #4f46e5;
                    border-radius: 5px;
                    padding: 2px 8px;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .hotel-card-room-type-more {
                    font-size: 11px;
                    color: #9ca3af;
                    border: 1px solid #e5e7eb;
                    border-radius: 5px;
                    padding: 2px 7px;
                    background: #f9fafb;
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
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0 0 8px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .hotel-card-amenities {
                    display: flex;
                    flex-wrap: nowrap;
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
                .hotel-card-price-row{
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
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
    const userId = sessionStorage.getItem("userId");
    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:8889/api/wishlist/user/${userId}/ids`)
                .then(res => res.json())
                .then(resData => {
                    if (resData.status === 200 && Array.isArray(resData.data)) {
                        setWishlistIds(resData.data);
                    }
                })
                .catch(err => console.error("Error fetching wishlist ids:", err));
        }
    }, [userId]);

    const handleWishlistToggle = async (e, hotelId) => {
        e.stopPropagation();
        if (!userId) {
            message.warning('Vui lòng đăng nhập để lưu khách sạn yêu thích!');
            return;
        }
        try {
            const res = await fetch(`http://localhost:8889/api/wishlist/toggle?userId=${userId}&hotelId=${hotelId}`, {
                method: 'POST'
            });
            const resData = await res.json();
            if (resData.status === 200) {
                const isAdded = resData.data;
                if (isAdded) {
                    setWishlistIds(prev => [...prev, hotelId]);
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== hotelId));
                }
            }
        } catch (err) {
            console.error("Error toggling wishlist:", err);
        }
    };

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
                <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    isWishlisted={wishlistIds.includes(hotel.id)}
                    onWishlistToggle={handleWishlistToggle}
                />
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
