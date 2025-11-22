import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5

const PrivateRoute = () => {
    // const user = useAuth();
    // if (!user.token) return <Navigate to="/" />;
    const { user, token } = useAuth(); // Access user and token from AuthContext

    if (!user || !token) {
        return <Navigate to="/" replace />; // Redirect to login page if not authenticated
    }
    return <Outlet />;
};

export default PrivateRoute;