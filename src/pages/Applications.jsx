import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, FileText, Building2, MapPin, Calendar, Filter } from 'lucide-react';

const Applications = () => {
  const [filter, setFilter] = useState('all');
  
  const applications = [
    {
      id: 1,
      jobTitle: 'Senior React Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      appliedDate: '2024-01-15',
      status: 'submitted',
      salary: '$120,000 - $150,000',
      type: 'Full-time',
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      jobTitle: 'Frontend Engineer',
      company: 'Web Solutions',
      location: 'Remote',
      appliedDate: '2024-01-10',
      status: 'reviewing',
      salary: '$100,000 - $130,000',
      type: 'Full-time',
      lastUpdated: '1 week ago'
    },
    {
      id: 3,
      jobTitle: 'React Native Developer',
      company: 'MobileFirst',
      location: 'New York, NY',
      appliedDate: '2024-01-05',
      status: 'interview',
      salary: '$110,000 - $140,000',
      type: 'Contract',
      lastUpdated: '3 days ago',
      interviewDate: '2024-01-25'
    },
    {
      id: 4,
      jobTitle: 'Full Stack Developer',
      company: 'Digital Agency',
      location: 'Austin, TX',
      appliedDate: '2023-12-20',
      status: 'rejected',
      salary: '$115,000 - $145,000',
      type: 'Full-time',
      lastUpdated: '2 weeks ago'
    },
    {
      id: 5,
      jobTitle: 'UI/UX Designer',
      company: 'Creative Studios',
      location: 'Los Angeles, CA',
      appliedDate: '2023-12-15',
      status: 'offer',
      salary: '$90,000 - $120,000',
      type: 'Full-time',
      lastUpdated: '1 week ago',
      offerDeadline: '2024-01-30'
    }
  ];

  const statusConfig = {
    submitted: { label: 'Submitted', icon: <FileText className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50' },
    reviewing: { label: 'Under Review', icon: <Clock className="h-5 w-5" />, color: 'text-yellow-600 bg-yellow-50' },
    interview: { label: 'Interview', icon: <Calendar className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50' },
    rejected: { label: 'Rejected', icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 bg-red-50' },
    offer: { label: 'Offer Received', icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600 bg-green-50' }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">Track your job applications and their current status</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = applications.filter(app => app.status === key).length;
              return (
                <div key={key} className="bg-white rounded-xl shadow p-6">
                  <div className={`inline-flex p-3 rounded-lg ${config.color.split(' ')[1]} mb-4`}>
                    <div className={config.color.split(' ')[0]}>
                      {config.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
                  <p className="text-gray-600">{config.label}</p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Filter Applications</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({applications.length})
                </button>
                {Object.entries(statusConfig).map(([key, config]) => {
                  const count = applications.filter(app => app.status === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === key
                          ? `${config.color.split(' ')[0]} ${config.color.split(' ')[1].replace('50', '100')}`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const status = statusConfig[application.status];
                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="mb-4 md:mb-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{application.jobTitle}</h3>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center">
                              <Building2 size={16} className="mr-2" />
                              {application.company}
                            </div>
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-2" />
                              {application.location}
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-medium flex items-center ${status.color}`}>
                          <span className="mr-2">{status.icon}</span>
                          {status.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                          <p className="font-medium">{application.appliedDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                          <p className="font-medium">{application.salary}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Job Type</p>
                          <p className="font-medium">{application.type}</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div className="text-sm text-gray-600 mb-4 md:mb-0">
                            Last updated: {application.lastUpdated}
                          </div>
                          <div className="flex space-x-4">
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              View Job
                            </button>
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No applications found</h3>
                <p className="text-gray-600">Try changing your filters or apply for more jobs</p>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View All Applications
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Applications;