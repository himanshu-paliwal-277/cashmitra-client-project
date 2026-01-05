import { useState, useEffect } from 'react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  priority: string;
  interestedIn: string;
  deviceType?: string;
  estimatedValue?: number;
  notes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  followUpDate?: string;
  lastContactDate?: string;
  conversionDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface LeadStats {
  overview: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
    avgEstimatedValue: number;
  };
  conversionRate: number;
  sourceBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

interface UseAdminLeadsReturn {
  leads: Lead[];
  stats: LeadStats | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  fetchLeads: (params?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  createLead: (leadData: any) => Promise<Lead | null>;
  updateLead: (id: string, leadData: any) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<boolean>;
  assignLead: (id: string, userId: string) => Promise<Lead | null>;
}

const useAdminLeads = (): UseAdminLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchLeads = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/admin/leads${queryParams ? `?${queryParams}` : ''}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/leads/stats', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching lead stats:', err);
    }
  };

  const createLead = async (leadData: any): Promise<Lead | null> => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      const data = await response.json();
      await fetchLeads();
      await fetchStats();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
      console.error('Error creating lead:', err);
      return null;
    }
  };

  const updateLead = async (id: string, leadData: any): Promise<Lead | null> => {
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      const data = await response.json();
      await fetchLeads();
      await fetchStats();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update lead');
      console.error('Error updating lead:', err);
      return null;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      await fetchLeads();
      await fetchStats();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete lead');
      console.error('Error deleting lead:', err);
      return false;
    }
  };

  const assignLead = async (id: string, userId: string): Promise<Lead | null> => {
    try {
      const response = await fetch(`/api/admin/leads/${id}/assign`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ assignedTo: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign lead');
      }

      const data = await response.json();
      await fetchLeads();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to assign lead');
      console.error('Error assigning lead:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  return {
    leads,
    stats,
    pagination,
    loading,
    error,
    fetchLeads,
    fetchStats,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
  };
};

export default useAdminLeads;
