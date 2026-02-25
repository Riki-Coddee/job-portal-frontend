// src/context/RecruiterContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const RecruiterContext = createContext();

export const RecruiterProvider = ({ children }) => {
  const { user, isAuthorized, logout } = useAuth();
  const [recruiterData, setRecruiterData] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState({
    percentage: 0,
    checklist: []
  });

  // Calculate profile completion
  const calculateProfileCompletion = (recruiter, companyData) => {
    if (!companyData) {
      return { percentage: 0, checklist: [] };
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const checklist = [];

    // Recruiter Basic Info (15 points)
    const recruiterInfo = [
      { field: 'designation', label: 'Recruiter Designation', weight: 10 },
      { field: 'bio', label: 'Recruiter Bio', weight: 5 }
    ];
    
    recruiterInfo.forEach(item => {
      totalPoints += item.weight;
      const completed = recruiter && recruiter[item.field] && recruiter[item.field].length > 0;
      if (completed) earnedPoints += item.weight;
      
      checklist.push({
        id: checklist.length + 1,
        label: `Add ${item.label}`,
        completed,
        weight: item.weight,
        field: `recruiter_${item.field}`
      });
    });

    // Company Basic Info (40 points)
    const basicInfo = [
      { field: 'name', label: 'Company Name', weight: 10 },
      { field: 'description', label: 'Company Description', weight: 10 },
      { field: 'industry', label: 'Industry', weight: 10 },
      { field: 'location', label: 'Location', weight: 10 }
    ];
    
    basicInfo.forEach(item => {
      totalPoints += item.weight;
      const completed = companyData[item.field] && companyData[item.field].length > 0;
      if (completed) earnedPoints += item.weight;
      
      checklist.push({
        id: checklist.length + 1,
        label: `Add ${item.label}`,
        completed,
        weight: item.weight,
        field: `company_${item.field}`
      });
    });

    // Contact Info (25 points)
    const contactInfo = [
      { field: 'website', label: 'Website', weight: 10 },
      { field: 'email', label: 'Contact Email', weight: 10 },
      { field: 'phone', label: 'Contact Phone', weight: 5 }
    ];
    
    contactInfo.forEach(item => {
      totalPoints += item.weight;
      const completed = companyData[item.field] && companyData[item.field].length > 0;
      if (completed) earnedPoints += item.weight;
      
      checklist.push({
        id: checklist.length + 1,
        label: `Add ${item.label}`,
        completed,
        weight: item.weight,
        field: `company_${item.field}`
      });
    });

    // Social Media (10 points)
    totalPoints += 10;
    const hasLinkedIn = companyData.linkedin_url && companyData.linkedin_url.length > 0;
    if (hasLinkedIn) earnedPoints += 10;
    
    checklist.push({
      id: checklist.length + 1,
      label: 'Add LinkedIn URL',
      completed: hasLinkedIn,
      weight: 10,
      field: 'company_linkedin'
    });

    // Company Culture (10 points)
    totalPoints += 10;
    const hasPerks = companyData.perks && companyData.perks.length > 0;
    const hasCulture = companyData.culture_description && companyData.culture_description.length > 0;
    
    if (hasPerks && hasCulture) earnedPoints += 10;
    else if (hasPerks || hasCulture) earnedPoints += 5;
    
    checklist.push({
      id: checklist.length + 1,
      label: 'Add Company Perks',
      completed: hasPerks,
      weight: 5,
      field: 'company_perks'
    });
    
    checklist.push({
      id: checklist.length + 1,
      label: 'Describe Company Culture',
      completed: hasCulture,
      weight: 5,
      field: 'company_culture'
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    
    return {
      percentage,
      checklist
    };
  };

  // Fetch recruiter data ONLY when user is authorized AND is a recruiter
  useEffect(() => {
    const fetchRecruiterData = async () => {
      if (user?.role !== 'recruiter') {
        setRecruiterData(null);
        setCompany(null);
        setJobs([]);
        setProfileCompletion({ percentage: 0, checklist: [] });
        return;
      }

      setLoading(true);
      try {
        // Fetch recruiter profile
        const recruiterRes = await api.get('/api/accounts/recruiter/profile/');
        setRecruiterData(recruiterRes.data);

        // Fetch company if exists
        if (recruiterRes.data.company) {
          setCompany(recruiterRes.data.company_details);
          
          // Calculate profile completion
          const completion = calculateProfileCompletion(
            recruiterRes.data, 
            recruiterRes.data.company_details
          );
          setProfileCompletion(completion);
        }
      } catch (error) {
        console.error('Failed to fetch recruiter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, [isAuthorized, user?.role]); // Only fetch when role changes

  // Update company profile
  const updateCompany = async (companyData) => {
    try {
      const formData = new FormData();
      
      // Handle file uploads and JSON fields
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== null && companyData[key] !== undefined) {
          if (key === 'logo' && companyData[key] instanceof File) {
            formData.append(key, companyData[key]);
          } else if (key === 'perks' || key === 'awards') {
            // Convert arrays to JSON strings
            formData.append(key, JSON.stringify(companyData[key]));
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.patch('/api/accounts/recruiter/company/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCompany(response.data);
      
      // Recalculate profile completion
      const completion = calculateProfileCompletion(recruiterData, response.data);
      setProfileCompletion(completion);
      
      return response.data;
    } catch (error) {
      console.error('Error updating company profile:', error);
      throw error;
    }
  };

  // Update recruiter profile
  const updateProfile = async (profileData) => {
    try {
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          if (key === 'profile_picture' && profileData[key] instanceof File) {
            formData.append(key, profileData[key]);
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      const response = await api.patch('/api/accounts/recruiter/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setRecruiterData(prev => ({ ...prev, ...response.data }));
      
      // Recalculate profile completion
      if (company) {
        const completion = calculateProfileCompletion(response.data, company);
        setProfileCompletion(completion);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating recruiter profile:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshProfile = async () => {
    if (user?.role !== 'recruiter') return;
    
    setLoading(true);
    try {
      const recruiterRes = await api.get('/api/accounts/recruiter/me/');
      setRecruiterData(recruiterRes.data);

      if (recruiterRes.data.company) {
        setCompany(recruiterRes.data.company_details);
        
        const completion = calculateProfileCompletion(
          recruiterRes.data, 
          recruiterRes.data.company_details
        );
        setProfileCompletion(completion);
      }
    } catch (error) {
      console.error('Failed to refresh recruiter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    profile: recruiterData,
    company,
    jobs,
    loading,
    profileCompletion,
    isRecruiter: user?.role === 'recruiter',
    updateProfile,
    updateCompany,
    refreshProfile, 
    logout
  };

  return (
    <RecruiterContext.Provider value={value}>
      {children}
    </RecruiterContext.Provider>
  );
};

export const useRecruiter = () => {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error('useRecruiter must be used within a RecruiterProvider');
  }
  return context;
};