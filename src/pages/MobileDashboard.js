import { Container, Modal, Form, Card, Button } from 'react-bootstrap';
import { useNavigate, useLocation, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaChartLine, FaFileInvoiceDollar, FaHandHoldingUsd, FaUserTie, FaBoxOpen, FaUserFriends } from 'react-icons/fa';
import { ActiveTabCard, ButtonsCard } from '../components/Card';
import CustomButton from '../components/CustomButton';
import { MobileHeader } from '../components/Header';
import { StartShiftModal, EndShiftConfirmModal } from '../components/Modal';
import { useAuth } from '../services/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { MobileNav } from '../components/NavBar';
import SettingsPage from './SettingsPage';
import OngoingPage from './OngoingPage';
import LogsPage from './LogsPage';
import BuyersPage from './PricingPage';
import SellerPage from './SellerPage';
import ItemsPage from './ItemsPage';
import PurchasePage from './PurchasePage';
import ExpensePage from './ExpensePage';
import SalePage from './SalePage';
import axios from 'axios';


function SetBranchModal({ show, branchOptions, onSetBranch }) {
  const [selectedBranch, setSelectedBranch] = useState('');

  const handleSetBranch = () => {
    if (selectedBranch) {
      onSetBranch(selectedBranch);
    } else {
      alert('Please select a branch location.');
    }
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Select Branch Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Branch Location</Form.Label>
            <Form.Control
              as="select"
              value={selectedBranch?.display || ''}
              onChange={(e) => setSelectedBranch(branchOptions.find(branch => branch.display === e.target.value))}
            >
              <option value="">Select a branch</option>
              {branchOptions.map((branch, index) => (
                <option key={index} value={branch.display}>{branch.display}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSetBranch}>
          Set Location
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function MobileDashboard() {
  const { user, token } = useAuth();
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Balance');
  const [balance, setBalance] = useState(0); // Start at 0
  // const [expense, setExpense] = useState(0);
  // const [sale, setSale] = useState(0);
  // const [purchase, setPurchase] = useState(0);
  const [shiftStarted, setShiftStarted] = useState(false); // false = not started
  const [showModal, setShowModal] = useState(false);
  const [branch, setBranch] = useState('');
  const [startingCash, setStartingCash] = useState('1000.00');
  const [branchOptions, setBranchOptions] = useState([]); // State to store branch options
  const [showSetBranchModal, setShowSetBranchModal] = useState(true);
  const [shiftId, setShiftId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Example: update balance from data (replace with real data logic)
  // useEffect(() => {
  //   fetchBalance().then(val => setBalance(val));
  // }, []);

  const navigate = useNavigate();

  const handleSwitchLocation = () => {
    if (shiftStarted) {
      alert('You should end your shift before switching location.');
    } else {
      setShowSetBranchModal(true);
    }
  };

  const handleSellerPageClick = () => {
    navigate('/employee-dashboard/sellers');
  };

  const fetchActiveShift = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = response.data;
      // console.log('Fetched active shift data:', data);
      if (data && data.length > 0) {
        const activeShift = data[0];
        // console.log('Active shift found:', activeShift);
        setShiftId(activeShift.ShiftID); // Set the active shift ID
        setBranch({
          display: `${activeShift.Name} - ${activeShift.Location}`,
          id: activeShift.BranchID
        }); // Set the branch details
        setShiftStarted(true); // Mark the shift as started
      } else {
        setShiftStarted(false); // No active shift
      }
      return data;
    } catch (error) {
      console.error('Error fetching active shift:', error.response?.data || error.message);
      return null;
    }
  };

  useEffect(() => {
    const initializeShift = async () => {
      setLoading(true); // Start loading
      const response = await fetchActiveShift(); // Fetch active shift first

      if (response && response.length > 0) {
        setShowSetBranchModal(false);
      } else {
        setShowSetBranchModal(true);
      }
      setLoading(false); // Stop loading
    };

    initializeShift();
  }, []);

  // fetch branches where owner has usertype 'owner'
  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches-with-owner-usertype`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = response.data;
      // console.log('Fetched branches with owner usertype:', data);
      const branches = data.map(branch => ({
        display: `${branch.Name} - ${branch.Location}`,
        id: branch.BranchID
      }));
      // console.log('Extracted branch names and locations:', branches);
      setBranchOptions(branches); // Save to state
    } catch (error) {
      console.error('Error fetching branches with owner usertype:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSetBranch = (branch) => {
    setBranch(branch); // Save the full branch object to state
    // console.log('Branch location set to:', branch);
    setShowSetBranchModal(false);
  };

  // Create shift function
  const createShift = async (branchId, userId, initialCash, token) => {
    try {
      const payload = {
        branchId,
        userId,
        initialCash
      };
      // console.log('Creating shift with payload:', payload);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/shifts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // console.log('Shift created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error.response?.data || error.message);
      throw error;
    }
  };

  const endShift = async (shiftId, finalCash, token) => {
    try {
      const payload = {
        shiftId,
        finalCash
      };
      // console.log('Ending shift with payload:', payload);

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/shifts/${shiftId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // console.log('Shift ended successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error ending shift:', error.response?.data || error.message);
      throw error;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SetBranchModal
        show={showSetBranchModal}
        branchOptions={branchOptions}
        onSetBranch={handleSetBranch}
      />
      <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: 'transparent' }}>
        {/* <MobileHeader
            nickname={user?.username}
            userType={user?.userType}
            handleSwitchLocation={handleSwitchLocation}
          /> */}
        {/* <div style={{ padding: '1rem', textAlign: 'center' }}>
          <div>
            <strong>Branch:</strong> {branch?.display}
          </div>
        </div> */}
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'transparent', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            {['Balance', 'Purchase', 'Expense', 'Sale'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  background: activeTab === tab ? '#232323' : '#fff',
                  color: activeTab === tab ? 'white' : '#232323',
                  border: '0.5px solid #232323',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem',
                  borderRadius: 0,
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  fontSize: '1rem',
                  padding: '0.75rem 0',
                  boxShadow: 'none',
                  borderBottom: 'none',
                  transition: 'background 0.2s, color 0.2s',
                  zIndex: activeTab === tab ? 2 : 1,
                  position: 'relative',
                  marginBottom: 0,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'Balance' && (
            <ActiveTabCard
              title="AVAILABLE BALANCE"
              value={`₱ ${(shiftStarted ? balance : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
          {activeTab === 'Purchase' && (
            <ActiveTabCard
              title="SPENT ON PURCHASES ( - )"
              value={`₱ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
          {activeTab === 'Expense' && (
            <ActiveTabCard
              title="SPENT ON EXPENSES ( - )"
              value={`₱ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
          {activeTab === 'Sale' && (
            <ActiveTabCard
              title="EARNED FROM SALES ( + )"
              value={`₱ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
        </div>
      </div>
      <Container fluid className="py-4" style={{ maxWidth: 480 }}>
        <div>
          <div style={{ height: 10 }} />
          <ButtonsCard
            header='Manage'
            actions={[
              {
                label: 'Loans',
                icon: <FaHandHoldingUsd size={28} color="#232323" />, // Seller icon
                onClick: () => navigate(`/employee-dashboard/${user?.username}/loans`),
              },
              {
                label: 'Buyer',
                icon: <FaUserTie size={28} color="#232323" />, // Buyer icon
                onClick: () => navigate(`/employee-dashboard/${user?.username}/buyers`),
              },
              {
                label: 'Item',
                icon: <FaBoxOpen size={28} color="#232323" />, // Item icon
                onClick: () => navigate(`/employee-dashboard/${user?.username}/items`),
              },
            ]}
          />
          <div style={{ height: 10 }} />
          {shiftStarted ? (
            <>
              <ButtonsCard
                header='Record'
                actions={[
                  {
                    label: 'Purchase',
                    icon: <FaShoppingCart size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/purchases`),
                  },
                  {
                    label: 'Expense',
                    icon: <FaMoneyBillWave size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/expenses`),
                  },
                  {
                    label: 'Sale',
                    icon: <FaChartLine size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/sales`),
                  },
                  {
                    label: 'Debt',
                    icon: <FaFileInvoiceDollar size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/debts`),
                  },
                ]}
              />
              <div style={{ height: 10 }} />
              <div align="center">
                <CustomButton
                  text="End Shift"
                  color="danger"
                  size="md"
                  className="fw-bold px-4 py-2 end-shift-btn"
                  style={{ background: '#fff', color: '#dc3545', borderColor: '#dc3545', minWidth: 160 }}
                  onClick={() => setShowEndShiftModal(true)}
                />
              </div>
              <EndShiftConfirmModal
                show={showEndShiftModal}
                onCancel={() => setShowEndShiftModal(false)}
                onConfirm={async () => {
                  try {
                    const finalCash = balance;

                    await endShift(shiftId, finalCash, token);

                    setShiftStarted(false);
                    setShowEndShiftModal(false);
                    alert('Shift ended successfully.');
                  } catch (error) {
                    alert('Error ending shift. Please try again.');
                  }
                }}
              />


            </>
          ) : (
            <>
              <Card className="shadow-sm text-center" style={{ borderRadius: '1rem', border: 'none', background: '#fff', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="none" viewBox="0 0 24 24" stroke="#343a40" strokeWidth="2" style={{ marginBottom: '1rem' }}>
                    <circle cx="12" cy="12" r="10" stroke="#232323" strokeWidth="2" fill="none" />
                    <line x1="12" y1="7" x2="12" y2="12" stroke="#232323" strokeWidth="2" />
                    <line x1="12" y1="12" x2="15" y2="15" stroke="#232323" strokeWidth="2" />
                  </svg>
                  <div style={{ fontFamily: 'inherit', fontSize: '1.5rem', color: '#232323', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Shift not yet started
                  </div>
                  <div style={{ fontFamily: 'inherit', fontSize: '1.2rem', color: '#232323', fontWeight: 400 }}>
                    Start shift to record transactions
                  </div>
                </Card.Body>
              </Card>
              <div style={{ height: 10 }} />
              <div align="center">
                <CustomButton
                  text="Start Shift"
                  color="primary"
                  variant="outline-primary"
                  size="md"
                  className="fw-bold px-4 py-2 start-shift-btn"
                  style={{ background: '#fff', color: '#007bff', borderColor: '#007bff', minWidth: 160 }}
                  onClick={() => setShowModal(true)}
                />
              </div>

              <StartShiftModal
                show={showModal}
                onClose={() => setShowModal(false)}
                startingCash={startingCash}
                setStartingCash={setStartingCash}
                branch={branch}
                setBranch={setBranch}
                branchOptions={branchOptions}
                onSubmit={async () => {
                  try {
                    // Create shift via API
                    const branchId = branch.id;
                    const userId = user?.userID;
                    const initialCash = Number(startingCash);

                    const shiftData = await createShift(branchId, userId, initialCash, token);
                    setShiftId(shiftData.id);

                    setBalance(initialCash);
                    setShiftStarted(true);
                    setShowModal(false);
                  } catch (error) {
                    alert('Error starting shift. Please try again.');
                  }
                }}
              />
            </>
          )}
        </div>
      </Container>
    </>
  );
}

function MobileLayout({ activePage, setActivePage, username, userType, children }) {
  return (
    <div className="App d-flex min-vh-100 bg-light">

      {/* Sidebar (Fixed) */}
      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content Area */}
      <div
        className="flex-grow-1"
        style={{
          transition: 'margin-left 0.3s ease'
        }}
      >
        <MobileHeader nickname={username} userType={userType} />


        <Container fluid className="py-4 px-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </Container>
      </div>
    </div>
  );
}

export default function MobileRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('User object in MobileRoutes:', user);

  const pathToKey = {
    [`/employee-dashboard/${user?.username}/pricelist`]: 'pricelist',
    [`/employee-dashboard/${user?.username}/logs`]: 'logs',
    [`/employee-dashboard/${user?.username}/ongoing`]: 'ongoing',
    [`/employee-dashboard/${user?.username}/profile`]: 'profile',
    [`/employee-dashboard/${user?.username}`]: 'dashboard'
  };

  const currentPath = location.pathname;

  const keyToPath = {
    pricelist: `/employee-dashboard/${user?.username}/pricelist`,
    logs: `/employee-dashboard/${user?.username}/logs`,
    ongoing: `/employee-dashboard/${user?.username}/ongoing`,
    profile: `/employee-dashboard/${user?.username}/profile`,
    dashboard: `/employee-dashboard/${user?.username}`,
  };

  const activePage = pathToKey[currentPath] || 'dashboard';
  const setActivePage = (key) => {
    navigate(keyToPath[key] || `/employee-dashboard/${user?.username}`);
  };

  return (
    <MobileLayout activePage={activePage} setActivePage={setActivePage} username={user?.username} userType={user?.userType}>
      <Routes>
        {/* BottomNav */}
        <Route path=":username/pricelist" element={<ItemsPage />} />
        <Route path=":username/logs" element={<LogsPage />} />
        <Route path=":username/ongoing" element={<OngoingPage />} />
        <Route path=":username/profile" element={<SettingsPage />} />
        {/* Manage */}
        <Route path=":username/loans" element={<SellerPage />} />
        <Route path=":username/buyers" element={<BuyersPage />} />
        <Route path=":username/items" element={<ItemsPage />} />
        {/* Record */}
        <Route path=":username/purchases" element={<PurchasePage />} />
        <Route path=":username/expenses" element={<ExpensePage />} />
        <Route path=":username/sales" element={<SalePage />} />
        <Route path=":username/debts" element={<div>Debts Page</div>} />
        {/* Dashboard */}
        <Route path=":username" element={<MobileDashboard />} />
        <Route path="*" element={
          <Card className="shadow-sm">
            <Card.Body>
              <h1 className="mb-4">Not Found</h1>
              <p>Page not found.</p>
            </Card.Body>
          </Card>
        } />
      </Routes>
    </MobileLayout>
  );
}
