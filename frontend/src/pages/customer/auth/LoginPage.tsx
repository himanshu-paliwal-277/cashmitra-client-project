import React from 'react';
import { Helmet } from 'react-helmet-async';
import Login from '../../../components/auth/Login';

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login - Cashmitra</title>
        <meta
          name="description"
          content="Sign in to your Cashmitra account to access your dashboard, manage your devices, and track your transactions."
        />
        <meta name="keywords" content="login, sign in, cashmitra, account, authentication" />
      </Helmet>
      <Login />
    </>
  );
};

export default LoginPage;
