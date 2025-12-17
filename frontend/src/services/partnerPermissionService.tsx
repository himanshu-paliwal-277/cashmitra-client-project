import api from './api';

class PartnerPermissionService {
  // Get all partners with their permissions
  async getAllPartners(filters = {}) {
    try {
      const params = new URLSearchParams();      if (filters.search) params.append('search', filters.search);      if (filters.roleTemplate) params.append('roleTemplate', filters.roleTemplate);      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);      if (filters.page) params.append('page', filters.page);      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/partner-permissions/admin?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  }

  // Get specific partner's permissions
  async getPartnerPermissions(partnerId: any) {
    try {
      const response = await api.get(`/partner-permissions/admin/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner permissions:', error);
      throw error;
    }
  }

  // Update partner permissions
  async updatePartnerPermissions(partnerId: any, permissionsData: any) {
    try {
      const response = await api.put(`/partner-permissions/admin/${partnerId}`, permissionsData);
      return response.data;
    } catch (error) {
      console.error('Error updating partner permissions:', error);
      throw error;
    }
  }

  // Apply role template to partner
  async applyRoleTemplate(partnerId: any, templateKey: any) {
    try {
      const response = await api.post(`/partner-permissions/admin/${partnerId}/apply-role`, {
        roleTemplate: templateKey,
      });
      return response.data;
    } catch (error) {
      console.error('Error applying role template:', error);
      throw error;
    }
  }

  // Bulk update permissions for multiple partners
  async bulkUpdatePermissions(partnerIds: any, permissionsData: any) {
    try {
      const response = await api.post('/partner-permissions/admin/bulk-permissions', {
        partnerIds,
        permissions: permissionsData,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating permissions:', error);
      throw error;
    }
  }

  // Get available role templates
  async getRoleTemplates() {
    try {
      const response = await api.get('/partner-permissions/admin/role-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching role templates:', error);
      throw error;
    }
  }

  // Create custom role template
  async createRoleTemplate(templateData: any) {
    try {
      const response = await api.post('/partner-permissions/admin/role-templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating role template:', error);
      throw error;
    }
  }

  // Update role template
  async updateRoleTemplate(templateId: any, templateData: any) {
    try {
      const response = await api.put(
        `/partner-permissions/admin/role-templates/${templateId}`,
        templateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating role template:', error);
      throw error;
    }
  }

  // Delete role template
  async deleteRoleTemplate(templateId: any) {
    try {
      const response = await api.delete(`/partner-permissions/admin/role-templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role template:', error);
      throw error;
    }
  }

  // Get permission categories and available permissions
  async getPermissionCategories() {
    try {
      const response = await api.get('/partner-permissions/admin/permission-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching permission categories:', error);
      throw error;
    }
  }

  // Get available menu items/permission types
  async getMenuItems() {
    try {
      const response = await api.get('/partner-permissions/admin/menu-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  // Create new permission
  async createPermission(permissionData: any) {
    try {
      const response = await api.post(
        '/partner-permissions/admin/create-permission',
        permissionData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  // Get partner statistics for permissions dashboard
  async getPartnerStats() {
    try {
      const response = await api.get('/partner-permissions/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching partner stats:', error);
      throw error;
    }
  }

  // Validate permissions before applying
  async validatePermissions(permissions: any) {
    try {
      const response = await api.post('/partner-permissions/admin/validate', { permissions });
      return response.data;
    } catch (error) {
      console.error('Error validating permissions:', error);
      throw error;
    }
  }

  // Get permission audit log for a partner
  async getPermissionAuditLog(partnerId: any, filters = {}) {
    try {
      const params = new URLSearchParams();      if (filters.startDate) params.append('startDate', filters.startDate);      if (filters.endDate) params.append('endDate', filters.endDate);      if (filters.action) params.append('action', filters.action);      if (filters.page) params.append('page', filters.page);      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/partner-permissions/admin/${partnerId}/audit-log?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }

  // Export partner permissions data
  async exportPartnerPermissions(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams();      if (filters.search) params.append('search', filters.search);      if (filters.role) params.append('role', filters.role);      if (filters.status) params.append('status', filters.status);
      params.append('format', format);

      const response = await api.get(`/partner-permissions/admin/export?${params}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `partner-permissions-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error exporting partner permissions:', error);
      throw error;
    }
  }

  // Import partner permissions from file
  async importPartnerPermissions(file: any) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/partner-permissions/admin/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing partner permissions:', error);
      throw error;
    }
  }

  // Get partner permission comparison
  async comparePartnerPermissions(partnerIds: any) {
    try {
      const response = await api.post('/partner-permissions/admin/compare-permissions', {
        partnerIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error comparing partner permissions:', error);
      throw error;
    }
  }

  // Reset partner permissions to default
  async resetPartnerPermissions(partnerId: any, roleTemplate = 'basic') {
    try {
      const response = await api.post(`/partner-permissions/admin/${partnerId}/reset-permissions`, {
        template: roleTemplate,
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting partner permissions:', error);
      throw error;
    }
  }

  // Get permission usage analytics
  async getPermissionAnalytics(timeRange = '30d') {
    try {
      const response = await api.get(`/partner-permissions/admin/analytics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permission analytics:', error);
      throw error;
    }
  }

  // Sync partner permissions with external system
  async syncPartnerPermissions(partnerId: any) {
    try {
      const response = await api.post(`/partner-permissions/admin/${partnerId}/sync-permissions`);
      return response.data;
    } catch (error) {
      console.error('Error syncing partner permissions:', error);
      throw error;
    }
  }

  // Get partner feature usage
  async getPartnerFeatureUsage(partnerId: any, timeRange = '30d') {
    try {
      const response = await api.get(
        `/partner-permissions/admin/${partnerId}/feature-usage?range=${timeRange}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching partner feature usage:', error);
      throw error;
    }
  }

  // Update partner business limits
  async updatePartnerLimits(partnerId: any, limits: any) {
    try {
      const response = await api.put(`/partner-permissions/admin/${partnerId}/limits`, limits);
      return response.data;
    } catch (error) {
      console.error('Error updating partner limits:', error);
      throw error;
    }
  }

  // Get partner permission recommendations
  async getPermissionRecommendations(partnerId: any) {
    try {
      const response = await api.get(`/admin/partners/${partnerId}/permission-recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permission recommendations:', error);
      throw error;
    }
  }

  // Schedule permission review
  async schedulePermissionReview(partnerId: any, reviewDate: any, notes = '') {
    try {
      const response = await api.post(`/admin/partners/${partnerId}/schedule-review`, {
        reviewDate,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling permission review:', error);
      throw error;
    }
  }

  // Get pending permission reviews
  async getPendingReviews(filters = {}) {
    try {
      const params = new URLSearchParams();      if (filters.priority) params.append('priority', filters.priority);      if (filters.dueDate) params.append('dueDate', filters.dueDate);      if (filters.page) params.append('page', filters.page);      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/admin/permission-reviews/pending?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw error;
    }
  }

  // Complete permission review
  async completePermissionReview(reviewId: any, reviewData: any) {
    try {
      const response = await api.post(`/admin/permission-reviews/${reviewId}/complete`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error completing permission review:', error);
      throw error;
    }
  }
}

// Create and export service instance
const partnerPermissionService = new PartnerPermissionService();
export default partnerPermissionService;

// Export individual methods for convenience
export const {
  getAllPartners,
  getPartnerPermissions,
  updatePartnerPermissions,
  applyRoleTemplate,
  bulkUpdatePermissions,
  getRoleTemplates,
  createRoleTemplate,
  updateRoleTemplate,
  deleteRoleTemplate,
  getPermissionCategories,
  getMenuItems,
  createPermission,
  getPartnerStats,
  validatePermissions,
  getPermissionAuditLog,
  exportPartnerPermissions,
  importPartnerPermissions,
  comparePartnerPermissions,
  resetPartnerPermissions,
  getPermissionAnalytics,
  syncPartnerPermissions,
  getPartnerFeatureUsage,
  updatePartnerLimits,
  getPermissionRecommendations,
  schedulePermissionReview,
  getPendingReviews,
  completePermissionReview,
} = partnerPermissionService;
