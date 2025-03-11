'use client';

import './globals.css';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import LeftSidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation'; // To get current path


export default function RootLayout({ children }) {
    const { checkAuth, isAuthenticated } = useAuthStore();
    const pathname = usePathname();

    useEffect(() => {
        // Only run checkAuth if not authenticated and not on auth pages
        if (!isAuthenticated && pathname !== '/login' && pathname !== '/register' && pathname !== '/logout') {
            checkAuth();
        }
    }, [checkAuth, pathname, isAuthenticated]);

    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen bg-gray-100">

                <NavBar />
                <div className="flex flex-1">
                    <LeftSidebar />
                    <main className="flex-1 p-4">{children}</main>
                </div>
                
                <Footer />
                <Toaster position="top-right" />
            </body>
        </html>
    );
}