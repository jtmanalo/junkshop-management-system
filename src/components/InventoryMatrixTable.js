import React, { useState } from 'react';
import { Card, Table, Form } from 'react-bootstrap';

// Sample items and matrix data
const items = [
    'Item A', 'Item B', 'Item C', 'Item D', 'Item E', 'Item F', 'Item G', 'Item H', 'Item I', 'Item J'
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function InventoryMatrixTable() {
    const [search, setSearch] = useState('');
    // Month/year dropdowns
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = [2023, 2024, 2025, 2026];
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
        <Card className="shadow-sm border-0 " style={{ width: 1800, maxWidth: 1800, padding: '8px 8px 8px 8px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0">Inventory Matrix</h4>
                <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <Form.Select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: 140 }}>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </Form.Select>
                    <Form.Select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ width: 100 }}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </Form.Select>
                    <Form.Control
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 260 }}
                    />
                </div>
            </div>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <Table bordered hover responsive size="sm" className="mb-0" style={{ minWidth: 1700 }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: 120 }}>Item</th>
                            <th style={{ minWidth: 80 }}>{prevMonthName}</th>
                            {daysInMonth.map(day => (
                                <th key={day} style={{ minWidth: 48, textAlign: 'center' }}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(row => (
                            <tr key={row.item}>
                                <td>{row.item}</td>
                                <td style={{ textAlign: 'center' }}>{row.prevMonth}</td>
                                {row.days.map((qty, idx) => (
                                    <td key={idx} style={{ textAlign: 'center' }}>{qty}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Card>
    );
}

export default InventoryMatrixTable;
