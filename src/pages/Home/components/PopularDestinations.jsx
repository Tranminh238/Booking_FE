import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PopularDestinations.css';

const PopularDestinations = () => {
  const navigate = useNavigate();

  const destinationsCol1 = [
    "Hồ Chí Minh", "Phú Quốc", "Thành phố Hải Phòng", "Tam Đảo", "Cần Thơ", "Tánh Linh", "Mỹ Tho", "Điện Biên Phủ", "Quy Nhơn"
  ];
  
  const destinationsCol2 = [
    "Vũng Tàu", "Nha Trang", "Mai Châu", "Cao Lãnh", "Bến Tre", "Ninh Bình", "Diên Khánh", "Bến Cát", "Bạc Liêu"
  ];
  
  const destinationsCol3 = [
    "Hà Nội", "Huế", "Hà Tiên", "Vĩnh Phúc", "Buôn Ma Thuột", "Đồng Văn", "Rạch Giá", "Phong Nha"
  ];
  
  const destinationsCol4 = [
    "Đà Nẵng", "Mũi Né", "Tuần Châu", "Châu Đốc", "Mộc Châu", "Phan Thiết", "Vĩnh Long", "Đồng Hới"
  ];
  
  const destinationsCol5 = [
    "Đà Lạt", "Sa Pa", "Hội An", "Đảo Cát Bà", "Thanh Khê", "Hương Tân Lạc", "Bình Sum", "Tây Ninh"
  ];

  const columns = [destinationsCol1, destinationsCol2, destinationsCol3, destinationsCol4, destinationsCol5];

  const handleDestinationClick = (e, item) => {
    e.preventDefault();
    navigate(`/hotels?keyword=${encodeURIComponent(item)}`);
  };

  const formatDisplayName = (item) => {
    // Tránh thêm trùng lặp chữ "Thành phố" hay "TP."
    if (
      item.startsWith("Thành phố") || 
      item.startsWith("TP.") || 
      item.startsWith("Đảo") || 
      item === "Phú Quốc"
    ) {
      return item;
    }
    return `Thành phố ${item}`;
  };

  return (
    <div className="popular-destinations">
      <h2>Phổ biến với du khách từ Việt Nam</h2>
      <div className="destinations-grid">
        {columns.map((col, i) => (
          <div key={i} className="destination-column">
            {col.map((item, j) => (
              <a 
                href="#" 
                key={j} 
                className="destination-item"
                onClick={(e) => handleDestinationClick(e, item)}
              >
                {formatDisplayName(item)}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularDestinations;