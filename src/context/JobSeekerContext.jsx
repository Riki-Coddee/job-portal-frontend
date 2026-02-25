import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const JobSeekerContext = createContext();

export const JobSeekerProvider = ({ children }) => {
  const { user, isAuthorized } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsStats, setApplicationsStats] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Fetch job seeker profile
  const fetchProfile = async () => {
    if (!isAuthorized || user?.role !== 'job_seeker') return null;
    
    try {
      setLoading(true);
      const response = await api.get('/api/accounts/job-seeker/profile/');
      setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching job seeker profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's applications
  const fetchApplications = useCallback(async () => {
    if (!isAuthorized || user?.role !== 'job_seeker') return [];

    try {
      setApplicationsLoading(true);
      const response = await api.get('/api/applications/my-applications/');
      const apps = response.data.results || [];
      const stats = response.data.stats || [];
      setApplications(apps);
      setApplicationsStats(stats);
      
      console.log('Applications fetched successfully:', apps.length);
      apps.forEach((app, index) => {
        console.log(`Application ${index + 1}: Job ID = ${app.job} (${app.job_title})`);
      });
      
      return apps;
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load your applications');
      return [];
    } finally {
      setApplicationsLoading(false);
    }
  }, [isAuthorized, user]);

  // Check if already applied for a job - FIXED VERSION
  const hasApplied = useCallback((jobId) => {
    
    if (!jobId || !applications || !Array.isArray(applications)) {
      return false;
    }
    
    // Convert jobId to number for comparison
    const jobIdNum = parseInt(jobId);
    
    if (isNaN(jobIdNum)) {
      return false;
    }
    
    // Log all job IDs in applications for debugging
    const jobIdsInApplications = applications.map(app => ({
      jobId: app.job,
      jobTitle: app.job_title,
      match: app.job === jobIdNum
    }));
    
    
    // Simple comparison - just check if job ID matches
    const result = applications.some(app => app.job === jobIdNum);
    
    return result;
  }, [applications]);

  // Apply for a job - REMOVE THIS FUNCTION since JobContext already has it
  // const applyForJob = async (jobId, applicationData) => {
  //   // Let JobContext handle this
  // };

  // Update profile (sync with Profile.jsx)
  const updateProfile = async (data) => {
  try {
    const response = await api.patch('/api/accounts/job-seeker/profile/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Update profile with response data
    setProfile(response.data);
    toast.success('Profile updated successfully!');
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
    throw error;
  }
};

  // Refresh applications - expose this function
  const refreshApplications = useCallback(async () => {
    return await fetchApplications();
  }, [fetchApplications]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (isAuthorized && user?.role === 'job_seeker') {
      fetchProfile();
      fetchApplications();
    } else {
      // Clear applications if user is not a job seeker
      setApplications([]);
    }
  }, [isAuthorized, user, fetchApplications]);

  return (
    <JobSeekerContext.Provider value={{
      profile,
      loading,
      applications,
      applicationsLoading,
      fetchProfile,
      fetchApplications,
      hasApplied,
      updateProfile,
      refreshProfile: fetchProfile,
      refreshApplications,
      refetchApplications: fetchApplications,
      applicationsStats
    }}>
      {children}
    </JobSeekerContext.Provider>
  );
};

export const useJobSeeker = () => {
  const context = useContext(JobSeekerContext);
  if (!context) {
    throw new Error('useJobSeeker must be used within a JobSeekerProvider');
  }
  return context;
};