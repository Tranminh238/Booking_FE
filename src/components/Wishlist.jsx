import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelCard } from '../pages/SearchHotel/Components/ListHotel';
import { HeartFilled } from '@ant-design/icons';

const Wishlist = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = sessionStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const fetchWishlist = async () => {
            try {
                const res = await fetch(`http://localhost:8889/api/wishlist/user/${userId}`);
                const resData = await res.json();
                if (resData.status === 200 && Array.isArray(resData.data)) {
                    setHotels(resData.data);
                }
            } catch (err) {
                console.error("Error fetching wishlist hotels:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [userId, navigate]);

    const handleWishlistToggle = async (e, hotelId) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:8889/api/wishlist/toggle?userId=${userId}&hotelId=${hotelId}`, {
                method: 'POST'
            });
            const resData = await res.json();
            if (resData.status === 200) {
                // Immediately remove the hotel from the wishlist display
                setHotels(prev => prev.filter(hotel => hotel.id !== hotelId));
            }
        } catch (err) {
            console.error("Error toggling wishlist:", err);
        }
    };

    if (!userId) return null;

    return (
        <div className="container mx-auto px-4 md:px-16 lg:px-24 py-12 max-w-7xl font-sans">
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 pb-5">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm">
                        <HeartFilled style={{ fontSize: 20 }} />
                    </span>
                    Khách sạn yêu thích của bạn
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                    Lưu trữ các điểm đến mơ ước và những chỗ nghỉ tuyệt vời mà bạn đang quan tâm.
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex bg-white border border-gray-100 rounded-xl overflow-hidden h-40">
                            <div className="w-60 bg-gray-200" />
                            <div className="flex-1 p-5 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : hotels.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 max-w-2xl mx-auto px-6">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <HeartFilled style={{ fontSize: 28 }} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có khách sạn yêu thích nào</h3>
                    <p className="text-gray-500 text-sm mb-8">
                        Bấm vào biểu tượng trái tim trên các thẻ khách sạn tại trang chủ hoặc kết quả tìm kiếm để lưu chúng lại đây.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Khám phá các khách sạn
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {hotels.map(hotel => (
                        <HotelCard
                            key={hotel.id}
                            hotel={hotel}
                            isWishlisted={true}
                            onWishlistToggle={handleWishlistToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
