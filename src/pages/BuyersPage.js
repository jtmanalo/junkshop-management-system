// Table: Company Name | Item Name | Price | Actions (View Contacts, View Pricelist, Edit)
// Company Name only mentioned once and then the items/prices listed below it
// View Contacts and View Pricelist are buttons only for rows with Company Name
// Edit button only for rows with items/prices

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Form, Button, Alert, Modal } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../services/AuthContext';
import { useMatch } from 'react-router-dom';
import axios from 'axios';

function BuyersPage() {
    const { user } = useAuth();
    const [buyers, setBuyers] = useState([]);
    const [buyerPricelist, setBuyerPricelist] = useState([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState('');
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]); // State for filtered rows
    const [buyerContacts, setBuyerContacts] = useState([]);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [currentBuyerId, setCurrentBuyerId] = useState(null);
    const isEmployee = user?.userType === 'employee';
    const matchMobileRoute = useMatch('/mobileroute/*');
    const matchEmployeeDashboard = useMatch('/employee-dashboard/*');
    const isMobileRoute = matchMobileRoute || matchEmployeeDashboard;
    const [showEditPricelistModal, setShowEditPricelistModal] = useState(false);
    const [allItemsList, setAllItemsList] = useState([]);
    const [pricelistItems, setPricelistItems] = useState([]);
    const [selectedBuyerForPricelist, setSelectedBuyerForPricelist] = useState('');
    const [showViewPricelistModal, setShowViewPricelistModal] = useState(false);
    const [viewPricelistItems, setViewPricelistItems] = useState([]);
    const [viewPricelistName, setViewPricelistName] = useState('');
    const [showEditPriceModal, setShowEditPriceModal] = useState(false);
    const [showAddBuyerModal, setShowAddBuyerModal] = useState(false);
    const [newBuyerName, setNewBuyerName] = useState('');
    const [newBuyerCompany, setNewBuyerCompany] = useState('');
    const [newBuyerNotes, setNewBuyerNotes] = useState('');
    const [newBuyerContactMethod, setNewBuyerContactMethod] = useState(null);
    const [newBuyerContactDetail, setNewBuyerContactDetail] = useState(null);
    const [showEditBuyerModal, setShowEditBuyerModal] = useState(false);
    const [editBuyerId, setEditBuyerId] = useState(null);
    const [editBuyerCompany, setEditBuyerCompany] = useState('');
    const [editBuyerName, setEditBuyerName] = useState('');
    // const [editBuyerContactMethod, setEditBuyerContactMethod] = useState('');
    // const [editBuyerContactDetail, setEditBuyerContactDetail] = useState('');
    const [editBuyerNotes, setEditBuyerNotes] = useState('');
    const [editBuyerStatus, setEditBuyerStatus] = useState('active');

    const fetchBuyers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/buyers`);
            console.log('Buyers:', response.data);
            const formattedBuyers = [...new Set(response.data.map(buyer => buyer.CompanyName))];
            const buyerPricelist = Array.from(
                response.data.reduce((map, buyer) => {
                    if (buyer.BuyerID && buyer.CompanyName && !map.has(buyer.BuyerID)) {
                        console.log('Adding BuyerID:', buyer.BuyerID);
                        map.set(buyer.BuyerID, { id: buyer.BuyerID, companyName: buyer.CompanyName });
                    }
                    return map;
                }, new Map()).values()
            );

            const formattedItems = Array.from(
                new Map(
                    response.data.map(buyer => {
                        if (buyer.Name && buyer.Classification) {
                            return [
                                `${buyer.Name} - ${buyer.Classification}`,
                                {
                                    id: buyer.BuyerID,
                                    name: `${buyer.Name} - ${buyer.Classification}`,
                                },
                            ];
                        } else if (buyer.Name) {
                            return [
                                buyer.Name,
                                {
                                    id: buyer.BuyerID,
                                    name: buyer.Name,
                                },
                            ];
                        }
                        return null;
                    }).filter(item => item)
                ).values()
            );

            const formattedRows = response.data.map(buyer => {
                if (buyer.Name && buyer.CompanyName && buyer.Price) {
                    return {
                        buyerId: buyer.BuyerID,
                        itemName: buyer.Name && buyer.Classification && buyer.UnitOfMeasurement
                            ? `${buyer.Name} - ${buyer.Classification} (${buyer.UnitOfMeasurement})`
                            : buyer.Name
                                ? `${buyer.Name} (${buyer.UnitOfMeasurement})`
                                : '',
                        price: buyer.Price,
                        companyName: buyer.CompanyName,
                    };
                }
                return null;
            }).filter(row => row !== null); // Filter out null rows

            setBuyers(formattedBuyers);
            setBuyerPricelist(buyerPricelist);
            setItems([...formattedItems]); // Ensure unique items
            setRows(formattedRows);
            setFilteredRows(formattedRows); // Initialize filtered rows
            console.log('Rows:', formattedRows);
            console.log('Buyers:', formattedBuyers);
        } catch (error) {
            console.error('Error fetching buyers:', error);
        }
    };

    useEffect(() => {
        fetchBuyers();
    }, []);

    useEffect(() => {
        // Filter rows based on selected buyer and item
        const filtered = rows.filter(row => {
            const matchesBuyer = selectedBuyer ? row.companyName === selectedBuyer : true;
            const matchesItem = selectedItem ? row.itemName.includes(selectedItem) : true;
            return matchesBuyer && matchesItem;
        });
        setFilteredRows(filtered);
    }, [selectedBuyer, selectedItem, rows]);

    const fetchAllItems = useCallback((buyerId) => {
        if (!buyerId) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items-with-prices?buyerId=${buyerId}`)
            .then(response => {
                setPricelistItems(response.data);
                console.log('All items with prices:', response.data); // Log the fetched items
            })
            .catch(error => {
                console.error('Error fetching all items:', error);
            });
    }, []);

    const handlePricelistChange = (index, value) => {
        console.log(`Updating price for index ${index}:`, value);
        setPricelistItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                price: value, // Update the price
            };
            console.log('Updated Pricelist Items:', updatedItems);
            return updatedItems;
        });
    };

    // Modify the "Update" button functionality to call `fetchBuyers` instead of `fetchAllItems` after a successful update.
    const handleUpdatePricelistItem = (index) => {
        const item = pricelistItems[index]; // Use pricelistItems instead of allItemsList
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/buyer-pricelist-items/update`, {
            buyerId: selectedBuyerForPricelist,
            itemId: item.id, // Ensure itemID is used
            price: item.price // Send the updated price
        })
            .then(response => {
                console.log('Pricelist item updated successfully:', response.data);
                setPricelistItems(prevItems => {
                    const updatedItems = [...prevItems];
                    updatedItems[index].isUpdated = true;
                    return updatedItems;
                });

                // Refresh the table by calling fetchBuyers
                fetchBuyers();
            })
            .catch(error => {
                console.error('Error updating pricelist item:', error);
            });
    };

    async function fetchBuyerContacts(buyerId) {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/contacts/${buyerId}`);
            const data = response.data[0];
            console.log('Raw Buyer Contacts Data:', data);

            const formattedContacts = {
                buyerId: data.BuyerID,
                companyName: data.CompanyName,
                contactPerson: data.ContactPerson,
                notes: data.Notes,
                status: data.Status,
                createdAt: data.CreatedAt,
                primaryContact: data.PrimaryContact,
                otherContacts: data.OtherContacts ? data.OtherContacts.split('; ') : [] // Split other contacts into an array
            };
            console.log('Fetched Buyer Contacts:', formattedContacts);
            setBuyerContacts([formattedContacts]); // Set the contacts in state
            return formattedContacts;
        } catch (error) {
            console.error('Error fetching buyer contacts:', error);
            return null;
        }
    }

    const toPascalCase = (str) => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleShowContacts = async (buyerId) => {
        const contacts = await fetchBuyerContacts(buyerId); // Fetch formatted contacts
        if (contacts) {
            setBuyerContacts([contacts]); // Set the contacts in state
            setShowContactsModal(true);
        } else {
            console.error('No contacts found for BuyerID:', buyerId);
        }
    };

    const handleViewPricelist = async (buyerId, companyName) => {
        try {
            console.log('Fetching pricelist for BuyerID:', buyerId);
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items-with-prices?buyerId=${buyerId}`);
            const filteredItems = response.data.filter(item => item.price !== ''); // Filter out items with empty price
            setViewPricelistName(companyName);
            setViewPricelistItems(filteredItems);
            console.log('Pricelist for view-only modal:', filteredItems);
            setShowViewPricelistModal(true);
        } catch (error) {
            console.error('Error fetching pricelist for view-only modal:', error);
        }
    };

    // Function to handle adding a new buyer
    const handleAddBuyer = (buyerData) => {
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/buyers`, buyerData)
            .then(response => {
                console.log('Buyer added successfully:', response.data);
                setShowAddBuyerModal(false);
                setNewBuyerName('');
                setNewBuyerCompany('');
                setNewBuyerNotes('');
                setNewBuyerContactMethod('');
                setNewBuyerContactDetail('');
                fetchBuyers(); // Refresh the buyers list

                // Show success alert
                setSuccessMessage('Buyer added successfully!');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000); // Auto-hide after 3 seconds
            })
            .catch(error => {
                console.error('Error adding buyer:', error);
            });
    };

    // Function to handle opening the "Edit Buyer" modal
    const handleEditBuyer = async (buyerId) => {
        const contacts = await fetchBuyerContacts(buyerId);
        if (contacts) {
            setEditBuyerId(contacts.buyerId);
            setEditBuyerCompany(contacts.companyName);
            setEditBuyerName(contacts.contactPerson);
            setEditBuyerNotes(contacts.notes || '');
            setEditBuyerStatus(contacts.status || 'active');
            setShowEditBuyerModal(true);
        } else {
            console.error('No contacts found for BuyerID:', buyerId);
        }
    };

    // Function to handle saving the edited buyer details
    const handleSaveBuyer = () => {
        axios.put(`${process.env.REACT_APP_BASE_URL}/api/buyers/${editBuyerId}`, {
            companyName: editBuyerCompany,
            contactPerson: editBuyerName,
            // contactMethod: editBuyerContactMethod,
            // contactDetail: editBuyerContactDetail,
            notes: editBuyerNotes,
            status: editBuyerStatus,
        })
            .then(response => {
                console.log('Buyer updated successfully:', response.data);
                setShowEditBuyerModal(false);
                fetchBuyers(); // Refresh the buyers list

                // Show success alert
                setSuccessMessage('Buyer updated successfully!');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000); // Auto-hide after 3 seconds
            })
            .catch(error => {
                console.error('Error updating buyer:', error);
            });
    };

    return (
        <div>
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
                <h1>Buyers and Pricing</h1>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Form className="d-flex align-items-center">
                    <Form.Group controlId="buyerSelect" className="me-3">
                        <Form.Label>Buyer</Form.Label>
                        <Form.Select
                            value={selectedBuyer}
                            onChange={e => setSelectedBuyer(e.target.value)}
                        >
                            <option value="">All Buyers</option>
                            {buyers.map((buyer, index) => (
                                <option key={index} value={buyer}>{buyer}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="itemSelect" className="me-3">
                        <Form.Label>Item</Form.Label>
                        <Form.Select
                            value={selectedItem}
                            onChange={e => setSelectedItem(e.target.value)}
                        >
                            <option value="">All Items</option>
                            {items.map((item, index) => (
                                <option key={index} value={item.name}>{item.name}</option> // Use item.name as value
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
                <div>
                    {!isEmployee && (
                        <>
                            <Button variant="outline-dark" className="me-2" onClick={() => setShowEditPricelistModal(true)}>
                                Edit Buyer Pricelist
                            </Button>
                            <Button variant="outline-success" onClick={() => setShowAddBuyerModal(true)}>
                                Add Buyer
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Price</th>
                            <th>Company Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.length === 0 ? ( // Use filteredRows for display
                            <tr>
                                <td colSpan="4" className="text-center">No items available</td>
                            </tr>
                        ) : (
                            filteredRows.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.itemName}</td>
                                    <td>{row.price}</td>
                                    <td>{row.companyName}</td>
                                    <td>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowContacts(row.buyerId)}
                                        >
                                            <FaInfoCircle /> Contacts
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleViewPricelist(row.buyerId, row.companyName)}
                                        >
                                            View Pricelist
                                        </Button>
                                        {!isEmployee && (
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => handleEditBuyer(row.buyerId)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <Modal show={showEditPricelistModal} onHide={() => setShowEditPricelistModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Buyer Pricelist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="buyerSelectForPricelist" className="mb-3">
                        <Form.Select
                            value={selectedBuyerForPricelist}
                            onChange={e => {
                                const buyerId = e.target.value;
                                console.log("Selected buyer:", buyerId);
                                setSelectedBuyerForPricelist(buyerId);
                                fetchAllItems(buyerId); // Fetch items for the selected buyer
                            }}
                        >
                            <option value="">Select a buyer</option>
                            {buyerPricelist.map(({ id, companyName }) => (
                                <option key={id} value={id}>{companyName}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricelistItems.map((item, index) => (
                                    <tr key={item.id || `item-${index}`}>
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
                                                            setPricelistItems(prevItems => {
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

            <Modal
                show={showContactsModal}
                onHide={() => setShowContactsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Buyer Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        <Table striped bordered hover>
                            <tbody>
                                {buyerContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="text-center">No contacts available</td>
                                    </tr>
                                ) : (
                                    buyerContacts.map((contact, index) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <th>Company Name</th>
                                                <td>{toPascalCase(contact.companyName || "No Record")}</td>
                                            </tr>
                                            <tr>
                                                <th>Contact Person</th>
                                                <td>{toPascalCase(contact.contactPerson || "No Record")}</td>
                                            </tr>
                                            <tr>
                                                <th>Primary Contact</th>
                                                <td>{toPascalCase(contact.primaryContact || "No Record")}</td>
                                            </tr>
                                            <tr>
                                                <th>Status</th>
                                                <td>{toPascalCase(contact.status || "No Record")}</td>
                                            </tr>
                                            <tr>
                                                <th>Notes</th>
                                                <td>{toPascalCase(contact.notes || "No Record")}</td>
                                            </tr>
                                            <tr>
                                                <th>Other Contacts</th>
                                                <td>
                                                    {contact.otherContacts.length > 0 ? (
                                                        <ul>
                                                            {contact.otherContacts.map((otherContact, idx) => (
                                                                <li key={idx}>{toPascalCase(otherContact)}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        "No other contacts"
                                                    )}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowContactsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showViewPricelistModal}
                onHide={() => setShowViewPricelistModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{viewPricelistName} Pricelist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewPricelistItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="text-center">No items available</td>
                                    </tr>
                                ) : (
                                    viewPricelistItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}{item.classification ? ` - ${item.classification}` : ''}{item.unitOfMeasurement ? ` (${item.unitOfMeasurement})` : ''}</td>
                                            <td>{item.price}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewPricelistModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Buyer Modal */}
            <Modal show={showAddBuyerModal} onHide={() => setShowAddBuyerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Buyer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="newBuyerCompany" className="mb-3">
                            <Form.Label>
                                Company Name <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter company name"
                                value={newBuyerCompany}
                                onChange={e => setNewBuyerCompany(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="newBuyerName" className="mb-3">
                            <Form.Label>
                                Contact Person <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter contact person"
                                value={newBuyerName}
                                onChange={e => setNewBuyerName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="newBuyerContactMethod" className="mb-3">
                            <Form.Label>Contact Method</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter contact method (e.g., Phone, Email)"
                                value={newBuyerContactMethod}
                                onChange={e => setNewBuyerContactMethod(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="newBuyerContactDetail" className="mb-3">
                            <Form.Label>Contact Detail</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter contact detail (e.g., phone number, email address)"
                                value={newBuyerContactDetail}
                                onChange={e => setNewBuyerContactDetail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="newBuyerNotes" className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter notes (optional)"
                                value={newBuyerNotes}
                                onChange={e => setNewBuyerNotes(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddBuyerModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleAddBuyer({
                                companyName: newBuyerCompany,
                                contactPerson: newBuyerName,
                                notes: newBuyerNotes,
                                contactMethod: newBuyerContactMethod,
                                contactDetail: newBuyerContactDetail,
                            });
                        }}
                    >
                        Add Buyer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Buyer Modal */}
            <Modal show={showEditBuyerModal} onHide={() => setShowEditBuyerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Buyer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="editBuyerCompany" className="mb-3">
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editBuyerCompany}
                                onChange={e => setEditBuyerCompany(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="editBuyerName" className="mb-3">
                            <Form.Label>Contact Person</Form.Label>
                            <Form.Control
                                type="text"
                                value={editBuyerName}
                                onChange={e => setEditBuyerName(e.target.value)}
                            />
                        </Form.Group>
                        {/* <Form.Group controlId="editBuyerContactMethod" className="mb-3">
                            <Form.Label>Contact Method</Form.Label>
                            <Form.Control
                                type="text"
                                value={editBuyerContactMethod}
                                onChange={e => setEditBuyerContactMethod(e.target.value)}
                            />
                        </Form.Group> */}
                        {/* <Form.Group controlId="editBuyerContactDetail" className="mb-3">
                            <Form.Label>Contact Detail</Form.Label>
                            <Form.Control
                                type="text"
                                value={editBuyerContactDetail}
                                onChange={e => setEditBuyerContactDetail(e.target.value)}
                            />
                        </Form.Group> */}
                        <Form.Group controlId="editBuyerNotes" className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editBuyerNotes}
                                onChange={e => setEditBuyerNotes(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="editBuyerStatus" className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={editBuyerStatus}
                                onChange={e => setEditBuyerStatus(e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditBuyerModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveBuyer}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default BuyersPage;