import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Modal, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

// Page tab 1 to add/manage sellers, view their details, and keep track of their loans and payments
// Page tab 2 to keep track of employee loans and payments
function SellerPage() {
    const { token, user } = useAuth();
    const [errors, setErrors] = useState({});
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState('all');

    // fetch sellers from table ( name, contact number, createdat )
    // joined with transaction table details ( loan amount, payment amount, 
    // outstanding balance, last transaction date ) and action buttons ( add loan, add payment, view seller details )
    const fetchSellers = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sellers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const formattedSellers = response.data.map(seller => ({
                id: seller.id,
                displayName: `${seller.Name}`,
                contactNumber: seller.ContactNumber,
                createdAt: seller.CreatedAt
            }));
            setSellers(formattedSellers);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchSellers();
    }, [fetchSellers]);

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
                                            <Form.Select>
                                                <option value="all">All Sellers</option>
                                                <option value="seller1">Seller 1</option>
                                                <option value="seller2">Seller 2</option>
                                                {/* Add more sellers as needed */}
                                            </Form.Select>
                                        </Form.Group>
                                    </Form>
                                    <Button variant="outline-dark">Add Seller</Button>
                                    {/* <Button variant="outline-dark" onClick={() => setShowAddItemModal(true)}>Add Item</Button> */}
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* {sortedItems.length === 0 ? (
                                                                            <tr>
                                                                                <td colSpan="4" className="text-center">No items found</td>
                                                                            </tr>
                                                                        ) : (
                                                                            sortedItems.map(item => (
                                                                                <tr key={item.ItemID}>
                                                                                    <td>{item.Name}{item.Classification ? ` - ${item.Classification}` : ''}</td>
                                                                                    <td>{item.UnitOfMeasurement}</td>
                                                                                    <td>{item.Description || 'N/A'}</td>
                                                                                </tr>
                                                                            ))
                                                                        )} */}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab>
                        <Tab eventKey="employees" title="Employees">
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form.Group controlId="employeeSelect" className="d-inline-block me-2">
                                        <Form.Label>Employee</Form.Label>
                                        <Form.Select>
                                            <option value="all">All Employees</option>
                                            <option value="employee1">Employee 1</option>
                                            <option value="employee2">Employee 2</option>
                                            {/* Add more employees as needed */}
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* {sortedItems.length === 0 ? (
                                                                            <tr>
                                                                                <td colSpan="4" className="text-center">No items found</td>
                                                                            </tr>
                                                                        ) : (
                                                                            sortedItems.map(item => (
                                                                                <tr key={item.ItemID}>
                                                                                    <td>{item.Name}{item.Classification ? ` - ${item.Classification}` : ''}</td>
                                                                                    <td>{item.UnitOfMeasurement}</td>
                                                                                    <td>{item.Description || 'N/A'}</td>
                                                                                </tr>
                                                                            ))
                                                                        )} */}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Header>
            </Card>
        </div >
    )
}

export default SellerPage;