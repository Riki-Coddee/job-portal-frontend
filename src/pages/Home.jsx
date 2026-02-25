import React, { useState, useEffect, useMemo, useCallback } from 'react'; // added useCallback
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, TrendingUp, Users, Shield, Zap,
  Building, Briefcase, Target, Sparkles, ChevronRight,
  Award, MapPin, DollarSign, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { useJobs } from '../context/JobContext';
import api, { publicApi } from '../api';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);

  const {
    featuredJobs,
    fetchFeaturedJobs,
    searchJobs,
    loading,
    error
  } = useJobs();

  // Memoize fetchDepartments to keep it stable
  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingDepartments(true);
      setDepartmentsError(null);
      const response = await publicApi.get('/api/departments/');
      setDepartments(response.data);
    } catch (err) {
      setDepartmentsError('Failed to load departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  }, []); // no external dependencies

  useEffect(() => {
    fetchFeaturedJobs();
    fetchDepartments();
  }, [fetchFeaturedJobs, fetchDepartments]); // now includes fetchDepartments

  // Filter featured jobs by selected department
  const filteredFeaturedJobs = useMemo(() => {
    if (selectedDepartment === 'all') return featuredJobs;
    return featuredJobs.filter(job =>
      job.department?.toString() === selectedDepartment ||
      job.department_name === selectedDepartment
    );
  }, [featuredJobs, selectedDepartment]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchJobs(searchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDepartmentClick = (departmentId) => {
    setSelectedDepartment(departmentId);
  };

  const formatSalary = (job) => {
    if (job.salary_min && job.salary_max) {
      return `${job.currency} ${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}`;
    } else if (job.salary_min) {
      return `${job.currency} ${parseFloat(job.salary_min).toLocaleString()}+`;
    }
    return 'Competitive Salary';
  };

  const DepartmentCard = ({ department, isActive }) => (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleDepartmentClick(department.id)}
      className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-xl border border-gray-100'
      }`}
    >
      <div className="relative z-10">
        <div className={`flex items-center justify-between mb-4 ${
          isActive ? 'text-white/90' : 'text-gray-600'
        }`}>
          <div className={`p-3 rounded-xl ${
            isActive
              ? 'bg-white/20 backdrop-blur-sm'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}>
            <Building className={`h-6 w-6 ${isActive ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            isActive
              ? 'bg-white/20 backdrop-blur-sm text-white'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {department.job_count || 0} jobs
          </span>
        </div>

        <h3 className={`text-lg font-bold mb-2 ${
          isActive ? 'text-white' : 'text-gray-900'
        }`}>
          {department.name}
        </h3>

        <p className={`text-sm mb-4 ${
          isActive ? 'text-white/80' : 'text-gray-600'
        }`}>
          Explore {department.job_count || 0} career opportunities
        </p>

        <div className={`flex items-center text-sm font-semibold ${
          isActive ? 'text-white/90' : 'text-blue-600'
        }`}>
          <span>Browse Jobs</span>
          <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${
            isActive ? 'text-white' : 'group-hover:translate-x-1'
          }`} />
        </div>
      </div>

      {isActive && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0"></div>
        </div>
      )}
    </motion.button>
  );

  if (loading && !featuredJobs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error && !featuredJobs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => {
              fetchFeaturedJobs();
              fetchDepartments();
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">10,000+ Jobs Available</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dream Job</span>
              <span className="block mt-2">in Your Field</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Discover opportunities across multiple departments from top companies worldwide
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row items-center gap-4 max-w-3xl mx-auto border border-gray-100">
              <div className="flex-1 flex items-center w-full">
                <Search className="ml-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Job title, skills, keywords, or company..."
                  className="flex-1 p-4 outline-none bg-transparent placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Link
                to={`/jobs${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Search size={20} />
                Search Jobs
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Remote & On-site</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Competitive Salaries</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Flexible Hours</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white"></div>
        <div className="container relative mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full mb-4">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Browse by Department</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Opportunities in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Your Field</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore thousands of jobs across various departments and find your perfect match
            </p>
          </div>

          {loadingDepartments ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading departments...</p>
            </div>
          ) : departmentsError ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{departmentsError}</p>
              <button
                onClick={fetchDepartments}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Department Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDepartmentClick('all')}
                  className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                    selectedDepartment === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All Departments
                </motion.button>

                {departments.slice(0, 6).map((dept) => (
                  <motion.button
                    key={dept.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDepartmentClick(dept.id)}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                      selectedDepartment === dept.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {dept.name}
                  </motion.button>
                ))}
              </div>

              {/* Department Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                {departments.slice(0, 8).map((department) => (
                  <DepartmentCard
                    key={department.id}
                    department={department}
                    isActive={selectedDepartment === department.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full mb-3">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Featured Opportunities</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Top Jobs {selectedDepartment !== 'all' && departments.find(d => d.id === selectedDepartment) &&
                  <span className="text-blue-600"> in {departments.find(d => d.id === selectedDepartment)?.name}</span>
                }
              </h2>
              <p className="text-gray-600 mt-2">
                {selectedDepartment === 'all'
                  ? 'Discover hand-picked opportunities from top companies'
                  : `Explore featured jobs in ${departments.find(d => d.id === selectedDepartment)?.name}`
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filteredFeaturedJobs.length}</span> jobs
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading && featuredJobs.length === 0 ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading featured jobs...</p>
              </motion.div>
            ) : filteredFeaturedJobs.length > 0 ? (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredFeaturedJobs.slice(0, 6).map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={{
                      ...job,
                      salary: formatSalary(job),
                      type: job.job_type === 'full_time' ? 'Full-time' :
                            job.job_type === 'part_time' ? 'Part-time' :
                            job.job_type === 'contract' ? 'Contract' :
                            job.job_type === 'internship' ? 'Internship' : 'Temporary',
                      skills: job.skills?.map(skill => skill.name) || [],
                    }}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-4">
                  <Building className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No featured jobs found</h3>
                <p className="text-gray-600 mb-6">
                  {selectedDepartment !== 'all'
                    ? `No featured jobs available in ${departments.find(d => d.id === selectedDepartment)?.name} at the moment.`
                    : 'No featured jobs available at the moment.'
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-12">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold hover:scale-[1.02]"
            >
              <Briefcase className="h-5 w-5" />
              Explore All Jobs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Target className="h-10 w-10" />
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Ready to <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Advance Your Career?</span>
            </h2>

            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who found their dream jobs through our platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-[1.02]"
              >
                Create Free Account
              </Link>
              <Link
                to="/jobs"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold text-lg hover:scale-[1.02]"
              >
                Browse Jobs Now
              </Link>
            </div>

            <p className="mt-8 opacity-75 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              No hidden fees • 100% free for job seekers • Trusted by professionals
            </p>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #3b82f6 1px, transparent 1px),
            linear-gradient(to bottom, #3b82f6 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default Home;