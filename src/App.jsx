import React from 'react'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/login';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import Partner from './pages/Partner/parter';
import PartnerLogin from './pages/Partner/Components/PartnerLogin';
import PartnerRegister from './pages/Partner/Components/PartnerRegister';
import PartnerDashboard from './pages/PartnerDashboard/PartnerDashboard';
import SearchHotel from './pages/SearchHotel/SearchHotel';
import DetalHotel from './pages/DetailHotel/DetailHotel';
import BookingDetail from './components/BookingDetail';
import Payment from './components/Payment';
import Profile from './pages/Profile/Profile';
import MyBookings from './pages/MyBookings/MyBookings';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import Wishlist from './components/Wishlist';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import MyMessages from './pages/MyMessages/MyMessages';
import { App as AntdApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

const AppContent = () => {
  const location = useLocation();
  const isOwnerPath = location.pathname.includes("owner");
  const isPartnerPath = location.pathname.startsWith("/partner") || location.pathname.includes("-partner");
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div>
      {!isOwnerPath && !isPartnerPath && !isAdminPath && <Navbar />}
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login-partner' element={<Partner />} />
          <Route path='/register-partner' element={<Partner />} />
          <Route path='/admin-dashboard/*' element={<Admin />} />
          <Route path='/partner-dashboard/*' element={<PartnerDashboard />} />
          <Route path='/partner' element={<Partner />} />
          <Route path='/hotels' element={<SearchHotel />} />
          <Route path='/hotels/:id' element={<DetalHotel />} />
          <Route path='/booking' element={<BookingDetail />} />
          <Route path='/payment' element={<Payment />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path='/my-wishlist' element={<Wishlist />} />
          <Route path='/my-messages' element={<MyMessages />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
        </Routes>
      </div>
      {!isOwnerPath && !isPartnerPath && !isAdminPath && <Chatbot />}
    </div>
  );
};

const App = () => (
  <ConfigProvider locale={viVN}>
    <AntdApp
      message={{ maxCount: 3, duration: 3 }}
    >
      <AppContent />
    </AntdApp>
  </ConfigProvider>
);

export default App
