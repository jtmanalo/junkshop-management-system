import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

function EmployeesTable() {
    const { user } = useAuth();
    const currentUsername = user ? user.username : null;
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filter, setFilter] = useState({ userType: 'all', status: 'all' });
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

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

        // Use username from useAuth context
        const isNotCurrentUser = user.Username !== currentUsername;
        // console.log('Filtering user:', user.Username, 'Current user:', currentUsername, 'Include:', isNotCurrentUser);

        return matchesUserType && matchesStatus && isNotCurrentUser;
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

    const handleActionClick = (action, user) => {
        setModalAction(action);
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleUpdateClick = (user) => {
        console.log(`Updating user: ${user.Username}`);
        // Add update logic here
    };

    const handleConfirmAction = () => {
        if (modalAction === 'delete') {
            console.log(`Deleting user: ${selectedUser.Username}`);
            // Add delete logic here
        } else if (modalAction === 'reject') {
            console.log(`Rejecting user: ${selectedUser.Username}`);
            // Add reject logic here
        } else if (modalAction === 'approve') {
            console.log(`Approving user: ${selectedUser.Username}`);
            // Add approve logic here
        }
        setShowModal(false);
    };

    const handleCancelAction = () => {
        setShowModal(false);
        setModalAction(null);
        setSelectedUser(null);
    };

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
                                    {user.Status === 'approved' ? (
                                        <Button variant="outline-primary" size="sm" className="me-2">Update</Button>
                                    ) : user.Status === 'rejected' ? (
                                        <Button variant="outline-danger" size="sm" onClick={() => handleActionClick('delete', user)}>Delete</Button>
                                    ) : (
                                        <>
                                            <Button variant="outline-success" size="sm" className="me-2" disabled={user.Status !== 'pending'} onClick={() => handleActionClick('approve', user)}>Approve</Button>
                                            <Button variant="outline-danger" size="sm" disabled={user.Status !== 'pending'} onClick={() => handleActionClick('reject', user)}>Reject</Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleCancelAction}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {modalAction} this user?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelAction}>No, cancel</Button>
                    <Button variant={modalAction === 'approve' ? 'primary' : 'danger'} onClick={handleConfirmAction}>Yes, {modalAction}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default EmployeesTable;
