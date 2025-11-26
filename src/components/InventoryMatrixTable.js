import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

// Sample items and matrix data
const items = [
    'Item A', 'Item B', 'Item C', 'Item D', 'Item E', 'Item F', 'Item G', 'Item H', 'Item I', 'Item J'
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function InventoryMatrixTable() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('all');

    const [errors, setErrors] = useState({});
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    // Month/year dropdowns
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = [2023, 2024, 2025, 2026];
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchBranches = useCallback(() => {
        if (!user?.username) return; // Ensure user is defined before making the API call
        console.log('Fetching branches for username:', user.username);
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches/${user.username}`)
            .then(response => {
                console.log('API Response:', response.data);
                const formattedBranches = response.data.map(branch => ({
                    id: branch.id,
                    displayName: `${branch.Name} - ${branch.Location}`
                }));
                setBranches(formattedBranches);
            })
            .catch(error => {
                console.error('Error fetching branches:', error);
            });
    }, [user?.username]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    // Helper to get days in selected month/year
    function getDaysInMonth(month, year) {
        const monthIdx = months.indexOf(month);
        return new Date(year, monthIdx + 1, 0).getDate();
    }
    const daysCount = getDaysInMonth(selectedMonth, selectedYear);
    const daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);

    // Regenerate matrix data for correct days per month
    const matrixData = items.map(item => ({
        item,
        prevMonth: getRandomInt(0, 50),
        days: Array.from({ length: daysCount }, () => getRandomInt(0, 20)),
    }));

    const filtered = matrixData.filter(row => row.item.toLowerCase().includes(search.toLowerCase()));

    // Get previous month name
    const selectedMonthIdx = months.indexOf(selectedMonth);
    const prevMonthIdx = (selectedMonthIdx - 1 + months.length) % months.length;
    const prevMonthName = months[prevMonthIdx];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Inventory</h1>
            </div>
            <Form className="mb-3 d-flex align-items-center" style={{ gap: '12px' }}>
                <Form.Select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} style={{ width: 405 }}>
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.displayName}>{branch.displayName}</option>
                    ))}
                </Form.Select>
                <Form.Select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: 140 }}>
                    {months.map((m, index) => <option key={index} value={m}>{m}</option>)}
                </Form.Select>
                <Form.Select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ width: 100 }}>
                    {years.map((y, index) => <option key={index} value={y}>{y}</option>)}
                </Form.Select>
                <Form.Control
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 260 }}
                />
            </Form>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <Table striped bordered hover responsive size="sm" className="mb-0" style={{ minWidth: 1700 }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: 120 }}>Item</th>
                            <th style={{ minWidth: 80 }}>{prevMonthName}</th>
                            {daysInMonth.map((day, index) => (
                                <th key={index} style={{ minWidth: 48, textAlign: 'center' }}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={daysInMonth.length + 2} style={{ textAlign: 'center' }}>No items found</td>
                            </tr>
                        ) : (
                            filtered.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{row.item}</td>
                                    <td style={{ textAlign: 'center' }}>{row.prevMonth}</td>
                                    {row.days.map((qty, dayIndex) => (
                                        <td key={`${rowIndex}-${dayIndex}`} style={{ textAlign: 'center' }}>{qty}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default InventoryMatrixTable;
