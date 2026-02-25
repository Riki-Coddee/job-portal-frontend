import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Use a ref to track if we're in the middle of a login attempt
    const isLoggingInRef = useRef(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isLoggingInRef.current || loading) return;
        
        isLoggingInRef.current = true;
        setLoading(true);
        
        try {
            const res = await api.post("/api/accounts/token/", formData);
            
            const role = res.data.role || "job_seeker";
            
            // Login user
            await loginUser(res.data.access, res.data.refresh, role);
            
            toast.success(`Welcome back!`);
            
            // Redirect based on role
            if (role === "recruiter") {
                navigate("/recruiter/dashboard", { replace: true });
            } else {
                // For job seekers, go to home or jobs page, NOT recruiter dashboard
                const from = location.state?.from?.pathname || "/";
                navigate(from, { replace: true });
            }
            
        } catch (error) {
            // Clear the ref and loading state
            isLoggingInRef.current = false;
            setLoading(false);
            
            // Show error message
            const errorMessage = error.response?.data?.detail || 
                error.response?.data?.message || 
                "Invalid email or password. Please try again.";
            
            toast.error(errorMessage, {
                autoClose: 3000,
                hideProgressBar: false,
            });
            
            // Clear password field for security
            setFormData(prev => ({ ...prev, password: "" }));
            
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white">HirePro</h1>
                        <p className="text-blue-100 mt-1">Find your dream job or perfect candidate</p>
                    </div>
                    
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                        <p className="text-gray-600 mb-6">Sign in to continue your journey</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="work@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-70"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            
                            {/* Password Field */}
                            <div className="relative flex items-center">
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-70"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            {/* Forgot Password */}
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            
                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                        
                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">New to HirePro?</span>
                            </div>
                        </div>
                        
                        {/* Register Link */}
                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            onClick={() => !loading && navigate("/register")}
                            disabled={loading}
                            className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create an account
                        </motion.button>
                        
                        {/* Terms Notice */}
                        <p className="text-xs text-gray-500 text-center mt-6">
                            By signing in, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </p>
                    </div>
                </div>
                
                {/* Demo Credentials Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Demo:</span> jobseeker@example.com / password123
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;