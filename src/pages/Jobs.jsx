import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import JobCard from '../components/JobCard';
import { useJobs } from '../context/JobContext';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [salaryRange, setSalaryRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    jobs, 
    loading, 
    error,
    pagination,
    fetchJobs
  } = useJobs();

  const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
  const locations = ['All', 'Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL'];
  const salaryRanges = ['All', '$50,000+', '$80,000+', '$100,000+', '$150,000+'];

  // Fetch all jobs once on component mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter jobs on the client side
  const filteredJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    
    return jobs.filter(job => {
      // Search filter (case-insensitive)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const jobTitle = job.title?.toLowerCase() || '';
        const jobCompany = job.company?.toLowerCase() || '';
        const jobDescription = job.description?.toLowerCase() || '';
        const jobSkills = (job.skills || []).map(skill => skill.toLowerCase()).join(' ');
        
        if (!jobTitle.includes(searchLower) && 
            !jobCompany.includes(searchLower) && 
            !jobDescription.includes(searchLower) &&
            !jobSkills.includes(searchLower)) {
          return false;
        }
      }
      
      // Location filter
      if (selectedLocation !== 'All') {
        if (selectedLocation === 'Remote') {
          if (job.remote_policy !== 'remote' && job.remote_policy !== 'hybrid') {
            return false;
          }
        } else if (job.location !== selectedLocation) {
          return false;
        }
      }
      
      // Job type filter
      if (selectedType !== 'All') {
        const jobTypeMap = {
          'Full-time': 'full_time',
          'Part-time': 'part_time',
          'Contract': 'contract',
          'Remote': 'remote',
          'Internship': 'internship'
        };
        
        if (job.job_type !== jobTypeMap[selectedType]) {
          return false;
        }
      }
      
      // Salary filter
      if (salaryRange !== 'All') {
        const minSalary = parseInt(salaryRange.replace(/[^0-9]/g, ''));
        if (!isNaN(minSalary)) {
          const jobSalary = job.salary_min ? parseInt(job.salary_min) : 0;
          if (jobSalary < minSalary) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [jobs, searchTerm, selectedLocation, selectedType, salaryRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('All');
    setSelectedType('All');
    setSalaryRange('All');
  };

  const formatSalary = (job) => {
    if (job.salary_min && job.salary_max) {
      return `${job.currency || '$'} ${parseInt(job.salary_min).toLocaleString()} - ${parseInt(job.salary_max).toLocaleString()}`;
    } else if (job.salary_min) {
      return `${job.currency || '$'} ${parseInt(job.salary_min).toLocaleString()}+`;
    }
    return 'Competitive Salary';
  };

  // Calculate pagination for filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Job
          </h1>
          <p className="text-gray-600 text-lg">Browse through thousands of job opportunities</p>
        </motion.div>

        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center relative">
                <Search className="ml-3 text-primary-500 absolute left-0" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="flex-1 p-4 pl-10 outline-none w-full rounded-lg focus:ring-2 focus:ring-primary-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute right-3">
                    <Loader2 className="animate-spin h-5 w-5 text-primary-600" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <Filter size={20} className="mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 transition-all"
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      disabled={loading}
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 transition-all"
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setCurrentPage(1);
                      }}
                      disabled={loading}
                    >
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range</label>
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 transition-all"
                      value={salaryRange}
                      onChange={(e) => {
                        setSalaryRange(e.target.value);
                        setCurrentPage(1);
                      }}
                      disabled={loading}
                    >
                      {salaryRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      clearFilters();
                      setCurrentPage(1);
                    }}
                    disabled={loading}
                    className="flex items-center text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50 transition-colors"
                  >
                    <X size={16} className="mr-1" />
                    Clear all filters
                  </button>
                  <span className="text-gray-700 font-semibold">
                    {filteredJobs.length} jobs found
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {(searchTerm || selectedLocation !== 'All' || selectedType !== 'All' || salaryRange !== 'All') && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchTerm && (
                <span className="px-4 py-2 bg-blue-100 text-primary-700 rounded-full text-sm flex items-center font-medium shadow-sm">
                  Search: {searchTerm}
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-blue-900 disabled:opacity-50"
                    disabled={loading}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedLocation && selectedLocation !== 'All' && (
                <span className="px-4 py-2 bg-blue-100 text-primary-700 rounded-full text-sm flex items-center font-medium shadow-sm">
                  Location: {selectedLocation}
                  <button 
                    onClick={() => {
                      setSelectedLocation('All');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-blue-900 disabled:opacity-50"
                    disabled={loading}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedType && selectedType !== 'All' && (
                <span className="px-4 py-2 bg-blue-100 text-primary-700 rounded-full text-sm flex items-center font-medium shadow-sm">
                  Type: {selectedType}
                  <button 
                    onClick={() => {
                      setSelectedType('All');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-blue-900 disabled:opacity-50"
                    disabled={loading}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {salaryRange && salaryRange !== 'All' && (
                <span className="px-4 py-2 bg-blue-100 text-primary-700 rounded-full text-sm flex items-center font-medium shadow-sm">
                  Salary: {salaryRange}
                  <button 
                    onClick={() => {
                      setSalaryRange('All');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-blue-900 disabled:opacity-50"
                    disabled={loading}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="animate-spin h-16 w-16 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading amazing opportunities...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-red-600 mb-4 text-lg font-medium">Error: {error}</div>
            <button
              onClick={() => fetchJobs()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-6">
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job, index) => (
                  <JobCard 
                    key={job.id} 
                    job={{
                      ...job,
                      salary: formatSalary(job),
                      type: job.job_type === 'full_time' ? 'Full-time' : 
                            job.job_type === 'part_time' ? 'Part-time' :
                            job.job_type === 'contract' ? 'Contract' :
                            job.job_type === 'internship' ? 'Internship' : 'Temporary',
                      skills: job.skills || [],
                    }} 
                    index={index} 
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <Search size={80} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-3xl font-bold text-gray-700 mb-3">No jobs found</h3>
                  <p className="text-gray-600 mb-6 text-lg">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      clearFilters();
                      setCurrentPage(1);
                    }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;