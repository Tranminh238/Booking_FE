import React, { useState, useEffect, useRef } from 'react';
import { Typography, Skeleton } from 'antd';
import { EnvironmentOutlined, StarFilled, ArrowRightOutlined, FireOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import HaNoi from '../../../assets/HaNoi.jpg';
import HoChiMinh from '../../../assets/HoChiMinh.jpg';
import DaNang from '../../../assets/DaNang.jpg';
import HoiAn from '../../../assets/HoiAn.jpg';
import NhaTrang from '../../../assets/NhaTrang.jpg';
import PhuQuoc from '../../../assets/PhuQuoc.jpg';
import Hue from '../../../assets/Hue.jpg';
import VungTau from '../../../assets/VungTau.jpg';
import DaLat from '../../../assets/Dalat.jpg';
import SaPa from '../../../assets/Sapa.png';

const { Title, Text } = Typography;

// Dữ liệu 10 thành phố được booking nhiều nhất tại Việt Nam
const TOP_CITIES = [
    {
        code: 'HAN',
        name: 'Hà Nội',
        hotels: 1240,
        rating: 4.8,
        bookings: 98500,
        imageUrl: HaNoi,
    },
    {
        code: 'SGN',
        name: 'Hồ Chí Minh',
        hotels: 1850,
        rating: 4.7,
        bookings: 125000,
        imageUrl: HoChiMinh,
    },
    {
        code: 'DAD',
        name: 'Đà Nẵng',
        hotels: 920,
        rating: 4.9,
        bookings: 87300,
        imageUrl: DaNang,
    },
    {
        code: 'HOI',
        name: 'Hội An',
        hotels: 540,
        rating: 4.8,
        bookings: 64200,
        imageUrl: HoiAn,
    },
    {
        code: 'NHA',
        name: 'Nha Trang',
        hotels: 780,
        rating: 4.6,
        bookings: 72100,
        imageUrl: NhaTrang,
    },
    {
        code: 'PHU',
        name: 'Phú Quốc',
        hotels: 630,
        rating: 4.9,
        bookings: 91000,
        imageUrl: PhuQuoc,
    },
    {
        code: 'HUE',
        name: 'Huế',
        hotels: 410,
        rating: 4.6,
        bookings: 48700,
        imageUrl: Hue,
    },
    {
        code: 'VTU',
        name: 'Vũng Tàu',
        hotels: 520,
        rating: 4.5,
        bookings: 55400,
        imageUrl: VungTau,
    },
    {
        code: 'DLA',
        name: 'Đà Lạt',
        hotels: 460,
        rating: 4.7,
        bookings: 61800,
        imageUrl: DaLat,
    },
    {
        code: 'SAP',
        name: 'Sa Pa',
        hotels: 310,
        rating: 4.8,
        bookings: 43500,
        imageUrl: SaPa,
    },
];

const CARDS_PER_PAGE = 5;

const HotelCard = ({ onCityClick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [cities, setCities] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    const maxStart = Math.max(0, cities.length - CARDS_PER_PAGE);

    const handlePrev = () => {
        if (isAnimating || startIndex === 0) return;
        setIsAnimating(true);
        setStartIndex((i) => Math.max(0, i - 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handleNext = () => {
        if (isAnimating || startIndex >= maxStart) return;
        setIsAnimating(true);
        setStartIndex((i) => Math.min(maxStart, i + 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    useEffect(() => {
        // Giả lập gọi API
        const timer = setTimeout(() => {
            setCities(TOP_CITIES);
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleCityClick = (cityName) => {
        if (onCityClick) {
            onCityClick(cityName);
        } else {
            navigate(`/hotels?city=${encodeURIComponent(cityName)}`);
        }
    };

    const renderSkeletons = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-8">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-md">
                    <Skeleton.Image active className="w-full" style={{ width: '100%', height: 160 }} />
                    <div className="p-3 bg-white">
                        <Skeleton active paragraph={{ rows: 1 }} />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCities = () => {
        // Mỗi card chiếm (100% / CARDS_PER_PAGE) của viewport, có gap
        // translateX dịch chuyển toàn bộ track theo số card đã scroll
        const cardWidthPercent = 100 / CARDS_PER_PAGE;
        // gap giữa các card = 20px (gap-5), cần tính offset thêm
        const translateValue = startIndex * cardWidthPercent;

        return (
            <div className="relative mt-8">
                {/* Arrow Left */}
                {startIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute -left-4 md:-left-5 top-1/2 -translate-y-8 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                        <LeftOutlined style={{ fontSize: 14 }} />
                    </button>
                )}

                {/* Viewport: ẩn phần tràn ra ngoài */}
                <div style={{ overflow: 'hidden' }}>
                    {/* Track: toàn bộ các card nằm trên 1 hàng, trượt theo translateX */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '20px',
                            transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            transform: `translateX(calc(-${translateValue}% - ${startIndex * 20}px))`,
                            willChange: 'transform',
                        }}
                    >
                        {cities.map((city, globalIdx) => (
                            <div
                                key={city.code}
                                style={{
                                    flex: `0 0 calc(${cardWidthPercent}% - ${(CARDS_PER_PAGE - 1) * 20 / CARDS_PER_PAGE}px)`,
                                    minWidth: 0,
                                }}
                                className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                onClick={() => handleCityClick(city.name)}
                            >
                                {/* Ảnh + overlay */}
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={city.imageUrl}
                                        alt={city.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src = `https://picsum.photos/seed/${city.code}/400/300`;
                                        }}
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                    {/* Badge top-right: top booking */}
                                    {globalIdx < 3 && (
                                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <FireOutlined />
                                            Top {globalIdx + 1}
                                        </div>
                                    )}

                                    {/* Rating bottom-left */}
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                        <StarFilled style={{ color: '#fadb14', fontSize: 13 }} />
                                        <span className="text-white text-xs font-semibold">{city.rating}</span>
                                    </div>

                                    {/* Country bottom-right */}
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                        <EnvironmentOutlined style={{ color: '#fff', fontSize: 12 }} />
                                        <span className="text-white text-xs">Việt Nam</span>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="bg-white px-3 py-2.5">
                                    <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{city.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-600 text-xs font-medium">{city.hotels.toLocaleString()}+ khách sạn</span>
                                        <span className="text-orange-500 text-xs font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                                            Khám phá <ArrowRightOutlined style={{ fontSize: 10 }} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Arrow Right */}
                {startIndex < maxStart && (
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

    // Render khi không có dữ liệu
    const renderEmpty = () => {
        return (
            <div className="text-center my-10 p-10 bg-gray-50 rounded-lg">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                    alt="No destinations"
                    className="w-20 h-20 mx-auto mb-4 opacity-50"
                />
                <Text className="text-gray-500 text-lg">Không có điểm đến nào được tìm thấy.</Text>
            </div>
        );
    };

    return (
        <section className="py-12 bg-gray-50 overflow-x-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-2">
                    <Text className="text-indigo-600 font-semibold uppercase tracking-widest text-sm">
                        Được đặt nhiều nhất
                    </Text>
                    <Title level={2} className="!text-3xl !font-bold !text-gray-800 !mt-2 !mb-3">
                        Điểm Đến Phổ Biến
                    </Title>
                    <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full mb-4" />
                    <Text className="text-gray-500 max-w-xl mx-auto block">
                        Khám phá 10 thành phố được booking nhiều nhất — tìm khách sạn tuyệt vời cho chuyến đi sắp tới của bạn.
                    </Text>
                </div>

                {/* Content */}
                {isLoading ? renderSkeletons() : renderCities()}
            </div>
        </section>
    );
};

export default HotelCard;
