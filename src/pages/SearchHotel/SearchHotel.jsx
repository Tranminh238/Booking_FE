import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Filter from './Components/Filter';
import ListHotel from './Components/ListHotel';
import SearchBar from './Components/SearchBar';
import './SearchHotel.css';

const API_BASE = 'http://localhost:8889/api/hotel';
const PAGE_SIZE = 8;

const SearchHotel = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parse URL params for the search bar
    const keyword = searchParams.get('keyword') || '';
    const checkInParam = searchParams.get('checkIn') || '';
    const checkOutParam = searchParams.get('checkOut') || '';
    const numGuest = searchParams.get('num_guest') || '';

    // Search bar state (mirrors the header)
    const [searchBarState, setSearchBarState] = useState({
        destination: keyword,
        checkIn: checkInParam,
        checkOut: checkOutParam,
        guests: numGuest || 1,
    });

    // Filter state
    const [filters, setFilters] = useState({
        star: null,
        minPrice: null,
        maxPrice: null,
        amenities: [],
        roomAmenities: [],
        roomType: '',
        sort: '',
        order: '',
    });

    // Results state
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);

    const buildRequestBody = useCallback((pg = 0) => {
        const body = {
            page: pg,
            size: PAGE_SIZE,
        };
        // From URL (header search) – search by city only, not hotel name
        if (searchBarState.destination) {
            body.city = searchBarState.destination;
        }
        if (searchBarState.checkIn) body.checkInDate = searchBarState.checkIn;
        if (searchBarState.checkOut) body.checkOutDate = searchBarState.checkOut;
        if (searchBarState.guests && +searchBarState.guests > 0) body.num_guest = +searchBarState.guests;

        // From filter sidebar
        if (filters.star) body.star = filters.star;
        if (filters.minPrice) body.minPrice = filters.minPrice;
        if (filters.maxPrice) body.maxPrice = filters.maxPrice;
        if (filters.amenities && filters.amenities.length > 0) body.amenities = filters.amenities;
        if (filters.roomAmenities && filters.roomAmenities.length > 0) body.roomAmenities = filters.roomAmenities;
        if (filters.roomType) body.roomType = filters.roomType;
        if (filters.sort) body.sort = filters.sort;
        if (filters.order) body.order = filters.order;

        return body;
    }, [searchBarState, filters]);

    const fetchHotels = useCallback(async (pg = 0) => {
        setLoading(true);
        try {
            const body = buildRequestBody(pg);
            const response = await fetch(`${API_BASE}/searchHotels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (result.status === 200 && result.data) {
                const data = result.data;
                setHotels(data.content || []);
                setTotal(data.page?.totalElements ?? data.totalElements ?? 0);
                setPage(pg);
            } else {
                setHotels([]);
                setTotal(0);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setHotels([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [buildRequestBody]);

    // Initial fetch when URL params change
    useEffect(() => {
        setSearchBarState({
            destination: keyword,
            checkIn: checkInParam,
            checkOut: checkOutParam,
            guests: numGuest || 1,
        });
    }, [keyword, checkInParam, checkOutParam, numGuest]);

    // Fetch when searchBar or filters change
    useEffect(() => {
        fetchHotels(0);
    }, [filters, searchBarState]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleFilterReset = () => {
        setFilters({ star: null, minPrice: null, maxPrice: null, amenities: [], roomAmenities: [], roomType: '', sort: '', order: '' });
    };

    const handleSearchBarSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchBarState.destination) params.append('keyword', searchBarState.destination);
        if (searchBarState.checkIn) params.append('checkIn', searchBarState.checkIn);
        if (searchBarState.checkOut) params.append('checkOut', searchBarState.checkOut);
        if (searchBarState.guests > 0) params.append('num_guest', searchBarState.guests);
        setSearchParams(params);
        fetchHotels(0);
    };

    const handlePageChange = (pg) => {
        fetchHotels(pg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="search-hotel-container">
            {/* Top Search Bar */}
            <SearchBar
                searchBar={searchBarState}
                setSearchBar={setSearchBarState}
                onSubmit={handleSearchBarSubmit}
            />

            {/* Main content */}
            <div className="search-hotel-main">
                {/* Left: Filter */}
                <Filter filters={filters} onChange={handleFilterChange} onReset={handleFilterReset} />

                {/* Right: Results */}
                <div className="search-hotel-results-wrap">
                    {/* Results header */}
                    <div className="search-hotel-results-header">
                        <div>
                            {searchBarState.destination && (
                                <h1 className="search-hotel-title">
                                    Kết quả tìm kiếm: <span className="search-hotel-keyword">{searchBarState.destination}</span>
                                </h1>
                            )}
                            <p className="search-hotel-subtitle">
                                {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${total.toLocaleString()} khách sạn`}
                            </p>
                        </div>

                        {/* Back button */}
                        <button
                            onClick={() => navigate('/')}
                            className="search-hotel-back-btn"
                        >
                            ← Trang chủ
                        </button>
                    </div>

                    <ListHotel
                        hotels={hotels}
                        loading={loading}
                        total={total}
                        page={page}
                        pageSize={PAGE_SIZE}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchHotel;
