import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Button,
    TextField,
    Typography,
    Paper,
} from '@mui/material';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../stylesheets/Login.css';
import '../stylesheets/UtilityStyles.css';

const USERS_STORAGE_KEY = 'homeward_bownd_users';

interface StoredUser {
    name: string;
    email: string;
}

const VALID_EMAIL_DOMAINS = ['.com', '.net', '.org', '.edu', '.gov'];

const isValidEmailDomain = (email: string): boolean => {
    const domain = email.split('@')[1];
    return VALID_EMAIL_DOMAINS.some(validDomain => domain?.endsWith(validDomain));
};

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login: setAuthUser, user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/search', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidEmailDomain(formData.email)) {
            setError('Please enter a valid email address with a common domain (e.g., .com, .net, .org)');
            return;
        }

        try {
            const storedData = localStorage.getItem(USERS_STORAGE_KEY);
            const existingUsers: StoredUser[] = storedData ? JSON.parse(storedData) : [];
            
            const existingUser = existingUsers.find(u => u.email === formData.email);
            
            if (existingUser && existingUser.name !== formData.name) {
                setError('This email is already registered with a different name.');
                return;
            }
            
            if (!existingUser) {
                existingUsers.push({
                    name: formData.name,
                    email: formData.email,
                });
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existingUsers));
            }

            await login({ email: formData.email, name: formData.name });
            setAuthUser(formData.name, formData.email);
            navigate('/search');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    const handleDemoLogin = async () => {
        try {
            const demoEmail = 'demo@homewardbownd.com';
            const demoName = 'Demo User';
            await login({ email: demoEmail, name: demoName });
            setAuthUser(demoName, demoEmail);
            navigate('/search');
        } catch (error) {
            setError('Demo login failed. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box className="login-container">
                <Paper className="login-paper" elevation={3}>
                    <Typography component="h1" variant="h5" className="text-center">
                        Welcome to Homeward Bownd
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Find your perfect furry friend
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} className="login-form" aria-label="Login form">
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={formData.name}
                            onChange={handleChange}
                            inputProps={{
                                'aria-label': 'Name'
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            inputProps={{
                                'aria-label': 'Email Address'
                            }}
                        />
                        {error && (
                            <Typography color="error" className="login-error">
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            className="login-submit"
                        >
                            Sign In
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleDemoLogin}
                            className="demo-button"
                        >
                            DEMO USER
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}; 