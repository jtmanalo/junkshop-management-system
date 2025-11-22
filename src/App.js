// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthProvider from './services/AuthContext';
import PrivateRoute from './services/PrivateRoute';

// pages
import LoginRegisterPage from './pages/LoginRegisterPage';
import MobileDashboard from './pages/MobileDashboard';
import DesktopRoutes from './pages/AdminDashboard';
import PurchasePage from './pages/PurchasePage';
import ExpensePage from './pages/ExpensePage';
import SalePage from './pages/SalePage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes without shared layout */}
          <Route path="/" element={<LoginRegisterPage />} />

          {/* Routes with mobile layout */}
          <Route element={<PrivateRoute />}>
            <Route
              path="/employee-dashboard"
              element={
                <Layout variant='mobile'>
                  <MobileDashboard />
                </Layout>
              }
            />
            <Route
              path="/purchases"
              element={
                <Layout variant='mobile'>
                  <PurchasePage />
                </Layout>
              }
            />
            <Route
              path="/expenses"
              element={
                <Layout variant='mobile'>
                  <ExpensePage />
                </Layout>
              }
            />
            <Route
              path="/sales"
              element={
                <Layout variant='mobile'>
                  <SalePage />
                </Layout>
              }
            />
            {/* Routes with desktop layout */}
            <Route
              path="/admin-dashboard/*"
              element={
                <Layout variant='desktop'>
                  <DesktopRoutes />
                </Layout>
              }
            />
          </Route>
          {/* Fallback for other routes */}
          <Route path="*" element={<div className="p-5 text-center"><h1>404 Not Found</h1><p>Route not recognized.</p></div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;