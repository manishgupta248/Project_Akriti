"use client";

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import useAuthStore from '../../store/authStore'; // Adjusted path

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login, isLoading } = useAuthStore();
    const router = useRouter();
    const [apiError, setApiError] = useState(null);

    const onSubmit = async (data) => {
        setApiError(null);
        try {
            await login(data, router);
        } catch (error) {
            setApiError(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-blue-50 p-6 rounded-lg shadow-lg border border-blue-200 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
                            className="mt-1 block w-full bg-white p-2 border border-blue-300 rounded-md"
                            autoComplete="email"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.email ? 'true' : 'false'}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                            <p id="email-error" className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 3,
                                    message: 'Password must be at least 8 characters',
                                },
                            })}
                            type="password"
                            className="mt-1 block w-full bg-white p-2 border border-blue-300 rounded-md"
                            autoComplete="current-password"
                            disabled={isSubmitting || isLoading}
                            aria-invalid={errors.password ? 'true' : 'false'}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                        />
                        {errors.password && (
                            <p id="password-error" className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
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
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                    <div className="text-center mt-4">
                        <p>
                            Don’t have an account?{' '}
                            <Link href="/register" className="text-blue-500 hover:underline">Register</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}