import React, { useState, useEffect, useRef } from 'react';
import { useHotels } from '../../../api/HotelContext';
import '../partnerDashboard.css';

const ROOM_TYPES = [
  { id: 1, name: "Phòng Standard" },
  { id: 2, name: "Phòng Deluxe" },
  { id: 3, name: "Phòng Suite" },
  { id: 4, name: "Phòng Single" },
  { id: 5, name: "Phòng Double" },
];

function StepBasicInfo({ data, onChange, onNext, properties }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.hotelId) e.hotelId = 'Vui lòng chọn khách sạn';
    if (!data.roomTypeId) e.roomTypeId = 'Vui lòng chọn loại phòng';
    if (!data.quantity || data.quantity < 1) e.quantity = 'Số lượng phòng phải lớn hơn 0';
    if (!data.area || data.area < 1) e.area = 'Diện tích phải lớn hơn 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner">
      <div className="pd-form__step-badge">Bước 1 / 4</div>
      <h2 className="pd-form__title">Thông tin cơ bản</h2>
      <p className="pd-form__subtitle">Cài đặt thông tin khách sạn và loại phòng</p>


      <div className="pd-form__field">
        <label className="pd-form__label">Loại phòng *</label>
        <select
          className={`pd-form__input${errors.roomTypeId ? ' pd-form__input--error' : ''}`}
          value={data.roomTypeId}
          onChange={e => onChange('roomTypeId', e.target.value)}
          style={{ appearance: 'auto' }}
        >
          <option value="">-- Chọn loại phòng --</option>
          {ROOM_TYPES.map(rt => (
            <option key={rt.id} value={rt.id}>{rt.name}</option>
          ))}
        </select>
        {errors.roomTypeId && <span className="pd-form__error">{errors.roomTypeId}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="pd-form__field">
          <label className="pd-form__label">Số lượng phòng *</label>
          <input
            type="number"
            className={`pd-form__input${errors.quantity ? ' pd-form__input--error' : ''}`}
            placeholder="VD: 5"
            value={data.quantity}
            onChange={e => onChange('quantity', e.target.value)}
            min="1"
          />
          {errors.quantity && <span className="pd-form__error">{errors.quantity}</span>}
        </div>

        <div className="pd-form__field">
          <label className="pd-form__label">Diện tích (m²) *</label>
          <input
            type="number"
            className={`pd-form__input${errors.area ? ' pd-form__input--error' : ''}`}
            placeholder="VD: 25"
            value={data.area}
            onChange={e => onChange('area', e.target.value)}
            min="1"
          />
          {errors.area && <span className="pd-form__error">{errors.area}</span>}
        </div>
      </div>

      <div className="pd-form__actions">
        <button type="submit" className="pd-form__btn-primary">
          Tiếp theo →
        </button>
      </div>
    </form>
  );
}

function StepPriceDocs({ data, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.pricePerNight || data.pricePerNight <= 0) e.pricePerNight = 'Giá phải lớn hơn 0';
    if (!data.capacity || data.capacity < 1) e.capacity = 'Sức chứa hợp lệ (>= 1)';
    if (!data.description.trim()) e.description = 'Vui lòng nhập mô tả phòng';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner">
      <div className="pd-form__step-badge">Bước 2 / 4</div>
      <h2 className="pd-form__title">Giá và chi tiết</h2>
      <p className="pd-form__subtitle">Điền thông tin về giá cả và sức chứa</p>

      <div className="pd-form__field">
        <label className="pd-form__label">Giá mỗi đêm (VNĐ) *</label>
        <input
          type="number"
          className={`pd-form__input${errors.pricePerNight ? ' pd-form__input--error' : ''}`}
          placeholder="VD: 500000"
          value={data.pricePerNight}
          onChange={e => onChange('pricePerNight', e.target.value)}
          min="1"
        />
        {errors.pricePerNight && <span className="pd-form__error">{errors.pricePerNight}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="pd-form__field">
          <label className="pd-form__label">Sức chứa (Người) *</label>
          <input
            type="number"
            className={`pd-form__input${errors.capacity ? ' pd-form__input--error' : ''}`}
            placeholder="VD: 2"
            value={data.capacity}
            onChange={e => onChange('capacity', e.target.value)}
            min="1"
          />
          {errors.capacity && <span className="pd-form__error">{errors.capacity}</span>}
        </div>

        <div className="pd-form__field">
          <label className="pd-form__label">Trạng thái *</label>
          <select
            className="pd-form__input"
            value={data.status}
            onChange={e => onChange('status', e.target.value)}
            style={{ appearance: 'auto' }}
          >
            <option value="1">Hoạt động</option>
            <option value="0">Bảo trì</option>
          </select>
        </div>
      </div>

      <div className="pd-form__field">
        <label className="pd-form__label">Mô tả chi tiết *</label>
        <textarea
          className={`pd-form__textarea${errors.description ? ' pd-form__input--error' : ''}`}
          placeholder="Mô tả về phòng: view biển, cách âm,..."
          rows={4}
          value={data.description}
          onChange={e => onChange('description', e.target.value)}
        />
        {errors.description && <span className="pd-form__error">{errors.description}</span>}
      </div>

      <div className="pd-form__actions pd-form__actions--two">
        <button type="button" onClick={onBack} className="pd-form__btn-secondary">
          ← Quay lại
        </button>
        <button type="submit" className="pd-form__btn-primary">
          Tiếp theo →
        </button>
      </div>
    </form>
  );
}

function StepAmenities({ data, onChange, onBack, onNext, amenitiesList }) {
  const [errors, setErrors] = useState({});

  const handleAmenityChange = (e) => {
    const value = parseInt(e.target.value);
    const newAmenities = e.target.checked
      ? [...data.amenities, value]
      : data.amenities.filter(id => id !== value);
    onChange('amenities', newAmenities);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner">
      <div className="pd-form__step-badge">Bước 3 / 4</div>
      <h2 className="pd-form__title">Tiện nghi trong phòng</h2>
      <p className="pd-form__subtitle">Chọn các tiện nghi khách sẽ có khi ở phòng này</p>

      <div className="pd-form__field">
        <label className="pd-form__label">
          Tiện nghi {data.amenities.length > 0 && <span style={{ color: '#4f8ef7', fontWeight: 600 }}>({data.amenities.length} đã chọn)</span>}
        </label>

        {amenitiesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#888', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            Đang tải danh sách tiện nghi...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            maxHeight: '330px',
            overflowY: 'auto',
            padding: '4px 2px',
          }}>
            {amenitiesList.map(a => (
              <label
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: data.amenities.includes(a.id)
                    ? '2px solid #4f8ef7'
                    : '1px solid #e0e0e0',
                  background: data.amenities.includes(a.id) ? '#eef4ff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '14px',
                  fontWeight: data.amenities.includes(a.id) ? 600 : 400,
                  color: data.amenities.includes(a.id) ? '#2563eb' : '#333',
                }}
              >
                <input
                  type="checkbox"
                  value={a.id}
                  checked={data.amenities.includes(a.id)}
                  onChange={handleAmenityChange}
                  style={{ accentColor: '#4f8ef7', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {a.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="pd-form__actions pd-form__actions--two">
        <button type="button" onClick={onBack} className="pd-form__btn-secondary">
          ← Quay lại
        </button>
        <button type="submit" className="pd-form__btn-primary">
          Tiếp theo →
        </button>
      </div>
    </form>
  );
}

function UploadGrid({ data, field, refEl, onChange }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    onChange(field, [...data[field], ...files]);
  };

  const removeImage = (index) => {
    const newFiles = data[field].filter((_, i) => i !== index);
    onChange(field, newFiles);
  };

  return (
    <div style={{
      maxHeight: '150px',
      overflowY: 'auto',
      padding: '4px 2px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
        <input
          ref={refEl}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <div
          onClick={() => refEl.current?.click()}
          style={{
            width: '80px', height: '80px', flexShrink: 0,
            border: '2px dashed #93c5fd',
            borderRadius: '8px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: '#f0f7ff',
            color: '#3b82f6', fontSize: '13px', fontWeight: 500,
            gap: '4px', userSelect: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
          onMouseLeave={e => e.currentTarget.style.background = '#f0f7ff'}
        >
          <span style={{ fontSize: '26px', lineHeight: 1 }}>+</span>
          <span>Tải ảnh</span>
        </div>
        {data[field].map((f, i) => (
          <div key={i} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <img
              src={URL.createObjectURL(f)}
              alt="preview"
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0' }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              style={{
                position: 'absolute', top: '-7px', right: '-7px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#ef4444', color: 'white', border: 'none',
                cursor: 'pointer', fontSize: '14px', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepMedia({ data, onChange, onBack, onSubmit, loading }) {
  const [errors, setErrors] = useState({});
  const imagesRef = useRef(null);

  const validate = () => {
    const e = {};
    if (data.images.length === 0) e.images = 'Vui lòng tải lên ít nhất 1 ảnh';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="pd-form__step-badge">Bước 4 / 4</div>
      <h2 className="pd-form__title">Hình ảnh phòng</h2>
      <p className="pd-form__subtitle">Tải lên hình ảnh rõ nét về phòng của bạn</p>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="pd-form__field">
          <label className="pd-form__label">* Ảnh góc nhìn, giường, wc,... </label>
          <UploadGrid data={data} field="images" refEl={imagesRef} onChange={onChange} />
          {errors.images && <span className="pd-form__error" style={{ display: 'block', marginTop: '6px' }}>{errors.images}</span>}
        </div>
      </div>

      <div className="pd-form__actions pd-form__actions--two" style={{ flexShrink: 0, marginTop: '16px' }}>
        <button type="button" onClick={onBack} className="pd-form__btn-secondary">
          ← Quay lại
        </button>
        <button type="submit" className="pd-form__btn-primary" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Thêm phòng'}
        </button>
      </div>
    </form>
  );
}

export default function CreateRoom({ onClose, initialHotelId }) {
  const { properties } = useHotels();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [amenitiesList, setAmenitiesList] = useState([]);

  const defaultHotelId = initialHotelId || (properties.length > 0 ? properties[0].id : '');

  const [formData, setFormData] = useState({
    hotelId: defaultHotelId,
    roomTypeId: '',
    quantity: '',
    area: '',
    pricePerNight: '',
    capacity: '',
    status: '1',
    description: '',
    amenities: [],
    images: [],
  });

  useEffect(() => {
    fetch('http://localhost:8889/api/amenities?type=ROOM')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAmenitiesList(data);
        else if (data && Array.isArray(data.data)) setAmenitiesList(data.data);
        else setAmenitiesList([]);
      })
      .catch(err => console.error("Lỗi lấy amenities:", err));
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWrapperClick = () => {
    onClose();
  };

  const stopProp = e => e.stopPropagation();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('hotelId', formData.hotelId);
      payload.append('roomTypeId', formData.roomTypeId);
      payload.append('pricePerNight', formData.pricePerNight);
      payload.append('capacity', formData.capacity);
      payload.append('quantity', formData.quantity);
      payload.append('area', formData.area);
      payload.append('status', formData.status);
      payload.append('description', formData.description);

      formData.amenities.forEach(id => payload.append('amenityIds', id));
      formData.images.forEach(file => payload.append('images', file));

      const res = await fetch('http://localhost:8889/api/room/create', {
        method: 'POST',
        body: payload,
      });

      const resData = await res.json();
      if (resData.status === 200 || resData.code === 200 || res.ok) {
        setToast({ type: 'success', msg: 'Tạo phòng thành công!' });
        setTimeout(() => { setToast(null); onClose(); }, 1500);
      } else {
        setToast({ type: 'error', msg: resData.message || 'Tạo thất bại, vui lòng thử lại.' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: 'error', msg: 'Không thể kết nối server!' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pd-form__overlay" onClick={handleWrapperClick}>
      <div className="pd-form__card" onClick={stopProp}>
        <div className="pd-form__progress">
          <div
            className="pd-form__progress-bar"
            style={{ 
              width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%'
            }}
          />
        </div>

        {toast && (
          <div className={`pd-form__toast pd-form__toast--${toast.type}`}>
            {toast.msg}
          </div>
        )}

        {step === 1 ? (
          <StepBasicInfo
            data={formData}
            onChange={handleChange}
            onNext={() => setStep(2)}
            properties={properties}
          />
        ) : step === 2 ? (
          <StepPriceDocs
            data={formData}
            onChange={handleChange}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        ) : step === 3 ? (
          <StepAmenities
            data={formData}
            onChange={handleChange}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            amenitiesList={amenitiesList}
          />
        ) : (
          <StepMedia
            data={formData}
            onChange={handleChange}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
