import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Dog } from '../types';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
    favorites: Dog[];
    addFavorite: (dog: Dog) => void;
    removeFavorite: (dogId: string) => void;
    clearFavorites: () => void;
}

const FAVORITES_STORAGE_KEY = 'homeward_bownd_favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Dog[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (!user?.email) {
            setFavorites([]);
            return;
        }

        const storedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
        
        try {
            if (!storedData) {
                setFavorites([]);
                return;
            }

            const allUserFavorites = JSON.parse(storedData);
            const userFavorites = allUserFavorites[user.email] || [];
            setFavorites(userFavorites);
        } catch (error) {
            setFavorites([]);
        }
    }, [user?.email]);

    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false);
            return;
        }

        if (!user?.email) {
            return;
        }

        try {
            const storedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
            const allUserFavorites = storedData ? JSON.parse(storedData) : {};
            
            if (favorites.length === 0) {
                delete allUserFavorites[user.email];
            } else {
                allUserFavorites[user.email] = favorites;
            }

            if (Object.keys(allUserFavorites).length === 0) {
                localStorage.removeItem(FAVORITES_STORAGE_KEY);
            } else {
                localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allUserFavorites));
            }
        } catch (error) {
            console.error('FavoritesProvider: Error saving favorites:', error);
        }
    }, [favorites, user?.email, isInitialLoad]);

    const addFavorite = (dog: Dog) => {
        if (!user?.email) {
            return;
        }
        setFavorites((prev) => {
            if (!prev.find((f) => f.id === dog.id)) {
                return [...prev, dog];
            }
            return prev;
        });
    };

    const removeFavorite = (dogId: string) => {
        if (!user?.email) {
            return;
        }
        setFavorites((prev) => prev.filter((dog) => dog.id !== dogId));
    };

    const clearFavorites = () => {
        if (!user?.email) {
            return;
        }
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                clearFavorites,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}; 