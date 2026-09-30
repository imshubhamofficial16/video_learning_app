import api from './axios';

export const reportAPI = {
  // Get all learners with stats
  getAllLearners: async () => {
    const response = await api.get('/reports/learners');
    return response.data;
  },

  // Get learner details
  getLearnerDetails: async (learnerId) => {
    const response = await api.get(`/reports/learner/${learnerId}`);
    return response.data;
  },

  // Get video analytics
  getVideoAnalytics: async (videoId) => {
    const response = await api.get(`/reports/video/${videoId}/analytics`);
    return response.data;
  },

  // Get learner progress on specific video
  getLearnerVideoProgress: async (learnerId, videoId) => {
    const response = await api.get(`/reports/learner/${learnerId}/video/${videoId}`);
    return response.data;
  }
};
