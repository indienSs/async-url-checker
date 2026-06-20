import axios from 'axios';
import { JobListItem, JobDetails } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export const jobsApi = {
  createJob: async (urls: string[]): Promise<{ jobId: string }> => {
    const response = await axios.post(`${API_BASE_URL}/jobs`, { urls });
    return response.data;
  },

  getJobs: async (): Promise<JobListItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/jobs`);
    return response.data;
  },

  getJobDetails: async (id: string): Promise<JobDetails> => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
    return response.data;
  },

  cancelJob: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/jobs/${id}`);
  },
};