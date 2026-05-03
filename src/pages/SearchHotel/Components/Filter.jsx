import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:8889/api';
const MIN_PRICE = 0;
const MAX_PRICE = 24000000;

const STAR_OPTIONS = [5, 4, 3, 2, 1];
const SORT_OPTIONS = [
    { value: '', label: 'Mặc định' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating_desc', label: 'Đánh giá cao nhất' },
    { value: 'star_desc', label: 'Sao nhiều nhất' },
];

const formatPrice = (val) => {
    if (val === undefined || val === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(val);
};

// ─── Dual Range Slider ────────────────────────────────────────────────────────
const DualRangeSlider = ({ min, max, low, high, onChange }) => {
    const trackRef = useRef(null);
    const dragging = useRef(null); // 'low' | 'high'

    const pct = (val) => ((val - min) / (max - min)) * 100;

    const valueFromEvent = (e) => {
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        return Math.round((ratio * (max - min) + min) / 100000) * 100000; // snap to 100k
    };

    const onMouseDown = (thumb) => (e) => {
        e.preventDefault();
        dragging.current = thumb;

        const move = (ev) => {
            const val = valueFromEvent(ev);
            if (dragging.current === 'low') {
                onChange(Math.min(val, high - 100000), high);
            } else {
                onChange(low, Math.max(val, low + 100000));
            }
        };
        const up = () => {
            dragging.current = null;
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', up);
    };

    const lowPct = pct(low);
    const highPct = pct(high);

    return (
        <div className="dual-slider-wrap">
            <div className="dual-slider-track" ref={trackRef}>
                {/* Background track */}
                <div className="dual-slider-rail" />
                {/* Active fill */}
                <div
                    className="dual-slider-fill"
                    style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
                />
                {/* Low thumb */}
                <div
                    className="dual-slider-thumb"
                    style={{ left: `${lowPct}%` }}
                    onMouseDown={onMouseDown('low')}
                    onTouchStart={onMouseDown('low')}
                />
                {/* High thumb */}
                <div
                    className="dual-slider-thumb"
                    style={{ left: `${highPct}%` }}
                    onMouseDown={onMouseDown('high')}
                    onTouchStart={onMouseDown('high')}
                />
            </div>
            {/* Labels below */}
            <div className="dual-slider-labels">
                <div className="dual-slider-label-box">
                    <span className="dual-slider-label-val">{formatPrice(low)}</span>
                    <span className="dual-slider-label-unit">VND</span>
                </div>
                <span className="dual-slider-sep">—</span>
                <div className="dual-slider-label-box">
                    <span className="dual-slider-label-val">{formatPrice(high)}</span>
                    <span className="dual-slider-label-unit">VND</span>
                </div>
            </div>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const FilterSection = ({ title, expanded, onToggle, action, children }) => (
    <div className="filter-section">
        <div className="filter-section-header">
            <button className="filter-section-toggle" onClick={onToggle}>
                {title}
            </button>
            {action}
        </div>
        {expanded && children}
    </div>
);

const Filter = ({ filters, onChange, onReset }) => {
    const [expanded, setExpanded] = useState({
        price: true,
        sort: true,
        star: true,
        hotelAmenities: true,
        roomAmenities: true,
        roomType: false,
    });

    const [hotelAmenityList, setHotelAmenityList] = useState([]);
    const [roomAmenityList, setRoomAmenityList] = useState([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(true);
    const [roomTypeList, setRoomTypeList] = useState([]);

    // Price slider local state (so we don't trigger API on every drag pixel)
    const [sliderLow, setSliderLow] = useState(filters.minPrice ?? MIN_PRICE);
    const [sliderHigh, setSliderHigh] = useState(filters.maxPrice ?? MAX_PRICE);
    const debounceRef = useRef(null);

    // Fetch amenities from backend
    useEffect(() => {
        const fetchAmenities = async () => {
            setAmenitiesLoading(true);
            try {
                const [hotelRes, roomRes, roomTypeRes] = await Promise.all([
                    fetch(`${API_BASE}/amenities?type=HOTEL`),
                    fetch(`${API_BASE}/amenities?type=ROOM`),
                    fetch(`${API_BASE}/room-types/get-all`)
                ]);
                const hotelData = await hotelRes.json();
                const roomData = await roomRes.json();
                const roomTypeData = await roomTypeRes.json();
                setHotelAmenityList(Array.isArray(hotelData) ? hotelData : []);
                setRoomAmenityList(Array.isArray(roomData) ? roomData : []);
                setRoomTypeList(Array.isArray(roomTypeData) ? roomTypeData : []);
            } catch (err) {
                console.error('Failed to fetch amenities:', err);
            } finally {
                setAmenitiesLoading(false);
            }
        };
        fetchAmenities();
    }, []);

    // Sync slider when external reset happens
    useEffect(() => {
        if (filters.minPrice == null && filters.maxPrice == null) {
            setSliderLow(MIN_PRICE);
            setSliderHigh(MAX_PRICE);
        }
    }, [filters.minPrice, filters.maxPrice]);

    const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSliderChange = (low, high) => {
        setSliderLow(low);
        setSliderHigh(high);
        // Debounce the actual filter update by 300ms
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange({
                ...filters,
                minPrice: low === MIN_PRICE ? null : low,
                maxPrice: high === MAX_PRICE ? null : high,
            });
        }, 300);
    };

    const handlePriceReset = () => {
        setSliderLow(MIN_PRICE);
        setSliderHigh(MAX_PRICE);
        onChange({ ...filters, minPrice: null, maxPrice: null });
    };

    const handleStarChange = (star) => {
        onChange({ ...filters, star: filters.star === star ? null : star });
    };

    const handleAmenityChange = (amenityName, field) => {
        const current = filters[field] || [];
        const next = current.includes(amenityName)
            ? current.filter(a => a !== amenityName)
            : [...current, amenityName];
        onChange({ ...filters, [field]: next });
    };

    const handleRoomTypeChange = (type) => {
        onChange({ ...filters, roomType: filters.roomType === type ? '' : type });
    };

    const handleSortChange = (e) => {
        const val = e.target.value;
        if (!val) { onChange({ ...filters, sort: '', order: '' }); return; }
        const [sort, order] = val.split('_');
        const sortField = sort === 'price' ? 'price' : sort === 'rating' ? 'avgRating' : 'star';
        onChange({ ...filters, sort: sortField, order: order?.toUpperCase() || 'ASC' });
    };

    const currentSortValue = () => {
        if (!filters.sort) return '';
        const sortMap = { price: 'price', avgRating: 'rating', star: 'star' };
        const key = sortMap[filters.sort] || '';
        return `${key}_${(filters.order || 'ASC').toLowerCase()}`;
    };

    const AmenityCheckboxList = ({ list, field, loading }) => {
        if (loading) return <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0' }}>Đang tải...</p>;
        if (!list.length) return <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0' }}>Không có dữ liệu</p>;
        return (
            <div className="filter-checkboxes">
                {list.map(item => (
                    <label key={item.id} className="filter-checkbox-label">
                        <input
                            type="checkbox"
                            checked={(filters[field] || []).includes(item.name)}
                            onChange={() => handleAmenityChange(item.name, field)}
                            className="filter-checkbox"
                        />
                        <span>{item.name}</span>
                    </label>
                ))}
            </div>
        );
    };

    return (
        <aside className="filter-sidebar">
            {/* ── Khoảng giá ──────────────────────────────── */}
            <FilterSection
                title="Khoảng giá"
                expanded={expanded.price}
                onToggle={() => toggle('price')}
                action={
                    <button className="filter-reset-btn" onClick={handlePriceReset}>Đặt lại</button>
                }
            >
                <p className="filter-price-subtitle">1 phòng, 1 đêm</p>
                <DualRangeSlider
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    low={sliderLow}
                    high={sliderHigh}
                    onChange={handleSliderChange}
                />
            </FilterSection>

            {/* ── Sắp xếp ──────────────────────────────── */}
            <FilterSection title="Sắp xếp" expanded={expanded.sort} onToggle={() => toggle('sort')}>
                <select className="filter-select" value={currentSortValue()} onChange={handleSortChange}>
                    {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </FilterSection>

            {/* ── Hạng sao ─────────────────────────────── */}
            <FilterSection title="Hạng sao" expanded={expanded.star} onToggle={() => toggle('star')}>
                <div className="filter-stars">
                    {STAR_OPTIONS.map(star => (
                        <button
                            key={star}
                            className={`filter-star-btn ${filters.star === star ? 'active' : ''}`}
                            onClick={() => handleStarChange(star)}
                        >
                            {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* ── Tiện ích khách sạn ───────────────────── */}
            <FilterSection title="Tiện ích khách sạn" expanded={expanded.hotelAmenities} onToggle={() => toggle('hotelAmenities')}>
                <AmenityCheckboxList list={hotelAmenityList} field="amenities" loading={amenitiesLoading} />
            </FilterSection>

            {/* ── Tiện ích phòng ──────────────────────── */}
            <FilterSection title="Tiện ích phòng" expanded={expanded.roomAmenities} onToggle={() => toggle('roomAmenities')}>
                <AmenityCheckboxList list={roomAmenityList} field="roomAmenities" loading={amenitiesLoading} />
            </FilterSection>

            {/* ── Loại phòng ──────────────────────────── */}
            <FilterSection title="Loại phòng" expanded={expanded.roomType} onToggle={() => toggle('roomType')}>
                <div className="filter-checkboxes">
                    {roomTypeList.map((type) => (
                        <label key={type.id} className="filter-checkbox-label">
                            <input
                                type="radio"
                                name="roomType"
                                checked={filters.roomType === type.name}
                                onChange={() => handleRoomTypeChange(type.name)}
                                className="filter-checkbox"
                            />
                            <span>{type.name}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            <style>{`
                .filter-sidebar {
                    width: 260px;
                    min-width: 220px;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                    padding: 0 0 8px 0;
                    height: fit-content;
                    position: sticky;
                    top: 80px;
                    overflow: hidden;
                }
                .filter-section {
                    border-bottom: 1px solid #f1f5f9;
                    padding: 14px 16px;
                }
                .filter-section:last-child { border-bottom: none; }
                .filter-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .filter-section-toggle {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 700;
                    color: #111827;
                    padding: 0;
                    text-align: left;
                }
                .filter-reset-btn {
                    font-size: 13px;
                    color: #006ce4;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    padding: 0;
                    white-space: nowrap;
                }
                .filter-reset-btn:hover { text-decoration: underline; }
                .filter-price-subtitle {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0 0 14px 0;
                }
                /* ── Dual slider ── */
                .dual-slider-wrap { user-select: none; }
                .dual-slider-track {
                    position: relative;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    margin: 0 10px;
                }
                .dual-slider-rail {
                    position: absolute;
                    left: 0; right: 0;
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 2px;
                }
                .dual-slider-fill {
                    position: absolute;
                    height: 4px;
                    background: #006ce4;
                    border-radius: 2px;
                }
                .dual-slider-thumb {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border: 2.5px solid #006ce4;
                    border-radius: 50%;
                    transform: translateX(-50%);
                    cursor: grab;
                    box-shadow: 0 1px 6px rgba(0,0,0,0.15);
                    z-index: 2;
                    transition: box-shadow 0.15s;
                }
                .dual-slider-thumb:hover, .dual-slider-thumb:active {
                    box-shadow: 0 0 0 6px rgba(0,108,228,0.15);
                    cursor: grabbing;
                }
                .dual-slider-labels {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                }
                .dual-slider-label-box {
                    flex: 1;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    padding: 6px 10px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #f9fafb;
                }
                .dual-slider-label-val {
                    font-size: 13px;
                    font-weight: 600;
                    color: #111827;
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .dual-slider-label-unit {
                    font-size: 11px;
                    color: #6b7280;
                    flex-shrink: 0;
                }
                .dual-slider-sep {
                    color: #9ca3af;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                /* ── Sort ── */
                .filter-select {
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #374151;
                    background: #f8fafc;
                    cursor: pointer;
                    outline: none;
                }
                /* ── Stars ── */
                .filter-stars { display: flex; flex-direction: column; gap: 6px; }
                .filter-star-btn {
                    text-align: left;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 6px 12px;
                    font-size: 14px;
                    color: #f59e0b;
                    cursor: pointer;
                    transition: all 0.15s;
                    letter-spacing: 2px;
                }
                .filter-star-btn:hover { border-color: #006ce4; background: #eff6ff; }
                .filter-star-btn.active { background: #eff6ff; border-color: #006ce4; font-weight: 700; }
                /* ── Checkboxes ── */
                .filter-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .filter-checkboxes::-webkit-scrollbar { width: 4px; }
                .filter-checkboxes::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
                .filter-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #374151;
                    cursor: pointer;
                }
                .filter-checkbox-label:hover { color: #006ce4; }
                .filter-checkbox {
                    width: 15px; height: 15px;
                    accent-color: #006ce4;
                    cursor: pointer;
                    flex-shrink: 0;
                }
            `}</style>
        </aside>
    );
};

export default Filter;
