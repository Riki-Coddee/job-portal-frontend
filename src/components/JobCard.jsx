import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/jobs/${job.id}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
              <div className="flex items-center text-gray-600 mb-3">
                <Building2 size={16} className="mr-2" />
                <span>{job.company}</span>
              </div>
            </div>
            {job.is_featured && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                Featured
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-2 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-2 flex-shrink-0" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign size={16} className="mr-2 flex-shrink-0" />
              <span>{job.salary || 'Competitive Salary'}</span>
            </div>
            {job.applicants && (
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2 flex-shrink-0" />
                <span>{job.applicants} applicants</span>
              </div>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-primary-700 text-sm font-medium rounded-full"
                  >
                    {typeof skill === 'object' ? skill.name : skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    +{job.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {job.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-6">
              {job.description.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description}
            </p>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">{job.posted || 'Recently posted'}</span>
            <span className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default JobCard;