// import logo from './logo.svg';
import './App.css';
import React from 'react';
import { 
  BrowserRouter as Router,
  Routes, 
  Route 
} from 'react-router-dom';

// pages
import LoginRegisterPage from './pages/LoginRegisterPage';
import MobileDashboard from './pages/MobileDashboard';
import MobileNav from './components/MobileNav';
import DesktopNav from './components/DesktopNav';

function App() {
  return (
    <div className="App">
      {/* <MobileNav /> */}
      <DesktopNav />
      <Routes>
        <Route path="/" element={<LoginRegisterPage />} />
        <Route path="mobile-dashboard" element={<MobileDashboard />} />
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
