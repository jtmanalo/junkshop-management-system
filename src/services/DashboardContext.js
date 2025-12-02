import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children, user }) => {
    const [branchName, setBranchName] = useState(null); // Add branch state
    const [branchLocation, setBranchLocation] = useState(null); // Add branch location state
    const [actualBranchId, setActualBranchId] = useState(null); // Store actual branch ID
    const [shiftId, setShiftId] = useState(null); // Store shift ID

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
    }, [fetchActiveShift]);

    return (
        <DashboardContext.Provider value={{
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