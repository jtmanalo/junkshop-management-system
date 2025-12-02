import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, InputGroup, Modal, Table } from 'react-bootstrap';
import { FaPlus, FaTrash, FaMinus, FaChevronLeft } from 'react-icons/fa';
import { BackHeader } from '../components/Header';
import { DeleteConfirmModal } from '../components/Modal';
import { useDashboard } from '../services/DashboardContext';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

function PurchasePage() {
    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIdx, setDeleteIdx] = useState(null);
    const { actualBranchId, shiftId, fetchActiveShift, branchName, branchLocation } = useDashboard();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('Actual Branch ID:', actualBranchId);
        console.log('Shift ID:', shiftId);
    }, [actualBranchId, shiftId, fetchActiveShift]);

    // Show modal when trash is clicked
    const handleTrashClick = (idx) => {
        setDeleteIdx(idx);
        setShowDeleteModal(true);
    };

    // Confirm deletion
    const confirmRemoveItem = () => {
        if (deleteIdx !== null) {
            setItems(items.filter((_, i) => i !== deleteIdx));
            setDeleteIdx(null);
        }
        setShowDeleteModal(false);
    };

    // Cancel deletion
    const cancelRemoveItem = () => {
        setDeleteIdx(null);
        setShowDeleteModal(false);
    };
    const [showRowRemove, setShowRowRemove] = useState(false);
    const [seller, setSeller] = useState('');
    const [type, setType] = useState('');

    const sellerOptions = [
    ];

    const typeOptions = [
        'Regular',
        'Extra'
    ];

    const [items, setItems] = useState([
        { name: '', quantity: '', pricing: '', subtotal: '' },
    ]);
    const [allSellers, setAllSellers] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [pendingTransactions, setPendingTransactions] = useState([]);

    const fetchSellers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sellers`);
            setAllSellers(response.data);
            // console.log('Fetched sellers:', response.data);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items/branch/${actualBranchId}`);
            setAllItems(response.data);
            console.log('Fetched items:', response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        if (type === 'Regular') {
            fetchSellers();
        }
        fetchItems();
    }, [type]);

    useEffect(() => {
        if (actualBranchId && shiftId) {
            fetchItems(); // Fetch items only after actualBranchId and shiftId are set
        }
    }, [actualBranchId, shiftId]);

    const addItemRow = () => {
        setItems([...items, { name: '', quantity: '', pricing: '', subtotal: '' }]);
    };

    // Fix handleItemChange to use correct property names
    const handleItemChange = (idx, selectedItem) => {
        const selected = allItems.find(item => item.Name === selectedItem);
        if (selected) {
            const updatedItems = [...items];
            updatedItems[idx] = {
                ...updatedItems[idx],
                name: selectedItem,
                classification: selected.Classification || '', // Added classification
                pricing: selected.ItemPrice || 0,
                subtotal: (updatedItems[idx].quantity || 0) * (selected.ItemPrice || 0),
            };
            setItems(updatedItems);
        }
    };

    // Add an onChange handler to update the quantity and recalculate the total
    const handleQuantityChange = (idx, newQuantity) => {
        const updatedItems = [...items];
        updatedItems[idx] = {
            ...updatedItems[idx],
            quantity: newQuantity,
            subtotal: (newQuantity || 0) * (updatedItems[idx].pricing || 0),
        };
        setItems(updatedItems);
    };

    // Add an onChange handler to update the pricing and recalculate the total
    const handlePricingChange = (idx, newPricing) => {
        const updatedItems = [...items];
        updatedItems[idx] = {
            ...updatedItems[idx],
            pricing: newPricing,
            subtotal: (updatedItems[idx].quantity || 0) * (newPricing || 0),
        };
        setItems(updatedItems);
    };

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [transactionNotes, setTransactionNotes] = useState('');
    const [receiptData, setReceiptData] = useState(null);

    const handleFinalize = async () => {
        setShowPaymentModal(true);
    };

    const confirmPaymentMethod = async () => {
        if (!selectedPaymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        try {
            const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
            const sellerId = allSellers.find(s => s.Name === seller)?.SellerID || null;
            const transactionData = {
                branchId: actualBranchId,
                sellerId: sellerId,
                userId: user?.userID,
                partyType: type,
                paymentMethod: selectedPaymentMethod,
                status: 'completed',
                notes: transactionNotes || '',
                totalAmount,
                items: items.map(item => ({
                    itemId: allItems.find(i => i.Name === item.name).ItemID,
                    classification: item.classification, // Include classification in transaction data
                    quantity: item.quantity,
                    itemPrice: item.pricing,
                    subtotal: item.subtotal,
                })),
            };
            console.log("Seller ID:", transactionData.sellerId);
            console.log('Transaction Data:', JSON.stringify(transactionData));

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/purchases`, transactionData);

            // Prepare receipt data
            const receipt = {
                branchName: branchName,
                branchLocation: branchLocation,
                transactionDate: new Date().toLocaleString(),
                sellerName: seller,
                paymentMethod: selectedPaymentMethod,
                employeeName: user?.username,
                items: items,
                total: totalAmount,
                transactionType: 'Purchase',
                partyType: type,
            };

            console.log('Receipt Data:', receipt);
            setSeller('');
            setType('');
            setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
            setSelectedPaymentMethod('cash');
            setTransactionNotes('');

            navigate(`/employee-dashboard/${user?.username}/receipt`, { state: { receiptData: receipt } });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    console.error('Bad Request:', error.response.data);
                } else if (error.response.status === 500) {
                    console.error('Internal Server Error:', error.response.data);
                } else {
                    console.error('Other Error:', error.response.status, error.response.data);
                }
            } else if (error.request) {
                console.error('No Response:', error.request);
            } else {
                console.error('Error:', error.message);
            }
            alert('Failed to finalize transaction.');
        }
    };

    const handleMinimize = async () => {
        try {
            const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
            const sellerId = allSellers.find(s => s.Name === seller)?.SellerID || null;
            const transactionData = {
                branchId: actualBranchId,
                sellerId: sellerId,
                userId: user?.userID,
                partyType: type,
                paymentMethod: selectedPaymentMethod,
                status: 'pending',
                notes: transactionNotes || '',
                totalAmount,
                items: items.map(item => ({
                    itemId: allItems.find(i => i.Name === item.name).ItemID,
                    quantity: item.quantity,
                    itemPrice: item.pricing,
                    subtotal: item.subtotal,
                })),
            };

            console.log('Transaction Data (Pending):', transactionData);

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/purchases`, transactionData);
            alert('Transaction saved as pending.');

            // Add transaction to pending list
            setPendingTransactions(prev => [...prev, { id: response.data.transactionId, ...transactionData }]);

            // Clear fields
            setSeller('');
            setType('');
            setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
            setSelectedPaymentMethod('cash');
            setTransactionNotes('');
        } catch (error) {
            console.error('Error saving transaction as pending:', error);
            alert('Failed to save transaction as pending.');
        }
    };

    const BackHeader = ({ text, onBack }) => {
        const navigate = useNavigate();

        const handleBackClick = () => {
            if (items.every(item => !item.name && !item.quantity && !item.pricing && !item.subtotal)) {
                navigate(-1);
            } else {
                alert('Transaction minimized.');
                handleMinimize();
            }
        };

        return (
            <Card.Header className="d-flex align-items-center" style={{ background: '#fff', borderBottom: '1px solid #343a40', paddingLeft: '0.5rem' }}>
                <Button
                    variant="link"
                    style={{ color: '#343a40', fontSize: '1.5rem', marginRight: '0.5rem', paddingLeft: 0 }}
                    onClick={onBack ? onBack : handleBackClick}
                >
                    <FaChevronLeft />
                </Button>
                <span style={{ fontFamily: 'inherit', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 1, verticalAlign: 'middle', marginTop: '4px', display: 'inline-block' }}>{text}</span>
            </Card.Header>
        );
    };

    // // Add logic to render pending transactions as rows
    // const PendingTransactions = ({ transactions, onSelectTransaction }) => {
    //     return (
    //         <div>
    //             {transactions.map((transaction, idx) => (
    //                 <div key={idx} onClick={() => onSelectTransaction(transaction)} style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}>
    //                     <span>{`Transaction ID: ${transaction.id}, Status: ${transaction.status}`}</span>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    // // Add logic to restore a pending transaction
    // const restoreTransaction = (transaction) => {
    //     setSeller(allSellers.find(s => s.SellerID === transaction.sellerId)?.Name || '');
    //     setType(transaction.partyType);
    //     setItems(transaction.items.map(item => ({
    //         name: allItems.find(i => i.ItemID === item.itemId)?.Name || '',
    //         quantity: item.quantity,
    //         pricing: item.itemPrice,
    //         subtotal: item.subtotal,
    //     })));
    //     setSelectedPaymentMethod(transaction.paymentMethod);
    //     setTransactionNotes(transaction.notes);
    //     setSelectedStatus(transaction.status);
    // };

    return (
        <Container fluid className="p-0 d-flex flex-column min-vh-100" style={{ background: '#fff', fontFamily: 'inherit' }}>
            <Card className="shadow-sm" style={{ borderRadius: '0 0 1rem 1rem', border: 'none', minHeight: '100vh' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: '#fff' }}>
                    <BackHeader text="Record a Purchase" />
                    <div style={{ background: '#fff', color: '#222', padding: '1rem', fontFamily: 'inherit', borderBottom: 'none' }}>
                        <Form.Group className="mb-2">
                            <Row>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Seller:</InputGroup.Text>
                                        <Form.Select value={seller} onChange={e => setSeller(e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
                                            <option value="" disabled>Name</option>
                                            {(type === 'Regular' ? allSellers : sellerOptions).map((option, idx) => (
                                                <option key={idx} value={option.Name || option}>{option.Name || option}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Type:</InputGroup.Text>
                                        <Form.Select value={type} onChange={e => setType(e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
                                            <option value="" disabled>Type</option>
                                            {typeOptions.map((option, idx) => (
                                                <option key={idx} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Form.Group>
                        <div style={{ borderTop: '2px solid #343a40', borderBottom: '1px solid #343a40', background: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: '1rem', display: 'flex', padding: '0.75rem 0 0.5rem 0', color: '#343a40', letterSpacing: 1 }}>
                            <div style={{ flex: 3, textAlign: 'center', flexShrink: 0 }}>Item</div>
                            <div style={{ flex: 3, paddingLeft: '40px', textAlign: 'center', flexShrink: 0 }}>Unit Price</div>
                            <div style={{ flex: 3, paddingLeft: '10px', textAlign: 'center', flexShrink: 0 }}>Qty</div>
                            <div style={{ flex: 3, textAlign: 'center', flexShrink: 0 }}>Subtotal</div>
                        </div>
                    </div>
                </div>
                <Card.Body className="p-0" style={{ position: 'relative', height: 'calc(100vh - 220px)', overflow: 'auto', paddingBottom: '60px' }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', borderBottom: '1px solid #ccc', margin: 0, background: '#fff', width: '100%', paddingLeft: '6px', paddingRight: '6px' }}>
                            {showRowRemove && (
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem 0', marginRight: '4px' }}>
                                    <Button variant="light" style={{ border: '2px solid #dc3545', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} onClick={() => handleTrashClick(idx)}>
                                        <FaTrash size={16} color="#dc3545" />
                                    </Button>
                                </div>
                            )}
                            <div style={{ flex: 3, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Select
                                    value={item.name}
                                    onChange={(e) => handleItemChange(idx, e.target.value)}
                                    style={{ background: '#222', color: '#fff', border: 'none', borderBottom: '1px solid #343a40', fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1, textAlign: 'center' }}
                                >
                                    <option value="" disabled>Item</option>
                                    {allItems.map((option) => (
                                        <option key={option.ItemID} value={option.Name}>
                                            {`${option.Name} ${option.Classification ? `- ${option.Classification}` : ''}`}
                                        </option>
                                    ))}
                                </Form.Select>


                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control
                                    type="number"
                                    value={item.pricing}
                                    onChange={(e) => handlePricingChange(idx, parseFloat(e.target.value) || 0)}
                                    style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }}
                                    placeholder="-"
                                />
                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                                    style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }}
                                    placeholder="0"
                                />
                            </div>

                            <div style={{ flex: 2, padding: '0.5rem 0' }}>
                                <Form.Control
                                    type="text"
                                    value={item.subtotal}
                                    readOnly
                                    style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    ))}
                    <div style={{ height: '140px' }}></div>
                    <div style={{ position: 'fixed', left: 0, bottom: 0, width: '100%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', padding: '1rem 0', pointerEvents: 'none' }} className="d-flex justify-content-between align-items-center px-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Button variant="light" style={{ border: '2px solid #dc3545', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }} onClick={() => setShowRowRemove(show => !show)}>
                                <FaMinus color="#dc3545" size={24} />
                            </Button>
                            <Button variant="dark" style={{ borderRadius: '1rem', fontFamily: 'inherit', fontSize: '1.1rem', padding: '0.75rem 2rem', fontWeight: 600, letterSpacing: 1, margin: '0 1rem', flex: 1, pointerEvents: 'auto' }} onClick={handleFinalize}>
                                Generate Receipt
                            </Button>
                            <Button variant="light" style={{ border: '2px solid #343a40', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }} onClick={addItemRow}>
                                <FaPlus size={24} color="#343a40" />
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
            <DeleteConfirmModal show={showDeleteModal} onCancel={cancelRemoveItem} onConfirm={confirmRemoveItem} />
            <Modal show={showPaymentModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Payment Method</Form.Label>
                        <Form.Select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
                            <option value="" disabled>Select Payment Method</option>
                            <option value="cash">Cash</option>
                            <option value="online transfer">Online Transfer</option>
                            <option value="check">Check</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Transaction Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={transactionNotes}
                            onChange={(e) => setTransactionNotes(e.target.value)}
                            placeholder="Optional notes..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={confirmPaymentMethod}
                        disabled={!selectedPaymentMethod}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default PurchasePage;
