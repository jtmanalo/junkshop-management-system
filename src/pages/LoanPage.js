import React, { useState, useEffect, useCallback } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Table, Form, Button, Modal, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useMatch } from 'react-router-dom';

// Page tab 1 to add/manage sellers, view their details, and keep track of their loans and payments
// Page tab 2 to keep track of employee loans and payments
function LoanPage() {
    const { token, user } = useAuth();
    const matchMobileRoute = useMatch('/mobileroute/*');
    const matchEmployeeDashboard = useMatch('/employee-dashboard/*');
    const isMobileRoute = matchMobileRoute || matchEmployeeDashboard;
    const [errors, setErrors] = useState({});
    const [sellers, setSellers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedSeller, setSelectedSeller] = useState('all');
    const [showSellerModal, setShowSellerModal] = useState(false);
    const [selectedSellerDetails, setSelectedSellerDetails] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState('loan');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showAddSellerModal, setShowAddSellerModal] = useState(false);
    const [newSellerName, setNewSellerName] = useState('');
    const [newSellerContact, setNewSellerContact] = useState('');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

    // fetch sellers from table ( name, contact number, createdat )
    // joined with transaction table details ( loan amount, payment amount, 
    // outstanding balance, last transaction date ) and action buttons ( add loan, add payment, view seller details )
    const fetchSellers = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/seller-loans`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const formattedSellers = response.data.map(seller => ({
                id: seller.SellerID,
                displayName: seller.Name,
                contactNumber: seller.ContactNumber,
                loanAmount: seller.LoanAmount,
                repaymentAmount: seller.RepaymentAmount,
                outstandingBalance: seller.OutstandingBalance,
                lastTransactionDate: seller.LastTransactionDate,
                createdAt: seller.CreatedAt
            }));
            console.log('Fetched sellers with loans:', formattedSellers);
            setSellers(formattedSellers);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    }, [token]);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employee-loans`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const formattedEmployees = response.data.map(employee => ({
                id: employee.EmployeeID,
                displayName: employee.Name,
                positionTitle: employee.PositionTitle,
                nickname: employee.Nickname,
                address: employee.Address,
                hireDate: employee.HireDate,
                status: employee.Status,
                contactNumber: employee.ContactNumber,
                loanAmount: employee.LoanAmount,
                repaymentAmount: employee.RepaymentAmount,
                outstandingBalance: employee.OutstandingBalance,
                lastTransactionDate: employee.LastTransactionDate,
                createdAt: employee.CreatedAt
            }));
            console.log('Fetched employees with loans:', formattedEmployees);
            setEmployees(formattedEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }, [token]);


    useEffect(() => {
        fetchSellers();
        fetchEmployees();
    }, [fetchSellers, fetchEmployees]);

    const handleInfoClick = (seller) => {
        setSelectedSellerDetails(seller);
        setShowSellerModal(true);
    };

    const handleCloseModal = () => {
        setShowSellerModal(false);
        setSelectedSellerDetails(null);
    };

    const handleTransactionClick = (person, personType, type) => {
        setSelectedPerson({ ...person, isSeller: personType === 'seller' });
        setTransactionType(type);
        setShowTransactionModal(true);
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = transactionType === 'repayment' ? '/api/repayments' : '/api/loans';
            console.log('Selected person:', selectedPerson);
            console.log("isseller:", selectedPerson.isSeller);
            const idKey = selectedPerson.isSeller ? 'sellerId' : 'employeeId';
            console.log('Submitting transaction:', {
                endpoint,
                idKey,
                personId: selectedPerson.id,
                amount: Number(amount),
                notes,
                paymentMethod
            });
            const fetchFunction = selectedPerson.isSeller ? fetchSellers : fetchEmployees;

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}${endpoint}`,
                {
                    branchId: user?.branchId,
                    userId: user?.userID,
                    [idKey]: selectedPerson.id,
                    totalAmount: Number(amount),
                    notes: notes,
                    paymentMethod: paymentMethod,
                    userType: user?.userType
                }
            );
            console.log(`${transactionType === 'repayment' ? 'Repayment' : 'Loan'} Recorded:`, response.data);
            alert('Transaction successful!');
            setShowTransactionModal(false);
            setAmount('');
            setNotes('');
            setPaymentMethod('cash');
            await fetchFunction(); // Use appropriate fetch function to refresh data
        } catch (error) {
            console.error('Error recording transaction:', error);
            alert('An error occurred while processing the transaction. Please try again.');
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) { // Regex to allow only non-negative numbers
            setAmount(value);
        }
    };

    const handleAddSeller = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/sellers`,
                {
                    name: newSellerName,
                    contactNumber: newSellerContact || null, // Allow empty contact number
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Seller added:', response.data);
            alert('Seller added successfully!');
            setShowAddSellerModal(false);
            setNewSellerName('');
            setNewSellerContact('');
            await fetchSellers(); // Refresh seller list
        } catch (error) {
            console.error('Error adding seller:', error);
            alert('Failed to add seller.');
        }
    };

    const handleRowClick = (person, isSeller) => {
        if (isMobileRoute) {
            setSelectedPerson({ ...person, isSeller });
            if (isSeller) {
                setSelectedSellerDetails(person);
                setShowSellerModal(true);
            } else {
                setSelectedEmployeeDetails(person);
                setShowEmployeeModal(true);
            }
        }
    };

    const handleEmployeeInfoClick = (employee) => {
        setSelectedEmployeeDetails(employee);
        setShowEmployeeModal(true);
    };

    const handleCloseEmployeeModal = () => {
        setShowEmployeeModal(false);
        setSelectedEmployeeDetails(null);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Loans</h1>
            </div>
            <Card className="mb-3">
                <Card.Header>
                    <Tabs defaultActiveKey="sellers" id="sellers-employees-tabs">
                        <Tab eventKey="sellers" title="Sellers">
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form >
                                        <Form.Group controlId="branchSelect" className="d-inline-block me-2">
                                            <Form.Label>Seller</Form.Label>
                                            <Form.Select
                                                value={selectedSeller}
                                                onChange={(e) => setSelectedSeller(e.target.value)}
                                            >
                                                <option value="all">All Sellers</option>
                                                {sellers.map((seller) => (
                                                    <option key={seller.id} value={seller.id}>{seller.displayName}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Form>
                                    <Button variant="outline-dark" onClick={() => setShowAddSellerModal(true)}>Add Seller</Button>
                                    {/* <Button variant="outline-dark" onClick={() => setShowAddItemModal(true)}>Add Item</Button> */}
                                </div>
                                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Loan Amount</th>
                                                <th>Repayment Amount</th>
                                                <th>Outstanding Balance</th>
                                                <th>Last Transaction Date</th>
                                                {!isMobileRoute && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sellers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isMobileRoute ? 5 : 6} className="text-center">No sellers found</td>
                                                </tr>
                                            ) : (
                                                sellers
                                                    .filter(seller => selectedSeller === 'all' || seller.id === parseInt(selectedSeller))
                                                    .map((seller) => (
                                                        <tr key={seller.id} onClick={() => handleRowClick(seller, true)} style={isMobileRoute ? { cursor: 'pointer' } : {}}>
                                                            <td>{seller.displayName}</td>
                                                            <td>{seller.loanAmount}</td>
                                                            <td>{seller.repaymentAmount}</td>
                                                            <td>{seller.outstandingBalance}</td>
                                                            <td>{seller.lastTransactionDate}</td>
                                                            {!isMobileRoute && (
                                                                <td>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleInfoClick(seller)}
                                                                    >
                                                                        <FaInfoCircle /> Info
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handleTransactionClick(seller, 'seller', 'loan')}
                                                                    >
                                                                        Add Loan
                                                                    </Button>{' '}
                                                                    <Button
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        onClick={() => handleTransactionClick(seller, 'seller', 'repayment')}
                                                                    >
                                                                        Add Payment
                                                                    </Button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="employees" title="Employees">
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form.Group controlId="employeeSelect" className="d-inline-block me-2">
                                        <Form.Label>Employee</Form.Label>
                                        <Form.Select
                                            value={selectedEmployee}
                                            onChange={(e) => setSelectedEmployee(e.target.value)}
                                        >
                                            <option value="all">All Employees</option>
                                            {employees.map((employee) => (
                                                <option key={employee.id} value={employee.id}>{employee.displayName}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>
                                                {/* <th onClick={() => requestSort('Name')} style={{ cursor: 'pointer' }}> */}
                                                Name
                                            </th>
                                            <th>
                                                {/* <th onClick={() => requestSort('UnitOfMeasurement')} style={{ cursor: 'pointer' }}> */}
                                                Loan Amount
                                            </th>
                                            <th>
                                                {/* <th onClick={() => requestSort('Description')} style={{ cursor: 'pointer' }}> */}
                                                Repayment Amount
                                            </th>
                                            <th>Outstanding Balance</th>
                                            <th>Last Transaction Date</th>
                                            {!isMobileRoute && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.length === 0 ? (
                                            <tr>
                                                <td colSpan={isMobileRoute ? 5 : 6} className="text-center">No employees found</td>
                                            </tr>
                                        ) : (
                                            employees
                                                .filter(employee => selectedEmployee === 'all' || employee.id === parseInt(selectedEmployee))
                                                .map((employee) => (
                                                    <tr key={employee.id} onClick={() => handleRowClick(employee, false)} style={isMobileRoute ? { cursor: 'pointer' } : {}}>
                                                        <td>{employee.displayName}</td>
                                                        <td>{employee.loanAmount}</td>
                                                        <td>{employee.repaymentAmount}</td>
                                                        <td>{employee.outstandingBalance}</td>
                                                        <td>{employee.lastTransactionDate}</td>
                                                        {!isMobileRoute && (
                                                            <td>
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    onClick={() => handleEmployeeInfoClick(employee)}
                                                                >
                                                                    <FaInfoCircle /> Info
                                                                </Button>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleTransactionClick(employee, 'employee', 'loan')}
                                                                >
                                                                    Add Loan
                                                                </Button>{' '}
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handleTransactionClick(employee, 'employee', 'repayment')}
                                                                >
                                                                    Add Payment
                                                                </Button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Header>
            </Card>

            {/* Modal for displaying seller details */}
            <Modal show={showSellerModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Seller Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSellerDetails && (
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td><strong>Name</strong></td>
                                    <td>{selectedSellerDetails.displayName}</td>
                                </tr>
                                <tr>
                                    <td><strong>Contact Number</strong></td>
                                    <td>{selectedSellerDetails.contactNumber || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Created At</strong></td>
                                    <td>{selectedSellerDetails.createdAt}</td>
                                </tr>
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for displaying employee details */}
            <Modal show={showEmployeeModal} onHide={handleCloseEmployeeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Employee Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEmployeeDetails && (
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td><strong>Name</strong></td>
                                    <td>{selectedEmployeeDetails.displayName}</td>
                                </tr>
                                <tr>
                                    <td><strong>Position Title</strong></td>
                                    <td>{selectedEmployeeDetails.positionTitle}</td>
                                </tr>
                                <tr>
                                    <td><strong>Nickname</strong></td>
                                    <td>{selectedEmployeeDetails.nickname || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Contact Number</strong></td>
                                    <td>{selectedEmployeeDetails.contactNumber || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Address</strong></td>
                                    <td>{selectedEmployeeDetails.address || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Hire Date</strong></td>
                                    <td>{selectedEmployeeDetails.hireDate}</td>
                                </tr>
                                <tr>
                                    <td><strong>Status</strong></td>
                                    <td>{selectedEmployeeDetails.status}</td>
                                </tr>
                                <tr>
                                    <td><strong>Created At</strong></td>
                                    <td>{selectedEmployeeDetails.createdAt}</td>
                                </tr>
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEmployeeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for adding loan or repayment */}
            <Modal show={showTransactionModal} onHide={() => setShowTransactionModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{transactionType === 'repayment' ? 'Add Repayment' : 'Add Loan'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPerson && (
                        <div>
                            <p><strong>Name:</strong> {selectedPerson.displayName}</p>
                        </div>
                    )}
                    <Form onSubmit={handleTransactionSubmit} id="transactionForm">
                        <Form.Group className="mb-3" controlId="paymentMethod">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="cash">Cash</option>
                                <option value="credit">Credit</option>
                                <option value="bank">Bank Transfer</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="amount">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                required
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="notes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTransactionModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" form="transactionForm">
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for adding a new seller */}
            <Modal show={showAddSellerModal} onHide={() => setShowAddSellerModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Seller</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddSeller}>
                        <Form.Group className="mb-3" controlId="newSellerName">
                            <Form.Label>Name <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={newSellerName}
                                onChange={(e) => setNewSellerName(e.target.value)}
                                placeholder="Enter seller name"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="newSellerContact">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={newSellerContact}
                                onChange={(e) => setNewSellerContact(e.target.value)}
                                placeholder="Enter contact number (optional)"
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowAddSellerModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Add Seller
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </div >
    )
}

export default LoanPage;