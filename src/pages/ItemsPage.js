import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Modal, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useMatch } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';

function ItemsPage() {
    const { token, user } = useAuth();
    const isEmployee = user?.userType === 'employee'; // Check if the user is an employee
    const matchMobileRoute = useMatch('/mobileroute/*');
    const matchEmployeeDashboard = useMatch('/employee-dashboard/*');
    const isMobileRoute = matchMobileRoute || matchEmployeeDashboard;
    const [errors, setErrors] = useState({});
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [items, setItems] = useState([]);
    const [allItemsList, setAllItemsList] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [newItem, setNewItem] = useState({
        name: '',
        unitOfMeasurement: 'per piece',
        classification: '',
        description: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showEditPricelistModal, setShowEditPricelistModal] = useState(false);
    const [selectedBranchForPricelist, setSelectedBranchForPricelist] = useState('');
    const [pricelistItems, setPricelistItems] = useState([]);
    const [showEditPriceModal, setShowEditPriceModal] = useState(false);
    const [editItemDetails, setEditItemDetails] = useState({
        itemId: null,
        branchId: null,
        name: '',
        classification: '',
        currentPrice: '',
        newPrice: ''
    });
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [showAddPreviousPricelistModal, setShowAddPreviousPricelistModal] = useState(false);
    const [historicalEffectiveDate, setHistoricalEffectiveDate] = useState(moment().tz('Asia/Manila').format('YYYY-MM-DD'));
    const [historicalItemsList, setHistoricalItemsList] = useState([]);

    // Reset date when modal is opened
    const handleOpenAddPreviousPricelistModal = () => {
        setHistoricalEffectiveDate(moment().tz('Asia/Manila').format('YYYY-MM-DD'));
        setShowAddPreviousPricelistModal(true);
    };


    const fetchItemsforItemTable = useCallback(() => {
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items`)
            .then(response => {
                if (Array.isArray(response.data)) {
                    setAllItems(response.data);
                    console.log('Fetched all items for item table:', response.data);
                } else {
                    console.error('Unexpected response format for all items:', response.data);
                    setAllItems([]);
                }
            })
            .catch(error => {
                console.error('Error fetching items for item table:', error);
                setAllItems([]);
            });
    }, []);

    const fetchBranches = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`);
            console.log('API Response:', response.data); // Log the API response
            const formattedBranches = response.data.map(branch => ({
                id: branch.BranchID,
                displayName: `${branch.Name} - ${branch.Location}`
            }));
            setBranches([{ id: '', displayName: 'All Branches' }, ...formattedBranches]); // Add "All Branches" option
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [user?.username]);

    // gets all items of the branch using username
    const fetchItems = useCallback(() => {
        if (!user?.username) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/items?username=${user.username}`)
            .then(response => {
                setItems(Array.isArray(response.data) ? response.data : []); // Ensure items is an array
            })
            .catch(error => {
                console.error('Error fetching items:', error);
                setItems([]); // Set to an empty array on error
            });
    }, [selectedBranch]);

    useEffect(() => {
        fetchItemsforItemTable();
        fetchItems();
        fetchBranches();
    }, [fetchItems, fetchBranches, fetchItemsforItemTable]);

    // get all items from item table
    const fetchAllItems = useCallback((branchId) => {
        if (!branchId) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items-with-prices?branchId=${branchId}`)
            .then(response => {
                const items = response.data;
                console.log('Raw API response:', items);
                setAllItemsList(items);
                // Also update historicalItemsList with the fetched items, keeping current price and adding historical price field
                const mappedItems = items.map(item => {
                    console.log('Mapping item:', item);
                    return {
                        ...item,
                        currentPrice: item.ItemPrice || item.price,  // Store the current price
                        historicalPrice: 0  // Initialize historical price to 0
                    };
                });
                setHistoricalItemsList(mappedItems);
                console.log('historicalItemsList updated:', mappedItems);
            })
            .catch(error => {
                console.error('Error fetching all items:', error);
            });
    }, []);

    // useEffect(() => {
    //     if (selectedBranchForPricelist) {
    //         const branchItems = items.filter(item => {
    //             const branchDetails = branches.find(branch => branch.id === Number(selectedBranchForPricelist));
    //             if (!branchDetails) return false;

    //             const branchNameLocation = `${branchDetails.displayName}`;
    //             const itemBranchNameLocation = `${item.BranchName} - ${item.BranchLocation}`;
    //             return itemBranchNameLocation === branchNameLocation;
    //         });
    //         setPricelistItems(branchItems);
    //     }
    // }, [selectedBranchForPricelist, items, branches]);

    const handleEdit = async (itemId, branchId, price) => {
        const userID = user?.userID;

        if (!userID) {
            console.error('User ID is missing');
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/items/branch/update-price`,
                {
                    branchId,
                    itemId,
                    itemPrice: price,
                    userId: userID
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchItems();
            fetchAllItems();
            console.log('Price updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating price:', error);
        }
    };

    const handleAddItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prevState => ({ ...prevState, [name]: value }));
    };

    const validateNewItem = () => {
        const newErrors = {};
        if (!newItem.name.trim()) newErrors.name = 'Name is required';
        if (!newItem.unitOfMeasurement) newErrors.unitOfMeasurement = 'Unit of Measurement is required';
        return newErrors;
    };

    const handleAddItemSubmit = () => {
        const validationErrors = validateNewItem();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        console.log('userId for new item:', user?.userID);

        axios.post(`${process.env.REACT_APP_BASE_URL}/api/items`, {
            ...newItem,
            userId: user?.userID,
        })
            .then(response => {
                console.log('Item added successfully:', response.data);
                // Show success alert
                setSuccessMessage("Item added successfully!");
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 5000); // Auto-hide after 3 seconds

                // Reset form and close modal
                setNewItem({ name: '', unitOfMeasurement: 'per piece', classification: '', description: '' });
                setErrors({});
                setShowAddItemModal(false);

                // Fetch updated items for the table
                fetchItemsforItemTable();
            })
            .catch(error => {
                console.error('Error adding item:', error);
                // Handle error (e.g., show error message to user)
            });
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredItems = items.filter(item => {
        // Log the selected branch details
        // console.log('Selected Branch ID:', selectedBranch);

        // If no branch is selected ("All Branches"), include all items
        if (!selectedBranch) {
            // console.log('No branch selected, showing all items.');
            return true;
        }

        // Find the selected branch details
        const selectedBranchDetails = branches.find(branch => branch.id === Number(selectedBranch)); // Convert selectedBranch to number
        // console.log('Selected Branch Details:', selectedBranchDetails);

        if (!selectedBranchDetails) {
            // console.log('Selected branch not found in branches list.');
            return false;
        }

        // Compare branch name and location
        const selectedBranchNameLocation = selectedBranchDetails.displayName;
        const itemBranchNameLocation = `${item.BranchName} - ${item.BranchLocation}`;

        // console.log('Comparing item branch:', itemBranchNameLocation, 'with selected branch:', selectedBranchNameLocation);

        return itemBranchNameLocation === selectedBranchNameLocation;
    });

    const filteredItemsByNameClassification = filteredItems.filter(item => {
        // If no search term is provided, include all items
        if (!searchTerm) return true;

        // Combine item name and classification for filtering
        const itemNameClassification = `${item.Name}${item.Classification ? ` - ${item.Classification}` : ''}`;

        // Check if the search term matches the item name and classification
        return itemNameClassification.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handlePricelistChange = (index, value) => {
        setAllItemsList(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                price: value, // Update the price
            };
            console.log('Updated Items:', updatedItems);
            return updatedItems;
        });
    };

    const handleUpdatePricelistItem = (index) => {
        const item = allItemsList[index]; // Use allItemsList instead of pricelistItems
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/pricelist-items/update`, {
            userId: user?.userID,
            branchId: selectedBranchForPricelist,
            itemId: item.id, // Ensure itemID is used
            price: item.price // Send the updated price
        })
            .then(response => {
                console.log('Pricelist item updated successfully:', response.data);
                setAllItemsList(prevItems => {
                    const updatedItems = [...prevItems];
                    updatedItems[index].isUpdated = true;
                    return updatedItems;
                });
            })
            .catch(error => {
                console.error('Error updating pricelist item:', error);
            });
    };

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...allItems];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [allItems, sortConfig]);

    const openEditPriceModal = (item) => {
        setEditItemDetails({
            itemId: item.ItemID,
            branchId: item.BranchID,
            name: item.Name,
            classification: item.Classification,
            currentPrice: item.ItemPrice,
            newPrice: item.ItemPrice
        });
        setShowEditPriceModal(true);
    };

    const handleEditPriceSubmit = async () => {
        const { itemId, branchId, newPrice } = editItemDetails;

        if (!itemId || !branchId || !newPrice) {
            console.error('Missing required fields for editing price');
            return;
        }

        try {
            await handleEdit(itemId, branchId, newPrice);

            // Show success alert
            setSuccessMessage("Price updated successfully!");
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000); // Auto-hide after 3 seconds

            // Reset form and close modal
            setEditItemDetails({
                itemId: null,
                branchId: null,
                name: '',
                classification: '',
                currentPrice: '',
                newPrice: ''
            });
            setShowEditPriceModal(false);

            // Re-fetch the pricelist table
            fetchAllItems(branchId);
        } catch (error) {
            console.error('Error submitting edited price:', error);
        }
    };

    const openEditItemModal = (item) => {
        setEditItemDetails({
            itemId: item.ItemID,
            name: item.Name,
            unitOfMeasurement: item.UnitOfMeasurement,
            classification: item.Classification,
            description: item.Description
        });
        setShowEditItemModal(true);
    };

    const handleEditItemSubmit = async () => {
        const { itemId, name, unitOfMeasurement, classification, description } = editItemDetails;

        if (!itemId || !name || !unitOfMeasurement) {
            console.error('Missing required fields');
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/items/${itemId}`,
                {
                    name,
                    unitOfMeasurement,
                    classification,
                    description
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Item updated successfully:', response.data);
            fetchItemsforItemTable();
            fetchItems();
            setShowEditItemModal(false);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleUploadHistoricalPrices = async () => {
        const branchId = selectedBranchForPricelist;
        const userId = user?.userID;
        console.log('Uploading historical prices for branchId:', branchId, 'date:', historicalEffectiveDate, 'userId:', userId);
        console.log('historicalItemsList before upload:', historicalItemsList);

        if (!branchId || !historicalEffectiveDate || !userId) {
            setErrors({ general: 'Branch, date, and user ID are required.' });
            return;
        }

        const pricesToUpload = historicalItemsList
            .filter(item => parseFloat(item.historicalPrice) > 0)
            .map(item => {
                console.log('Item being mapped:', item, 'ItemID:', item.id);
                return {
                    itemId: item.id,
                    price: parseFloat(item.historicalPrice),
                };
            });

        console.log('pricesToUpload:', pricesToUpload);

        if (pricesToUpload.length === 0) {
            setErrors({ general: 'Please enter at least one price greater than zero.' });
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/pricelist/upload-historical`, {
                userId,
                entityId: branchId,
                entityType: 'branch',
                dateEffective: historicalEffectiveDate,
                prices: pricesToUpload,
            });

            setSuccessMessage("Previous pricelist uploaded successfully!");
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000); // Auto-hide after 3 seconds

            setErrors({});
            setShowAddPreviousPricelistModal(false);

        } catch (e) {
            console.error('Error uploading historical prices:', e.response?.data || e.message);
            setErrors({ general: e.response?.data?.message || 'Failed to upload history. Check server logs.' });
        }
    };

    const handleHistoricalPriceChange = (index, value) => {
        setHistoricalItemsList(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index].historicalPrice = value;
            return updatedItems;
        });
    };

    return (
        <div>
            <div className="container-fluid" style={{ maxWidth: '90vw' }}>
                {showSuccessAlert && (
                    <Alert
                        variant="success"
                        onClose={() => setShowSuccessAlert(false)}
                        dismissible
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            width: '300px',
                            zIndex: 1050,
                        }}
                    >
                        {successMessage}
                    </Alert>
                )}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1>Items and Pricing</h1>
                </div>
                <Card className="mb-3">
                    <Card.Header>
                        <Tabs defaultActiveKey="items" id="items-pricelist-tabs">
                            <Tab eventKey="items" title="Items">
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2></h2>
                                        <Button variant="outline-dark" onClick={() => setShowAddItemModal(true)}>Add Item</Button>
                                    </div>
                                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th onClick={() => requestSort('Name')} style={{ cursor: 'pointer' }}>
                                                        Item
                                                    </th>
                                                    <th onClick={() => requestSort('UnitOfMeasurement')} style={{ cursor: 'pointer' }}>
                                                        Unit
                                                    </th>
                                                    <th onClick={() => requestSort('Description')} style={{ cursor: 'pointer' }}>
                                                        Description
                                                    </th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center">No items found</td>
                                                    </tr>
                                                ) : (
                                                    sortedItems.map(item => (
                                                        <tr key={item.ItemID}>
                                                            <td>{item.Name}{item.Classification ? ` - ${item.Classification}` : ''}</td>
                                                            <td>{item.UnitOfMeasurement}</td>
                                                            <td>{item.Description || 'N/A'}</td>
                                                            <td>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => openEditItemModal(item)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="pricelist" title="Pricelist">
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Form className="mb-3">
                                            <Form.Group controlId="branchSelect" className="d-inline-block me-3">
                                                <Form.Label>Branch</Form.Label>
                                                <Form.Select
                                                    value={selectedBranch}
                                                    onChange={e => setSelectedBranch(e.target.value)}
                                                >
                                                    {branches.map(branch => (
                                                        <option key={`${branch.id}-${branch.displayName}`} value={branch.id}>{branch.displayName}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group controlId="itemSelect" className="d-inline-block me-3">
                                                <Form.Label>Item</Form.Label>
                                                <Form.Select
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                >
                                                    <option value="">All Items</option>
                                                    {filteredItems.map(item => (
                                                        <option key={uuidv4()} value={item.Name}>{item.Name}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Form>
                                        {!isEmployee && (
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-primary" onClick={() => setShowEditPricelistModal(true)}>
                                                    Edit Branch Pricelist
                                                </Button>
                                                <Button variant="outline-dark" onClick={handleOpenAddPreviousPricelistModal}>
                                                    Add Previous Pricelist
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Unit</th>
                                                    <th>Price</th>
                                                    <th>Branch</th>
                                                    {!isMobileRoute && <th>Actions</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">No items found</td>
                                                    </tr>
                                                ) : (
                                                    filteredItemsByNameClassification.map(item => (
                                                        <tr key={uuidv4()}>
                                                            <td>{item.Name}{item.Classification ? ` - ${item.Classification}` : ''}</td>
                                                            <td>{item.UnitOfMeasurement}</td>
                                                            <td>{item.ItemPrice}</td>
                                                            <td>{item.BranchName} - {item.BranchLocation}</td>
                                                            {!isMobileRoute && (
                                                                <td>
                                                                    <Button variant="outline-success" size="sm" onClick={() => openEditPriceModal(item)}>
                                                                        Edit
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
                        </Tabs>
                    </Card.Header>
                </Card>
            </div>

            <Modal show={showAddItemModal} onHide={() => setShowAddItemModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Name <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Item name"
                                value={newItem.name}
                                onChange={handleAddItemChange}
                                isInvalid={!!errors.name}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Unit of Measurement <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Select
                                name="unitOfMeasurement"
                                value={newItem.unitOfMeasurement}
                                onChange={handleAddItemChange}
                                isInvalid={!!errors.unitOfMeasurement}
                            >
                                <option value="per piece">Per Piece</option>
                                <option value="per kg">Per Kg</option>
                                <option value="others">Others</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.unitOfMeasurement}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Classification</Form.Label>
                            <Form.Control
                                type="text"
                                name="classification"
                                value={newItem.classification}
                                onChange={handleAddItemChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={newItem.description}
                                onChange={handleAddItemChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddItemSubmit}>
                        Add Item
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditPricelistModal} onHide={() => setShowEditPricelistModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Branch Pricelist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="branchSelectForPricelist" className="mb-3">
                        <Form.Select
                            value={selectedBranchForPricelist}
                            onChange={e => {
                                const branchId = e.target.value;
                                setSelectedBranchForPricelist(branchId);
                                fetchAllItems(branchId);
                            }}
                        >
                            <option value="">Select a branch</option>
                            {branches.filter(branch => branch.id !== '').map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.displayName}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        <Table striped bordered hover >
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allItemsList.map((item, index) => (
                                    <tr key={item.id || `item-${index}`}>
                                        {/* {console.log('Rendering item:', item, "itemID:", item.id)} */}
                                        <td>{item.name}{item.classification ? ` - ${item.classification}` : ''}</td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                value={item.price || ''} // Ensure it doesn't break if price is undefined
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value);
                                                    if (value > 0) {
                                                        handlePricelistChange(index, value);
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    if (!/^[0-9.]$/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Button
                                                variant={item.isUpdated ? "success" : "outline-primary"}
                                                size="sm"
                                                onClick={() => {
                                                    handleUpdatePricelistItem(index);
                                                    if (!item.isUpdated) {
                                                        setTimeout(() => {
                                                            setAllItemsList(prevItems => {
                                                                const updatedItems = [...prevItems];
                                                                updatedItems[index].isUpdated = false;
                                                                return updatedItems;
                                                            });
                                                        }, 3000);
                                                    }
                                                }}
                                            >
                                                {item.isUpdated ? "Updated" : "Update"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={showEditPriceModal} onHide={() => setShowEditPriceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Item Price</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Item</Form.Label>
                            <Form.Control
                                type="text"
                                value={`${editItemDetails.name}${editItemDetails.classification ? ` - ${editItemDetails.classification}` : ''}`}
                                readOnly
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Current Price</Form.Label>
                            <Form.Control
                                type="text"
                                value={editItemDetails.currentPrice}
                                readOnly
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>New Price</Form.Label>
                            <Form.Control
                                type="number"
                                value={editItemDetails.newPrice}
                                onChange={(e) => setEditItemDetails({ ...editItemDetails, newPrice: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditPriceModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditPriceSubmit}>
                        Update Price
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditItemModal} onHide={() => setShowEditItemModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Item Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editItemDetails.name}
                                onChange={(e) => setEditItemDetails({ ...editItemDetails, name: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Unit of Measurement</Form.Label>
                            <Form.Select
                                value={editItemDetails.unitOfMeasurement}
                                onChange={(e) => setEditItemDetails({ ...editItemDetails, unitOfMeasurement: e.target.value })}
                            >
                                <option value="per piece">Per Piece</option>
                                <option value="per kg">Per Kg</option>
                                <option value="others">Others</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Classification</Form.Label>
                            <Form.Control
                                type="text"
                                value={editItemDetails.classification}
                                onChange={(e) => setEditItemDetails({ ...editItemDetails, classification: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editItemDetails.description}
                                onChange={(e) => setEditItemDetails({ ...editItemDetails, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditItemModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditItemSubmit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddPreviousPricelistModal} onHide={() => {
                setShowAddPreviousPricelistModal(false);
                setSelectedBranchForPricelist('');
                setHistoricalItemsList([]);
                setHistoricalEffectiveDate(moment().tz('Asia/Manila').format('YYYY-MM-DD'));
                setErrors({});
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Previous Pricelist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errors.general && <Alert variant="danger">{errors.general}</Alert>}

                    <Form>
                        <div className="d-flex mb-3 gap-3">
                            <Form.Group controlId="branchSelectHistory" style={{ flex: 1 }}>
                                <Form.Label>Branch</Form.Label>
                                <Form.Select
                                    value={selectedBranchForPricelist}
                                    onChange={e => {
                                        const branchId = e.target.value;
                                        setSelectedBranchForPricelist(branchId);
                                        console.log('Selected branch for historical pricelist:', branchId);
                                        // Load all items here for editing prices
                                        fetchAllItems(branchId);
                                    }}
                                >
                                    <option value="">Select a branch</option>
                                    {branches.filter(branch => branch.id !== '').map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.displayName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="dateSelectHistory" style={{ flex: 1 }}>
                                <Form.Label>Effective Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={historicalEffectiveDate}
                                    onChange={e => setHistoricalEffectiveDate(e.target.value)}
                                    max={moment().tz('Asia/Manila').format('YYYY-MM-DD')} // Cannot select future dates
                                    required
                                />
                                <Form.Text muted>Must be a past or current date.</Form.Text>
                            </Form.Group>
                        </div>

                        {/* Table for editing prices */}
                        <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Current Price</th>
                                        <th>Historical Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {console.log('historicalItemsList in render:', historicalItemsList, 'length:', historicalItemsList.length)}
                                    {historicalItemsList.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center">Select a branch to load items.</td></tr>
                                    ) : (
                                        historicalItemsList.map((item, index) => (
                                            <tr key={item.ItemID || item.id}>
                                                <td>{item.name}{item.classification ? ` - ${item.classification}` : ''}</td>
                                                <td>{item.currentPrice || 'N/A'}</td> {/* Current Price */}
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Enter historical price"
                                                        value={item.historicalPrice || ''}
                                                        onChange={e => {
                                                            const value = parseFloat(e.target.value) || 0;
                                                            setHistoricalItemsList(prevItems => {
                                                                const updatedItems = [...prevItems];
                                                                updatedItems[index].historicalPrice = value;
                                                                return updatedItems;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddPreviousPricelistModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUploadHistoricalPrices}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
        </div >
    );
};

export default ItemsPage;