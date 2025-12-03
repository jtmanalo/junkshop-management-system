import React, { useState, useEffect } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';


function InventoryPage() {
    const [branches, setBranches] = useState([]);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [branchFilter, setBranchFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBranches = async () => {
            axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`)
                .then(response => {
                    setBranches(response.data);
                    if (response.data.length > 0) {
                        setBranchFilter(response.data[0].Name); // Set the first branch as default
                    }
                })
                .catch(error => {
                    console.error('Error fetching branches:', error);
                });
        };

        const fetchItems = async () => {
            try {
                const itemData = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items`);
                setItems(itemData.data);
                setFilteredItems(itemData.data);
            } catch (error) {
                console.error('Error fetching items:', error);
                setItems([]);
                setFilteredItems([]);
            }
        };

        fetchBranches();
        fetchItems();
    }, []);

    useEffect(() => {
        let filtered = items;

        if (branchFilter) {
            filtered = filtered.filter(item => item.branch === branchFilter);
        }

        if (monthFilter) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() + 1 === parseInt(monthFilter);
            });
        }

        if (yearFilter) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === parseInt(yearFilter);
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredItems(filtered);
    }, [branchFilter, monthFilter, yearFilter, searchTerm, items]);

    const generateDailyColumns = () => {
        const daysInMonth = monthFilter && yearFilter
            ? new Date(yearFilter, monthFilter, 0).getDate()
            : 31; // Default to 31 days if month/year not selected
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const columns = [
        { data: 'name', title: 'Item' },
        { data: 'lastMonthStock', title: 'Last Month Stock' },
        ...generateDailyColumns().map(day => ({ data: `dailyStock.${day}`, title: day.toString() })),
        { data: 'totalStock', title: 'Total Stock' }
    ];

    const settings = {
        colHeaders: columns.map(col => col.title),
        columns,
        fixedColumnsStart: 2, // Freeze "Item" and "Last Month Stock"
        fixedColumnsEnd: 1, // Freeze "Total Stock"
        autoColumnSize: true, // Automatically adjust column width based on contente
        licenseKey: 'non-commercial-and-evaluation',
    };

    return (
        <div>
            <h1>Inventory</h1>

            <Form style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Form.Group controlId="branchFilter" style={{ marginRight: '10px' }}>
                    <Form.Label>Branch</Form.Label>
                    <Form.Control
                        as="select"
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                    >
                        {branches.map(branch => (
                            <option key={branch.id} value={branch.Name}>{branch.Name} - {branch.Location}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="monthFilter" style={{ marginRight: '10px' }}>
                    <Form.Label>Month</Form.Label>
                    <Form.Control
                        as="select"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="yearFilter" style={{ marginRight: '10px' }}>
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter year"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="searchBar" style={{ marginRight: '10px', flexGrow: 1 }}>
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search items"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
            </Form>

            <HotTable
                data={filteredItems}
                autoColumnResize={true}
                settings={settings}
            />
        </div>
    );
}

export default InventoryPage;