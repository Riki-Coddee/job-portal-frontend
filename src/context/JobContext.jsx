import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import JobService from '../services/JobService.js';
import api from '../api';
import { toast } from 'react-toastify';

const JobContext = createContext();

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      JobService.setContext();
      const data = await JobService.getJobs(params);
      setJobs(data.results || data);

      if (data.count !== undefined) {
        setPagination({
          page: params.page || 1,
          totalPages: Math.ceil(data.count / (params.page_size || 10)),
          totalCount: data.count,
          hasNext: !!data.next,
          hasPrevious: !!data.previous,
        });
      }

      return data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch jobs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      JobService.setContext();
      const data = await JobService.getRandomFeaturedJobs(6);
      setFeaturedJobs(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch featured jobs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      JobService.setContext();
      const data = await JobService.getJobById(id);
      setCurrentJob(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch job details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchJobs = useCallback(async (query, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      JobService.setContext();
      const data = await JobService.searchJobs(query, filters);
      setJobs(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to search jobs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSimilarJobs = useCallback(async (jobId, limit = 3) => {
    setError(null);
    try {
      JobService.setContext();
      const data = await JobService.getSimilarJobs(jobId, limit);
      return data;
    } catch (err) {
      console.error('Failed to fetch similar jobs:', err);
      return [];
    }
  }, []);

  const applyForJob = useCallback(async (jobId, applicationData) => {
    try {
      const formData = new FormData();

      formData.append('cover_letter', applicationData.cover_letter || '');
      formData.append('use_profile_resume', applicationData.use_profile_resume || 'true');

      if (applicationData.skills && Array.isArray(applicationData.skills)) {
        formData.append('skills', JSON.stringify(applicationData.skills));
      }

      if (applicationData.additional_info) {
        formData.append('additional_info', JSON.stringify(applicationData.additional_info));
      }

      if (applicationData.match_score) {
        formData.append('match_score', applicationData.match_score);
      }

      if (applicationData.resume && applicationData.resume instanceof File) {
        formData.append('resume', applicationData.resume);
      } else if (applicationData.use_profile_resume) {
        formData.append('profile_resume_only', 'true');
      }

      const response = await api.post(`/api/applications/apply-to-job/${jobId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message || 'Application submitted successfully!');
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to submit application');
      throw error;
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      jobs,
      featuredJobs,
      currentJob,
      loading,
      error,
      pagination,
      fetchJobs,
      fetchFeaturedJobs,
      fetchJobById,
      searchJobs,
      fetchSimilarJobs,
      applyForJob,
      setCurrentJob,
      clearJobs: () => setJobs([]),
      clearError: () => setError(null),
    }),
    [
      jobs,
      featuredJobs,
      currentJob,
      loading,
      error,
      pagination,
      fetchJobs,
      fetchFeaturedJobs,
      fetchJobById,
      searchJobs,
      fetchSimilarJobs,
      applyForJob,
    ]
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};