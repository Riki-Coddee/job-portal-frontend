// src/pages/RecruiterProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, MapPin, Globe, Users, Mail, Phone, 
  Edit2, Save, X, Upload, Link, Facebook, Twitter, 
  Linkedin, Instagram, ExternalLink, CheckCircle, 
  Award, Calendar, Star, Plus, Trash2,
  Check, Image as ImageIcon, Briefcase,
  User, Award as AwardIcon, Heart, Clock, Home,
  DollarSign, BookOpen, Coffee, Shield, Zap,
  Smartphone, Package, PhoneCall, Map,
  Target as TargetIcon, Info, AlertCircle,
  FileText, Eye, Download, TrendingUp,
  Target, Users as UsersIcon, GraduationCap,
  BriefcaseBusiness, Globe as GlobeIcon,
  Bell, ShieldCheck, Bookmark, BookOpen as BookOpenIcon,
  Code, Palette, Music, Camera, Gamepad2, Dumbbell,
  Utensils, Plane, Car, TreePine, Sun, Moon,
  Wifi, BatteryCharging, Cpu, Database,
  CloudRain, Thermometer, Wind, Droplets
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useRecruiter } from '../../context/RecruiterContext';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const RecruiterProfile = () => {
  const { user } = useAuth();
  const { 
    profile, 
    company,
    loading, 
    isRecruiter,
    refreshProfile  // Assuming your context has a refresh function
  } = useRecruiter();

  // Helper to get base URL from api instance
  const getBaseUrl = () => {
    return api.defaults.baseURL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');
  };

  // Helper to build full image URL (handles absolute vs relative)
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // If it starts with a slash, append to base URL
    return `${getBaseUrl()}${url}`;
  };
  
  // Refs for blob URLs to clean up properly
  const profilePicPreviewRef = useRef(null);
  const logoPreviewRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [recruiterForm, setRecruiterForm] = useState({
    phone_number: profile?.phone_number || '',
    designation: profile?.designation || '',
    department: profile?.department || '',
    bio: profile?.bio || '',
    profile_picture: null
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    tagline: '',
    description: '',
    industry: '',
    location: '',
    headquarters: '',
    founded_year: '',
    company_size: '',
    website: '',
    email: '',
    phone: '',
    logo: null,
    linkedin_url: '',
    twitter_url: '',
    facebook_url: '',
    instagram_url: '',
    perks: [],
    culture_description: '',
    awards: []
  });
  
  const [newPerk, setNewPerk] = useState('');
  const [newAward, setNewAward] = useState('');
  const [profileCompletion, setProfileCompletion] = useState({
    percentage: 0,
    checklist: []
  });

  // State to handle image load errors
  const [profileImageError, setProfileImageError] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);
  
  const logoInputRef = useRef(null);
  const profilePicInputRef = useRef(null);

  // Predefined perk suggestions
  const perkSuggestions = [
    { icon: <Heart size={16} />, label: 'Health Insurance' },
    { icon: <Clock size={16} />, label: 'Flexible Hours' },
    { icon: <Home size={16} />, label: 'Remote Work Options' },
    { icon: <DollarSign size={16} />, label: 'Stock Options' },
    { icon: <BookOpen size={16} />, label: 'Learning Budget' },
    { icon: <Coffee size={16} />, label: 'Free Snacks & Drinks' },
    { icon: <UsersIcon size={16} />, label: 'Team Events' },
    { icon: <Calendar size={16} />, label: 'Paid Parental Leave' },
    { icon: <Dumbbell size={16} />, label: 'Gym Membership' },
    { icon: <Plane size={16} />, label: 'Travel Opportunities' },
    { icon: <Cpu size={16} />, label: 'Latest Tech Equipment' },
    { icon: <Wifi size={16} />, label: 'Home Office Stipend' }
  ];

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (profilePicPreviewRef.current) {
        URL.revokeObjectURL(profilePicPreviewRef.current);
      }
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
      }
    };
  }, []);

  // Initialize forms from backend data
  useEffect(() => {
    if (profile) {
      setRecruiterForm({
        phone_number: profile.phone_number || '',
        designation: profile.designation || '',
        department: profile.department || '',
        bio: profile.bio || '',
        profile_picture: null // Don't store the image object here; keep it separate
      });

      // Reset image error states when profile changes
      setProfileImageError(false);

      // Set profile completion from backend
      if (profile.profile_completion) {
        setProfileCompletion(profile.profile_completion);
      }
    }
    
    if (company) {
      setCompanyForm({
        name: company.name || '',
        tagline: company.tagline || '',
        description: company.description || '',
        industry: company.industry || '',
        location: company.location || '',
        headquarters: company.headquarters || '',
        founded_year: company.founded_year || '',
        company_size: company.company_size || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        logo: null,
        linkedin_url: company.linkedin_url || '',
        twitter_url: company.twitter_url || '',
        facebook_url: company.facebook_url || '',
        instagram_url: company.instagram_url || '',
        perks: company.perks || [],
        culture_description: company.culture_description || '',
        awards: company.awards || []
      });
      setLogoImageError(false);
    }
  }, [profile, company]);

  // Calculate profile completion manually if not from backend
  useEffect(() => {
    if (!profile?.profile_completion && profile && company) {
      const calculateCompletion = () => {
        let totalPoints = 0;
        let earnedPoints = 0;
        const checklist = [];

        // Recruiter Information
        if (profile.designation) earnedPoints += 10;
        if (profile.bio) earnedPoints += 5;
        totalPoints += 15;

        checklist.push({
          id: 1,
          label: 'Add Recruiter Designation',
          completed: !!profile.designation,
          weight: 10,
          field: 'recruiter_designation'
        });

        checklist.push({
          id: 2,
          label: 'Add Recruiter Bio',
          completed: !!profile.bio,
          weight: 5,
          field: 'recruiter_bio'
        });

        // Company Information
        if (company) {
          // Basic Info
          if (company.name) earnedPoints += 10;
          if (company.description) earnedPoints += 10;
          if (company.industry) earnedPoints += 10;
          if (company.location) earnedPoints += 10;
          totalPoints += 40;

          checklist.push({
            id: 3,
            label: 'Add Company Name',
            completed: !!company.name,
            weight: 10,
            field: 'company_name'
          });

          checklist.push({
            id: 4,
            label: 'Add Company Description',
            completed: !!company.description,
            weight: 10,
            field: 'company_description'
          });

          checklist.push({
            id: 5,
            label: 'Add Industry',
            completed: !!company.industry,
            weight: 10,
            field: 'company_industry'
          });

          checklist.push({
            id: 6,
            label: 'Add Location',
            completed: !!company.location,
            weight: 10,
            field: 'company_location'
          });

          // Contact Info
          if (company.website) earnedPoints += 10;
          if (company.email) earnedPoints += 10;
          if (company.phone) earnedPoints += 5;
          totalPoints += 25;

          checklist.push({
            id: 7,
            label: 'Add Website',
            completed: !!company.website,
            weight: 10,
            field: 'company_website'
          });

          checklist.push({
            id: 8,
            label: 'Add Contact Email',
            completed: !!company.email,
            weight: 10,
            field: 'company_email'
          });

          checklist.push({
            id: 9,
            label: 'Add Contact Phone',
            completed: !!company.phone,
            weight: 5,
            field: 'company_phone'
          });

          // Social Media
          if (company.linkedin_url) earnedPoints += 10;
          totalPoints += 10;

          checklist.push({
            id: 10,
            label: 'Add LinkedIn URL',
            completed: !!company.linkedin_url,
            weight: 10,
            field: 'company_linkedin'
          });

          // Culture & Perks
          const hasPerks = company.perks && company.perks.length > 0;
          const hasCulture = company.culture_description && company.culture_description.length > 0;
          
          if (hasPerks && hasCulture) earnedPoints += 10;
          else if (hasPerks || hasCulture) earnedPoints += 5;
          totalPoints += 10;

          checklist.push({
            id: 11,
            label: 'Add Company Perks',
            completed: hasPerks,
            weight: 5,
            field: 'company_perks'
          });

          checklist.push({
            id: 12,
            label: 'Describe Company Culture',
            completed: hasCulture,
            weight: 5,
            field: 'company_culture'
          });
        }

        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        
        return {
          percentage,
          checklist
        };
      };

      setProfileCompletion(calculateCompletion());
    }
  }, [profile, company]);

  // Handle file uploads
  const handleFileUpload = (e, field, isCompany = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload JPEG, PNG, GIF, or WebP images only');
        return;
      }
      
      // Revoke previous blob URL if exists
      if (isCompany) {
        if (logoPreviewRef.current) {
          URL.revokeObjectURL(logoPreviewRef.current);
        }
        const previewUrl = URL.createObjectURL(file);
        logoPreviewRef.current = previewUrl;
        setCompanyForm(prev => ({
          ...prev,
          [field]: file
        }));
        setLogoImageError(false);
      } else {
        if (profilePicPreviewRef.current) {
          URL.revokeObjectURL(profilePicPreviewRef.current);
        }
        const previewUrl = URL.createObjectURL(file);
        profilePicPreviewRef.current = previewUrl;
        setRecruiterForm(prev => ({
          ...prev,
          [field]: file
        }));
        setProfileImageError(false);
      }
      
      toast.success('Image selected');
    }
  };

  // Handle perk operations
  const handleAddPerk = () => {
    if (!newPerk.trim()) {
      toast.error('Please enter a perk');
      return;
    }
    
    setCompanyForm(prev => ({
      ...prev,
      perks: [...prev.perks, newPerk]
    }));
    setNewPerk('');
    toast.success('Perk added!');
  };

  const handleRemovePerk = (index) => {
    if (!window.confirm('Remove this perk?')) return;
    
    setCompanyForm(prev => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index)
    }));
    toast.success('Perk removed!');
  };

  // Handle award operations
  const handleAddAward = () => {
    if (!newAward.trim()) {
      toast.error('Please enter an award');
      return;
    }
    
    setCompanyForm(prev => ({
      ...prev,
      awards: [...prev.awards, newAward]
    }));
    setNewAward('');
    toast.success('Award added!');
  };

  const handleRemoveAward = (index) => {
    if (!window.confirm('Remove this award?')) return;
    
    setCompanyForm(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
    toast.success('Award removed!');
  };

  // Quick add perk from suggestions
  const handleQuickAddPerk = (perkLabel) => {
    if (!companyForm.perks.includes(perkLabel)) {
      setCompanyForm(prev => ({
        ...prev,
        perks: [...prev.perks, perkLabel]
      }));
      toast.success(`Added: ${perkLabel}`);
    }
  };

  // Handle save recruiter profile
  const handleSaveRecruiterProfile = async () => {
    try {
      const formData = new FormData();
      
      Object.keys(recruiterForm).forEach(key => {
        if (recruiterForm[key] !== null && recruiterForm[key] !== undefined) {
          if (key === 'profile_picture' && recruiterForm[key] instanceof File) {
            formData.append(key, recruiterForm[key]);
          } else {
            formData.append(key, recruiterForm[key]);
          }
        }
      });

      const response = await api.patch('/api/accounts/recruiter/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update local state with returned data if needed
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Handle save company profile
  const handleSaveCompanyProfile = async () => {
    try {
      const formData = new FormData();
      
      Object.keys(companyForm).forEach(key => {
        if (companyForm[key] !== null && companyForm[key] !== undefined) {
          if (key === 'logo' && companyForm[key] instanceof File) {
            formData.append(key, companyForm[key]);
          } else if (key === 'perks' || key === 'awards') {
            formData.append(key, JSON.stringify(companyForm[key]));
          } else {
            formData.append(key, companyForm[key]);
          }
        }
      });

      const response = await api.patch('/api/accounts/recruiter/company/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating company profile:', error);
      throw error;
    }
  };

  // Handle save all changes
  const handleSaveAll = async () => {
    try {
      // Save both profiles in parallel
      await Promise.all([
        handleSaveRecruiterProfile(),
        handleSaveCompanyProfile()
      ]);
      
      toast.success('All changes saved successfully!');
      setIsEditing(false);
      
      // Refresh profile data via context (if available)
      if (refreshProfile) {
        refreshProfile();
      }
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    // Reset forms to original data
    if (profile) {
      setRecruiterForm({
        phone_number: profile.phone_number || '',
        designation: profile.designation || '',
        department: profile.department || '',
        bio: profile.bio || '',
        profile_picture: null
      });
      setProfileImageError(false);
    }
    
    if (company) {
      setCompanyForm({
        name: company.name || '',
        tagline: company.tagline || '',
        description: company.description || '',
        industry: company.industry || '',
        location: company.location || '',
        headquarters: company.headquarters || '',
        founded_year: company.founded_year || '',
        company_size: company.company_size || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        logo: null,
        linkedin_url: company.linkedin_url || '',
        twitter_url: company.twitter_url || '',
        facebook_url: company.facebook_url || '',
        instagram_url: company.instagram_url || '',
        perks: company.perks || [],
        culture_description: company.culture_description || '',
        awards: company.awards || []
      });
      setLogoImageError(false);
    }
    
    // Revoke any blob URLs
    if (profilePicPreviewRef.current) {
      URL.revokeObjectURL(profilePicPreviewRef.current);
      profilePicPreviewRef.current = null;
    }
    if (logoPreviewRef.current) {
      URL.revokeObjectURL(logoPreviewRef.current);
      logoPreviewRef.current = null;
    }
    
    setIsEditing(false);
  };

  // Function to jump to incomplete section
  const jumpToSection = (field) => {
    setIsEditing(true);
    const sectionId = `${field}-section`;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isRecruiter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be a recruiter to access this page.</p>
        </div>
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
                <h1 className="text-3xl font-bold text-gray-900">Recruiter Profile</h1>
                <p className="text-gray-600">Manage your profile and company information</p>
              </div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEditing}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                    >
                      <X size={20} className="mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAll}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium flex items-center"
                    >
                      <Save size={20} className="mr-2" />
                      Save All Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium flex items-center"
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
                    Profile Completion: {profileCompletion.percentage}%
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Complete your profile to attract better talent
                  </p>
                </div>
                
                <div className="flex-1 max-w-md">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {profileCompletion.percentage >= 80 ? 'Great!' : 
                         profileCompletion.percentage >= 60 ? 'Good progress!' : 
                         'Keep going!'}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {profileCompletion.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${profileCompletion.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Quick Actions for Incomplete Sections */}
                  {profileCompletion.percentage < 100 && (
                    <div className="flex flex-wrap gap-2">
                      {profileCompletion.checklist
                        .filter(item => !item.completed)
                        .slice(0, 3)
                        .map(item => (
                          <button
                            key={item.id}
                            onClick={() => jumpToSection(item.field)}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors flex items-center font-medium"
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
            {/* Left Column - Recruiter & Company Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recruiter Information */}
              <div id="recruiter_designation-section" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Recruiter Information</h2>
                    {profileCompletion.checklist.slice(0, 2).filter(item => item.completed).length === 2 ? (
                      <CheckCircle className="ml-2 h-6 w-6 text-green-500" />
                    ) : (
                      <div className="ml-2 h-6 w-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <div className="relative">
                    {isEditing ? (
                      <>
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-blue-200">
                          {recruiterForm.profile_picture instanceof File && profilePicPreviewRef.current ? (
                            <img
                              src={profilePicPreviewRef.current}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : profile?.profile_picture && !profileImageError ? (
                            <img
                              src={getFullImageUrl(profile.profile_picture)}
                              alt="Profile"
                              onError={() => setProfileImageError(true)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={48} className="text-blue-600" />
                          )}
                        </div>
                        <button 
                          onClick={() => profilePicInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
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
                        {profile?.profile_picture && !profileImageError ? (
                          <img
                            src={getFullImageUrl(profile.profile_picture)}
                            alt="Profile"
                            onError={() => setProfileImageError(true)}
                            className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                            <User size={48} className="text-blue-600" />
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
                      {user?.first_name} {user?.last_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                      <Mail size={20} className="mr-3 text-gray-400" />
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={recruiterForm.phone_number}
                        onChange={(e) => setRecruiterForm({...recruiterForm, phone_number: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                        <Phone size={20} className="mr-3 text-gray-400" />
                        {profile?.phone_number || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div id="designation-section">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={recruiterForm.designation}
                        onChange={(e) => setRecruiterForm({...recruiterForm, designation: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="HR Manager"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                        <Briefcase size={20} className="mr-3 text-gray-400" />
                        {profile?.designation || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={recruiterForm.department}
                        onChange={(e) => setRecruiterForm({...recruiterForm, department: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Human Resources"
                      />
                    </div>
                  )}
                </div>

                <div id="recruiter_bio-section" className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={recruiterForm.bio}
                      onChange={(e) => setRecruiterForm({...recruiterForm, bio: e.target.value})}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Tell candidates about your role and how you can help them..."
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
                      {recruiterForm.bio.length}/300 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Company Information */}
              {company && (
                <>
                  {/* Company Basic Information */}
                  <div id="company_name-section" className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                        {profileCompletion.checklist.slice(2, 6).filter(item => item.completed).length === 4 ? (
                          <CheckCircle className="ml-2 h-6 w-6 text-green-500" />
                        ) : (
                          <div className="ml-2 h-6 w-6 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                      <div className="relative">
                        {isEditing ? (
                          <>
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                              {companyForm.logo instanceof File && logoPreviewRef.current ? (
                                <img
                                  src={logoPreviewRef.current}
                                  alt="Company Logo"
                                  className="w-full h-full object-cover"
                                />
                              ) : company?.logo && !logoImageError ? (
                                <img
                                  src={getFullImageUrl(company.logo)}
                                  alt="Company Logo"
                                  onError={() => setLogoImageError(true)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                company?.name?.substring(0, 2).toUpperCase() || 'CO'
                              )}
                            </div>
                            <button 
                              onClick={() => logoInputRef.current?.click()}
                              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                            >
                              <Upload size={16} />
                            </button>
                            <input
                              type="file"
                              ref={logoInputRef}
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'logo', true)}
                              className="hidden"
                            />
                          </>
                        ) : (
                          <>
                            {company?.logo && !logoImageError ? (
                              <img
                                src={getFullImageUrl(company.logo)}
                                alt="Company Logo"
                                onError={() => setLogoImageError(true)}
                                className="w-24 h-24 rounded-xl object-cover border-2 border-blue-200"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                {company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="TechCorp Inc."
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <Building size={20} className="mr-3 text-gray-400" />
                            {company?.name || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={companyForm.tagline}
                            onChange={(e) => setCompanyForm({...companyForm, tagline: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Building the future of technology"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">
                              {company?.tagline || 'No tagline provided'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div id="company_industry-section">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={companyForm.industry}
                            onChange={(e) => setCompanyForm({...companyForm, industry: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Technology"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <TargetIcon size={20} className="mr-3 text-gray-400" />
                            {company?.industry || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div id="company_location-section">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={companyForm.location}
                            onChange={(e) => setCompanyForm({...companyForm, location: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="San Francisco, CA"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <MapPin size={20} className="mr-3 text-gray-400" />
                            {company?.location || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div id="company_size-section">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={companyForm.company_size}
                            onChange={(e) => setCompanyForm({...companyForm, company_size: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="501-1000 employees"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <Users size={20} className="mr-3 text-gray-400" />
                            {company?.company_size || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={companyForm.founded_year}
                            onChange={(e) => setCompanyForm({...companyForm, founded_year: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="2015"
                            min="1900"
                            max="2030"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <Calendar size={20} className="mr-3 text-gray-400" />
                            {company?.founded_year || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={companyForm.headquarters}
                          onChange={(e) => setCompanyForm({...companyForm, headquarters: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="123 Tech Street, San Francisco, CA 94107"
                        />
                      ) : (
                        <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                          <Map size={20} className="mr-3 text-gray-400" />
                          {company?.headquarters || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div id="company_description-section" className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                      {isEditing ? (
                        <textarea
                          value={companyForm.description}
                          onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="Describe your company, mission, values, and what makes you unique..."
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700">
                            {company?.description || 'No description provided yet.'}
                          </p>
                        </div>
                      )}
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          {companyForm.description.length}/2000 characters
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact & Social */}
                  <div id="company_website-section" className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Contact & Social Media</h2>
                      {profileCompletion.checklist.slice(6, 10).filter(item => item.completed).length >= 3 ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={companyForm.website}
                            onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="https://www.company.com"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <Globe size={20} className="mr-3 text-gray-400" />
                            {company?.website ? (
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {company.website}
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        )}
                      </div>

                      <div id="company_email-section">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={companyForm.email}
                            onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="careers@company.com"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <Mail size={20} className="mr-3 text-gray-400" />
                            {company?.email || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div id="company_phone-section">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={companyForm.phone}
                            onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="(415) 555-1234"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <PhoneCall size={20} className="mr-3 text-gray-400" />
                            {company?.phone || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div id="company_linkedin-section">
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        {isEditing ? (
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Linkedin size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={companyForm.linkedin_url}
                              onChange={(e) => setCompanyForm({...companyForm, linkedin_url: e.target.value})}
                              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="linkedin.com/company/company-name"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Linkedin size={20} className="mr-3 text-gray-400" />
                              {company?.linkedin_url ? (
                                <span className="truncate">{company.linkedin_url}</span>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                            {company?.linkedin_url && (
                              <a 
                                href={company.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                        {isEditing ? (
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Twitter size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={companyForm.twitter_url}
                              onChange={(e) => setCompanyForm({...companyForm, twitter_url: e.target.value})}
                              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="twitter.com/company"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Twitter size={20} className="mr-3 text-gray-400" />
                              {company?.twitter_url ? (
                                <span className="truncate">{company.twitter_url}</span>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                            {company?.twitter_url && (
                              <a 
                                href={company.twitter_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                        {isEditing ? (
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Facebook size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={companyForm.facebook_url}
                              onChange={(e) => setCompanyForm({...companyForm, facebook_url: e.target.value})}
                              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="facebook.com/company"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Facebook size={20} className="mr-3 text-gray-400" />
                              {company?.facebook_url ? (
                                <span className="truncate">{company.facebook_url}</span>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                            {company?.facebook_url && (
                              <a 
                                href={company.facebook_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                        {isEditing ? (
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Instagram size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={companyForm.instagram_url}
                              onChange={(e) => setCompanyForm({...companyForm, instagram_url: e.target.value})}
                              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="instagram.com/company"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-900 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Instagram size={20} className="mr-3 text-gray-400" />
                              {company?.instagram_url ? (
                                <span className="truncate">{company.instagram_url}</span>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                            {company?.instagram_url && (
                              <a 
                                href={company.instagram_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Company Culture & Perks */}
                  <div id="company_perks-section" className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Company Culture & Perks</h2>
                      {profileCompletion.checklist.slice(10, 12).filter(item => item.completed).length === 2 ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>

                    {/* Perks Section */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Employee Perks & Benefits</h3>
                        {isEditing && (
                          <span className="text-sm text-gray-500">
                            {companyForm.perks?.length || 0} perks
                          </span>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-6">
                          {/* Quick Add Perks */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add Popular Perks</h4>
                            <div className="flex flex-wrap gap-2">
                              {perkSuggestions.map((perk, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleQuickAddPerk(perk.label)}
                                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center"
                                >
                                  <span className="mr-1.5 text-blue-500">{perk.icon}</span>
                                  {perk.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Current Perks */}
                          <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {companyForm.perks?.map((perk, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full flex items-center"
                                >
                                  {perk}
                                  <button
                                    onClick={() => handleRemovePerk(index)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 p-1 rounded-full"
                                    title="Remove perk"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            {/* Add Perk Form */}
                            <div className="flex">
                              <input
                                type="text"
                                value={newPerk}
                                onChange={(e) => setNewPerk(e.target.value)}
                                placeholder="Add a custom perk (e.g., Annual Retreat, Stock Options)"
                                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddPerk();
                                  }
                                }}
                              />
                              <button
                                onClick={handleAddPerk}
                                className="px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {company?.perks && company.perks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {company.perks.map((perk, index) => (
                                <div
                                  key={index}
                                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                >
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                  <span className="font-medium text-gray-900">{perk}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No perks added yet.</p>
                              <p className="text-gray-400 text-sm">Add perks to attract better talent</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Culture Description */}
                    <div id="company_culture-section">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Culture Description</label>
                      {isEditing ? (
                        <textarea
                          value={companyForm.culture_description}
                          onChange={(e) => setCompanyForm({...companyForm, culture_description: e.target.value})}
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="Describe your company culture, values, work environment, and what makes your workplace special..."
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700">
                            {company?.culture_description || 'No culture description provided yet.'}
                          </p>
                        </div>
                      )}
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          {companyForm.culture_description.length}/1000 characters
                        </p>
                      )}
                    </div>

                    {/* Awards Section */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Awards & Recognition</h3>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {companyForm.awards?.map((award, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full flex items-center"
                              >
                                <Star size={14} className="mr-2 text-yellow-600" />
                                {award}
                                <button
                                  onClick={() => handleRemoveAward(index)}
                                  className="ml-2 text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200 p-1 rounded-full"
                                  title="Remove award"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex">
                            <input
                              type="text"
                              value={newAward}
                              onChange={(e) => setNewAward(e.target.value)}
                              placeholder="Add an award or recognition (e.g., Best Workplace 2023)"
                              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddAward();
                                }
                              }}
                            />
                            <button
                              onClick={handleAddAward}
                              className="px-6 bg-yellow-500 text-white rounded-r-lg hover:bg-yellow-600 transition-colors font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {company?.awards && company.awards.length > 0 ? (
                            company.awards.map((award, index) => (
                              <div
                                key={index}
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors"
                              >
                                <AwardIcon className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                                <span className="font-medium text-gray-900">{award}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                              <AwardIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">No awards added yet.</p>
                              <p className="text-gray-400 text-sm">Showcase your company's achievements</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Stats & Completion */}
            <div className="space-y-8">
              {/* Profile Completion Checklist */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
                <div className="space-y-3">
                  {profileCompletion.checklist.map((item) => (
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
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3"></div>
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
                    <span className="text-2xl font-bold text-blue-600">{profileCompletion.percentage}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete all sections to reach 100%
                  </p>
                </div>
              </div>

              {/* Company Stats */}
              {company && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Company Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Company Size</p>
                          <p className="font-semibold text-gray-900">
                            {company?.company_size || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Founded</p>
                          <p className="font-semibold text-gray-900">
                            {company?.founded_year || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <Building className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Industry</p>
                          <p className="font-semibold text-gray-900">
                            {company?.industry || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <AwardIcon className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Awards</p>
                          <p className="font-semibold text-gray-900">
                            {company?.awards?.length || 0} awards
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div className="flex items-center">
                        <Package className="h-8 w-8 text-pink-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Perks</p>
                          <p className="font-semibold text-gray-900">
                            {company?.perks?.length || 0} perks
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Stats */}
              {company && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Social Presence</h2>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${company?.linkedin_url ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center">
                        <Linkedin className="h-5 w-5 text-gray-600 mr-3" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </div>
                      {company?.linkedin_url ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    
                    <div className={`flex items-center justify-between p-3 rounded-lg ${company?.twitter_url ? 'bg-sky-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center">
                        <Twitter className="h-5 w-5 text-gray-600 mr-3" />
                        <span className="text-sm font-medium">Twitter</span>
                      </div>
                      {company?.twitter_url ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    
                    <div className={`flex items-center justify-between p-3 rounded-lg ${company?.facebook_url ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center">
                        <Facebook className="h-5 w-5 text-gray-600 mr-3" />
                        <span className="text-sm font-medium">Facebook</span>
                      </div>
                      {company?.facebook_url ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    
                    <div className={`flex items-center justify-between p-3 rounded-lg ${company?.instagram_url ? 'bg-pink-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center">
                        <Instagram className="h-5 w-5 text-gray-600 mr-3" />
                        <span className="text-sm font-medium">Instagram</span>
                      </div>
                      {company?.instagram_url ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Strength */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Strength</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Recruiter Info</span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round((profileCompletion.checklist.slice(0, 2).filter(item => item.completed).length / 2) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(profileCompletion.checklist.slice(0, 2).filter(item => item.completed).length / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {company && (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Company Basics</span>
                          <span className="text-sm font-bold text-blue-600">
                            {Math.round((profileCompletion.checklist.slice(2, 6).filter(item => item.completed).length / 4) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(profileCompletion.checklist.slice(2, 6).filter(item => item.completed).length / 4) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Contact Details</span>
                          <span className="text-sm font-bold text-blue-600">
                            {Math.round((profileCompletion.checklist.slice(6, 10).filter(item => item.completed).length / 4) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(profileCompletion.checklist.slice(6, 10).filter(item => item.completed).length / 4) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Culture & Perks</span>
                          <span className="text-sm font-bold text-blue-600">
                            {Math.round((profileCompletion.checklist.slice(10, 12).filter(item => item.completed).length / 2) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(profileCompletion.checklist.slice(10, 12).filter(item => item.completed).length / 2) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecruiterProfile;