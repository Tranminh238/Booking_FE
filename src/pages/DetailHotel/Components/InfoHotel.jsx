import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../Detail.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ── Sub-components ────────────────────────────────────────────────────

function StarRating({ total = 5, filled = 4 }) {
  return (
    <div className="hc-stars">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < filled ? "hc-star-filled" : "hc-star-empty"}>★</span>
      ))}
    </div>
  );
}

function GalleryCell({ bg, emoji, main, more, imgUrl, onClick }) {
  if (main) {
    return (
      <div className="hc-gallery-main" onClick={onClick}>
        <div
          className={`hc-gallery-inner ${bg}`}
          style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}}
        >
          {!imgUrl && <span className="hc-room-emoji">{emoji}</span>}
        </div>
      </div>
    );
  }
  return (
    <div className="hc-gallery-sub" onClick={onClick}>
      <div
        className={`hc-gallery-inner ${bg}`}
        style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}}
      >
        {!imgUrl && <span className="hc-room-emoji">{emoji}</span>}
      </div>
      {more && (
        <div className="hc-gallery-more">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Xem tất cả ảnh
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function InfoHotel({ data }) {
  const [searchParams] = useSearchParams();
  const paramAdults    = searchParams.get('adults');
  const paramChildren  = searchParams.get('children');
  const paramRooms     = searchParams.get('num_room');
  const paramCheckIn   = searchParams.get('checkIn');
  const paramCheckOut  = searchParams.get('checkOut');

  const initialAdults   = paramAdults   ? parseInt(paramAdults, 10)   : 2;
  const initialChildren = paramChildren ? parseInt(paramChildren, 10) : 0;
  const initialRooms    = paramRooms    ? parseInt(paramRooms, 10)    : 1;
  const initialCheckIn  = paramCheckIn  || "";
  const initialCheckOut = paramCheckOut || "";

  const [liked, setLiked]                   = useState(false);
  const [reviews, setReviews]               = useState([]);
  const [rooms, setRooms]                   = useState([]);
  const [roomTypes, setRoomTypes]           = useState([]);
  const [amenities, setAmenities]           = useState([]);
  const [promotions, setPromotions]         = useState([]);
  const [checkIn, setCheckIn]               = useState(initialCheckIn);
  const [checkOut, setCheckOut]             = useState(initialCheckOut);
  const [adults, setAdults]                 = useState(initialAdults);
  const [children, setChildren]             = useState(initialChildren);
  const [roomCount, setRoomCount]           = useState(initialRooms);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom]     = useState(null);
  const [imgIndex, setImgIndex]             = useState(0);

  // Gallery modal
  const [galleryOpen, setGalleryOpen]       = useState(false);
  const [galleryIndex, setGalleryIndex]     = useState(0);

  // All reviews modal
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [appliedSearch, setAppliedSearch] = useState({
    adults: initialAdults,
    children: initialChildren,
    roomCount: initialRooms,
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
  });

  const navigate = useNavigate();
  const totalReview = reviews.length;

  const handleBooking = (room) => {
    if (!appliedSearch.checkIn || !appliedSearch.checkOut) {
      alert("Vui lòng chọn ngày nhận phòng và ngày trả phòng trước khi đặt phòng.");
      return;
    }
    const promo = promotions.find(p => p.roomId === room.id);
    const pricePerNight = promo
      ? room.pricePerNight - (room.pricePerNight * promo.discountPercentage / 100)
      : room.pricePerNight;

    navigate('/booking', {
      state: {
        hotel: data,
        room,
        searchInfo: appliedSearch,
        numberOfNights: getNumberOfNights(),
        totalPrice: pricePerNight * appliedSearch.roomCount * getNumberOfNights(),
      },
    });
  };

  const handleSearchRooms = () => {
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
      alert("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }
    setAppliedSearch({ adults, children, roomCount, checkIn, checkOut });
  };

  const getNumberOfNights = () => {
    if (!appliedSearch.checkIn || !appliedSearch.checkOut) return 1;
    const diff = new Date(appliedSearch.checkOut) - new Date(appliedSearch.checkIn);
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 1;
  };

  const numberOfNights = getNumberOfNights();

  const filteredRooms = rooms.filter(room => {
    const required = Math.ceil((appliedSearch.adults + appliedSearch.children) / appliedSearch.roomCount);
    return room.capacity >= required;
  });

  useEffect(() => {
    if (!data?.id) return;

    fetch(`http://localhost:8889/api/reviews/hotel/${data.id}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setReviews(d); })
      .catch(err => console.error("Error fetching reviews", err));

    fetch(`http://localhost:8889/api/room/hotel/${data.id}`)
      .then(r => r.json())
      .then(d => { if (d.status === 200 && Array.isArray(d.data)) setRooms(d.data); })
      .catch(err => console.error("Error fetching rooms", err));

    fetch(`http://localhost:8889/api/room-types/get-all`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setRoomTypes(d); })
      .catch(err => console.error("Error fetching room types", err));

    fetch(`http://localhost:8889/api/amenities`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAmenities(d); })
      .catch(err => console.error("Error fetching amenities", err));

    fetch(`http://localhost:8889/api/promotions/valid`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPromotions(d); })
      .catch(err => console.error("Error fetching promotions", err));
  }, [data?.id]);

  if (!data) return null;

  const hotelName   = data.name        || "Tên khách sạn";
  const star        = data.star        || 0;
  const ratingAvg   = data.rating_avg  || 0;
  const address     = [data.district, data.city, data.country].filter(Boolean).join(", ");
  const description = data.description || "";
  const amenitiesList = data.amenities || [];
  const images      = data.images      || [];

  const mainImage  = images[0] || null;
  const subImage1  = images[1] || null;
  const subImage2  = images[2] || null;

  const getIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes("wifi"))  return "📶";
    if (l.includes("bơi"))   return "🏊";
    if (l.includes("xe"))    return "🚗";
    if (l.includes("hòa"))   return "❄️";
    if (l.includes("hàng"))  return "🍽️";
    if (l.includes("tân"))   return "🔑";
    if (l.includes("hộ"))    return "🏠";
    if (l.includes("vườn"))  return "🌿";
    return "✨";
  };

  const ratingLabel = ratingAvg >= 9 ? "Tuyệt vời"
    : ratingAvg >= 8 ? "Rất tốt"
    : ratingAvg >= 7 ? "Tốt"
    : ratingAvg >= 5 ? "Dễ chịu"
    : "Chưa có đánh giá";

  return (
    <div className="hc-wrap">
      <div className="hc-card">

        {/* ── Header ── */}
        <div className="hc-header">
          <div>
            <h1 className="hc-name">{hotelName}</h1>
            <StarRating total={5} filled={star} />
            <div className="hc-address">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {address}
            </div>
          </div>
        </div>

        {/* ── Gallery ── */}
        <div className="hc-gallery">
          <GalleryCell bg="bg-living"  emoji="🛋️" main={true}  more={false}              imgUrl={mainImage}  onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }} />
          <GalleryCell bg="bg-bedroom" emoji="🛏️" main={false} more={false}              imgUrl={subImage1}  onClick={() => { setGalleryIndex(1); setGalleryOpen(true); }} />
          <GalleryCell bg="bg-bath"    emoji="🚿" main={false} more={images.length > 3}  imgUrl={subImage2}  onClick={() => { setGalleryIndex(2); setGalleryOpen(true); }} />
        </div>

        {/* ── Amenities ── */}
        <div className="hc-amenities">
          {amenitiesList.length > 0 ? amenitiesList.map((a, i) => (
            <div key={i} className="hc-tag">
              <span className="hc-tag-icon">{getIcon(a)}</span>{a}
            </div>
          )) : (
            <div className="hc-tag"><span className="hc-tag-icon">🏠</span>Tiện nghi tiêu chuẩn</div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="hc-body">

          {/* Description */}
          <div className="hc-description">
            {description
              ? description.split('\n').map((para, idx) => <p key={idx}>{para}</p>)
              : <p>Khách sạn này chưa có bài mô tả chi tiết.</p>
            }
          </div>

          {/* ── Score / Review card ── */}
          <div className="hc-score-card" onClick={() => setShowAllReviews(true)}>
            <div className="hc-score-header">
              <div className="hc-score-badge">
                {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
              </div>
              <div className="hc-score-meta">
                <div className="hc-score-label">{ratingLabel}</div>
                <div className="hc-score-count">
                  {totalReview > 0
                    ? `${totalReview} đánh giá · Nhấn để xem tất cả`
                    : "Chưa có đánh giá · Nhấn để xem"}
                </div>
              </div>
              <div className="hc-score-chevron">›</div>
            </div>

            {/* Preview 3 reviews */}
            <div className="hc-review-list-preview">
              {reviews.length > 0 ? reviews.slice(0, 3).map((review, i) => (
                <div key={i} className="hc-review-item-preview">
                  <div className="hc-ri-top">
                    <div className="hc-ri-name">
                      <div className="hc-ri-avatar">
                        {(review.firstName?.[0] || '') + (review.lastName?.[0] || '')}
                      </div>
                      <span>{review.firstName} {review.lastName}</span>
                    </div>
                    <span className="hc-ri-score">{review.rating}/10</span>
                  </div>
                  <div className="hc-ri-comment">{review.comment}</div>
                  <div className="hc-ri-date">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                  </div>
                </div>
              )) : (
                <div className="hc-no-review">Chưa có đánh giá nào.</div>
              )}
              {reviews.length > 3 && (
                <div className="hc-review-more-hint">
                  + {reviews.length - 3} đánh giá khác →
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Rooms Section ── */}
        <div className="hc-rooms-container">
          <div className="hc-rooms-header">
            <p>Những phòng còn trống tại <span>{hotelName}</span></p>
          </div>

          <div className="hc-room-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Phòng trống và giá tại chỗ nghỉ này</span>
          </div>

          <div className="hc-search-booking">
            <div className="hc-search-booking-input">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <input type="date" value={checkIn}  onChange={e => setCheckIn(e.target.value)}  style={{ flex:1, border:'none', outline:'none', fontSize:15 }} />
              <span style={{ color:'#999' }}>-</span>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ flex:1, border:'none', outline:'none', fontSize:15 }} />
            </div>

            <div className="hc-search-booking-input" style={{ position:'relative', cursor:'pointer' }} onClick={() => setShowGuestDropdown(!showGuestDropdown)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <input
                type="text"
                value={`${adults} người lớn · ${children} trẻ em · ${roomCount} phòng`}
                readOnly
                style={{ flex:1, border:'none', outline:'none', fontSize:15, cursor:'pointer', background:'transparent' }}
              />
              {showGuestDropdown && (
                <div className="hc-guest-dropdown" onClick={e => e.stopPropagation()}>
                  {[
                    { label: 'Người lớn',  val: adults,    set: setAdults,    min: 1 },
                    { label: 'Trẻ em',     val: children,  set: setChildren,  min: 0 },
                    { label: 'Phòng',      val: roomCount, set: setRoomCount, min: 1 },
                  ].map(({ label, val, set, min }) => (
                    <div key={label} className="hc-guest-row">
                      <span>{label}</span>
                      <div className="hc-guest-controls">
                        <button onClick={() => set(Math.max(min, val - 1))}>−</button>
                        <span>{val}</span>
                        <button onClick={() => set(val + 1)}>+</button>
                      </div>
                    </div>
                  ))}
                  <button className="hc-guest-done" onClick={() => setShowGuestDropdown(false)}>Xong</button>
                </div>
              )}
            </div>

            <button className="hc-search-booking-btn" onClick={handleSearchRooms}>Tìm</button>
          </div>

          <div className="hc-room-list">
            {filteredRooms.length > 0 ? filteredRooms.map(room => {
              const promo = promotions.find(p => p.roomId === room.id);
              const discountedPrice = promo
                ? room.pricePerNight - (room.pricePerNight * promo.discountPercentage / 100)
                : room.pricePerNight;
              const totalPrice = discountedPrice * appliedSearch.roomCount * numberOfNights;
              const originalTotal = room.pricePerNight * appliedSearch.roomCount * numberOfNights;
              const fmt = (n) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n);

              return (
                <div key={room.id} className="hc-room-card-new">
                  <div className="hc-room-title-bar">
                    <h3 style={{ fontSize:20, fontWeight:'bold', margin:0, color:'#333' }}>
                      Phòng {roomTypes.find(rt => rt.id === room.roomTypeId)?.name || `${room.capacity} người`}
                    </h3>
                  </div>
                  <div className="hc-room-body-new">
                    <div className="hc-room-left">
                      <div className="hc-room-img-new" style={{ backgroundImage:`url(${room.imageUrls?.[0] || 'https://via.placeholder.com/300x200'})` }} />
                      <div
                        onClick={() => { setSelectedRoom(room); setImgIndex(0); }}
                        style={{ color:'#0056b3', cursor:'pointer', fontWeight:500, marginTop:15, fontSize:14, display:'flex', alignItems:'center', gap:5 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                        Xem chi tiết phòng
                      </div>
                    </div>

                    <div className="hc-room-right">
                      <table className="hc-room-table">
                        <thead>
                          <tr>
                            <th style={{ width:'45%' }}>Tiện ích phòng</th>
                            <th style={{ width:'10%' }}>Khách</th>
                            <th style={{ width:'25%' }}>Tổng giá</th>
                            <th style={{ width:'10%' }}>Phòng</th>
                            <th style={{ width:'10%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="hc-room-choice">
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 20px', marginTop:4 }}>
                                {(room.amenityIds || []).slice(0, 10).map(aid => {
                                  const am = amenities.find(a => a.id === aid);
                                  return am ? (
                                    <div key={aid} style={{ fontSize:13, color:'#333', display:'flex', alignItems:'center', gap:4 }}>
                                      <span style={{ color:'#0056b3', fontWeight:'bold' }}>✓</span> {am.name}
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </td>
                            <td style={{ textAlign:'center', verticalAlign:'middle' }}>
                              <span>👤 x{room.capacity}</span>
                            </td>
                            <td className="hc-room-price-cell">
                              {promo && <div className="hc-sale-badge">Giảm {promo.discountPercentage}%</div>}
                              {promo && (
                                <div style={{ textDecoration:'line-through', color:'#999', fontSize:13, marginBottom:2 }}>
                                  {fmt(originalTotal)}
                                </div>
                              )}
                              <div className="hc-new-price">{fmt(totalPrice)}</div>
                              <div className="hc-price-tax">Bao gồm thuế và phí</div>
                              {numberOfNights > 1 && (
                                <div style={{ fontSize:12, color:'#666', marginTop:2 }}>
                                  {numberOfNights} đêm, {appliedSearch.roomCount} phòng
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign:'center', verticalAlign:'middle' }}>
                              {appliedSearch.roomCount}
                            </td>
                            <td style={{ textAlign:'center', verticalAlign:'middle' }}>
                              <button className="hc-btn-book-room-new" onClick={() => handleBooking(room)}>Chọn</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding:20, textAlign:'center', color:'#666' }}>
                Khách sạn này hiện chưa có phòng nào.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── GALLERY MODAL ── */}
      {galleryOpen && (
        <div className="hc-modal-overlay" onClick={() => setGalleryOpen(false)}>
          <div className="hc-modal hc-gallery-modal" onClick={e => e.stopPropagation()}>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Ảnh khách sạn · {hotelName}</h2>
              <button className="hc-modal-close" onClick={() => setGalleryOpen(false)}>&#x2715;</button>
            </div>
            <div className="hc-modal-main-img" style={{
              backgroundImage: images[galleryIndex] ? `url(${images[galleryIndex]})` : 'none',
              minHeight: 400,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {!images[galleryIndex] && <span style={{ fontSize:80, opacity:0.3 }}>🖼️</span>}
              {images.length > 1 && <>
                <button className="hc-modal-prev" onClick={() => setGalleryIndex(i => Math.max(0, i - 1))}><FaChevronLeft /></button>
                <button className="hc-modal-next" onClick={() => setGalleryIndex(i => Math.min(images.length - 1, i + 1))}><FaChevronRight /></button>
              </>}
              <div className="hc-modal-img-label">
                <span>{galleryIndex + 1} / {images.length || 1}</span>
              </div>
            </div>
            {images.length > 1 && (
              <div className="hc-modal-thumbnails">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className={`hc-modal-thumb${i === galleryIndex ? ' hc-modal-thumb-active' : ''}`}
                    style={{ backgroundImage: `url(${url})` }}
                    onClick={() => setGalleryIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ALL REVIEWS MODAL ── */}
      {showAllReviews && (
        <div className="hc-modal-overlay" onClick={() => setShowAllReviews(false)}>
          <div className="hc-modal hc-reviews-modal" onClick={e => e.stopPropagation()}>
            <div className="hc-modal-header">
              <div>
                <h2 className="hc-modal-title">Đánh giá từ khách hàng</h2>
                <div style={{ fontSize:13, color:'#888', marginTop:3 }}>
                  {totalReview} đánh giá · Điểm trung bình: {ratingAvg > 0 ? ratingAvg.toFixed(1) : '—'}/10
                </div>
              </div>
              <button className="hc-modal-close" onClick={() => setShowAllReviews(false)}>&#x2715;</button>
            </div>

            <div className="hc-reviews-summary">
              <div className="hc-score-badge-lg">{ratingAvg > 0 ? ratingAvg.toFixed(1) : '—'}</div>
              <div>
                <div className="hc-score-verdict">{ratingLabel}</div>
                <div style={{ fontSize:13, color:'#888', marginTop:3 }}>{totalReview} đánh giá</div>
              </div>
            </div>

            <div className="hc-reviews-full-list">
              {reviews.length > 0 ? reviews.map((review, i) => (
                <div key={i} className="hc-review-full-item">
                  <div className="hc-ri-top">
                    <div className="hc-ri-name">
                      <div className="hc-ri-avatar hc-rv-avatar-lg">
                        {(review.firstName?.[0] || '') + (review.lastName?.[0] || '')}
                      </div>
                      <div>
                        <div style={{ fontWeight:500, fontSize:15, color:'#222' }}>
                          {review.firstName} {review.lastName}
                        </div>
                        <div style={{ fontSize:12, color:'#aaa', marginTop:1 }}>
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                        </div>
                      </div>
                    </div>
                    <span className="hc-ri-score">{review.rating}/10</span>
                  </div>
                  <div className="hc-rv-comment">{review.comment}</div>
                </div>
              )) : (
                <div className="hc-no-review">Chưa có đánh giá nào.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ROOM DETAIL MODAL ── */}
      {selectedRoom && (
        <div className="hc-modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="hc-modal" onClick={e => e.stopPropagation()}>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">
                Phòng {roomTypes.find(rt => rt.id === selectedRoom.roomTypeId)?.name || `${selectedRoom.capacity} người`}
              </h2>
              <button className="hc-modal-close" onClick={() => setSelectedRoom(null)}>&#x2715;</button>
            </div>
            <div className="hc-modal-body">
              {/* LEFT: Image Slider */}
              <div className="hc-modal-imgs">
                <div className="hc-modal-main-img" style={{ backgroundImage: `url(${selectedRoom.imageUrls?.[imgIndex] || 'https://via.placeholder.com/700x450'})` }}>
                  {(selectedRoom.imageUrls || []).length > 1 && (
                    <>
                      <button className="hc-modal-prev" onClick={() => setImgIndex(i => Math.max(0, i - 1))}><FaChevronLeft /></button>
                      <button className="hc-modal-next" onClick={() => setImgIndex(i => Math.min(selectedRoom.imageUrls.length - 1, i + 1))}><FaChevronRight /></button>
                    </>
                  )}
                  <div className="hc-modal-img-label">
                    <span>{imgIndex + 1} / {selectedRoom.imageUrls?.length || 1}</span>
                  </div>
                </div>
                {(selectedRoom.imageUrls || []).length > 1 && (
                  <div className="hc-modal-thumbnails">
                    {selectedRoom.imageUrls.slice(0, 6).map((url, i) => (
                      <div
                        key={i}
                        className={`hc-modal-thumb${i === imgIndex ? ' hc-modal-thumb-active' : ''}`}
                        style={{ backgroundImage: `url(${url})` }}
                        onClick={() => setImgIndex(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Info Panel */}
              <div className="hc-modal-info">
                <div className="hc-modal-section">
                  <div className="hc-modal-section-title">Thông tin phòng</div>
                  <div className="hc-modal-info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    <span>{selectedRoom.area} m²</span>
                  </div>
                  <div className="hc-modal-info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <span>{selectedRoom.capacity} khách</span>
                  </div>
                </div>

                {(selectedRoom.amenityIds || []).length > 0 && (
                  <div className="hc-modal-section">
                    <div className="hc-modal-section-title">Tiện nghi phòng</div>
                    <div className="hc-modal-amenity-grid">
                      {(selectedRoom.amenityIds || []).map(aid => {
                        const am = amenities.find(a => a.id === aid);
                        return am ? (
                          <div key={aid} className="hc-modal-amenity-item">
                            <span className="hc-modal-bullet">•</span> {am.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="hc-modal-price-block">
                  <div style={{ fontSize:13, color:'#333', marginBottom:4 }}>Khởi điểm từ:</div>
                  <div style={{ fontSize:22, fontWeight:'bold', color:'#e5464e' }}>
                    {new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(selectedRoom.pricePerNight)}
                    <span style={{ fontSize:13, fontWeight:'normal', color:'#666' }}> / Phòng / đêm</span>
                  </div>
                  <button className="hc-modal-book-btn">Thêm lựa chọn phòng</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}