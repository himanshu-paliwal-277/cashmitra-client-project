import api from './api';

class PickupService {
  // Get all pickups with pagination and filters
  async getAllPickups(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/pickups?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pickups:', error);
      throw error.response?.data || error;
    }
  }

  // Get pickup by ID
  async getPickupById(pickupId: any) {
    try {
      const response = await api.get(`/pickups/${pickupId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Create new pickup
  async createPickup(pickupData: any) {
    try {
      const response = await api.post('/pickups', pickupData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Update pickup
  async updatePickup(pickupId: any, pickupData: any) {
    try {
      const response = await api.put(`/pickups/${pickupId}`, pickupData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Update pickup status
  async updatePickupStatus(pickupId: any, statusData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/status`, statusData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating pickup status:', error);
      throw error.response?.data || error;
    }
  }

  // Assign pickup to driver/agent
  async assignPickupToDriver(pickupId: any, assignmentData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/assign`, assignmentData);
      return response.data;
    } catch (error: any) {
      console.error('Error assigning pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Alias for assignPickupToDriver for backward compatibility
  async assignPickup(pickupId: any, agentId: any) {
    return this.assignPickupToDriver(pickupId, { assignedTo: agentId });
  }

  // Reassign pickup to different driver/agent
  async reassignPickup(pickupId: any, reassignmentData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/reassign`, reassignmentData);
      return response.data;
    } catch (error: any) {
      console.error('Error reassigning pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Cancel pickup
  async cancelPickup(pickupId: any, cancelData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/cancel`, cancelData);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Reschedule pickup
  async reschedulePickup(pickupId: any, rescheduleData: any) {
    try {
      const response = await api.patch(`/pickups/${pickupId}/reschedule`, rescheduleData);
      return response.data;
    } catch (error: any) {
      console.error('Error rescheduling pickup:', error);
      throw error.response?.data || error;
    }
  }

  // Get pickup analytics
  async getPickupAnalytics(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.agentId) queryParams.append('agentId', params.agentId);

      const response = await api.get(`/pickups/analytics?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pickup analytics:', error);
      throw error.response?.data || error;
    }
  }

  // Get pickups for specific agent
  async getAgentPickups(agentId: any, params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.date) queryParams.append('date', params.date);

      const response = await api.get(`/pickups/agent/${agentId}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching agent pickups:', error);
      throw error.response?.data || error;
    }
  }

  // Get all drivers/agents for assignment
  async getDrivers(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'driver'); // Filter for driver role
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit || 100); // Get more drivers
      if (params.search) queryParams.append('search', params.search);
      queryParams.append('isVerified', 'true'); // Only verified drivers

      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      throw error.response?.data || error;
    }
  }

  // Get pickup agents (users with pickup_agent role)
  async getPickupAgents(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'pickup_agent'); // Filter for pickup_agent role
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit || 100);
      if (params.search) queryParams.append('search', params.search);
      queryParams.append('isVerified', 'true'); // Only verified agents

      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pickup agents:', error);
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
    } catch (error: any) {
      console.error('Error uploading pickup images:', error);
      throw error.response?.data || error;
    }
  }

  // Send communication/notification
  async sendCommunication(pickupId: any, communicationData: any) {
    try {
      const response = await api.post(`/pickups/${pickupId}/communication`, communicationData);
      return response.data;
    } catch (error: any) {
      console.error('Error sending communication:', error);
      throw error.response?.data || error;
    }
  }

  // Get available pickup time slots
  async getPickupSlots(date?: string) {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);

      const response = await api.get(`/pickups/slots?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pickup slots:', error);
      throw error.response?.data || error;
    }
  }
}

export default new PickupService();
