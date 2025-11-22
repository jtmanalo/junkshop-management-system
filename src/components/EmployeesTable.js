import React, { useEffect, useState } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

function EmployeesTable() {
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filter, setFilter] = useState({ userType: 'all', status: 'all' });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users`);
                const employees = response.data;
                console.log('Fetched employees:', employees);
                setUsers(employees);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
    };

    const filteredUsers = users.filter((user) => {
        const matchesUserType = filter.userType === 'all' || user.UserType === filter.userType;
        const matchesStatus = filter.status === 'all' || user.Status === filter.status;
        return matchesUserType && matchesStatus;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortConfig.key) {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        }
        return 0;
    });

    return (
        <div>
            <Form className="mb-3">
                <Form.Group controlId="filterUserType" className="me-3 d-inline-block">
                    <Form.Label>User Type</Form.Label>
                    <Form.Select name="userType" value={filter.userType} onChange={handleFilterChange}>
                        <option value="all">All</option>
                        <option value="owner">Owner</option>
                        <option value="employee">Employee</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="filterStatus" className="d-inline-block">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={filter.status} onChange={handleFilterChange}>
                        <option value="all">All</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </Form.Select>
                </Form.Group>
            </Form>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th style={{ cursor: 'default' }}>#</th>
                        <th onClick={() => handleSort('Username')} style={{ cursor: 'pointer' }}>Username</th>
                        <th onClick={() => handleSort('Email')} style={{ cursor: 'pointer' }}>Email</th>
                        <th onClick={() => handleSort('UserType')} style={{ cursor: 'pointer' }}>User Type</th>
                        <th onClick={() => handleSort('Status')} style={{ cursor: 'pointer' }}>Status</th>
                        <th style={{ cursor: 'default' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.length === 0 ? (
                        <tr>
                            <td colSpan="6">No users found</td>
                        </tr>
                    ) : (
                        sortedUsers.map((user, index) => (
                            <tr key={user.UserID}>
                                <td>{index + 1}</td>
                                <td>{user.Username}</td>
                                <td>{user.Email}</td>
                                <td>{user.UserType}</td>
                                <td>{user.Status}</td>
                                <td>
                                    <Button variant="outline-secondary" size="sm" className="me-2">
                                        <FaInfoCircle /> Info
                                    </Button>
                                    <Button variant="outline-success" size="sm" className="me-2">
                                        Approve
                                    </Button>
                                    <Button variant="outline-danger" size="sm">Reject</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
}

export default EmployeesTable;
