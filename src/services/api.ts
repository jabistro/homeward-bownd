import axios, { AxiosError } from 'axios';
import { Dog, Location, LoginCredentials, SearchResponse, Match } from '../types';

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('homeward_bownd_auth');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
        await api.post('/auth/login', credentials);
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
        localStorage.removeItem('homeward_bownd_auth');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const getBreeds = async (): Promise<string[]> => {
    const response = await api.get<string[]>('/dogs/breeds');
    return response.data;
};

export const searchDogs = async (params: {
    breeds?: string[];
    zipCodes?: string[];
    ageMin?: number;
    ageMax?: number;
    size?: number;
    from?: string;
    sort?: string;
}): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>('/dogs/search', { params });
    return response.data;
};

export const getDogs = async (dogIds: string[]): Promise<Dog[]> => {
    const response = await api.post<Dog[]>('/dogs', dogIds);
    return response.data;
};

export const getMatch = async (dogIds: string[]): Promise<Match> => {
    const response = await api.post<Match>('/dogs/match', dogIds);
    return response.data;
};

export const getLocations = async (zipCodes: string[]): Promise<Location[]> => {
    const response = await api.post<Location[]>('/locations', zipCodes);
    return response.data;
};

interface LocationSearchParams {
    city?: string;
    states?: string[];
    size?: number;
    from?: string;
}

interface LocationSearchResponse {
    results: Location[];
    total: number;
}

export const searchLocations = async (params: LocationSearchParams): Promise<LocationSearchResponse> => {
    const response = await api.post<LocationSearchResponse>('/locations/search', params);
    return response.data;
}; 