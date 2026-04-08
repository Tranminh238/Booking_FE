import React, { useState, useEffect } from 'react'
import headerImg from "../../../assets/header.png"
    
const Header = () => {
    // Biến state lưu kết quả tìm kiếm từ database
    const [destinations, setDestinations] = useState([]);

    useEffect(() => {
        // Hàm gọi API lấy danh sách thành phố và khách sạn từ Backend
        const fetchDestinations = async () => {
            try {
                // TODO: Hãy thay URL bên dưới bằng API thực tế từ Backend (Ví dụ: Spring Boot)
                // const response = await fetch('http://localhost:8080/api/destinations-and-hotels');
                // const dataFromDB = await response.json();

                // --- Bắt đầu Dữ liệu giả lập (Xoá phần này khi có API thực) ---
                const dataFromDB = [
                    "Hà Nội (Thành phố)", "Nha Trang (Thành phố)", "Đà Nẵng (Thành phố)",
                    "Khách sạn Mường Thanh Hà Nội", "Vinpearl Resort Nha Trang", "InterContinental Đà Nẵng",
                    "Đà Lạt (Thành phố)", "Khách sạn Colline Đà Lạt"
                ];
                // --- Kết thúc Dữ liệu giả lập ---

                setDestinations(dataFromDB);
            } catch (error) {
                console.error("Lỗi khi kết nối Database:", error);
            }
        };

        fetchDestinations();
    }, []);

    return (
        <div
            className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-no-repeat bg-cover bg-center h-120'
            style={{ backgroundImage: `url(${headerImg})` }}
        >
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-playfair font-bold mb-4'>
                Khám phá vẻ đẹp của Việt Nam
            </h1>
            <p className='text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl'>
                Trải nghiệm dịch vụ đẳng cấp và những khoảnh khắc đáng nhớ tại các khách sạn hàng đầu của chúng tôi.
            </p>
            <form className='bg-white text-gray-500 rounded-lg p-4 md:p-6 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-end gap-4 shadow-lg'>
                {/* Destination Input */}
                <div className='flex-1 w-full'>
                    <div className='flex items-center gap-2'>
                        <svg className="w-4 h-4 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                        </svg>
                        <label htmlFor="destinationInput">Thành phố hoặc tên khách sạn</label>
                    </div>
                    <input list='destinations' id="destinationInput" type="text" className="w-full rounded border border-gray-200 px-3 py-2 mt-1.5 text-sm outline-none focus:border-indigo-500" placeholder="Bạn muốn đi đâu?" required />
                    <datalist id="destinations">
                        {destinations.map((destination, index) => (
                            <option value={destination} key={index} />
                        ))}
                    </datalist>
                </div>

                {/* Check-in Input */}
                <div className='flex-[0.8] w-full'>
                    <div className='flex items-center gap-2'>
                        <svg className="w-4 h-4 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                        </svg>
                        <label htmlFor="checkIn">Nhận phòng</label>
                    </div>
                    <input id="checkIn" type="date" className="w-full rounded border border-gray-200 px-3 py-2 mt-1.5 text-sm outline-none focus:border-indigo-500" />
                </div>

                {/* Check-out Input */}
                <div className='flex-[0.8] w-full'>
                    <div className='flex items-center gap-2'>
                        <svg className="w-4 h-4 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                        </svg>
                        <label htmlFor="checkOut">Trả phòng</label>
                    </div>
                    <input id="checkOut" type="date" className="w-full rounded border border-gray-200 px-3 py-2 mt-1.5 text-sm outline-none focus:border-indigo-500" />
                </div>

                {/* Guests Input */}
                <div className='flex-[0.5] w-full'>
                    <label htmlFor="guests" className="block text-sm mb-1.5 font-medium">Số khách</label>
                    <input min={1} max={10} id="guests" type="number" className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" defaultValue="0" />
                </div>

                {/* Submit Button */}
                <button className='w-full md:w-auto h-[38px] flex items-center justify-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors px-6 text-white cursor-pointer' >
                    <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                    </svg>
                    <span>Tìm kiếm</span>
                </button>
            </form>
        </div>
    )
}

export default Header