// src/pages/Recruiter/CandidateDetail.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  GraduationCap,
  Briefcase,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  MoreVertical,
  Send,
  User,
  Heart,
  Building,
  DollarSign,
  Users,
  Coffee,
  Sparkles,
  File,
  Target,
  Zap,
  Brain,
  Paperclip,
  FileType,
  FileImage,
  FileArchive,
  Eye,
  ChevronRight,
  TrendingUp,
  Shield,
  MessageCircle,
  Video,
  PhoneCall,
  X,
  Loader2,
  Trophy
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [note, setNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewData, setInterviewData] = useState({
    scheduled_date: '',
    interview_type: 'video',
    duration: 60,
    meeting_link: '',
    location: '',
  });
  const [notes, setNotes] = useState([]);
  const [interviews, setInterviews] = useState([]);

  // Helper to get the base URL from the api instance
  const getBaseUrl = () => {
    return api.defaults.baseURL || 'http://localhost:8000';
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/applications/${id}/`);
      console.log('Candidate data:', response.data);
      
      setCandidate(response.data);
      
      try {
        const interviewsResponse = await api.get(`/api/interviews/?application=${id}`);
        console.log('Interviews response:', interviewsResponse.data);
        
        if (Array.isArray(interviewsResponse.data)) {
          setInterviews(interviewsResponse.data);
        } else if (interviewsResponse.data.results) {
          setInterviews(interviewsResponse.data.results);
        } else {
          setInterviews([]);
        }
      } catch (interviewsError) {
        console.log('Interviews endpoint error:', interviewsError);
        setInterviews([]);
      }
      
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      toast.error('Failed to load candidate details');
      navigate('/recruiter/candidates');
    } finally {
      setLoading(false);
    }
  };

  const getSkills = () => {
    if (!candidate?.skills) return [];
    
    if (Array.isArray(candidate.skills)) {
      return candidate.skills.map(skill => {
        if (typeof skill === 'string') {
          return { name: skill, rating: 0, is_required: false, is_custom: false };
        }
        if (typeof skill === 'object') {
          return {
            name: skill.name || skill.skill || 'Unknown Skill',
            rating: skill.rating || 0,
            is_required: skill.is_required || false,
            is_custom: skill.is_custom || false
          };
        }
        return { name: 'Unknown', rating: 0, is_required: false, is_custom: false };
      });
    }
    
    return [];
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.post(`/api/applications/${id}/update_status/`, {
        status: newStatus
      });
      setCandidate(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleFavorite = async () => {
    try {
      const response = await api.post(`/api/applications/${id}/toggle_favorite/`);
      setCandidate(prev => ({ ...prev, is_favorite: response.data.is_favorite }));
      toast.success(response.data.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const addNote = async () => {
    if (!note.trim()) {
      toast.warning('Please enter a note');
      return;
    }

    try {
      await api.post(`/api/applications/${id}/add_note/`, {
        note: note,
        is_private: false
      });
      setNote('');
      setShowNoteForm(false);
      toast.success('Note added successfully');
      fetchCandidateDetails();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const scheduleInterview = async () => {
    if (!interviewData.scheduled_date) {
      toast.error('Please select a date and time');
      return;
    }
    
    if (!interviewData.interview_type) {
      toast.error('Please select an interview type');
      return;
    }
    
    if (!interviewData.location && !interviewData.meeting_link) {
      toast.error('Please provide a location or meeting link');
      return;
    }
    
    setScheduling(true);
    
    try {
      let recruiterId = 1;
      
      if (candidate?.job_details?.recruiter?.id) {
        recruiterId = candidate.job_details.recruiter.id;
      } else {
        try {
          const recruiterResponse = await api.get('/api/accounts/recruiter/profile/');
          if (recruiterResponse.data.id) {
            recruiterId = recruiterResponse.data.id;
          }
        } catch (recruiterError) {
          console.log('Could not fetch recruiter profile, using default ID');
        }
      }
      
      const payload = {
        application: parseInt(id),
        scheduled_date: new Date(interviewData.scheduled_date).toISOString(),
        interview_type: interviewData.interview_type,
        duration: parseInt(interviewData.duration) || 60,
        meeting_link: interviewData.meeting_link || '',
        location: interviewData.location || '',
        scheduled_by: recruiterId,
        status: 'scheduled',
        feedback: '',
        rating: null
      };
      
      console.log('Sending interview payload:', payload);
      
      const response = await api.post('/api/interviews/', payload);
      console.log('Interview created:', response.data);
      
      try {
        await api.post(`/api/applications/${id}/update_status/`, {
          status: 'interview'
        });
        setCandidate(prev => ({ ...prev, status: 'interview' }));
      } catch (statusError) {
        console.log('Note: Could not update application status', statusError);
      }
      
      setShowInterviewForm(false);
      setInterviewData({
        scheduled_date: '',
        interview_type: 'video',
        duration: 60,
        meeting_link: '',
        location: '',
      });
      
      toast.success('Interview scheduled successfully!');
      
      fetchCandidateDetails();
      
    } catch (error) {
      console.error('Error scheduling interview:', error);
      
      if (error.response?.data) {
        console.log('Error response data:', error.response.data);
        
        if (error.response.data.scheduled_by) {
          toast.error(`Recruiter ID required: ${error.response.data.scheduled_by[0]}`);
        } else if (error.response.data.scheduled_date) {
          toast.error(`Date error: ${error.response.data.scheduled_date[0]}`);
        } else {
          toast.error(`Failed to schedule: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        toast.error('Failed to schedule interview. Please try again.');
      }
    } finally {
      setScheduling(false);
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
      case 'hired': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Sparkles className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'reviewed': return <Eye className="h-5 w-5" />;
      case 'shortlisted': return <Award className="h-5 w-5" />;
      case 'interview': return <Users className="h-5 w-5" />;
      case 'offer': return <DollarSign className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'hired': return <Trophy className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
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
    const index = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getResumeFile = () => {
    if (candidate?.resume_file && candidate.resume_file.url) {
      return {
        url: `${getBaseUrl()}${candidate.resume_file.url}`,
        name: candidate.resume_file.name || 'resume.pdf',
        size: candidate.resume_file.size,
        type: candidate.resume_file.type || 'pdf'
      };
    }
    return null;
  };

  const getProfileResumeUrl = () => {
    if (candidate?.resume_url) {
      return `${getBaseUrl()}${candidate.resume_url}`;
    }
    return null;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File className="h-8 w-8" />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'txt':
        return <FileType className="h-8 w-8 text-gray-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="h-8 w-8 text-green-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-8 w-8 text-yellow-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderStars = (rating, maxRating = 5) => {
    return (
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={`${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{rating}/{maxRating}</span>
      </div>
    );
  };

  const categorizeSkills = () => {
    const skills = getSkills();
    const requiredSkills = skills.filter(skill => skill.is_required);
    const customSkills = skills.filter(skill => skill.is_custom);
    const otherSkills = skills.filter(skill => !skill.is_required && !skill.is_custom);
    
    return { requiredSkills, customSkills, otherSkills };
  };

  const calculateSkillStats = () => {
    const skills = getSkills();
    const ratedSkills = skills.filter(skill => skill.rating > 0);
    const avgRating = ratedSkills.length > 0 
      ? ratedSkills.reduce((sum, skill) => sum + skill.rating, 0) / ratedSkills.length 
      : 0;
    
    return {
      totalSkills: skills.length,
      ratedSkills: ratedSkills.length,
      avgRating: avgRating.toFixed(1),
      maxRating: Math.max(...skills.map(s => s.rating), 0)
    };
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidate not found</h2>
          <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate('/recruiter/candidates')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  const skills = getSkills();
  const skillStats = calculateSkillStats();
  const { requiredSkills, customSkills, otherSkills } = categorizeSkills();
  const resumeFile = getResumeFile();
  const profileResumeUrl = getProfileResumeUrl();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recruiter/candidates')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className={`h-24 w-24 rounded-full bg-gradient-to-r ${getAvatarColor(candidate.candidate_name)} flex items-center justify-center text-white font-bold text-3xl`}>
              {candidate.candidate_name?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            
            {/* ===== SIMPLIFIED CANDIDATE INFO BLOCK ===== */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{candidate.candidate_name || 'Unknown Candidate'}</h1>
                {candidate.is_favorite && (
                  <Heart className="h-6 w-6 text-red-500 fill-current" />
                )}
                <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                  {getStatusIcon(candidate.status)}
                  <span className="ml-2">{candidate.status_display}</span>
                </span>
              </div>
              
              <p className="text-xl text-gray-600 mb-3">{candidate.position_applied || 'Position not specified'}</p>
              
              {/* Icons (email, phone, location, calendar) removed as requested */}
            </div>
          </div>
          
          {/* ===== SIMPLIFIED ACTION BUTTONS ===== */}
          <div className="flex items-center space-x-3">
            {/* Heart (Favorite) */}
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-xl ${candidate.is_favorite ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={candidate.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`h-5 w-5 ${candidate.is_favorite ? 'fill-current' : ''}`} />
            </button>
            
            {/* Email */}
            <button
              onClick={() => window.open(`mailto:${candidate.candidate_email}`)}
              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
              title="Send Email"
            >
              <Send className="h-5 w-5" />
            </button>
            
            {/* Chat – navigate to messages page */}
            <button
              onClick={() => navigate('/recruiter/messages')}
              className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"
              title="Chat with Candidate"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            
            {/* All other buttons (note, interview, more) removed as requested */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Match Score</p>
              <p className="text-2xl font-bold mt-1">{candidate.match_score || 0}%</p>
            </div>
            <Star className="h-10 w-10 opacity-80" />
          </div>
          <div className="mt-3 w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${candidate.match_score || 0}%` }}
            ></div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Skills Rated</p>
              <p className="text-2xl font-bold mt-1">{skillStats.ratedSkills}/{skillStats.totalSkills}</p>
            </div>
            <Award className="h-10 w-10 opacity-80" />
          </div>
          <div className="mt-3 text-sm opacity-90">Avg: {skillStats.avgRating}/5</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Messages</p>
              <p className="text-2xl font-bold mt-1">{candidate.messages_count || 0}</p>
            </div>
            <MessageSquare className="h-10 w-10 opacity-80" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Last Active</p>
              <p className="text-2xl font-bold mt-1">{candidate.last_active_display || 'Never'}</p>
            </div>
            <Clock className="h-10 w-10 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'skills', 'notes', 'interviews', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'skills' && skillStats.totalSkills > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {skillStats.totalSkills}
                </span>
              )}
              {tab === 'interviews' && interviews.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {interviews.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Skills Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Skills Assessment</h3>
                    <p className="text-gray-600">Candidate's self-rated skills for this position</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{skillStats.avgRating}/5</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>

                {/* Required Skills Section */}
                {requiredSkills.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-red-500" />
                        Required Job Skills
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          {requiredSkills.length}
                        </span>
                      </h4>
                      <div className="text-sm text-gray-600">
                        Avg: {(requiredSkills.reduce((sum, s) => sum + s.rating, 0) / requiredSkills.length).toFixed(1)}/5
                      </div>
                    </div>
                    <div className="space-y-3">
                      {requiredSkills.map((skill, index) => (
                        <div key={index} className="p-4 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                              <div>
                                <span className="font-semibold text-gray-900">{skill.name}</span>
                                <div className="flex items-center mt-1">
                                  {renderStars(skill.rating)}
                                  {skill.rating === 0 && (
                                    <span className="ml-2 text-xs text-red-600 font-medium">Not Rated</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Required
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Skills Section */}
                {customSkills.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                        Additional Skills
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {customSkills.length}
                        </span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {customSkills.map((skill, index) => (
                        <div key={index} className="p-4 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900">{skill.name}</span>
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              Custom
                            </span>
                          </div>
                          {renderStars(skill.rating)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Skills Section */}
                {otherSkills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Other Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {otherSkills.map((skill, index) => (
                        <div key={index} className="relative group">
                          <div className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors">
                            <span className="font-medium">{skill.name}</span>
                            {skill.rating > 0 && (
                              <span className="ml-2 text-sm">
                                ({skill.rating}/5)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Skills Preview */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Skills Preview
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 8).map((skill, index) => (
                    <div key={index} className="relative group">
                      <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-100 transition-colors flex items-center">
                        <span>{skill.name}</span>
                        {skill.rating > 0 && (
                          <>
                            <Star className="h-3 w-3 ml-2 text-yellow-500 fill-current" />
                            <span className="ml-1 text-xs">{skill.rating}/5</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {skills.length > 8 && (
                    <button
                      onClick={() => setActiveTab('skills')}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      +{skills.length - 8} more
                    </button>
                  )}
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <span className="mr-4">
                    <span className="font-medium">Rated:</span> {skillStats.ratedSkills} skills
                  </span>
                  <span className="mr-4">
                    <span className="font-medium">Avg:</span> {skillStats.avgRating}/5
                  </span>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View detailed analysis
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Cover Letter
                </h3>
                <div className="prose prose-sm max-w-none">
                  {candidate.cover_letter ? (
                    <p className="text-gray-700 whitespace-pre-line">{candidate.cover_letter}</p>
                  ) : (
                    <p className="text-gray-500 italic">No cover letter provided</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {candidate.additional_info && Object.keys(candidate.additional_info).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(candidate.additional_info).map(([key, value], index) => (
                      <div key={index} className="flex items-center">
                        <span className="font-medium text-gray-700 capitalize mr-2">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-600">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Add Note Form */}
              {showNoteForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
                  <div className="space-y-4">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your notes about this candidate..."
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowNoteForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addNote}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes List */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notes History</h3>
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    + Add Note
                  </button>
                </div>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notes yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first note above</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Schedule Interview Form */}
              {showInterviewForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        For {candidate.candidate_name} - {candidate.position_applied}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowInterviewForm(false)}
                      disabled={scheduling}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={interviewData.scheduled_date}
                          onChange={(e) => setInterviewData({...interviewData, scheduled_date: e.target.value})}
                          min={getMinDateTime()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Select a date and time at least 1 hour from now
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interview Type *
                        </label>
                        <select
                          value={interviewData.interview_type}
                          onChange={(e) => setInterviewData({...interviewData, interview_type: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="video">Video Call</option>
                          <option value="phone">Phone Screen</option>
                          <option value="onsite">On-site Interview</option>
                          <option value="technical">Technical Assessment</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <select
                        value={interviewData.duration}
                        onChange={(e) => setInterviewData({...interviewData, duration: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location / Details *
                      </label>
                      <input
                        type="text"
                        value={interviewData.location}
                        onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
                        placeholder={
                          interviewData.interview_type === 'video' 
                            ? "Enter meeting link (Zoom, Google Meet, etc.)"
                            : interviewData.interview_type === 'phone'
                            ? "Enter phone number or 'Will call candidate'"
                            : "Enter office address or location"
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    {interviewData.interview_type === 'video' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meeting Link (optional)
                        </label>
                        <input
                          type="url"
                          value={interviewData.meeting_link}
                          onChange={(e) => setInterviewData({...interviewData, meeting_link: e.target.value})}
                          placeholder="https://meet.google.com/..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V7z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Interview will be scheduled by</p>
                          <p className="text-sm text-blue-600 mt-1">
                            {candidate?.job_details?.recruiter?.name || 'You'} (Recruiter)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setShowInterviewForm(false)}
                        disabled={scheduling}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={scheduleInterview}
                        disabled={scheduling}
                        className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                          scheduling 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {scheduling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scheduling...
                          </>
                        ) : 'Schedule Interview'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interviews List */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Interview History</h3>
                  <button
                    onClick={() => setShowInterviewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    + Schedule Interview
                  </button>
                </div>
                {interviews && interviews.length > 0 ? (
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <div key={interview.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-900">
                              {formatDate(interview.scheduled_date)}
                            </span>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                            interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {interview.interview_type}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {interview.duration} minutes
                          </div>
                          {interview.meeting_link && (
                            <div className="col-span-2">
                              <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Join Meeting
                              </a>
                            </div>
                          )}
                          {interview.location && (
                            <div className="col-span-2">
                              <span className="font-medium">Location:</span> {interview.location}
                            </div>
                          )}
                        </div>
                        
                        {interview.feedback && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Feedback:</span> {interview.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No interviews scheduled yet</p>
                    <p className="text-sm text-gray-400 mt-1">Schedule your first interview above</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Application Resume File */}
              {candidate.resume_file && candidate.resume_file.url && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Paperclip className="h-5 w-5 mr-2" />
                    Application Resume
                  </h3>
                  
                  {/* Resume Card */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start">
                        <div className="p-3 rounded-lg bg-blue-50">
                          {getFileIcon(candidate.resume_file.name)}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {candidate.resume_file.name || 'Resume File'}
                          </p>
                          <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-2">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Uploaded with application
                            </span>
                            {candidate.resume_file.size && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(candidate.resume_file.size)}</span>
                              </>
                            )}
                          </div>
                          {candidate.resume_file.type && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {candidate.resume_file.type.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`${getBaseUrl()}${candidate.resume_file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                        <a
                          href={`${getBaseUrl()}${candidate.resume_file.url}`}
                          download={candidate.resume_file.name || 'resume.pdf'}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                        <button
                          onClick={() => {
                            const email = candidate.candidate_email;
                            const subject = `Resume: ${candidate.candidate_name}`;
                            const body = `Attached is the resume for ${candidate.candidate_name} - ${candidate.position_applied}`;
                            window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {candidate.cover_letter && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Cover Letter
                    </h3>
                    <button
                      onClick={() => {
                        const blob = new Blob([candidate.cover_letter], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Cover_Letter_${candidate.candidate_name?.replace(/\s+/g, '_') || 'candidate'}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as Text
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{candidate.cover_letter}</p>
                  </div>
                </div>
              )}

              {/* No Documents Message */}
              {!candidate.resume_file?.url && !candidate.cover_letter && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      This candidate hasn't uploaded any documents with their application.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {['shortlisted', 'interview', 'offer', 'rejected', 'hired'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    candidate.status === status
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Mark as {status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  {candidate.status === status && <CheckCircle className="h-4 w-4" />}
                </button>
              ))}
              
              <button
                onClick={() => {
                  const resumeUrl = candidate.resume_file?.url || candidate.resume_url;
                  if (resumeUrl) {
                    window.open(`${getBaseUrl()}${resumeUrl}`, '_blank');
                  } else {
                    toast.warning('No resume available for this candidate');
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100"
              >
                <span>View Resume</span>
                <ExternalLink className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => window.open(`tel:${candidate.candidate_phone}`)}
                disabled={!candidate.candidate_phone}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Call Candidate</span>
                <PhoneCall className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Skill Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Skills</span>
                <span className="font-medium text-gray-900">{skillStats.totalSkills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rated Skills</span>
                <span className="font-medium text-gray-900">{skillStats.ratedSkills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  {renderStars(Math.round(skillStats.avgRating))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Required Skills</span>
                <span className="font-medium text-gray-900">{requiredSkills.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custom Skills</span>
                <span className="font-medium text-gray-900">{customSkills.length}</span>
              </div>
              
              <button
                onClick={() => setActiveTab('skills')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                View Detailed Skills
              </button>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600 truncate">{candidate.candidate_email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{candidate.candidate_phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{candidate.candidate_location || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;