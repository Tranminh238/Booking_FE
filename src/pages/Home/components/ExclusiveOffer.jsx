import React, { useState, useEffect } from 'react';
import { LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const CARDS_PER_VIEW = 4;
const BASE_URL = 'http://localhost:8889';

// Format VND
const formatVND = (amount) =>
  'VND ' + Number(amount).toLocaleString('vi-VN');

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



// Skeleton card
const SkeletonCard = () => (
  <div
    style={{
      flex: `0 0 calc(${100 / CARDS_PER_VIEW}% - ${(3 * 16) / CARDS_PER_VIEW}px)`,
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

const ExclusiveOffer = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/hotel/gethotelactive`);
        const data = await res.json();
        if (data.status === 200 && Array.isArray(data.data)) {
          setHotels(data.data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách khách sạn:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

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

  const cardWidthPercent = 100 / CARDS_PER_VIEW;
  const gap = 16; // px
  const translateValue = startIndex * cardWidthPercent;

  const getImageUrl = (hotel) => {
    if (hotel.images && hotel.images.length > 0) {
      const img = hotel.images[0];
      // Nếu là URL đầy đủ thì dùng luôn, nếu không thì ghép base URL
      if (img.startsWith('http')) return img;
      return `${BASE_URL}${img}`;
    }
    return `https://picsum.photos/seed/${hotel.id}/600/400`;
  };

  const getAddress = (hotel) => {
    const parts = [hotel.city, hotel.country].filter(Boolean);
    return parts.join(', ') || 'Việt Nam';
  };

  const getMinPrice = (hotel) => hotel.min_price || null;


  const handleHotelClick = (hotel) => {
    navigate(`/hotels/${hotel.id}`);
  };

  const renderContent = () => {
    const displayList = loading
      ? Array.from({ length: CARDS_PER_VIEW })
      : hotels;

    if (!loading && hotels.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
            alt="No hotels"
            className="w-16 h-16 mx-auto mb-4 opacity-40"
          />
          <p>Chưa có khách sạn nào trong hệ thống.</p>
        </div>
      );
    }

    return (
      <div className="relative mt-5">
        {/* Left Arrow */}
        {!loading && startIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute -left-4 md:-left-5 top-1/2 -translate-y-8 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <LeftOutlined style={{ fontSize: 14 }} />
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
              transform: `translateX(calc(-${translateValue}% - ${startIndex * gap}px))`,
              willChange: 'transform',
            }}
          >
            {loading
              ? Array.from({ length: CARDS_PER_VIEW }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : hotels.map((hotel) => {
                  const minPrice = getMinPrice(hotel);
                  const rating = hotel.rating_avg ? parseFloat(hotel.rating_avg) : null;

                  return (
                    <div
                      key={hotel.id}
                      style={{
                        flex: `0 0 calc(${cardWidthPercent}% - ${((CARDS_PER_VIEW - 1) * gap) / CARDS_PER_VIEW}px)`,
                        minWidth: 0,
                      }}
                      className="group cursor-pointer"
                      onClick={() => handleHotelClick(hotel)}
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
                        {/* Star badge */}
                        {hotel.star && (
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
                                  style={{ background: '#2563EB' , minWidth: 32, textAlign: 'center' }}
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
                })}
          </div>
        </div>

        {/* Right Arrow */}
        {!loading && startIndex < maxStart && (
          <button
            onClick={handleNext}
            className="absolute -right-4 md:-right-5 top-1/2 -translate-y-8 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <RightOutlined style={{ fontSize: 14 }} />
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="py-10 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-2 ml-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Khách sạn nổi bật trong hệ thống
          </h2>
          <p className="text-gray-500 text-sm">
            Khám phá các chỗ nghỉ tuyệt vời đang hoạt động — đặt phòng ngay hôm nay!
          </p>
        </div>

        {/* Carousel */}
        {renderContent()}
      </div>
    </section>
  );
};

export default ExclusiveOffer;