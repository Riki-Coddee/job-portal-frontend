import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  Edit2, Save, Upload, Award, BookOpen, Globe, 
  Linkedin, Github, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle, Circle, FileText, Eye, Download, X,
  BriefcaseBusiness, GraduationCap, Star, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useJobSeeker } from '../context/JobSeekerContext';
import api from '../api';

const Profile = () => {
  const { user } = useAuth();
  const { 
    profile, 
    loading, 
    updateProfile,
    refreshProfile 
  } = useJobSeeker();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    location: '',
    phone_number: '',
    dob: '',
    resume: null,
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    profile_picture: null
  });
  
  // Track original data and changes
  const [originalData, setOriginalData] = useState({});
  const [changedFields, setChangedFields] = useState({});
  
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    currently_working: false,
    description: ''
  });
  
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    currently_studying: false,
    description: ''
  });

  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  
  const fileInputRef = useRef(null);
  const profilePicInputRef = useRef(null);

  // Use profile from context
  useEffect(() => {
    if (profile) {
      const newFormData = {
        title: profile.title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone_number: profile.phone_number || '',
        dob: profile.dob || '',
        portfolio_url: profile.portfolio_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        resume: profile.resume,
        profile_picture: profile.profile_picture
      };
      
      setFormData(newFormData);
      setOriginalData(newFormData);
      setChangedFields({});
    }
  }, [profile]);

  // Handle input change with change tracking
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track if this field has changed from original
    const originalValue = originalData[field];
    const hasChanged = value !== originalValue;
    
    setChangedFields(prev => ({
      ...prev,
      [field]: hasChanged
    }));
  };

  // Calculate profile completion
  const calculateCompletion = useMemo(() => {
    if (!profile) return 0;
    
    if (profile.profile_completion?.percentage) {
      return profile.profile_completion.percentage;
    }
    
    const sections = {
      basicInfo: ['title', 'location', 'phone_number', 'bio'],
      professional: ['experiences'],
      education: ['educations'],
      skills: ['skills'],
      documents: ['resume', 'portfolio_url', 'github_url', 'linkedin_url']
    };

    let totalPoints = 0;
    let earnedPoints = 0;

    // Basic Info (25% weight)
    sections.basicInfo.forEach(field => {
      totalPoints += 5;
      if (field === 'bio') {
        if (profile[field] && profile[field].length > 50) {
          earnedPoints += 5;
        }
      } else if (profile[field]) {
        earnedPoints += 5;
      }
    });

    // Professional Experience (30% weight)
    totalPoints += 30;
    if (profile.experiences && profile.experiences.length > 0) {
      earnedPoints += 30;
    }

    // Education (20% weight)
    totalPoints += 20;
    if (profile.educations && profile.educations.length > 0) {
      earnedPoints += 20;
    }

    // Skills (15% weight)
    totalPoints += 15;
    if (profile.skills && profile.skills.length >= 3) {
      earnedPoints += 15;
    } else if (profile.skills && profile.skills.length > 0) {
      earnedPoints += 10;
    }

    // Documents/Links (10% weight)
    let docPoints = 0;
    sections.documents.forEach(field => {
      if (profile[field]) {
        docPoints += 2.5;
      }
    });
    totalPoints += 10;
    earnedPoints += Math.min(docPoints, 10);

    return Math.round((earnedPoints / totalPoints) * 100);
  }, [profile]);

  // Get profile completion checklist
  const getCompletionChecklist = useMemo(() => {
    if (!profile) return [];
    
    if (profile.profile_completion?.checklist?.length > 0) {
      return profile.profile_completion.checklist;
    }
    
    return [
      {
        id: 1,
        label: "Complete your bio",
        completed: profile.bio?.length > 50,
        weight: 5,
        field: 'bio'
      },
      {
        id: 2,
        label: "Add your professional title",
        completed: !!profile.title,
        weight: 5,
        field: 'title'
      },
      {
        id: 3,
        label: "Add location",
        completed: !!profile.location,
        weight: 5,
        field: 'location'
      },
      {
        id: 4,
        label: "Add phone number",
        completed: !!profile.phone_number,
        weight: 5,
        field: 'phone_number'
      },
      {
        id: 5,
        label: "Add at least one work experience",
        completed: profile.experiences?.length > 0,
        weight: 30,
        field: 'experiences'
      },
      {
        id: 6,
        label: "Add education",
        completed: profile.educations?.length > 0,
        weight: 20,
        field: 'educations'
      },
      {
        id: 7,
        label: "Add at least 3 skills",
        completed: profile.skills?.length >= 3,
        weight: 15,
        field: 'skills'
      },
      {
        id: 8,
        label: "Upload your resume",
        completed: !!profile.resume,
        weight: 2.5,
        field: 'resume'
      },
      {
        id: 9,
        label: "Add portfolio/GitHub links",
        completed: !!(profile.portfolio_url || profile.github_url),
        weight: 7.5,
        field: 'links'
      }
    ];
  }, [profile]);

  // Optimized save function - only sends changed data
  const handleSaveProfile = async () => {
    try {
      // Check if anything actually changed
      const hasAnyChanges = Object.values(changedFields).some(v => v === true) ||
                            formData.resume instanceof File ||
                            formData.profile_picture instanceof File;
      
      if (!hasAnyChanges) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }
      
      const formDataToSend = new FormData();
      let hasDataToSend = false;
      
      // Only add text fields that have changed
      Object.keys(changedFields).forEach(field => {
        if (changedFields[field] && formData[field]) {
          formDataToSend.append(field, formData[field]);
          hasDataToSend = true;
        }
      });
      
      // Add files if they're new (always send these as they're always changes)
      if (formData.resume instanceof File) {
        formDataToSend.append('resume', formData.resume);
        hasDataToSend = true;
      }
      
      if (formData.profile_picture instanceof File) {
        formDataToSend.append('profile_picture', formData.profile_picture);
        hasDataToSend = true;
      }
      
      if (!hasDataToSend) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }
      
      // Call the updateProfile function from context
      await updateProfile(formDataToSend);
      
      // Update original data to match new form data
      setOriginalData({ ...formData });
      setChangedFields({});
      
      // Wait a moment then refresh
      setTimeout(() => {
        refreshProfile();
      }, 500);
      
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Handle file uploads with change tracking
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      if (field === 'resume' && file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file types
      if (field === 'resume') {
        const allowedTypes = ['application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                             'text/plain'];
        if (!allowedTypes.includes(file.type)) {
          toast.error('Please upload PDF, DOC, DOCX, or TXT files only');
          return;
        }
      }
      
      if (field === 'profile_picture') {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error('Please upload JPEG, PNG, GIF, or WebP images only');
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      
      // File is always a change
      setChangedFields(prev => ({
        ...prev,
        [field]: true
      }));
      
      toast.success(`${field === 'profile_picture' ? 'Profile picture' : 'Resume'} selected`);
    }
  };

  // Handle skill operations
  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    
    try {
      const response = await api.post('/api/accounts/job-seeker/skills/', {
        name: newSkill,
        proficiency: 'intermediate'
      });
      
      await refreshProfile();
      setNewSkill('');
      toast.success('Skill added!');
      return response.data;
    } catch (error) {
      console.error('Error adding skill:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.name?.[0] || 
                      'Failed to add skill';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleUpdateSkill = async (skillId, updatedData) => {
    try {
      const response = await api.put(`/api/accounts/job-seeker/skills/${skillId}/`, updatedData);
      await refreshProfile();
      setEditingSkill(null);
      toast.success('Skill updated!');
      return response.data;
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
      throw error;
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) return;
    
    try {
      await api.delete(`/api/accounts/job-seeker/skills/${skillId}/`);
      await refreshProfile();
      toast.success('Skill removed!');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
      throw error;
    }
  };

  // Handle experience operations
  const handleAddExperience = async () => {
    if (!newExperience.title.trim() || !newExperience.company.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      const response = await api.post('/api/accounts/job-seeker/experiences/', newExperience);
      await refreshProfile();
      setNewExperience({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        currently_working: false,
        description: ''
      });
      toast.success('Experience added!');
      return response.data;
    } catch (error) {
      console.error('Error adding experience:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.title?.[0] || 
                      error.response?.data?.company?.[0] || 
                      'Failed to add experience';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleUpdateExperience = async (expId, updatedData) => {
    try {
      const response = await api.put(`/api/accounts/job-seeker/experiences/${expId}/`, updatedData);
      await refreshProfile();
      setEditingExperience(null);
      toast.success('Experience updated!');
      return response.data;
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error('Failed to update experience');
      throw error;
    }
  };

  const handleRemoveExperience = async (expId) => {
    if (!window.confirm('Are you sure you want to remove this experience?')) return;
    
    try {
      await api.delete(`/api/accounts/job-seeker/experiences/${expId}/`);
      await refreshProfile();
      toast.success('Experience removed!');
    } catch (error) {
      console.error('Error removing experience:', error);
      toast.error('Failed to remove experience');
      throw error;
    }
  };

  // Handle education operations
  const handleAddEducation = async () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      const response = await api.post('/api/accounts/job-seeker/educations/', newEducation);
      await refreshProfile();
      setNewEducation({
        degree: '',
        institution: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        currently_studying: false,
        description: ''
      });
      toast.success('Education added!');
      return response.data;
    } catch (error) {
      console.error('Error adding education:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.degree?.[0] || 
                      error.response?.data?.institution?.[0] || 
                      'Failed to add education';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleUpdateEducation = async (eduId, updatedData) => {
    try {
      const response = await api.put(`/api/accounts/job-seeker/educations/${eduId}/`, updatedData);
      await refreshProfile();
      setEditingEducation(null);
      toast.success('Education updated!');
      return response.data;
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error('Failed to update education');
      throw error;
    }
  };

  const handleRemoveEducation = async (eduId) => {
    if (!window.confirm('Are you sure you want to remove this education?')) return;
    
    try {
      await api.delete(`/api/accounts/job-seeker/educations/${eduId}/`);
      await refreshProfile();
      toast.success('Education removed!');
    } catch (error) {
      console.error('Error removing education:', error);
      toast.error('Failed to remove education');
      throw error;
    }
  };

  // Function to jump to incomplete section
  const jumpToSection = (field) => {
    setIsEditing(true);
    const sectionId = `${field}-section`;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
      }, 2000);
    }
  };

  // Get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return 'No file';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Resume.pdf';
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    if (profile) {
      setFormData({
        title: profile.title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone_number: profile.phone_number || '',
        dob: profile.dob || '',
        portfolio_url: profile.portfolio_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        resume: profile.resume,
        profile_picture: profile.profile_picture
      });
    }
    setChangedFields({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header with Profile Completion */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and preferences</p>
              </div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEditing}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center shadow-md"
                    >
                      <Save size={20} className="mr-2" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center shadow-sm transition-colors duration-200"
                  >
                    <Edit2 size={20} className="mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 md:mr-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Profile Completion: {calculateCompletion}%
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Complete your profile to increase your chances of getting hired
                  </p>
                </div>
                
                <div className="flex-1 max-w-md">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {calculateCompletion >= 80 ? 'Great!' : 
                         calculateCompletion >= 60 ? 'Good progress!' : 
                         'Keep going!'}
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {calculateCompletion}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${calculateCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Quick Actions for Incomplete Sections */}
                  {calculateCompletion < 100 && (
                    <div className="flex flex-wrap gap-2">
                      {getCompletionChecklist
                        .filter(item => !item.completed)
                        .slice(0, 3)
                        .map(item => (
                          <button
                            key={item.id}
                            onClick={() => jumpToSection(item.field)}
                            className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors flex items-center font-medium"
                          >
                            <Plus size={12} className="mr-1" />
                            {item.label}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div id="basicInfo-section" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    {getCompletionChecklist.slice(0, 4).filter(item => item.completed).length === 4 ? (
                      <CheckCircle className="ml-2 h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="ml-2 h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div className="relative">
                    {isEditing ? (
                      <>
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary-100 to-blue-100 flex items-center justify-center border-2 border-primary-200">
                          {formData.profile_picture instanceof File ? (
                            <img
                              src={URL.createObjectURL(formData.profile_picture)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : profile?.profile_picture ? (
                            <img
                              src={profile.profile_picture}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={48} className="text-primary-600" />
                          )}
                        </div>
                        <button 
                          onClick={() => profilePicInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                        >
                          <Upload size={16} />
                        </button>
                        <input
                          type="file"
                          ref={profilePicInputRef}
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'profile_picture')}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <>
                        {profile?.profile_picture ? (
                          <img
                            src={profile.profile_picture}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary-200"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-primary-200">
                            <User size={48} className="text-primary-600" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                      <User size={20} className="mr-3 text-gray-400" />
                      {profile?.user?.first_name} {profile?.user?.last_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                      <Mail size={20} className="mr-3 text-gray-400" />
                      {profile?.user?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                        <Phone size={20} className="mr-3 text-gray-400" />
                        {profile?.phone_number || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        placeholder="San Francisco, CA"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                        <MapPin size={20} className="mr-3 text-gray-400" />
                        {profile?.location || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      placeholder="Senior Python Developer"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                      <Briefcase size={20} className="mr-3 text-gray-400" />
                      {profile?.title || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        {profile?.bio || 'No bio provided yet.'}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div id="skills-section" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                    {profile?.skills?.length >= 3 ? (
                      <CheckCircle className="ml-2 h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="ml-2 h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  {isEditing && (
                    <span className="text-sm text-gray-500">
                      {profile?.skills?.length || 0} skills
                    </span>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile?.skills?.map((skill) => (
                        <div
                          key={skill.id}
                          className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full flex items-center"
                        >
                          {skill.name}
                          {skill.proficiency && (
                            <span className="ml-2 text-xs opacity-75">({skill.proficiency})</span>
                          )}
                          <div className="ml-2 flex space-x-1">
                            <button
                              onClick={() => setEditingSkill(skill)}
                              className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-1 rounded"
                              title="Edit skill"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                              title="Remove skill"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {editingSkill ? (
                      <div className="p-4 border border-primary-200 rounded-lg bg-primary-50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-900">Edit Skill</h3>
                          <button
                            onClick={() => setEditingSkill(null)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingSkill.name}
                            onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Skill name"
                          />
                          <select
                            value={editingSkill.proficiency}
                            onChange={(e) => setEditingSkill({...editingSkill, proficiency: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                handleUpdateSkill(editingSkill.id, editingSkill);
                              }}
                              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setEditingSkill(null)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill (e.g., Python, Django, React)"
                          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSkill();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddSkill}
                          className="px-6 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {profile?.skills?.length > 0 ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-4 py-2 bg-primary-100 text-primary-700 font-medium rounded-full"
                        >
                          {skill.name}
                          {skill.proficiency && (
                            <span className="ml-2 text-xs opacity-75">({skill.proficiency})</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div id="experiences-section" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                    {profile?.experiences?.length > 0 ? (
                      <CheckCircle className="ml-2 h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="ml-2 h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => document.getElementById('add-experience-form').scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm font-medium"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Experience
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    {profile?.experiences?.map((exp) => (
                      <div key={exp.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {editingExperience?.id === exp.id ? (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-bold text-gray-900">Edit Experience</h3>
                                  <button
                                    onClick={() => setEditingExperience(null)}
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={editingExperience.title}
                                    onChange={(e) => setEditingExperience({...editingExperience, title: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Job Title *"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={editingExperience.company}
                                    onChange={(e) => setEditingExperience({...editingExperience, company: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Company *"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={editingExperience.location}
                                    onChange={(e) => setEditingExperience({...editingExperience, location: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Location"
                                  />
                                  <input
                                    type="date"
                                    value={editingExperience.start_date}
                                    onChange={(e) => setEditingExperience({...editingExperience, start_date: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    required
                                  />
                                  <input
                                    type="date"
                                    value={editingExperience.end_date}
                                    onChange={(e) => setEditingExperience({...editingExperience, end_date: e.target.value})}
                                    disabled={editingExperience.currently_working}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                  />
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingExperience.currently_working}
                                      onChange={(e) => setEditingExperience({...editingExperience, currently_working: e.target.checked})}
                                      className="mr-2"
                                    />
                                    <label>Currently working here</label>
                                  </div>
                                </div>
                                <textarea
                                  value={editingExperience.description}
                                  onChange={(e) => setEditingExperience({...editingExperience, description: e.target.value})}
                                  rows="3"
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                  placeholder="Description"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateExperience(exp.id, editingExperience)}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                                  >
                                    Update
                                  </button>
                                  <button
                                    onClick={() => setEditingExperience(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{exp.title}</h3>
                                    <p className="text-gray-700 font-medium">{exp.company}</p>
                                    {exp.location && (
                                      <p className="text-gray-600 text-sm">{exp.location}</p>
                                    )}
                                    <p className="text-gray-600 text-sm">
                                      {formatDateDisplay(exp.start_date)} - 
                                      {exp.currently_working ? ' Present' : ` ${formatDateDisplay(exp.end_date)}`}
                                    </p>
                                    {exp.description && (
                                      <p className="mt-2 text-gray-600">{exp.description}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-2 ml-4">
                                    <button
                                      onClick={() => setEditingExperience(exp)}
                                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                      title="Edit experience"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveExperience(exp.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove experience"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Experience Form */}
                    <div id="add-experience-form" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Plus size={18} className="mr-2" />
                        Add New Experience
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Job Title *"
                            value={newExperience.title}
                            onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Company *"
                            value={newExperience.company}
                            onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Location"
                            value={newExperience.location}
                            onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <input
                            type="date"
                            placeholder="Start Date *"
                            value={newExperience.start_date}
                            onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="date"
                            placeholder="End Date"
                            value={newExperience.end_date}
                            onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                            disabled={newExperience.currently_working}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <label className="flex items-center p-3">
                            <input
                              type="checkbox"
                              checked={newExperience.currently_working}
                              onChange={(e) => setNewExperience({...newExperience, currently_working: e.target.checked})}
                              className="mr-2"
                            />
                            Currently working here
                          </label>
                        </div>
                        <textarea
                          placeholder="Description"
                          value={newExperience.description}
                          onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          onClick={handleAddExperience}
                          disabled={!newExperience.title || !newExperience.company || !newExperience.start_date}
                          className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Add Experience
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profile?.experiences?.length > 0 ? (
                      profile.experiences.map((exp) => (
                        <div key={exp.id} className="border-l-4 border-primary-500 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors">
                          <h3 className="font-bold text-gray-900">{exp.title}</h3>
                          <p className="text-gray-700 font-medium">{exp.company}</p>
                          {exp.location && (
                            <p className="text-gray-600 text-sm">{exp.location}</p>
                          )}
                          <p className="text-gray-600 text-sm">
                            {formatDateDisplay(exp.start_date)} - 
                            {exp.currently_working ? ' Present' : ` ${formatDateDisplay(exp.end_date)}`}
                          </p>
                          {exp.description && (
                            <p className="mt-2 text-gray-600">{exp.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <BriefcaseBusiness className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No work experience added yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Add your first work experience</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Education */}
              <div id="educations-section" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                    {profile?.educations?.length > 0 ? (
                      <CheckCircle className="ml-2 h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="ml-2 h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => document.getElementById('add-education-form').scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm font-medium"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Education
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    {profile?.educations?.map((edu) => (
                      <div key={edu.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {editingEducation?.id === edu.id ? (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-bold text-gray-900">Edit Education</h3>
                                  <button
                                    onClick={() => setEditingEducation(null)}
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={editingEducation.degree}
                                    onChange={(e) => setEditingEducation({...editingEducation, degree: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Degree *"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={editingEducation.institution}
                                    onChange={(e) => setEditingEducation({...editingEducation, institution: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Institution *"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={editingEducation.field_of_study}
                                    onChange={(e) => setEditingEducation({...editingEducation, field_of_study: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Field of Study"
                                  />
                                  <input
                                    type="date"
                                    value={editingEducation.start_date}
                                    onChange={(e) => setEditingEducation({...editingEducation, start_date: e.target.value})}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    required
                                  />
                                  <input
                                    type="date"
                                    value={editingEducation.end_date}
                                    onChange={(e) => setEditingEducation({...editingEducation, end_date: e.target.value})}
                                    disabled={editingEducation.currently_studying}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                  />
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editingEducation.currently_studying}
                                      onChange={(e) => setEditingEducation({...editingEducation, currently_studying: e.target.checked})}
                                      className="mr-2"
                                    />
                                    <label>Currently studying</label>
                                  </div>
                                </div>
                                <textarea
                                  value={editingEducation.description}
                                  onChange={(e) => setEditingEducation({...editingEducation, description: e.target.value})}
                                  rows="3"
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                  placeholder="Description"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateEducation(edu.id, editingEducation)}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                                  >
                                    Update
                                  </button>
                                  <button
                                    onClick={() => setEditingEducation(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                    <p className="text-gray-700 font-medium">{edu.institution}</p>
                                    {edu.field_of_study && (
                                      <p className="text-gray-600 text-sm">Field: {edu.field_of_study}</p>
                                    )}
                                    <p className="text-gray-600 text-sm">
                                      {formatDateDisplay(edu.start_date)} - 
                                      {edu.currently_studying ? ' Present' : ` ${formatDateDisplay(edu.end_date)}`}
                                    </p>
                                    {edu.description && (
                                      <p className="mt-2 text-gray-600">{edu.description}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-2 ml-4">
                                    <button
                                      onClick={() => setEditingEducation(edu)}
                                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                      title="Edit education"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveEducation(edu.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove education"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Education Form */}
                    <div id="add-education-form" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Plus size={18} className="mr-2" />
                        Add New Education
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Degree *"
                            value={newEducation.degree}
                            onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Institution *"
                            value={newEducation.institution}
                            onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Field of Study"
                            value={newEducation.field_of_study}
                            onChange={(e) => setNewEducation({...newEducation, field_of_study: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <input
                            type="date"
                            placeholder="Start Date *"
                            value={newEducation.start_date}
                            onChange={(e) => setNewEducation({...newEducation, start_date: e.target.value})}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="date"
                            placeholder="End Date"
                            value={newEducation.end_date}
                            onChange={(e) => setNewEducation({...newEducation, end_date: e.target.value})}
                            disabled={newEducation.currently_studying}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <label className="flex items-center p-3">
                            <input
                              type="checkbox"
                              checked={newEducation.currently_studying}
                              onChange={(e) => setNewEducation({...newEducation, currently_studying: e.target.checked})}
                              className="mr-2"
                            />
                            Currently studying
                          </label>
                        </div>
                        <textarea
                          placeholder="Description (achievements, coursework, etc.)"
                          value={newEducation.description}
                          onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          onClick={handleAddEducation}
                          disabled={!newEducation.degree || !newEducation.institution || !newEducation.start_date}
                          className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Add Education
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profile?.educations?.length > 0 ? (
                      profile.educations.map((edu) => (
                        <div key={edu.id} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors">
                          <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-700 font-medium">{edu.institution}</p>
                          {edu.field_of_study && (
                            <p className="text-gray-600 text-sm">Field: {edu.field_of_study}</p>
                          )}
                          <p className="text-gray-600 text-sm">
                            {formatDateDisplay(edu.start_date)} - 
                            {edu.currently_studying ? ' Present' : ` ${formatDateDisplay(edu.end_date)}`}
                          </p>
                          {edu.description && (
                            <p className="mt-2 text-gray-600">{edu.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No education added yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Add your educational background</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Stats & Links */}
            <div className="space-y-8">
              {/* Profile Completion Checklist */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
                <div className="space-y-3">
                  {getCompletionChecklist.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                        item.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => !item.completed && jumpToSection(item.field)}
                    >
                      <div className="flex items-center">
                        {item.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 mr-3" />
                        )}
                        <span className={`text-sm ${item.completed ? 'text-green-700' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.completed && (
                        <span className="text-xs font-medium text-green-600">+{item.weight}%</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Score</span>
                    <span className="text-2xl font-bold text-primary-600">{calculateCompletion}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete all sections to reach 100%
                  </p>
                </div>
              </div>

              {/* Documents & Links Section */}
              <div id="links-section" className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Documents & Links</h2>
                  {(profile?.resume || profile?.portfolio_url || profile?.github_url) ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="space-y-4">
                  {/* Resume Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                    {isEditing ? (
                      <div className="space-y-3">
                        {profile?.resume && !(formData.resume instanceof File) && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <span className="text-gray-700 truncate">
                                {getFileNameFromUrl(profile.resume)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {profile.resume && (
                                <a 
                                  href={profile.resume} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 text-primary-600 hover:text-primary-700"
                                  title="View resume"
                                >
                                  <Eye size={16} />
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setFormData({...formData, resume: null});
                                  setChangedFields(prev => ({...prev, resume: true}));
                                }}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="Remove resume"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center"
                          >
                            <Upload className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-gray-600 font-medium">
                              {formData.resume instanceof File ? 'Change Resume' : 'Upload Resume'}
                            </span>
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => handleFileUpload(e, 'resume')}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <span className="text-gray-700 block font-medium">
                              {profile?.resume ? getFileNameFromUrl(profile.resume) : 'No resume uploaded'}
                            </span>
                            {profile?.resume && (
                              <span className="text-xs text-gray-500">
                                Uploaded recently
                              </span>
                            )}
                          </div>
                        </div>
                        {profile?.resume && (
                          <div className="flex space-x-2">
                            <a 
                              href={profile.resume} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View resume"
                            >
                              <Eye size={18} />
                            </a>
                            <a 
                              href={profile.resume} 
                              download
                              className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Download resume"
                            >
                              <Download size={18} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Portfolio Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.portfolio_url}
                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Globe size={20} className="mr-3 text-gray-400" />
                          {profile?.portfolio_url ? (
                            <a 
                              href={profile.portfolio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline truncate font-medium"
                            >
                              {profile.portfolio_url}
                            </a>
                          ) : (
                            <span className="text-gray-500">No portfolio link</span>
                          )}
                        </div>
                        {profile?.portfolio_url && (
                          <a 
                            href={profile.portfolio_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-primary-600 hover:text-primary-700"
                            title="Visit portfolio"
                          >
                            <Eye size={16} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GitHub Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.github_url}
                        onChange={(e) => handleInputChange('github_url', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        placeholder="https://github.com/username"
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Github size={20} className="mr-3 text-gray-400" />
                          {profile?.github_url ? (
                            <a 
                              href={profile.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline truncate font-medium"
                            >
                              {profile.github_url}
                            </a>
                          ) : (
                            <span className="text-gray-500">No GitHub link</span>
                          )}
                        </div>
                        {profile?.github_url && (
                          <a 
                            href={profile.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-primary-600 hover:text-primary-700"
                            title="Visit GitHub"
                          >
                            <Eye size={16} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Linkedin size={20} className="mr-3 text-gray-400" />
                          {profile?.linkedin_url ? (
                            <a 
                              href={profile.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline truncate font-medium"
                            >
                              {profile.linkedin_url}
                            </a>
                          ) : (
                            <span className="text-gray-500">No LinkedIn link</span>
                          )}
                        </div>
                        {profile?.linkedin_url && (
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-primary-600 hover:text-primary-700"
                            title="Visit LinkedIn"
                          >
                            <Eye size={16} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Strength</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Basic Info</span>
                      <span className="text-sm font-bold text-primary-600">
                        {Math.round((getCompletionChecklist.slice(0, 4).filter(item => item.completed).length / 4) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(getCompletionChecklist.slice(0, 4).filter(item => item.completed).length / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Professional</span>
                      <span className="text-sm font-bold text-primary-600">
                        {profile?.experiences?.length > 0 ? '100%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${profile?.experiences?.length > 0 ? 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Skills</span>
                      <span className="text-sm font-bold text-primary-600">
                        {profile?.skills?.length >= 3 ? '100%' : 
                         profile?.skills?.length > 0 ? '66%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${profile?.skills?.length >= 3 ? 100 : profile?.skills?.length > 0 ? 66 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Documents</span>
                      <span className="text-sm font-bold text-primary-600">
                        {((profile?.resume ? 1 : 0) + (profile?.portfolio_url ? 1 : 0) + (profile?.github_url ? 1 : 0) + (profile?.linkedin_url ? 1 : 0)) * 25}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((profile?.resume ? 1 : 0) + (profile?.portfolio_url ? 1 : 0) + (profile?.github_url ? 1 : 0) + (profile?.linkedin_url ? 1 : 0)) * 25}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;