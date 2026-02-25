import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Building2, Clock, DollarSign, Globe, Calendar,
  CheckCircle, XCircle, Users, Award, Briefcase, ExternalLink,
  Share2, Mail, Linkedin, MessageCircle, Loader2,
  Bookmark, BookmarkCheck, TrendingUp, Eye, ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useJobSeeker } from '../context/JobSeekerContext';
import ApplicationModal from '../components/ApplicationModal';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized: isAuthenticated, user } = useAuth();
  const {
    currentJob,
    loading,
    error,
    fetchJobById,
    fetchSimilarJobs,
    saveJob,
    unsaveJob,
    savedJobs
  } = useJobs();
  
  const { hasApplied, applications, applicationsStats } = useJobSeeker();
  const [isApplying, setIsApplying] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Helper function to format skills consistently
  const formatSkills = (skills) => {
    if (!skills) return [];
    
    // Handle skills_display (array of strings)
    if (Array.isArray(skills)) {
      return skills.map((skill, index) => ({
        id: typeof skill === 'string' 
          ? skill.toLowerCase().replace(/\s+/g, '-') 
          : skill.id || `skill-${index}`,
        name: typeof skill === 'string' ? skill : skill.name || skill
      }));
    }
    
    return [];
  };

  // Get skills from the correct field (skills_display)
  const jobSkills = useMemo(() => {
    // Check if skills_display exists in currentJob
    if (currentJob?.skills_display && Array.isArray(currentJob.skills_display)) {
      return formatSkills(currentJob.skills_display);
    }
    // Fallback to skills field if it exists
    if (currentJob?.skills && Array.isArray(currentJob.skills)) {
      return formatSkills(currentJob.skills);
    }
    return [];
  }, [currentJob]);

  // Fetch job details and similar jobs
  useEffect(() => {
    if (id) {
      fetchJobById(id);

      setLoadingSimilar(true);
      fetchSimilarJobs(id)
        .then(data => {
          setSimilarJobs(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Error fetching similar jobs:', err);
          setSimilarJobs([]);
        })
        .finally(() => {
          setLoadingSimilar(false);
        });
    }
  }, [id, fetchJobById, fetchSimilarJobs]);

  // Check if job is saved
  useEffect(() => {
    if (id && savedJobs && Array.isArray(savedJobs)) {
      const saved = savedJobs.some(savedJob =>
        savedJob.id === parseInt(id) ||
        savedJob.job_id === parseInt(id) ||
        savedJob.job === parseInt(id)
      );
      setIsSaved(saved);
    }
  }, [id, savedJobs]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    try {
      if (isSaved) {
        await unsaveJob(id);
        toast.success('Job removed from saved jobs');
      } else {
        await saveJob(id);
        toast.success('Job saved successfully');
      }
      setIsSaved(!isSaved);
    } catch (err) {
      toast.error(err.message || 'Failed to save job');
    }
  };

  const handleApplyClick = () => {
    // Check if already applied FIRST
    if (hasUserApplied) {
      toast.info('You have already applied for this position');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to apply for this job');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user?.role !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    if (!currentJob?.is_active) {
      toast.error('This job is no longer accepting applications');
      return;
    }

    setShowApplicationModal(true);
  };

  const shareJob = (platform) => {
    const jobUrl = window.location.href;
    const jobTitle = currentJob?.title || 'Job Opportunity';
    const company = currentJob?.company || '';

    let shareUrl = '';
    switch(platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${jobTitle} at ${company} - ${jobUrl}`)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(jobTitle)}&body=${encodeURIComponent(`Check out this job: ${jobUrl}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const formatSalary = (job) => {
    if (!job) return 'Competitive Salary';

    // Use salary_display if available
    if (job?.salary_display) {
      return job.salary_display;
    }

    if (job?.salary_min && job?.salary_max) {
      return `${job.currency || '$'} ${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}`;
    } else if (job?.salary_min) {
      return `${job.currency || '$'} ${parseFloat(job.salary_min).toLocaleString()}+`;
    }
    return 'Competitive Salary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  // Use useMemo to prevent unnecessary re-renders
  const hasUserApplied = useMemo(() => {
    if (hasApplied && id) {
      return hasApplied(id);
    }
    return false;
  }, [hasApplied, id, applications]);

  const canApply = useMemo(() => {
    return isAuthenticated && currentJob?.is_active && user?.role === 'job_seeker' && !hasUserApplied;
  }, [isAuthenticated, currentJob?.is_active, user?.role, hasUserApplied]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
              <Loader2 className="animate-spin h-16 w-16 text-blue-600 relative z-10 mx-auto" />
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading job details...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !currentJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Job Not Found</h2>
              <p className="text-gray-600 mb-8">{error || 'The job you are looking for does not exist.'}</p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                Browse Jobs
                <ChevronRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const jobApplicants = currentJob?.applicants || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <nav className="mb-8">
            <motion.ol
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-sm"
            >
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link to="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Jobs
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-semibold truncate max-w-xs">{currentJob.title}</li>
            </motion.ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30"
                        >
                          <Briefcase className="h-10 w-10 text-white" />
                        </motion.div>
                        <div>
                          <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-bold text-white mb-2"
                          >
                            {currentJob.title}
                          </motion.h1>
                          <div className="flex items-center space-x-2">
                            <Building2 size={20} className="text-white/90" />
                            <span className="text-xl text-white/90 font-medium">{currentJob.company}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: MapPin, text: currentJob.location || 'Location not specified' },
                        { icon: Clock, text: currentJob.job_type === 'full_time' ? 'Full-time' :
                                           currentJob.job_type === 'part_time' ? 'Part-time' :
                                           currentJob.job_type === 'contract' ? 'Contract' :
                                           currentJob.job_type === 'internship' ? 'Internship' :
                                           currentJob.job_type || 'Temporary' },
                        { icon: DollarSign, text: formatSalary(currentJob) },
                        { icon: Calendar, text: `Posted ${formatDate(currentJob.published_at || currentJob.created_at)}` },
                        ...(jobApplicants > 0 ? [{ icon: Users, text: `${jobApplicants} applicants` }] : []),
                        { icon: Eye, text: `${applicationsStats?.total || 0} views` }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
                        >
                          <item.icon size={18} className="text-white/90 flex-shrink-0" />
                          <span className="text-white/90 text-sm font-medium truncate">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {/* If user has already applied, show success message */}
                  {hasUserApplied ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6"
                    >
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-ping"></div>
                            <CheckCircle className="h-10 w-10 relative" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-2xl font-bold mb-1">Already Applied</h3>
                            <p className="text-emerald-100">You've successfully applied for this position</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show application details */}
                      {applications && applications.length > 0 && (
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <h4 className="font-bold text-emerald-800 mb-2">Your Application Details:</h4>
                          {applications
                            .filter(app => app.job === parseInt(id))
                            .map(app => (
                              <div key={app.id} className="text-sm text-emerald-700">
                                <div>Applied: {app.applied_date} ({app.days_since_applied} days ago)</div>
                                <div>Status: <span className="font-bold">{app.status_display}</span></div>
                                <div>Match Score: <span className="font-bold">{app.match_score}%</span></div>
                              </div>
                            ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    // Only show apply button if user hasn't applied
                    <motion.button
                      whileHover={{ scale: canApply ? 1.02 : 1 }}
                      whileTap={{ scale: canApply ? 0.98 : 1 }}
                      onClick={handleApplyClick}
                      disabled={!canApply}
                      className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg relative overflow-hidden group
                        ${canApply
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-2xl hover:from-blue-700 hover:to-blue-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {canApply && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                      )}
                      <span className="relative flex items-center justify-center gap-3">
                        Apply Now
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ChevronRight size={24} />
                        </motion.div>
                      </span>
                    </motion.button>
                  )}

                  {isAuthenticated && user?.role === 'recruiter' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-amber-600 text-center mt-3 font-medium bg-amber-50 py-2 rounded-lg"
                    >
                      Recruiters cannot apply for jobs
                    </motion.p>
                  )}

                  {!isAuthenticated && !hasUserApplied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mt-6"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-amber-500 rounded-full p-1 mt-0.5">
                          <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-amber-900 flex-1">
                          <Link to="/login" className="font-bold hover:underline">Login</Link> or{' '}
                          <Link to="/register" className="font-bold hover:underline">register</Link> to apply for this job
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {!currentJob.is_active && !hasUserApplied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 mt-6"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-red-500 rounded-full p-1 mt-0.5">
                          <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-red-900 font-medium">
                          This job is no longer accepting applications
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {jobSkills.length > 0 ? (
                    jobSkills.map((skill, index) => (
                      <motion.span
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {skill.name}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No specific skills listed</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Job Description
                  </span>
                </h2>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed text-lg space-y-4 whitespace-pre-line">
                    {currentJob.description || 'No description available.'}
                  </div>

                  {currentJob.requirements && (
                    <div className="mt-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-3"></div>
                        Requirements
                      </h3>
                      <div className="text-gray-700 leading-relaxed space-y-3 whitespace-pre-line pl-4 border-l-2 border-gray-200">
                        {currentJob.requirements}
                      </div>
                    </div>
                  )}

                  {currentJob.benefits && (
                    <div className="mt-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-green-600 rounded-full mr-3"></div>
                        Benefits
                      </h3>
                      <div className="text-gray-700 leading-relaxed space-y-3 whitespace-pre-line pl-4 border-l-2 border-gray-200">
                        {currentJob.benefits}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Job Type', value: currentJob.job_type === 'full_time' ? 'Full-time' :
                                                currentJob.job_type === 'part_time' ? 'Part-time' :
                                                currentJob.job_type === 'contract' ? 'Contract' :
                                                currentJob.job_type === 'internship' ? 'Internship' :
                                                currentJob.job_type || 'Temporary', icon: Clock },
                    { label: 'Experience Level', value: currentJob.experience_level === 'entry' ? 'Entry Level' :
                                                        currentJob.experience_level === 'mid' ? 'Mid Level' :
                                                        currentJob.experience_level === 'senior' ? 'Senior' :
                                                        currentJob.experience_level || 'Executive', icon: Award },
                    { label: 'Remote Policy', value: currentJob.remote_policy === 'remote' ? 'Remote' :
                                                    currentJob.remote_policy === 'hybrid' ? 'Hybrid' :
                                                    currentJob.remote_policy || 'On-site', icon: Globe },
                    { label: 'Department', value: currentJob.department_name || 'Not specified', icon: Building2 },
                    ...(currentJob.education_level ? [{ label: 'Education Level', value: currentJob.education_level, icon: Award }] : []),
                    ...(currentJob.industry ? [{ label: 'Industry', value: currentJob.industry, icon: Briefcase }] : [])
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <item.icon size={20} className="text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">{item.label}</h4>
                      </div>
                      <p className="text-gray-900 font-bold text-lg pl-11">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 "
              >
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Job Overview</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Posted Date', value: formatDate(currentJob.published_at || currentJob.created_at) },
                    { label: 'Location', value: currentJob.location || 'Not specified' },
                    { label: 'Job Type', value: currentJob.job_type === 'full_time' ? 'Full-time' :
                                                currentJob.job_type === 'part_time' ? 'Part-time' :
                                                currentJob.job_type === 'contract' ? 'Contract' :
                                                currentJob.job_type === 'internship' ? 'Internship' :
                                                currentJob.job_type || 'Temporary' },
                    { label: 'Salary', value: formatSalary(currentJob) },
                    { label: 'Experience', value: currentJob.experience_level === 'entry' ? 'Entry Level' :
                                                  currentJob.experience_level === 'mid' ? 'Mid Level' :
                                                  currentJob.experience_level === 'senior' ? 'Senior' :
                                                  currentJob.experience_level || 'Executive' },
                    ...(jobApplicants > 0 ? [{ label: 'Applicants', value: jobApplicants.toString() }] : []),
                    { label: 'Application Deadline', value: currentJob.deadline ? formatDate(currentJob.deadline) : 'Open until filled' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-600 text-sm font-medium">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Similar Jobs</h3>
                  {loadingSimilar && (
                    <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="space-y-3">
                  {similarJobs.length > 0 ? (
                    similarJobs.map((job, index) => {
                      // Format skills for similar jobs
                      const similarJobSkills = job.skills_display || job.skills || [];
                      
                      return (
                        <motion.div
                          key={job.id || job.job_id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Link
                            to={`/jobs/${job.id || job.job_id}`}
                            className="block p-6 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                          >
                            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 font-medium">{job.company}</p>
                            
                            {/* Show first 2 skills for similar jobs */}
                            {similarJobSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {similarJobSkills.slice(0, 2).map((skill, i) => (
                                  <span 
                                    key={i}
                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                                  >
                                    {typeof skill === 'string' ? skill : skill.name || skill}
                                  </span>
                                ))}
                                {similarJobSkills.length > 2 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    +{similarJobSkills.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex flex-col text-sm">
                              <span className="text-gray-500 flex items-center">
                                <MapPin size={14} className="mr-1" />
                                {job.location || 'Remote'}
                              </span>
                              <span className="text-blue-600 font-semibold">{formatSalary(job)}</span>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })
                  ) : (
                    !loadingSimilar && (
                      <p className="text-gray-500 text-sm text-center py-8">No similar jobs found</p>
                    )
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-6 text-white"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Share2 size={22} className="text-white" />
                  <h3 className="text-xl font-bold">Share This Job</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { platform: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-500 to-blue-600' },
                    { platform: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
                    { platform: 'email', label: 'Email', icon: Mail, color: 'from-red-500 to-rose-600' }
                  ].map((item, index) => (
                    <motion.button
                      key={item.platform}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => shareJob(item.platform)}
                      className={`w-full p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center space-x-2 border border-white/30`}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {currentJob.recruiter && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">About the Recruiter</h3>
                  <div className="flex items-center mb-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl w-16 h-16 flex items-center justify-center mr-4 shadow-lg"
                    >
                      <Building2 size={28} className="text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{currentJob.recruiter.company_name}</h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {currentJob.recruiter.location}
                      </p>
                    </div>
                  </div>
                  {currentJob.recruiter.company_description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 bg-gray-50 p-4 rounded-xl">
                      {currentJob.recruiter.company_description}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {showApplicationModal && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          jobId={id}
          jobTitle={currentJob?.title || ''}
          // Pass skills_display to the modal
          jobSkills={currentJob?.skills_display || currentJob?.skills || []}
        />
      )}
    </div>
  );
};

export default JobDetails;