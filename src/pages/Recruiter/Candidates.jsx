// src/pages/Candidates.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  MoreVertical,
  MessageSquare,
  ChevronRight,
  UserPlus,
  Tag,
  Loader2,
  Edit,
  Trash2,
  Plus,
  X,
  Heart,
  ExternalLink,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useRecruiter } from '../../context/RecruiterContext';
import { useNavigate } from 'react-router-dom';

const Candidates = () => {
  const { company } = useRecruiter();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [jobStats, setJobStats] = useState({});
   const navigate = useNavigate();

  // Fetch applications, stats, and jobs
  useEffect(() => {
    fetchApplications();
    fetchStats();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/applications/');
      setApplications(response.data);
      
      // Calculate job-specific stats
      calculateJobStats(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs/');
      setJobs(response.data.filter(job => job.is_published));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/applications/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateJobStats = (apps) => {
    const statsByJob = {};
    
    apps.forEach(app => {
      if (!statsByJob[app.job]) {
        statsByJob[app.job] = {
          total: 0,
          new: 0,
          pending: 0,
          reviewed: 0,
          shortlisted: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          accepted: 0,
          favorites: 0
        };
      }
      
      statsByJob[app.job].total++;
      if (app.status) statsByJob[app.job][app.status]++;
      if (app.is_favorite) statsByJob[app.job].favorites++;
    });
    
    setJobStats(statsByJob);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await api.post(`/api/applications/${applicationId}/update_status/`, {
        status: newStatus
      });
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      toast.success('Status updated successfully');
      fetchStats(); // Refresh stats
      fetchApplications(); // Refresh to recalculate job stats
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleFavorite = async (applicationId) => {
    try {
      const response = await api.post(`/api/applications/${applicationId}/toggle_favorite/`);
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, is_favorite: response.data.is_favorite } : app
      ));
      
      toast.success(response.data.is_favorite ? 'Added to favorites' : 'Removed from favorites');
      fetchApplications(); // Refresh to recalculate job stats
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const updateMatchScore = async (applicationId, newScore) => {
    try {
      await api.post(`/api/applications/${applicationId}/update_score/`, {
        score: newScore
      });
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, match_score: newScore } : app
      ));
      
      toast.success('Match score updated');
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      await api.delete(`/api/applications/${applicationId}/`);
      setApplications(applications.filter(app => app.id !== applicationId));
      toast.success('Application deleted successfully');
      fetchStats();
      fetchApplications(); // Refresh to recalculate job stats
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const scheduleInterview = async (applicationId, interviewData) => {
    try {
      await api.post(`/api/applications/${applicationId}/schedule_interview/`, interviewData);
      toast.success('Interview scheduled successfully');
      setShowInterviewModal(false);
      fetchApplications(); // Refresh applications
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const addNote = async (applicationId, note) => {
    try {
      await api.post(`/api/applications/${applicationId}/add_note/`, {
        note: note,
        is_private: false
      });
      toast.success('Note added successfully');
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-gray-100 text-gray-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview': return 'bg-indigo-100 text-indigo-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-violet-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-indigo-500 to-blue-500',
      'from-red-500 to-orange-500',
      'from-teal-500 to-green-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const statusOptions = [
    { id: 'all', label: 'All Statuses' },
    { id: 'new', label: 'New' },
    { id: 'pending', label: 'Pending' },
    { id: 'reviewed', label: 'Reviewed' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'accepted', label: 'Accepted' },
  ];

  const toggleJobExpansion = (jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  // Get applications for a specific job
  const getApplicationsByJob = (jobId) => {
    let filtered = applications;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position_applied.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (jobId !== 'all') {
      filtered = filtered.filter(app => app.job === jobId);
    }
    
    return filtered;
  };

  // Get job title by ID
  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : `Job #${jobId}`;
  };

  // Get job details by ID
  const getJobDetails = (jobId) => {
    return jobs.find(j => j.id === jobId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  // Get all job IDs with applications
  const jobIdsWithApplications = [...new Set(applications.map(app => app.job))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage and track candidates by job</p>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-600">Total Candidates</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-600">New Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.new_today}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-600">Avg. Match Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(stats.avg_match_score)}%
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-600">Pending Interviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending_interviews}</p>
          </motion.div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidates by name, position, or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      {/* Job Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Filter by Job
          </h3>
          <button
            onClick={() => setSelectedJob('all')}
            className={`text-sm px-3 py-1 rounded-lg ${selectedJob === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Show All Jobs
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedJob('all')}
            className={`px-4 py-2 rounded-lg ${selectedJob === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Jobs ({applications.length})
          </button>
          
          {jobs.map(job => {
            const jobApps = applications.filter(app => app.job === job.id);
            if (jobApps.length === 0) return null;
            
            return (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${selectedJob === job.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span>{job.title}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {jobApps.length}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Jobs with Applications */}
      {selectedJob === 'all' ? (
        // Show all jobs grouped
        <div className="space-y-6">
          {jobs.filter(job => applications.some(app => app.job === job.id)).map(job => {
            const jobApplications = getApplicationsByJob(job.id);
            if (jobApplications.length === 0) return null;
            
            const isExpanded = expandedJobs[job.id] || false;
            const jobStat = jobStats[job.id] || {};
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Job Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleJobExpansion(job.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Users size={14} className="mr-1" />
                            {jobApplications.length} applicants
                          </span>
                          <span className="flex items-center">
                            <Star size={14} className="mr-1" />
                            Avg. Score: {Math.round(jobApplications.reduce((sum, app) => sum + (app.match_score || 0), 0) / jobApplications.length)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Applicants</div>
                        <div className="text-2xl font-bold text-gray-900">{jobApplications.length}</div>
                      </div>
                      <button className="text-gray-500">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Job Stats */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      New: {jobStat.new || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pending: {jobStat.pending || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Shortlisted: {jobStat.shortlisted || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                      Interview: {jobStat.interview || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Offer: {jobStat.offer || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Rejected: {jobStat.rejected || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                      Accepted: {jobStat.accepted || 0}
                    </span>
                    <span className="px-3 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
                      Favorites: {jobStat.favorites || 0}
                    </span>
                  </div>
                </div>
                
                {/* Applicants Grid (Collapsible) */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Applicants for this Position</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {jobApplications.map((application, index) => (
                          <CandidateCard
                            key={application.id}
                            application={application}
                            index={index}
                            getAvatarColor={getAvatarColor}
                            getStatusColor={getStatusColor}
                            toggleFavorite={toggleFavorite}
                            setEditingApplication={setEditingApplication}
                            setShowNoteModal={setShowNoteModal}
                            setShowInterviewModal={setShowInterviewModal}
                            updateApplicationStatus={updateApplicationStatus}
                            navigate={navigate}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Show applications for selected job only
        <div>
          {(() => {
            const job = getJobDetails(selectedJob);
            const jobApplications = getApplicationsByJob(selectedJob);
            const jobStat = jobStats[selectedJob] || {};
            
            if (!job) return (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job not found</h3>
                <p className="text-gray-600">Select a different job from the filter above.</p>
              </div>
            );
            
            if (jobApplications.length === 0) return (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applicants for this job</h3>
                <p className="text-gray-600">No candidates have applied for this position yet.</p>
              </div>
            );
            
            return (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Job Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                        <div className="flex items-center space-x-6 text-sm text-gray-700 mt-2">
                          <span className="flex items-center">
                            <MapPin size={16} className="mr-2" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            Posted: {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users size={16} className="mr-2" />
                            {jobApplications.length} applicants
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedJob('all')}
                      className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      View All Jobs
                    </button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const selectedApps = jobApplications.filter(app => app.status === 'new');
                        if (selectedApps.length === 0) {
                          toast.info('No new applicants to shortlist');
                          return;
                        }
                        selectedApps.forEach(app => updateApplicationStatus(app.id, 'shortlisted'));
                        toast.success(`Shortlisted ${selectedApps.length} new applicants`);
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Shortlist All New ({jobStat.new || 0})
                    </button>
                    
                    <button
                      onClick={() => {
                        const selectedApps = jobApplications.filter(app => app.status === 'shortlisted');
                        if (selectedApps.length === 0) {
                          toast.info('No shortlisted applicants to schedule');
                          return;
                        }
                        // You could open a bulk schedule modal here
                        toast.info(`Select applicants to schedule interviews`);
                      }}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center"
                    >
                      <Calendar size={16} className="mr-2" />
                      Schedule Interviews ({jobStat.shortlisted || 0})
                    </button>
                    
                    <button
                      onClick={() => {
                        const selectedApps = jobApplications.filter(app => app.status === 'interview');
                        if (selectedApps.length === 0) {
                          toast.info('No applicants in interview stage');
                          return;
                        }
                        selectedApps.forEach(app => updateApplicationStatus(app.id, 'rejected'));
                        toast.success(`Rejected ${selectedApps.length} applicants after interview`);
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
                    >
                      <XCircle size={16} className="mr-2" />
                      Reject After Interview ({jobStat.interview || 0})
                    </button>
                  </div>
                </div>
                
                {/* Applicants Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobApplications.map((application, index) => (
                      <CandidateCard
                        key={application.id}
                        application={application}
                        index={index}
                        getAvatarColor={getAvatarColor}
                        getStatusColor={getStatusColor}
                        toggleFavorite={toggleFavorite}
                        setEditingApplication={setEditingApplication}
                        setShowNoteModal={setShowNoteModal}
                        setShowInterviewModal={setShowInterviewModal}
                        updateApplicationStatus={updateApplicationStatus}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <UserPlus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm 
              ? "No candidates match your search criteria. Try different keywords."
              : "You haven't received any applications yet. Jobs with applications will appear here."}
          </p>
        </motion.div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingApplication && (
        <EditModal
          application={editingApplication}
          onClose={() => setShowEditModal(false)}
          updateMatchScore={updateMatchScore}
          statusOptions={statusOptions.filter(s => s.id !== 'all')}
          updateApplicationStatus={updateApplicationStatus}
        />
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && editingApplication && (
        <InterviewModal
          application={editingApplication}
          onClose={() => setShowInterviewModal(false)}
          onSchedule={scheduleInterview}
        />
      )}

      {/* Add Note Modal */}
      {showNoteModal && editingApplication && (
        <NoteModal
          application={editingApplication}
          onClose={() => setShowNoteModal(false)}
          onAddNote={addNote}
        />
      )}
    </div>
  );
};

// ===================== REDESIGNED CANDIDATE CARD WITH PROFILE PICTURE SUPPORT =====================
const CandidateCard = ({ 
  application, 
  index, 
  getAvatarColor, 
  getStatusColor,
  toggleFavorite,
  setEditingApplication,
  setShowNoteModal,
  setShowInterviewModal,
  updateApplicationStatus,
  navigate
}) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Main Content */}
      <div className="p-5">
        {/* Header with Avatar and Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar - Image or Initials */}
            <div className="relative h-12 w-12">
              {application.candidate_profile_picture && !imageError ? (
                <img 
                  src={application.candidate_profile_picture} 
                  alt={application.candidate_name}
                  className="h-12 w-12 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${getAvatarColor(application.candidate_name)} flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
                  {application.candidate_name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{application.candidate_name}</h3>
                {application.is_favorite && (
                  <Heart size={14} className="text-red-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-gray-600">{application.position_applied}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
            {application.status_display}
          </span>
        </div>

        {/* Location and Applied Date */}
        <div className="mt-3 flex items-center text-xs text-gray-500 space-x-4">
          <span className="flex items-center">
            <MapPin size={12} className="mr-1" />
            {application.candidate_location}
          </span>
          <span className="flex items-center">
            <Calendar size={12} className="mr-1" />
            Applied {application.time_since_applied}
          </span>
        </div>

        {/* Skills */}
        {application.skills && application.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {application.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                {typeof skill === 'object' ? skill.name : skill}
              </span>
            ))}
            {application.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{application.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Match Score Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Match score</span>
            <span className="font-medium text-gray-900">{application.match_score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${application.match_score}%` }}
            />
          </div>
        </div>

        {/* Contact Info (shown on hover) */}
        <div className={`mt-3 transition-all duration-200 ${showActions ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="flex items-center text-xs text-gray-500 space-x-3 pt-2 border-t border-gray-100">
            <a href={`mailto:${application.candidate_email}`} className="flex items-center hover:text-blue-600 transition-colors">
              <Mail size={12} className="mr-1" />
              <span className="truncate max-w-[120px]">{application.candidate_email}</span>
            </a>
            <a href={`tel:${application.candidate_phone}`} className="flex items-center hover:text-blue-600 transition-colors">
              <Phone size={12} className="mr-1" />
              {application.candidate_phone}
            </a>
          </div>
        </div>
      </div>

      {/* Actions Footer - Redesigned with two rows */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        {/* Row 1: Status Quick Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                application.status === 'shortlisted' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Shortlist
            </button>
            <button
              onClick={() => {
                setEditingApplication(application);
                setShowInterviewModal(true);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                application.status === 'interview' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Interview
            </button>
            <button
              onClick={() => updateApplicationStatus(application.id, 'offer')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                application.status === 'offer' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Offer
            </button>
            <button
              onClick={() => updateApplicationStatus(application.id, 'rejected')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                application.status === 'rejected' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Row 2: View Profile + Icons */}
        <div className="flex items-center justify-between">
          {/* Prominent View Profile Button */}
          <button 
            onClick={() => navigate(`/recruiter/candidates/${application.id}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center shadow-sm"
            title="View full profile"
          >
            <Eye size={16} className="mr-2" />
            View Profile
          </button>

          {/* Icons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => toggleFavorite(application.id)}
              className={`p-1.5 rounded-md transition-colors ${
                application.is_favorite 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
              }`}
              title={application.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} className={application.is_favorite ? 'fill-current' : ''} />
            </button>
            <button 
              onClick={() => setEditingApplication(application)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              title="More options"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Edit Modal Component
const EditModal = ({ application, onClose, updateMatchScore, statusOptions, updateApplicationStatus }) => {
  const [formData, setFormData] = useState({
    match_score: application.match_score || 0,
    status: application.status || 'new'
  });

  const handleSubmit = () => {
    updateMatchScore(application.id, formData.match_score);
    if (formData.status !== application.status) {
      updateApplicationStatus(application.id, formData.status);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Candidate</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Score (0-100)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.match_score}
              onChange={(e) => setFormData({...formData, match_score: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>0%</span>
              <span className="font-bold">{formData.match_score}%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Interview Modal Component (Keep existing)
const InterviewModal = ({ application, onClose, onSchedule }) => {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    interview_type: 'video',
    duration: 60,
    meeting_link: '',
    location: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSchedule(application.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.scheduled_date}
              onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>
            <select
              value={formData.interview_type}
              onChange={(e) => setFormData({...formData, interview_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="phone">Phone Screen</option>
              <option value="video">Video Call</option>
              <option value="onsite">On-site Interview</option>
              <option value="technical">Technical Assessment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="240"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meeting_link}
              onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Schedule Interview
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Note Modal Component (Keep existing)
const NoteModal = ({ application, onClose, onAddNote }) => {
  const [note, setNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note.trim()) {
      await onAddNote(application.id, note);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add Note</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note for {application.candidate_name}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="4"
              placeholder="Add your notes about this candidate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Note
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Candidates;