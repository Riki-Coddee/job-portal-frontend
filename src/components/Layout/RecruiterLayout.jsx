// src/components/Layout/RecruiterLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  FileText,
  BarChart2,
  MessageSquare,
  Building,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
  Clock
} from 'lucide-react';
import { useRecruiter } from '../../context/RecruiterContext';
import api from '../../api'; // adjust path as needed

const RecruiterLayout = () => {
  const { profile, logout } = useRecruiter();
  const full_name = profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const profile_url = profile?.profile_picture;
  const designation = profile?.designation;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Fetch activities on mount
  useEffect(() => {
    fetchActivities();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      // Replace with your actual endpoint (e.g., /api/activities/recent/)
      const response = await api.get('/api/activities/recent/');
      setActivities(response.data);
      setUnreadCount(response.data.filter(a => !a.read).length);
    } catch (error) {
      console.error('Failed to fetch activities, using mock data:', error);
      // Fallback mock data (similar to dashboard recent activities)
      const mockActivities = [
        { id: 1, candidate: 'John Doe', action: 'applied for', job: 'Senior Developer', time: '5 min ago', status: 'new', read: false },
        { id: 2, candidate: 'Jane Smith', action: 'was hired for', job: 'Product Manager', time: '1 hour ago', status: 'hired', read: false },
        { id: 3, candidate: 'Mike Johnson', action: 'interview scheduled for', job: 'UX Designer', time: '2 hours ago', status: 'interview', read: false },
        { id: 4, candidate: 'Sarah Williams', action: 'withdrew from', job: 'Data Analyst', time: '1 day ago', status: 'withdrawn', read: false },
      ];
      setActivities(mockActivities);
      setUnreadCount(mockActivities.length);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Helper functions for status icons/colors (same as dashboard)
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'interview':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'withdrawn':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'withdrawn':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const markAsRead = (id) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const navItems = [
    { path: '/recruiter/dashboard', icon: <BarChart2 size={20} />, label: 'Dashboard' },
    { path: '/recruiter/post-job', icon: <PlusCircle size={20} />, label: 'Post Job' },
    { path: '/recruiter/jobs', icon: <Briefcase size={20} />, label: 'Jobs' },
    { path: '/recruiter/candidates', icon: <Users size={20} />, label: 'Candidates' },
    { path: '/recruiter/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { path: '/recruiter/analytics', icon: <FileText size={20} />, label: 'Analytics' },
    { path: '/recruiter/profile', icon: <Building size={20} />, label: 'Profile' },
    { path: '/recruiter/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-50"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="ml-4 flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">HirePro</span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Recruiter
                </span>
              </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="search"
                  placeholder="Search jobs, candidates, messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right side - Notifications & User menu */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell - Integrated */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <Bell size={22} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto max-h-96">
                        {loadingActivities ? (
                          <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : activities.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No notifications</div>
                        ) : (
                          activities.map((activity) => (
                            <div
                              key={activity.id}
                              className={`p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                                !activity.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markAsRead(activity.id)}
                            >
                              <div className="flex items-start">
                                <div className={`p-2 rounded-full ${getStatusBadgeClass(activity.status)}`}>
                                  {getStatusIcon(activity.status)}
                                </div>
                                <div className="ml-3 flex-1">
                                  <p className="text-sm text-gray-900">
                                    <span className="font-semibold">{activity.candidate}</span> {activity.action}{' '}
                                    <span className="font-semibold">{activity.job}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                                {!activity.read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile (unchanged) */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {profile_url ? (
                      <img src={profile_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{full_name?.charAt(0) || 'R'}</span>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{full_name || 'Recruiter'}</p>
                    <p className="text-xs text-gray-500">{designation || 'Recruiter'}</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <NavLink
                      to="/recruiter/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserDropdown(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/recruiter/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserDropdown(false)}
                    >
                      Account Settings
                    </NavLink>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar (unchanged) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 pt-16 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="h-full overflow-y-auto px-4 py-6">
          <div className="mb-8">
            <button
              onClick={() => navigate('/recruiter/post-job')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={20} className="mr-2" />
              Post New Job
            </button>
          </div>

          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick Stats (unchanged) */}
          <div className="mt-12 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Active Jobs</p>
                <p className="text-lg font-bold text-gray-900">12</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">New Applications</p>
                <p className="text-lg font-bold text-green-600">24</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Interviews Today</p>
                <p className="text-lg font-bold text-blue-600">5</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 ${sidebarOpen ? 'lg:pl-64' : ''} transition-all duration-300`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Search (unchanged) */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300">
          <Search size={24} />
        </button>
      </div>
    </div>
  );
};

export default RecruiterLayout;