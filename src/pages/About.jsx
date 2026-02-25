import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Users, Shield, Rocket, 
  Award, TrendingUp, Globe, Heart,
  CheckCircle, Star, Briefcase, Building
} from 'lucide-react';

const About = () => {
  const [activeStat, setActiveStat] = useState(null);

  const stats = [
    { id: 1, value: '50,000+', label: 'Job Seekers', icon: <Users className="text-blue-500" /> },
    { id: 2, value: '5,000+', label: 'Companies', icon: <Building className="text-indigo-500" /> },
    { id: 3, value: '200,000+', label: 'Jobs Posted', icon: <Briefcase className="text-purple-500" /> },
    { id: 4, value: '95%', label: 'Success Rate', icon: <Target className="text-green-500" /> },
  ];

  const features = [
    {
      icon: <Shield size={24} />,
      title: 'Trust & Security',
      description: 'Your data is protected with enterprise-grade security and privacy controls.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Rocket size={24} />,
      title: 'Smart Matching',
      description: 'AI-powered algorithms that match the right candidates with the right jobs.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Globe size={24} />,
      title: 'Global Reach',
      description: 'Connect with opportunities and talent from around the world.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Career Growth',
      description: 'Tools and resources to help you grow professionally and personally.',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300',
      bio: 'Former HR Director with 15+ years in talent acquisition.'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300',
      bio: 'Tech visionary with expertise in AI and machine learning.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w-300',
      bio: 'Product strategist passionate about user experience.'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Community',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300',
      bio: 'Dedicated to building inclusive career communities.'
    },
  ];

  const milestones = [
    { year: '2018', title: 'HirePro Founded', description: 'Started with a vision to revolutionize hiring' },
    { year: '2019', title: 'AI Matching Launch', description: 'Introduced intelligent job-candidate matching' },
    { year: '2020', title: 'Global Expansion', description: 'Expanded to 50+ countries worldwide' },
    { year: '2021', title: 'Mobile App Launch', description: 'Released iOS and Android applications' },
    { year: '2022', title: '10K Companies', description: 'Reached 10,000 registered companies' },
    { year: '2023', title: 'Series B Funding', description: 'Raised $50M to accelerate growth' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Building <span className="text-yellow-300">Connections</span> That Transform Careers
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              HirePro is more than a job portal—we're a community where talent meets opportunity, 
              and dreams meet reality.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                Join Our Mission
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition">
                Watch Our Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                <Target size={16} />
                <span className="font-semibold">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Empowering Talent, Enabling Growth
              </h2>
              <p className="text-gray-600 text-lg">
                We believe everyone deserves meaningful work and every company deserves great talent. 
                Our mission is to bridge the gap between ambition and achievement.
              </p>
              <ul className="space-y-3">
                {['Democratize job opportunities', 'Simplify hiring processes', 
                  'Foster professional growth', 'Build inclusive communities'].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 shadow-xl">
                <div className="text-white space-y-4">
                  <div className="inline-flex items-center gap-2">
                    <Globe size={24} />
                    <span className="font-semibold">Our Vision</span>
                  </div>
                  <h3 className="text-2xl font-bold">A World Where Talent Knows No Boundaries</h3>
                  <p className="text-blue-100">
                    We envision a future where geographical limitations no longer define career paths, 
                    and where companies can access the best talent from anywhere in the world.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-xl">
                <Award size={32} className="text-white" />
                <p className="text-white font-semibold mt-2">Award Winning Platform</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">By The Numbers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our impact in the job market speaks for itself
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onHoverStart={() => setActiveStat(stat.id)}
                onHoverEnd={() => setActiveStat(null)}
                className={`bg-white p-6 rounded-xl shadow-lg border ${activeStat === stat.id ? 'border-blue-300' : 'border-gray-200'} transition-all`}
              >
                <div className="flex items-center justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HirePro?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with human-centric design
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full hover:shadow-xl transition-shadow">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Leadership</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A diverse team of visionaries, innovators, and problem-solvers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a simple idea to a global platform transforming careers
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full mb-3">
                        <span className="font-bold">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-500 rounded-full"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join millions who have found their dream jobs through HirePro
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                Get Started Free
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition">
                Schedule a Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;