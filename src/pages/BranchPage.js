import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

function BranchPage() {
    const [branches, setBranches] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', openingDate: '', ownerID: '', status: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const { user } = useAuth();
    // console.log('User from context:', user);
    // console.log('Authenticated User:', user.username);
    // console.log('User ID:', user?.userID);

    const fetchBranches = useCallback(() => {
        if (!user?.username) return; // Ensure user is defined before making the API call
        // console.log('Fetching branches for username:', user.username);
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches/${user.username}`)
            .then(response => {
                // console.log('API Response:', response.data);
                setBranches(response.data);
            })
            .catch(error => {
                console.error('Error fetching branches:', error);
            });
    }, [user?.username]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleAddBranch = () => {
        setShowAdd(true);
    };

    const handleCloseAdd = () => {
        setShowAdd(false);
        // Clear form data
        setFormData({ name: '', location: '', openingDate: '', ownerID: '', status: '' });
    };

    const handleEditBranch = (BranchID) => {
        BranchID = Number(BranchID); // Convert BranchID to a number
        // console.log('BranchID:', BranchID);
        const branch = branches.find(branch => branch.BranchID === BranchID);
        // console.log('Found Branch:', branch);
        if (!branch) {
            console.error('Branch not found!');
        }
        // else {
        // console.log('Selected Branch:', branch);
        // }
        setFormData({
            name: branch?.Name || '',
            location: branch?.Location || '',
            openingDate: branch?.OpeningDate || '',
            ownerId: branch?.OwnerID || '',
            status: branch?.Status || '',
            BranchID: branch?.BranchID || ''
        });
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        setShowEdit(false);
        // Clear form data
        setFormData({ name: '', location: '', openingDate: '', ownerID: '', status: '' });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        // console.log('Submitting Edit Form with data:', formData);
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/branches/${formData.BranchID}`, {
                name: formData.name,
                location: formData.location,
                openingDate: formData.openingDate,
                status: formData.status
            });
            setShowEdit(false);
            fetchBranches(); // Refresh the branches after editing
            alert('Branch updated successfully!'); // Notify the user

            // Clear form data
            setFormData({ name: '', location: '', openingDate: '', ownerID: '', status: '' });
        } catch (error) {
            console.error('Error updating branch:', error);
            alert('Failed to update branch. Please try again.');
        }
    };

    const handleAddFormSubmit = async (e) => {
        e.preventDefault();
        // console.log('Submitting Add Form with data:', formData);
        // console.log('User inside handleAddFormSubmit:', user); // Log the user object
        // console.log('User ID inside handleAddFormSubmit:', user?.userID); // Log userID

        try {
            // Check if user is in the owner table
            // console.log('Checking owner for user:', user);
            // console.log('User ID:', user?.userID);
            // console.log('User Type:', user?.userType);

            // Proceed to add the branch
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/branches`, {
                name: formData.name,
                location: formData.location,
                openingDate: formData.openingDate,
                username: user?.username
            });
            setShowAdd(false);
            fetchBranches(); // Refresh the branches after adding a new one
            alert('Branch added successfully!'); // Notify the user

            // Clear form data
            setFormData({ name: '', location: '', openingDate: '', ownerID: '', status: '' });
        } catch (error) {
            console.error('Error adding branch:', error);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedBranches = [...branches].sort((a, b) => {
        if (sortConfig.key) {
            const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
            const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';

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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Branches</h1>
                <Button variant="success" onClick={handleAddBranch} className="btn-circle">
                    +
                </Button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th onClick={() => handleSort('Name')} style={{ cursor: 'pointer' }}>Name</th>
                        <th onClick={() => handleSort('Location')} style={{ cursor: 'pointer' }}>Location</th>
                        <th onClick={() => handleSort('Status')} style={{ cursor: 'pointer' }}>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedBranches.length === 0 ? (
                        <tr>
                            <td colSpan="5">No branches found</td>
                        </tr>
                    ) : (
                        sortedBranches.map((branch, index) => (
                            <tr key={branch.BranchID}>
                                <td>{index + 1}</td>
                                <td>{branch.Name}</td>
                                <td>{branch.Location}</td>
                                <td>{branch.Status}</td>
                                <td>
                                    <Button
                                        onClick={() => handleEditBranch(branch.BranchID)}
                                        variant="warning" size="sm" className="me-2"
                                    >
                                        Edit
                                    </Button>

                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showAdd} onHide={handleCloseAdd}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Branch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddFormSubmit}>
                        <Form.Group className="mb-3" controlId="formBranchName">
                            <Form.Label>
                                Branch Name <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Branch name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchLocation">
                            <Form.Label>
                                Branch Location <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Branch location"
                                name="location"
                                value={formData.location}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchOpeningDate">
                            <Form.Label>
                                Opening Date <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="openingDate"
                                value={formData.openingDate}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showEdit} onHide={handleCloseEdit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Branch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditFormSubmit}>
                        <Form.Group className="mb-3" controlId="formBranchName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter branch name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchLocation">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter branch location"
                                name="location"
                                value={formData.location}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="closed">Closed</option>
                            </Form.Select>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default BranchPage;