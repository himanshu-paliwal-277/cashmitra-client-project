import React from 'react';
import { Helmet } from 'react-helmet-async';
import Signup from '../../components/auth/Signup';

const SignupPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign Up - Cashmitra</title>
        <meta
          name="description"
          content="Create your Cashmitra account to start buying and selling devices, get instant quotes, and enjoy secure transactions."
        />
        <meta name="keywords" content="signup, register, create account, cashmitra, join" />
      </Helmet>
      <Signup />
    </>
  );
};

export default SignupPage;
