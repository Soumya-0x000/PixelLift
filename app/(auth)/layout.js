import React from 'react';

const AuthLayout = ({ children }) => {
    return <div className=' bg-transparent absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2'>{children}</div>;
};

export default AuthLayout;
