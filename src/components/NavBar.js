import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../services/AuthContext';
import {
  Container,
  Navbar,
  Button,
  Nav
} from 'react-bootstrap';
import {
  FaHome,
  FaChevronDown,
  FaBars,
  FaUserCog,
  FaKey,
  FaListAlt,
  FaSignOutAlt,
  FaClipboardList,
  FaFileInvoice,
  FaSpinner,
  FaUser,
  FaBuilding
} from 'react-icons/fa';
import { BottomNav } from './NavLink';
// import useIsMobile from './useIsMobile';

function UserProfileDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();
  const { user } = auth;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);
  const menuOptions = [
    {
      label: 'Manage Account',
      icon: FaUserCog,
      onClick: () => { },
    },
    {
      label: 'Change Password',
      icon: FaKey,
      onClick: () => { },
    },
    {
      label: 'Activity Log',
      icon: FaListAlt,
      onClick: () => { },
    },
    {
      label: 'Log out',
      icon: FaSignOutAlt,
      onClick: () => auth.logOut(),
    },
  ];
  // Responsive: track window size with state
  const [isSmallScreen, setIsSmallScreen] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  React.useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const avatarSize = 40;
  const dropdownIconSize = 32;
  const dropdownMenuMinWidth = isSmallScreen ? 48 : 190;
  const dropdownMenuMaxWidth = isSmallScreen ? 64 : 320;
  return (
    <div
      ref={dropdownRef}
      className="d-flex align-items-center justify-content-center position-relative"
      style={{ gap: isSmallScreen ? 0 : 8, minWidth: dropdownMenuMinWidth, maxWidth: dropdownMenuMaxWidth }}
    >
      <img
        src={`https://placehold.co/40x40/dc3545/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`}
        alt="User"
        className="rounded-circle"
        style={{ width: avatarSize, height: avatarSize, marginRight: isSmallScreen ? 0 : 8 }
        }
      />
      < div className="d-none d-md-block" >
        <div className="fw-bold small mb-0 lh-1">{user?.username || 'User'}</div>
        <div className="text-muted small lh-1">{user?.userType || 'Admin'}</div>
      </div >
      <button
        type="button"
        className="btn btn-link p-0 m-0"
        style={{ height: dropdownIconSize, width: dropdownIconSize, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: isSmallScreen ? 0 : 8 }}
        onClick={() => setShowDropdown(v => !v)}
      >
        <FaChevronDown size={20} color="#212529" />
      </button>
      {
        showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: dropdownIconSize + 12,
              right: 0,
              minWidth: dropdownMenuMinWidth,
              maxWidth: dropdownMenuMaxWidth,
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              borderRadius: 12,
              zIndex: 100,
              padding: isSmallScreen ? '8px 0' : '12px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isSmallScreen ? 'center' : 'flex-start',
            }}
          >
            {menuOptions.map((option, idx) => (
              <button
                key={option.label}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: isSmallScreen ? '8px 0' : '10px 18px',
                  textAlign: isSmallScreen ? 'center' : 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isSmallScreen ? 0 : 10,
                  fontSize: isSmallScreen ? 0 : 15,
                  color: idx === 3 ? '#E57373' : '#212529',
                  cursor: 'pointer',
                  justifyContent: isSmallScreen ? 'center' : 'flex-start',
                }}
                onClick={option.onClick}
              >
                <option.icon size={18} color={idx === 3 ? '#E57373' : '#3973F3'} />
                <span className="d-none d-md-inline">{option.label}</span>
              </button>
            ))}
          </div>
        )
      }
    </div >
  );
}

const Icon = ({ icon: IconComponent, className = "" }) => (
  <IconComponent size={20} className={`text-light-500 ${className}`} />
);

function MobileNav() {
  return (
    <>
      <Navbar fixed="bottom" className="bg-white border-top shadow-md">
        <Container className="d-flex justify-content-around">
          <Nav className="w-100 d-flex justify-content-around">
            <BottomNav href="#home" icon={FaHome} label="Home" />
            <BottomNav href="#pricing" icon={FaClipboardList} label="Pricing" />
            <BottomNav href="#logs" icon={FaFileInvoice} label="Logs" />
            <BottomNav href="#ongoing" icon={FaSpinner} label="Ongoing" />
            <BottomNav href="#profile" icon={FaUser} label="Profile" />
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

// function SideNav() {
//   const [activeKey, setActiveKey] = useState('dashboard');
//   const navItems = [
//     {
//       key: 'dashboard',
//       icon: <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>,
//       text: 'Dashboard'
//     },
//     {
//       key: 'products',
//       icon: <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
//       text: 'Products'
//     },
//     {
//       key: 'favorites',
//       icon: <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
//       text: 'Favorites'
//     },
//     {
//       key: 'inbox',
//       icon: <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8a8.5 8.5 0 0 1-7.6 4.7l-2.4 1.5a1 1 0 0 1-1.3-.8l-.5-3.3a8.5 8.5 0 0 1-4.7-7.6l1.5-2.4a1 1 0 0 1-.8-1.3l-3.3-.5a8.38 8.38 0 0 1 3.8-.9h.2a8.5 8.5 0 0 1 7.6 4.7l2.4 1.5a1 1 0 0 1 1.3.8l.5 3.3a8.38 8.38 0 0 1-.9 3.8z" /></svg>,
//       text: 'Inbox'
//     },
//     {
//       key: 'orders',
//       icon: <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
//       text: 'Order Lists'
//     },
//     {
//       key: 'stock',
//       icon: <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>,
//       text: 'Product Stock'
//     }
//   ];

//   // Accept collapsed prop
//   const collapsed = typeof arguments[0] === 'object' && arguments[0] && arguments[0].collapsed;

//   return (
//     <div
//       className="d-flex flex-column align-items-center py-2 px-2"
//       style={{ width: collapsed ? '70px' : '250px', background: '#fff', minHeight: '100vh', borderRight: '1px solid #eee', boxShadow: '0 0 8px rgba(0,0,0,0.03)', transition: 'width 0.2s' }}
//     >
//       {/* Logo */}
//       <div className="mb-2 d-flex justify-content-center align-items-center" style={{ width: '100%', height: 40 }}>
//         <img src="/logo1.jpg" alt="Logo" style={{ width: collapsed ? 40 : '100%', height: 40, objectFit: 'contain', margin: 0, transition: 'width 0.2s' }} />
//       </div>
//       {/* Nav Items */}
//       <div className="w-100">
//         {navItems.map(item => {
//           const isActive = item.key === activeKey;
//           // Clone the icon element and override its stroke color for contrast
//           const iconWithColor = React.cloneElement(
//             item.icon,
//             {
//               stroke: isActive ? '#fff' : '#222',
//               color: isActive ? '#fff' : '#222',
//             }
//           );
//           return (
//             <div
//               key={item.key}
//               className="d-flex mb-2 rounded"
//               style={{
//                 background: isActive ? '#212529' : 'transparent',
//                 color: isActive ? '#fff' : '#222',
//                 padding: collapsed ? '10px 10px' : '10px 18px',
//                 fontWeight: isActive ? 600 : 500,
//                 cursor: 'pointer',
//                 boxShadow: isActive ? '0 2px 8px rgba(57,115,243,0.08)' : 'none',
//                 transition: 'background 0.2s, color 0.2s, padding 0.2s',
//                 justifyContent: collapsed ? 'center' : 'flex-start',
//                 alignItems: 'center',
//                 height: collapsed ? 40 : 'auto',
//               }}
//               onClick={() => setActiveKey(item.key)}
//             >
//               <span
//                 className="d-flex"
//                 style={{
//                   minWidth: 24,
//                   width: collapsed ? 40 : 24,
//                   height: collapsed ? 40 : 'auto',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   marginRight: collapsed ? 0 : 12,
//                 }}
//               >
//                 {iconWithColor}
//               </span>
//               {!collapsed && <span>{item.text}</span>}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
export function SideNav({ activePage, setActivePage, isCollapsed, toggleSidebar }) {
  const auth = useAuth();

  const sidebarWidth = isCollapsed ? '72px' : '260px'; // Width for collapsed/expanded state

  // Menu items structure (using react-icons)
  const menuItems = [
    { name: 'Dashboard', icon: FaHome, key: 'dashboard' },
    { name: 'Analytics', icon: FaClipboardList, key: 'analytics' },
    { name: 'Inventory', icon: FaFileInvoice, key: 'inventory' },
    { name: 'User Management', icon: FaUser, key: 'users' },
    { name: 'Branches', icon: FaBuilding, key: 'branches' },
    { name: 'Pricing', icon: FaSpinner, key: 'pricing' },
    { name: 'Profile Settings', icon: FaUserCog, key: 'settings' },
    { name: 'Help / Tutorial / FAQs', icon: FaListAlt, key: 'help' },
    { name: 'Log out', icon: FaSignOutAlt, key: 'logout', onClick: () => auth.logOut() },
  ];

  return (
    <div
      className="bg-white text-gray-900 shadow-sm flex flex-col"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 1030, // Above the content
      }}
    >
      {/* Logo/Header Section */}
      <div className="flex items-center p-3" style={{ height: '60px' }}>
        <div className="w-10 h-10 flex items-center justify-center rounded-lg">
          <div className="mb-2 d-flex justify-content-center align-items-center" style={{ width: '100%', height: 40 }}>
            <img src={isCollapsed ? "/jmslogo.png" : "/logo1.jpg"} alt="Logo" style={{ width: isCollapsed ? 40 : '100%', height: 40, objectFit: 'contain', margin: 0, transition: 'width 0.2s' }} />
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <Nav className="flex-column flex-grow-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.key}
            onClick={item.onClick || (() => setActivePage(item.key))}
            className={`d-flex items-center p-3 rounded-lg text-decoration-none transition-colors duration-200 ${activePage === item.key ? 'shadow-md' : 'hover:bg-gray-800'}`}
            style={{
              ...(isCollapsed ? { justifyContent: 'center' } : {}),
              background: activePage === item.key ? '#222' : 'transparent',
              color: activePage === item.key ? '#fff' : '#222',
            }}
          >
            <Icon icon={item.icon} style={{ color: activePage === item.key ? '#fff' : '#222' }} />
            {!isCollapsed && <span className="ms-3 font-medium" style={{ color: activePage === item.key ? '#fff' : '#222' }}>{item.name}</span>}
          </Nav.Link>
        ))}


      </Nav>
    </div>
  );
}

export function TopNav({ toggleSidebar, isCollapsed }) {
  return (
    <Navbar expand="lg" className="bg-white shadow-sm border-bottom py-2 ps-3 pe-4" style={{ position: 'fixed', top: 0, left: isCollapsed ? '72px' : '260px', right: 0, zIndex: 1020, transition: 'left 0.3s ease', minHeight: 55, height: 65 }}>
      <div className="d-flex align-items-center w-100" style={{ minHeight: 40, flexWrap: 'nowrap' }}>
        {/* Menu/Collapse Toggle Button */}
        <Button variant="link" onClick={toggleSidebar} className="text-dark p-0" style={{ marginRight: 12, minWidth: 32 }}>
          <FaBars size={20} color="#212529" />
        </Button>

        {/* Search Input */}
        {/* <Form className="d-flex align-items-center flex-grow-1" style={{ marginLeft: 8, marginRight: 16, maxWidth: '600px', width: '100%' }}>
        <InputGroup className="w-100">
          <InputGroup.Text className="bg-light border-end-0 rounded-start-pill border-gray-300"> */}
        {/* <Icon icon={Search} className="text-gray-500" /> */}
        {/* <svg width="16" height="16" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </InputGroup.Text>
          <FormControl
            type="search"
            placeholder="Search"
            className="border-start-0 rounded-end-pill border-gray-300"
            style={{ minWidth: '100px' }}
          />
        </InputGroup>
      </Form> */}

        {/* Spacer to push right section to the end */}
        <div className="flex-grow-1" />
        {/* Right Side Icons and User Profile */}
        <div className="d-flex align-items-center" style={{ gap: 10, marginRight: 8, flexWrap: 'nowrap', minWidth: 0 }}>
          {/* Notification Icon */}
          {/* <div style={{ position: 'relative', minWidth: 32, flexShrink: 0 }}>
            <Nav.Link href="#" className="position-relative text-gray-600" style={{ marginRight: 8, minWidth: 32 }}>
              <FaBell size={20} color="#212529" />
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#f44336', color: '#fff', borderRadius: '50%', fontSize: 10, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>0</span>
            </Nav.Link>
          </div> */}
          {/* User Profile Dropdown */}
          <div style={{ minWidth: 32, flexShrink: 0 }}>
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .navbar {
            min-height: 55px !important;
            height: 55px !important;
          }
          .navbar .d-flex.align-items-center.w-100 {
            min-height: 40px !important;
            flex-wrap: nowrap !important;
          }
          .navbar .d-flex.align-items-center {
            gap: 4px !important;
            margin-right: 2px !important;
            flex-wrap: nowrap !important;
          }
          .navbar .nav-link {
            margin-right: 2px !important;
            min-width: 28px !important;
          }
        }
      `}</style>
    </Navbar>
  );
}

const NavBar = ({ variant = 'desktop' }) => {
  if (variant === 'mobile') {
    return <MobileNav />;
  }
};

export default NavBar;