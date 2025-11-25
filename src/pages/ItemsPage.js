import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

function ItemsPage() {
    const { user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [items, setItems] = useState([]);

    const fetchBranches = useCallback(() => {
        if (!user?.username) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches/${user.username}`)
            .then(response => {
                const formattedBranches = response.data.map(branch => ({
                    id: branch.BranchID,
                    displayName: `${branch.Name} - ${branch.Location}`
                }));
                setBranches(formattedBranches);
                if (formattedBranches.length > 0) {
                    setSelectedBranch(formattedBranches[0].id); // Default to the first branch
                }
            })
            .catch(error => {
                console.error('Error fetching branches:', error);
            });
    }, [user?.username]);

    const fetchItems = useCallback(() => {
        if (!selectedBranch) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/items?branchId=${selectedBranch}`)
            .then(response => {
                setItems(response.data);
            })
            .catch(error => {
                console.error('Error fetching items:', error);
            });
    }, [selectedBranch]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleEdit = (itemId) => {
        console.log(`Edit item with ID: ${itemId}`);
        // Add your edit logic here
    };

    const handleAddItem = () => {
        console.log('Add new item');
        // Add your add item logic here
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Items and Pricing</h1>
                <Button variant="outline-dark" onClick={handleAddItem}>Add Item</Button>
            </div>

            <Form className="mb-3">
                <Form.Group controlId="branchSelect">
                    <Form.Label>Filter by Branch</Form.Label>
                    <Form.Select
                        value={selectedBranch}
                        onChange={e => setSelectedBranch(e.target.value)}
                    >
                        {branches.map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.displayName}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Form>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Unit of Measurement</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center">No items found</td>
                        </tr>
                    ) : (
                        items.map(item => (
                            <tr key={item.ItemID}>
                                <td>{item.Name}{item.Classification ? ` - ${item.Classification}` : ''}</td>
                                <td>{item.UnitOfMeasurement}</td>
                                <td>{item.ItemPrice}</td>
                                <td>
                                    <Button variant="outline-success" size="sm" onClick={() => handleEdit(item.ItemID)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
}

export default ItemsPage;
