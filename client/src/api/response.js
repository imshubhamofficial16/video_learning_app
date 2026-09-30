import api from './axios';

export const responseAPI = {
  // Submit answer
  submit: async (responseData) => {
    const response = await api.post('/responses', responseData);
    return response.data;
  },

  // Get my responses for a video
  getVideoResponses: async (videoId) => {
    const response = await api.get(`/responses/video/${videoId}`);
    return response.data;
  },

  // Get learner responses (admin only)
  getLearnerResponses: async (learnerId) => {
    const response = await api.get(`/responses/learner/${learnerId}`);
    return response.data;
  }
};
