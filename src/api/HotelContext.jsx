import React, { createContext, useState, useEffect, useContext } from 'react';

const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Trang chủ");

  const fetchHotels = async () => {
    const userId = localStorage.getItem("partner_userId");
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8889/api/hotel/getbyuserid/${userId}`);
      const data = await response.json();
      if (data.status === 200 && data.data) {
        const apiProperties = data.data.map(h => ({
          id: h.id,
          name: h.name,
          location: h.address || "Việt Nam",
          status: h.status === 2 ? "active" : "wait", // 2 = duyệt (hoạt động), 1 = chờ duyệt
          rating: h.rating_avg !== null ? parseFloat(h.rating_avg) : null,
          reviews: 0,
          bookings: 0,
          revenue: 0,
          occupancy: 0,
          img: h.images && h.images.length > 0 ? h.images[0] : null,
          initials: h.name ? h.name.slice(0, 2).toUpperCase() : "HT"
        }));
        setProperties(apiProperties);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách sạn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const active = properties.filter((p) => p.status === "active");
  const wait = properties.filter((p) => p.status === "wait");

  const handleAddProperty = (name, location) => {
    setProperties([
      ...properties,
      {
        id: Date.now(),
        name: name,
        location: location || "Việt Nam",
        status: "wait",
        progress: 10,
        rating: null,
        reviews: 0,
        bookings: 0,
        revenue: 0,
        occupancy: 0,
        img: name ? name.slice(0, 2).toUpperCase() : "HT",
      },
    ]);
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  return (
    <HotelContext.Provider value={{ 
      properties, setProperties, active, wait, loading, fetchHotels,
      showAddModal, setShowAddModal, activeTab, setActiveTab,
      handleAddProperty, handleDelete
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotels = () => useContext(HotelContext);
