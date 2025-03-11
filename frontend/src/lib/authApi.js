import axios from 'axios';

// Configurable API paths
const AUTH_PATHS = {
    LOGIN: process.env.NEXT_PUBLIC_LOGIN_PATH || '/auth/login/',
    REFRESH: process.env.NEXT_PUBLIC_REFRESH_PATH || '/auth/token/refresh/',
    LOGOUT: process.env.NEXT_PUBLIC_LOGOUT_PATH || '/auth/logout/',
    PROFILE: process.env.NEXT_PUBLIC_PROFILE_PATH || '/auth/me/',
};

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

    // Request interceptor
    api.interceptors.request.use((config) => {
        console.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        return config;
    }, (error) => Promise.reject(error));

    // Response interceptor with refresh token logic
    let isRefreshing = false;
    let refreshPromise = null;

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // Skip refresh for logout and specific paths
            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                originalRequest.url !== AUTH_PATHS.LOGIN &&
                originalRequest.url !== AUTH_PATHS.REFRESH &&
                originalRequest.url !== AUTH_PATHS.LOGOUT // Explicitly skip logout
            ) {
                originalRequest._retry = true;

                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = api.post(AUTH_PATHS.REFRESH, null, { withCredentials: true })
                        .then(() => {
                            isRefreshing = false;
                            refreshPromise = null;
                        })
                        .catch((refreshError) => {
                            isRefreshing = false;
                            refreshPromise = null;
                            console.error('Token refresh failed:', refreshError);
                            if (typeof window !== 'undefined') {
                                window.location.href = '/login';
                            }
                            throw refreshError;
                        });
                }

                try {
                    await refreshPromise;
                    return api(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            // Pass through logout errors without refresh
            return Promise.reject(error);
        }
    );

export default api;