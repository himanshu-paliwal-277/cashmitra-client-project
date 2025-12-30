import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentAuth } from '../../contexts/AgentAuthContext';
import { Mail, Lock, LogIn, Loader } from 'lucide-react';

const AgentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAgentAuth();
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-indigo-500 text-3xl font-bold mb-2">🚗 Cashmitra Agent</h1>
          <p className="text-gray-500 text-base">Welcome back! Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={20} className="absolute left-3 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="agent@cashmitra.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={20} className="absolute left-3 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-4 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mt-3 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:transform-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentLogin;
