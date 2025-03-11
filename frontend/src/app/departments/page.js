'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import useDepartmentStore from '@/store/departmentStore';

export default function DepartmentsPage() {
  const {
    departments,
    facultyChoices,
    loading,
    error,
    fetchDepartments,
    fetchFacultyChoices,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    clearError,
  } = useDepartmentStore();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchFacultyChoices();
  }, [fetchDepartments, fetchFacultyChoices]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateDepartment(editingId, data);
        toast.success('Department updated successfully!');
      } else {
        await createDepartment(data);
        toast.success('Department created successfully!');
      }
      reset();
      setEditingId(null);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const startEditing = (dept) => {
    setEditingId(dept.id);
    setValue('name', dept.name);
    setValue('faculty', dept.faculty);
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow-lg border max-w-md">
        <p className="text-lg font-semibold mb-2">Are you sure?</p>
        <p className="text-gray-700">Do you want to delete this department?</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={async () => {
              try {
                await deleteDepartment(id);
                toast.success('Department deleted successfully!');
                toast.dismiss(t.id);
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

  const showDetails = (dept) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow-lg border max-w-md">
        <h3 className="text-lg font-semibold">{dept.name}</h3>
        <p><strong>ID:</strong> {dept.id}</p>
        <p><strong>Faculty:</strong> {dept.faculty}</p>
        <p><strong>Created By:</strong> {dept.created_by || 'Unknown'}</p>
        <p><strong>Created At:</strong> {new Date(dept.created_at).toLocaleString()}</p>
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

  const getFilteredAndSortedDepartments = () => {
    // Ensure departments is an array before proceeding
    const deptArray = Array.isArray(departments) ? departments : [];
    let filtered = [...deptArray];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dept) =>
          dept.id.toLowerCase().includes(lowerSearch) ||
          dept.name.toLowerCase().includes(lowerSearch) ||
          dept.faculty.toLowerCase().includes(lowerSearch)
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Departments</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-900 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 bg-green-50 border border-blue-200 p-6 rounded-lg shadow-md transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Department' : 'Create Department'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register('name', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-green-600 p-2 transition-all duration-200"
                placeholder="Enter department name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Faculty</label>
              <select
                {...register('faculty', { required: true })}
                className="mt-1 block w-full rounded-md border border-green-400 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2 transition-all duration-200"
                disabled={loading}
              >
                <option value="">Select Faculty</option>
                {facultyChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
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

        <div className="lg:w-2/3 bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-md">
          {loading && !departments.length ? (
            <p className="text-gray-500">Loading...</p>
          ) : departments.length === 0 ? (
            <p className="text-gray-500">No departments found.</p>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, Name, or Faculty..."
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
                        onClick={() => handleSort('name')}
                      >
                        Name{getSortIndicator('name')}
                      </th>
                      <th
                        className="border border-green-400 p-3 text-center text-sm font-semibold text-white cursor-pointer"
                        onClick={() => handleSort('faculty')}
                      >
                        Faculty{getSortIndicator('faculty')}
                      </th>
                      <th className="border border-green-400 p-3 text-center text-sm font-semibold text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAndSortedDepartments().map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="border border-green-400 p-3">{dept.id}</td>
                        <td className="border border-green-400 p-3">
                          <button
                            onClick={() => showDetails(dept)}
                            className="text-blue-600 hover:underline"
                          >
                            {dept.name}
                          </button>
                        </td>
                        <td className="border border-green-400 p-3">{dept.faculty}</td>
                        <td className="border border-green-400 p-3">
                          <button
                            onClick={() => startEditing(dept)}
                            className="text-blue-600 hover:text-blue-800 mr-4 px-2"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          |
                          <button
                            onClick={() => handleDelete(dept.id)}
                            className="text-red-600 hover:text-red-800 px-4"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}