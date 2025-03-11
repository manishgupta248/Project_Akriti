"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import api from '@/lib/authApi';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Profile() {
    const { user, fetchProfile, isLoading: authLoading, logout } = useAuthStore(); // Include logout from store
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [apiError, setApiError] = useState(null);
    const router = useRouter(); // Initialize router
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { first_name: '', last_name: '', mobile_number: '' },
    });
    const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, watch } = useForm();

    useEffect(() => {
        const getProfile = async () => {
            try {
                await fetchProfile();
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load profile');
                setLoading(false);
            }
        };
        getProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (user && !editMode) {
            reset({ first_name: user.first_name, last_name: user.last_name, mobile_number: user.mobile_number || '' });
        }
    }, [user, editMode, reset]);

    const onUpdate = async (data) => {
        setApiError(null);
        try {
            let response;
            if (data.profile_picture && data.profile_picture[0]) {
                const formData = new FormData();
                for (const key in data) {
                    if (key === 'profile_picture' && data[key]?.[0]) {
                        formData.append(key, data[key][0]);
                    } else {
                        formData.append(key, data[key]);
                    }
                }
                response = await api.put('/auth/me/', formData);
            } else {
                const { profile_picture, ...jsonData } = data;
                response = await api.put('/auth/me/', jsonData);
            }
            await fetchProfile();
            toast.success('Profile updated!');
            setEditMode(false);
        } catch (error) {
            console.error('Update error:', error.response?.data || error.message);
            setApiError(error.response?.data?.error || 'Update failed');
            toast.error(error.response?.data?.error || 'Update failed');
        }
    };

    const onChangePassword = async (data) => {
        setApiError(null);
        try {
            const payload = {
                old_password: data.old_password,
                new_password: data.new_password,
            };
            const response = await api.post('/auth/password/change/', payload);
            console.log('Password change response:', response.data);
            toast.success('Password changed successfully!');
            resetPassword();
            logout(); // Clear auth state
            setTimeout(() => {
                router.push('/login'); // Redirect after toast
            }, 1500);
        } catch (error) {
            console.error('Password change error:', error.response?.data || error.message);
            const errorMessage = error.response?.data
                ? Object.values(error.response.data).flat().join(' ') || 'Password change failed'
                : 'Password change failed';
            setApiError(errorMessage);
            toast.error(errorMessage);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg font-medium text-gray-700">Please log in</p>
            </div>
        );
    }

    const profilePictureUrl = user.profile_picture ? `${BASE_URL}${user.profile_picture}` : null;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">User Profile</h1>
                <div className="bg-white border border-blue-200 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                    {apiError && (
                        <p className="text-red-600 text-sm text-center mb-4 font-medium bg-red-50 p-2 rounded-md">
                            {apiError}
                        </p>
                    )}
                    {!editMode ? (
                        <div className="space-y-6">
                            {profilePictureUrl && (
                                <div className="flex justify-center">
                                    <img
                                        src={profilePictureUrl}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-sm"
                                        onError={(e) => console.error('Failed to load image:', profilePictureUrl)}
                                    />
                                </div>
                            )}
                            <div className="space-y-4 text-gray-700">
                                <p className="text-lg"><span className="font-semibold">Email:</span> {user.email}</p>
                                <p className="text-lg"><span className="font-semibold">First Name:</span> {user.first_name}</p>
                                <p className="text-lg"><span className="font-semibold">Last Name:</span> {user.last_name}</p>
                                <p className="text-lg"><span className="font-semibold">Mobile Number:</span> {user.mobile_number || 'Not set'}</p>
                                <p className="text-lg"><span className="font-semibold">Joined:</span> {new Date(user.date_joined).toLocaleDateString()}</p>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transition duration-200"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
                            <div>
                                <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                                {profilePictureUrl && (
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src={profilePictureUrl}
                                            alt="Current Profile"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-300 shadow-sm"
                                            onError={(e) => console.error('Failed to load image:', profilePictureUrl)}
                                        />
                                    </div>
                                )}
                                <input
                                    id="profile_picture"
                                    {...register('profile_picture', {
                                        validate: (files) => {
                                            if (files?.[0]) {
                                                const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                                                if (!validTypes.includes(files[0].type)) return 'Only JPEG, PNG, or GIF allowed';
                                                if (files[0].size > 2 * 1024 * 1024) return 'Image size must not exceed 2MB';
                                            }
                                            return true;
                                        },
                                    })}
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 block w-full p-2 border border-blue-300 rounded-md bg-white text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 disabled:opacity-50"
                                    disabled={isSubmitting}
                                />
                                {errors.profile_picture && (
                                    <p id="profile_picture-error" className="text-red-600 text-sm mt-1">{errors.profile_picture.message}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    id="first_name"
                                    {...register('first_name', { required: 'First name is required' })}
                                    className="mt-1 block w-full p-3 border border-blue-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    disabled={isSubmitting}
                                    aria-invalid={errors.first_name ? 'true' : 'false'}
                                    aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                                />
                                {errors.first_name && (
                                    <p id="first_name-error" className="text-red-600 text-sm mt-1">{errors.first_name.message}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    id="last_name"
                                    {...register('last_name', { required: 'Last name is required' })}
                                    className="mt-1 block w-full p-3 border border-blue-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    disabled={isSubmitting}
                                    aria-invalid={errors.last_name ? 'true' : 'false'}
                                    aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                                />
                                {errors.last_name && (
                                    <p id="last_name-error" className="text-red-600 text-sm mt-1">{errors.last_name.message}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    id="mobile_number"
                                    {...register('mobile_number', {
                                        pattern: {
                                            value: /^[6-9]\d{9}$/,
                                            message: 'Enter a valid 10-digit Indian mobile number starting with 6-9',
                                        },
                                        maxLength: { value: 10, message: 'Mobile number must be 10 digits' },
                                    })}
                                    type="tel"
                                    className="mt-1 block w-full p-3 border border-blue-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    disabled={isSubmitting}
                                    aria-invalid={errors.mobile_number ? 'true' : 'false'}
                                    aria-describedby={errors.mobile_number ? 'mobile_number-error' : undefined}
                                />
                                {errors.mobile_number && (
                                    <p id="mobile_number-error" className="text-red-600 text-sm mt-1">{errors.mobile_number.message}</p>
                                )}
                            </div>
                            <div className="flex justify-between space-x-4 pt-4">
                                <button
                                    type="submit"
                                    className="w-1/2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center transition duration-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="w-1/2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition duration-200"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-6">
                        <div>
                            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                            <input
                                id="old_password"
                                {...registerPassword('old_password', { required: 'Old password is required' })}
                                type="password"
                                className="mt-1 block w-full p-3 border border-blue-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                disabled={isPasswordSubmitting}
                                aria-invalid={passwordErrors.old_password ? 'true' : 'false'}
                                aria-describedby={passwordErrors.old_password ? 'old_password-error' : undefined}
                            />
                            {passwordErrors.old_password && (
                                <p id="old_password-error" className="text-red-600 text-sm mt-1">{passwordErrors.old_password.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                id="new_password"
                                {...registerPassword('new_password', {
                                    required: 'New password is required',
                                    minLength: { value: 8, message: 'Minimum 8 characters' },
                                    pattern: {
                                        value: /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                                        message: 'Password must contain at least one number and one special character (!@#$%^&*)',
                                    },
                                    validate: (value) => value !== watch('old_password') || 'New password must differ from old password',
                                })}
                                type="password"
                                className="mt-1 block w-full p-3 border border-blue-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                disabled={isPasswordSubmitting}
                                aria-invalid={passwordErrors.new_password ? 'true' : 'false'}
                                aria-describedby={passwordErrors.new_password ? 'new_password-error' : undefined}
                            />
                            {passwordErrors.new_password && (
                                <p id="new_password-error" className="text-red-600 text-sm mt-1">{passwordErrors.new_password.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                id="confirm_password"
                                {...registerPassword('confirm_password', {
                                    required: 'Please confirm your new password',
                                    validate: (value, { new_password }) => value === new_password || 'Passwords do not match',
                                })}
                                type="password"
                                className="mt-1 block w-full p-3 border border-blue-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                disabled={isPasswordSubmitting}
                                aria-invalid={passwordErrors.confirm_password ? 'true' : 'false'}
                                aria-describedby={passwordErrors.confirm_password ? 'confirm_password-error' : undefined}
                            />
                            {passwordErrors.confirm_password && (
                                <p id="confirm_password-error" className="text-red-600 text-sm mt-1">{passwordErrors.confirm_password.message}</p>
                            )}
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center transition duration-200"
                                disabled={isPasswordSubmitting}
                            >
                                {isPasswordSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}