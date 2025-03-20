import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../services/api';

interface AuthContextType {
    user: { name: string; email: string } | null;
    login: (name: string, email: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'homeward_bownd_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        return storedAuth ? JSON.parse(storedAuth) : null;
    });

    const isAuthenticated = Boolean(user);

    useEffect(() => {
        const checkAuth = async () => {
            const publicPaths = ['/', '/login'];
            if (!user && !publicPaths.includes(location.pathname)) {
                navigate('/login', { replace: true });
            }
        };
        checkAuth();
    }, [user, location.pathname, navigate]);

    const handleLogin = async (name: string, email: string) => {
        try {
            await apiLogin({ name, email });
            
            const userData = { name, email };
            setUser(userData);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
            
            navigate('/search', { replace: true });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
            
            setUser(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login: handleLogin,
                logout: handleLogout,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 