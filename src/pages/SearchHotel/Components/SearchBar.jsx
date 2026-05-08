import React, { useState } from 'react';
import { GrLocation } from "react-icons/gr";
import { LuCalendarDays } from "react-icons/lu";

const SearchBar = ({ searchBar, setSearchBar, onSubmit }) => {
    const [openOptions, setOpenOptions] = useState(false);

    const handleOption = (name, operation) => {
        setSearchBar(prev => ({
            ...prev,
            [name]: operation === "i" ? prev[name] + 1 : prev[name] - 1
        }));
    };

    return (
        <div className="search-hotel-top-bar">
            <div className="search-hotel-top-inner">
                <form onSubmit={onSubmit} className="search-hotel-form">
                    {/* Destination */}
                    <div className="search-hotel-input-group dest-group">
                        <label className="search-hotel-label">
                            <GrLocation className="search-hotel-icon" /> Điểm đến
                        </label>
                        <input
                            type="text"
                            placeholder="Thành phố hoặc tên khách sạn"
                            value={searchBar.destination}
                            onChange={e => setSearchBar(p => ({ ...p, destination: e.target.value }))}
                            className="search-hotel-input"
                        />
                    </div>

                    {/* Check-in */}
                    <div className="search-hotel-input-group date-group">
                        <label className="search-hotel-label">
                            <LuCalendarDays className="search-hotel-icon" /> Nhận phòng
                        </label>
                        <input
                            type="date"
                            value={searchBar.checkIn}
                            onChange={e => setSearchBar(p => ({ ...p, checkIn: e.target.value }))}
                            className="search-hotel-input"
                        />
                    </div>

                    {/* Check-out */}
                    <div className="search-hotel-input-group date-group">
                        <label className="search-hotel-label">
                            <LuCalendarDays className="search-hotel-icon" /> Trả phòng
                        </label>
                        <input
                            type="date"
                            value={searchBar.checkOut}
                            onChange={e => setSearchBar(p => ({ ...p, checkOut: e.target.value }))}
                            className="search-hotel-input"
                        />
                    </div>

                    {/* Guests */}
                    <div className="search-hotel-input-group guest-group relative">
                        <label className="search-hotel-label">
                            👤 Khách và Phòng
                        </label>
                        <div 
                            onClick={() => setOpenOptions(!openOptions)}
                            className="search-hotel-input"
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                        >
                            <span className="truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {searchBar.adults} người lớn · {searchBar.children} trẻ em · {searchBar.rooms} phòng
                            </span>
                        </div>
                        {openOptions && (
                            <div className="absolute top-[100%] right-0 mt-2 bg-white text-gray-800 shadow-xl rounded-lg p-4 z-50 w-72 border border-gray-100" style={{ right: 0 }}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-sm">Người lớn</span>
                                    <div className="flex items-center gap-3">
                                        <button type="button" disabled={searchBar.adults <= 1} onClick={() => handleOption("adults", "d")} className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50">-</button>
                                        <span className="w-4 text-center">{searchBar.adults}</span>
                                        <button type="button" onClick={() => handleOption("adults", "i")} className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50">+</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-sm">Trẻ em</span>
                                    <div className="flex items-center gap-3">
                                        <button type="button" disabled={searchBar.children <= 0} onClick={() => handleOption("children", "d")} className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50">-</button>
                                        <span className="w-4 text-center">{searchBar.children}</span>
                                        <button type="button" onClick={() => handleOption("children", "i")} className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50">+</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">Phòng</span>
                                    <div className="flex items-center gap-3">
                                        <button type="button" disabled={searchBar.rooms <= 1} onClick={() => handleOption("rooms", "d")} className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50">-</button>
                                        <span className="w-4 text-center">{searchBar.rooms}</span>
                                        <button type="button" onClick={() => handleOption("rooms", "i")} className="w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50">+</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <button type="submit" className="search-hotel-btn">
                        🔍 Tìm kiếm
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SearchBar;
