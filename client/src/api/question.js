import api from './axios';

export const questionAPI = {
  // Get all questions for a video
  getAll: async (videoId) => {
    const response = await api.get(`/videos/${videoId}/questions`);
    return response.data;
  },

  // Get question by ID
  getById: async (videoId, questionId) => {
    const response = await api.get(`/videos/${videoId}/questions/${questionId}`);
    return response.data;
  },

  // Create question
  create: async (videoId, questionData) => {
    const response = await api.post(`/videos/${videoId}/questions`, questionData);
    return response.data;
  },

  // Update question
  update: async (videoId, questionId, questionData) => {
    const response = await api.put(`/videos/${videoId}/questions/${questionId}`, questionData);
    return response.data;
  },

  // Delete question
  delete: async (videoId, questionId) => {
    const response = await api.delete(`/videos/${videoId}/questions/${questionId}`);
    return response.data;
  }
};
