// components/Header.jsx (Updated with Notification Bell)
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Briefcase, LogOut, MessageSquare, User, 
  FileText, BarChart, ChevronDown, Bell, Check, Trash2, Settings 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { useJobSeeker } from '../context/JobSeekerContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthorized, logout, user } = useAuth();  
  const {profile} = useJobSeeker();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Only job seekers get profile dropdown, recruiters see normal website
  const shouldShowProfileDropdown = isAuthorized && user?.role === 'job_seeker';
  
  // For recruiters, treat them as unauthorized (show normal website)
  const isRecruiter = isAuthorized && user?.role === 'recruiter';
  const showNormalNav = !isAuthorized || isRecruiter;

  // Get navigation links
  const getNavLinks = () => {
    const publicLinks = [
      { name: 'Home', path: '/' },
      { name: 'Jobs', path: '/jobs' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ];

    if (showNormalNav || user?.role === 'job_seeker') {
      return publicLinks;
    }

    return publicLinks;
  };

  const navLinks = getNavLinks();

  const profileDropdownItems = [
    { name: 'My Profile', path: '/profile', icon: <User size={18} /> },
    { name: 'My Applications', path: '/my-applications', icon: <FileText size={18} /> },
    { name: 'My Chat', path: '/messages', icon: <MessageSquare size={18} /> },
    { 
      name: 'Logout', 
      onClick: handleLogout, 
      icon: <LogOut size={18} />,
      className: 'text-red-600 hover:bg-red-50'
    },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b sticky top-0 z-50"
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HirePro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Show notification bell for job seekers */}
            {isAuthorized && user?.role === 'job_seeker' && (
              <NotificationBell />
            )}

            {/* Show login/register for unauthenticated users and recruiters */}
            {showNormalNav ? (
              <>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-shadow shadow-sm font-medium"
                >
                  Join Now
                </Link>
              </>
            ) : (
              // Job seeker profile dropdown
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white">
                    {profile?.profile_picture ? (
                      <img 
                        src={profile.profile_picture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {user?.first_name?.charAt(0)?.toUpperCase() || 
                        user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold text-sm">{profile?.user?.full_name || `${profile?.user?.first_name}' '${profile?.user?.last_name}` || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || ''}</p>
                      </div>
                      
                      {profileDropdownItems.map((item) => (
                        item.onClick ? (
                          <button
                            key={item.name}
                            onClick={() => {
                              item.onClick();
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${item.className || ''}`}
                          >
                            {item.icon}
                            {item.name}
                          </button>
                        ) : (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-600" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-3 pt-4 pb-2 border-t mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="py-2 text-gray-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Show notification in mobile menu for job seekers */}
                {isAuthorized && user?.role === 'job_seeker' && (
                  <div className="py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Notifications</span>
                      {/* Simple notification count in mobile */}
                      <div className="relative">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          3
                        </span>
                      </div>
                    </div>
                    <Link 
                      to="/notifications" 
                      className="text-sm text-blue-600 mt-1 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
                
                {/* Mobile auth buttons */}
                {showNormalNav ? (
                  <div className="flex flex-col space-y-2 pt-2 border-t mt-2">
                    <Link 
                      to="/login" 
                      className="py-2 text-center text-blue-600 font-medium" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="py-3 text-center bg-blue-600 text-white rounded-lg" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  // Mobile job seeker menu
                  <div className="pt-2 border-t mt-2">
                    <div className="px-2 py-3 border-b mb-2">
                      <p className="font-semibold text-sm">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || ''}</p>
                    </div>
                    
                    {profileDropdownItems.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.onClick();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left py-2.5 text-gray-700 flex items-center gap-3"
                        >
                          {item.icon}
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2.5 text-gray-700 flex items-center gap-3"
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;