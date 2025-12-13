import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendContactForm = async (formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await api.post('/contact', formData);
    return response.data;
  } catch (error: any) {
    console.error('Error sending contact form:', error);
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

export const getContactInfo = async () => {
  try {
    const response = await api.get('/contact/info');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching contact info:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch contact information');
  }
};

const contactService = {
  sendContactForm,
  getContactInfo,
};

export default contactService;
