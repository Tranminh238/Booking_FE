import { useState, useEffect } from "react";
import "../Detail.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// ── Static data ───────────────────────────────────────────────────────
const AMENITIES = [
  { icon: "🏠", label: "Căn hộ" },
  { icon: "🌆", label: "Nhìn ra thành phố" },
  { icon: "🌿", label: "Sân vườn" },
  { icon: "📶", label: "WiFi miễn phí" },
  { icon: "🍽️", label: "Sân hiên" },
  { icon: "🪟", label: "Ban công" },
  { icon: "❄️", label: "Điều hòa không khí" },
  { icon: "🚿", label: "Phòng tắm riêng" },
  { icon: "🔑", label: "Lễ tân 24 giờ" },
  { icon: "💳", label: "Ổ khóa mở bằng thẻ" },
];

const SCORES = [
  { label: "WiFi miễn phí", value: 8.8 },
  { label: "Vị trí",        value: 8.1 },
  { label: "Sạch sẽ",       value: 7.2 },
  { label: "Tiện nghi",     value: 6.5 },
  { label: "Nhân viên",     value: 7.0 },
];

const GALLERY_ROOMS = [
  { bg: "bg-living",  emoji: "🛋️", main: true,  more: false },
  { bg: "bg-bedroom", emoji: "🛏️", main: false, more: false },
  { bg: "bg-bath",    emoji: "🚿", main: false, more: true  },
];

// ── Sub-components ────────────────────────────────────────────────────

function StarRating({ total = 5, filled = 4 }) {
  return (
    <div className="hc-stars">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < filled ? "hc-star-filled" : "hc-star-empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

function IconBtn({ children, active = false, onClick, title }) {
  return (
    <button
      className={`hc-btn-icon${active ? " hc-liked" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="hc-score-row">
      <span className="hc-score-row-label">{label}</span>
      <div className="hc-bar-wrap">
        <div className="hc-bar" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="hc-score-num">{value.toFixed(1)}</span>
    </div>
  );
}

function GalleryCell({ bg, emoji, main, more, imgUrl }) {
  if (main) {
    return (
      <div className="hc-gallery-main">
        <div className={`hc-gallery-inner ${bg}`} style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}}>
          {!imgUrl && <span className="hc-room-emoji">{emoji}</span>}
        </div>
      </div>
    );
  }
  return (
    <div className="hc-gallery-sub">
      <div className={`hc-gallery-inner ${bg}`} style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}}>
        {!imgUrl && <span className="hc-room-emoji">{emoji}</span>}
      </div>
      {more && (
        <div className="hc-gallery-more">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Ảnh
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function InfoHotel({data}) {
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const totalReview = reviews.length;

  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomCount, setRoomCount] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (data?.id) {
        fetch(`http://localhost:8889/api/reviews/hotel/${data.id}`)
            .then(res => res.json())
            .then(resData => {
                if (Array.isArray(resData)) setReviews(resData);
            })
            .catch(err => console.error("Error fetching reviews", err));

        fetch(`http://localhost:8889/api/room/hotel/${data.id}`)
            .then(res => res.json())
            .then(resData => {
                if (resData.status === 200 && Array.isArray(resData.data)) {
                    setRooms(resData.data);
                }
            })
            .catch(err => console.error("Error fetching rooms", err));

        fetch(`http://localhost:8889/api/room-types/get-all`)
            .then(res => res.json())
            .then(resData => {
                if (Array.isArray(resData)) setRoomTypes(resData);
            })
            .catch(err => console.error("Error fetching room types", err));

        fetch(`http://localhost:8889/api/amenities`)
            .then(res => res.json())
            .then(resData => {
                if (Array.isArray(resData)) setAmenities(resData);
            })
            .catch(err => console.error("Error fetching amenities", err));
    }
  }, [data?.id]);

  if (!data) return null;

  const hotelName = data.name || "Tên khách sạn";
  const star = data.star || 0;
  const ratingAvg = data.rating_avg || 0;
  const address = [data.district, data.city, data.country].filter(Boolean).join(", ");
  const description = data.description || "";

  const amenitiesList = data.amenities || [];
  const images = data.images || [];

  const mainImage = images.length > 0 ? images[0] : null;
  const subImage1 = images.length > 1 ? images[1] : null;
  const subImage2 = images.length > 2 ? images[2] : null;

  const getIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes("wifi")) return "📶";
    if (l.includes("bơi")) return "🏊";
    if (l.includes("xe")) return "🚗";
    if (l.includes("hòa")) return "❄️";
    if (l.includes("hàng")) return "🍽️";
    if (l.includes("tân")) return "🔑";
    if (l.includes("hộ")) return "🏠";
    if (l.includes("vườn")) return "🌿";
    return "✨";
  };

  const handleViewRooms = () => {
    window.scrollBy({ top: 600, behavior: "smooth" });
  };

  return (
    <div className="hc-wrap">
      <div className="hc-card">

        {/* ── Header ── */}
        <div className="hc-header">
          <div>
            <h1 className="hc-name">{hotelName}</h1>
            <StarRating total={5} filled={star} />
            <div className="hc-address">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {address}
            </div>
          </div>
        </div>

        {/* ── Gallery ── */}
        <div className="hc-gallery">
          <GalleryCell bg="bg-living" emoji="🛋️" main={true} more={false} imgUrl={mainImage} />
          <GalleryCell bg="bg-bedroom" emoji="🛏️" main={false} more={false} imgUrl={subImage1} />
          <GalleryCell bg="bg-bath" emoji="🚿" main={false} more={images.length > 3} imgUrl={subImage2} />
        </div>

        {/* ── Amenities ── */}
        <div className="hc-amenities">
          {amenitiesList.map((a, i) => (
            <div key={i} className="hc-tag">
              <span className="hc-tag-icon">{getIcon(a)}</span>
              {a}
            </div>
          ))}
          {amenitiesList.length === 0 && (
             <div className="hc-tag">
               <span className="hc-tag-icon">🏠</span>
               Tiện nghi tiêu chuẩn
             </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="hc-body">

          {/* Description */}
          <div className="hc-description">
            {description ? (
                description.split('\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                ))
            ) : (
                <p>Khách sạn này chưa có bài mô tả chi tiết.</p>
            )}
          </div>

          {/* Score card */}
          <div className="hc-score-card">
            <div className="hc-overall">
              <div className="hc-btn-book">
                {ratingAvg}/10
              </div>
              <div>
                <div className="hc-score-label">
                    {ratingAvg >= 9 ? "Tuyệt vời" : ratingAvg >= 8 ? "Rất tốt" : ratingAvg >= 7 ? "Tốt" : ratingAvg >= 5 ? "Dễ chịu" : "Chưa có đánh giá"}
                </div>
                <div className="hc-score-count">
                    {totalReview} đánh giá
                </div>
              </div>
            </div>

            <div className="hc-score-rows" style={{ maxHeight: '2500px', overflowY: 'auto', paddingRight: '5px' }}>
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <div key={i} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eaeaea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '14px' }}>{review.userName || 'Ẩn danh'}</strong>
                      <span style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 'bold' }}>{review.rating}/5 ⭐</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--bark)', lineHeight: '1.4' }}>{review.comment}</p>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'black', fontSize: '14px' }}>
                  Chưa có đánh giá nào.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ROOMS SECTION ── */}
        <div className="hc-rooms-container">
          <div className="hc-rooms-header">
                <p>Những phòng còn trống tại <span>{hotelName}</span></p>
            </div>
          <div className="hc-room-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Phòng trống và giá tại chỗ nghỉ này</span>
          </div>

          <div className="hc-search-booking">
             <div className="hc-search-booking-input">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{flex: 1, border: 'none', outline: 'none', fontSize: '15px'}} />
                <span style={{color: '#999'}}>-</span>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{flex: 1, border: 'none', outline: 'none', fontSize: '15px'}} />
             </div>
             <div className="hc-search-booking-input" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowGuestDropdown(!showGuestDropdown)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input type="text"
                    value={`${adults} người lớn · ${children} trẻ em · ${roomCount} phòng`}
                    readOnly
                    style={{flex: 1, border: 'none', outline: 'none', fontSize: '15px', cursor: 'pointer', background: 'transparent'}}
                />
                {showGuestDropdown && (
                   <div className="hc-guest-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="hc-guest-row">
                          <span>Người lớn</span>
                          <div className="hc-guest-controls">
                              <button onClick={() => setAdults(Math.max(1, adults - 1))}>−</button>
                              <span>{adults}</span>
                              <button onClick={() => setAdults(adults + 1)}>+</button>
                          </div>
                      </div>
                      <div className="hc-guest-row">
                          <span>Trẻ em</span>
                          <div className="hc-guest-controls">
                              <button onClick={() => setChildren(Math.max(0, children - 1))}>−</button>
                              <span>{children}</span>
                              <button onClick={() => setChildren(children + 1)}>+</button>
                          </div>
                      </div>
                      <div className="hc-guest-row">
                          <span>Phòng</span>
                          <div className="hc-guest-controls">
                              <button onClick={() => setRoomCount(Math.max(1, roomCount - 1))}>−</button>
                              <span>{roomCount}</span>
                              <button onClick={() => setRoomCount(roomCount + 1)}>+</button>
                          </div>
                      </div>
                      <button className="hc-guest-done" onClick={() => setShowGuestDropdown(false)}>Xong</button>
                   </div>
                )}
             </div>
             <button className="hc-search-booking-btn">Tìm</button>
          </div>

          <div className="hc-room-list">
             {rooms.length > 0 ? rooms.map(room => (
                 <div key={room.id} className="hc-room-card-new">
                     <div className="hc-room-title-bar">
                         <h3 style={{fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#333'}}>
                            Phòng {roomTypes.find(rt => rt.id === room.roomTypeId)?.name || `Phòng ${room.capacity} người`}
                         </h3>
                     </div>
                     <div className="hc-room-body-new">
                         <div className="hc-room-left">
                             <div className="hc-room-img-new" style={{backgroundImage: `url(${room.imageUrls?.[0] || 'https://via.placeholder.com/300x200'})`}}></div>
                             <div onClick={() => { setSelectedRoom(room); setImgIndex(0); }} style={{color: '#0056b3', cursor: 'pointer', fontWeight: '500', marginTop: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                                 Xem chi tiết phòng
                             </div>
                         </div>
                         <div className="hc-room-right">
                             <table className="hc-room-table">
                                 <thead>
                                     <tr>
                                         <th style={{width: '45%'}}>Tiện ích phòng</th>
                                         <th style={{width: '10%'}}>Khách</th>
                                         <th style={{width: '25%'}}>Tổng giá</th>
                                         <th style={{width: '10%'}}>Phòng</th>
                                         <th style={{width: '10%'}}></th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     <tr>
                                         <td className="hc-room-choice">
                                             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', marginTop: '4px'}}>
                                                 {(room.amenityIds || []).slice(0, 10).map(aid => {
                                                     const am = amenities.find(a => a.id === aid);
                                                     return am ? (
                                                         <div key={aid} style={{fontSize: '13px', color: '#333', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                             <span style={{color: '#0056b3', fontWeight: 'bold'}}>✓</span> {am.name}
                                                         </div>
                                                     ) : null;
                                                 })}
                                             </div>
                                         </td>
                                         <td className="hc-room-guest" style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                             <span>👤 x{room.capacity}</span>
                                         </td>
                                         <td className="hc-room-price-cell">
                                             {/* <div className="hc-sale-badge">Sale Lễ</div> */}
                                             <div className="hc-new-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.pricePerNight*roomCount)}</div>
                                             <div className="hc-price-tax">Bao gồm thuế và phí</div>
                                         </td>
                                         <td className="hc-room-qty" style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                             1
                                         </td>
                                         <td className="hc-room-action" style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                             <button className="hc-btn-book-room-new">Chọn</button>
                                         </td>
                                     </tr>
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>
             )) : (
                 <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                     Khách sạn này hiện chưa có phòng nào.
                 </div>
             )}
          </div>
        </div>
      </div>

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
                <div className="hc-modal-main-img" style={{backgroundImage: `url(${selectedRoom.imageUrls?.[imgIndex] || 'https://via.placeholder.com/700x450'})`}}>
                  {(selectedRoom.imageUrls || []).length > 1 && (
                    <>
                      <button className="hc-modal-prev" onClick={() => setImgIndex(i => Math.max(0, i - 1))}>
                        <FaChevronLeft />
                      </button>
                      <button className="hc-modal-next" onClick={() => setImgIndex(i => Math.min((selectedRoom.imageUrls.length - 1), i + 1))}>
                        <FaChevronRight />
                      </button>
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
                        style={{backgroundImage: `url(${url})`}}
                        onClick={() => setImgIndex(i)}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Info Panel */}
              <div className="hc-modal-info">
                <div className="hc-modal-section">
                  <div className="hc-modal-section-title">Thông tin phòng</div>
                  <div className="hc-modal-info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                    <span>{selectedRoom.area} m²</span>
                  </div>
                  <div className="hc-modal-info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
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
                  <div style={{fontSize: '13px', color: '#333', marginBottom: '4px'}}>Khởi điểm từ:</div>
                  <div style={{fontSize: '22px', fontWeight: 'bold', color: '#e5464e'}}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRoom.pricePerNight)}
                    <span style={{fontSize: '13px', fontWeight: 'normal', color: '#666'}}> / Phòng / đêm</span>
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
