import api from './authApi'; // Reuse the configured axios instance

// Configurable API paths for syllabus-related endpoints
const SYLLABUS_PATHS = {
  SYLLABI: process.env.NEXT_PUBLIC_SYLLABI_PATH || '/courses/syllabi/',
};

// Generic error handler
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

// Fetch all syllabi (paginated)
export const getSyllabi = async (page = 1, limit = 5) => {
  try {
    const response = await api.get(SYLLABUS_PATHS.SYLLABI, {
      params: { page, limit },
    });
    return response.data; // Returns { count, next, previous, results }
  } catch (error) {
    handleApiError(error);
  }
};

// Create a new syllabus (with file upload)
export const createSyllabus = async (data) => {
  try {
    const formData = new FormData();
    formData.append('course', data.course);
    formData.append('syllabus_file', data.syllabus_file);
    formData.append('description', data.description || '');
    formData.append('version', data.version || '1.0');

    const response = await api.post(SYLLABUS_PATHS.SYLLABI, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch a single syllabus by ID
export const getSyllabus = async (id) => {
  try {
    const response = await api.get(`${SYLLABUS_PATHS.SYLLABI}${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update a syllabus by ID (with file upload)
export const updateSyllabus = async (id, data) => {
  try {
    const formData = new FormData();
    if (data.course) formData.append('course', data.course);
    if (data.syllabus_file) formData.append('syllabus_file', data.syllabus_file);
    if (data.description) formData.append('description', data.description);
    if (data.version) formData.append('version', data.version);

    const response = await api.put(`${SYLLABUS_PATHS.SYLLABI}${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete a syllabus by ID (soft delete)
export const deleteSyllabus = async (id) => {
  try {
    await api.delete(`${SYLLABUS_PATHS.SYLLABI}${id}/`);
    return { success: true }; // 204 No Content response
  } catch (error) {
    handleApiError(error);
  }
};