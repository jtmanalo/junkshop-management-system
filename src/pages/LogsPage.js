import { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment-timezone';
import { useDashboard } from '../services/DashboardContext';

function LogsPage() {
    const { shiftId } = useDashboard();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeShiftError, setActiveShiftError] = useState('');

    console.log('LogsPage shiftId:', shiftId);

    // useEffect(() => {
    //     const fetchActiveShift = async () => {
    //         try {
    //             const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`);
    //             if (!response.data || Object.keys(response.data).length === 0) {
    //                 throw new Error('No active shift found');
    //             }
    //             const { ShiftID } = response.data[0];
    //             console.log('Active ShiftID:', ShiftID);
    //         } catch (error) {
    //             console.error('Error fetching active shift:', error.message);
    //             setActiveShiftError('Shift has not yet started.');
    //         }
    //     };

    //     fetchActiveShift();
    // });

    useEffect(() => {
        if (!shiftId) {
            console.log('Shift ID is null, skipping fetchLogs');
            return;
        }

        const fetchLogs = async () => {
            setIsLoading(true);
            console.log('Fetching logs for shiftId:', shiftId);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/daily-logs/${shiftId}`);
                const sortedLogs = response.data.sort((a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate));
                setLogs(sortedLogs);
            } catch (error) {
                console.error('Error fetching logs:', error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [shiftId]);

    return (
        <div>
            {activeShiftError ? (
                <div className="alert alert-danger text-center">
                    {activeShiftError}
                </div>
            ) : isLoading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f8f9fa',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1050,
                }}>
                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                </div>
            ) : logs.length === 0 ? (
                <div>
                    <h3 style={{ textAlign: 'center' }}>Transaction Logs</h3>
                    <p>No transactions found for the active shift.</p>
                </div>
            ) : (
                <div>
                    <h3 style={{ textAlign: 'center' }}>Transaction Logs</h3>
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Transaction Type</th>
                                    <th>Payment Method</th>
                                    <th>Notes</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{moment(log.TransactionDate).tz('Asia/Manila').format('HH:mm')}</td>
                                        <td>{log.TransactionType.toUpperCase()}</td>
                                        <td>{log.PaymentMethod.toUpperCase()}</td>
                                        <td>{log.Notes ? log.Notes.toUpperCase() : ''}</td>
                                        <td>{`₱${log.TotalAmount}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LogsPage;