import api from './api';

class PickupService {
  // Get all pickups with pagination and filters
  async getAllPickups(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      // @ts-expect-error
      if (params.page) queryParams.append('page', params.page);
      // @ts-expect-error
      if (params.limit) queryParams.append('limit', params.limit);
      // @ts-expect-error
      if (params.search) queryParams.append('search', params.search);
      // @ts-expect-error
      if (params.status) queryParams.append('status', params.status);
      // @ts-expect-error
      if (params.startDate) queryParams.append('startDate', params.startDate);
      // @ts-expect-error
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/pickups?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickups:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Get pickup by ID
  async getPickupById(pickupId: any) {
    try {
      const response = await api.get(`/pickups/${pickupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Create new pickup
  async createPickup(pickupData: any) {
    try {
      const response = await api.post('/pickups', pickupData);
      return response.data;
    } catch (error) {
      console.error('Error creating pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Update pickup
  async updatePickup(pickupId: any, pickupData: any) {
    try {
      const response = await api.put(`/pickups/${pickupId}`, pickupData);
      return response.data;
    } catch (error) {
      console.error('Error updating pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Update pickup status
  async updatePickupStatus(pickupId: any, statusData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating pickup status:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Assign pickup to driver/agent
  async assignPickupToDriver(pickupId: any, assignmentData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Reassign pickup to different driver/agent
  async reassignPickup(pickupId: any, reassignmentData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/reassign`, reassignmentData);
      return response.data;
    } catch (error) {
      console.error('Error reassigning pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Cancel pickup
  async cancelPickup(pickupId: any, cancelData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/cancel`, cancelData);
      return response.data;
    } catch (error) {
      console.error('Error cancelling pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Reschedule pickup
  async reschedulePickup(pickupId: any, rescheduleData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/reschedule`, rescheduleData);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling pickup:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Get pickup analytics
  async getPickupAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      // @ts-expect-error
      if (params.startDate) queryParams.append('startDate', params.startDate);
      // @ts-expect-error
      if (params.endDate) queryParams.append('endDate', params.endDate);
      // @ts-expect-error
      if (params.agentId) queryParams.append('agentId', params.agentId);

      const response = await api.get(`/pickups/analytics?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup analytics:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Get pickups for specific agent
  async getAgentPickups(agentId: any, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      // @ts-expect-error
      if (params.status) queryParams.append('status', params.status);
      // @ts-expect-error
      if (params.date) queryParams.append('date', params.date);

      const response = await api.get(`/pickups/agent/${agentId}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent pickups:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Get all drivers/agents for assignment
  async getDrivers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'driver'); // Filter for driver role
      // @ts-expect-error
      if (params.page) queryParams.append('page', params.page);
      // @ts-expect-error
      if (params.limit) queryParams.append('limit', params.limit || 100); // Get more drivers
      // @ts-expect-error
      if (params.search) queryParams.append('search', params.search);
      queryParams.append('isVerified', 'true'); // Only verified drivers

      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Get pickup agents (users with pickup_agent role)
  async getPickupAgents(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'pickup_agent'); // Filter for pickup_agent role
      // @ts-expect-error
      if (params.page) queryParams.append('page', params.page);
      // @ts-expect-error
      if (params.limit) queryParams.append('limit', params.limit || 100);
      // @ts-expect-error
      if (params.search) queryParams.append('search', params.search);
      queryParams.append('isVerified', 'true'); // Only verified agents

      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup agents:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Upload pickup images
  async uploadPickupImages(pickupId: any, formData: any) {
    try {
      const response = await api.post(`/pickups/${pickupId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading pickup images:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }

  // Send communication/notification
  async sendCommunication(pickupId: any, communicationData: any) {
    try {
      const response = await api.post(`/pickups/${pickupId}/communication`, communicationData);
      return response.data;
    } catch (error) {
      console.error('Error sending communication:', error);
      // @ts-expect-error
      throw error.response?.data || error;
    }
  }
}

export default new PickupService();
