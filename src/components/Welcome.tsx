import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PetsIcon from '@mui/icons-material/Pets';
import { useAuth } from '../context/AuthContext';
import '../stylesheets/Welcome.css';

export const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Container maxWidth="md">
            <Box className="welcome-container">
                <Typography variant="h2" component="h1" gutterBottom align="center">
                    Welcome to Homeward Bownd
                </Typography>

                <Typography variant="h5" align="center" color="text.secondary" paragraph>
                    Finding forever homes for our furry friends, one match at a time.
                </Typography>

                <Paper className="welcome-paper" elevation={3}>
                    <Typography variant="h6" gutterBottom>
                        How It Works
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <SearchIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Browse Available Dogs"
                                secondary="Search through our database of shelter dogs looking for their forever homes."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <FilterListIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Filter and Sort"
                                secondary="Filter by breed, age, and sort results to find your perfect companion."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <LocationOnIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Location Search"
                                secondary="Find dogs in your area or explore other locations."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <FavoriteIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Create Favorites"
                                secondary="Save your favorite dogs and keep track of potential matches."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <PetsIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Get Matched"
                                secondary="Generate a perfect match from your favorites list and find your new best friend!"
                            />
                        </ListItem>
                    </List>
                </Paper>

                <Box className="mt-medium">
                    {user ? (
                        <Box className="flex-center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/search')}
                                className="welcome-button"
                            >
                                Start Searching
                            </Button>
                        </Box>
                    ) : (
                        <Box className="flex-column gap-medium text-center">
                            <Typography variant="body1" color="text.secondary">
                                Please log in to start finding your perfect companion
                            </Typography>
                            <Box className="flex-center">
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/login')}
                                    className="welcome-button"
                                >
                                    Log In
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
}; 