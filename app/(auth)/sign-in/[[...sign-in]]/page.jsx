import { SignIn } from '@clerk/nextjs';
import React from 'react';

const SignInPage = () => {
    return <SignIn forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" />;
};

export default SignInPage;
