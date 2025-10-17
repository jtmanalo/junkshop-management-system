// import logo from './logo.svg';
import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
// import useIsMobile from './components/useIsMobile';

// pages
import LoginRegisterPage from './pages/LoginRegisterPage';
import MobileDashboard from './pages/MobileDashboard';
import DesktopRoutes from './pages/AdminDashboard';
import PurchasePage from './pages/PurchasePage';
// import ExpensePage from './pages/ExpensePage';
import SalePage from './pages/SalePage';
import NavBar from './components/NavBar';
// import { Header, MobileHeader } from './components/Header';

function App() {
  // const isMobile = useIsMobile();

  const location = useLocation();
  const hideNavBarRoutes = ['/purchase', '/sale', '/debt', '/expense'];
  const shouldShowNavBar = !hideNavBarRoutes.includes(location.pathname);

  // Map routes to navbar variant
  const mobileNavRoutes = ['/employee-dashboard'];
  const desktopNavRoutes = ['/admin-dashboard'];
  let navBarVariant = 'desktop';
  if (mobileNavRoutes.includes(location.pathname)) {
    navBarVariant = 'mobile';
  } else if (desktopNavRoutes.includes(location.pathname)) {
    navBarVariant = 'desktop';
  }

  return (
    <div className="App" style={{ background: '#f5f6fa', minHeight: '100vh' }}>
      {shouldShowNavBar && <NavBar variant={navBarVariant} />}
      <Routes>
        <Route path="/" element={<LoginRegisterPage />} />
        <Route path="/employee-dashboard" element={<MobileDashboard />} />
        <Route path="/purchases" element={<PurchasePage />} />
        {/* <Route path="/expense" element={<ExpensePage />} /> */}
        <Route path="/sales" element={<SalePage />} />
        <Route path="/admin-dashboard/*" element={<DesktopRoutes />} />

        {/* Fallback for other routes */}
        <Route path="*" element={<div className="p-5 text-center"><h1>404 Not Found</h1><p>Route not recognized.</p></div>} />
      </Routes>
    </div>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
