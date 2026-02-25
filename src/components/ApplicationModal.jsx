import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, FileText, User, Mail, Phone, Briefcase, 
  Send, Loader2, AlertCircle, Star, StarHalf,
  Car, Award, Languages, Globe, GraduationCap,
  Plus, Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useJobSeeker } from '../context/JobSeekerContext';
import { useJobs } from '../context/JobContext';

const ApplicationModal = ({ isOpen, onClose, jobId, jobTitle, jobSkills = [], jobRequirements = '' }) => {
  const { profile, loading, hasApplied } = useJobSeeker();
  const { applyForJob } = useJobs();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [showUnratedSkillsModal, setShowUnratedSkillsModal] = useState(false);
  const [unratedSkills, setUnratedSkills] = useState([]);
  
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume: null,
    use_profile_resume: true,
    custom_resume: null,
    // New fields
    driving_license: false,
    willing_to_relocate: false,
    notice_period: 30,
    available_start_date: '',
    custom_skills: [],
    // Skill ratings for job skills
    skill_ratings: {},
    // Additional info
    additional_info: {}
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      // Initialize skill ratings from profile skills
      const initialSkillRatings = {};
      jobSkills.forEach(skill => {
        const profileSkill = profile.skills?.find(s => 
          s.name.toLowerCase() === skill.toLowerCase()
        );
        if (profileSkill) {
          // Map proficiency to stars (1-5)
          const starMap = {
            'beginner': 2,
            'intermediate': 3,
            'advanced': 4,
            'expert': 5
          };
          initialSkillRatings[skill] = starMap[profileSkill.proficiency] || 3;
        } else {
          initialSkillRatings[skill] = 0; // Not rated yet
        }
      });

      setFormData(prev => ({
        ...prev,
        cover_letter: prev.cover_letter || generateCoverLetter(profile, jobTitle),
        use_profile_resume: !!profile.resume,
        skill_ratings: initialSkillRatings,
        // Initialize from profile if available
        driving_license: profile.additional_info?.driving_license || false,
        visa_status: profile.additional_info?.visa_status || '',
        notice_period: profile.additional_info?.notice_period || 30,
        salary_expectation: profile.additional_info?.salary_expectation || '',
        custom_skills: profile.custom_skills || []
      }));
    }
  }, [profile, jobTitle, jobSkills]);

  // Calculate match score whenever skill ratings change
  useEffect(() => {
    calculateMatchScore();
  }, [formData.skill_ratings, formData.custom_skills]);

  // Check if already applied
  useEffect(() => {
    if (isOpen && hasApplied(jobId)) {
      toast.info('You have already applied for this position');
      onClose();
    }
  }, [isOpen, jobId, hasApplied, onClose]);

  const generateCoverLetter = (profile, jobTitle) => {
    const name = `${profile.user?.first_name} ${profile.user?.last_name}`;
    const title = profile.title || 'Experienced Professional';
    
    return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${jobTitle} position. As a ${title} with a strong background in ${profile.skills?.map(s => s.name).join(', ') || 'relevant skills'}, I am confident in my ability to contribute effectively to your team.

${profile.bio || `My experience aligns well with the requirements for this role, and I am excited about the opportunity to bring my skills and expertise to your organization.`}

Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.

Sincerely,
${name}`;
  };

  const calculateMatchScore = useCallback(() => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // Calculate based on job skill ratings (each skill max 5 stars)
    Object.values(formData.skill_ratings).forEach(rating => {
      totalScore += rating;
      maxPossibleScore += 5;
    });
    
    // Add bonus for custom skills that might match job requirements
    if (formData.custom_skills.length > 0 && jobRequirements) {
      const jobRequirementsLower = jobRequirements.toLowerCase();
      const matchingCustomSkills = formData.custom_skills.filter(skill => 
        jobRequirementsLower.includes(skill.name.toLowerCase())
      );
      totalScore += matchingCustomSkills.length * 3; // 3 points per matching custom skill
      maxPossibleScore += formData.custom_skills.length * 3;
    }
    
    // Ensure we don't divide by zero
    if (maxPossibleScore === 0) {
      setMatchScore(0);
      return;
    }
    
    // Calculate percentage (0-100)
    const score = Math.round((totalScore / maxPossibleScore) * 100);
    setMatchScore(Math.min(score, 100));
  }, [formData.skill_ratings, formData.custom_skills, jobRequirements]);

  const handleSkillRatingChange = (skill, rating) => {
    setFormData(prev => ({
      ...prev,
      skill_ratings: {
        ...prev.skill_ratings,
        [skill]: rating
      }
    }));
  };

  const handleAddCustomSkill = () => {
    const skillName = prompt('Enter a skill name:');
    if (skillName && skillName.trim()) {
      const skillLevel = prompt('Rate your proficiency (1-5):', '3');
      const rating = Math.min(Math.max(parseInt(skillLevel) || 3, 1), 5);
      
      setFormData(prev => ({
        ...prev,
        custom_skills: [
          ...prev.custom_skills,
          {
            name: skillName.trim(),
            rating: rating,
            is_new: true
          }
        ]
      }));
      
      toast.success('Skill added successfully');
    }
  };

  const handleRemoveCustomSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      custom_skills: prev.custom_skills.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF, DOC, DOCX, or TXT files only');
        return;
      }
      
      setFormData(prev => ({ ...prev, custom_resume: file, use_profile_resume: false }));
      toast.success('Resume selected');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.cover_letter.trim()) {
    toast.error('Please write a cover letter');
    return;
  }

  // Check if all required skills are rated
  const unratedSkillsList = jobSkills.filter(skill => 
    !formData.skill_ratings[skill] || formData.skill_ratings[skill] === 0
  );
  
  if (unratedSkillsList.length > 0) {
    setUnratedSkills(unratedSkillsList);
    setShowUnratedSkillsModal(true);
    return;
  }

  await submitApplication();
};

const submitApplication = async () => {
  setIsSubmitting(true);
  
  try {
    // Prepare skill data for submission
    const skillData = [];
    
    // Add job skills with ratings
    Object.entries(formData.skill_ratings).forEach(([skillName, rating]) => {
      skillData.push({
        name: skillName,
        rating: rating,
        is_required: true,
        is_custom: false
      });
    });
    
    // Add custom skills
    if (formData.custom_skills.length > 0) {
      formData.custom_skills.forEach(skill => {
        skillData.push({
          name: skill.name,
          rating: skill.rating,
          is_required: false,
          is_custom: true
        });
      });
    }

    // Prepare additional info
    const additionalInfo = {
      driving_license: formData.driving_license,
      willing_to_relocate: formData.willing_to_relocate,
      available_start_date: formData.available_start_date,
      custom_skills_count: formData.custom_skills.length,
      rated_skills_count: Object.values(formData.skill_ratings).filter(r => r > 0).length
    };

    // IMPORTANT: Get the profile resume file if using profile resume
    let resumeFile = null;
    if (formData.use_profile_resume && profile?.resume) {
      try {
        // Fetch the resume file from the profile
        const response = await fetch(profile.resume);
        const blob = await response.blob();
        
        // Create a File object from the blob
        resumeFile = new File(
          [blob], 
          `profile_resume_${profile.user?.first_name}_${Date.now()}.pdf`, 
          { type: blob.type }
        );
      } catch (error) {
        console.error('Error fetching profile resume:', error);
        toast.warning('Could not retrieve profile resume, using application data only');
      }
    } else if (!formData.use_profile_resume && formData.custom_resume) {
      resumeFile = formData.custom_resume;
    }

    // Prepare application data
    const applicationData = {
      cover_letter: formData.cover_letter,
      use_profile_resume: formData.use_profile_resume,
      skills: skillData,
      match_score: matchScore,
      additional_info: additionalInfo,
      // Always include resume if available
      resume: resumeFile
    };

    // Submit application using JobContext
    await applyForJob(jobId, applicationData);
    
    onClose();
  } catch (error) {
    console.error('Error submitting application:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  
  const handleSubmitWithUnratedSkills = async () => {
    setShowUnratedSkillsModal(false);
    await submitApplication();
  };

  const ratingToProficiency = (rating) => {
    switch (rating) {
      case 1:
      case 2:
        return 'beginner';
      case 3:
        return 'intermediate';
      case 4:
        return 'advanced';
      case 5:
        return 'expert';
      default:
        return 'intermediate';
    }
  };

  const calculateFinalMatchScore = (skills) => {
    // More sophisticated calculation considering:
    // 1. Skill ratings (0-5 stars)
    // 2. Relevance to job requirements
    // 3. Additional qualifications
    
    let totalWeight = 0;
    let earnedWeight = 0;
    
    // Job skills weight: 70%
    const jobSkillsWeight = 0.7;
    skills.forEach(skill => {
      const maxRating = 5;
      const rating = skill.rating || 0;
      earnedWeight += (rating / maxRating) * jobSkillsWeight;
    });
    totalWeight += jobSkillsWeight;
    
    // Additional qualifications weight: 15%
    const additionalWeight = 0.15;
    if (formData.driving_license) earnedWeight += additionalWeight * 0.5;
    if (formData.visa_status === 'valid') earnedWeight += additionalWeight * 0.5;
    totalWeight += additionalWeight;
    
    // Experience match weight: 15%
    const experienceWeight = 0.15;
    const experienceMatch = profile?.experience_summary?.includes('senior') ? 1 : 0.5;
    earnedWeight += experienceWeight * experienceMatch;
    totalWeight += experienceWeight;
    
    return Math.round((earnedWeight / totalWeight) * 100);
  };

  const renderStars = (skill, currentRating) => {
    const stars = [];
    for (let i = 0; i <= 5; i++) {
      if (i === 0) {
        // Add a "clear rating" button
        stars.push(
          <button
            key="clear"
            type="button"
            onClick={() => handleSkillRatingChange(skill, 0)}
            className={`p-1 ${currentRating === 0 ? 'text-gray-400' : 'text-gray-300'} hover:text-gray-500`}
            title="Clear rating"
          >
            <X size={16} />
          </button>
        );
      } else {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => handleSkillRatingChange(skill, i)}
            className={`p-1 ${i <= currentRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500`}
            title={`Rate ${i} stars`}
          >
            <Star 
              size={20} 
              fill={i <= currentRating ? 'currentColor' : 'none'} 
            />
          </button>
        );
      }
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <>
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
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Apply for {jobTitle}</h2>
                    <p className="text-gray-600 mt-1">Complete your application</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Match Score Display */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-600">Match Score</div>
                          <div className="text-lg font-bold text-blue-700">{matchScore}%</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading your profile...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Applicant Info Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <User size={18} className="mr-2" />
                        Your Application Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2 text-blue-600" />
                          <span className="text-blue-800">{profile?.user?.email}</span>
                        </div>
                        {profile?.phone_number && (
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2 text-blue-600" />
                            <span className="text-blue-800">{profile.phone_number}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Briefcase size={16} className="mr-2 text-blue-600" />
                          <span className="text-blue-800">
                            {profile?.title || 'No professional title set'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-blue-600" />
                          <span className="text-blue-800">
                            {profile?.resume ? 'Resume available' : 'No resume uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <GraduationCap size={16} className="mr-2 text-blue-600" />
                          <span className="text-blue-800">
                            {profile?.educations?.length || 0} education records
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award size={16} className="mr-2 text-blue-600" />
                          <span className="text-blue-800">
                            {profile?.skills?.length || 0} skills in profile
                          </span>
                        </div>
                      </div>
                      {!profile?.resume && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertCircle size={16} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">
                              You haven't uploaded a resume to your profile. 
                              Consider uploading one or attach a custom resume below.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skill Matching Section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Rate Your Skills for This Job
                        </h3>
                        <div className="text-sm text-gray-500">
                          {Object.keys(formData.skill_ratings).filter(k => formData.skill_ratings[k] > 0).length} / {jobSkills.length} rated
                        </div>
                      </div>
                      
                      {/* Required Job Skills */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-700">Required Skills</h4>
                          <span className="text-xs text-gray-500">Click stars to rate, X to clear</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {jobSkills.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{skill}</span>
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {renderStars(skill, formData.skill_ratings[skill] || 0)}
                                </div>
                                <span className="ml-2 text-sm text-gray-600 min-w-[60px] text-right">
                                  {formData.skill_ratings[skill] || 0}/5
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Skills */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-700">Additional Skills</h4>
                          <button
                            type="button"
                            onClick={handleAddCustomSkill}
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                          >
                            <Plus size={16} className="mr-1" />
                            Add Skill
                          </button>
                        </div>
                        {formData.custom_skills.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.custom_skills.map((skill, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                                <div>
                                  <span className="font-medium text-gray-900">{skill.name}</span>
                                  {skill.is_new && (
                                    <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <div className="flex mr-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={16}
                                        className={i < (skill.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                      />
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSkill(index)}
                                    className="p-1 hover:bg-red-50 text-red-500 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No additional skills added</p>
                        )}
                      </div>

                      {/* Additional Information */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Driving License */}
                          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center h-5 mt-1">
                              <input
                                id="driving_license"
                                type="checkbox"
                                checked={formData.driving_license}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  driving_license: e.target.checked
                                }))}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="driving_license" className="block text-sm font-medium text-gray-900 mb-1">
                                Driving License
                              </label>
                              <p className="text-sm text-gray-600">
                                I possess a valid driving license
                              </p>
                            </div>
                            {formData.driving_license ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-gray-300" />
                            )}
                          </div>

                          {/* Willing to Relocate */}
                          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center h-5 mt-1">
                              <input
                                id="willing_to_relocate"
                                type="checkbox"
                                checked={formData.willing_to_relocate}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  willing_to_relocate: e.target.checked
                                }))}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="willing_to_relocate" className="block text-sm font-medium text-gray-900 mb-1">
                                Willing to Relocate
                              </label>
                              <p className="text-sm text-gray-600">
                                I am open to relocating for this position
                              </p>
                            </div>
                            {formData.willing_to_relocate ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-gray-300" />
                            )}
                          </div>

                          {/* Available Start Date */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Earliest Available Start Date
                            </label>
                            <input
                              type="date"
                              value={formData.available_start_date}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                available_start_date: e.target.value
                              }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              When can you start working if selected?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                      <textarea
                        value={formData.cover_letter}
                        onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                        rows={10}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
                        placeholder="Explain why you're the perfect candidate for this position..."
                        required
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {formData.cover_letter.length} characters, {formData.cover_letter.split(/\s+/).length} words
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const newLetter = generateCoverLetter(profile, jobTitle);
                            setFormData(prev => ({...prev, cover_letter: newLetter}));
                            toast.success('Cover letter regenerated');
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Regenerate from profile
                        </button>
                      </div>
                    </div>

                    {/* Resume Selection */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                      
                      {/* Option 1: Use profile resume */}
                      {profile?.resume && (
                        <div className="mb-4">
                          <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.use_profile_resume}
                              onChange={() => setFormData({
                                ...formData, 
                                use_profile_resume: true,
                                custom_resume: null
                              })}
                              className="h-4 w-4 text-primary-600"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900">Use my profile resume</span>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {profile.resume.split('/').pop()}
                                  </p>
                                </div>
                                <a
                                  href={profile.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Preview
                                </a>
                              </div>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Option 2: Upload custom resume */}
                      <div>
                        <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            checked={!formData.use_profile_resume}
                            onChange={() => setFormData({...formData, use_profile_resume: false})}
                            className="h-4 w-4 text-primary-600"
                          />
                          <div className="ml-3 flex-1">
                            <span className="font-medium text-gray-900">Upload a different resume</span>
                            <p className="text-sm text-gray-600 mt-1">
                              Upload a custom resume for this application
                            </p>
                            
                            {!formData.use_profile_resume && (
                              <div className="mt-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                  <div className="text-center">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <div className="flex flex-col items-center space-y-3">
                                      <input
                                        type="file"
                                        id="resume-upload"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="hidden"
                                      />
                                      <label
                                        htmlFor="resume-upload"
                                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer font-medium"
                                      >
                                        Choose File
                                      </label>
                                      {formData.custom_resume ? (
                                        <div className="flex items-center space-x-2">
                                          <FileText size={16} className="text-green-600" />
                                          <span className="text-sm text-gray-700">
                                            {formData.custom_resume.name}
                                          </span>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500">
                                          No file selected
                                        </p>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                      PDF, DOC, DOCX, or TXT files up to 5MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">Application Score</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-blue-700">{matchScore}%</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${matchScore >= 80 ? 'bg-green-500' : matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || (!formData.use_profile_resume && !formData.custom_resume)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send size={18} className="mr-2" />
                          Submit Application ({matchScore}% Match)
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Score Breakdown */}
                <div className="mt-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span>Job Skills: {Object.values(formData.skill_ratings).filter(r => r > 0).length}/{jobSkills.length}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span>Custom Skills: {formData.custom_skills.length}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span>Qualifications: {formData.driving_license ? 'License ✓' : 'No license'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatePresence>

      {/* Unrated Skills Modal */}
      <AnimatePresence>
        {showUnratedSkillsModal && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUnratedSkillsModal(false)}
                className="fixed inset-0 bg-black/50"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Unrated Skills Detected
                    </h3>
                    <p className="text-gray-600 text-sm">
                      You haven't rated {unratedSkills.length} required skill(s)
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-3">
                    The following skills are required for this position but haven't been rated:
                  </p>
                  <ul className="space-y-2">
                    {unratedSkills.map((skill, index) => (
                      <li key={index} className="flex items-center text-gray-800">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can still submit your application without rating these skills. 
                    However, rating them will increase your match score and improve your chances.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUnratedSkillsModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Go Back & Rate Skills
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitWithUnratedSkills}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send size={16} className="mr-2" />
                        Submit Anyway
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApplicationModal;