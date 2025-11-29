import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children, user }) => {
    const [balance, setBalance] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalPurchase, setTotalPurchase] = useState(0);
    const [totalSale, setTotalSale] = useState(0);
    const [branch, setBranch] = useState(null); // Add branch state

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
            branch,
            setBranch // Provide branch state and updater
        }}>
            {children}
        </DashboardContext.Provider>
    );
};