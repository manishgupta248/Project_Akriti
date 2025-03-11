'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import useSyllabusStore from '@/store/syllabusStore';
import useCourseStore from '@/store/courseStore'; // For course dropdown
import Select from 'react-select'; // Import react-select


export default function SyllabiPage() {
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount
  const {
    syllabi,
    page,
    limit,
    totalCount,
    nextPage,
    previousPage,
    loading,
    error,
    fetchSyllabi,
    createSyllabus,
    updateSyllabus,
    deleteSyllabus,
    clearError,
    setPage,
  } = useSyllabusStore();

  const { courses, fetchCourses } = useCourseStore();

  const { register, handleSubmit, reset, setValue, watch, control } = useForm();
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const syllabusFile = watch('syllabus_file');

  useEffect(() => {
    fetchSyllabi(page, limit);
    fetchCourses(1, 1000);
    setIsMounted(true); // Set after initial render
  }, [fetchSyllabi, fetchCourses, page, limit]);

  const onSubmit = async (data) => {
    try {
      const formData = {
        course: data.course?.value,
        syllabus_file: data.syllabus_file?.[0],
        description: data.description,
        version: data.version,
      };

      if (editingId) {
        await updateSyllabus(editingId, formData);
        toast.success('Syllabus updated successfully!');
      } else {
        if (!formData.syllabus_file) throw new Error('Syllabus file is required.');
        if (!formData.course) throw new Error('Course is required.');
        await createSyllabus(formData);
        toast.success('Syllabus created successfully!');
      }
      reset();
      setEditingId(null);
      fetchSyllabi(page, limit);
    } catch (err) {
      toast.error(err.message || 'Failed to save syllabus');
    }
  };

  const startEditing = (syllabus) => {
    setEditingId(syllabus.id);
    setValue('course', { value: syllabus.course, label: `${syllabus.course_name} (${syllabus.course})` });
    setValue('description', syllabus.description);
    setValue('version', syllabus.version);
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow-lg border max-w-md">
        <p className="text-lg font-semibold mb-2">Are you sure?</p>
        <p className="text-gray-700">Do you want to delete this syllabus?</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={async () => {
              try {
                await deleteSyllabus(id);
                toast.success('Syllabus deleted successfully!');
                toast.dismiss(t.id);
                fetchSyllabi(page, limit);
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

  const showDetails = (syllabus) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow-lg border max-w-md">
        <h3 className="text-lg font-semibold">{syllabus.course_name}</h3>
        <p><strong>ID:</strong> {syllabus.id}</p>
        <p><strong>Course Code:</strong> {syllabus.course}</p>
        <p><strong>File:</strong> <a href={syllabus.syllabus_file} target="_blank" className="text-blue-600 hover:underline">Download</a></p>
        <p><strong>Uploaded By:</strong> {syllabus.uploaded_by}</p>
        <p><strong>Uploaded At:</strong> {new Date(syllabus.uploaded_at).toLocaleString()}</p>
        <p><strong>Description:</strong> {syllabus.description || 'N/A'}</p>
        <p><strong>Version:</strong> {syllabus.version}</p>
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

  const getFilteredAndSortedSyllabi = () => {
    const syllabiArray = Array.isArray(syllabi) ? syllabi : [];
    let filtered = [...syllabiArray];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((syllabus) =>
        syllabus.course.toLowerCase().includes(lowerSearch) ||
        syllabus.course_name.toLowerCase().includes(lowerSearch) ||
        syllabus.version.toLowerCase().includes(lowerSearch)
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
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

  // Prepare course options for react-select
  const courseOptions = courses.map((course) => ({
    value: course.course_code,
    label: `${course.course_name} (${course.course_code})`,
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Syllabi</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-900 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="bg-green-50 border border-blue-200 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Syllabus' : 'Create Syllabus'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              {isMounted ? (
                <Controller
                  name="course"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={courseOptions}
                      placeholder="Search for a course..."
                      isClearable
                      isDisabled={loading}
                      className="mt-1"
                      classNamePrefix="react-select"
                      onChange={(selectedOption) => field.onChange(selectedOption)}
                      value={field.value}
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  disabled
                  placeholder="Loading courses..."
                  className="mt-1 block w-full rounded-md border border-green-400 bg-gray-100 shadow-sm p-2"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Syllabus File</label>
              <input
                type="file"
                {...register('syllabus_file', { required: !editingId })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                disabled={loading}
                accept="application/pdf"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <input
                {...register('version', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                placeholder="e.g., 1.0"
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                placeholder="Optional description"
                disabled={loading}
                rows={3}
              />
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
      {/* Syllabi Table */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-md">
        {loading && !syllabi.length ? (
          <p className="text-gray-500">Loading...</p>
        ) : syllabi.length === 0 ? (
          <p className="text-gray-500">No syllabi found.</p>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Course Code, Name, or Version..."
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
                      onClick={() => handleSort('id')}
                    >
                      ID{getSortIndicator('id')}
                    </th>
                    <th
                      className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                      onClick={() => handleSort('course')}
                    >
                      Course Code{getSortIndicator('course')}
                    </th>
                    <th
                      className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                      onClick={() => handleSort('course_name')}
                    >
                      Course Name{getSortIndicator('course_name')}
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      File
                    </th>
                    <th
                      className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                      onClick={() => handleSort('version')}
                    >
                      Version{getSortIndicator('version')}
                    </th>
                    <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAndSortedSyllabi().map((syllabus) => (
                    <tr key={syllabus.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="border border-green-400 p-3">{syllabus.id}</td>
                      <td className="border border-green-400 p-3">{syllabus.course}</td>
                      <td className="border border-green-400 p-3">
                        <button
                          onClick={() => showDetails(syllabus)}
                          className="text-blue-600 hover:underline"
                        >
                          {syllabus.course_name}
                        </button>
                      </td>
                      <td className="border border-green-400 p-3">
                        <a href={syllabus.syllabus_file} target="_blank" className="text-blue-600 hover:underline">
                          Download
                        </a>
                      </td>
                      <td className="border border-green-400 p-3">{syllabus.version}</td>
                      <td className="border border-green-400 p-3">
                        <button
                          onClick={() => startEditing(syllabus)}
                          className="text-blue-600 hover:text-blue-800 mr-4 px-1"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        |
                        <button
                          onClick={() => handleDelete(syllabus.id)}
                          className="text-red-600 hover:text-red-800 px-2"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setPage(page - 1) && fetchSyllabi(page - 1, limit)}
                disabled={!previousPage || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages} (Total Syllabi: {totalCount})
              </span>
              <button
                onClick={() => setPage(page + 1) && fetchSyllabi(page + 1, limit)}
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