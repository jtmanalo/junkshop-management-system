import React from 'react';
import NavBar from './NavBar';

const Layout = ({ children, variant }) => {
    return (
        <div>
            <NavBar variant={variant} />
            <main>{children}</main>
        </div>
    );
};

export default Layout;