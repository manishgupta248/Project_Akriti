import api from './authApi'; // Reuse the configured axios instance from authApi.js

// Configurable API paths for course-related endpoints
const COURSE_PATHS = {
  COURSES: process.env.NEXT_PUBLIC_COURSES_PATH || '/courses/courses/',
  COURSE_CATEGORY_CHOICES:
    process.env.NEXT_PUBLIC_COURSE_CATEGORY_CHOICES_PATH || '/courses/course-category-choices/',
  COURSE_TYPE_CHOICES:
    process.env.NEXT_PUBLIC_COURSE_TYPE_CHOICES_PATH || '/courses/course-type-choices/',
  CBCS_CATEGORY_CHOICES:
    process.env.NEXT_PUBLIC_CBCS_CATEGORY_CHOICES_PATH || '/courses/cbcs-category-choices/',
};

// Generic error handler to extract meaningful messages
const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.detail || error.response.data || 'An error occurred';
    throw new Error(`${message} (Status: ${error.response.status})`);
  } else if (error.request) {
    throw new Error('Network error: Unable to reach the server');
  } else {
    throw new Error(`Request error: ${error.message}`);
  }
};

// Fetch all courses (paginated)
export const getCourses = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(COURSE_PATHS.COURSES, {
      params: { page, limit },
    });
    return response.data; // Returns { count, next, previous, results }
  } catch (error) {
    handleApiError(error);
  }
};

// Create a new course
export const createCourse = async (data) => {
  try {
    const response = await api.post(COURSE_PATHS.COURSES, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch a single course by course_code
export const getCourse = async (courseCode) => {
  try {
    const response = await api.get(`${COURSE_PATHS.COURSES}${courseCode}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update a course by course_code
export const updateCourse = async (courseCode, data) => {
  try {
    const response = await api.put(`${COURSE_PATHS.COURSES}${courseCode}/`, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete a course by course_code (soft delete)
export const deleteCourse = async (courseCode) => {
  try {
    await api.delete(`${COURSE_PATHS.COURSES}${courseCode}/`);
    return { success: true }; // 204 No Content response
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch course category choices
export const getCourseCategoryChoices = async () => {
  try {
    const response = await api.get(COURSE_PATHS.COURSE_CATEGORY_CHOICES);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch course type choices
export const getCourseTypeChoices = async () => {
  try {
    const response = await api.get(COURSE_PATHS.COURSE_TYPE_CHOICES);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch CBCS category choices
export const getCBCSCategoryChoices = async () => {
  try {
    const response = await api.get(COURSE_PATHS.CBCS_CATEGORY_CHOICES);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};