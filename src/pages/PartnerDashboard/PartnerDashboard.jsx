import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PropertyList from './components/PropertyList';
import StatsGrid from './components/StatsGrid';
import CreateHotel from './components/CreateHotel';
import { HotelProvider, useHotels } from '../../api/HotelContext';
import './partnerDashboard.css';
import PartnerNavbar from '../Partner/Components/PartnerNavbar';
import Sidebar from '../../components/Sidebar';

function DashboardContent() {
  const { showAddModal, handleAddProperty, setShowAddModal } = useHotels();

  return (
    <div className="pd-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PartnerNavbar />
      <div className="pd-layout-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="partner" />
        <div className="pd-main" style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          <Routes>
            <Route path="/" element={<StatsGrid />} />
            <Route path="my-hotels" element={
              <>
                <CreateHotel />
                <PropertyList />
              </>
            } />
            <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>Tính năng đang được phát triển...</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <HotelProvider>
      <DashboardContent />
    </HotelProvider>
  );
}