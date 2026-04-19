import React from "react";
import PartnerNavbar from "../Partner/Components/PartnerNavbar";
import Sidebar from "../../components/Sidebar";
import PropertyList from "../PartnerDashboard/components/PropertyList";
import { HotelProvider } from "../../api/HotelContext";
import { Routes, Route } from "react-router-dom";
import '../PartnerDashboard/partnerDashboard.css';

function DashboardAdmin() {
    return (
        <div className="pd-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <PartnerNavbar />
            <div className="pd-layout-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar role="admin" />
                <div className="pd-main" style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
                    <Routes>
                        <Route path="hotels" element={<PropertyList />} />
                        {/* <Route path="*" element={<PropertyList />} /> */}
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default function Admin() {
  return (
    <HotelProvider>
      <DashboardAdmin />
    </HotelProvider>
  );
}