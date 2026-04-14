import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/login';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import Partner from './pages/Partner/parter';
import PartnerLogin from './pages/Partner/Components/PartnerLogin';
import PartnerRegister from './pages/Partner/Components/PartnerRegister';
import PartnerDashboard from './pages/PartnerDashboard/PartnerDashboard';

const App = () => {

  const location = useLocation();
  const isOwnerPath = location.pathname.includes("owner");
  const isPartnerPath = location.pathname.startsWith("/partner") || location.pathname.includes("-partner");

  return (
    <div>
      {!isOwnerPath && !isPartnerPath && <Navbar />}
      <div className='min-h-[70vh]'>
        <Routes>  
          <Route path='/' element={<Home />} />   
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login-partner' element={<Partner />} />
          <Route path='/register-partner' element={<Partner />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/partner-dashboard/*' element={<PartnerDashboard />} />
          <Route path='/partner' element={<Partner />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
