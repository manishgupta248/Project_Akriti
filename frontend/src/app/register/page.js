"use client";

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/authApi'; 
import useAuthStore from '../../store/authStore'; 

export default function Register() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login, isLoading } = useAuthStore();
    const router = useRouter();
    const [apiError, setApiError] = useState(null);

    const onSubmit = async (data) => {
        setApiError(null);
        try {
            const response = await api.post('/auth/register/', data); // Simple JSON payload
            await login({ email: data.email, password: data.password }, router);
            toast.success('Registration successful!');
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            setApiError(error.response?.data?.error || 'Registration failed');
            toast.error(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
                        <input
                            id="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Invalid email address',
                                },
                            })}
                            type="email"
                            className="mt-1 block w-full p-2 bg-white border border-blue-300 rounded-md"
                            autoComplete="email"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.email ? 'true' : 'false'}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && <p id="email-error" className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name*</label>
                        <input
                            id="first_name"
                            {...register('first_name', { required: 'First name is required' })}
                            type="text"
                            className="mt-1 block w-full p-2 bg-white border border-blue-300 rounded-md"
                            autoComplete="given-name"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.first_name ? 'true' : 'false'}
                            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                        />
                        {errors.first_name && <p id="first_name-error" className="text-red-500 text-sm">{errors.first_name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name*</label>
                        <input
                            id="last_name"
                            {...register('last_name', { required: 'Last name is required' })}
                            type="text"
                            className="mt-1 block w-full p-2 bg-white border border-blue-300 rounded-md"
                            autoComplete="family-name"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.last_name ? 'true' : 'false'}
                            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                        />
                        {errors.last_name && <p id="last_name-error" className="text-red-500 text-sm">{errors.last_name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input
                            id="mobile_number"
                            {...register('mobile_number', {
                                pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message: 'Enter a valid 10-digit Indian mobile number starting with 6-9',
                                },
                                maxLength: {
                                    value: 10,
                                    message: 'Mobile number must be 10 digits',
                                },
                            })}
                            type="tel"
                            className="mt-1 block w-full p-2 bg-white border border-blue-300 rounded-md"
                            autoComplete="tel"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.mobile_number ? 'true' : 'false'}
                            aria-describedby={errors.mobile_number ? 'mobile_number-error' : undefined}
                        />
                        {errors.mobile_number && <p id="mobile_number-error" className="text-red-500 text-sm">{errors.mobile_number.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password*</label>
                        <input
                            id="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters',
                                },
                                pattern: {
                                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                                    message: 'Password must contain at least one letter and one number',
                                },
                            })}
                            type="password"
                            className="mt-1 block w-full p-2 bg-white border border-blue-300 rounded-md"
                            autoComplete="new-password"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.password ? 'true' : 'false'}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                        />
                        {errors.password && <p id="password-error" className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Registering...
                            </>
                        ) : (
                            'Register'
                        )}
                    </button>
                    <div className="text-center mt-4">
                        <p>
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}