import React, { useState } from 'react';
import { useHotels } from '../../../api/HotelContext';
import '../partnerDashboard.css';

// Tạo danh sách giờ HH:00 từ 00:00 → 23:00
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

// Dropdown chọn giờ
function TimeSelect({ value, onChange, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 10px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        background: '#fff',
        cursor: 'pointer',
        appearance: 'auto',
        color: '#222',
      }}
    >
      {HOURS.map(h => (
        <option key={h} value={h}>{h}</option>
      ))}
    </select>
  );
}

// Step 1: Address form
function StepAddress({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.district.trim()) e.district = 'Vui lòng nhập quận/huyện';
    if (!data.city.trim()) e.city = 'Vui lòng nhập tỉnh/thành phố';
    if (!data.country.trim()) e.country = 'Vui lòng nhập quốc gia';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner">
      <div className="pd-form__step-badge">Bước 1 / 5</div>
      <h2 className="pd-form__title">Địa chỉ chỗ nghỉ</h2>
      <p className="pd-form__subtitle">Nhập thông tin vị trí chỗ nghỉ của bạn</p>

      <div className="pd-form__field">
        <label className="pd-form__label">Địa chỉ cụ thể *</label>
        <input
          className={`pd-form__input${errors.district ? ' pd-form__input--error' : ''}`}
          placeholder="VD: 123 Đường ABC"
          value={data.district}
          onChange={e => onChange('district', e.target.value)}
        />
        {errors.district && <span className="pd-form__error">{errors.district}</span>}
      </div>

      <div className="pd-form__field">
        <label className="pd-form__label">Tỉnh / Thành phố *</label>
        <input
          className={`pd-form__input${errors.city ? ' pd-form__input--error' : ''}`}
          placeholder="VD: Hà Nội"
          value={data.city}
          onChange={e => onChange('city', e.target.value)}
        />
        {errors.city && <span className="pd-form__error">{errors.city}</span>}
      </div>

      <div className="pd-form__field">
        <label className="pd-form__label">Quốc gia *</label>
        <input
          className={`pd-form__input${errors.country ? ' pd-form__input--error' : ''}`}
          placeholder="VD: Việt Nam"
          value={data.country}
          onChange={e => onChange('country', e.target.value)}
        />
        {errors.country && <span className="pd-form__error">{errors.country}</span>}
      </div>

      <div className="pd-form__actions">
        <button type="submit" className="pd-form__btn-primary">
          Tiếp theo →
        </button>
      </div>
    </form>
  );
}

function StepHotelInfo({ data, onChange, onBack, onSubmit }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = 'Vui lòng nhập tên khách sạn';
    if (!data.star || data.star < 1 || data.star > 5) e.star = 'Chọn số sao (1–5)';
    if (!data.description.trim()) e.description = 'Vui lòng nhập mô tả';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner">
      <div className="pd-form__step-badge">Bước 2 / 5</div>
      <h2 className="pd-form__title">Thông tin khách sạn</h2>
      <p className="pd-form__subtitle">Điền các thông tin cơ bản về chỗ nghỉ</p>

      {/* Tên khách sạn */}
      <div className="pd-form__field">
        <label className="pd-form__label">Tên khách sạn *</label>
        <input
          className={`pd-form__input${errors.name ? ' pd-form__input--error' : ''}`}
          placeholder="VD: Khách sạn Hà Nội Center"
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
        />
        {errors.name && <span className="pd-form__error">{errors.name}</span>}
      </div>

      {/* Số sao */}
      <div className="pd-form__field">
        <label className="pd-form__label">Số sao *</label>
        <div className="pd-form__stars">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              type="button"
              key={s}
              onClick={() => onChange('star', s)}
              className={`pd-form__star-btn${data.star >= s ? ' pd-form__star-btn--active' : ''}`}
            >
              ★
            </button>
          ))}
          {data.star > 0 && <span className="pd-form__star-label">{data.star} sao</span>}
        </div>
        {errors.star && <span className="pd-form__error">{errors.star}</span>}
      </div>

      {/* Mô tả */}
      <div className="pd-form__field">
        <label className="pd-form__label">Mô tả *</label>
        <textarea
          className={`pd-form__textarea${errors.description ? ' pd-form__input--error' : ''}`}
          placeholder="Mô tả ngắn về chỗ nghỉ của bạn..."
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

// Step 3: Giờ nhận / trả phòng
function StepCheckInOut({ data, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.checkin_time_start) e.checkin_time_start = 'Vui lòng chọn giờ nhận phòng (từ)';
    if (!data.checkin_time_end) e.checkin_time_end = 'Vui lòng chọn giờ nhận phòng (đến)';
    if (!data.checkout_time_start) e.checkout_time_start = 'Vui lòng chọn giờ trả phòng (từ)';
    if (!data.checkout_time_end) e.checkout_time_end = 'Vui lòng chọn giờ trả phòng (đến)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  // Card style cho mỗi block nhận/trả phòng
  const cardStyle = {
    background: '#f8faff',
    border: '1.5px solid #dbeafe',
    borderRadius: '12px',
    padding: '20px 20px 16px',
    marginBottom: '16px',
  };

  const sectionTitleStyle = {
    fontWeight: 600,
    fontSize: '15px',
    color: '#1e40af',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner">
      <div className="pd-form__step-badge">Bước 3 / 5</div>
      <h2 className="pd-form__title">Giờ nhận &amp; trả phòng</h2>
      <p className="pd-form__subtitle">Quy định thời gian check-in và check-out tại chỗ nghỉ của bạn</p>

      {/* ── Nhận phòng ── */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>🛎️ Nhận phòng (Check-in)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Từ giờ</label>
            <TimeSelect
              id="checkin_time_start"
              value={data.checkin_time_start}
              onChange={val => onChange('checkin_time_start', val)}
            />
            {errors.checkin_time_start && (
              <span className="pd-form__error">{errors.checkin_time_start}</span>
            )}
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Đến giờ</label>
            <TimeSelect
              id="checkin_time_end"
              value={data.checkin_time_end}
              onChange={val => onChange('checkin_time_end', val)}
            />
            {errors.checkin_time_end && (
              <span className="pd-form__error">{errors.checkin_time_end}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Trả phòng ── */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <p style={sectionTitleStyle}>🔑 Trả phòng (Check-out)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Từ giờ</label>
            <TimeSelect
              id="checkout_time_start"
              value={data.checkout_time_start}
              onChange={val => onChange('checkout_time_start', val)}
            />
            {errors.checkout_time_start && (
              <span className="pd-form__error">{errors.checkout_time_start}</span>
            )}
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Đến giờ</label>
            <TimeSelect
              id="checkout_time_end"
              value={data.checkout_time_end}
              onChange={val => onChange('checkout_time_end', val)}
            />
            {errors.checkout_time_end && (
              <span className="pd-form__error">{errors.checkout_time_end}</span>
            )}
          </div>
        </div>
      </div>

      <div className="pd-form__actions pd-form__actions--two" style={{ marginTop: '24px' }}>
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
      <div className="pd-form__step-badge">Bước 4 / 5</div>
      <h2 className="pd-form__title">Tiện nghi chỗ nghỉ</h2>
      <p className="pd-form__subtitle">Chọn các tiện nghi mà chỗ nghỉ của bạn cung cấp</p>

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

        {errors.amenities && <span className="pd-form__error">{errors.amenities}</span>}
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

// Sub-component: lưới upload ảnh dạng card dashed
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
        {/* Hidden file input */}
        <input
          ref={refEl}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />

        {/* Add card */}
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

        {/* Thumbnail previews */}
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
  const imagesRef = React.useRef(null);
  const policyRef = React.useRef(null);

  const validate = () => {
    const e = {};
    if (data.images.length === 0) e.images = 'Vui lòng tải lên ít nhất 1 ảnh';
    if (data.policyFiles.length === 0) e.policyFiles = 'Vui lòng tải lên giấy tờ xác nhận';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="pd-form__inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="pd-form__step-badge">Bước 5 / 5</div>
      <h2 className="pd-form__title">Hình ảnh &amp; Giấy tờ</h2>
      <p className="pd-form__subtitle">Tải lên hình ảnh khách sạn và giấy tờ xác nhận kinh doanh</p>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="pd-form__field">
          <label className="pd-form__label">* Ảnh khách sạn</label>
          <UploadGrid data={data} field="images" refEl={imagesRef} onChange={onChange} />
          {errors.images && <span className="pd-form__error" style={{ display: 'block', marginTop: '6px' }}>{errors.images}</span>}
        </div>

        <div className="pd-form__field">
          <label className="pd-form__label">* Giấy tờ xác nhận kinh doanh</label>
          <UploadGrid data={data} field="policyFiles" refEl={policyRef} onChange={onChange} />
          {errors.policyFiles && <span className="pd-form__error" style={{ display: 'block', marginTop: '6px' }}>{errors.policyFiles}</span>}
        </div>
      </div>

      <div className="pd-form__actions pd-form__actions--two" style={{ flexShrink: 0, marginTop: '16px' }}>
        <button type="button" onClick={onBack} className="pd-form__btn-secondary">
          ← Quay lại
        </button>
        <button type="submit" className="pd-form__btn-primary" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Tạo chỗ nghỉ'}
        </button>
      </div>
    </form>
  );
}

export default function CreateHotel() {
  const { setShowAddModal, fetchHotels } = useHotels();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [amenitiesList, setAmenitiesList] = useState([]);

  const [addressData, setAddressData] = useState({ district: '', city: '', country: 'Việt Nam' });
  const [hotelData, setHotelData] = useState({
    name: '',
    star: 0,
    description: '',
    checkin_time_start: '14:00',
    checkin_time_end: '22:00',
    checkout_time_start: '06:00',
    checkout_time_end: '12:00',
  });
  const [mediaData, setMediaData] = useState({ amenities: [], images: [], policyFiles: [] });

  React.useEffect(() => {
    if (showForm) {
      fetch('http://localhost:8889/api/amenities')
        .then(res => res.json())
        .then(data => {
          console.log('Amenities response:', data);
          if (Array.isArray(data)) {
            setAmenitiesList(data);
          } else if (data && Array.isArray(data.data)) {
            setAmenitiesList(data.data);
          } else {
            console.warn('Không thể parse danh sách amenity:', data);
            setAmenitiesList([]);
          }
        })
        .catch(err => console.error("Lỗi lấy amenities:", err));
    }
  }, [showForm]);

  const handleAddressChange = (field, value) => setAddressData(prev => ({ ...prev, [field]: value }));
  const handleHotelChange = (field, value) => setHotelData(prev => ({ ...prev, [field]: value }));
  const handleMediaChange = (field, value) => setMediaData(prev => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setShowForm(false);
    setStep(1);
    setAddressData({ district: '', city: '', country: 'Việt Nam' });
    setHotelData({
      name: '', star: 0, description: '',
      checkin_time_start: '14:00',
      checkin_time_end: '22:00',
      checkout_time_start: '06:00',
      checkout_time_end: '12:00',
    });
    setMediaData({ amenities: [], images: [], policyFiles: [] });
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('partner_userId');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', Number(userId));
      formData.append('name', hotelData.name);
      formData.append('star', hotelData.star);
      formData.append('description', hotelData.description);
      formData.append('district', addressData.district);
      formData.append('city', addressData.city);
      formData.append('country', addressData.country);
      formData.append('checkin_time_start', hotelData.checkin_time_start);
      formData.append('checkin_time_end', hotelData.checkin_time_end);
      formData.append('checkout_time_start', hotelData.checkout_time_start);
      formData.append('checkout_time_end', hotelData.checkout_time_end);

      mediaData.amenities.forEach(id => formData.append('amenityIds', id));
      mediaData.images.forEach(file => formData.append('images', file));
      mediaData.policyFiles.forEach(file => formData.append('policyFiles', file));

      const res = await fetch('http://localhost:8889/api/hotel/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 200) {
        setToast({ type: 'success', msg: 'Tạo chỗ nghỉ thành công!' });
        if (fetchHotels) fetchHotels();
        setTimeout(() => { setToast(null); handleClose(); }, 1500);
      } else {
        setToast({ type: 'error', msg: data.message || 'Tạo thất bại, vui lòng thử lại.' });
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
    <>
      {/* Title row */}
      <div className="pd-create__row">
        <div>
          <h1 className="pd-create__title">Nhóm chỗ nghỉ</h1>
          <p className="pd-create__subtitle">Quản lý tất cả chỗ nghỉ của bạn trên Booking.com</p>
        </div>
        <button onClick={() => setShowForm(true)} className="pd-create__btn">
          + Thêm chỗ nghỉ
        </button>
      </div>

      {/* Multi-step modal */}
      {showForm && (
        <div className="pd-form__overlay" onClick={handleClose}>
          <div className="pd-form__card" onClick={e => e.stopPropagation()}>
            {/* Progress bar */}
            <div className="pd-form__progress">
              <div
                className="pd-form__progress-bar"
                style={{ width: step === 1 ? '20%' : step === 2 ? '40%' : step === 3 ? '60%' : step === 4 ? '80%' : '100%' }}
              />
            </div>

            {/* Toast */}
            {toast && (
              <div className={`pd-form__toast pd-form__toast--${toast.type}`}>
                {toast.msg}
              </div>
            )}

            {step === 1 ? (
              <StepAddress
                data={addressData}
                onChange={handleAddressChange}
                onNext={() => setStep(2)}
              />
            ) : step === 2 ? (
              <StepHotelInfo
                data={hotelData}
                onChange={handleHotelChange}
                onBack={() => setStep(1)}
                onSubmit={() => setStep(3)}
              />
            ) : step === 3 ? (
              <StepCheckInOut
                data={hotelData}
                onChange={handleHotelChange}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            ) : step === 4 ? (
              <StepAmenities
                data={mediaData}
                onChange={handleMediaChange}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                amenitiesList={amenitiesList}
              />
            ) : (
              <StepMedia
                data={mediaData}
                onChange={handleMediaChange}
                onBack={() => setStep(4)}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}