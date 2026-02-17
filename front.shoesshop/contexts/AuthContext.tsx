"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
    role: 'Guest' | 'Admin';
}

interface AuthContextType {
    user: User;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>({ username: '', role: 'Guest' });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const decodeToken = (token: string): User | null => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("Decoded Payload:", payload); // Debug for emergency visibility

            const rawRole = payload.role ||
                payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                payload['Role'] ||
                'Guest';

            const isAdminRole = Array.isArray(rawRole)
                ? rawRole.some(r => ['Administrator', 'Admin', 'admin'].includes(r))
                : ['Administrator', 'Admin', 'admin'].includes(rawRole);

            return {
                username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                    payload.unique_name ||
                    payload.sub ||
                    'User',
                role: isAdminRole ? 'Admin' : 'Guest'
            };
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setUser(decoded);
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem('token');
                setUser({ username: '', role: 'Guest' });
                setIsLoggedIn(false);
            }
        } else {
            // Default state is always Guest
            setUser({ username: '', role: 'Guest' });
            setIsLoggedIn(false);
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded = decodeToken(token);
        if (decoded) {
            setUser(decoded);
            setIsLoggedIn(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser({ username: '', role: 'Guest' });
        setIsLoggedIn(false);
        router.push('/');
    };

    const isAdmin = user.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
