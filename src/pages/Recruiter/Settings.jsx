// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Save, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Globe, 
  Palette,
  Key,
  Download,
  Eye,
  EyeOff,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  LogOut,
  Trash2,
  Smartphone,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Settings state - will be populated from API
  const [settings, setSettings] = useState({
    general: {
      language: 'english',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      autoSave: true,
      emailDigest: 'weekly',
    },
    notifications: {
      email: {
        newApplications: true,
        interviewUpdates: true,
        messages: true,
        jobExpiry: false,
        weeklySummary: true,
        marketingEmails: false,
      },
      push: {
        newApplications: true,
        interviewReminders: true,
        messages: true,
        mentions: true,
      },
      inApp: {
        all: true,
        sound: true,
      },
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30,
      ipWhitelist: false,
    },
    team: {
      members: [],
      inviteEmail: '',
      inviteRole: 'recruiter',
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
      fontSize: 'medium',
      compactMode: false,
    },
    billing: {
      plan: 'professional',
      nextBilling: '',
      paymentMethod: {
        type: 'visa',
        last4: '',
        expDate: '',
      },
      invoices: [],
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'team', label: 'Team', icon: <Users size={20} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
  ];

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchTeamMembers();
    fetchBillingInfo();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/settings/settings/');
      // Transform API response to match frontend structure
      const data = response.data;
      setSettings(prev => ({
        ...prev,
        general: {
          language: data.general?.language || 'english',
          timezone: data.general?.timezone || 'America/Los_Angeles',
          dateFormat: data.general?.dateFormat || 'MM/DD/YYYY',
          autoSave: data.general?.autoSave ?? true,
          emailDigest: data.general?.emailDigest || 'weekly',
        },
        notifications: {
          email: data.notifications?.email || prev.notifications.email,
          push: data.notifications?.push || prev.notifications.push,
          inApp: data.notifications?.inApp || prev.notifications.inApp,
        },
        security: {
          twoFactor: data.security?.twoFactor ?? false,
          loginAlerts: data.security?.loginAlerts ?? true,
          sessionTimeout: data.security?.sessionTimeout || 30,
          ipWhitelist: data.security?.ipWhitelist ?? false,
        },
        appearance: {
          theme: data.appearance?.theme || 'light',
          density: data.appearance?.density || 'comfortable',
          fontSize: data.appearance?.fontSize || 'medium',
          compactMode: data.appearance?.compactMode ?? false,
        },
      }));
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/api/settings/team/');
      setSettings(prev => ({
        ...prev,
        team: {
          ...prev.team,
          members: response.data,
        },
      }));
    } catch (error) {
      console.error('Failed to load team members:', error);
      // Don't show error for team if user doesn't have team access
      if (error.response?.status !== 403) {
        toast.error('Failed to load team members');
      }
    }
  };

  const fetchBillingInfo = async () => {
    try {
      const response = await api.get('/api/settings/billing/');
      setSettings(prev => ({
        ...prev,
        billing: response.data,
      }));
    } catch (error) {
      console.error('Failed to load billing info:', error);
      // Don't show error for billing if not available
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare data for API
      const settingsData = {
        general: settings.general,
        notifications: settings.notifications,
        security: settings.security,
        appearance: settings.appearance,
      };
      
      await api.put('/api/settings/settings/', settingsData);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subSection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value
        }
      }
    }));
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await api.post('/api/settings/change-password/', passwordData);
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      if (error.response?.data?.currentPassword) {
        toast.error(error.response.data.currentPassword[0]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!settings.team.inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.team.inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      await api.post('/api/settings/team/', {
        email: settings.team.inviteEmail,
        role: settings.team.inviteRole,
      });
      
      toast.success(`Invitation sent to ${settings.team.inviteEmail}`);
      setSettings(prev => ({
        ...prev,
        team: {
          ...prev.team,
          inviteEmail: '',
        },
      }));
      
      // Refresh team members list
      fetchTeamMembers();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      await api.patch(`/api/settings/team/${memberId}/`, { role: newRole });
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        team: {
          ...prev.team,
          members: prev.team.members.map(m =>
            m.id === memberId ? { ...m, role: newRole } : m
          ),
        },
      }));
      
      toast.success('Member role updated');
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    setSaving(true);
    try {
      await api.delete(`/api/settings/team/${memberId}/`);
      
      setSettings(prev => ({
        ...prev,
        team: {
          ...prev.team,
          members: prev.team.members.filter(m => m.id !== memberId),
        },
      }));
      
      toast.success('Team member removed');
    } catch (error) {
      console.error('Failed to remove team member:', error);
      toast.error('Failed to remove team member');
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  const handleExportData = async () => {
    toast.info('Preparing your data for export...');
    try {
      const response = await api.post('/api/settings/export-data/', { format: 'json' });
      
      // Create download link
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `hirepro-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data export ready!');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      await api.delete('/api/settings/delete-account/');
      
      toast.success('Account deleted. Redirecting...');
      // Clear local storage and redirect
      localStorage.clear();
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAll = async () => {
    setSaving(true);
    try {
      await api.post('/api/settings/signout-all/');
      toast.success('Signed out from all other devices');
    } catch (error) {
      console.error('Failed to sign out all devices:', error);
      toast.error('Failed to sign out all devices');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                <span className="flex-1">{tab.label}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>

          {/* Account Actions */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Download size={16} className="mr-2" />
                Export Data
              </button>
              
              <button
                onClick={() => setDeleteConfirm('account')}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Account
              </button>
              
              <button
                onClick={handleSignOutAll}
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out All Devices
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirm === 'account' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                <p className="text-gray-600 mb-6">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          key={activeTab}
          className="flex-1"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => handleChange('general', 'language', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="japanese">Japanese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Digest
                    </label>
                    <select
                      value={settings.general.emailDigest}
                      onChange={(e) => handleChange('general', 'emailDigest', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-save Changes</p>
                    <p className="text-sm text-gray-600">Automatically save changes as you work</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.general.autoSave}
                      onChange={(e) => handleChange('general', 'autoSave', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                
                {/* Email Notifications */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <Mail className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-gray-600">Receive email alerts for this activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={(e) => handleNestedChange('notifications', 'email', key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <Smartphone className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={(e) => handleNestedChange('notifications', 'push', key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-App Notifications */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <Bell className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">In-App Notifications</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications.inApp).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{key}</p>
                          <p className="text-sm text-gray-600">Show notifications within the app</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={(e) => handleNestedChange('notifications', 'inApp', key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                
                {/* Password Change */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <Key className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Security Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.security.twoFactor}
                        onChange={(e) => handleChange('security', 'twoFactor', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Login Alerts</p>
                      <p className="text-sm text-gray-600">Get notified of new sign-ins from unrecognized devices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => handleChange('security', 'loginAlerts', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-blue-600 min-w-[60px]">
                        {settings.security.sessionTimeout}m
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>5 min</span>
                      <span>60 min</span>
                      <span>120 min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">IP Whitelist</p>
                      <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.security.ipWhitelist}
                        onChange={(e) => handleChange('security', 'ipWhitelist', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Team */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
                    <p className="text-gray-600">Manage team members and their permissions</p>
                  </div>
                </div>

                {/* Invite Form */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Invite Team Member</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={settings.team.inviteEmail}
                        onChange={(e) => handleChange('team', 'inviteEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:w-48">
                      <select
                        value={settings.team.inviteRole}
                        onChange={(e) => handleChange('team', 'inviteRole', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <button
                      onClick={handleInviteTeamMember}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 whitespace-nowrap"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Send Invite'}
                    </button>
                  </div>
                </div>

                {/* Members List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {settings.team.members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{member.name || 'No name'}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : member.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setDeleteConfirm(member.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Role Permissions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Admin</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          Full system access
                        </li>
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          Manage team members
                        </li>
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          Billing & settings
                        </li>
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          All recruiting features
                        </li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Recruiter</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          Post and manage jobs
                        </li>
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          View and manage candidates
                        </li>
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          Schedule interviews
                        </li>
                        <li className="flex items-center text-gray-400">
                          <X size={14} className="mr-2" />
                          Manage team
                        </li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Viewer</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-600">
                          <Check size={14} className="mr-2" />
                          View jobs and analytics
                        </li>
                        <li className="flex items-center text-gray-400">
                          <X size={14} className="mr-2" />
                          Edit any data
                        </li>
                        <li className="flex items-center text-gray-400">
                          <X size={14} className="mr-2" />
                          Post jobs
                        </li>
                        <li className="flex items-center text-gray-400">
                          <X size={14} className="mr-2" />
                          View candidate details
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Billing & Subscription</h2>
                
                {/* Current Plan */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm">Current Plan</p>
                      <h3 className="text-2xl font-bold capitalize">{settings.billing.plan}</h3>
                    </div>
                    <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Next billing date: {settings.billing.nextBilling || 'N/A'}</span>
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
                      Upgrade Plan
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Update
                    </button>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center text-white font-bold text-xs mr-3">
                      {settings.billing.paymentMethod.type?.toUpperCase() || 'CARD'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">•••• •••• •••• {settings.billing.paymentMethod.last4 || '****'}</p>
                      <p className="text-sm text-gray-600">Expires {settings.billing.paymentMethod.expDate || '**/****'}</p>
                    </div>
                  </div>
                </div>

                {/* Invoices */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h3>
                  {settings.billing.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {settings.billing.invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.id}</p>
                            <p className="text-sm text-gray-600">{invoice.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-900">{invoice.amount}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {invoice.status}
                            </span>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No invoices available</p>
                  )}
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Appearance Settings</h2>
                
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleChange('appearance', 'theme', theme)}
                        className={`p-4 border rounded-xl text-center capitalize transition-all ${
                          settings.appearance.theme === theme
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-12 w-full rounded-lg mb-2 ${
                          theme === 'light' ? 'bg-gray-100' :
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-100 to-gray-800'
                        }`} />
                        <span className={settings.appearance.theme === theme ? 'text-blue-600' : 'text-gray-700'}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Layout Density
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['comfortable', 'cozy', 'compact'].map((density) => (
                      <button
                        key={density}
                        onClick={() => handleChange('appearance', 'density', density)}
                        className={`p-4 border rounded-xl text-center capitalize transition-all ${
                          settings.appearance.density === density
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`space-y-1 mb-2`}>
                          <div className={`${
                            density === 'compact' ? 'h-1' : density === 'cozy' ? 'h-2' : 'h-3'
                          } bg-gray-300 rounded`} />
                          <div className={`${
                            density === 'compact' ? 'h-1' : density === 'cozy' ? 'h-2' : 'h-3'
                          } bg-gray-300 rounded`} />
                          <div className={`${
                            density === 'compact' ? 'h-1' : density === 'cozy' ? 'h-2' : 'h-3'
                          } bg-gray-300 rounded`} />
                        </div>
                        <span className={settings.appearance.density === density ? 'text-blue-600' : 'text-gray-700'}>
                          {density}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Font Size
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleChange('appearance', 'fontSize', size)}
                        className={`p-4 border rounded-xl text-center transition-all ${
                          settings.appearance.fontSize === size
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`block font-bold ${
                          size === 'small' ? 'text-sm' :
                          size === 'medium' ? 'text-base' : 'text-lg'
                        } mb-2`}>
                          Aa
                        </span>
                        <span className={settings.appearance.fontSize === size ? 'text-blue-600' : 'text-gray-700'}>
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Compact Mode</p>
                    <p className="text-sm text-gray-600">Reduce spacing for a more condensed view</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleChange('appearance', 'compactMode', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <HelpCircle size={16} className="mr-2" />
                  <span>Changes are saved locally. Click Save to update your account.</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Member Confirmation Modal */}
      {deleteConfirm && typeof deleteConfirm === 'number' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Team Member?</h3>
            <p className="text-gray-600 mb-6">
              This member will lose access to all team resources. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(deleteConfirm)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Remove'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;