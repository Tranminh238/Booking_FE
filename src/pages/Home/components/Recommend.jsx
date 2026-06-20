import React, { useState, useEffect } from 'react';
import { HeartOutlined, HeartFilled, LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8889';
const CARDS_PER_VIEW = 4;

/* ─────────────────────── Helpers ─────────────────────── */
const formatVND = (amount) =>
  'VND ' + Number(amount).toLocaleString('vi-VN');

const getRatingLabel = (r) => {
  if (!r) return null;
  if (r >= 9) return 'Tuyệt hảo';
  if (r >= 8) return 'Tuyệt vời';
  if (r >= 7) return 'Rất tốt';
  if (r >= 6) return 'Tốt';
  return 'Khá tốt';
};

const getImageUrl = (hotel) => {
  if (hotel.images && hotel.images.length > 0) {
    const img = hotel.images[0];
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img}`;
  }
  return `https://picsum.photos/seed/${hotel.id ?? 1}/800/500`;
};

const getAddress = (hotel) => {
  const parts = [hotel.district, hotel.city, hotel.country].filter(Boolean);
  return parts.join(', ') || 'Việt Nam';
};

// Hiển thị sao
const StarRating = ({ count }) => (
  <span className="inline-flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={i < (count || 0) ? '#FAAD14' : '#E5E7EB'}
        className="w-3 h-3"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

/* ─────────────────────── Skeleton Card ─────────────────────── */
const SkeletonCard = () => (
  <div
    style={{
      flex: `0 0 calc(${100 / CARDS_PER_VIEW}% - ${((CARDS_PER_VIEW - 1) * 16) / CARDS_PER_VIEW}px)`,
      minWidth: 0,
    }}
    className="animate-pulse"
  >
    <div className="rounded-lg overflow-hidden bg-gray-200" style={{ height: 200 }} />
    <div className="pt-2.5 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

/* ─────────────────────── Hotel Card ─────────────────────── */
const HotelRecommendCard = ({ hotel, isInWishlist, onWishlistToggle, onCardClick }) => {
  const rating = hotel.rating_avg ? parseFloat(hotel.rating_avg) : null;
  const minPrice = hotel.min_price;

  return (
    <div
      style={{
        flex: `0 0 calc(${100 / CARDS_PER_VIEW}% - ${((CARDS_PER_VIEW - 1) * 16) / CARDS_PER_VIEW}px)`,
        minWidth: 0,
      }}
      className="group cursor-pointer"
      onClick={() => onCardClick(hotel)}
    >
      {/* Image */}
      <div className="relative rounded-lg overflow-hidden" style={{ height: 200 }}>
        <img
          src={getImageUrl(hotel)}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${hotel.id}/600/400`;
          }}
        />
        {/* Wishlist Button */}
        <button 
          onClick={(e) => onWishlistToggle(e, hotel.id)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 hover:bg-white flex items-center justify-center border-none shadow-md cursor-pointer transition-all duration-200 hover:scale-110 z-10"
        >
          {isInWishlist ? (
            <HeartFilled style={{ color: '#ef4444', fontSize: '16px' }} />
          ) : (
            <HeartOutlined style={{ color: '#9ca3af', fontSize: '16px' }} />
          )}
        </button>
        {/* Star badge */}
        {hotel.star > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/50 rounded px-1.5 py-0.5">
            <StarFilled style={{ color: '#FAAD14', fontSize: 11 }} />
            <span className="text-white text-xs font-semibold">{hotel.star}</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="pt-2.5 pb-1">
        {/* Stars */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <StarRating count={hotel.star} />
        </div>

        {/* Name */}
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5 group-hover:text-blue-700 transition-colors truncate">
          {hotel.name}
        </h3>

        {/* Location */}
        <p className="text-gray-500 text-xs mb-2">{getAddress(hotel)}</p>

        {/* Rating + Price Row */}
        <div className="flex items-end justify-between gap-2">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            {rating ? (
              <>
                <span
                  className="text-white text-sm font-bold px-1.5 py-0.5 rounded"
                  style={{ background: '#2563EB', minWidth: 32, textAlign: 'center' }}
                >
                  {rating.toFixed(1)}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-none">
                    {rating >= 9 ? 'Tuyệt hảo' : rating >= 8 ? 'Tuyệt vời' : rating >= 7 ? 'Rất tốt' : 'Tốt'}
                  </p>
                  {hotel.review_count > 0 && (
                    <p className="text-xs text-gray-400 leading-none mt-0.5">
                      {hotel.review_count.toLocaleString('vi-VN')} đánh giá
                    </p>
                  )}
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-400">Chưa có đánh giá</span>
            )}
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            {minPrice ? (
              <>
                <p className="text-xs text-gray-500 leading-none mb-0.5">Bắt đầu từ</p>
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {formatVND(minPrice)}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Liên hệ để biết giá</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── Main Component ─────────────────────── */
const Recommend = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const userId = sessionStorage.getItem('userId');
  const today = new Date();
  const checkIn = today.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });
  const checkOut = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });

  /* Lấy wishlist IDs */
  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE_URL}/api/wishlist/user/${userId}/ids`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) setWishlistIds(res.data);
      })
      .catch(console.error);
  }, [userId]);

  /* Lấy gợi ý khách sạn */
  useEffect(() => {
    const url = userId
      ? `${BASE_URL}/api/recommend/hotels?userId=${userId}&limit=4`
      : `${BASE_URL}/api/recommend/popular?limit=4`;

    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          setHotels(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const maxStart = Math.max(0, hotels.length - CARDS_PER_VIEW);

  const handlePrev = () => {
    if (isAnimating || startIndex === 0) return;
    setIsAnimating(true);
    setStartIndex((i) => Math.max(0, i - 1));
    setTimeout(() => setIsAnimating(false), 450);
  };

  const handleNext = () => {
    if (isAnimating || startIndex >= maxStart) return;
    setIsAnimating(true);
    setStartIndex((i) => Math.min(maxStart, i + 1));
    setTimeout(() => setIsAnimating(false), 450);
  };

  const handleWishlistToggle = async (e, hotelId) => {
    e.stopPropagation();
    if (!userId) {
      message.warning('Vui lòng đăng nhập để lưu khách sạn yêu thích!');
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(
        `${BASE_URL}/api/wishlist/toggle?userId=${userId}&hotelId=${hotelId}`,
        { method: 'POST' }
      );
      const resData = await res.json();
      if (resData.status === 200) {
        const added = resData.data;
        setWishlistIds((prev) =>
          added ? [...prev, hotelId] : prev.filter((id) => id !== hotelId)
        );
      }
    } catch (err) {
      console.error('Lỗi wishlist toggle:', err);
    }
  };

  const handleCardClick = (hotel) => {
    navigate(`/hotels/${hotel.id}`);
  };

  const cardWidthPercent = 100 / CARDS_PER_VIEW;
  const gap = 16;

  /* ─── Không có dữ liệu ─── */
  if (!loading && hotels.length === 0) return null;

  return (
    <section className="py-10 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* ── Header ── */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-0.5">
            {userId ? 'Bạn có thể quan tâm' : 'Khách sạn nổi bật'}
          </h2>
          <p className="text-gray-400 text-sm">
            Giá cho 2 người, từ {checkIn}–{checkOut}
          </p>
        </div>

        {/* ── Carousel ── */}
        <div className="relative">
          {/* Left Arrow */}
          {!loading && startIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute -left-4 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <LeftOutlined style={{ fontSize: 13 }} />
            </button>
          )}

          {/* Viewport */}
          <div style={{ overflow: 'hidden' }}>
            {/* Track */}
            <div
              style={{
                display: 'flex',
                gap: `${gap}px`,
                transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: `translateX(calc(-${startIndex * cardWidthPercent}% - ${startIndex * gap}px))`,
                willChange: 'transform',
              }}
            >
              {loading
                ? Array.from({ length: CARDS_PER_VIEW }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : hotels.map((hotel) => (
                    <HotelRecommendCard
                      key={hotel.id}
                      hotel={hotel}
                      isInWishlist={wishlistIds.includes(hotel.id)}
                      onWishlistToggle={handleWishlistToggle}
                      onCardClick={handleCardClick}
                    />
                  ))}
            </div>
          </div>

          {/* Right Arrow */}
          {!loading && startIndex < maxStart && (
            <button
              onClick={handleNext}
              className="absolute -right-4 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <RightOutlined style={{ fontSize: 13 }} />
            </button>
          )}
        </div>

        {/* ── Xem tất cả ── */}
        {!loading && hotels.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/hotels')}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors border-none bg-transparent cursor-pointer"
            >
              Xem tất cả khách sạn
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Recommend;
