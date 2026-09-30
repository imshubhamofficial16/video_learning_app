import api from './axios';

export const progressAPI = {
  // Get progress for a video
  getVideoProgress: async (videoId) => {
    const response = await api.get(`/progress/video/${videoId}`);
    return response.data;
  },

  // Update progress
  updateProgress: async (videoId, progressData) => {
    const response = await api.post(`/progress/video/${videoId}`, progressData);
    return response.data;
  },

  // Mark as completed
  markCompleted: async (videoId) => {
    const response = await api.patch(`/progress/video/${videoId}/complete`);
    return response.data;
  },

  // Get all my progress
  getMyProgress: async () => {
    const response = await api.get('/progress/my-progress');
    return response.data;
  }
};
