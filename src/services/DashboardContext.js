import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children, user }) => {
    const [balance, setBalance] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalPurchase, setTotalPurchase] = useState(0);
    const [totalSale, setTotalSale] = useState(0);
    const [branchName, setBranchName] = useState(null); // Add branch state
    const [branchLocation, setBranchLocation] = useState(null); // Add branch location state
    const [actualBranchId, setActualBranchId] = useState(null); // Store actual branch ID
    const [shiftId, setShiftId] = useState(null); // Store shift ID

    const refreshBalance = async () => {
        if (!user?.branchId || !user?.userID) return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/balance`,
                {
                    params: { branchId: user.branchId, userId: user.userID }
                }
            );
            setBalance(response.data);
        } catch (error) {
            console.error('Error refreshing balance:', error);
        }
    };

    const refreshTotalExpense = async () => {
        if (!user?.branchId || !user?.userID) return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/expense-balance`,
                {
                    params: { branchId: user.branchId, userId: user.userID }
                }
            );
            setTotalExpense(response.data);
        } catch (error) {
            console.error('Error refreshing expense balance:', error);
        }
    };

    const refreshTotalPurchase = async () => {
        if (!user?.branchId || !user?.userID) return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/purchase-balance`,
                {
                    params: { branchId: user.branchId, userId: user.userID }
                }
            );
            setTotalPurchase(response.data);
        } catch (error) {
            console.error('Error refreshing purchase balance:', error);
        }
    };

    const refreshTotalSale = async () => {
        if (!user?.branchId || !user?.userID) return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/sale-balance`,
                {
                    params: { branchId: user.branchId, userId: user.userID }
                }
            );
            setTotalSale(response.data);
        } catch (error) {
            console.error('Error refreshing sale balance:', error);
        }
    };

    const fetchActiveShift = useCallback(async () => {
        if (!user?.userID) return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`
            );

            if (response.error) {
                alert(response.error); // Display the error message from the backend
                return;
            }

            const { BranchID, ShiftID, Name, Location } = response.data[0];
            setActualBranchId(BranchID);
            setShiftId(ShiftID);
            setBranchName(Name);
            setBranchLocation(Location);
        } catch (error) {
            console.error('Error fetching active shift:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchActiveShift();
    }, [user, fetchActiveShift]);

    return (
        <DashboardContext.Provider value={{
            balance,
            refreshBalance,
            totalExpense,
            refreshTotalExpense,
            totalPurchase,
            refreshTotalPurchase,
            totalSale,
            refreshTotalSale,
            branchName,
            setBranchName,
            branchLocation,
            setBranchLocation,
            actualBranchId, // Provide actual branch ID
            shiftId, // Provide shift ID
            fetchActiveShift // Provide fetchActiveShift function
        }}>
            {children}
        </DashboardContext.Provider>
    );
};