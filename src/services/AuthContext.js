import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("site") || "");
    const navigate = useNavigate();

    const loginAction = async (data) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/login`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const res = response.data;
            console.log("Login response:", res);
            if (res.token && res.userType && res.username) {
                const { token, userType, username } = res;
                console.log("Login response data:", { token, userType, username });
                setUser({ username, userType });
                setToken(token);
                localStorage.setItem("site", token);

                if (userType === 'owner') {
                    console.log("Navigating to admin-dashboard for user:", username);
                    navigate(`/admin-dashboard/${username}`);
                    console.log("Navigation attempted to:", `/admin-dashboard/${username}`);
                } else if (userType === 'employee') {
                    navigate('/employee-dashboard');
                }
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            console.error(err);
        }
    };

    const logOut = () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("site");
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};