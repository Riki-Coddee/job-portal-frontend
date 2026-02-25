import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Clock, Calendar, Building, MapPin, Award,
  Search, RefreshCw, Eye, ChevronRight, MessageSquare, Filter as FilterIcon,
  XCircle, CheckCircle, TrendingUp, Users, BarChart3, Download, FileText
} from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import ApplicationDetailModal from '../components/ApplicationDetailModal';

const MyApplications = () => {
  const { 
    applications, 
    loading, 
    error, 
    stats,
    fetchApplications,
    getStatusColor,
    getStatusIcon,
    getStatusProgress
  } = useApplications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleFindJobs = () => {
    window.location.href = '/jobs';
  };

  const handleChat = ()=>{
    window.location.href = '/messages';
  }

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch = searchTerm === '' || 
        (app.job_title && app.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.company_name && app.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.applied_date) - new Date(a.applied_date);
        case 'oldest':
          return new Date(a.applied_date) - new Date(b.applied_date);
        case 'score-high':
          return b.match_score - a.match_score;
        case 'score-low':
          return a.match_score - b.match_score;
        default:
          return new Date(b.applied_date) - new Date(a.applied_date);
      }
    });

  const formatStatusDisplay = (status) => {
    const statusMap = {
      'new': 'Applied',
      'pending': 'Under Review',
      'reviewed': 'Reviewed',
      'interview': 'Interview',
      'offer': 'Offer Received',
      'rejected': 'Not Selected',
      'accepted': 'Hired',
      'withdrawn': 'Withdrawn'
    };
    return statusMap[status] || status;
  };

  const statusOptions = [
    { value: 'all', label: 'All Applications', count: applications.length },
    { value: 'new', label: 'Applied', count: stats.statusBreakdown?.new || 0 },
    { value: 'pending', label: 'Review', count: stats.statusBreakdown?.pending || 0 },
    { value: 'reviewed', label: 'Reviewed', count: stats.statusBreakdown?.reviewed || 0 },
    { value: 'interview', label: 'Interview', count: stats.statusBreakdown?.interview || 0 },
    { value: 'offer', label: 'Offer', count: stats.statusBreakdown?.offer || 0 },
    { value: 'accepted', label: 'Hired', count: stats.statusBreakdown?.accepted || 0 },
    { value: 'rejected', label: 'Rejected', count: stats.statusBreakdown?.rejected || 0 }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading your applications...</p>
          <p className="mt-2 text-sm text-gray-500">Fetching your career journey</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-200 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Applications</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => fetchApplications()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
            <button
              onClick={handleFindJobs}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Browse Jobs Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container relative mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">My Applications</h1>
              <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                Track your job applications, monitor your progress, and manage your career journey in one place
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <button
                onClick={() => fetchApplications()}
                className="flex items-center justify-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm border border-white/30"
              >
                <RefreshCw size={20} />
              </button>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm text-blue-200 mb-1">Total Applications</div>
                <div className="text-3xl font-bold">{stats.total || applications.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Bar */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Briefcase className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-900">{stats.total || applications.length}</div>
                  <div className="text-sm text-blue-700 font-medium">Total Applications</div>
                </div>
              </div>
              <div className="text-xs text-blue-600">Across all companies</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-900">{stats.averageScore || 0}%</div>
                  <div className="text-sm text-green-700 font-medium">Avg Match Score</div>
                </div>
              </div>
              <div className="text-xs text-green-600">Your average compatibility</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-900">{stats.statusBreakdown?.interview || 0}</div>
                  <div className="text-sm text-purple-700 font-medium">Interviews</div>
                </div>
              </div>
              <div className="text-xs text-purple-600">Scheduled interviews</div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                  <Award className="text-indigo-600" size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-900">{stats.statusBreakdown?.shortlisted || 0}</div>
                  <div className="text-sm text-indigo-700 font-medium">Shortlisted</div>
                </div>
              </div>
              <div className="text-xs text-indigo-600">Promising opportunities</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="w-full lg:w-2/5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or locations..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-lg transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
              <select
                className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-white text-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">🆕 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="score-high">⭐ Highest Score</option>
                <option value="score-low">📊 Lowest Score</option>
              </select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-3 min-w-max">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all duration-300 ${
                    selectedStatus === option.value
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  <span className="flex items-center font-medium">
                    {option.label}
                    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedStatus === option.value
                        ? 'bg-white/20'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {option.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-8">
                <Briefcase size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {searchTerm || selectedStatus !== 'all' ? 'No matching applications' : 'Start Your Journey'}
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'You haven\'t applied to any jobs yet. Begin your search to find exciting opportunities!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('all');
                  }}
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-lg"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleFindJobs}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
                >
                  Explore Jobs Now
                </button>
              </div>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-gray-200 pb-6">
                    {/* Left Column - Job Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-6">
                            <div className={`p-4 rounded-xl ${getStatusColor(application.status)}`}>
                              <span className="text-2xl">{getStatusIcon(application.status)}</span>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{application.job_title}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                                <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                                  <Building size={18} className="mr-2 text-blue-600" />
                                  <span className="font-medium">{application.company_name}</span>
                                </div>
                                <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-lg">
                                  <MapPin size={18} className="mr-2 text-green-600" />
                                  {application.job_location}
                                </div>
                                <div className="flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                                  <Clock size={18} className="mr-2 text-purple-600" />
                                  Applied {formatDate(application.applied_date)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Application Progress */}
                          <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Application Progress</span>
                              <span className="font-medium">{formatStatusDisplay(application.status)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  application.status === 'accepted' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  application.status === 'rejected' ? 'bg-red-500' :
                                  'bg-gradient-to-r from-blue-500 to-indigo-500'
                                }`}
                                style={{ width: `${getStatusProgress(application.status)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>Applied</span>
                              <span>Under Review</span>
                              <span>Interview</span>
                              <span>Decision</span>
                            </div>
                          </div>

                          {/* Cover Letter Preview */}
                          {application.cover_letter && (
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-medium text-gray-700">Cover Letter Preview</span>
                                <button
                                  onClick={() => handleViewDetails(application)}
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Read full letter →
                                </button>
                              </div>
                              <p className="text-gray-600 line-clamp-3">
                                {application.cover_letter}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Match Score & Actions */}
                        <div className="lg:w-64">
                          {/* Match Score */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
                            <div className="text-center mb-4">
                              <div className="text-sm text-gray-600 mb-1">Your Match Score</div>
                              <div className={`text-4xl font-bold mb-2 ${
                                application.match_score >= 80 ? 'text-green-600' :
                                application.match_score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {application.match_score}%
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    application.match_score >= 80 ? 'bg-green-500' :
                                    application.match_score >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${application.match_score}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                {application.match_score >= 80 ? 'Excellent match!' :
                                 application.match_score >= 60 ? 'Good compatibility' :
                                 'Below average match'}
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="space-y-3">
                            <button
                              onClick={() => handleViewDetails(application)}
                              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                              <Eye size={20} className="mr-3" />
                              View Details
                            </button>
                            
                            {application.conversation_id && (
                              <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium">
                                <MessageSquare size={20} className="mr-3" onClick={handleChat}/>
                                Open Chat
                              </button>
                            )}
                            
                            {application.resume_file && application.resume_file.is_available && (
  <a
    href={application.resume_file.url}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
  >
    <Download size={20} className="mr-3" />
    View Submitted Resume
  </a>
)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  {/* <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleViewDetails(application)}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye size={20} className="mr-2" />
                        Full Details
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-gray-700 font-medium">
                        <FileText size={20} className="mr-2" />
                        Save Job
                      </button>
                    </div>
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-medium"
                    >
                      More Options
                      <ChevronRight size={20} className="ml-2" />
                    </button>
                  </div> */}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Enhanced Stats Summary
        {filteredApplications.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Application Analytics</h3>
                <p className="text-gray-600">Detailed breakdown of your application journey</p>
              </div>
              <div className="flex items-center text-blue-600">
                <BarChart3 size={24} className="mr-3" />
                <span className="font-medium">Performance Metrics</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="text-center group">
                  <div className={`p-6 rounded-xl mb-3 transition-all duration-300 group-hover:scale-105 ${getStatusColor(status)}`}>
                    <div className="text-3xl font-bold text-gray-900">{count}</div>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1.5 rounded-full inline-block ${getStatusColor(status)}`}>
                    {formatStatusDisplay(status)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {Math.round((count / stats.total) * 100)}% of total
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Application Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.statusBreakdown?.accepted ? 
                      `${Math.round((stats.statusBreakdown.accepted / stats.total) * 100)}%` : 
                      '0%'}
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = '/analytics'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  View Detailed Analytics
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default MyApplications;