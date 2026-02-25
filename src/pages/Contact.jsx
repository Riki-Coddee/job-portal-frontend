import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  MessageSquare, Headphones, Globe, Users,
  Facebook, Twitter, Linkedin, Instagram, Youtube
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';  // Using your configured api instance

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState(null);

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      details: ['support@hirestream.com', 'careers@hirestream.com'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Phone size={24} />,
      title: 'Call Us',
      details: ['+977 9841879297', '+977 9841331987'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Visit Us',
      details: ['Khusibhu, Nayabazar, Kathamndu', 'Jorpati, Bauddha, Kathamndu'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Clock size={24} />,
      title: 'Business Hours',
      details: ['Mon-Fri: 9AM-6PM PST', 'Sat: 10AM-4PM PST'],
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const supportCategories = [
    { value: 'general', label: 'General Inquiry', icon: <MessageSquare size={16} /> },
    { value: 'technical', label: 'Technical Support', icon: <Headphones size={16} /> },
    { value: 'billing', label: 'Billing & Payments', icon: <Globe size={16} /> },
    { value: 'partnership', label: 'Partnership', icon: <Users size={16} /> },
    { value: 'career', label: 'Career Opportunity', icon: <Mail size={16} /> },
    { value: 'feedback', label: 'Feedback', icon: <MessageSquare size={16} /> },
  ];

  // Fetch FAQs on mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setFaqLoading(true);
        setFaqError(null);
        // Using your configured api instance - note the baseURL is already set
        const response = await api.get('/api/contact/faqs/');
        setFaqs(response.data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        setFaqError('Could not load FAQs. Please try again later.');
        toast.error('Failed to load FAQs');
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Using your configured api instance
      const response = await api.post('/api/contact/contact/', formData);
      
      setLoading(false);
      setSubmitted(true);
      toast.success(response.data.message || 'Message sent successfully! We\'ll respond within 24 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setLoading(false);
      console.error('Submission error:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key]}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              We're Here to Help
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Have questions? Our team is ready to assist you with anything you need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 -mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-xl p-6 text-center hover:shadow-2xl transition-shadow">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${info.color} mb-4`}>
                    <div className="text-white">{info.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-600">We typically respond within 24 hours</p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
                    <CheckCircle size={48} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. Our team will get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {supportCategories.map((cat) => (
                        <label
                          key={cat.value}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                            formData.category === cat.value 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={formData.category === cat.value}
                            onChange={handleChange}
                            className="hidden"
                          />
                          {cat.icon}
                          <span className="text-sm font-medium">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Map & FAQs */}
            <div className="space-y-8">
              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-700 font-semibold">Khusibu, Nayabazar, Kathmandu</p>
                      <p className="text-gray-600">Pahikwo Sadak, Kathmandu 44600</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Headquarters</h3>
                  <p className="text-gray-600 mb-4">
                    Visit our Pahikwo Sadak office for meetings, events, or just to say hello!
                  </p>
                  <a 
                    href="https://www.google.com/maps?sca_esv=206cd4dd954885db&rlz=1C5CHFA_enNP1063NP1063&sxsrf=ANbL-n4zlnRvvb4SXOb4rlOGzSWdNTaNdw:1772010769675&biw=1440&bih=900&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiEW1hcCBwcmltZSBjb2xsZWdlMgIQJjIGEAAYFhgeMgIQJjILEAAYgAQYhgMYigUyCBAAGIAEGKIEMggQABiABBiiBDIFEAAY7wUyCBAAGIAEGKIESIojUIwHWMYecAN4AZABAJgBywGgAcUXqgEGMC4xNi4xuAEDyAEA-AEBmAIUoAKUGsICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIKECMYgAQYJxiKBcICEBAjGPAFGIAEGCcYyQIYigXCAhAQABiABBixAxhDGIMBGIoFwgILEAAYgAQYsQMYgwHCAgsQLhiABBjRAxjHAcICBRAAGIAEwgIEECMYJ8ICChAjGPAFGCcYyQLCAhAQLhiABBjRAxhDGMcBGIoFwgINEC4YgAQYsQMYQxiKBcICCBAAGIAEGLEDwgITEAAYgAQYsQMYQxiDARjJAxiKBcICDRAAGIAEGLEDGEMYigXCAgsQABiABBiSAxiKBcICChAAGIAEGBQYhwLCAgoQABiABBhDGIoFwgIMEAAYgAQYsQMYChgLwgIIEAAYCBgNGB6YAwCIBgGQBgqSBwYzLjEzLjSgB8ZqsgcGMC4xMy40uAe1GcIHCjItMTIuNi4wLjLIB5cCgAgA&um=1&ie=UTF-8&fb=1&gl=np&sa=X&geocode=KZ8tomfvGOs5MYZ1Nm3I4vPt&daddr=Pahikwo+Sadak,+Kathmandu+44600"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Get Directions
                  </a>
                </div>
              </motion.div>

              {/* FAQs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                
                {faqLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading FAQs...</p>
                  </div>
                ) : faqError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{faqError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                ) : faqs.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No FAQs available at the moment.</p>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    const faqSection = document.querySelector('.space-y-4');
                    if (faqSection) {
                      faqSection.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="w-full mt-6 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Back to Top
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect With Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow us on social media for updates, tips, and career advice
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
            {[
              { icon: <Facebook size={24} />, name: 'Facebook', color: 'bg-blue-600', url: 'https://facebook.com/hirestream' },
              { icon: <Twitter size={24} />, name: 'Twitter', color: 'bg-sky-500', url: 'https://twitter.com/hirestream' },
              { icon: <Linkedin size={24} />, name: 'LinkedIn', color: 'bg-blue-700', url: 'https://linkedin.com/company/hirestream' },
              { icon: <Instagram size={24} />, name: 'Instagram', color: 'bg-pink-600', url: 'https://instagram.com/hirestream' },
              { icon: <Youtube size={24} />, name: 'YouTube', color: 'bg-red-600', url: 'https://youtube.com/hirestream' },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`${social.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all`}
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </motion.a>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Need Immediate Assistance?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 for urgent inquiries
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="tel:+15551234567"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
              >
                <Phone size={20} />
                Call Now: +1 (555) 123-4567
              </a>
              <a 
                href="mailto:support@hirestream.com"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
              >
                <Mail size={20} />
                Email Support
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;