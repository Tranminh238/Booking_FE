import React from 'react';
import { GrLocation } from "react-icons/gr";
import { LuCalendarDays } from "react-icons/lu";

const SearchBar = ({ searchBar, setSearchBar, onSubmit }) => {
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
                    <div className="search-hotel-input-group guest-group">
                        <label className="search-hotel-label">
                            👤 Số khách
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={searchBar.guests}
                            onChange={e => setSearchBar(p => ({ ...p, guests: e.target.value }))}
                            className="search-hotel-input"
                        />
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
