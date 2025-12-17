import { useState, useEffect } from 'react';
import api from '../services/api';

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/user/profile', profileData);
      setProfile(response.data);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile picture
  const updateProfilePicture = async (imageFile: any) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);

      const response = await api.put('/user/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });      setProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update profile picture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/user/profile/password', passwordData);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateProfilePicture,
    changePassword,
  };
};

export default useUserProfile;
