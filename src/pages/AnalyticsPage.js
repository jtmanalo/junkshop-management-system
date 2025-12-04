import SalesPerformanceChart from '../components/SalesPerformanceChart';
import BreakEvenChart from '../components/BreakEvenChart';
import ProfitMarginBarChart from '../components/ProfitMarginBarChart';
import ExpenseBreakdownDonut from '../components/ExpenseBreakdownDonut';
import ExpenseTrendStackedBar from '../components/ExpenseTrendStackedBar';
import LocationAnalysisTable from '../components/LocationAnalysisTable';
import PriceTrendGraph from '../components/PriceTrendGraph';
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function AnalyticsPage() {
    // --- State for Filters and Data ---
    const [entityTypeFilter, setEntityTypeFilter] = useState('buyer'); // 'buyer' or 'branch'
    const [entities, setEntities] = useState([]); // List of buyers OR branches
    const [items, setItems] = useState([]); // List of all items

    // --- State for Chart Inputs ---
    const [selectedEntityId, setSelectedEntityId] = useState(null); // The ID of the selected buyer/branch
    const [selectedItemId, setSelectedItemId] = useState(null); // The ID of the selected item

    const [loadingEntities, setLoadingEntities] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    // --- Data Fetching Functions ---

    const fetchItems = useCallback(async () => {
        setLoadingItems(true);
        try {
            // Assuming this API returns a list of all items {ItemID, Name, Classification}
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items`);
            console.log('Fetched items:', response.data);
            setItems(response.data.map(item => ({
                id: item.ItemID,
                name: `${item.Name}${item.Classification ? ` - ${item.Classification}` : ''}`,
            })));
            setLoadingItems(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            setLoadingItems(false);
            setItems([]);
        }
    }, []);

    const fetchEntities = useCallback(async (type) => {
        setLoadingEntities(true);
        setEntities([]);
        setSelectedEntityId(null);

        const endpoint = type === 'buyer' ? '/api/buyers-list' : '/api/branches'; // Assuming a simple list API

        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}${endpoint}`);

            const entityData = response.data.map(e => ({
                id: type === 'buyer' ? e.BuyerID : e.BranchID,
                name: type === 'buyer' ? e.CompanyName : `${e.Name} - ${e.Location}`,
            }));

            setEntities(entityData);

            // Set first item as default selection
            if (entityData.length > 0) {
                setSelectedEntityId(entityData[0].id);
            }
            setLoadingEntities(false);
        } catch (error) {
            console.error(`Error fetching ${type}s:`, error);
            setLoadingEntities(false);
            setEntities([]);
        }
    }, []);

    // --- useEffect Hooks ---

    // 1. Initial Load: Fetch all items and default entities (buyers)
    useEffect(() => {
        fetchItems();
        fetchEntities(entityTypeFilter);
    }, [fetchItems, fetchEntities]);

    // 2. Entity Type Change: Refetch entities when the dropdown changes
    useEffect(() => {
        fetchEntities(entityTypeFilter);
    }, [entityTypeFilter, fetchEntities]);

    // 3. Set Initial Item ID: Once items are loaded, set the first one as default
    useEffect(() => {
        if (items.length > 0 && selectedItemId === null) {
            setSelectedItemId(items[0].id);
        }
    }, [items, selectedItemId]);

    // --- Render Logic ---
    const isLoading = loadingEntities || loadingItems;

    return (
        <div>
            <h1 className="mb-4">Analytics Dashboard</h1>

            <Card className="mb-4 p-3">
                <Row className="g-3">
                    {/* Entity Type Selector (Buyer/Branch) */}
                    <Col xs={12} md={3}>
                        <Form.Group controlId="entityTypeFilter">
                            <Form.Label>Entity Type</Form.Label>
                            <Form.Select
                                value={entityTypeFilter}
                                onChange={(e) => setEntityTypeFilter(e.target.value)}
                            >
                                <option value="buyer">Buyer</option>
                                <option value="branch">Branch</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Entity Selector (Buyer Name or Branch Name) */}
                    <Col xs={12} md={5}>
                        <Form.Group controlId="entitySelect">
                            <Form.Label>{entityTypeFilter === 'buyer' ? 'Buyer' : 'Branch'} Name</Form.Label>
                            <Form.Select
                                value={selectedEntityId || ''}
                                onChange={(e) => setSelectedEntityId(e.target.value)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <option>Loading...</option>
                                ) : (
                                    entities.map(entity => (
                                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                                    ))
                                )}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Item Selector */}
                    <Col xs={12} md={4}>
                        <Form.Group controlId="itemSelect">
                            <Form.Label>Item</Form.Label>
                            <Form.Select
                                value={selectedItemId || ''}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <option>Loading...</option>
                                ) : (
                                    items.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))
                                )}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>

            <hr />

            {/* --- Charts Section --- */}
            <div className="d-flex flex-column gap-4" style={{ width: '100%' }}>
                <Card body>
                    {/* Price Trend Graph */}
                    <h5 className="mb-3">Price Trend Analysis</h5>
                    {selectedEntityId && selectedItemId && !isLoading ? (
                        <PriceTrendGraph
                            entityId={selectedEntityId}
                            entityType={entityTypeFilter} // Passes 'buyer' or 'branch'
                            itemId={selectedItemId}
                        />
                    ) : (
                        <div className="text-center p-5 text-muted">
                            {isLoading ? "Fetching data lists..." : "Select an entity and an item to view the trend."}
                        </div>
                    )}
                </Card>

                {/* Placeholder for other charts */}
                {/* <SalesPerformanceChart /> */}
                {/* <BreakEvenChart /> */}
                {/* <ProfitMarginBarChart /> */}
            </div>
        </div>
    );
}

export default AnalyticsPage;

// function AnalyticsPage() {
//     const [defaultEntityId, setDefaultEntityId] = useState(null);
//     const [defaultItemId, setDefaultItemId] = useState(null);
//     const [defaultEntityType, setDefaultEntityType] = useState('buyer');

//     return (
//         <div>
//             <h1 className="mb-4">Analytics</h1>
//             <div className="d-flex gap-4" style={{ width: '100%' }}>
//                 {/* <SalesPerformanceChart />
//                 <BreakEvenChart /> */}
//                 {defaultEntityId && defaultItemId ? (
//                     <PriceTrendGraph
//                         entityId={defaultEntityId}
//                         entityType={defaultEntityType}
//                         itemId={defaultItemId}
//                     />
//                 ) : (
//                     <div>Select an item and a buyer or branch to view the price trend.</div>
//                 )}
//             </div>
//             <div className="d-flex gap-4" style={{ width: '100%' }}>
//                 {/* <ProfitMarginBarChart />
//                 <ExpenseBreakdownDonut /> */}
//             </div>
//             <div className="d-flex gap-4" style={{ width: '100%' }}>
//                 {/* <ExpenseTrendStackedBar />
//                 <LocationAnalysisTable /> */}
//             </div>
//         </div>
//     );
// }

// export default AnalyticsPage;