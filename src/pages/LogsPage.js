import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import moment from 'moment-timezone';
import { useDashboard } from '../services/DashboardContext';

function LogsPage() {
    const { token, user } = useAuth();
    const { shiftId } = useDashboard();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeShiftError, setActiveShiftError] = useState('');

    useEffect(() => {
        const fetchActiveShift = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`);
                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error('No active shift found');
                }
                const { ShiftID } = response.data[0];
                console.log('Active ShiftID:', ShiftID);
            } catch (error) {
                console.error('Error fetching active shift:', error.message);
                setActiveShiftError('Shift has not yet started.');
            }
        };

        fetchActiveShift();
    });

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            console.log('Fetching logs for shiftId:', shiftId);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/daily-logs/${shiftId}`);
                setLogs(response.data);
            } catch (error) {
                console.error('Error fetching logs:', error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [token, user.id]);

    return (
        <div>
            <h1>Logs</h1>
            {activeShiftError ? (
                <div className="alert alert-danger text-center">
                    {activeShiftError}
                </div>
            ) : isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status" />
                </div>
            ) : logs.length === 0 ? (
                <p>No transactions found for the active shift.</p>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Transaction Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => (
                            <tr key={index}>
                                <td>{moment(log.TransactionDate).tz('Asia/Manila').format('HH:mm')}</td>
                                <td>{log.TransactionType}</td>
                                <td>{log.TotalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}

export default LogsPage;