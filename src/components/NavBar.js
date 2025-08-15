import { useState, useEffect } from 'react';
import DesktopNav from './DesktopNav'; 
import MobileNav from './MobileNav';   

const isMobileDevice = (breakpoint = 768) => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < breakpoint;
    return isMobileUA || isSmallScreen;
};

const Dashboard = () => {
  const MOBILE_BREAKPOINT = 768;
  const [isMobile, setIsMobile] = useState(isMobileDevice(MOBILE_BREAKPOINT));

  // Effect to handle window resize events
  useEffect(() => {
    const handleDeviceChange = () => {
      setIsMobile(isMobileDevice(MOBILE_BREAKPOINT));
    };

    window.addEventListener('resize', handleDeviceChange);

    return () => {
      window.removeEventListener('resize', handleDeviceChange);
    };
  }, []);

  return isMobile ? <MobileNav /> : <DesktopNav />;
};

export default Dashboard;