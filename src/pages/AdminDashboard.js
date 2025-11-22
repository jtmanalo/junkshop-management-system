import React, { useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { TopNav, SideNav } from '../components/NavBar';
import SettingsPage from './SettingsPage';
import AnalyticsPage from './AnalyticsPage';
import EmployeesPage from './EmployeesPage';
import BranchPage from './BranchPage';
import InventoryPage from './InventoryPage';
import PricingPage from './PricingPage';
import HelpPage from './HelpPage';
import { useAuth } from '../services/AuthContext';
import { MetricCard, MetricChartCard } from '../components/Card';
import { FaChartLine, FaShoppingCart, FaMoneyBillWave, FaReceipt, FaWallet } from 'react-icons/fa';

function AdminDashboard() {
    // Example Net Income chart data for current month
    const netIncomeChartData = {
        labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()), // Days 1-31
        datasets: [
            {
                label: 'Net Income (₱)',
                data: [1200, 1500, 1100, 1800, 1700, 1600, 2000, 2100, 1900, 2200, 2300, 2100, 2000, 2500, 2400, 2300, 2200, 2100, 2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100, 1000, 900, 800],
                fill: true,
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                borderColor: '#2979FF',
                pointBackgroundColor: '#2979FF',
                pointBorderColor: '#fff',
                pointRadius: 4,
                tension: 0.3,
            },
        ],
    };
    const netIncomeChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                grid: { display: false },
                title: { display: true, text: 'Day of Month' },
                ticks: { color: '#B0B7C3', font: { size: 14 } },
            },
            y: {
                grid: { color: '#F0F0F0' },
                title: { display: true, text: 'Net Income (₱)' },
                min: 0,
                ticks: { color: '#B0B7C3', font: { size: 14 } },
            },
        },
    };
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = ['2024', '2025'];
    const [selectedMonth, setSelectedMonth] = useState('October');
    const [selectedYear, setSelectedYear] = useState('2025');
    const handleMonthChange = (e) => setSelectedMonth(e.target.value);
    const handleYearChange = (e) => setSelectedYear(e.target.value);
    // Example: Fetch metric data from backend/database
    // Replace with your actual data fetching logic (API, Redux, etc.)
    const [metrics, setMetrics] = useState({
        revenue: {
            value: '₱89,000',
            subtitle: '4.3% Down from yesterday',
            trend: '-4.3%',
        },
        totalPurchase: {
            value: '10,293',
            subtitle: '1.3% Up from past week',
            trend: '+1.3%',
        },
        grossProfit: {
            value: '₱40,689',
            subtitle: '8.5% Up from yesterday',
            trend: '+8.5%',
        },
        expenses: {
            value: '₱12,400',
            subtitle: '2.1% Up from yesterday',
            trend: '+2.1%',
        },
        netIncome: {
            value: '₱28,289',
            subtitle: '1.8% Up from yesterday',
            trend: '+1.8%',
        },
    });

    // Example: useEffect(() => { fetch('/api/metrics').then(...).then(data => setMetrics(data)); }, []);

    const metricCards = [
        {
            title: 'Revenue',
            value: metrics.revenue.value,
            icon: <FaChartLine size={24} color="#4CAF50" />,
            subtitle: metrics.revenue.subtitle,
            trend: metrics.revenue.trend,
            trendColor: '#E57373',
            iconBg: '#E8F5E9',
        },
        {
            title: 'Total Purchase',
            value: metrics.totalPurchase.value,
            icon: <FaShoppingCart size={24} color="#FFC107" />,
            subtitle: metrics.totalPurchase.subtitle,
            trend: metrics.totalPurchase.trend,
            trendColor: '#4CAF50',
            iconBg: '#FFF8E1',
        },
        {
            title: 'Gross Profit',
            value: metrics.grossProfit.value,
            icon: <FaMoneyBillWave size={24} color="#00BCD4" />,
            subtitle: metrics.grossProfit.subtitle,
            trend: metrics.grossProfit.trend,
            trendColor: '#4CAF50',
            iconBg: '#E0F7FA',
        },
        {
            title: 'Expenses',
            value: metrics.expenses.value,
            icon: <FaReceipt size={24} color="#FF7043" />,
            subtitle: metrics.expenses.subtitle,
            trend: metrics.expenses.trend,
            trendColor: '#4CAF50',
            iconBg: '#FFEBEE',
        },
        {
            title: 'Net Income',
            value: metrics.netIncome.value,
            icon: <FaWallet size={24} color="#8BC34A" />,
            subtitle: metrics.netIncome.subtitle,
            trend: metrics.netIncome.trend,
            trendColor: '#4CAF50',
            iconBg: '#F1F8E9',
        },
    ];

    return (
        <>
            <h1 className="mb-4">Dashboard</h1>
            <div className="d-flex flex-wrap gap-4 mb-4">
                {metricCards.map((props, idx) => (
                    <MetricCard key={props.title} {...props} />
                ))}
            </div>
            {/* Net Income Chart Card Example */}
            <div className="mt-4">
                <MetricChartCard
                    title="Net Income"
                    chartData={netIncomeChartData}
                    chartOptions={netIncomeChartOptions}
                    months={months}
                    years={years}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
                />
            </div>
        </>
    );
}

function AdminLayout({ activePage, setActivePage, username, children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const mainContentMarginLeft = isCollapsed ? '72px' : '260px';

    return (
        <div className="App d-flex min-vh-100 bg-light">

            {/* Sidebar (Fixed) */}
            <SideNav
                activePage={activePage}
                setActivePage={setActivePage}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content Area */}
            <div
                className="flex-grow-1"
                style={{
                    marginLeft: mainContentMarginLeft,
                    transition: 'margin-left 0.3s ease',
                    paddingTop: '60px' // Offset for the fixed Navbar
                }}
            >
                <TopNav toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} username={username} userType="Owner" />

                <Container fluid className="py-4 px-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
                    {children}
                </Container>
            </div>
        </div>
    );
}

export default function DesktopRoutes() {
    const location = useLocation();
    const navigate = useNavigate();
    // const username = 'mtmanalo'
    // localStorage.setItem('username', username);
    // const username = localStorage.getItem('username');
    const { user } = useAuth();
    console.log('User from context:', user);


    // Map path to sidebar key
    const pathToKey = {
        [`/admin-dashboard/${user?.username}/analytics`]: 'analytics',
        [`/admin-dashboard/${user?.username}/inventory`]: 'inventory',
        [`/admin-dashboard/${user?.username}/employees`]: 'employees',
        [`/admin-dashboard/${user?.username}/branches`]: 'branches',
        [`/admin-dashboard/${user?.username}/pricing`]: 'pricing',
        [`/admin-dashboard/${user?.username}/settings`]: 'settings',
        [`/admin-dashboard/${user?.username}/help`]: 'help',
        [`/admin-dashboard/${user?.username}`]: 'dashboard'
    };

    const currentPath = location.pathname;

    // Map key to full path for navigation
    const keyToPath = {
        analytics: `/admin-dashboard/${user?.username}/analytics`,
        inventory: `/admin-dashboard/${user?.username}/inventory`,
        employees: `/admin-dashboard/${user?.username}/employees`,
        branches: `/admin-dashboard/${user?.username}/branches`,
        pricing: `/admin-dashboard/${user?.username}/pricing`,
        settings: `/admin-dashboard/${user?.username}/settings`,
        help: `/admin-dashboard/${user?.username}/help`,
        dashboard: `/admin-dashboard/${user?.username}`,
    };

    const activePage = pathToKey[currentPath] || 'dashboard';
    const setActivePage = (key) => {
        navigate(keyToPath[key] || `/admin-dashboard/${user?.username}`);
    };

    return (
        <AdminLayout activePage={activePage} setActivePage={setActivePage} username={user?.username}>
            <Routes>
                <Route path=":username/analytics" element={<AnalyticsPage />} />
                <Route path=":username/inventory" element={<InventoryPage />} />
                <Route path=":username/employees" element={<EmployeesPage />} />
                <Route path=":username/branches" element={<BranchPage />} />
                <Route path=":username/pricing" element={<PricingPage />} />
                <Route path=":username/settings" element={<SettingsPage />} />
                <Route path=":username/help" element={<HelpPage />} />
                <Route path=":username" element={<AdminDashboard />} />
                <Route path="*" element={
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h1 className="mb-4">Not Found</h1>
                            <p>Page not found.</p>
                        </Card.Body>
                    </Card>
                } />
            </Routes>
        </AdminLayout>
    );
}
