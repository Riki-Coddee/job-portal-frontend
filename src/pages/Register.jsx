import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Building, User, Briefcase, MapPin, Phone, Mail, Lock, ChevronRight, Check } from "lucide-react";

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        role: "job_seeker",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        location: "",
        company: "",
        designation: ""
    });
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const navigate = useNavigate();
    
    const fetchCompanies = async()=>{
        const response = await api.get('/api/companies/')
        setCompanies(response.data)
        
    }
    // Fetch companies for recruiters
    useEffect(() => {
        if (formData.role === "recruiter") {
            fetchCompanies()
        }
    }, [formData.role]);

    // Password strength checker
    useEffect(() => {
        let strength = 0;
        if (formData.password.length >= 8) strength += 1;
        if (/[A-Z]/.test(formData.password)) strength += 1;
        if (/[0-9]/.test(formData.password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
        setPasswordStrength(strength);
    }, [formData.password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
        if (selectedRole === "recruiter" && step === 1) {
            setTimeout(() => setStep(2), 300);
        }
    };

   // In Register.jsx - handleSubmit function
// In your Register.jsx - update handleSubmit function
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone_number: formData.phone,
        location: formData.location,
        company: formData.role === "recruiter" ? formData.company : null,
        designation: formData.role === "recruiter" ? formData.designation : "",
    };

    try {
        // First, check if user exists
        const checkResponse = await api.post("/api/accounts/user/check-email/", {
            email: formData.email
        });
        
        if (checkResponse.data.exists) {
            // User exists, ask if they want to upgrade
            const shouldUpgrade = window.confirm(
                `An account with this email already exists as a ${checkResponse.data.role}. Do you want to upgrade to ${formData.role}?`
            );
            
            if (shouldUpgrade) {
                // Add flag for existing user
                payload.is_existing_user = true;
                
                const response = await api.post("/api/accounts/user/register/", payload);
                toast.success(
                    <div className="flex items-center gap-2">
                        <Check className="text-green-500" /> 
                        Account upgraded successfully to {formData.role}!
                    </div>
                );
            } else {
                toast.info("Please use a different email or login with your existing account");
                return;
            }
        } else {
            // New user registration
            const response = await api.post("/api/accounts/user/register/", payload);
            toast.success(
                <div className="flex items-center gap-2">
                    <Check className="text-green-500" /> 
                    Account created successfully!
                </div>
            );
        }
        
        setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
        console.error(error);
        
        const errorData = error.response?.data;
        
        if (errorData?.errors?.error) {
            toast.error(errorData.errors.error);
        } else {
            toast.error("Registration failed. Please try again.");
        }
    } finally {
        setLoading(false);
    }
};

    const getStrengthColor = () => {
        const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
        return colors[passwordStrength - 1] || "bg-gray-300";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                    
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Join HirePro</h1>
                            <p className="text-gray-600 mt-2">Create your free account in less than 2 minutes</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Role Selection */}
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-xl font-semibold text-gray-800">I am a...</h2>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleRoleSelect("job_seeker")}
                                                className={`p-6 rounded-xl border-2 text-left transition-all ${formData.role === "job_seeker" ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-lg ${formData.role === "job_seeker" ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                        <User className={formData.role === "job_seeker" ? 'text-blue-600' : 'text-gray-600'} size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Job Seeker</h3>
                                                        <p className="text-gray-600 text-sm mt-1">Find your dream job</p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                            
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleRoleSelect("recruiter")}
                                                className={`p-6 rounded-xl border-2 text-left transition-all ${formData.role === "recruiter" ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-lg ${formData.role === "recruiter" ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                                        <Briefcase className={formData.role === "recruiter" ? 'text-purple-600' : 'text-gray-600'} size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Recruiter</h3>
                                                        <p className="text-gray-600 text-sm mt-1">Find top talent</p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        </div>
                                        
                                        <div className="pt-6 ">
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setStep(2)}
                                                 className="w-full bg-blue-600 border border-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 hover:border-white/30 transition-all"
                                            >
                                                Continue <ChevronRight size={18} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Step 2: Basic Information */}
                            <AnimatePresence mode="wait">
                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-5"
                                    >
                                        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-gray-400">
                                                    <User size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="First Name"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Last Name"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-gray-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="work@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-gray-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        
                                        <div className="pt-4 flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Step 3: Role-Specific Details */}
                            <AnimatePresence mode="wait">
                                {step === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-5"
                                    >
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {formData.role === "job_seeker" ? "Job Preferences" : "Professional Details"}
                                        </h2>
                                        
                                        {/* Job Seeker Fields */}
                                        {formData.role === "job_seeker" && (
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-gray-400">
                                                    <MapPin size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    placeholder="Preferred Location (City, Country)"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Recruiter Fields */}
                                        {formData.role === "recruiter" && (
                                            <>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-3 text-gray-400">
                                                        <Building size={18} />
                                                    </div>
                                                    <select
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                                        required
                                                    >
                                                        <option value="">Select Company</option>
                                                        {companies.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div className="relative">
                                                    <div className="absolute left-3 top-3 text-gray-400">
                                                        <Briefcase size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="designation"
                                                        placeholder="Your Designation (e.g., HR Manager)"
                                                        value={formData.designation}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
                                        
                                        {/* Password Section */}
                                        <div className="pt-4">
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-gray-400">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    placeholder="Create a strong password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            
                                            {/* Password Strength Meter */}
                                            {formData.password && (
                                                <div className="mt-3">
                                                    <div className="flex gap-1 mb-1">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div 
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-full ${i <= passwordStrength ? getStrengthColor() : 'bg-gray-200'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        {passwordStrength === 0 && "Enter a password"}
                                                        {passwordStrength === 1 && "Weak"}
                                                        {passwordStrength === 2 && "Fair"}
                                                        {passwordStrength === 3 && "Good"}
                                                        {passwordStrength === 4 && "Strong"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Terms Agreement */}
                                        <div className="flex items-start gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                className="mt-1"
                                                required
                                            />
                                            <label htmlFor="terms" className="text-sm text-gray-700">
                                                I agree to HirePro's <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                                            </label>
                                        </div>
                                        
                                        {/* Final Actions */}
                                        <div className="pt-6 flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                                            >
                                                Back
                                            </button>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-70"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Creating Account...
                                                    </div>
                                                ) : (
                                                    "Create Account"
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                        
                        {/* Already have account */}
                        <div className="text-center mt-8 pt-6 border-t border-gray-200">
                            <p className="text-gray-700">
                                Already have an account?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-blue-600 font-semibold hover:text-blue-800 hover:underline"
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;