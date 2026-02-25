// src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase,
  Clock,
  DollarSign,
  Target,
  BarChart2,
  PieChart,
  Download,
  Calendar,
  Filter,
  Eye,
  Share2,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Zap,
  CheckCircle,
  Loader2
} from 'lucide-react';
import api, { setApiContext } from '../../api';
import { toast } from 'react-toastify'; // Make sure you have react-toastify installed

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({});
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setApiContext('recruiter');
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/analytics/analytics/?time_range=${timeRange}`);
      const data = response.data;
      setAnalyticsData(data);
      
      // Transform stats
      const transformedStats = [
        { 
          title: 'Total Applicants', 
          value: data.applications_over_time ? 
            Object.values(data.applications_over_time).reduce((a, b) => a + b, 0) : 0, 
          change: '+0%', 
          trend: 'up',
          icon: <Users className="h-6 w-6 text-blue-600" />,
          color: 'bg-blue-50',
          description: `${timeRange} applications`
        },
        { 
          title: 'Hire Rate', 
          value: data.hire_rate ? `${data.hire_rate}%` : '0%', 
          change: '+0%', 
          trend: 'up',
          icon: <Target className="h-6 w-6 text-green-600" />,
          color: 'bg-green-50',
          description: 'Applications to hire ratio'
        },
        { 
          title: 'Hired Candidates', 
          value: data.total_hires || 0, 
          change: '+0%', 
          trend: 'up',
          icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
          color: 'bg-emerald-50',
          description: 'Total hired candidates'
        },
        { 
          title: 'Avg. Time', 
          value: data.time_metrics?.avg_response_time || 'N/A', 
          change: '-0%', 
          trend: 'neutral',
          icon: <Clock className="h-6 w-6 text-purple-600" />,
          color: 'bg-purple-50',
          description: 'Time to first response'
        },
        { 
          title: 'Completion Rate', 
          value: data.time_metrics?.interview_completion_rate || 'N/A', 
          change: '+0%', 
          trend: 'up',
          icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
          color: 'bg-orange-50',
          description: 'Interview completion rate'
        },
      ];
      
      setStats(transformedStats);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login...');
      }
      setAnalyticsData(getFallbackAnalyticsData());
      setStats(getFallbackStats());
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // ========== EXPORT FUNCTIONALITY ==========
  const handleExport = async () => {
    setExporting(true);
    try {
      // Try API export first
      const response = await api.get(`/api/analytics/analytics/export/?time_range=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export via API failed, generating fallback CSV:', error);
      
      // Fallback: generate CSV from current data
      try {
        const csv = generateFallbackCSV(analyticsData, timeRange);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-report-${timeRange}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Report exported (generated from current data)');
      } catch (fallbackError) {
        toast.error('Export failed. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  // Fallback CSV generator
  const generateFallbackCSV = (data, range) => {
    let csv = 'Metric,Value\n';
    csv += `Time Range,${range}\n`;
    
    // Total applicants
    const totalApplicants = data.applications_over_time ? 
      Object.values(data.applications_over_time).reduce((a, b) => a + b, 0) : 0;
    csv += `Total Applicants,${totalApplicants}\n`;
    csv += `Hire Rate,${data.hire_rate || 0}%\n`;
    csv += `Hired Candidates,${data.total_hires || 0}\n`;
    csv += `Avg Response Time,${data.time_metrics?.avg_response_time || 'N/A'}\n`;
    csv += `Interview Completion Rate,${data.time_metrics?.interview_completion_rate || 'N/A'}\n`;
    
    // Department breakdown
    if (data.department_performance && Object.keys(data.department_performance).length > 0) {
      csv += '\nDepartment,Hires,Applicants,Open Roles,Interviews\n';
      Object.entries(data.department_performance).forEach(([dept, deptData]) => {
        csv += `${dept},${deptData.hires || 0},${deptData.applicants || 0},${deptData.open_roles || 0},${deptData.interviews || 0}\n`;
      });
    }
    
    return csv;
  };


  const getApplicationsChartData = () => {
    if (!analyticsData.applications_over_time) {
      return getFallbackChartData();
    }
    
    const entries = Object.entries(analyticsData.applications_over_time);
    const maxApplications = Math.max(...entries.map(([_, count]) => count), 1);
    
    return {
      entries,
      maxApplications
    };
  };

  const { entries: timelineEntries, maxApplications } = getApplicationsChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
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
        className="flex flex-col lg:flex-row lg:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your recruitment performance and insights</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last quarter</option>
              <option value="year">Last year</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Download size={18} className="mr-2" />
            )}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
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
            className={`${stat.color} p-6 rounded-xl border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {stat.icon}
              </div>
              <div className={`flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : stat.trend === 'down' ? (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                ) : null}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Applications Trend</h2>
              <p className="text-sm text-gray-600">
                {timeRange === 'week' ? 'Daily' : 
                 timeRange === 'month' ? 'Weekly' : 'Monthly'} applications
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Eye size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Applications</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Total: {timelineEntries.reduce((sum, [_, count]) => sum + count, 0).toLocaleString()} applications
              </div>
            </div>

            <div className="relative h-64">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-gray-100"></div>
                ))}
              </div>

              {/* Bars */}
              {timelineEntries.length > 0 && timelineEntries[0][0] !== 'No data' ? (
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  {timelineEntries.map(([period, count], index) => (
                    <div key={period} className="flex flex-col items-center w-8">
                      <div 
                        className="w-6 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                        style={{ 
                          height: `${(count / maxApplications) * 90}%`,
                          minHeight: count > 0 ? '4px' : '0'
                        }}
                        title={`${period}: ${count} applications`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                        {period.length > 6 ? `${period.slice(0, 6)}...` : period}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No application data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Application Sources & Quality */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Candidate Quality</h2>
              <p className="text-sm text-gray-600">Key metrics and top skills</p>
            </div>
            <PieChart size={20} className="text-gray-400" />
          </div>

          <div className="space-y-6">
            {/* Match Score */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average Match Score</span>
                <span className="text-lg font-bold text-blue-600">
                  {analyticsData.candidate_quality?.avg_match_score || 0}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full" 
                  style={{ width: `${analyticsData.candidate_quality?.avg_match_score || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Top Skills */}
            {analyticsData.candidate_quality?.top_skills && analyticsData.candidate_quality.top_skills.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Skills in Applications</h3>
                <div className="flex flex-wrap gap-2">
                  {analyticsData.candidate_quality.top_skills.map((skill, index) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <Target className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No skill data available</p>
              </div>
            )}

            {/* Sources */}
            {analyticsData.source_breakdown && Object.keys(analyticsData.source_breakdown).length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Application Sources</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.source_breakdown).slice(0, 5).map(([source, percentage]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{source}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* Department Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Department Performance</h2>
            <p className="text-sm text-gray-600">Hiring metrics by department</p>
          </div>
          <Filter size={20} className="text-gray-400" />
        </div>

        {analyticsData.department_performance && Object.keys(analyticsData.department_performance).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Applicants</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Open Roles</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hire Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Interviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(analyticsData.department_performance).map(([deptName, deptData]) => {
                  const hireRate = (deptData.hires || 0) > 0 ? 
                                  ((deptData.hires / (deptData.applicants || 1)) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={deptName} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{deptName}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-900">{deptData.hires || 0}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-900">{deptData.applicants || 0}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {deptData.open_roles || 0} open
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                              style={{ width: `${hireRate}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-gray-900">{hireRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-900">{deptData.interviews || 0}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No department data available</p>
          </div>
        )}
      </motion.div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
        >
          <div className="flex items-start">
            <BarChart2 className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance Insights</h3>
              <ul className="space-y-3">
                <li className="text-sm text-gray-700 flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    {analyticsData.department_performance && Object.keys(analyticsData.department_performance).length > 0 
                      ? `Your ${Object.keys(analyticsData.department_performance)[0]} department has the highest activity`
                      : 'Track department performance to identify top performers'}
                  </span>
                </li>
                <li className="text-sm text-gray-700 flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    {analyticsData.source_breakdown && Object.keys(analyticsData.source_breakdown).length > 0
                      ? `Focus on ${Object.keys(analyticsData.source_breakdown)[0]} for quality candidates`
                      : 'Monitor application sources to optimize recruitment channels'}
                  </span>
                </li>
                <li className="text-sm text-gray-700 flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Average response time: {analyticsData.time_metrics?.avg_response_time || 'Not tracked'}
                  </span>
                </li>
                <li className="text-sm text-gray-700 flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Interview completion rate: {analyticsData.time_metrics?.interview_completion_rate || 'Not tracked'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6"
        >
          <div className="flex items-start">
            <Zap className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Wins</h3>
              <ul className="space-y-3">
                <li className="text-sm text-gray-700 flex items-start">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span>Review and respond to applications within 24 hours</span>
                </li>
                <li className="text-sm text-gray-700 flex items-start">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span>Follow up with candidates who have scheduled interviews</span>
                </li>
                <li className="text-sm text-gray-700 flex items-start">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                  <span>Update job descriptions with required skills</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Fallback data functions (unchanged)
const getFallbackAnalyticsData = () => ({
  applications_over_time: {
    'Week 1': 0,
    'Week 2': 0,
    'Week 3': 0,
    'Week 4': 0
  },
  hire_rate: 0,
  source_breakdown: {
    'LinkedIn': 0,
    'Company Website': 0,
    'Other': 0
  },
  department_performance: {},
  candidate_quality: {
    avg_match_score: 0,
    top_skills: [],
    experience_levels: {}
  },
  time_metrics: {
    avg_response_time: 'N/A',
    interview_completion_rate: 'N/A'
  }
});

const getFallbackStats = () => [
  { 
    title: 'Total Applicants', 
    value: '0', 
    change: '+0%', 
    trend: 'neutral',
    icon: <Users className="h-6 w-6 text-blue-600" />,
    color: 'bg-blue-50',
    description: 'No applications'
  },
  { 
    title: 'Hire Rate', 
    value: '0%', 
    change: '+0%', 
    trend: 'neutral',
    icon: <Target className="h-6 w-6 text-green-600" />,
    color: 'bg-green-50',
    description: 'Applications to hire ratio'
  },
  { 
    title: 'Hired Candidates', 
    value: '0', 
    change: '+0%', 
    trend: 'neutral',
    icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    color: 'bg-emerald-50',
    description: 'Total hired candidates'
  },
  { 
    title: 'Avg. Time', 
    value: 'N/A', 
    change: '-0%', 
    trend: 'neutral',
    icon: <Clock className="h-6 w-6 text-purple-600" />,
    color: 'bg-purple-50',
    description: 'Time to first response'
  },
  { 
    title: 'Completion Rate', 
    value: 'N/A', 
    change: '+0%', 
    trend: 'neutral',
    icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
    color: 'bg-orange-50',
    description: 'Interview completion rate'
  },
];

const getFallbackChartData = () => ({
  entries: [['No data', 0]],
  maxApplications: 1
});

export default Analytics;