import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building,
  MapPin,
  Clock,
  Calendar,
  Briefcase,
  Award,
  Download,
  MessageSquare,
  ExternalLink,
  FileText,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileImage,
  FileType,
  Eye,
} from "lucide-react";
import { useApplications } from "../context/ApplicationContext";
import InterviewScheduleModal from "./InterviewSchedulrModal";

const ApplicationDetailModal = ({ application, isOpen, onClose }) => {
  const { withdrawApplication } = useApplications();
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  if (!isOpen || !application) return null;

  const handleOpenChat = () => {
    window.location.href = "/messages";
  };

  // Resume file handling
  const resumeFile = application.resume_file;

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="text-red-500" size={24} />;
      case "word":
        return <File className="text-blue-500" size={24} />;
      case "image":
        return <FileImage className="text-green-500" size={24} />;
      case "text":
        return <FileType className="text-gray-500" size={24} />;
      default:
        return <File className="text-gray-500" size={24} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatStatus = (status) => {
    const statusMap = {
      new: "Applied",
      pending: "Under Review",
      reviewed: "Reviewed",
      shortlisted: "Shortlisted",
      interview: "Interview",
      offer: "Offer Received",
      rejected: "Not Selected",
      accepted: "Hired",
      withdrawn: "Withdrawn",
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const success = await withdrawApplication(application.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  const canWithdraw = ["new", "pending", "reviewed"].includes(
    application.status
  );

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-purple-100 text-purple-800",
      shortlisted: "bg-indigo-100 text-indigo-800",
      interview: "bg-green-100 text-green-800",
      offer: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
      accepted: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
      withdrawn: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50  z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getStatusColor(
                        application.status
                      )}`}
                    >
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {application.job_title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.company_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                  {/* Status Badge & Withdraw Button */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {formatStatus(application.status)}
                      </span>
                      {application.conversation_id && (
                        <button
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          onClick={handleOpenChat}
                        >
                          <MessageSquare size={16} />
                          <span>Open Chat</span>
                        </button>
                      )}
                    </div>

                    {canWithdraw && !showWithdrawConfirm && (
                      <button
                        onClick={() => setShowWithdrawConfirm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle size={16} />
                        <span>Withdraw Application</span>
                      </button>
                    )}

                    {showWithdrawConfirm && (
                      <div className="flex items-center space-x-3">
                        <p className="text-sm text-red-600 font-medium">
                          Are you sure?
                        </p>
                        <button
                          onClick={handleWithdraw}
                          disabled={withdrawing}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
                        </button>
                        <button
                          onClick={() => setShowWithdrawConfirm(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Grid Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Application Details */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Job Details Card */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Briefcase className="mr-2" size={20} />
                          Job Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Company</p>
                              <p className="font-medium text-gray-900 flex items-center">
                                <Building size={16} className="mr-2" />
                                {application.company_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium text-gray-900 flex items-center">
                                <MapPin size={16} className="mr-2" />
                                {application.job_location}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Job Type</p>
                              <p className="font-medium text-gray-900">
                                {application.job_type?.replace("_", " ") ||
                                  "Full-time"}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">
                                Applied Date
                              </p>
                              <p className="font-medium text-gray-900 flex items-center">
                                <Calendar size={16} className="mr-2" />
                                {formatDate(application.applied_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Days Since Applied
                              </p>
                              <p className="font-medium text-gray-900 flex items-center">
                                <Clock size={16} className="mr-2" />
                                {application.days_since_applied || 0} days
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Award className="mr-2" size={20} />
                          Application Match Score
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <div
                              className={`text-4xl font-bold mb-2 ${
                                application.match_score >= 80
                                  ? "text-green-600"
                                  : application.match_score >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {application.match_score}%
                            </div>
                            <p className="text-sm text-gray-600">
                              {application.match_score >= 80
                                ? "Excellent match!"
                                : application.match_score >= 60
                                ? "Good match"
                                : "Below average match"}
                            </p>
                          </div>
                          <div className="w-48">
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  application.match_score >= 80
                                    ? "bg-green-500"
                                    : application.match_score >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${application.match_score}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recruiter Contact Card */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="mr-2" size={20} />
                        Recruiter Contact
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Recruiter Name
                          </p>
                          <p className="font-medium text-gray-900">
                            {application.recruiter_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Chat Available
                          </p>
                          <div className="flex items-center">
                            {application.conversation_id ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle size={16} className="mr-2" />
                                <span className="font-medium">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <XCircle size={16} className="mr-2" />
                                <span>Not available</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {application.conversation_id && (
                          <button
                            className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
                            onClick={handleOpenChat}
                          >
                            <MessageSquare size={18} className="mr-2" />
                            Open Conversation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* RESUME SECTION - Using resume_snapshot */}
                  {resumeFile && resumeFile.is_available && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="mr-2" size={20} />
                        Submitted Resume
                      </h4>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-4 bg-white rounded-xl shadow-sm">
                              {getFileIcon(resumeFile.type)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">
                                {resumeFile.name}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-600 flex items-center">
                                  <File size={14} className="mr-1" />
                                  {resumeFile.type?.toUpperCase() || "Document"}
                                </span>
                                {resumeFile.size && (
                                  <span className="text-sm text-gray-600">
                                    {formatFileSize(resumeFile.size)}
                                  </span>
                                )}
                                <span className="text-sm text-gray-600">
                                  Uploaded: {formatDate(resumeFile.uploaded_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            {resumeFile.url && (
                              <>
                                <a
                                  href={resumeFile.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  <Eye size={18} className="mr-2" />
                                  <span>View</span>
                                </a>
                                <a
                                  href={resumeFile.url}
                                  download={resumeFile.name}
                                  className="flex items-center space-x-2 px-4 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                >
                                  <Download size={18} className="mr-2" />
                                  <span>Download</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Cover Letter Section */}
                  {application.cover_letter && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Cover Letter
                        </h4>
                        <div className="text-sm text-gray-500">
                          {application.cover_letter.length} characters
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <div className="prose max-w-none">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {application.cover_letter}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Skills Section */}
                  {application.skills && application.skills.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Skills Submitted
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex flex-wrap gap-3">
                          {application.skills.map((skill, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg flex items-center"
                            >
                              <span className="font-medium">{skill.name}</span>
                              {skill.rating && (
                                <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-sm">
                                  {skill.rating}/5
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Interviews Section */}
                  {application.interviews &&
                    application.interviews.length > 0 && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Interview History
                          </h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {application.interviews.length} interview
                            {application.interviews.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {application.interviews.map((interview, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {new Date(
                                        interview.scheduled_date
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      Duration: {interview.duration} minutes
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    interview.status === "scheduled"
                                      ? "bg-blue-100 text-blue-800"
                                      : interview.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : interview.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {interview.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                <div>
                                  <span className="font-medium">Type:</span>{" "}
                                  {interview.interview_type}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Scheduled by:
                                  </span>{" "}
                                  {interview.scheduled_by?.name || "Recruiter"}
                                </div>
                                {interview.location && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium">
                                      Location:
                                    </span>{" "}
                                    {interview.location}
                                  </div>
                                )}
                                {interview.meeting_link && (
                                  <div className="md:col-span-2">
                                    <a
                                      href={interview.meeting_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                    >
                                      <ExternalLink
                                        size={16}
                                        className="mr-2"
                                      />
                                      Join Meeting
                                    </a>
                                  </div>
                                )}
                              </div>

                              {interview.feedback && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">
                                      Feedback:
                                    </span>{" "}
                                    {interview.feedback}
                                  </p>
                                </div>
                              )}

                              {interview.status === "scheduled" && (
                                <div className="mt-4 flex space-x-3">
                                  <button
                                    onClick={() => {
                                      setSelectedInterview(interview);
                                      setShowInterviewModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                  >
                                    View Full Details
                                  </button>
                                  {interview.meeting_link && (
                                    <a
                                      href={interview.meeting_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                                    >
                                      Join Meeting
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {/* No Interviews Message */}
                  {(!application.interviews ||
                    application.interviews.length === 0) && (
                    <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">
                        No Interviews Scheduled
                      </h5>
                      <p className="text-gray-600">
                        No interviews have been scheduled for this application
                        yet.
                        {application.status === "interview" &&
                          " The recruiter may schedule one soon."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Application ID:{" "}
                    <span className="font-mono">{application.id}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Withdraw Confirmation Modal */}
          <AnimatePresence>
            {showWithdrawConfirm && (
              <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowWithdrawConfirm(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-white rounded-xl p-6 max-w-md w-full"
                >
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Withdraw Application
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to withdraw your application for{" "}
                      <strong>{application.job_title}</strong> at{" "}
                      <strong>{application.company_name}</strong>? This action
                      cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowWithdrawConfirm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleWithdraw}
                        disabled={withdrawing}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
      {showInterviewModal && selectedInterview && (
  <InterviewScheduleModal
    application={application}
    interview={selectedInterview}
    isOpen={showInterviewModal}
    onClose={() => setShowInterviewModal(false)}
  />
)}

    </AnimatePresence>
  );
};

export default ApplicationDetailModal;
