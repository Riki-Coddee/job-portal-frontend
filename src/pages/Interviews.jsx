import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, Phone, Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Interviews = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const interviews = {
    upcoming: [
      {
        id: 1,
        jobTitle: 'Senior React Developer',
        company: 'TechCorp Inc.',
        date: '2024-01-25',
        time: '10:00 AM - 11:00 AM',
        type: 'Technical',
        mode: 'video',
        interviewer: 'Sarah Johnson',
        location: 'Zoom Meeting',
        duration: '60 minutes',
        notes: 'Please prepare for a coding challenge and system design discussion.'
      },
      {
        id: 2,
        jobTitle: 'Frontend Engineer',
        company: 'Web Solutions',
        date: '2024-01-28',
        time: '2:00 PM - 3:00 PM',
        type: 'Behavioral',
        mode: 'phone',
        interviewer: 'Mike Chen',
        location: '+1 (555) 123-4567',
        duration: '45 minutes',
        notes: 'Focus on previous projects and teamwork experiences.'
      }
    ],
    completed: [
      {
        id: 3,
        jobTitle: 'React Native Developer',
        company: 'MobileFirst',
        date: '2024-01-20',
        time: '11:00 AM - 12:00 PM',
        type: 'Technical',
        mode: 'video',
        interviewer: 'Alex Rodriguez',
        location: 'Google Meet',
        duration: '60 minutes',
        status: 'positive',
        feedback: 'The interview went well. Next steps will be communicated within 3-5 business days.',
        followUp: '2024-01-27'
      }
    ],
    canceled: [
      {
        id: 4,
        jobTitle: 'Full Stack Developer',
        company: 'Digital Agency',
        date: '2024-01-18',
        time: '3:00 PM - 4:00 PM',
        type: 'Technical',
        mode: 'in-person',
        interviewer: 'Emily Wilson',
        location: '123 Main St, Austin, TX',
        duration: '90 minutes',
        status: 'canceled',
        reason: 'Position filled internally'
      }
    ]
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'phone': return <Phone className="h-5 w-5" />;
      case 'in-person': return <MapPin className="h-5 w-5" />;
      default: return <Video className="h-5 w-5" />;
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Schedule</h1>
            <p className="text-gray-600">Manage and track your upcoming interviews</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{interviews.upcoming.length}</h3>
                  <p className="text-gray-600">Upcoming Interviews</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{interviews.completed.length}</h3>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg mr-4">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{interviews.canceled.length}</h3>
                  <p className="text-gray-600">Canceled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
            <div className="flex space-x-2">
              {['upcoming', 'completed', 'canceled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab} ({interviews[tab].length})
                </button>
              ))}
            </div>
          </div>

          {/* Interview List */}
          <div className="space-y-6">
            {interviews[activeTab].length > 0 ? (
              interviews[activeTab].map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{interview.jobTitle}</h3>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center">
                            <Building2 size={18} className="mr-2" />
                            {interview.company}
                          </div>
                          <div className="flex items-center">
                            {getModeIcon(interview.mode)}
                            <span className="ml-2 capitalize">{interview.mode}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-full font-medium ${
                          activeTab === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          activeTab === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {activeTab === 'upcoming' ? 'Upcoming' :
                           activeTab === 'completed' ? 'Completed' : 'Canceled'}
                        </span>
                        {activeTab === 'upcoming' && (
                          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            Join Interview
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Date</span>
                        </div>
                        <p className="font-semibold text-gray-900">{interview.date}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Time</span>
                        </div>
                        <p className="font-semibold text-gray-900">{interview.time}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <span className="text-sm text-gray-600">Type</span>
                        </div>
                        <p className="font-semibold text-gray-900">{interview.type}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Duration</span>
                        </div>
                        <p className="font-semibold text-gray-900">{interview.duration}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Interviewer</h4>
                        <p className="text-gray-700">{interview.interviewer}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Location / Contact</h4>
                        <p className="text-gray-700">{interview.location}</p>
                      </div>
                    </div>

                    {interview.notes && (
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-2">Notes & Preparation</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-yellow-800">{interview.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {interview.feedback && (
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-green-800">{interview.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {interview.reason && (
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-2">Cancellation Reason</h4>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-red-800">{interview.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        {interview.followUp && (
                          <div className="mb-4 md:mb-0">
                            <p className="text-sm text-gray-600">Next follow-up by:</p>
                            <p className="font-semibold text-gray-900">{interview.followUp}</p>
                          </div>
                        )}
                        <div className="flex space-x-4">
                          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            View Job Details
                          </button>
                          {activeTab === 'upcoming' && (
                            <>
                              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Reschedule
                              </button>
                              <button className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                Cancel Interview
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No interviews found</h3>
                <p className="text-gray-600">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming interviews scheduled."
                    : `You don't have any ${activeTab} interviews.`}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Interviews;