import api, { publicApi } from '../api';

class JobService {
  static setContext() {
    // Optional – kept for compatibility
  }

  // Public endpoints – use publicApi (no auth required)
  static async getJobs(params = {}) {
    try {
      const response = await publicApi.get('/api/jobs/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  static async getFeaturedJobs() {
    try {
      const response = await publicApi.get('/api/featured-jobs/homepage/', {
        params: { count: 3 }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      return [];
    }
  }

  static async getRandomFeaturedJobs(count = 3) {
    try {
      const response = await publicApi.get('/api/featured-jobs/homepage/', {
        params: { count }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching random featured jobs:', error);
      return [];
    }
  }

  static async getJobById(id) {
    try {
      const response = await publicApi.get(`/api/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  static async searchJobs(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      };
      const response = await publicApi.get('/api/jobs/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  static async getSimilarJobs(jobId, limit = 3) {
    try {
      const response = await publicApi.get(`/api/jobs/${jobId}/similar/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
      return [];
    }
  }

  // Protected endpoints – require authentication, use api
  static async toggleSaveJob(jobId) {
    try {
      const response = await api.post(`/api/jobs/${jobId}/save/`);
      return response.data;
    } catch (error) {
      console.warn('Save job endpoint not implemented');
      throw error;
    }
  }

  static calculateMatchScore(skills) {
    if (!skills || !Array.isArray(skills)) return 50;
    
    let totalRating = 0;
    let maxRating = 0;
    
    skills.forEach(skill => {
      const rating = skill.rating || 0;
      if (rating > 0) {
        totalRating += rating;
        maxRating += 5;
      }
    });
    
    if (maxRating === 0) return 50;
    
    return Math.round((totalRating / maxRating) * 100);
  }

  static async applyForJob(jobId, applicationData) {
    try {
      const formData = new FormData();

      formData.append('cover_letter', applicationData.cover_letter || '');
      formData.append('use_profile_resume', applicationData.use_profile_resume || 'true');

      if (applicationData.skills && Array.isArray(applicationData.skills)) {
        formData.append('skills', JSON.stringify(applicationData.skills));
      }

      if (applicationData.additional_info) {
        formData.append('additional_info', JSON.stringify(applicationData.additional_info));
      }

      let matchScore = applicationData.match_score;
      if (!matchScore && applicationData.skills) {
        matchScore = this.calculateMatchScore(applicationData.skills);
      }
      formData.append('match_score', matchScore || 50);

      if (applicationData.resume && applicationData.resume instanceof File) {
        formData.append('resume', applicationData.resume);
      } else if (applicationData.use_profile_resume) {
        formData.append('use_profile_resume_only', 'true');
      }

      const response = await api.post(`/api/applications/apply-to-job/${jobId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  }
}

export default JobService;