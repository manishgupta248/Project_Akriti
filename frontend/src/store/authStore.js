import { create } from 'zustand';
import api from '@/lib/authApi';
import toast from 'react-hot-toast';

// Configurable API paths
const AUTH_PATHS = {
    LOGIN: process.env.NEXT_PUBLIC_LOGIN_PATH || '/auth/login/',
    LOGOUT: process.env.NEXT_PUBLIC_LOGOUT_PATH || '/auth/logout/',
    PROFILE: process.env.NEXT_PUBLIC_PROFILE_PATH || '/auth/me/',
};

/**
 * @typedef {Object} AuthState
 * @property {Object|null} user - The authenticated user object or null if not authenticated
 * @property {string} [user.email] - User's email
 * @property {string} [user.first_name] - User's first name
 * @property {string} [user.last_name] - User's last name
 * @property {boolean} isAuthenticated - Indicates if the user is authenticated
 * @property {boolean} isLoading - Indicates if an auth-related action is in progress
 * @property {(credentials: { email: string, password: string }, router: { push: (path: string) => void }) => Promise<void>} login - Logs in a user
 * @property {(router: { push: (path: string) => void }) => Promise<void>} logout - Logs out the current user
 * @property {() => Promise<Object>} fetchProfile - Fetches the current user's profile
 * @property {() => Promise<void>} checkAuth - Checks authentication status
 */

/** @type {import('zustand').StoreCreator<AuthState>} */
const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    /**
     * Logs in a user with the provided credentials
     * @param {{ email: string, password: string }} credentials - User login credentials
     * @param {{ push: (path: string) => void }} router - Next.js router for navigation
     * @returns {Promise<void>}
     */
    login: async (credentials, router) => {
        set({ isLoading: true });
        try {
            const response = await api.post(AUTH_PATHS.LOGIN, credentials);
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            toast.success('Login successful!');
            router.push('/profile');
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            toast.error(error.response?.data?.error || 'Login failed');
            set({ isLoading: false });
            throw error;
        }
    },

    /**
     * Logs out the current user
     * @param {{ push: (path: string) => void }} router - Next.js router for navigation
     * @returns {Promise<void>}
     */
    logout: async (router) => {
        set({ isLoading: true });
        try {
            await api.post(AUTH_PATHS.LOGOUT, null, { withCredentials: true });
            set({ user: null, isAuthenticated: false, isLoading: false });
            toast.success('Logged out successfully!');
            // router.push('/login');
        } catch (error) {
            console.error('Logout error:', error.response?.data || error.message);
            set({ user: null, isAuthenticated: false, isLoading: false });
            toast.success('Logged out successfully!');
            router.push('/login');
        }
    },

    /**
     * Fetches the current user's profile
     * @returns {Promise<Object>} The user profile data
     */
    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get(AUTH_PATHS.PROFILE, { withCredentials: true });
            set({ user: response.data, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            console.error('Fetch profile error:', error.response?.data || error.message);
            set({ user: null, isAuthenticated: false, isLoading: false });
            throw error;
        }
    },

    /**
     * Checks the current authentication status
     * @returns {Promise<void>}
     */
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get(AUTH_PATHS.PROFILE, { withCredentials: true });
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.log('Auth check failed:', error.response?.data || error.message);
            set({ user: null, isAuthenticated: false, isLoading: false });
            // No need to redirect here; let interceptor handle it
        }
    },
}));

export default useAuthStore;