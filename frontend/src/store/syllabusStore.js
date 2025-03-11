import {create} from 'zustand';
import {
  getSyllabi,
  createSyllabus,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from '@/lib/syllabusApi';

/**
 * @typedef {Object} Syllabus
 * @property {number} id - Unique ID
 * @property {string} course - Course code (e.g., "CS101")
 * @property {string} course_name - Auto-populated course name
 * @property {string} syllabus_file - URL to the uploaded file
 * @property {number} uploaded_by - User ID who uploaded
 * @property {string} uploaded_at - ISO timestamp
 * @property {number|null} updated_by - User ID who last updated
 * @property {string} updated_at - ISO timestamp
 * @property {string} description - Optional description
 * @property {string} version - Version (e.g., "1.0")
 * @property {boolean} is_deleted - Soft delete flag
 */

/**
 * @typedef {Object} Pagination
 * @property {number} count - Total number of syllabi
 * @property {string|null} next - URL to next page
 * @property {string|null} previous - URL to previous page
 * @property {Syllabus[]} results - Array of syllabi on current page
 */

/**
 * @typedef {Object} SyllabusState
 * @property {Syllabus[]} syllabi - List of syllabi (current page)
 * @property {Syllabus|null} selectedSyllabus - Currently selected syllabus
 * @property {string|null} error - Error message
 * @property {boolean} loading - Loading state
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalCount - Total number of syllabi
 * @property {string|null} nextPage - URL to next page
 * @property {string|null} previousPage - URL to previous page
 */

/**
 * @typedef {Object} SyllabusActions
 * @property {Function} fetchSyllabi - Fetch syllabi for a specific page
 * @property {Function} fetchSyllabus - Fetch a single syllabus by ID
 * @property {Function} createSyllabus - Create a new syllabus
 * @property {Function} updateSyllabus - Update an existing syllabus
 * @property {Function} deleteSyllabus - Soft delete a syllabus
 * @property {Function} clearError - Clear error message
 * @property {Function} setPage - Set current page number
 * @property {Function} setLimit - Set items per page
 */

const useSyllabusStore = create((set, get) => ({
  syllabi: [],
  selectedSyllabus: null,
  error: null,
  loading: false,
  page: 1,
  limit: 5, // Matches SyllabusPagination in backend
  totalCount: 0,
  nextPage: null,
  previousPage: null,

  fetchSyllabi: async (page = null, limit = null) => {
    const currentPage = page !== null ? page : get().page;
    const currentLimit = limit !== null ? limit : get().limit;
    set({ loading: true, error: null });
    try {
      const data = await getSyllabi(currentPage, currentLimit);
      set({
        syllabi: data.results || [],
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

  fetchSyllabus: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getSyllabus(id);
      set({ selectedSyllabus: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createSyllabus: async (data) => {
    set({ loading: true, error: null });
    try {
      const newSyllabus = await createSyllabus(data);
      set((state) => ({
        syllabi: [...state.syllabi, newSyllabus],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateSyllabus: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedSyllabus = await updateSyllabus(id, data);
      set((state) => ({
        syllabi: state.syllabi.map((syllabus) =>
          syllabus.id === id ? updatedSyllabus : syllabus
        ),
        selectedSyllabus:
          state.selectedSyllabus?.id === id ? updatedSyllabus : state.selectedSyllabus,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteSyllabus: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteSyllabus(id);
      set((state) => ({
        syllabi: state.syllabi.filter((syllabus) => syllabus.id !== id),
        selectedSyllabus: state.selectedSyllabus?.id === id ? null : state.selectedSyllabus,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  setPage: (page) => set({ page }),

  setLimit: (limit) => set({ limit }),
}));

export default useSyllabusStore;