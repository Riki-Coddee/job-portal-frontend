import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Upload, 
  X, 
  HelpCircle,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  Globe,
  FileText,
  Calendar,
  AlertCircle,
  Tag,
  Building,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../api';
import { useRecruiter } from '../../context/RecruiterContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SkillsInput from '../../components/SkillsInput';

const PostJob = () => {
  const navigate = useNavigate();
  const { company, loading: recruiterLoading } = useRecruiter();
  const { isAuthorized, loading: authLoading } = useAuth();
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Initialize formData with empty company field
  const [formData, setFormData] = useState({
    title: '',
    company: '', // Start with empty string
    location: '',
    job_type: 'full_time',
    department: '',
    remote_policy: 'hybrid',
    salary_min: '',
    salary_max: '',
    currency: 'NPR',
    experience_level: 'mid',
    description: '',
    requirements: '',
    benefits: '',
    skills: [], // Add skills array to formData
    display_salary: true,
    is_featured: false,
    publish_option: 'immediate',
    scheduled_date: null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

    useEffect(() => {
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

    fetchDepartments();
  }, []);

  // Update company field when company data is available
  useEffect(() => {
    if (company?.name) {
      setFormData(prev => ({
        ...prev,
        company: company.name
      }));
    }
  }, [company]);

  // Handle authentication and loading states
  useEffect(() => {
    if (!authLoading && !recruiterLoading) {
      if (!isAuthorized) {
        navigate('/login');
        return;
      }
      setIsLoading(false);
    }
  }, [authLoading, recruiterLoading, isAuthorized, navigate]);

  // Show loading state
  if (isLoading || authLoading || recruiterLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job posting form...</p>
        </div>
      </div>
    );
  }

  // Show company not found message
  if (!company) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Company Profile Required</h2>
          <p className="text-yellow-700 mb-4">
            You need to set up your company profile before posting jobs.
          </p>
          <button
            onClick={() => navigate('/recruiter/company-profile')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Go to Company Profile
          </button>
        </div>
      </div>
    );
  }

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      scheduled_date: date ? date.toISOString() : null
    }));
  };

  // Handle skills change from SkillsInput component
  const handleSkillsChange = (skills) => {
    setFormData(prev => ({
      ...prev,
      skills: skills
    }));
  };
  
  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      department: value
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Requirements are required';
    }
    
    // Optional: Add validation for skills if you want them to be required
    // if (formData.skills.length === 0) {
    //   newErrors.skills = 'At least one skill is required';
    // }
    
    if (formData.salary_min && formData.salary_max) {
      if (parseFloat(formData.salary_min) > parseFloat(formData.salary_max)) {
        newErrors.salary = 'Minimum salary cannot be greater than maximum salary';
      }
    }
    
    if (formData.publish_option === 'schedule' && !formData.scheduled_date) {
      newErrors.scheduled_date = 'Please select a date for scheduling';
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
    
    setSubmitting(true);
    
    try {
      
      const response = await api.post('/api/jobs/', formData);
      
      toast.success('Job posted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        company: company.name,
        location: '',
        job_type: 'full_time',
        department: '',
        remote_policy: 'hybrid',
        salary_min: '',
        salary_max: '',
        currency: 'NPR',
        experience_level: 'mid',
        description: '',
        requirements: '',
        benefits: '',
        skills: [],
        display_salary: true,
        is_featured: false,
        publish_option: 'immediate',
        scheduled_date: null,
      });
      setSelectedDate(null);
      setErrors({});
      
    } catch (error) {
      console.error('Error posting job:', error);
      
      if (error.response?.data) {
        setErrors(error.response.data);
        toast.error('Please check the form for errors');
      } else {
        toast.error('Failed to post job. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Add this new component for scheduling
  const ScheduleOptions = () => {
    if (formData.publish_option !== 'schedule') return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-800">Schedule Publication</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date & Time *
            </label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select date and time"
                popperPlacement="top-start"
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
            <h4 className="font-medium text-gray-900 mb-2">Schedule Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                Job will be published automatically at the selected time
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                You can edit the job until it's published
              </li>
              <li className="flex items-start">
                <HelpCircle className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                You'll receive a notification when the job goes live
              </li>
            </ul>
            
            {selectedDate && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Scheduled for: {selectedDate.toLocaleDateString('en-US', {
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
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600">Fill in the details below to post your job opening</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center mb-6">
            <Briefcase className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Senior Frontend Developer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  className={`w-full pl-10 pr-10 py-3 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
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
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
              {loadingDepartments && (
                <p className="mt-1 text-sm text-gray-500">Loading departments...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {jobTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, job_type: type.id }))}
                    className={`p-3 text-center rounded-lg border ${formData.job_type === type.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remote Policy
              </label>
              <div className="flex space-x-3">
                {remoteOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, remote_policy: option.id }))}
                    className={`flex-1 p-4 text-center rounded-lg border ${formData.remote_policy === option.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills Input Card - NEW SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center mb-6">
            <Tag className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
          </div>
          
          <SkillsInput
            skills={formData.skills}
            onChange={handleSkillsChange}
            placeholder="Add required skills (e.g., React, Python, AWS...)"
          />
          
          {errors.skills && (
            <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
          )}
        </motion.div>

        {/* Salary & Experience Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center mb-6">
            <DollarSign className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Salary & Experience</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range (Annual)
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="salary_min"
                      value={formData.salary_min}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Min"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="salary_max"
                      value={formData.salary_max}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">NPR</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              {errors.salary && (
                <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
              )}
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="display_salary"
                  name="display_salary"
                  checked={formData.display_salary}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="display_salary" className="ml-2 text-sm text-gray-700">
                  Display salary on job listing
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">Leave empty if you want to display "Competitive Salary"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, experience_level: level.id }))}
                    className={`p-4 text-center rounded-lg border ${formData.experience_level === level.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Job Description Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Job Description & Requirements</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 border ${errors.requirements ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="List the required skills, qualifications, and experience..."
              />
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits & Perks
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Health insurance, flexible hours, stock options, etc..."
              />
            </div>
          </div>
        </motion.div>

        {/* Publish Options Card - Updated */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center mb-6">
            <Globe className="h-6 w-6 text-orange-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Publish Options</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Post Immediately</p>
                <p className="text-sm text-gray-600">The job will be published as soon as you submit</p>
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
                <p className="text-sm text-gray-600">Choose when to publish this job listing</p>
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

            {/* Schedule Options Component */}
            <ScheduleOptions />

            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Feature this Job</p>
                <p className="text-sm text-gray-600">Highlight your job for better visibility ($99/month)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0"
        >
          <div className="flex items-center text-sm text-gray-600">
            <HelpCircle className="h-4 w-4 mr-2" />
            Need help? Contact our support team
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                // Save as draft logic
                console.log('Save draft:', formData);
                toast.info('Draft saved successfully');
              }}
              className="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              disabled={submitting}
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : formData.publish_option === 'schedule' ? (
                'Schedule Job'
              ) : (
                'Publish Job'
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default PostJob;