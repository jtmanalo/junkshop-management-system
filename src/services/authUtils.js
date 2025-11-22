export const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('rememberMeToken'); // Remove token if stored
    localStorage.removeItem('user'); // Remove user data if stored

    // Redirect to login page
    window.location.href = '/';
};