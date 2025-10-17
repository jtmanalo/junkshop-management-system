import React, { useState } from 'react';
import { Container, Card, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaTrash, FaMinus } from 'react-icons/fa';
import { BackHeader } from '../components/Header';
import { DeleteConfirmModal } from '../components/Modal';

function SalePage() {
    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIdx, setDeleteIdx] = useState(null);

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
    const itemOptions = [
        'Cbak',
        'Bakal',
        'Paper',
        'Glass',
        'Electronics',
        'Other'
    ];
    const [buyer, setBuyer] = useState('');
    const [type, setType] = useState('');

    const buyerOptions = [
        'Juan Dela Cruz',
        'Maria Santos',
        'Pedro Reyes',
        'Ana Lopez',
        'Other'
    ];

    const typeOptions = [
        'Regular',
        'Extra'
    ];

    const [items, setItems] = useState([
        { name: '', quantity: '', pricing: '', total: '' },
    ]);

    const handleItemChange = (idx, field, value) => {
        const newItems = items.map((item, i) => {
            if (i === idx) {
                let updated = { ...item, [field]: value };
                // Calculate total if pricing or quantity changes
                let quantity = field === 'quantity' ? value : updated.quantity;
                let pricing = field === 'pricing' ? value : updated.pricing;
                // Only calculate if both are numbers
                const q = parseFloat(quantity);
                const p = parseFloat(pricing);
                if (!isNaN(q) && !isNaN(p)) {
                    updated.total = (q * p).toString();
                } else {
                    updated.total = '';
                }
                return updated;
            }
            return item;
        });
        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, { name: '', quantity: '', pricing: '', total: '' }]);
    };

    const handleFinalize = () => {
        // Finalize transaction logic here
        // For FaTrash: show modal before deleting

        alert('Receipt generated!');
    };

    return (
        <Container fluid className="p-0 d-flex flex-column min-vh-100" style={{ background: '#fff', fontFamily: 'inherit' }}>
            <Card className="shadow-sm" style={{ borderRadius: '0 0 1rem 1rem', border: 'none', minHeight: '100vh' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: '#fff' }}>
                    <BackHeader text="Record a Sale" />
                    <div style={{ background: '#fff', color: '#222', padding: '1rem', fontFamily: 'inherit', borderBottom: 'none' }}>
                        <Form.Group className="mb-2">
                            <Row>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Buyer:</InputGroup.Text>
                                        <Form.Select value={buyer} onChange={e => setBuyer(e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
                                            <option value="" disabled>Name</option>
                                            {buyerOptions.map((option, idx) => (
                                                <option key={idx} value={option}>{option}</option>
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
                            <div style={{ flex: 3, textAlign: 'center', flexShrink: 0 }}>Total</div>
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
                                <Form.Select value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} style={{ background: '#222', color: '#fff', border: 'none', borderBottom: '1px solid #343a40', fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1, textAlign: 'center' }}>
                                    <option value="" disabled>Item</option>
                                    {itemOptions.map((option, i) => (
                                        <option key={i} value={option}>{option}</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control type="text" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }} placeholder="0" />
                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control type="text" value={item.pricing} onChange={e => handleItemChange(idx, 'pricing', e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }} placeholder="-" />
                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0' }}>
                                <Form.Control type="text" value={item.total} readOnly style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }} placeholder="0" />
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
        </Container>
    );
}

export default SalePage;
