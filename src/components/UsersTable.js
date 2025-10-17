import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import { FaUser, FaInfoCircle } from 'react-icons/fa';

const approvedUsers = [
    { name: 'John Doe' },
    { name: 'Juan de la Cruz' },
    { name: 'Jane Doe' },
];

const pendingUsers = [
    { name: 'Mark de la Chavez' },
    { name: 'Juan Luna' },
    { name: 'Piola de Roxas' },
];

function UsersTable() {
    return (
        <div className="border-0" style={{ width: 1800, maxWidth: 1800, padding: '8px 8px 8px 8px' }}>
            <h5 className="mb-2">Approved Users</h5>
            <Card className="shadow-sm border-0 mb-4" style={{ padding: 0 }}>
                <Table bordered hover responsive size="sm" className="mb-0" style={{ minWidth: 1700 }}>
                    <tbody>
                        {approvedUsers.map(user => (
                            <tr key={user.name} style={{ background: '#e0e0e0' }}>
                                <td style={{ width: 1, textAlign: 'center', verticalAlign: 'middle' }}><FaUser style={{ marginRight: 8, verticalAlign: 'middle' }} /></td>
                                <td>{user.name}</td>
                                <td style={{ textAlign: 'right', width: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                        <Button variant="outline-secondary" size="sm"><FaInfoCircle /></Button>
                                        <Button variant="outline-danger" size="sm">Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
            <h5 className="mb-2 mt-4">Pending Account</h5>
            <Card className="shadow-sm border-0" style={{ padding: 0 }}>
                <Table bordered hover responsive size="sm" className="mb-0" style={{ minWidth: 1700 }}>
                    <tbody>
                        {pendingUsers.map(user => (
                            <tr key={user.name} style={{ background: '#e0e0e0' }}>
                                <td style={{ width: 1, textAlign: 'center', verticalAlign: 'middle' }}><FaUser style={{ marginRight: 8, verticalAlign: 'middle' }} /></td>
                                <td>{user.name}</td>
                                <td style={{ textAlign: 'right', width: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                        <Button variant="outline-secondary" size="sm"><FaInfoCircle /></Button>
                                        <Button variant="dark" size="sm">Accept</Button>
                                        <Button variant="outline-dark" size="sm">Reject</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}

export default UsersTable;
