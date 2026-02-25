// src/pages/RecruiterProfileView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, Building, Mail, Phone, MapPin, Globe, 
  Calendar, Users, Award, Star, Heart, Clock, Home, DollarSign, 
  BookOpen, Coffee, Dumbbell, Plane, ExternalLink, ChevronLeft,
  CheckCircle, Award as AwardIcon, Package, Target, GraduationCap,
  Link as LinkIcon, Twitter, Facebook, Linkedin, Instagram,
  FileText, Eye, MessageSquare, ArrowLeft, Shield, Zap,
  TrendingUp, Users as UsersIcon, Bookmark, BookOpen as BookOpenIcon,
  Smartphone, Target as TargetIcon, Info, AlertCircle, Download,
  Globe as GlobeIcon, Bell, ShieldCheck, Check, DownloadCloud,
  Mail as MailIcon, PhoneCall, Map, UsersRound, Target as TargetRound,
  Building2, BriefcaseBusiness, Cpu, Wifi, CloudRain, Thermometer
} from 'lucide-react';
import api from '../api';

const RecruiterProfileView = () => {
  const { recruiterId } = useParams();
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      try {
        setLoading(true);
        
        // Use the public API endpoint
        const response = await api.get(`/api/accounts/recruiters/${recruiterId}/public/`);
        
        setRecruiter(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recruiter profile:', err);
        setError('Unable to load recruiter profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (recruiterId) {
      fetchRecruiterProfile();
    }
  }, [recruiterId]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSendMessage = () => {
    navigate('/messages');
  };

  const handleViewCompanyWebsite = (url) => {
    if (url && !url.startsWith('http')) {
      window.open(`https://${url}`, '_blank');
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Recruiter Profile</h3>
              <p className="text-gray-500">Fetching the latest information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recruiter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Messages
          </button>
          
          <div className="max-w-md mx-auto text-center py-16">
            <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile Not Found</h2>
            <p className="text-gray-600 mb-8">
              {error || "The recruiter profile you're looking for doesn't exist or is no longer available."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/job-seeker/messages')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                View Messages
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from response
  const recruiterData = recruiter;
  const companyData = recruiter.company_details || {};
  const companyName = recruiter.company_name || companyData.name;
  
  // Predefined perk icons mapping
  const perkIcons = {
    'Health Insurance': <Heart size={18} className="text-red-500" />,
    'Flexible Hours': <Clock size={18} className="text-blue-500" />,
    'Remote Work': <Home size={18} className="text-green-500" />,
    'Stock Options': <DollarSign size={18} className="text-yellow-500" />,
    'Learning Budget': <BookOpen size={18} className="text-purple-500" />,
    'Free Snacks': <Coffee size={18} className="text-orange-500" />,
    'Team Events': <UsersIcon size={18} className="text-pink-500" />,
    'Paid Parental Leave': <Calendar size={18} className="text-indigo-500" />,
    'Gym Membership': <Dumbbell size={18} className="text-teal-500" />,
    'Travel Opportunities': <Plane size={18} className="text-cyan-500" />,
    'Latest Tech': <Cpu size={18} className="text-gray-500" />,
    'Home Office Stipend': <Wifi size={18} className="text-amber-500" />,
    'Bonus': <DollarSign size={18} className="text-emerald-500" />,
    'Wellness Program': <Heart size={18} className="text-rose-500" />,
  };

  const getPerkIcon = (perk) => {
    for (const [key, icon] of Object.entries(perkIcons)) {
      if (perk.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return <Package size={18} className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Avatar */}
              <div className="relative">
                {recruiterData.profile_picture ? (
                  <img
                    src={recruiterData.profile_picture}
                    alt={`${recruiterData.first_name} ${recruiterData.last_name}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {getInitials(recruiterData.first_name, recruiterData.last_name)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                  <CheckCircle size={20} />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {recruiterData.first_name} {recruiterData.last_name}
                    </h1>
                    <div className="flex items-center flex-wrap gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                        <Briefcase size={14} className="mr-1.5" />
                        {recruiterData.designation || 'Recruiter'}
                      </span>
                      
                      {companyName && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          <Building size={14} className="mr-1.5" />
                          {companyName}
                        </span>
                      )}
                      
                      {recruiterData.department && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                          <Target size={14} className="mr-1.5" />
                          {recruiterData.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {recruiterData.email && (
                    <div className="flex items-center text-gray-700">
                      <MailIcon size={18} className="text-gray-400 mr-3" />
                      <a 
                        href={`mailto:${recruiterData.email}`}
                        className="text-blue-600 hover:underline truncate"
                      >
                        {recruiterData.email}
                      </a>
                    </div>
                  )}
                  
                  {recruiterData.phone_number && (
                    <div className="flex items-center text-gray-700">
                      <PhoneCall size={18} className="text-gray-400 mr-3" />
                      <a 
                        href={`tel:${recruiterData.phone_number}`}
                        className="text-blue-600 hover:underline"
                      >
                        {recruiterData.phone_number}
                      </a>
                    </div>
                  )}
                  
                  {companyData.location && (
                    <div className="flex items-center text-gray-700">
                      <Map size={18} className="text-gray-400 mr-3" />
                      <span>{companyData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Eye size={18} className="mr-2" />
                    Overview
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('company')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'company'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Building2 size={18} className="mr-2" />
                    Company Details
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('perks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'perks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Award size={18} className="mr-2" />
                    Perks & Culture
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Recruiter Bio Section */}
                  {recruiterData.bio && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <User size={24} className="mr-3 text-blue-600" />
                        About This Recruiter
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {recruiterData.bio}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Company Overview - Shown only if no bio but has company info */}
                  {(!recruiterData.bio) && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        Bio
                      </h2>
                      
                      
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          No Bio
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Information - Always shown in overview */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Mail size={24} className="mr-3 text-blue-600" />
                      Contact Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {companyData.website && (
                        <div className="flex items-center">
                          <GlobeIcon size={20} className="text-gray-400 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500">Website</p>
                            <a 
                              href={companyData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate block"
                              onClick={(e) => handleViewCompanyWebsite(companyData.website)}
                            >
                              {companyData.website}
                            </a>
                          </div>
                          <ExternalLink size={16} className="text-gray-400" />
                        </div>
                      )}
                      
                      {companyData.email && (
                        <div className="flex items-center">
                          <Mail size={20} className="text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Company Email</p>
                            <a 
                              href={`mailto:${companyData.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {companyData.email}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {companyData.phone && (
                        <div className="flex items-center">
                          <Phone size={20} className="text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Company Phone</p>
                            <a 
                              href={`tel:${companyData.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {companyData.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Social Media Links */}
                    {(companyData.linkedin_url || companyData.twitter_url || companyData.facebook_url || companyData.instagram_url) && (
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect With Us</h3>
                        <div className="flex space-x-4">
                          {companyData.linkedin_url && (
                            <a 
                              href={companyData.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="LinkedIn"
                            >
                              <Linkedin size={20} />
                            </a>
                          )}
                          
                          {companyData.twitter_url && (
                            <a 
                              href={companyData.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                              title="Twitter"
                            >
                              <Twitter size={20} />
                            </a>
                          )}
                          
                          {companyData.facebook_url && (
                            <a 
                              href={companyData.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                              title="Facebook"
                            >
                              <Facebook size={20} />
                            </a>
                          )}
                          
                          {companyData.instagram_url && (
                            <a 
                              href={companyData.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                              title="Instagram"
                            >
                              <Instagram size={20} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-8">
                  {/* Company Description */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Building2 size={24} className="mr-3 text-blue-600" />
                      Company Description
                    </h2>
                    {companyData.description ? (
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {companyData.description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No company description available.</p>
                    )}
                  </div>

                  {/* Company Stats */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <Building2 size={24} className="text-blue-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900">Company</h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{companyName}</p>
                        <p className="text-sm text-gray-600 mt-2">Industry: {companyData.industry || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <UsersRound size={24} className="text-green-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900">Size</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{companyData.company_size || 'Not specified'}</p>
                        <p className="text-sm text-gray-600 mt-2">Employee count</p>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <Calendar size={24} className="text-purple-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900">Founded</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{companyData.founded_year || 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-2">Year established</p>
                      </div>
                      
                      <div className="bg-amber-50 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <MapPin size={24} className="text-amber-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                        </div>
                        <p className="text-xl font-bold text-amber-700">{companyData.location || 'Not specified'}</p>
                        <p className="text-sm text-gray-600 mt-2">{companyData.headquarters || 'Headquarters'}</p>
                      </div>
                      
                      <div className="bg-cyan-50 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <TargetRound size={24} className="text-cyan-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900">Industry</h3>
                        </div>
                        <p className="text-xl font-bold text-cyan-700">{companyData.industry || 'Not specified'}</p>
                        <p className="text-sm text-gray-600 mt-2">Primary business sector</p>
                      </div>
                      
                      <div className="bg-rose-50 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <AwardIcon size={24} className="text-rose-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900">Awards</h3>
                        </div>
                        <p className="text-2xl font-bold text-rose-700">{companyData.awards?.length || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">Recognitions received</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'perks' && (
                <div className="space-y-8">
                  {/* Company Culture */}
                  {companyData.culture_description && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <UsersIcon size={24} className="mr-3 text-blue-600" />
                        Company Culture
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {companyData.culture_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Perks & Benefits */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Award size={24} className="mr-3 text-blue-600" />
                      Employee Perks & Benefits
                    </h2>
                    
                    {companyData.perks && companyData.perks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {companyData.perks.map((perk, index) => (
                          <div 
                            key={index}
                            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                          >
                            <div className="mr-4">
                              {getPerkIcon(perk)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 group-hover:text-blue-700">
                                {perk}
                              </p>
                            </div>
                            <CheckCircle size={18} className="text-green-500" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No perks information available.</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for updates</p>
                      </div>
                    )}
                  </div>

                  {/* Awards & Recognition */}
                  {companyData.awards && companyData.awards.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <AwardIcon size={24} className="mr-3 text-yellow-600" />
                        Awards & Recognition
                      </h2>
                      <div className="space-y-4">
                        {companyData.awards.map((award, index) => (
                          <div 
                            key={index}
                            className="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200"
                          >
                            <Star size={20} className="text-yellow-500 mr-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{award}</p>
                              <p className="text-sm text-gray-600 mt-1">Recognized for excellence</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Recruiter Info & Quick Facts */}
            <div className="space-y-8">
              {/* Recruiter Info Card - Removed sticky positioning */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recruiter Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BriefcaseBusiness size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="font-medium text-gray-900">{recruiterData.designation || 'Recruiter'}</p>
                    </div>
                  </div>
                  
                  {recruiterData.department && (
                    <div className="flex items-center">
                      <Target size={18} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">{recruiterData.department}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <MailIcon size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Email</p>
                      <a 
                        href={`mailto:${recruiterData.email}`}
                        className="font-medium text-blue-600 hover:underline truncate block"
                      >
                        {recruiterData.email}
                      </a>
                    </div>
                  </div>
                  
                  {recruiterData.phone_number && (
                    <div className="flex items-center">
                      <PhoneCall size={18} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a 
                          href={`tel:${recruiterData.phone_number}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {recruiterData.phone_number}
                        </a>
                      </div>
                    </div>
                  )}
                
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSendMessage}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center"
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Send Message
                  </button>
                </div>
              </div>

              {/* Quick Facts Card - Now visible */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Facts</h3>
                <div className="space-y-3">
                  {companyData.company_size && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Company Size</span>
                      <span className="font-semibold text-blue-700">{companyData.company_size}</span>
                    </div>
                  )}
                  
                  {companyData.industry && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Industry</span>
                      <span className="font-semibold text-green-700">{companyData.industry}</span>
                    </div>
                  )}
                  
                  {companyData.founded_year && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Founded</span>
                      <span className="font-semibold text-purple-700">{companyData.founded_year}</span>
                    </div>
                  )}
                  
                  {companyData.location && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="font-semibold text-amber-700">{companyData.location}</span>
                    </div>
                  )}

                  {recruiterData.department && (
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="font-semibold text-indigo-700">{recruiterData.department}</span>
                    </div>
                  )}

                  {companyData.perks && companyData.perks.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-gray-600">Perks Available</span>
                      <span className="font-semibold text-emerald-700">{companyData.perks.length}</span>
                    </div>
                  )}

                  {companyData.awards && companyData.awards.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                      <span className="text-sm text-gray-600">Awards</span>
                      <span className="font-semibold text-rose-700">{companyData.awards.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Share This Profile</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share this recruiter's profile with others who might be interested
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <LinkIcon size={16} className="mr-2" />
                    Copy Link
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              This is a public profile view for job seekers. Information is provided by the recruiter and company.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Last updated: {formatDate(new Date().toISOString())} • Profile ID: {recruiterData.id}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecruiterProfileView;