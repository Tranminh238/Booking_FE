import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InfoHotel from "./Components/InfoHotel";
import Footer from "../../components/Footer";

const DetailHotel = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const response = await fetch(`http://localhost:8889/api/hotel/gethoteldetail/${id}`);
                const result = await response.json();
                if (result.status === 200) {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Error fetching hotel detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotelData();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: '50px' }}>Không tìm thấy khách sạn</div>;

    return (
        <div>
            <InfoHotel data={data} />
            <Footer />
        </div>
    );
};

export default DetailHotel;