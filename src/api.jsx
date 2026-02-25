// api.js
import axios from 'axios';
import { getAccessTokenKey, USER_ROLE } from './constants';

const isDevelopment = import.meta.env.MODE === 'development'
const myBaseURL = isDevelopment ?  import.meta.env.VITE_API_URL : import.meta.env.VITE_API_BASE_URL_DEPLOY
const api = axios.create({
    baseURL: myBaseURL
});

const publicApi = axios.create({
    baseURL: myBaseURL
});

let currentContext = null;

export const setApiContext = (context) => {
    currentContext = context; // 'jobseeker' or 'recruiter'
};

// Helper function to get current token
const getCurrentToken = () => {
    // For job listings, use jobseeker token if in jobseeker context
    if (currentContext === 'jobseeker') {
        return localStorage.getItem(getAccessTokenKey('jobseeker'));
    }
    
    // Otherwise use the stored USER_ROLE
    const role = localStorage.getItem(USER_ROLE);
    if (!role) return null;
    
    return localStorage.getItem(getAccessTokenKey(role));
};
api.interceptors.request.use(
    (config) => {
        const token = getCurrentToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Check if it's a 401 error and not a retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry login attempts
            if (originalRequest.url.includes('/token/')) {
                return Promise.reject(error);
            }
            
            originalRequest._retry = true;
            
            try {
                const role = localStorage.getItem(USER_ROLE);
                const refreshTokenKey = role ? `${role}_refresh_token` : 'refresh';
                const refreshToken = localStorage.getItem(refreshTokenKey);
                
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                // Call refresh endpoint
                const response = await axios.post(
                    `${myBaseURL}/api/accounts/token/refresh/`,
                    { refresh: refreshToken }
                );
                
                const newAccessToken = response.data.access;
                
                // Update stored token
                if (role) {
                    localStorage.setItem(`${role}_access_token`, newAccessToken);
                }
                
                // Update authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens only if not on login page
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    const role = localStorage.getItem(USER_ROLE);
                    if (role) {
                        localStorage.removeItem(`${role}_access_token`);
                        localStorage.removeItem(`${role}_refresh_token`);
                    }
                    localStorage.removeItem(USER_ROLE);
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export const applyForJob = (jobId, data) => {
  const formData = new FormData();
  
  formData.append('cover_letter', data.cover_letter);
  formData.append('use_profile_resume', data.use_profile_resume.toString());
  
  if (!data.use_profile_resume && data.custom_resume) {
    formData.append('resume', data.custom_resume);
  }
  
  // Use the correct endpoint based on your backend
  return api.post(`/applications/apply-to-job/${jobId}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update getSimilarJobs to handle both endpoints
export const getSimilarJobs = (jobId) => {
  // Try the action-based endpoint first
  return api.get(`/jobs/${jobId}/similar/`);
};

// Add fallback for job seeker applications if endpoint doesn't exist
export const getJobSeekerApplications = () => {
  try {
    return api.get('/api/applications/my-applications/');
  } catch (error) {
    // If endpoint doesn't exist, return empty array
    console.warn('Job seeker applications endpoint not found, returning empty array');
    return Promise.resolve({ data: [] });
  }
};

export { publicApi };
export default api;