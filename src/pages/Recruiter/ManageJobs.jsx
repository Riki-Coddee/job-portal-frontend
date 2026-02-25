// src/pages/ManageJobs.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Search, 
  MoreVertical, 
  Edit2, 
  Eye, 
  Pause, 
  Play,
  Trash2,
  Download,
  Share2,
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Users,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useRecruiter } from '../../context/RecruiterContext';
import { useNavigate } from 'react-router-dom';
import EditJobModal from '../../components/EditJobModal';

const ManageJobs = () => {
  const navigate = useNavigate();
  const { company } = useRecruiter();
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [editingJob, setEditingJob] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  


  const handleEditJob = (job) => {
  setEditingJob(job);
  setIsEditModalOpen(true);
};

const handleJobUpdated = (updatedJob) => {
  setJobs(jobs.map(job => 
    job.id === updatedJob.id ? updatedJob : job
  ));
  setEditingJob(null);
  setIsEditModalOpen(false);
};

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      switch (action) {
        case 'pause':
          await api.patch(`/api/jobs/${jobId}/`, { is_active: false });
          setJobs(jobs.map(job => 
            job.id === jobId ? { ...job, is_active: false } : job
          ));
          toast.success('Job paused successfully');
          break;
        case 'activate':
          await api.patch(`/api/jobs/${jobId}/`, { is_active: true });
          setJobs(jobs.map(job => 
            job.id === jobId ? { ...job, is_active: true } : job
          ));
          toast.success('Job activated successfully');
          break;
        case 'delete':
          await api.delete(`/api/jobs/${jobId}/`);
          setJobs(jobs.filter(job => job.id !== jobId));
          toast.success('Job deleted successfully');
          // Remove from selected jobs if it was selected
          setSelectedJobs(prev => prev.filter(id => id !== jobId));
          break;
        case 'feature':
          await api.patch(`/api/jobs/${jobId}/`, { is_featured: true });
          setJobs(jobs.map(job => 
            job.id === jobId ? { ...job, is_featured: true } : job
          ));
          toast.success('Job featured successfully');
          break;
        case 'unfeature':
          await api.patch(`/api/jobs/${jobId}/`, { is_featured: false });
          setJobs(jobs.map(job => 
            job.id === jobId ? { ...job, is_featured: false } : job
          ));
          toast.success('Job unfeatured successfully');
          break;
        case 'publish_now':
          await api.post(`/api/jobs/${jobId}/publish_now/`);
          await fetchJobs(); // Refresh the job list
          toast.success('Job published now');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing job action:', error);
      toast.error('Failed to update job');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedJobs.length === 0) {
      toast.warning('Please select jobs first');
      return;
    }

    try {
      setBulkLoading(true);
      switch (action) {
        case 'activate':
          await Promise.all(
            selectedJobs.map(id => 
              api.patch(`/api/jobs/${id}/`, { is_active: true })
            )
          );
          setJobs(jobs.map(job => 
            selectedJobs.includes(job.id) ? { ...job, is_active: true } : job
          ));
          toast.success(`${selectedJobs.length} job(s) activated`);
          break;
        case 'pause':
          await Promise.all(
            selectedJobs.map(id => 
              api.patch(`/api/jobs/${id}/`, { is_active: false })
            )
          );
          setJobs(jobs.map(job => 
            selectedJobs.includes(job.id) ? { ...job, is_active: false } : job
          ));
          toast.success(`${selectedJobs.length} job(s) paused`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedJobs.length} job(s)?`)) {
            await Promise.all(
              selectedJobs.map(id => api.delete(`/api/jobs/${id}/`))
            );
            setJobs(jobs.filter(job => !selectedJobs.includes(job.id)));
            toast.success(`${selectedJobs.length} job(s) deleted`);
            setSelectedJobs([]);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setBulkLoading(false);
    }
  };

  const getJobStatus = (job) => {
    if (!job.is_active) return 'inactive';
    if (!job.is_published && !job.scheduled_date) return 'draft';
    if (job.publish_option === 'schedule' && job.scheduled_date && new Date(job.scheduled_date) > new Date()) {
      return 'scheduled';
    }
    if (job.expires_at && new Date(job.expires_at) < new Date()) {
      return 'expired';
    }
    if (job.is_published) return 'active';
    return 'draft';
  };

  const formatSalary = (job) => {
    if (job.salary_min && job.salary_max) {
      return `${job.currency} ${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}`;
    } else if (job.salary_min) {
      return `${job.currency} ${parseFloat(job.salary_min).toLocaleString()}+`;
    }
    return job.salary_display || 'Competitive Salary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.department && job.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const status = getJobStatus(job);
    const matchesFilter = filter === 'all' || status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    draft: 'Draft',
    scheduled: 'Scheduled',
    expired: 'Expired',
  };

  const getDepartmentLabel = (department_name) => {
    if (!department_name) return 'Other';
    // Convert to title case
    return department_name.charAt(0).toUpperCase() + department_name.slice(1).replace(/_/g, ' ');
  };

  const departmentColors = {
    engineering: 'bg-blue-100 text-blue-800',
    design: 'bg-pink-100 text-pink-800',
    product: 'bg-purple-100 text-purple-800',
    marketing: 'bg-green-100 text-green-800',
    sales: 'bg-yellow-100 text-yellow-800',
    hr: 'bg-red-100 text-red-800',
    finance: 'bg-indigo-100 text-indigo-800',
    operations: 'bg-gray-100 text-gray-800',
    customer_service: 'bg-teal-100 text-teal-800',
    it: 'bg-orange-100 text-orange-800',
    research: 'bg-cyan-100 text-cyan-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const getStats = () => {
    const stats = {
      active: 0,
      draft: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
      total: jobs.length,
      featured: jobs.filter(job => job.is_featured).length,
    };

    jobs.forEach(job => {
      const status = getJobStatus(job);
      stats[status]++;
    });

    return stats;
  };

  const stats = getStats();

  // Export jobs to CSV
  const exportToCSV = () => {
    const headers = ['Title', 'Department', 'Location', 'Job Type', 'Status', 'Applicants', 'Salary', 'Posted Date'];
    const csvData = jobs.map(job => {
      const status = getJobStatus(job);
      return [
        job.title,
        getDepartmentLabel(job.department_name),
        job.location,
        job.job_type.replace('_', ' '),
        statusLabels[status],
        '0', // Placeholder for applicants
        formatSalary(job),
        formatDate(job.published_at || job.created_at)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Jobs exported to CSV');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-600">View and manage all your job postings</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button 
            onClick={() => navigate('/recruiter/post-job')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800"
          >
            <Briefcase size={18} className="mr-2" />
            Post New Job
          </button>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Jobs</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <Play className="h-10 w-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Jobs</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Briefcase className="h-10 w-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Featured Jobs</p>
              <p className="text-3xl font-bold mt-2">{stats.featured}</p>
            </div>
            <BarChart2 className="h-10 w-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Scheduled</p>
              <p className="text-3xl font-bold mt-2">{stats.scheduled}</p>
            </div>
            <Calendar className="h-10 w-10 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs by title, department or company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">
                {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleBulkAction('activate')}
                disabled={bulkLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-green-700 hover:text-green-900 disabled:opacity-50"
              >
                {bulkLoading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                Activate Selected
              </button>
              <button 
                onClick={() => handleBulkAction('pause')}
                disabled={bulkLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-yellow-700 hover:text-yellow-900 disabled:opacity-50"
              >
                {bulkLoading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                Pause Selected
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                disabled={bulkLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
              >
                {bulkLoading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                Delete Selected
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Jobs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={jobs.length > 0 && selectedJobs.length === jobs.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Posted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.map((job) => {
                const status = getJobStatus(job);
                const departmentKey = job.department ? job.department_name.toLowerCase().replace(/\s+/g, '_') : 'other';
                
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => {
                          if (selectedJobs.includes(job.id)) {
                            setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                          } else {
                            setSelectedJobs([...selectedJobs, job.id]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">
                          <span className="flex items-center">
                            {job.job_type?.replace('_', ' ').toUpperCase() || 'Full Time'} • 
                            {formatSalary(job)}
                          </span>
                        </div>
                        {job.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                            Featured
                          </span>
                        )}
                        {status === 'scheduled' && job.scheduled_date && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Scheduled: {formatDateTime(job.scheduled_date)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${departmentColors[departmentKey] || departmentColors.other} text-center`}>
                        {getDepartmentLabel(job.department_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="flex items-center">
                          <MapPin size={20} className="mr-2" />
                          {job.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                        {statusLabels[status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(job.published_at || job.created_at)}
                      {job.expires_at && status === 'active' && (
                        <div className="text-xs text-gray-500">
                          Expires: {formatDate(job.expires_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleJobAction(job.id, status === 'active' || status === 'scheduled' ? 'pause' : 'activate')}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title={status === 'active' || status === 'scheduled' ? 'Pause Job' : 'Activate Job'}
                        >
                          {(status === 'active' || status === 'scheduled') ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button 
                          onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Job"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditJob(job)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit Job"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleJobAction(job.id, job.is_featured ? 'unfeature' : 'feature')}
                          className={`p-2 rounded-lg ${job.is_featured ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-600 hover:bg-gray-100'}`}
                          title={job.is_featured ? 'Unfeature Job' : 'Feature Job'}
                        >
                          <BarChart2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this job?')) {
                              handleJobAction(job.id, 'delete');
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Job"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm ? 'No jobs match your search criteria.' : 'You haven\'t posted any jobs yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/recruiter/post-job')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post Your First Job
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredJobs.length}</span> of{' '}
                <span className="font-semibold">{jobs.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <EditJobModal
        job={editingJob}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
        onJobUpdated={handleJobUpdated}
      />
    </div>
  );
};

export default ManageJobs;