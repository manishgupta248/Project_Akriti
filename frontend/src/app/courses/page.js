'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import useCourseStore from '@/store/courseStore';
import useDepartmentStore from '@/store/departmentStore'; // For discipline choices

export default function CoursesPage() {
  const {
    courses,
    page,
    limit,
    totalCount,
    nextPage,
    previousPage,
    loading,
    error,
    courseCategoryChoices,
    courseTypeChoices,
    cbcsCategoryChoices,
    fetchCourses,
    fetchCourseCategoryChoices,
    fetchCourseTypeChoices,
    fetchCBCSCategoryChoices,
    createCourse,
    updateCourse,
    deleteCourse,
    clearError,
    setPage,
  } = useCourseStore();

  const { departments, fetchDepartments } = useDepartmentStore(); // For discipline dropdown

  const { register, handleSubmit, reset, setValue } = useForm();
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses(page, limit);
    fetchCourseCategoryChoices();
    fetchCourseTypeChoices();
    fetchCBCSCategoryChoices();
    fetchDepartments(); // Fetch departments for discipline choices
  }, [fetchCourses, fetchCourseCategoryChoices, fetchCourseTypeChoices, fetchCBCSCategoryChoices, fetchDepartments, page, limit]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateCourse(editingId, data);
        toast.success('Course updated successfully!');
      } else {
        await createCourse(data);
        toast.success('Course created successfully!');
      }
      reset();
      setEditingId(null);
      fetchCourses(page, limit); // Refresh current page
    } catch (err) {
      // Error is handled by the store
    }
  };

  const startEditing = (course) => {
    setEditingId(course.course_code);
    setValue('course_code', course.course_code);
    setValue('course_name', course.course_name);
    setValue('course_category', course.course_category);
    setValue('type', course.type);
    setValue('cbcs_category', course.cbcs_category);
    setValue('maximum_credit', course.maximum_credit);
    setValue('discipline', course.discipline);
  };

  const handleDelete = (courseCode) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow-lg border max-w-md">
        <p className="text-lg font-semibold mb-2">Are you sure?</p>
        <p className="text-gray-700">Do you want to delete this course?</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={async () => {
              try {
                await deleteCourse(courseCode);
                toast.success('Course deleted successfully!');
                toast.dismiss(t.id);
                fetchCourses(page, limit); // Refresh current page
              } catch (error) {
                toast.dismiss(t.id);
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
            disabled={loading}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const showDetails = (course) => {
    const categoryLabel = courseCategoryChoices.find(c => c.value === course.course_category)?.label || course.course_category;
    const typeLabel = courseTypeChoices.find(c => c.value === course.type)?.label || course.type;
    const cbcsLabel = cbcsCategoryChoices.find(c => c.value === course.cbcs_category)?.label || course.cbcs_category;
    const disciplineName = departments.find(d => d.id === course.discipline)?.name || course.discipline;

    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow-lg border max-w-md">
        <h3 className="text-lg font-semibold">{course.course_name}</h3>
        <p><strong>Code:</strong> {course.course_code}</p>
        <p><strong>Category:</strong> {categoryLabel}</p>
        <p><strong>Type:</strong> {typeLabel}</p>
        <p><strong>CBCS Category:</strong> {cbcsLabel}</p>
        <p><strong>Max Credit:</strong> {course.maximum_credit}</p>
        <p><strong>Discipline:</strong> {disciplineName}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="mt-2 bg-gray-500 text-white px-2 py-1 rounded"
        >
          Close
        </button>
      </div>
    ));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedCourses = () => {
    const courseArray = Array.isArray(courses) ? courses : [];
    let filtered = [...courseArray];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((course) => {
        const disciplineName = departments.find(d => d.id === course.discipline)?.name || '';
        return (
          course.course_code.toLowerCase().includes(lowerSearch) ||
          course.course_name.toLowerCase().includes(lowerSearch) ||
          disciplineName.toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = sortConfig.key === 'discipline' 
          ? (departments.find(d => d.id === a.discipline)?.name || a[sortConfig.key]) 
          : a[sortConfig.key];
        const bValue = sortConfig.key === 'discipline' 
          ? (departments.find(d => d.id === b.discipline)?.name || b[sortConfig.key]) 
          : b[sortConfig.key];
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    return filtered;
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Courses</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-900 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      <div className="bg-green-50 border border-blue-200 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Course' : 'Create Course'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Code</label>
              <input
                {...register('course_code', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                placeholder="e.g., CSE-101-V"
                disabled={loading || editingId} // Disable when editing
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input
                {...register('course_name', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                placeholder="Enter course name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Category</label>
              <select
                {...register('course_category', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select Category</option>
                {courseCategoryChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                {...register('type', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select Type</option>
                {courseTypeChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CBCS Category</label>
              <select
                {...register('cbcs_category', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select CBCS Category</option>
                {cbcsCategoryChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Credit</label>
              <select
                {...register('maximum_credit', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select Credit</option>
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Discipline</label>
              <select
                {...register('discipline', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select Discipline</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Processing...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditingId(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Course Table */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-md">
        {loading && !courses.length ? (
          <p className="text-gray-500">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Code, Name, or Discipline..."
                className="w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                disabled={loading}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-green-400">
                <thead>
                  <tr className="bg-[#800000]">
                    <th
                      className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                      onClick={() => handleSort('course_code')}
                    >
                      Code{getSortIndicator('course_code')}
                    </th>
                    <th
                      className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                      onClick={() => handleSort('course_name')}
                    >
                      Name{getSortIndicator('course_name')}
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      Category
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      Type
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      CBCS
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      Credit
                    </th>
                    <th
                      className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                      onClick={() => handleSort('discipline')}
                    >
                      Discipline{getSortIndicator('discipline')}
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAndSortedCourses().map((course) => {
                    const disciplineName = departments.find(d => d.id === course.discipline)?.name || course.discipline;
                    return (
                      <tr key={course.course_code} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="border border-green-400 p-3">{course.course_code}</td>
                        <td className="border border-green-400 p-3">
                          <button
                            onClick={() => showDetails(course)}
                            className="text-blue-600 hover:underline"
                          >
                            {course.course_name}
                          </button>
                        </td>
                        <td className="border border-green-400 p-2">
                          {courseCategoryChoices.find(c => c.value === course.course_category)?.label || course.course_category}
                        </td>
                        <td className="border border-green-400 p-2">
                          {courseTypeChoices.find(c => c.value === course.type)?.label || course.type}
                        </td>
                        <td className="border border-green-400 p-2">
                          {cbcsCategoryChoices.find(c => c.value === course.cbcs_category)?.label || course.cbcs_category}
                        </td>
                        <td className="border border-green-400 p-2">{course.maximum_credit}</td>
                        <td className="border border-green-400 p-2">{disciplineName}</td>
                        <td className="border border-green-400 p-2">
                          <button
                            onClick={() => startEditing(course)}
                            className="text-blue-600 hover:text-blue-800 mr-4 px-1"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          |
                          <button
                            onClick={() => handleDelete(course.course_code)}
                            className="text-red-600 hover:text-red-800 px-2"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setPage(page - 1) && fetchCourses(page - 1, limit)}
                disabled={!previousPage || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages} (Total Courses: {totalCount})
              </span>
              <button
                onClick={() => setPage(page + 1) && fetchCourses(page + 1, limit)}
                disabled={!nextPage || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}