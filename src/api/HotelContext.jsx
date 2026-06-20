import React, { createContext, useState, useEffect, useContext } from 'react';

const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Trang chủ");
  const [pendingFilter, setPendingFilter] = useState(null); // null | "Hoạt động" | "Chờ duyệt"

  const fetchHotels = async () => {
    const userId = sessionStorage.getItem("partner_userId");
    const role = sessionStorage.getItem("partner_role");

    if (!userId && role !== "ADMIN") {
      setLoading(false);
      return;
    }
    try {
      let urlWait = `http://localhost:8889/api/hotel/gethotelwaitbyuserid/${userId}`;
      let urlActive = `http://localhost:8889/api/hotel/gethotelactivebyuserid/${userId}`;
      let urlDeleted = `http://localhost:8889/api/hotel/gethoteldeletedbyuserid/${userId}`;
      let urlUnactive = `http://localhost:8889/api/hotel/gethotelunactivebyuserid/${userId}`;

      if (role === "ADMIN") {
        urlWait = `http://localhost:8889/api/hotel/gethotelwait`;
        urlActive = `http://localhost:8889/api/hotel/gethotelactive`;
        urlDeleted = `http://localhost:8889/api/hotel/gethoteldeleted`;
        urlUnactive = `http://localhost:8889/api/hotel/gethotelunactive`;
      }

      const [resWait, resActive, resDeleted, resUnactive] = await Promise.all([
        fetch(urlWait),
        fetch(urlActive),
        fetch(urlDeleted),
        fetch(urlUnactive)
      ]);

      const dataWait = await resWait.json();
      const dataActive = await resActive.json();
      const dataDeleted = await resDeleted.json();
      const dataUnactive = await resUnactive.json();

      let allHotels = [];
      if (dataWait.status === 200 && dataWait.data) {
        allHotels = allHotels.concat(dataWait.data);
      }
      if (dataActive.status === 200 && dataActive.data) {
        allHotels = allHotels.concat(dataActive.data);
      }
      if (dataDeleted.status === 200 && dataDeleted.data) {
        allHotels = allHotels.concat(dataDeleted.data);
      }
      if (dataUnactive.status === 200 && dataUnactive.data) {
        allHotels = allHotels.concat(dataUnactive.data);
      }

      const apiProperties = allHotels
        .map(h => ({
          id: h.id,
          name: h.name,
          location: h.address || "Việt Nam",
          status: h.status === 2 ? "active" : h.status === 1 ? "wait" : h.status === 3 ? "unactive" : "deleted",
          rating: h.rating_avg !== null ? parseFloat(h.rating_avg) : null,
          reviews: 0,
          bookings: 0,
          revenue: 0,
          occupancy: 0,
          amenities: h.amenities || [],
          img: h.images && h.images.length > 0 ? h.images[0] : null,
          initials: h.name ? h.name.slice(0, 2).toUpperCase() : "HT"
        }));

      setProperties(apiProperties);
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
  const deleted = properties.filter((p) => p.status === "deleted");
  const unactive = properties.filter((p) => p.status === "unactive");

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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8889/api/hotel/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHotels();
      }
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:8889/api/hotel/approve/${id}`, { method: 'PUT' });
      if (res.ok) {
        fetchHotels();
      }
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleUnactive = async (id) => {
    try {
      const res = await fetch(`http://localhost:8889/api/hotel/unactive/${id}`, { method: 'PUT' });
      if (res.ok) {
        fetchHotels();
      }
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleActive = async (id) => {
    try {
      const res = await fetch(`http://localhost:8889/api/hotel/active/${id}`, { method: 'PUT' });
      if (res.ok) {
        fetchHotels();
      }
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <HotelContext.Provider value={{
      properties, setProperties, active, wait, deleted, unactive, loading, fetchHotels,
      showAddModal, setShowAddModal, activeTab, setActiveTab,
      handleAddProperty, handleDelete, handleApprove, handleUnactive, handleActive,
      pendingFilter, setPendingFilter
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotels = () => useContext(HotelContext);
