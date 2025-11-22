import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';

const approvedUsers = [
    { name: 'John Doe', location: 'Manila', status: 'Active' },
    { name: 'Juan de la Cruz', location: 'Quezon City', status: 'Inactive' },
    { name: 'Jane Doe', location: 'Cebu', status: 'Active' },
];

const pendingUsers = [
    { name: 'Mark de la Chavez', location: 'Davao', status: 'Pending' },
    { name: 'Juan Luna', location: 'Baguio', status: 'Pending' },
    { name: 'Piola de Roxas', location: 'Iloilo', status: 'Pending' },
];

function EmployeesTable() {
    return (
        <div>
            <h5 className="mb-2">Approved Employees</h5>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {approvedUsers.length === 0 ? (
                        <tr>
                            <td colSpan="5">No approved employees found</td>
                        </tr>
                    ) : (
                        approvedUsers.map((user, index) => (
                            <tr key={user.name}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.location}</td>
                                <td>{user.status}</td>
                                <td>
                                    <Button variant="outline-secondary" size="sm" className="me-2">
                                        <FaInfoCircle /> Info
                                    </Button>
                                    <Button variant="outline-danger" size="sm">Delete</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <h5 className="mb-2 mt-4">Pending Employees</h5>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingUsers.length === 0 ? (
                        <tr>
                            <td colSpan="5">No pending users found</td>
                        </tr>
                    ) : (
                        pendingUsers.map((user, index) => (
                            <tr key={user.name}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.location}</td>
                                <td>{user.status}</td>
                                <td>
                                    <Button variant="dark" size="sm" className="me-2">Accept</Button>
                                    <Button variant="outline-dark" size="sm">Reject</Button>
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
