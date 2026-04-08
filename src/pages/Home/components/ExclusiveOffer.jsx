import React, { useState } from 'react';
import { HeartOutlined, HeartFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';

// ===== Dữ liệu mẫu =====
const HOTELS = [
  {
    id: 1,  
    type: 'Nhà nghỉ',
    stars: 4,
    name: 'Mekong Lodge Resort',
    location: 'Cái Bè, Việt Nam',
    ratingScore: 8.7,
    ratingLabel: 'Tuyệt vời',
    reviewCount: 1061,
    originalPrice: 3000000,
    discountPrice: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
  {
    id: 2,
    type: 'Resort',
    stars: 3,
    name: 'Green Bamboo Lodge Resort',
    location: 'Cát Tiên, Việt Nam',
    ratingScore: 8.4,
    ratingLabel: 'Rất tốt',
    reviewCount: 688,
    originalPrice: null,
    discountPrice: 332500,
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80',
  },
  {
    id: 3,
    type: 'Resort',
    stars: 4,
    name: 'Hmong Village Resort',
    location: 'Hà Giang, Việt Nam',
    ratingScore: 9.2,
    ratingLabel: 'Tuyệt hảo',
    reviewCount: 158,
    originalPrice: null,
    discountPrice: 1450000,
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  },
  {
    id: 4,
    type: 'Resort',
    stars: 5,
    name: 'Vedana Lagoon Resort & Spa',
    location: 'Huế, Việt Nam',
    ratingScore: 9.4,
    ratingLabel: 'Tuyệt hảo',
    reviewCount: 758,
    originalPrice: 4470365,
    discountPrice: 3129256,
    imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80',
  },
  {
    id: 5,
    type: 'Căn hộ',
    stars: 4,
    name: 'Anantara Hội An Resort',
    location: 'Hội An, Việt Nam',
    ratingScore: 9.0,
    ratingLabel: 'Tuyệt hảo',
    reviewCount: 432,
    originalPrice: 2800000,
    discountPrice: 2100000,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  },
  {
    id: 6,
    type: 'Biệt thự',
    stars: 5,
    name: 'Six Senses Ninh Vân Bay',
    location: 'Nha Trang, Việt Nam',
    ratingScore: 9.6,
    ratingLabel: 'Xuất sắc',
    reviewCount: 315,
    originalPrice: 8500000,
    discountPrice: 6200000,
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80',
  },
];

const CARDS_PER_VIEW = 4;

// Format VND
const formatVND = (amount) =>
  'VND ' + amount.toLocaleString('vi-VN').replace(/\./g, '.');

// Hiển thị sao
const StarRating = ({ count }) => (
  <span className="inline-flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={i < count ? '#FAAD14' : '#E5E7EB'}
        className="w-3 h-3"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

// Badge Genius
const GeniusBadge = () => (
  <span
    className="inline-flex items-center px-1.5 py-0.5 text-white text-xs font-bold rounded"
    style={{ background: 'linear-gradient(135deg, #003580 0%, #0058a3 100%)', fontSize: '10px' }}
  >
    Genius
  </span>
);

// Score badge color
const getScoreBg = (score) => {
  if (score >= 9) return '#00704A';
  if (score >= 8) return '#008009';
  return '#2563EB';
};

const ExclusiveOffer = () => {
  const [favorites, setFavorites] = useState({});
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const maxStart = Math.max(0, HOTELS.length - CARDS_PER_VIEW);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  return (
    <section className="py-10 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-2 ml-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Lưu trú tại các chỗ nghỉ độc đáo hàng đầu
          </h2>
          <p className="text-gray-500 text-sm">
            Từ biệt thự, lâu đài cho đến nhà thuyền, igloo, chúng tôi đều có hết
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-5">
          {/* Left Arrow */}
          {startIndex > 0 && (
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
              {HOTELS.map((hotel) => (
                <div
                  key={hotel.id}
                  style={{
                    flex: `0 0 calc(${cardWidthPercent}% - ${((CARDS_PER_VIEW - 1) * gap) / CARDS_PER_VIEW}px)`,
                    minWidth: 0,
                  }}
                  className="group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative rounded-lg overflow-hidden" style={{ height: 200 }}>
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${hotel.id}/600/400`;
                      }}
                    />                    
                  </div>

                  {/* Card Info */}
                  <div className="pt-2.5 pb-1">
                    {/* Type + Stars + Genius */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-gray-500 text-xs">{hotel.type}</span>
                      <StarRating count={hotel.stars} />
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded text-white"
                        style={{ background: '#003580', fontSize: '8px', fontWeight: 700 }}
                        title="Booking.com Preferred"
                      >
                        b
                      </span>
                      <GeniusBadge />
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5 group-hover:text-blue-700 transition-colors truncate">
                      {hotel.name}
                    </h3>

                    {/* Location */}
                    <p className="text-gray-500 text-xs mb-2">{hotel.location}</p>

                    {/* Rating + Price Row */}
                    <div className="flex items-end justify-between gap-2">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-white text-sm font-bold px-1.5 py-0.5 rounded"
                          style={{ background: getScoreBg(hotel.ratingScore), minWidth: 32, textAlign: 'center' }}
                        >
                          {hotel.ratingScore.toFixed(1)}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 leading-none">{hotel.ratingLabel}</p>
                          <p className="text-xs text-gray-400 leading-none mt-0.5">{hotel.reviewCount.toLocaleString()} đánh giá</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        {hotel.originalPrice && (
                          <p className="text-xs text-red-500 line-through leading-none mb-0.5">
                            VND {hotel.originalPrice.toLocaleString('vi-VN')}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 leading-none mb-0.5">Bắt đầu từ</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">
                          VND {hotel.discountPrice.toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          {startIndex < maxStart && (
            <button
              onClick={handleNext}
              className="absolute -right-4 md:-right-5 top-1/2 -translate-y-8 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <RightOutlined style={{ fontSize: 14 }} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveOffer;