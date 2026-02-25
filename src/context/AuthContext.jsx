import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAccessTokenKey, getRefreshTokenKey, USER_ROLE } from '../constants';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Helper function to get role-specific tokens
    const getCurrentTokens = () => {
        const role = localStorage.getItem(USER_ROLE);
        if (!role) return { role: null, accessToken: null, refreshToken: null };
        
        return {
            role,
            accessToken: localStorage.getItem(getAccessTokenKey(role)),
            refreshToken: localStorage.getItem(getRefreshTokenKey(role))
        };
    };

    // Helper function to set role-specific tokens
    const setCurrentTokens = (role, accessToken, refreshToken) => {
        localStorage.setItem(USER_ROLE, role);
        localStorage.setItem(getAccessTokenKey(role), accessToken);
        localStorage.setItem(getRefreshTokenKey(role), refreshToken);
    };

    // Clear tokens function
    const clearTokens = () => {
        const role = localStorage.getItem(USER_ROLE);
        if (role) {
            localStorage.removeItem(getAccessTokenKey(role));
            localStorage.removeItem(getRefreshTokenKey(role));
        }
        localStorage.removeItem(USER_ROLE);
        delete api.defaults.headers.common['Authorization'];
    };

    // Initialize auth state only once
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { role, accessToken } = getCurrentTokens();
                
                if (!role || !accessToken) {
                    setLoading(false);
                    setInitialized(true);
                    return;
                }

                // Set auth header immediately
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Check token validity
                try {
                    const decoded = jwtDecode(accessToken);
                    
                    // If token is expired, try refresh
                    if (decoded.exp < Date.now() / 1000) {
                        const refreshed = await refreshToken();
                        if (!refreshed) {
                            clearTokens();
                        }
                    } else {
                        setIsAuthorized(true);
                        // Fetch user data in background
                        fetchUserData();
                    }
                } catch (error) {
                    console.error("Token validation failed:", error);
                    clearTokens();
                }
            } catch (error) {
                console.error("Auth initialization failed:", error);
                clearTokens();
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        initAuth();
    }, []);

    const refreshToken = async () => {
        const { role, refreshToken: storedRefreshToken } = getCurrentTokens();
        
        if (!role || !storedRefreshToken) {
            setIsAuthorized(false);
            return false;
        }

        try {
            const res = await api.post("api/accounts/token/refresh/", {
                refresh: storedRefreshToken
            });
            
            if (res.status === 200) {
                localStorage.setItem(getAccessTokenKey(role), res.data.access);
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
                setIsAuthorized(true);
                return true;
            }
        } catch(error) {
            console.error("Refresh token failed:", error);
        }
        
        setIsAuthorized(false);
        clearTokens();
        return false;
    };

    const fetchUserData = async () => {
        try {
            const { data } = await api.get('/api/accounts/fetch/user/me/');
            setUser(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Don't clear tokens on fetch failure, just don't set user
        }
    };

    const loginUser = async (access, refresh, role = null) => {
        try {
            // Decode role if not provided
            let userRole = role;
            if (!userRole) {
                const decoded = jwtDecode(access);
                userRole = decoded.role || decoded.user_role;
            }
            
            // Set tokens immediately
            setCurrentTokens(userRole, access, refresh);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            // Update state
            setIsAuthorized(true);
            
            // Fetch user data (non-blocking)
            setTimeout(() => fetchUserData(), 100);
            
            return { success: true, role: userRole };
        } catch (error) {
            console.error("Login failed:", error);
            clearTokens();
            return { success: false, error };
        }
    };

    const logout = () => {
        clearTokens();
        setUser(null);
        setIsAuthorized(false);
        navigate('/login');
    };

    const value = {
        isAuthorized,
        user,
        loading,
        initialized,
        loginUser,
        logout,
        fetchUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};