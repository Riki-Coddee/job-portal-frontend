// constants/index.js
// Role-specific token storage
export const getAccessTokenKey = (role) => `${role}_access_token`;
export const getRefreshTokenKey = (role) => `${role}_refresh_token`;

// Default keys (for backward compatibility)
export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";

// User role
export const USER_ROLE = "user_role";