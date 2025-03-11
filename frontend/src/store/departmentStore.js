import {create} from 'zustand';
import { 
  getDepartments,
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  getFacultyChoices,} from '@/lib/departmentApi';

/**
* @typedef {Object} Department
* @property {string} id - Unique three-digit ID
* @property {string} name - Department name
* @property {string} faculty - Faculty code (e.g., "I&C")
* @property {number|null} created_by - User ID who created it
* @property {string} created_at - ISO timestamp
* @property {number|null} updated_by - User ID who last updated it
* @property {string} updated_at - ISO timestamp
* @property {boolean} is_deleted - Soft delete flag
*/

/**
* @typedef {Object} FacultyChoice
* @property {string} value - Faculty code (e.g., "I&C")
* @property {string} label - Faculty name (e.g., "IC")
*/

/**
* @typedef {Object} DepartmentState
* @property {Department[]} departments - List of departments
* @property {Department|null} selectedDepartment - Currently selected department
* @property {FacultyChoice[]} facultyChoices - List of faculty options
* @property {string|null} error - Error message
* @property {boolean} loading - Loading state
*/

/**
* @typedef {Object} DepartmentActions
* @property {Function} fetchDepartments - Fetch all departments
* @property {Function} fetchDepartment - Fetch a single department by ID
* @property {Function} createDepartment - Create a new department
* @property {Function} updateDepartment - Update an existing department
* @property {Function} deleteDepartment - Soft delete a department
* @property {Function} fetchFacultyChoices - Fetch faculty choices
* @property {Function} clearError - Clear error message
*/

const useDepartmentStore = create((set, get) => ({
 departments: [], // Initial state is always an array
 selectedDepartment: null,
 facultyChoices: [],
 error: null,
 loading: false,

 fetchDepartments: async () => {
   set({ loading: true, error: null });
   try {
     const data = await getDepartments();
     // Ensure data is an array (handle unexpected formats)
     const departmentsArray = Array.isArray(data) ? data : data.results || [];
     set({ departments: departmentsArray, loading: false });
   } catch (error) {
     set({ error: error.message, loading: false });
   }
 },

 fetchDepartment: async (id) => {
   set({ loading: true, error: null });
   try {
     const data = await getDepartment(id);
     set({ selectedDepartment: data, loading: false });
   } catch (error) {
     set({ error: error.message, loading: false });
   }
 },

 createDepartment: async (data) => {
   set({ loading: true, error: null });
   try {
     const newDepartment = await createDepartment(data);
     set((state) => ({
       departments: [...state.departments, newDepartment],
       loading: false,
     }));
   } catch (error) {
     set({ error: error.message, loading: false });
   }
 },

 updateDepartment: async (id, data) => {
   set({ loading: true, error: null });
   try {
     const updatedDepartment = await updateDepartment(id, data);
     set((state) => ({
       departments: state.departments.map((dept) =>
         dept.id === id ? updatedDepartment : dept
       ),
       selectedDepartment:
         state.selectedDepartment?.id === id ? updatedDepartment : state.selectedDepartment,
       loading: false,
     }));
   } catch (error) {
     set({ error: error.message, loading: false });
   }
 },

 deleteDepartment: async (id) => {
   set({ loading: true, error: null });
   try {
     await deleteDepartment(id);
     set((state) => ({
       departments: state.departments.filter((dept) => dept.id !== id),
       selectedDepartment:
         state.selectedDepartment?.id === id ? null : state.selectedDepartment,
       loading: false,
     }));
   } catch (error) {
     set({ error: error.message, loading: false });
   }
 },

 fetchFacultyChoices: async () => {
   set({ loading: true, error: null });
   try {
     const data = await getFacultyChoices();
     set({ facultyChoices: data, loading: false });
   } catch (error) {
     set({ error: error.message, loading: false });
   }
 },

 clearError: () => set({ error: null }),
}));

export default useDepartmentStore;