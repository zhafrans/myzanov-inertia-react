// User Roles Constants
export const USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    SALES: 'SALES',
    DRIVER: 'DRIVER',
    COLLECTOR: 'COLLECTOR'
};

// Helper function to check if user has a specific role
export const hasRole = (user, role) => {
    if (!user || !user.role) return false;
    return user.role === role;
};

// Helper function to check if user has any of the specified roles
export const hasAnyRole = (user, roles) => {
    if (!user || !user.role || !Array.isArray(roles)) return false;
    return roles.includes(user.role);
};

// Specific role check functions
export const isSuperAdmin = (user) => hasRole(user, USER_ROLES.SUPER_ADMIN);
export const isAdmin = (user) => hasRole(user, USER_ROLES.ADMIN);
export const isSales = (user) => hasRole(user, USER_ROLES.SALES);
export const isDriver = (user) => hasRole(user, USER_ROLES.DRIVER);
export const isCollector = (user) => hasRole(user, USER_ROLES.COLLECTOR);

// Combined role check functions based on requirements
export const canEditSales = (user) => hasAnyRole(user, [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]); // SUPER_ADMIN and ADMIN
export const canInputInstallment = (user) => hasAnyRole(user, [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]); // SUPER_ADMIN and ADMIN
export const canDeleteSales = (user) => isSuperAdmin(user); // Only SUPER_ADMIN