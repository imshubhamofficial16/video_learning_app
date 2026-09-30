import api from './axios';

// Build absolute URL for the streaming endpoint.
// Token is passed as a query param since <video> can't send auth headers.
export const getStreamUrl = (videoId) => {
  const base = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  return `${base}/videos/${videoId}/stream?token=${token}`;
};

// Build absolute URL for static assets (thumbnails)
export const getAssetUrl = (relativePath) => {
  if (!relativePath) return '';
  // External URLs pass through unchanged
  if (relativePath.startsWith('http')) return relativePath;
  const base = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${base}${relativePath}`;
};

export const videoAPI = {
  // Get all videos
  getAll: async () => {
    const response = await api.get('/videos');
    return response.data;
  },

  // Get video by ID
  getById: async (id) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  // Create video (multipart form upload with progress)
  create: async (formData, onUploadProgress) => {
    const response = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return response.data;
  },

  // Update video
  update: async (id, videoData) => {
    const response = await api.put(`/videos/${id}`, videoData);
    return response.data;
  },

  // Delete video
  delete: async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },

  // Toggle publish status
  togglePublish: async (id) => {
    const response = await api.patch(`/videos/${id}/publish`);
    return response.data;
  }
};
