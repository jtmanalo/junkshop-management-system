import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Modal, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

// Page tab 1 to add/manage sellers, view their details, and keep track of their loans and payments
// Page tab 2 to keep track of employee loans and payments
function ShiftsPage() {
    const { token, user } = useAuth();
    const [errors, setErrors] = useState({});
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState('all');

    // fetch shift details from table ( branchid, userid, startdatetime, initialcash ) 
    // and ( enddatetime, totalcash ) and action buttons ( end shift, view shift details )
    // should sort by active shifts first ( enddatetime is null ) then by startdatetime descending
    // filter by branchname - location, username, and month/year dropdown
    const fetchShifts = useCallback(async () => {
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
            console.error('Error fetching shifts:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Shifts</h1>
            </div>
            <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form className="mb-3">
                        <Form.Group controlId="branchSelect" className="d-inline-block me-2">
                            <Form.Label>Branch</Form.Label>
                            <Form.Select>
                                <option value="all">All Branches</option>
                                <option value="branch1">Branch 1</option>
                                <option value="branch2">Branch 2</option>
                                {/* Add more branches as needed */}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="employeeSelect" className="d-inline-block me-2">
                            <Form.Label>Employee</Form.Label>
                            <Form.Select>
                                <option value="all">All Employees</option>
                                <option value="employee1">Employee 1</option>
                                <option value="employee2">Employee 2</option>
                                {/* Add more employees as needed */}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="monthSelect" className="d-inline-block me-2">
                            <Form.Label>Month</Form.Label>
                            <Form.Select>
                                <option value="all">All Months</option>
                                <option value="11">November</option>
                                <option value="10">October</option>
                                {/* Add more months/years as needed */}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="yearSelect" className="d-inline-block me-2">
                            <Form.Label>Year</Form.Label>
                            <Form.Select>
                                <option value="all">All Years</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                {/* Add more months/years as needed */}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </div>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
            </div>
        </div >
    )
}

export default ShiftsPage;