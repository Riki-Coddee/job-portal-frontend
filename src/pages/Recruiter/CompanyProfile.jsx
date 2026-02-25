// src/pages/CompanyProfile.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Mail, 
  Phone, 
  Edit2, 
  Save, 
  X,
  Upload,
  Image as ImageIcon,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ExternalLink,
  CheckCircle,
  Award,
  Calendar,
  Star
} from 'lucide-react';

const CompanyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: 'TechCorp Inc.',
    tagline: 'Building the future of technology',
    description: 'We are a leading technology company specializing in innovative software solutions. Our team of experts works with global clients to transform their digital landscape.',
    industry: 'Technology',
    founded: '2015',
    size: '501-1000 employees',
    location: 'San Francisco, CA',
    headquarters: '123 Tech Street, San Francisco, CA 94107',
    website: 'www.techcorp.com',
    email: 'careers@techcorp.com',
    phone: '(415) 555-1234',
    logo: null,
    social: {
      linkedin: 'linkedin.com/company/techcorp',
      twitter: 'twitter.com/techcorp',
      facebook: 'facebook.com/techcorp',
      instagram: 'instagram.com/techcorp',
    },
    perks: [
      'Health Insurance',
      'Flexible Hours',
      'Remote Work Options',
      'Stock Options',
      'Learning Budget',
      'Team Events',
      'Parental Leave',
      'Gym Membership',
    ],
  });

  const [formData, setFormData] = useState(companyData);

  const handleSave = () => {
    setCompanyData(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(companyData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600">Manage your company information and branding</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                <X size={18} className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800"
              >
                <Save size={18} className="inline mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800"
            >
              <Edit2 size={18} className="inline mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </motion.div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Logo Upload */}
              <div className="relative">
                <div className="h-24 w-24 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {!formData.logo && 'TC'}
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Company Logo"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-white border border-gray-300 rounded-full p-2 cursor-pointer hover:bg-gray-50">
                    <Upload size={16} className="text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{companyData.name}</h2>
                )}
                
                {isEditing ? (
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    className="text-lg text-gray-600 mt-2 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                  />
                ) : (
                  <p className="text-lg text-gray-600 mt-2">{companyData.tagline}</p>
                )}
                
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      companyData.location
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe size={16} className="mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      companyData.website
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Us</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-600 leading-relaxed">{companyData.description}</p>
            )}
          </div>

          {/* Company Details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Building size={18} className="mr-2 text-gray-500" />
                    {companyData.industry}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Users size={18} className="mr-2 text-gray-500" />
                    {companyData.size}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founded</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="founded"
                    value={formData.founded}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Calendar size={18} className="mr-2 text-gray-500" />
                    {companyData.founded}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="headquarters"
                    value={formData.headquarters}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <MapPin size={18} className="mr-2 text-gray-500" />
                    {companyData.headquarters}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact & Social */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Mail size={18} className="mr-2 text-gray-500" />
                    {companyData.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Phone size={18} className="mr-2 text-gray-500" />
                    {companyData.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
            <div className="space-y-4">
              {Object.entries(formData.social).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform}
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {platform === 'linkedin' && <Linkedin size={18} className="text-gray-400" />}
                        {platform === 'twitter' && <Twitter size={18} className="text-gray-400" />}
                        {platform === 'facebook' && <Facebook size={18} className="text-gray-400" />}
                        {platform === 'instagram' && <Instagram size={18} className="text-gray-400" />}
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => handleSocialChange(platform, e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-900">
                        {platform === 'linkedin' && <Linkedin size={18} className="mr-2 text-gray-500" />}
                        {platform === 'twitter' && <Twitter size={18} className="mr-2 text-gray-500" />}
                        {platform === 'facebook' && <Facebook size={18} className="mr-2 text-gray-500" />}
                        {platform === 'instagram' && <Instagram size={18} className="mr-2 text-gray-500" />}
                        <span className="truncate">{url}</span>
                      </div>
                      <a
                        href={`https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Perks & Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Perks & Benefits</h3>
            <p className="text-sm text-gray-600">Showcase what makes your company unique</p>
          </div>
          {isEditing && (
            <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100">
              + Add Perk
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {formData.perks.map((perk, index) => (
            <div
              key={index}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              {isEditing ? (
                <input
                  type="text"
                  value={perk}
                  onChange={(e) => {
                    const newPerks = [...formData.perks];
                    newPerks[index] = e.target.value;
                    setFormData(prev => ({ ...prev, perks: newPerks }));
                  }}
                  className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <span className="font-medium text-gray-900">{perk}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Company Culture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
        >
          <div className="flex items-start">
            <Award className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Awards & Recognition</h3>
              <ul className="space-y-3">
                <li className="text-sm text-gray-700 flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  Best Tech Workplace 2023
                </li>
                <li className="text-sm text-gray-700 flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  Fastest Growing Company 2022
                </li>
                <li className="text-sm text-gray-700 flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  Innovation Excellence Award
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6"
        >
          <div className="flex items-start">
            <Users className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Culture</h3>
              <p className="text-sm text-gray-700">
                We believe in collaboration, innovation, and work-life balance. Our team enjoys regular hackathons, learning sessions, and team-building activities.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyProfile;