import React, { useState } from 'react';
import './PopularDestinations.css';

const PopularDestinations = () => {
  const [activeTab, setActiveTab] = useState('Thành phố trong nước');

  const tabs = [
    'Thành phố trong nước',
    'Thành phố nước ngoài',
    'Khu vực',
    'Quốc gia',
    'Chỗ nghỉ'
  ];

  const destinationsCol1 = [
    "Khách sạn TP. Hồ Chí Minh", "Khách sạn Phú Quốc", "Khách sạn Thành phố Hải Phòng", "Khách sạn Tam Đảo", "Khách sạn Cần Thơ", "Khách sạn Tánh Linh", "Khách sạn Mỹ Tho", "Khách sạn Điện Biên Phủ", "Khách sạn Quy Nhơn"
  ];
  
  const destinationsCol2 = [
    "Khách sạn Vũng Tàu", "Khách sạn Nha Trang", "Khách sạn Mai Châu", "Khách sạn Cao Lãnh", "Khách sạn Bến Tre", "Khách sạn Ninh Bình", "Khách sạn Diên Khánh", "Khách sạn Bến Cát", "Khách sạn Bạc Liêu"
  ];
  
  const destinationsCol3 = [
    "Khách sạn Hà Nội", "Khách sạn Huế", "Khách sạn Hà Tiên", "Khách sạn Vĩnh Phúc", "Khách sạn Buôn Ma Thuột", "Khách sạn Đồng Văn", "Khách sạn Rạch Giá", "Khách sạn Phong Nha"
  ];
  
  const destinationsCol4 = [
    "Khách sạn Đà Nẵng", "Khách sạn Mũi Né", "Khách sạn Tuần Châu", "Khách sạn Châu Đốc", "Khách sạn Mộc Châu", "Khách sạn Phan Thiết", "Khách sạn Vĩnh Long", "Khách sạn Đồng Hới"
  ];
  
  const destinationsCol5 = [
    "Khách sạn Đà Lạt", "Khách sạn Sa Pa", "Khách sạn Hội An", "Khách sạn Đảo Cát Bà", "Khách sạn Thanh Khê", "Khách sạn Hương Tân Lạc", "Khách sạn Bình Sum", "Khách sạn Tây Ninh"
  ];

  const columns = [destinationsCol1, destinationsCol2, destinationsCol3, destinationsCol4, destinationsCol5];

  return (
    <div className="popular-destinations">
      <h2>Phổ biến với du khách từ Việt Nam</h2>
      
      <div className="popular-tabs">
        {tabs.map((tab, index) => (
          <button 
            key={index} 
            className={`popular-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="destinations-grid">
        {columns.map((col, i) => (
          <div key={i} className="destination-column">
            {col.map((item, j) => (
              <a href="#" key={j} className="destination-item">
                {item}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularDestinations;