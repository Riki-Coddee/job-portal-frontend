// src/utils/errorHandler.js
export const formatErrorMessage = (error) => {
    if (!error.response) {
        return "Network error. Please check your connection.";
    }
    
    const { data, status } = error.response;
    
    if (status === 400) {
        // Handle validation errors
        if (data.errors) {
            // Return first error or combine them
            const firstError = Object.values(data.errors)[0];
            return firstError;
        }
        
        if (typeof data === 'object') {
            // Try to extract error message
            const messages = [];
            Object.entries(data).forEach(([field, message]) => {
                if (Array.isArray(message)) {
                    messages.push(...message);
                } else {
                    messages.push(`${field}: ${message}`);
                }
            });
            return messages.join(', ') || data.message || 'Validation failed';
        }
        
        return data || 'Bad request';
    }
    
    if (status === 401) return "Unauthorized. Please login.";
    if (status === 403) return "You don't have permission to do this.";
    if (status === 404) return "Resource not found.";
    if (status === 500) return "Server error. Please try again later.";
    
    return "Something went wrong. Please try again.";
};

// Helper to extract field-specific errors
export const extractFieldErrors = (error) => {
    if (!error.response?.data?.errors) {
        return {};
    }
    
    const fieldErrors = {};
    Object.entries(error.response.data.errors).forEach(([field, message]) => {
        // Convert Django field names to frontend field names
        const frontendField = field === 'email' ? 'email' :
                             field === 'password' ? 'password' :
                             field === 'first_name' ? 'firstName' :
                             field === 'last_name' ? 'lastName' :
                             field === 'phone_number' ? 'phone' :
                             field === 'company' ? 'company' :
                             field === 'designation' ? 'designation' :
                             field === 'role' ? 'role' : field;
        
        fieldErrors[frontendField] = message;
    });
    
    return fieldErrors;
};