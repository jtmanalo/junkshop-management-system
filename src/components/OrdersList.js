import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Table, Badge, Dropdown } from 'react-bootstrap';
import { FaFilter, FaFileImport, FaPlus, FaSearch, FaEllipsisH } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const sampleOrders = [
    { id: '#513279', date: '18/02/2022', customer: 'Arsen D.', phone: '0917-555-0123', product: 'Ollivander Wand', price: '£78.00', payment: 'Paid', status: 'New' },
    { id: '#513278', date: '17/02/2022', customer: 'Stanislav Ostryzhnyi', phone: '0917-555-0124', product: '1 x Hogwarts Gift Trunk', price: '£149.90', payment: 'Pending', status: 'New' },
    { id: '#513280', date: '17/02/2022', customer: 'Alina Miroshnychenko', phone: '0917-555-0125', product: '1 x Ollivander Wand\n1 x Hogwarts Gift Trunk', price: '£188.90', payment: 'Paid', status: 'Completed' },
    { id: '#513277', date: '17/02/2022', customer: 'Alyona Kulish', phone: '0917-555-0126', product: '1 x Ollivander Wand', price: '£39.00', payment: 'Not paid', status: 'Canceled' },
    { id: '#513278', date: '16/02/2022', customer: 'Dmytro Ivanov', phone: '0917-555-0127', product: '2 x Hogwarts Gift Trunk', price: '£299.80', payment: 'Paid', status: 'Completed' },
];

function StatusBadge({ status }) {
    const map = {
        'Paid': 'success',
        'Pending': 'warning',
        'Not paid': 'danger',
        'New': 'info',
        'Completed': 'success',
        'Canceled': 'danger'
    };
    return <Badge bg={map[status] || 'secondary'} style={{ padding: '0.5rem 0.7rem', borderRadius: 12 }}>{status}</Badge>;
}

function parseDateDMY(d) {
    if (!d) return null;
    if (d instanceof Date) return d;
    const parts = d.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function parsePrice(p) {
    if (!p) return 0;
    const n = p.replace(/[^0-9.]/g, '');
    return parseFloat(n) || 0;
}

export default function OrdersList() {
    const [query, setQuery] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(true);

    // filters
    const [fOrderId, setFOrderId] = useState('');
    const [fCustomer, setFCustomer] = useState('');
    const [fPhone, setFPhone] = useState('');
    const [fProduct, setFProduct] = useState('');
    const [fPayment, setFPayment] = useState('');
    const [fStatus, setFStatus] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // sorting
    const [sortBy, setSortBy] = useState('date');
    const [sortDir, setSortDir] = useState('desc'); // 'asc' or 'desc'

    // pagination
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const onSort = (col) => {
        if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('asc'); }
    };

    const filtered = useMemo(() => {
        return sampleOrders.filter(o => {
            // global query
            const q = query.trim().toLowerCase();
            if (q) {
                const match = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
                if (!match) return false;
            }

            if (fOrderId && !o.id.toLowerCase().includes(fOrderId.toLowerCase())) return false;
            if (fCustomer && !o.customer.toLowerCase().includes(fCustomer.toLowerCase())) return false;
            if (fPhone && !o.phone.toLowerCase().includes(fPhone.toLowerCase())) return false;
            if (fProduct && !o.product.toLowerCase().includes(fProduct.toLowerCase())) return false;
            if (fPayment && fPayment !== 'Select' && o.payment !== fPayment) return false;
            if (fStatus && o.status !== fStatus) return false;

            if (startDate || endDate) {
                const od = parseDateDMY(o.date);
                if (startDate && od < startDate) return false;
                if (endDate && od > endDate) return false;
            }

            return true;
        });
    }, [query, fOrderId, fCustomer, fPhone, fProduct, fPayment, fStatus, startDate, endDate]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        arr.sort((a, b) => {
            let av, bv;
            if (sortBy === 'date') { av = parseDateDMY(a.date); bv = parseDateDMY(b.date); }
            else if (sortBy === 'price') { av = parsePrice(a.price); bv = parsePrice(b.price); }
            else {
                av = (a[sortBy] || '').toString().toLowerCase();
                bv = (b[sortBy] || '').toString().toLowerCase();
            }

            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;

            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return arr;
    }, [filtered, sortBy, sortDir]);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = sorted.slice((page - 1) * pageSize, page * pageSize);

    const clearFilters = () => {
        setFOrderId(''); setFCustomer(''); setFPhone(''); setFProduct(''); setFPayment(''); setFStatus(''); setStartDate(null); setEndDate(null); setPage(1);
    };

    return (
        <div>
            <Row className="align-items-center mb-3">
                <Col md={8} xs={12} className="mb-2">
                    <InputGroup>
                        <Form.Control placeholder="Search by order ID or customer" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
                        <Button variant="light"><FaSearch /></Button>
                    </InputGroup>
                </Col>
                <Col md={4} xs={12} className="text-end">
                    <Button variant="outline-primary" className="me-2" onClick={() => setFiltersVisible(v => !v)}><FaFilter /> Filter</Button>
                    <Button variant="outline-primary" className="me-2"><FaFileImport /> Export</Button>
                    <Button variant="primary"><FaPlus /> Add New</Button>
                </Col>
            </Row>

            {filtersVisible && (
                <Card className="mb-4" style={{ borderRadius: 12 }}>
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3} sm={6}><Form.Label>Order ID</Form.Label><Form.Control placeholder="Order ID" value={fOrderId} onChange={e => { setFOrderId(e.target.value); setPage(1); }} /></Col>
                            <Col md={3} sm={6}><Form.Label>Customer</Form.Label><Form.Control placeholder="First and last name" value={fCustomer} onChange={e => { setFCustomer(e.target.value); setPage(1); }} /></Col>
                            <Col md={3} sm={6}><Form.Label>Phone number</Form.Label><Form.Control placeholder="Phone number" value={fPhone} onChange={e => { setFPhone(e.target.value); setPage(1); }} /></Col>
                            <Col md={3} sm={6}><Form.Label>Product</Form.Label><Form.Control placeholder="Ollivander Wand" value={fProduct} onChange={e => { setFProduct(e.target.value); setPage(1); }} /></Col>

                            <Col md={3} sm={6}><Form.Label>Payment</Form.Label><Form.Select value={fPayment} onChange={e => { setFPayment(e.target.value); setPage(1); }}><option value="">Select</option><option>Paid</option><option>Pending</option><option>Not paid</option></Form.Select></Col>
                            <Col md={3} sm={6}><Form.Label>Status</Form.Label><Form.Select value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1); }}><option value="">All</option><option>New</option><option>Completed</option><option>Pending</option><option>Canceled</option></Form.Select></Col>
                            <Col md={3} sm={6}><Form.Label>Date range</Form.Label>
                                <div className="d-flex">
                                    <DatePicker selected={startDate} onChange={date => { setStartDate(date); setPage(1); }} selectsStart startDate={startDate} endDate={endDate} placeholderText="Start" className="form-control" />
                                    <DatePicker selected={endDate} onChange={date => { setEndDate(date); setPage(1); }} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="End" className="form-control ms-2" />
                                </div>
                            </Col>
                            <Col md={3} sm={6} className="d-flex align-items-end">
                                <div>
                                    <Button variant="primary" className="me-2" onClick={() => setPage(1)}>Search</Button>
                                    <Button variant="link" onClick={clearFilters}>Clear filters</Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <Card style={{ borderRadius: 12 }}>
                <Card.Body style={{ padding: 0 }}>
                    <Table hover responsive className="mb-0">
                        <thead style={{ background: '#fafafa' }}>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => onSort('id')}>Order ID {sortBy === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => onSort('date')}>Date {sortBy === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => onSort('customer')}>Customer {sortBy === 'customer' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                <th>Product</th>
                                <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => onSort('price')}>Price {sortBy === 'price' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {current.map((o, i) => (
                                <tr key={i}>
                                    <td style={{ width: 140 }}>{o.id}</td>
                                    <td>{o.date}</td>
                                    <td>{o.customer}</td>
                                    <td style={{ whiteSpace: 'pre-line' }}>{o.product}</td>
                                    <td className="text-end">{o.price}</td>
                                    <td><span style={{ color: o.payment === 'Paid' ? '#2e7d32' : o.payment === 'Pending' ? '#f57c00' : '#d32f2f' }}>{o.payment}</span></td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td className="text-end"><Dropdown align="end"><Dropdown.Toggle variant="light" size="sm"><FaEllipsisH /></Dropdown.Toggle><Dropdown.Menu><Dropdown.Item>View</Dropdown.Item><Dropdown.Item>Edit</Dropdown.Item><Dropdown.Item>Delete</Dropdown.Item></Dropdown.Menu></Dropdown></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>Showing {Math.min(total, (page - 1) * pageSize + 1)} - {Math.min(total, page * pageSize)} of {total} results</div>
                <div>
                    <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <Button key={idx} variant={page === idx + 1 ? 'primary' : 'light'} size="sm" className="me-1" onClick={() => setPage(idx + 1)}>{idx + 1}</Button>
                    ))}
                    <Button variant="outline-secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ms-2">Next</Button>
                </div>
            </div>
        </div>
    );
}
