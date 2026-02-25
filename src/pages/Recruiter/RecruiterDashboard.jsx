// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Eye,
  ExternalLink
} from 'lucide-react';
import api,{ setApiContext } from '../../api';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set context to recruiter for API calls
    setApiContext('recruiter');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Using your existing API base URL from api.js
      const response = await api.get('/api/analytics/dashboard/');
      const data = response.data;
      
      // Transform API data to match component format
      const transformedStats = [
        {
          title: 'Total Applications',
          value: data.stats?.total_applications?.value || 0,
          change: data.stats?.total_applications?.change || '0%',
          trend: data.stats?.total_applications?.trend || 'neutral',
          icon: <Users className="h-6 w-6 text-blue-600" />,
          color: 'bg-blue-50'
        },
        {
          title: 'Active Jobs',
          value: data.stats?.active_jobs?.value || 0,
          change: data.stats?.active_jobs?.change || '0',
          trend: data.stats?.active_jobs?.trend || 'neutral',
          icon: <Briefcase className="h-6 w-6 text-green-600" />,
          color: 'bg-green-50'
        },
        {
          title: 'Interview Scheduled',
          value: data.stats?.interview_scheduled?.value || 0,
          change: data.stats?.interview_scheduled?.change || '0%',
          trend: data.stats?.interview_scheduled?.trend || 'neutral',
          icon: <Calendar className="h-6 w-6 text-purple-600" />,
          color: 'bg-purple-50'
        },
        // Add hired applications stat
        {
          title: 'Hired Candidates',
          value: data.stats?.hired_candidates?.value || 0,
          change: data.stats?.hired_candidates?.change || '0%',
          trend: data.stats?.hired_candidates?.trend || 'neutral',
          icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
          color: 'bg-emerald-50'
        },
        {
          title: 'Avg. Time to Hire',
          value: data.stats?.avg_time_to_hire?.value || 'N/A',
          change: data.stats?.avg_time_to_hire?.change || '0%',
          trend: data.stats?.avg_time_to_hire?.trend || 'neutral',
          icon: <Clock className="h-6 w-6 text-orange-600" />,
          color: 'bg-orange-50'
        }
      ];

      setStats(transformedStats);
      setRecentActivities(data.recent_activities || []);
      setTopJobs(data.top_performing_jobs || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login...');
        // Your interceptor should handle redirect
      }
      // Fallback to default data
      setStats(getFallbackStats());
      setRecentActivities(getFallbackActivities());
      setTopJobs(getFallbackTopJobs());
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/analytics/dashboard/export/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dashboard-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new':
      case 'application':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'accepted':
      case 'hired': // Added hired status
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'review':
      case 'interview':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'withdrawn':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'new':
      case 'application':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
      case 'hired': // Added hired status
        return 'bg-green-100 text-green-800';
      case 'review':
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'withdrawn':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your recruitment.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.color} p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : stat.trend === 'down' ? (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className={`p-2 rounded-full ${getStatusBadgeClass(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.candidate}</span> {activity.action}{' '}
                      <span className="font-semibold">{activity.job}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(activity.status)}`}>
                    {getStatusDisplay(activity.status)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Performing Jobs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topJobs.length > 0 ? (
              topJobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate whitespace-normal break-words">{job.title}</h3>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600">{job.applications} applications</span>
                        <span className="text-sm font-medium text-blue-600">{job.match}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 
                      job.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                        style={{ width: job.match.replace('%', '') + '%' }}
                      ></div>
                    </div>
                    {job.status_breakdown && (
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        {Object.entries(job.status_breakdown).slice(0, 3).map(([status, count]) => (
                          <span key={status} className="truncate">
                            {getStatusDisplay(status)}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No jobs posted yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ready to Hire?</h2>
            <p className="text-gray-600 mt-1">Post a new job and reach thousands of qualified candidates.</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              Post New Job
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Fallback data functions
const getFallbackStats = () => [
  { 
    title: 'Total Applications', 
    value: '0', 
    change: '+0%', 
    trend: 'neutral',
    icon: <Users className="h-6 w-6 text-blue-600" />,
    color: 'bg-blue-50'
  },
  { 
    title: 'Active Jobs', 
    value: '0', 
    change: '0', 
    trend: 'neutral',
    icon: <Briefcase className="h-6 w-6 text-green-600" />,
    color: 'bg-green-50'
  },
  { 
    title: 'Interview Scheduled', 
    value: '0', 
    change: '0%', 
    trend: 'neutral',
    icon: <Calendar className="h-6 w-6 text-purple-600" />,
    color: 'bg-purple-50'
  },
  { 
    title: 'Hired Candidates', 
    value: '0', 
    change: '0%', 
    trend: 'neutral',
    icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    color: 'bg-emerald-50'
  },
  { 
    title: 'Avg. Time to Hire', 
    value: 'N/A', 
    change: '0%', 
    trend: 'neutral',
    icon: <Clock className="h-6 w-6 text-orange-600" />,
    color: 'bg-orange-50'
  },
];

const getFallbackActivities = () => [
  { 
    id: 1, 
    candidate: 'No recent activities', 
    action: 'Check back later for updates', 
    job: '', 
    time: 'Just now', 
    status: 'new',
    icon: 'application' 
  }
];

const getFallbackTopJobs = () => [
  { 
    id: 1, 
    title: 'No jobs posted yet', 
    applications: 0, 
    status: 'inactive', 
    match: '0%',
    status_breakdown: {} 
  }
];

export default RecruiterDashboard;