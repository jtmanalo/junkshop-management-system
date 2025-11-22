import { Container } from 'react-bootstrap';
import { MobileHeader } from '../components/Header';
import { FaShoppingCart, FaMoneyBillWave, FaChartLine, FaFileInvoiceDollar, FaUser, FaUserTie, FaBoxOpen, FaUserFriends } from 'react-icons/fa';
import { Card } from 'react-bootstrap';
import { ActiveTabCard, ButtonsCard } from '../components/Card';
import CustomButton from '../components/CustomButton';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StartShiftModal, DeleteConfirmModal } from '../components/Modal';

function MobileDashboard() {
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Balance');
  const [balance, setBalance] = useState(0); // Start at 0
  // const [expense, setExpense] = useState(0);
  // const [sale, setSale] = useState(0);
  // const [purchase, setPurchase] = useState(0);
  const [shiftStarted, setShiftStarted] = useState(false); // false = not started
  const [showModal, setShowModal] = useState(false);
  const [branch, setBranch] = useState('Alaminos');
  const [startingCash, setStartingCash] = useState('1000.00');

  // Example: update balance from data (replace with real data logic)
  // useEffect(() => {
  //   fetchBalance().then(val => setBalance(val));
  // }, []);

  const navigate = useNavigate();

  const handlePurchaseClick = () => {
    navigate('/purchases');
  };

  // const handleExpenseClick = () => {
  //   navigate('/expense');
  // }

  const handleSaleClick = () => {
    navigate('/sale');
  };

  const branchOptions = [
    "Alaminos",
    "Tiaong"
  ];

  return (
    <>
      <Container fluid className="p-0 d-flex flex-column min-vh-100" style={{ position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: '#fff' }}>
          <MobileHeader nickname="user" />
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
                branch="ALAMINOS"
              />
            )}
            {activeTab === 'Purchase' && (
              <ActiveTabCard
                title="SPENT ON PURCHASES ( - )"
                value={`₱ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color="#232323"
                textColor="white"
                branch="ALAMINOS"
              />
            )}
            {activeTab === 'Expense' && (
              <ActiveTabCard
                title="SPENT ON EXPENSES ( - )"
                value={`₱ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color="#232323"
                textColor="white"
                branch="ALAMINOS"
              />
            )}
            {activeTab === 'Sale' && (
              <ActiveTabCard
                title="EARNED FROM SALES ( + )"
                value={`₱ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color="#232323"
                textColor="white"
                branch="ALAMINOS"
              />
            )}
          </div>
        </div>
        <Container fluid className="py-4" style={{ maxWidth: 480 }}>
          <div>
            <ButtonsCard
              header='Manage'
              actions={[
                {
                  label: 'Seller',
                  icon: <FaUserTie size={28} color="#232323" />, // Seller icon
                  onClick: handlePurchaseClick,
                },
                {
                  label: 'Buyer',
                  icon: <FaUser size={28} color="#232323" />, // Buyer icon
                  onClick: undefined,
                },
                {
                  label: 'Employee',
                  icon: <FaUserFriends size={28} color="#232323" />, // Employee icon
                  onClick: handleSaleClick,
                },
                {
                  label: 'Item',
                  icon: <FaBoxOpen size={28} color="#232323" />, // Item icon
                  onClick: undefined,
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
                      onClick: handlePurchaseClick,
                    },
                    {
                      label: 'Expense',
                      icon: <FaMoneyBillWave size={28} color="#232323" />,
                      onClick: undefined,
                    },
                    {
                      label: 'Sale',
                      icon: <FaChartLine size={28} color="#232323" />,
                      onClick: handleSaleClick,
                    },
                    {
                      label: 'Debt',
                      icon: <FaFileInvoiceDollar size={28} color="#232323" />,
                      onClick: undefined,
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
                <DeleteConfirmModal
                  show={showEndShiftModal}
                  onCancel={() => setShowEndShiftModal(false)}
                  onConfirm={() => {
                    setShiftStarted(false);
                    setShowEndShiftModal(false);
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
                  onSubmit={() => {
                    setBalance(Number(startingCash));
                    setShiftStarted(true);
                    setShowModal(false);
                  }}
                />
              </>
            )}
          </div>
        </Container>
      </Container >
    </>
  );
}

export default MobileDashboard;
