// context/ApplicationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api, { setApiContext } from '../api.jsx';
import { useAuth } from './AuthContext';

const ApplicationsContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within ApplicationsProvider');
  }
  return context;
};

export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    statusBreakdown: {},
    averageScore: 0
  });
  
  const { isAuthorized, user, loading: authLoading } = useAuth();

  const fetchApplications = useCallback(async (params = {}) => {
    if (!isAuthorized || user?.role !== 'job_seeker') {
      console.log('Not authorized or not a job seeker, skipping fetch');
      setApplications([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      setApiContext('jobseeker');
      
      const response = await api.get('/api/applications/my-applications/', {
        params: {
          ordering: '-applied_at',
          ...params
        }
      });
      
      let appsArray = response.data?.results || response.data || [];
      
      if (!Array.isArray(appsArray)) {
        appsArray = [];
      }
      
      // Set applications directly without extra API calls
      setApplications(appsArray);
      
      // Calculate stats
      const statusBreakdown = {};
      let totalScore = 0;
      let scoredCount = 0;
      
      appsArray.forEach(app => {
        statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
        if (app.match_score > 0) {
          totalScore += app.match_score;
          scoredCount++;
        }
      });
      
      setStats({
        total: appsArray.length,
        statusBreakdown,
        averageScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0
      });
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error || 'Failed to load applications');
      
      if (err.response?.status !== 401) {
        toast.error('Failed to load applications');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, user?.role]);

  const getApplicationById = useCallback((id) => {
    return applications.find(app => app.id === id);
  }, [applications]);

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.patch(`/api/applications/${applicationId}/`, { status });
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      
      toast.success('Status updated successfully');
      return true;
    } catch (err) {
      toast.error('Failed to update status');
      return false;
    }
  };

  const withdrawApplication = async (applicationId) => {
    try {
      await api.delete(`/api/applications/my-applications/${applicationId}/`);
      
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      toast.success('Application withdrawn successfully');
      return true;
    } catch (err) {
      toast.error('Failed to withdraw application');
      return false;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewed': 'bg-purple-100 text-purple-800',
      'interview': 'bg-green-100 text-green-800',
      'offer': 'bg-emerald-100 text-emerald-800',
      'rejected': 'bg-red-100 text-red-800',
      'accepted': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      'withdrawn': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'new': '📄',
      'pending': '⏳',
      'reviewed': '👀',
      'interview': '🎯',
      'offer': '📝',
      'rejected': '❌',
      'accepted': '🏆',
      'withdrawn': '↩️'
    };
    return icons[status] || '📄';
  };

  const getStatusProgress = (status) => {
    const progress = {
      'new': 20,
      'pending': 40,
      'reviewed': 60,
      'interview': 85,
      'offer': 95,
      'accepted': 100,
      'rejected': 0,
      'withdrawn': 0
    };
    return progress[status] || 0;
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (isAuthorized && user?.role === 'job_seeker') {
      fetchApplications();
    } else {
      setApplications([]);
      setLoading(false);
    }
  }, [isAuthorized, user?.role, authLoading, fetchApplications]);

  if (authLoading) {
    return (
      <ApplicationsContext.Provider value={{
        applications: [],
        loading: true,
        error: null,
        stats,
        fetchApplications,
        getApplicationById,
        updateApplicationStatus,
        withdrawApplication,
        getStatusColor,
        getStatusIcon,
        getStatusProgress
      }}>
        {children}
      </ApplicationsContext.Provider>
    );
  }

  const value = {
    applications,
    loading,
    error,
    stats,
    fetchApplications,
    getApplicationById,
    updateApplicationStatus,
    withdrawApplication,
    getStatusColor,
    getStatusIcon,
    getStatusProgress
  };

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
};