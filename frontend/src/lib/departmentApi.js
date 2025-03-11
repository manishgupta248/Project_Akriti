import api from "./authApi"; // Reuse the configured axios instance from authApi.js

// Configurable API paths for department-related endpoints
const DEPARTMENT_PATHS = {
  DEPARTMENTS: process.env.NEXT_PUBLIC_DEPARTMENTS_PATH || '/academic/departments/',
  FACULTY_CHOICES: process.env.NEXT_PUBLIC_FACULTY_CHOICES_PATH || '/academic/faculty-choices/',
};

// Generic error handler to extract meaningful messages
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status other than 2xx
    const message = error.response.data?.detail || error.response.data || 'An error occurred';
    throw new Error(`${message} (Status: ${error.response.status})`);
  } else if (error.request) {
    // No response received (e.g., network error)
    throw new Error('Network error: Unable to reach the server');
  } else {
    // Error setting up the request
    throw new Error(`Request error: ${error.message}`);
  }
};

// Fetch all departments
export const getDepartments = async () => {
  try {
    const response = await api.get(DEPARTMENT_PATHS.DEPARTMENTS);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Create a new department
export const createDepartment = async (data) => {
  try {
    const response = await api.post(DEPARTMENT_PATHS.DEPARTMENTS, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch a single department by ID
export const getDepartment = async (id) => {
  try {
    const response = await api.get(`${DEPARTMENT_PATHS.DEPARTMENTS}${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update a department by ID
export const updateDepartment = async (id, data) => {
  try {
    const response = await api.put(`${DEPARTMENT_PATHS.DEPARTMENTS}${id}/`, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete a department by ID (soft delete)
export const deleteDepartment = async (id) => {
  try {
    await api.delete(`${DEPARTMENT_PATHS.DEPARTMENTS}${id}/`);
    return { success: true }; // 204 No Content response
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch faculty choices
export const getFacultyChoices = async () => {
  try {
    const response = await api.get(DEPARTMENT_PATHS.FACULTY_CHOICES);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};