import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  X, 
  Loader2, 
  Save, 
  AlertCircle, 
  Calendar, 
  Clock,
  Globe,
  Eye,
  Pause,
  Play,
  TrendingUp,
  Bell,
  Building,
  ChevronDown,
  Tag               // <-- added for skills section icon
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import SkillsInput from './SkillsInput';   // <-- import SkillsInput

const EditJobModal = ({ job, isOpen, onClose, onJobUpdated }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(null);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Initialize form with job data when modal opens
  useEffect(() => {
    if (job && isOpen) {
      const initialData = {
        title: job.title || '',
        location: job.location || '',
        department: job.department || '',
        job_type: job.job_type || 'full_time',
        remote_policy: job.remote_policy || 'hybrid',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        currency: job.currency || 'NPR',
        experience_level: job.experience_level || 'mid',
        description: job.description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        skills: job.skills_display || [],          // <-- populate skills from job data
        display_salary: job.display_salary !== false,
        is_featured: job.is_featured || false,
        is_active: job.is_active !== false,
        publish_option: job.publish_option || 'immediate',
        expires_at: job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : '',
      };

      setFormData(initialData);
      
      // Set schedule date if job is scheduled
      if (job.scheduled_date && job.publish_option === 'schedule') {
        setSelectedScheduleDate(new Date(job.scheduled_date));
        setShowScheduleOptions(true);
      }
    }
  }, [job, isOpen]);

  // Fetch departments on mount
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await api.get('/api/departments/');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
      // Set default departments as fallback
      setDepartments([
        { id: 1, name: 'Information Technology', slug: 'information-technology' },
        { id: 2, name: 'Engineering', slug: 'engineering' },
        { id: 3, name: 'Marketing', slug: 'marketing' },
        { id: 4, name: 'Sales', slug: 'sales' },
        { id: 5, name: 'Human Resources', slug: 'human-resources' },
        { id: 6, name: 'Finance', slug: 'finance' },
        { id: 7, name: 'Healthcare', slug: 'healthcare' },
        { id: 8, name: 'Education', slug: 'education' },
        { id: 9, name: 'Design', slug: 'design' },
        { id: 10, name: 'Operations', slug: 'operations' },
      ]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // If publish option changes, handle schedule date
    if (name === 'publish_option') {
      if (value === 'schedule') {
        setShowScheduleOptions(true);
        if (!selectedScheduleDate) {
          setSelectedScheduleDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
          updatedData.scheduled_date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        }
      } else {
        setShowScheduleOptions(false);
        updatedData.scheduled_date = null;
        setSelectedScheduleDate(null);
      }
    }

    setFormData(updatedData);
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      department: value
    }));
  };

  const handleScheduleDateChange = (date) => {
    setSelectedScheduleDate(date);
    setFormData(prev => ({
      ...prev,
      scheduled_date: date ? date.toISOString() : null
    }));
  };

  // Handler for skills change
  const handleSkillsChange = (skills) => {
    setFormData(prev => ({
      ...prev,
      skills: skills
    }));
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.title?.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.requirements?.trim()) {
      newErrors.requirements = 'Requirements are required';
    }
    
    if (formData.publish_option === 'schedule' && !formData.scheduled_date) {
      newErrors.scheduled_date = 'Please select a schedule date';
    }
    
    if (formData.expires_at && new Date(formData.expires_at) <= new Date()) {
      newErrors.expires_at = 'Expiry date must be in the future';
    }
    
    setErrors(newErrors);    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setSaving(true);
    
    try {
      // Prepare data for API
      const dataToSend = {
        ...formData,
        // Convert empty strings to null for API
        salary_min: formData.salary_min || null,
        salary_max: formData.salary_max || null,
        expires_at: formData.expires_at || null,
        scheduled_date: formData.scheduled_date || null,
        // Ensure publish option is set correctly
        publish_option: formData.publish_option || 'immediate',
      };

      // Clear scheduled date if not scheduling
      if (formData.publish_option !== 'schedule') {
        dataToSend.scheduled_date = null;
      }

      const response = await api.patch(`/api/jobs/${job.id}/`, dataToSend);
      
      // If job was already published and now scheduled, show special message
      if (job?.is_published && formData.publish_option === 'schedule') {
        toast.success('Job re-scheduled successfully! It will be unpublished until the scheduled date.');
      } else {
        toast.success('Job updated successfully!');
      }
      
      onJobUpdated(response.data);
      onClose();
      
    } catch (error) {
      console.error('Error updating job:', error);
      
      if (error.response?.data) {
        setErrors(error.response.data);
        toast.error('Please check the form for errors');
      } else {
        toast.error('Failed to update job. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Schedule job now (immediate publication)
  const handlePublishNow = async () => {
    if (!job) return;
    
    try {
      setLoading(true);
      await api.post(`/api/jobs/${job.id}/publish_now/`);
      toast.success('Job published immediately!');
      
      // Fetch updated job data
      const response = await api.get(`/api/jobs/${job.id}/`);
      onJobUpdated(response.data);
      onClose();
      
    } catch (error) {
      console.error('Error publishing job:', error);
      toast.error('Failed to publish job');
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    { id: 'full_time', label: 'Full Time' },
    { id: 'part_time', label: 'Part Time' },
    { id: 'contract', label: 'Contract' },
    { id: 'internship', label: 'Internship' },
    { id: 'temporary', label: 'Temporary' },
  ];

  const remoteOptions = [
    { id: 'onsite', label: 'On-site' },
    { id: 'remote', label: 'Remote' },
    { id: 'hybrid', label: 'Hybrid' },
  ];

  const experienceLevels = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'senior', label: 'Senior' },
    { id: 'executive', label: 'Executive' },
  ];

  // Calculate job status with null checks
  const getJobStatus = () => {
    if (!job) return 'draft';
    
    if (job.is_published) {
      if (job.publish_option === 'schedule' && job.scheduled_date && new Date(job.scheduled_date) > new Date()) {
        return 'scheduled';
      }
      return 'published';
    }
    return 'draft';
  };

  const jobStatus = getJobStatus();

  if (!isOpen || !job) return null;

  return (
    <>
      {/* Backdrop with higher z-index */}
      <div className="fixed inset-0 z-[9999]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Edit Job: {job?.title || 'Job'}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      jobStatus === 'published' ? 'bg-green-100 text-green-800' :
                      jobStatus === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {jobStatus === 'published' ? 'Published' : 
                       jobStatus === 'scheduled' ? 'Scheduled' : 'Draft'}
                    </span>
                    {job?.is_featured && (
                      <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-100 transition-colors p-1"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handlePublishNow}
                    disabled={loading || job?.is_published}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Eye size={16} className="mr-2" />
                    )}
                    {job?.is_published ? 'Already Published' : 'Publish Now'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => window.open(`/jobs/${job?.id}`, '_blank')}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Eye size={16} className="mr-2" />
                    Preview
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                    job?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {job?.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {job?.is_active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="border-b pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TrendingUp size={20} className="mr-2 text-blue-600" />
                    Basic Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="e.g., Senior Frontend Developer"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="e.g., San Francisco, CA"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.location}
                        </p>
                      )}
                    </div>

                    {/* Department Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          name="department"
                          value={formData.department || ''}
                          onChange={handleDepartmentChange}
                          className={`w-full pl-10 pr-10 py-2.5 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                          disabled={loadingDepartments}
                        >
                          <option value="">Select a department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                      </div>
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.department}
                        </p>
                      )}
                      {loadingDepartments && (
                        <p className="mt-1 text-sm text-gray-500">Loading departments...</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Type *
                      </label>
                      <select
                        name="job_type"
                        value={formData.job_type || 'full_time'}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {jobTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remote Policy
                      </label>
                      <select
                        name="remote_policy"
                        value={formData.remote_policy || 'hybrid'}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {remoteOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        name="experience_level"
                        value={formData.experience_level || 'mid'}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {experienceLevels.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ===== NEW SECTION: Required Skills ===== */}
                <div className="border-b pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Tag size={20} className="mr-2 text-purple-600" />
                    Required Skills
                  </h4>
                  <SkillsInput
                    skills={formData.skills || []}
                    onChange={handleSkillsChange}
                    placeholder="Add required skills (e.g., React, Python, AWS...)"
                  />
                  {errors.skills && (
                    <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
                  )}
                </div>

                {/* Salary Information */}
                <div className="border-b pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Salary Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Salary
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {formData.currency === 'USD' ? '$' : 
                           formData.currency === 'EUR' ? '€' : 
                           formData.currency === 'GBP' ? '£' : 'रु'}
                        </span>
                        <input
                          type="number"
                          name="salary_min"
                          value={formData.salary_min || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Min"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Salary
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {formData.currency === 'USD' ? '$' : 
                           formData.currency === 'EUR' ? '€' : 
                           formData.currency === 'GBP' ? '£' : 'रु'}
                        </span>
                        <input
                          type="number"
                          name="salary_max"
                          value={formData.salary_max || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency || 'NPR'}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="NPR">NPR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="display_salary"
                        name="display_salary"
                        checked={formData.display_salary || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="display_salary" className="ml-2 text-sm text-gray-700">
                        Display salary on job listing
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        checked={formData.is_featured || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                        Feature this job (highlighted listing)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                        Job is active (visible to candidates)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Publication Options */}
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Globe size={20} className="mr-2 text-orange-600" />
                      Publication Options
                    </h4>
                    {job?.is_published && formData.publish_option === 'schedule' && (
                      <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                        ⚠️ Currently published - will be unpublished until scheduled date
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Publish Immediately</p>
                        <p className="text-sm text-gray-600">The job will be published right away</p>
                      </div>
                      <input
                        type="radio"
                        name="publish_option"
                        value="immediate"
                        checked={formData.publish_option === 'immediate'}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Schedule for Later</p>
                        <p className="text-sm text-gray-600">Choose when to publish this job</p>
                      </div>
                      <input
                        type="radio"
                        name="publish_option"
                        value="schedule"
                        checked={formData.publish_option === 'schedule'}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600"
                      />
                    </div>

                    {/* Schedule Options */}
                    {showScheduleOptions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center mb-3">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          <h5 className="font-medium text-blue-800">Schedule Settings</h5>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Date & Time *
                            </label>
                            <div className="relative">
                              <DatePicker
                                selected={selectedScheduleDate}
                                onChange={handleScheduleDateChange}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                minDate={new Date()}
                                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholderText="Select date and time"
                              />
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            {errors.scheduled_date && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.scheduled_date}
                              </p>
                            )}
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-2">
                              <Bell className="h-4 w-4 text-green-500 mr-2" />
                              <p className="font-medium text-gray-900">Schedule Information</p>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li className="flex items-start">
                                <Clock className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                                Job will be published automatically at the selected time
                              </li>
                              {job?.is_published && (
                                <li className="flex items-start">
                                  <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                                  Currently published job will be unpublished until scheduled time
                                </li>
                              )}
                              <li className="flex items-start">
                                <AlertCircle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                                You can edit the job until it's published
                              </li>
                            </ul>
                            
                            {selectedScheduleDate && (
                              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium">
                                  Scheduled for: {selectedScheduleDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Job Content */}
                <div className="border-b pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Job Content</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={6}
                        className={`w-full px-4 py-2.5 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements *
                      </label>
                      <textarea
                        name="requirements"
                        value={formData.requirements || ''}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-4 py-2.5 border ${errors.requirements ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="List the required skills, qualifications, and experience..."
                      />
                      {errors.requirements && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.requirements}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefits & Perks
                      </label>
                      <textarea
                        name="benefits"
                        value={formData.benefits || ''}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Health insurance, flexible hours, stock options, etc..."
                      />
                    </div>
                  </div>
                </div>

                {/* Expiration Date */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Job Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiration Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="expires_at"
                        value={formData.expires_at || ''}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Leave empty for no expiration (default: 30 days from publication)
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Current Status</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Published:</span>
                          <span className={job?.is_published ? 'text-green-600' : 'text-gray-600'}>
                            {job?.is_published ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Published At:</span>
                          <span className="text-gray-600">
                            {job?.published_at ? new Date(job.published_at).toLocaleDateString() : 'Not published'}
                          </span>
                        </div>
                        {job?.scheduled_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Scheduled Date:</span>
                            <span className="text-blue-600">
                              {new Date(job.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    {formData.publish_option === 'schedule' && selectedScheduleDate ? (
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Will publish on {selectedScheduleDate.toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-green-500" />
                        <span>Will publish immediately</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          {formData.publish_option === 'schedule' ? 'Schedule Changes' : 'Save Changes'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EditJobModal;