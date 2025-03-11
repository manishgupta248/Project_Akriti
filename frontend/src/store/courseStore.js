import {create} from 'zustand';
import {
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseCategoryChoices,
  getCourseTypeChoices,
  getCBCSCategoryChoices,
} from '@/lib/courseApi';

/**
 * @typedef {Object} Course
 * @property {string} course_code - Unique course code (e.g., "CS101")
 * @property {string} course_name - Course name
 * @property {string} course_category - Course category (e.g., "COMPULSORY")
 * @property {string} type - Course type (e.g., "THEORY")
 * @property {string} cbcs_category - CBCS category (e.g., "CORE")
 * @property {number} maximum_credit - Credit points (0-20)
 * @property {string} discipline - Department ID
 * @property {number|null} created_by - User ID who created it
 * @property {string} created_at - ISO timestamp
 * @property {number|null} updated_by - User ID who last updated it
 * @property {string} updated_at - ISO timestamp
 * @property {boolean} is_deleted - Soft delete flag
 */

/**
 * @typedef {Object} Choice
 * @property {string} value - Choice value (e.g., "COMPULSORY")
 * @property {string} label - Choice label (e.g., "Compulsory")
 */

/**
 * @typedef {Object} Pagination
 * @property {number} count - Total number of courses
 * @property {string|null} next - URL to next page
 * @property {string|null} previous - URL to previous page
 * @property {Course[]} results - Array of courses on current page
 */

/**
 * @typedef {Object} CourseState
 * @property {Course[]} courses - List of courses (current page)
 * @property {Course|null} selectedCourse - Currently selected course
 * @property {Choice[]} courseCategoryChoices - Course category options
 * @property {Choice[]} courseTypeChoices - Course type options
 * @property {Choice[]} cbcsCategoryChoices - CBCS category options
 * @property {string|null} error - Error message
 * @property {boolean} loading - Loading state
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalCount - Total number of courses
 * @property {string|null} nextPage - URL to next page
 * @property {string|null} previousPage - URL to previous page
 */

/**
 * @typedef {Object} CourseActions
 * @property {Function} fetchCourses - Fetch courses for a specific page
 * @property {Function} fetchCourse - Fetch a single course by course_code
 * @property {Function} createCourse - Create a new course
 * @property {Function} updateCourse - Update an existing course
 * @property {Function} deleteCourse - Soft delete a course
 * @property {Function} fetchCourseCategoryChoices - Fetch course category choices
 * @property {Function} fetchCourseTypeChoices - Fetch course type choices
 * @property {Function} fetchCBCSCategoryChoices - Fetch CBCS category choices
 * @property {Function} clearError - Clear error message
 * @property {Function} setPage - Set current page number
 * @property {Function} setLimit - Set items per page
 */

const useCourseStore = create((set, get) => ({
  courses: [],
  selectedCourse: null,
  courseCategoryChoices: [],
  courseTypeChoices: [],
  cbcsCategoryChoices: [],
  error: null,
  loading: false,
  page: 1,
  limit: 10,
  totalCount: 0,
  nextPage: null,
  previousPage: null,

  /**
   * Fetch courses for a specific page
   * @param {number} [page] - Page number (defaults to current page)
   * @param {number} [limit] - Items per page (defaults to current limit)
   * @returns {Promise<void>}
   */
  fetchCourses: async (page = null, limit = null) => {
    const currentPage = page !== null ? page : get().page;
    const currentLimit = limit !== null ? limit : get().limit;
    set({ loading: true, error: null });
    try {
      const data = await getCourses(currentPage, currentLimit);
      set({
        courses: data.results || [],
        totalCount: data.count || 0,
        nextPage: data.next,
        previousPage: data.previous,
        page: currentPage,
        limit: currentLimit,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Fetch a single course by course_code
   * @param {string} courseCode - Course code
   * @returns {Promise<void>}
   */
  fetchCourse: async (courseCode) => {
    set({ loading: true, error: null });
    try {
      const data = await getCourse(courseCode);
      set({ selectedCourse: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Create a new course
   * @param {Object} data - Course data
   * @returns {Promise<void>}
   */
  createCourse: async (data) => {
    set({ loading: true, error: null });
    try {
      const newCourse = await createCourse(data);
      set((state) => ({
        courses: [...state.courses, newCourse],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Update an existing course
   * @param {string} courseCode - Course code
   * @param {Object} data - Updated course data
   * @returns {Promise<void>}
   */
  updateCourse: async (courseCode, data) => {
    set({ loading: true, error: null });
    try {
      const updatedCourse = await updateCourse(courseCode, data);
      set((state) => ({
        courses: state.courses.map((course) =>
          course.course_code === courseCode ? updatedCourse : course
        ),
        selectedCourse:
          state.selectedCourse?.course_code === courseCode ? updatedCourse : state.selectedCourse,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Soft delete a course
   * @param {string} courseCode - Course code
   * @returns {Promise<void>}
   */
  deleteCourse: async (courseCode) => {
    set({ loading: true, error: null });
    try {
      await deleteCourse(courseCode);
      set((state) => ({
        courses: state.courses.filter((course) => course.course_code !== courseCode),
        selectedCourse:
          state.selectedCourse?.course_code === courseCode ? null : state.selectedCourse,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Fetch course category choices
   * @returns {Promise<void>}
   */
  fetchCourseCategoryChoices: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getCourseCategoryChoices();
      set({ courseCategoryChoices: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Fetch course type choices
   * @returns {Promise<void>}
   */
  fetchCourseTypeChoices: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getCourseTypeChoices();
      set({ courseTypeChoices: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Fetch CBCS category choices
   * @returns {Promise<void>}
   */
  fetchCBCSCategoryChoices: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getCBCSCategoryChoices();
      set({ cbcsCategoryChoices: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Clear error message
   * @returns {void}
   */
  clearError: () => set({ error: null }),

  /**
   * Set current page number
   * @param {number} page - Page number
   * @returns {void}
   */
  setPage: (page) => set({ page }),

  /**
   * Set items per page
   * @param {number} limit - Items per page
   * @returns {void}
   */
  setLimit: (limit) => set({ limit }),
}));

export default useCourseStore;