import React, { useState } from 'react';
import { Table, Form, OverlayTrigger, Popover, Spinner } from 'react-bootstrap';
import moment from 'moment-timezone';
import axios from 'axios';

// Component to render the final table structure based on filteredItems
function InventoryMatrixTable({ filteredItems, monthFilter, yearFilter, itemPrices, handlePriceChange }) {

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

    const [hoverData, setHoverData] = useState({}); // { [itemId]: { bestBuyer: string, bestPrice: number, currentStockValue: number } }
    const [loadingItem, setLoadingItem] = useState(null);

    const fetchBestSellDetails = async (itemId, currentPrice, totalStock) => {
        if (hoverData[itemId] || loadingItem === itemId) {
            return; // Already fetched or currently loading
        }

        setLoadingItem(itemId);
        try {
            // New API endpoint to fetch best buyer pricelist data
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/best-sell-price`, {
                params: { itemId }
            });
            const data = response.data;

            // The data structure has bestSellPrice as a nested object
            const bestSellData = data.bestSellPrice || data;

            // Assuming the backend returns the best buyer and their price
            const bestBuyerName = bestSellData.BestBuyerName || 'N/A';
            const bestBuyerPrice = parseFloat(bestSellData.BestBuyerPrice) || 0;

            // Total computed value based on the BEST SELL PRICE
            const bestValue = bestBuyerPrice * totalStock;

            console.log('Fetched best sell details:', bestSellData);

            setHoverData(prev => ({
                ...prev,
                [itemId]: {
                    bestBuyerName,
                    bestBuyerPrice,
                    bestValue: bestValue.toFixed(2),
                    // Total computed value based on the USER'S editable price (currentPrice)
                    currentStockValue: (currentPrice * totalStock).toFixed(2),
                }
            }));

        } catch (error) {
            console.error('Error fetching best sell details:', error);
            setHoverData(prev => ({
                ...prev,
                [itemId]: { bestBuyerName: 'N/A', bestBuyerPrice: 0, bestValue: '0.00', currentStockValue: (currentPrice * totalStock).toFixed(2) }
            }));
        } finally {
            setLoadingItem(null);
        }
    };

    const totalCurrentStockValue = filteredItems.reduce((total, row) => {
        const itemId = row.ItemID;
        const finalTotalStock = (parseFloat(row.lastMonthStock) || 0) + Object.values(row.dailyStock || {}).reduce((sum, current) => sum + (parseFloat(current) || 0), 0);
        const price = parseFloat(itemPrices[itemId]) || 0;
        return total + (price * finalTotalStock);
    }, 0);

    // --- Header Construction ---
    const columns = [
        { title: '' },
        { title: '' },
        { title: '' },
        { title: '' },
        { title: `${prevMonthName}` }, // Previous month stock (initial balance)
        ...days.map(day => ({ title: `${day}` })), // Daily columns
    ];

    const renderPopover = (itemData) => {
        const data = hoverData[itemData.ItemID];
        const isLoading = loadingItem === itemData.ItemID;

        // Use the editable price for the "Current Branch Value" calculation
        const currentPrice = parseFloat(itemPrices[itemData.ItemID]) || 0;
        const currentBranchValue = currentPrice * itemData.finalTotalStock;


        return (
            <Popover id={`popover-basic-${itemData.ItemID}`} style={{ maxWidth: '300px' }}>
                <Popover.Header as="h3">Sales Recommendation</Popover.Header>
                <Popover.Body>
                    {isLoading ? (
                        <div className="text-center"><Spinner animation="border" size="sm" /> Loading...</div>
                    ) : data ? (
                        <>
                            <p>
                                <strong>Best Buyer:</strong> {data.bestBuyerName}<br />
                                <strong>Best Buyer Price:</strong> ₱{data.bestBuyerPrice}
                            </p>
                            <hr />
                            <p>
                                <strong>Potential Total Value:</strong> <br />
                                <small>@ Best Buyer Price (₱{data.bestBuyerPrice}):</small>
                                <br />
                                <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: 'green' }}>₱{data.bestValue}</span>
                            </p>
                            <p>
                                <small>@ Cost Price (₱{currentPrice.toFixed(2)}):</small>
                                <br />
                                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>₱{currentBranchValue.toFixed(2)}</span>
                            </p>
                            <small className="text-muted">Use the editable price column to test different scenarios.</small>
                        </>
                    ) : (
                        <p>Hover to load best selling option details.</p>
                    )}
                </Popover.Body>
            </Popover>
        );
    };

    return (
        <div style={{ maxHeight: '90vh', maxWidth: '80%', overflowY: 'auto' }}>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            // Span columns for the daily changes section
                            col.title === `${prevMonthName}` && days.length > 0 ? (
                                <th key={index} colSpan={days.length + 1} style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                                    {`Stock Movement in ${moment.tz(`${yearFilter}-${monthFilter}`, 'YYYY-M', 'Asia/Manila').format('MMMM YYYY')}`}
                                </th>
                            ) :
                                // Render other columns
                                !days.includes(parseInt(col.title)) && col.title !== `${prevMonthName}` ? (
                                    <th key={index} style={{ whiteSpace: 'nowrap' }}>{col.title}</th>
                                ) : null
                        ))}
                    </tr>
                    <tr>
                        {/* Render all original and new header columns for alignment */}
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Name</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Stock</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Price</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Value</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{prevMonthName}</th>
                        {days.map(day => (<th key={day} style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{day}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((row, idx) => {
                        const dailyStock = row.dailyStock || {};
                        const startingStock = parseFloat(row.lastMonthStock) || 0;
                        const dailyChangesSum = Object.values(dailyStock).reduce(
                            (sum, currentChange) => sum + (parseFloat(currentChange) || 0),
                            0
                        );
                        const finalTotalStock = startingStock + dailyChangesSum;

                        // Price from the parent state
                        const currentPrice = parseFloat(itemPrices[row.ItemID]) || 0;
                        const computedValue = currentPrice * finalTotalStock;

                        // Create a temporary object for popover data
                        const itemHoverData = { ...row, finalTotalStock };

                        return (
                            <tr key={row.ItemID || idx} className="inventory-row">
                                {/* 1. Item Name */}
                                <td>
                                    <OverlayTrigger
                                        placement="right"
                                        delay={{ show: 100, hide: 400 }}
                                        overlay={renderPopover(itemHoverData)}
                                        onEnter={() => fetchBestSellDetails(row.ItemID, currentPrice, finalTotalStock)}
                                    >
                                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                            {row.name ?? row.Name ?? 'N/A'}
                                        </span>
                                    </OverlayTrigger>
                                </td>

                                {/* 2. Total Stock */}
                                <td className="text-center table-dark font-weight-bold">
                                    {finalTotalStock.toFixed(2)}
                                </td>

                                {/* 3. Editable Price Column */}
                                <td>
                                    <Form.Control
                                        type="number"
                                        size="sm"
                                        value={currentPrice}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            handlePriceChange(row.ItemID, value);
                                        }}
                                        min="0"
                                        step="0.01"
                                        style={{ minWidth: '80px' }}
                                    />
                                </td>

                                {/* 4. Computed Value Column */}
                                <td className="text-center table-warning font-weight-bold">
                                    ₱{computedValue.toFixed(2)}
                                </td>

                                {/* 5. Previous Month Stock (Initial Balance) */}
                                <td className="text-center">{(startingStock).toFixed(2)}</td>

                                {/* 6. Daily Columns (Changes) */}
                                {days.map((day) => {
                                    const change = dailyStock[day] ?? dailyStock[String(day)] ?? 0;
                                    const changeValue = parseFloat(change) || 0;
                                    const style = changeValue < 0 ? { color: 'red', fontWeight: 'bold', textAlign: 'center' } : { textAlign: 'center' };
                                    return (
                                        <td key={day} style={style}>
                                            {changeValue.toFixed(2)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
                {/* *** NEW: Footer Row for Totals *** */}
                <tfoot>
                    <tr className="table-primary">
                        <td colSpan={2}></td>
                        <td style={{ textAlign: 'center' }}>
                            <strong className="text-uppercase">TOTAL VALUE</strong>
                        </td>
                        <td className="table-warning font-weight-bold" style={{ textAlign: 'center', fontSize: '1.2em' }}>
                            ₱{totalCurrentStockValue.toFixed(2)}
                        </td>
                        <td colSpan={days.length + 1}></td>
                    </tr>
                </tfoot>
            </Table>
        </div>
    );
}

export default InventoryMatrixTable;