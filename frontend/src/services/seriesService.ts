import api from './api';

class SeriesService {
  async getAllSeries({ categoryId }: { categoryId?: string } = {}) {
    try {
      const res = await api.get('/series', { params: { categoryId } });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async createSeries(payload: any) {
    try {
      const res = await api.post('/series', payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async updateSeries(id: string, payload: any) {
    try {
      const res = await api.put(`/series/${id}`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async deleteSeries(id: string) {
    try {
      const res = await api.delete(`/series/${id}`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const fd = new FormData();
      fd.append('image', file);

      const res = await api.post('/upload/image', fd);
      return res.data.data.url;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export const seriesService = new SeriesService();
