import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, Video, Phone,
  MapPin, User, Mail, ExternalLink,
  CheckCircle, AlertCircle, Download,
  MessageSquare, Copy, Bell
} from 'lucide-react';
import { toast } from 'react-toastify';

const InterviewScheduleModal = ({ application, isOpen, onClose }) => {
  const [interview, setInterview] = useState(
    application.interview_details || {
      scheduled_date: application.interview_scheduled || '',
      interview_type: 'video',
      duration: 60,
      meeting_link: '',
      location: '',
      status: 'scheduled'
    }
  );

  if (!isOpen || !application) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInterviewTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={20} />;
      case 'phone': return <Phone size={20} />;
      case 'onsite': return <MapPin size={20} />;
      default: return <Video size={20} />;
    }
  };

  const getInterviewTypeLabel = (type) => {
    switch(type) {
      case 'video': return 'Video Call';
      case 'phone': return 'Phone Screen';
      case 'onsite': return 'On-site Interview';
      default: return type;
    }
  };

  const calculateEndTime = () => {
    if (!interview.scheduled_date || !interview.duration) return '';
    
    const startTime = new Date(interview.scheduled_date);
    const endTime = new Date(startTime.getTime() + interview.duration * 60000);
    
    return endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInterviewTips = (type) => {
    switch(type) {
      case 'video':
        return [
          "Test your audio, video, and internet connection 30 minutes before the interview",
          "Use headphones with a microphone to minimize background noise",
          "Choose a quiet, well-lit room with a professional background",
          "Close unnecessary applications on your computer to avoid interruptions",
          "Dress professionally from head to toe - it boosts confidence",
          "Keep a glass of water nearby and your resume visible",
          "Look at the camera when speaking, not at your own video",
          "Have a backup plan ready in case of technical issues"
        ];
      
      case 'phone':
        return [
          "Find a quiet place with good phone reception for the call",
          "Use a landline if possible for better call quality",
          "Keep your resume, notes, and a pen/paper in front of you",
          "Stand up or sit up straight - it improves your voice projection",
          "Smile while talking - it makes your voice sound more friendly",
          "Eliminate background noise and distractions",
          "Have a list of questions prepared in advance",
          "Keep a glass of water nearby for dry mouth"
        ];
      
      case 'onsite':
        return [
          "Plan your route in advance and aim to arrive 10-15 minutes early",
          "Research parking options or public transportation schedules",
          "Bring multiple printed copies of your resume and portfolio",
          "Dress professionally - typically one level above the company's dress code",
          "Carry a professional folder or briefcase with your materials",
          "Research the company, interviewers, and recent company news",
          "Prepare questions about the office environment and team dynamics",
          "Bring breath mints, not gum, for fresh breath"
        ];
      
      default:
        return [
          "Research the company thoroughly - mission, values, recent news",
          "Review the job description and match your skills to requirements",
          "Prepare 3-5 thoughtful questions to ask the interviewer",
          "Practice answering common interview questions",
          "Review your own work history and accomplishments",
          "Get a good night's sleep before the interview",
          "Eat a light meal beforehand to maintain energy",
          "Practice positive body language and confident posture"
        ];
    }
  };

  const handleCopyLink = () => {
    if (interview.meeting_link) {
      navigator.clipboard.writeText(interview.meeting_link);
      toast.success('Meeting link copied to clipboard');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Interview Details</h2>
                  <p className="text-blue-100">
                    {application.job_details?.title} at {application.job_details?.company}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              <div className="space-y-6">
                {/* Interview Time Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar size={24} className="text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm text-blue-800">Interview Date & Time</div>
                        <div className="text-xl font-bold text-blue-900">
                          {interview.scheduled_date ? formatDateTime(interview.scheduled_date) : 'Not scheduled'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-800">Duration</div>
                      <div className="text-lg font-bold text-blue-900">{interview.duration} minutes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-700">
                    <Clock size={18} className="mr-2" />
                    Ends at {calculateEndTime()}
                  </div>
                </div>

                {/* Interview Type Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Type</h3>
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                      {getInterviewTypeIcon(interview.interview_type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getInterviewTypeLabel(interview.interview_type)}
                      </div>
                      <div className="text-gray-600">
                        {interview.interview_type === 'video' 
                          ? 'Virtual meeting via video call'
                          : interview.interview_type === 'phone'
                          ? 'Phone conversation screening'
                          : 'In-person meeting at office location'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Details Card */}
                {interview.meeting_link && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Meeting Link</div>
                        <div className="flex items-center">
                          <a 
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate mr-3"
                          >
                            {interview.meeting_link}
                          </a>
                          <button
                            onClick={handleCopyLink}
                            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg"
                            title="Copy link"
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {interview.interview_type === 'onsite' && interview.location && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Location</div>
                          <div className="flex items-center">
                            <MapPin size={18} className="text-gray-400 mr-2" />
                            <span className="text-gray-900">{interview.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Interview Type-Specific Preparation Tips */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <AlertCircle size={20} className="text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {interview.interview_type === 'video' && 'Video Interview Tips'}
                        {interview.interview_type === 'phone' && 'Phone Interview Tips'}
                        {interview.interview_type === 'onsite' && 'On-site Interview Tips'}
                        {!['video', 'phone', 'onsite'].includes(interview.interview_type) && 'Interview Preparation Tips'}
                      </h3>
                    </div>
                    <div className="text-sm text-green-700 font-medium px-3 py-1 bg-green-100 rounded-full">
                      {getInterviewTypeLabel(interview.interview_type)} Specific
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {getInterviewTips(interview.interview_type).map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800">{tip}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Additional General Tips for All Interviews */}
                  <div className="mt-6 pt-6 border-t border-green-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Universal Interview Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2"></div>
                        <span className="text-sm text-gray-700">Research the company and role thoroughly</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2"></div>
                        <span className="text-sm text-gray-700">Prepare questions to ask the interviewer</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2"></div>
                        <span className="text-sm text-gray-700">Review your resume and accomplishments</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2"></div>
                        <span className="text-sm text-gray-700">Practice your answers to common questions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Status</h3>
                  <div className="flex items-center">
                    <div className={`px-4 py-2 rounded-lg ${
                      interview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      interview.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status?.charAt(0).toUpperCase() + interview.status?.slice(1)}
                    </div>
                    <div className="ml-4 text-gray-600">
                      {interview.status === 'scheduled' 
                        ? 'Interview is scheduled and pending'
                        : interview.status === 'completed'
                        ? 'Interview has been completed'
                        : 'Interview has been cancelled'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex flex-wrap gap-3">
                {interview.meeting_link && (
                  <a
                    href={interview.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink size={18} className="mr-2" />
                    Join Interview
                  </a>
                )}
                
                <button
                  onClick={onClose}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewScheduleModal;