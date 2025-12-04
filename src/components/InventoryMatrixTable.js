import React from 'react';
import { Table } from 'react-bootstrap';
import moment from 'moment-timezone';

// Component to render the final table structure based on filteredItems
function InventoryMatrixTable({ filteredItems, monthFilter, yearFilter }) {

    // --- Utility Functions (Adapted from your existing code) ---

    // 1. Determines the number of days in the selected month
    const generateDailyColumns = () => {
        // Ensure the date parsing uses 'Asia/Manila' as established in your setup
        const daysInMonth = monthFilter && yearFilter
            ? moment.tz(`${yearFilter}-${monthFilter}`, 'YYYY-M', 'Asia/Manila').daysInMonth()
            : moment.tz('Asia/Manila').daysInMonth();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    // 2. Determines the name of the previous month for the header
    const getHeaderMonthName = () => {
        if (monthFilter && yearFilter) {
            const selMonthIndex = parseInt(monthFilter, 10) - 1; // moment uses 0-11
            const selYear = parseInt(yearFilter, 10);
            return moment.tz([selYear, selMonthIndex], 'Asia/Manila').subtract(1, 'month').format('MMMM');
        }
        return moment.tz('Asia/Manila').subtract(1, 'month').format('MMMM');
    };

    const days = generateDailyColumns();
    const prevMonthName = getHeaderMonthName();

    // --- Header Construction ---
    const columns = [
        { title: 'Item' },
        { title: `${prevMonthName}` }, // Previous month stock (initial balance)
        ...days.map(day => ({ title: `${day}` })), // Daily columns
        { title: 'Total' }
    ];

    return (
        <div style={{ maxHeight: '70vh', maxWidth: '97%', overflowY: 'auto' }}>
            {/* The 'striped' attribute provides the alternating row colors */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ whiteSpace: 'nowrap' }}>{col.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((row, idx) => {
                        // Ensure dailyStock is an object, defaulting to empty if null/undefined
                        const dailyStock = row.dailyStock || {};

                        // Calculate the cumulative total stock based on the starting stock (lastMonthStock)
                        // and the sum of all daily changes (dailyStock)
                        const startingStock = parseFloat(row.lastMonthStock) || 0;
                        const dailyChangesSum = Object.values(dailyStock).reduce(
                            (sum, currentChange) => sum + (parseFloat(currentChange) || 0),
                            0
                        );
                        // The Total Stock is the Initial Balance + All Monthly Changes
                        const finalTotalStock = startingStock + dailyChangesSum;

                        return (
                            <tr key={row.ItemID || idx}>
                                {/* 1. Item Name */}
                                <td>{row.name ?? row.Name ?? 'N/A'}</td>

                                {/* 2. Previous Month Stock (Initial Balance) */}
                                <td className="text-right">{(startingStock).toFixed(2)}</td>

                                {/* 3. Daily Columns (Changes) */}
                                {days.map((day) => {
                                    // The dailyStock object contains the aggregate change for that day
                                    const change = dailyStock[day] ?? dailyStock[String(day)] ?? 0;
                                    const changeValue = parseFloat(change) || 0;

                                    // Highlight negative values for quick inventory insight
                                    const style = changeValue < 0 ? { color: 'red', fontWeight: 'bold' } : {};

                                    return (
                                        <td key={day} className="text-right" style={style}>
                                            {changeValue.toFixed(2)}
                                        </td>
                                    );
                                })}

                                {/* 4. Total Stock (Initial Balance + Monthly Changes) */}
                                <td className="text-right table-dark font-weight-bold">
                                    {finalTotalStock.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}

export default InventoryMatrixTable;