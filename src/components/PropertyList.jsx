import React, { useState, useEffect, useRef } from 'react';
import { useHotels } from '../api/HotelContext';
import '../pages/PartnerDashboard/partnerDashboard.css';
import CreateRoom from '../pages/PartnerDashboard/components/CreateRoom';
import { getRoomsByHotelId } from '../api/roomApi';

const formatVND = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "tr ₫"
    : n.toLocaleString("vi-VN") + " ₫";

const ROOM_TYPES = [
  { id: 1, name: "Phòng Standard" },
  { id: 2, name: "Phòng Deluxe" },
  { id: 3, name: "Phòng Suite" },
  { id: 4, name: "Phòng Single" },
  { id: 5, name: "Phòng Double" },
];

/* ─────────────────────────── Toast Component ─────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      background: toast.type === 'success' ? '#16a34a' : '#dc2626',
      color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      animation: 'fadeInDown 0.3s ease',
    }}>
      {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
    </div>
  );
}

/* ─────────────────────────── Edit Hotel Modal ─────────────────────────── */
function EditHotelModal({ hotel, onClose, onSuccess }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [form, setForm] = useState(null);
  const imagesRef = useRef(null);

  useEffect(() => {
    // Fetch hotel detail + amenities in parallel
    Promise.all([
      fetch(`http://localhost:8889/api/hotel/gethoteldetail/${hotel.id}`).then(r => r.json()),
      fetch('http://localhost:8889/api/amenities?type=HOTEL').then(r => r.json()),
    ]).then(([hotelData, amenData]) => {
      if (hotelData.status === 200) {
        const d = hotelData.data;
        setDetail(d);
        setForm({
          name: d.name || '',
          star: d.star || '',
          description: d.description || '',
          checkin_time_start: d.checkin_time_start || '',
          checkin_time_end: d.checkin_time_end || '',
          checkout_time_start: d.checkout_time_start || '',
          checkout_time_end: d.checkout_time_end || '',
          district: '',
          city: '',
          country: '',
          amenityIds: d.amenity_ids || [],
          newImages: [],
        });
      }
      const ams = Array.isArray(amenData) ? amenData : (amenData?.data || []);
      setAmenitiesList(ams);
    }).catch(() => { }).finally(() => setLoading(false));
  }, [hotel.id]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAmenityToggle = (id) => {
    setForm(prev => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id)
        ? prev.amenityIds.filter(a => a !== id)
        : [...prev.amenityIds, id],
    }));
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }));
  };

  const removeNewImage = (idx) => {
    setForm(prev => ({ ...prev, newImages: prev.newImages.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setToast({ type: 'error', msg: 'Tên khách sạn không được để trống!' }); setTimeout(() => setToast(null), 3000); return; }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      if (form.star) payload.append('star', form.star);
      if (form.description) payload.append('description', form.description);
      if (form.checkin_time_start) payload.append('checkin_time_start', form.checkin_time_start);
      if (form.checkin_time_end) payload.append('checkin_time_end', form.checkin_time_end);
      if (form.checkout_time_start) payload.append('checkout_time_start', form.checkout_time_start);
      if (form.checkout_time_end) payload.append('checkout_time_end', form.checkout_time_end);
      if (form.district) payload.append('district', form.district);
      if (form.city) payload.append('city', form.city);
      if (form.country) payload.append('country', form.country);
      form.amenityIds.forEach(id => payload.append('amenityIds', id));
      form.newImages.forEach(f => payload.append('images', f));

      const res = await fetch(`http://localhost:8889/api/hotel/update/${hotel.id}`, {
        method: 'PUT',
        body: payload,
      });
      const data = await res.json();
      if (data.status === 200 || res.ok) {
        setToast({ type: 'success', msg: 'Cập nhật khách sạn thành công!' });
        setTimeout(() => { setToast(null); onSuccess(); onClose(); }, 1500);
      } else {
        setToast({ type: 'error', msg: data.message || 'Cập nhật thất bại!' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: 'error', msg: 'Không thể kết nối server!' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (detail && form && !form.city && !form.district) {
      setForm(prev => ({ 
        ...prev, 
        district: detail.district || '',
        city: detail.city || '',
        country: detail.country || ''
      }));
    }
  }, [detail]);

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', color: '#111827',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' };
  const fieldStyle = { marginBottom: '14px' };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Toast toast={toast} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', width: '780px', maxWidth: '96vw',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>✏️ Chỉnh sửa khách sạn</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{hotel.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>⏳ Đang tải dữ liệu...</p>
          ) : !form ? (
            <p style={{ textAlign: 'center', color: '#dc2626' }}>Không thể tải thông tin khách sạn.</p>
          ) : (
            <>
              {/* Tên & sao */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>TÊN KHÁCH SẠN *</label>
                  <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Tên khách sạn" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>XẾP HẠNG SAO</label>
                  <select style={{ ...inputStyle, appearance: 'auto' }} value={form.star} onChange={e => handleChange('star', e.target.value)}>
                    <option value="">-- Chọn --</option>
                    {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} sao</option>)}
                  </select>
                </div>
              </div>

              {/* Địa chỉ */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '10px' }}>📍 ĐỊA CHỈ</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Địa chỉ</label>
                    <input style={inputStyle} value={form.district} onChange={e => handleChange('district', e.target.value)} placeholder="VD: Quận 1" />
                  </div>
                  <div>
                    <label style={labelStyle}>Thành phố</label>
                    <input style={inputStyle} value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="VD: Hà Nội" />
                  </div>
                  <div>
                    <label style={labelStyle}>Quốc gia</label>
                    <input style={inputStyle} value={form.country} onChange={e => handleChange('country', e.target.value)} placeholder="VD: Việt Nam" />
                  </div>
                </div>
              </div>

              {/* Check-in / Check-out */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '10px' }}>🕐 GIỜ NHẬN & TRẢ PHÒNG</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { key: 'checkin_time_start', label: 'Check-in (từ)' },
                    { key: 'checkin_time_end', label: 'Check-in (đến)' },
                    { key: 'checkout_time_start', label: 'Check-out (từ)' },
                    { key: 'checkout_time_end', label: 'Check-out (đến)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="time" style={inputStyle} value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mô tả */}
              <div style={fieldStyle}>
                <label style={labelStyle}>MÔ TẢ</label>
                <textarea
                  style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Mô tả về khách sạn..."
                />
              </div>

              {/* Tiện nghi */}
              {amenitiesList.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>TIỆN NGHI ({form.amenityIds.length} đã chọn)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '4px' }}>
                    {amenitiesList.map(a => {
                      const selected = form.amenityIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleAmenityToggle(a.id)}
                          style={{
                            padding: '5px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                            border: selected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            background: selected ? '#eff6ff' : '#f9fafb',
                            color: selected ? '#1d4ed8' : '#374151',
                            transition: 'all 0.15s',
                          }}
                        >
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ảnh hiện tại */}
              {detail?.images?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>ẢNH HIỆN TẠI</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {detail.images.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Thêm ảnh mới */}
              <div style={fieldStyle}>
                <label style={labelStyle}>THÊM ẢNH MỚI</label>
                <input ref={imagesRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageAdd} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <div
                    onClick={() => imagesRef.current?.click()}
                    style={{
                      width: '80px', height: '60px', border: '2px dashed #93c5fd', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', background: '#f0f7ff', color: '#3b82f6', fontSize: '22px', fontWeight: 'bold',
                    }}
                  >+</div>
                  {form.newImages.map((f, i) => (
                    <div key={i} style={{ position: 'relative', width: '80px', height: '60px' }}>
                      <img src={URL.createObjectURL(f)} alt="preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <button
                        type="button" onClick={() => removeNewImage(i)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button onClick={onClose} style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                  Hủy
                </button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '10px 28px', background: '#003580', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Edit Room Modal ─────────────────────────── */
function EditRoomModal({ room, hotelId, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const imagesRef = useRef(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8889/api/room/detail/${room.id}`).then(r => r.json()),
      fetch('http://localhost:8889/api/amenities?type=ROOM').then(r => r.json()),
    ]).then(([roomData, amenData]) => {
      if (roomData.status === 200) {
        const d = roomData.data;
        setDetail(d);
        setForm({
          roomTypeId: d.roomTypeId || '',
          quantity: d.quantity || '',
          area: d.area || '',
          pricePerNight: d.pricePerNight || '',
          capacity: d.capacity || '',
          status: d.status !== undefined ? String(d.status) : '1',
          description: d.description || '',
          amenityIds: d.amenity_ids || [],
          newImages: [],
        });
      } else {
        // fallback from list data
        setForm({
          roomTypeId: room.roomTypeId || '',
          quantity: room.quantity || '',
          area: room.area || '',
          pricePerNight: room.pricePerNight || '',
          capacity: room.capacity || '',
          status: room.status !== undefined ? String(room.status) : '1',
          description: room.description || '',
          amenityIds: [],
          newImages: [],
        });
      }
      const ams = Array.isArray(amenData) ? amenData : (amenData?.data || []);
      setAmenitiesList(ams);
    }).catch(() => { }).finally(() => setLoading(false));
  }, [room.id]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAmenityToggle = (id) => {
    setForm(prev => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id) ? prev.amenityIds.filter(a => a !== id) : [...prev.amenityIds, id],
    }));
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }));
  };

  const removeNewImage = (idx) => setForm(prev => ({ ...prev, newImages: prev.newImages.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.roomTypeId) { setToast({ type: 'error', msg: 'Vui lòng chọn loại phòng!' }); setTimeout(() => setToast(null), 3000); return; }
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) { setToast({ type: 'error', msg: 'Giá phải lớn hơn 0!' }); setTimeout(() => setToast(null), 3000); return; }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('hotelId', hotelId);
      payload.append('roomTypeId', form.roomTypeId);
      payload.append('pricePerNight', form.pricePerNight);
      payload.append('capacity', form.capacity);
      payload.append('quantity', form.quantity);
      if (form.area) payload.append('area', form.area);
      payload.append('status', form.status);
      payload.append('description', form.description);
      form.amenityIds.forEach(id => payload.append('amenityIds', id));
      form.newImages.forEach(f => payload.append('images', f));

      const res = await fetch(`http://localhost:8889/api/room/update/${room.id}`, {
        method: 'PUT',
        body: payload,
      });
      const data = await res.json();
      if (data.status === 200 || res.ok) {
        setToast({ type: 'success', msg: 'Cập nhật phòng thành công!' });
        setTimeout(() => { setToast(null); onSuccess(); onClose(); }, 1500);
      } else {
        setToast({ type: 'error', msg: data.message || 'Cập nhật thất bại!' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: 'error', msg: 'Không thể kết nối server!' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', color: '#111827',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' };

  const roomTypeName = ROOM_TYPES.find(rt => rt.id === Number(room.roomTypeId))?.name || `Loại ${room.roomTypeId}`;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Toast toast={toast} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '14px', width: '640px', maxWidth: '96vw',
          maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>✏️ Chỉnh sửa phòng</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{roomTypeName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>⏳ Đang tải dữ liệu...</p>
          ) : !form ? (
            <p style={{ textAlign: 'center', color: '#dc2626' }}>Không thể tải thông tin phòng.</p>
          ) : (
            <>
              {/* Loại phòng */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>LOẠI PHÒNG *</label>
                <select style={{ ...inputStyle, appearance: 'auto' }} value={form.roomTypeId} onChange={e => handleChange('roomTypeId', e.target.value)}>
                  <option value="">-- Chọn loại phòng --</option>
                  {ROOM_TYPES.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>

              {/* Số lượng, diện tích, sức chứa, giá */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>SỐ LƯỢNG PHÒNG</label>
                  <input type="number" style={inputStyle} value={form.quantity} onChange={e => handleChange('quantity', e.target.value)} min="1" />
                </div>
                <div>
                  <label style={labelStyle}>DIỆN TÍCH (m²)</label>
                  <input type="number" style={inputStyle} value={form.area} onChange={e => handleChange('area', e.target.value)} min="1" />
                </div>
                <div>
                  <label style={labelStyle}>SỨC CHỨA (người)</label>
                  <input type="number" style={inputStyle} value={form.capacity} onChange={e => handleChange('capacity', e.target.value)} min="1" />
                </div>
                <div>
                  <label style={labelStyle}>GIÁ MỖI ĐÊM (VNĐ) *</label>
                  <input type="number" style={inputStyle} value={form.pricePerNight} onChange={e => handleChange('pricePerNight', e.target.value)} min="1" />
                </div>
              </div>

              {/* Trạng thái */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>TRẠNG THÁI</label>
                <select style={{ ...inputStyle, appearance: 'auto' }} value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="1">Hoạt động</option>
                  <option value="0">Bảo trì</option>
                </select>
              </div>

              {/* Mô tả */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>MÔ TẢ</label>
                <textarea
                  style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Mô tả về phòng..."
                />
              </div>

              {/* Tiện nghi */}
              {amenitiesList.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>TIỆN NGHI ({form.amenityIds.length} đã chọn)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                    {amenitiesList.map(a => {
                      const selected = form.amenityIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleAmenityToggle(a.id)}
                          style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                            border: selected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            background: selected ? '#eff6ff' : '#f9fafb',
                            color: selected ? '#1d4ed8' : '#374151',
                            transition: 'all 0.15s',
                          }}
                        >
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ảnh hiện tại */}
              {detail?.images?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>ẢNH HIỆN TẠI</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {detail.images.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Thêm ảnh mới */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>THÊM ẢNH MỚI</label>
                <input ref={imagesRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageAdd} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <div
                    onClick={() => imagesRef.current?.click()}
                    style={{
                      width: '80px', height: '60px', border: '2px dashed #93c5fd', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', background: '#f0f7ff', color: '#3b82f6', fontSize: '22px', fontWeight: 'bold',
                    }}
                  >+</div>
                  {form.newImages.map((f, i) => (
                    <div key={i} style={{ position: 'relative', width: '80px', height: '60px' }}>
                      <img src={URL.createObjectURL(f)} alt="preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <button
                        type="button" onClick={() => removeNewImage(i)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button onClick={onClose} style={{ padding: '9px 22px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '9px 26px', background: '#003580', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Hotel Detail Modal ─────────────────────────── */
function HotelDetailModal({ hotel, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8889/api/hotel/gethoteldetail/${hotel.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 200) setDetail(data.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [hotel.id]);

  const statusLabel = (s) =>
    s === 2 ? { text: 'Hoạt động', color: '#16a34a', bg: '#dcfce7' }
      : s === 1 ? { text: 'Chờ duyệt', color: '#b45309', bg: '#fef3c7' }
        : { text: 'Đã xóa', color: '#dc2626', bg: '#fee2e2' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', width: '1000px', maxWidth: '95vw',
          maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
        }}
      >
        {/* Header ảnh */}
        <div style={{ position: 'relative', height: '200px', borderRadius: '16px 16px 0 0', overflow: 'hidden', background: '#e5e7eb' }}>
          {detail?.images?.[0] ? (
            <img src={detail.images[0]} alt={detail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: '#9ca3af' }}>🏨</div>
          )}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '12px', right: '14px',
              background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >×</button>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>Đang tải thông tin...</p>
          ) : !detail ? (
            <p style={{ color: '#dc2626', textAlign: 'center' }}>Không thể tải thông tin khách sạn.</p>
          ) : (
            <>
              {/* Tên + trạng thái */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{detail.name}</h2>
                {(() => {
                  const s = statusLabel(detail.status); return (
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.text}</span>
                  );
                })()}
              </div>

              {/* Grid thông tin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <InfoRow icon="📍" label="Địa chỉ" value={detail.address || '—'} />
                <InfoRow icon="⭐" label="Xếp hạng sao" value={detail.star ? `${detail.star} sao` : '—'} />
                <InfoRow icon="📊" label="Đánh giá TB" value={detail.rating_avg != null ? parseFloat(detail.rating_avg).toFixed(1) : '—'} />
                <InfoRow icon="🕐" label="Check-in" value={detail.checkin_time_start && detail.checkin_time_end ? `${detail.checkin_time_start} – ${detail.checkin_time_end}` : '—'} />
                <InfoRow icon="🕑" label="Check-out" value={detail.checkout_time_start && detail.checkout_time_end ? `${detail.checkout_time_start} – ${detail.checkout_time_end}` : '—'} />
                <InfoRow icon="📅" label="Ngày tạo" value={detail.created_at ? new Date(detail.created_at).toLocaleDateString('vi-VN') : '—'} />
              </div>

              {/* Mô tả */}
              {detail.description && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>MÔ TẢ</div>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{detail.description}</p>
                </div>
              )}

              {/* Tiện nghi */}
              {detail.amenities && detail.amenities.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>TIỆN NGHI</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {detail.amenities.map((a, i) => (
                      <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 500 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery ảnh thêm */}
              {detail.images && detail.images.length > 1 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>THƯ VIỆN ẢNH</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {detail.images.slice(1).map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '90px', height: '65px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 14px', border: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginBottom: '2px' }}>{icon} {label}</div>
      <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

/* ─────────────────────────── Rooms Modal ─────────────────────────── */
function RoomsModal({ hotel, onClose, onAddRoom, role }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRoom, setEditRoom] = useState(null);

  const fetchRooms = () => {
    setLoading(true);
    getRoomsByHotelId(hotel.id)
      .then(data => {
        if (data.status === 200) setRooms(data.data || []);
        else setRooms([]);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, [hotel.id]);

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      const res = await fetch(`http://localhost:8889/api/room/delete/${roomId}`, { method: 'DELETE' });
      if (res.ok) fetchRooms();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="pd-form__overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pd-form__card" onClick={e => e.stopPropagation()} style={{ width: '860px', maxWidth: '92vw', padding: '24px', backgroundColor: 'white', borderRadius: '12px', maxHeight: '82vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              🛏️ Danh sách phòng — "{hotel.name}"
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}>×</button>
          </div>

          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>Đang tải danh sách phòng...</p>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <span style={{ fontSize: '48px' }}>🛏️</span>
              <p style={{ color: '#6b7280', marginTop: '16px' }}>Khách sạn này chưa có phòng nào.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#374151' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Loại phòng</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Số lượng</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Sức chứa</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Diện tích</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Giá/đêm</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Trạng thái</th>
                  {role === 'PARTNER' && (
                    <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => {
                  const roomTypeMap = { 1: "Standard", 2: "Deluxe", 3: "Suite", 4: "Single", 5: "Double" };
                  const rTypeName = roomTypeMap[r.roomTypeId] || `Loại ${r.roomTypeId}`;
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', color: '#1f2937', fontWeight: 500 }}>{rTypeName}</td>
                      <td style={{ padding: '12px', color: '#4b5563' }}>{r.quantity} phòng</td>
                      <td style={{ padding: '12px', color: '#4b5563' }}>{r.capacity} người</td>
                      <td style={{ padding: '12px', color: '#4b5563' }}>{r.area ? `${r.area} m²` : '—'}</td>
                      <td style={{ padding: '12px', color: '#1f2937', fontWeight: 600 }}>{formatVND(r.pricePerNight)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: r.status === 1 ? '#dcfce7' : '#fef3c7',
                          color: r.status === 1 ? '#16a34a' : '#b45309',
                        }}>
                          {r.status === 1 ? 'Hoạt động' : 'Bảo trì'}
                        </span>
                      </td>
                      {role === 'PARTNER' && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => setEditRoom(r)}
                              style={{ padding: '5px 14px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(r.id)}
                              style={{ padding: '5px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {role === 'PARTNER' && (
              <button onClick={() => onAddRoom(hotel.id)} style={{ padding: '8px 20px', background: '#003580', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                + Thêm phòng mới
              </button>
            )}
            <button onClick={onClose} style={{ padding: '8px 20px', background: '#e5e7eb', color: '#374151', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Edit Room Modal */}
      {editRoom && (
        <EditRoomModal
          room={editRoom}
          hotelId={hotel.id}
          onClose={() => setEditRoom(null)}
          onSuccess={fetchRooms}
        />
      )}
    </>
  );
}

/* ─────────────────────────── Property Card ─────────────────────────── */
function PropertyCard({ p, onDelete, onViewRooms, onApprove, onViewDetail, onEditHotel, role, currentTab }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="pd-card" style={{ padding: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
      {/* Thumbnail */}
      <div style={{ width: '140px', height: '110px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
        {p.img && !imgError ? (
          <img src={p.img} alt={p.name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '28px', color: '#9ca3af', fontWeight: 'bold' }}>{p.initials}</span>
        )}
      </div>

      {/* Info Section */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#ef4444' }}>📍</span> {p.location}
          </div>
        </div>

        {p.amenities && p.amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {p.amenities.slice(0, 4).map((a, i) => (
              <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}>{a}</span>
            ))}
            {p.amenities.length > 4 && (
              <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}>+{p.amenities.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Stats Cluster */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', borderLeft: '1px solid #f3f4f6', paddingLeft: '24px', paddingRight: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#003580' }}>{p.rating ?? "—"}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{p.reviews} đánh giá</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{p.bookings}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Đặt phòng</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#003580' }}>{formatVND(p.revenue)}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Doanh thu</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        {currentTab === 'Hoạt động' && (
          <button
            onClick={() => onViewRooms(p)}
            style={{ width: '130px', padding: '8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >Danh sách phòng</button>
        )}
        {role === 'PARTNER' && currentTab === 'Hoạt động' && (
          <button
            onClick={() => onEditHotel(p)}
            style={{ width: '130px', padding: '8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >Chỉnh sửa</button>
        )}

        <button
          onClick={() => onViewDetail(p)}
          style={{ width: '130px', padding: '8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
        >Chi tiết</button>

        {role === 'ADMIN' && currentTab === 'Chờ duyệt' && (
          <button
            onClick={() => onApprove(p.id)}
            style={{ width: '130px', padding: '8px', background: '#003580', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >Duyệt</button>
        )}

        {currentTab !== 'Đã xóa' && (
          <button
            onClick={() => onDelete(p.id)}
            style={{ width: '130px', padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            {role === 'ADMIN' && currentTab === 'Chờ duyệt' ? 'Từ chối' : 'Xóa'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Main PropertyList ─────────────────────────── */
export default function PropertyList() {
  const { active, wait, deleted, handleDelete: onDelete, handleApprove: onApprove, pendingFilter, setPendingFilter, fetchHotels } = useHotels();
  const [activeFilter, setActiveFilter] = useState("Hoạt động");
  const [search, setSearch] = useState("");
  const [viewRoomsHotel, setViewRoomsHotel] = useState(null);
  const [addRoomForHotelId, setAddRoomForHotelId] = useState(null);
  const [detailHotel, setDetailHotel] = useState(null);
  const [editHotel, setEditHotel] = useState(null);
  const role = localStorage.getItem("partner_role");

  useEffect(() => {
    if (pendingFilter) {
      setActiveFilter(pendingFilter);
      setPendingFilter(null);
    }
  }, [pendingFilter, setPendingFilter]);

  const listToFilter = activeFilter === "Hoạt động"
    ? active
    : activeFilter === "Chờ duyệt"
      ? wait
      : (deleted || []);

  const filtered = listToFilter.filter(
    (p) => (p.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  return (
    <div className="pd-list">
      {/* Header row */}
      <div className="pd-list__header">
        <h2 className="pd-list__title">Các chỗ nghỉ đang hoạt động</h2>
        <div className="pd-list__filters">
          {["Hoạt động", "Chờ duyệt", "Đã xóa"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`pd-list__filter-btn${activeFilter === f ? ' pd-list__filter-btn--active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="pd-list__search-wrap">
        <span className="pd-list__search-icon">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc theo ID chỗ nghỉ, tên..."
          className="pd-list__search-input"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="pd-list__empty">
          <div className="pd-list__empty-icon">🏨</div>
          <div className="pd-list__empty-text">Không tìm thấy chỗ nghỉ nào</div>
        </div>
      ) : (
        <div className="pd-list__grid">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
              onDelete={onDelete}
              onViewRooms={setViewRoomsHotel}
              onApprove={onApprove}
              onViewDetail={setDetailHotel}
              onEditHotel={setEditHotel}
              role={role}
              currentTab={activeFilter}
            />
          ))}
        </div>
      )}

      {/* Hotel Detail Modal */}
      {detailHotel && (
        <HotelDetailModal hotel={detailHotel} onClose={() => setDetailHotel(null)} />
      )}

      {/* Edit Hotel Modal */}
      {editHotel && (
        <EditHotelModal
          hotel={editHotel}
          onClose={() => setEditHotel(null)}
          onSuccess={fetchHotels}
        />
      )}

      {/* View Rooms Modal */}
      {viewRoomsHotel && (
        <RoomsModal
          hotel={viewRoomsHotel}
          onClose={() => setViewRoomsHotel(null)}
          onAddRoom={(hId) => {
            setViewRoomsHotel(null);
            setAddRoomForHotelId(hId);
          }}
          role={role}
        />
      )}

      {/* Add Room Modal */}
      {addRoomForHotelId && (
        <CreateRoom
          initialHotelId={addRoomForHotelId}
          onClose={() => setAddRoomForHotelId(null)}
        />
      )}
    </div>
  );
}
