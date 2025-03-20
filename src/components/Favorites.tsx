import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { getDogs, getMatch, getLocations } from '../services/api';
import { Dog, Location } from '../types';
import '../stylesheets/Favorites.css';
import '../stylesheets/UtilityStyles.css';

export const Favorites: React.FC = () => {
    const { favorites, removeFavorite, clearFavorites } = useFavorites();
    const navigate = useNavigate();
    const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
    const [showMatchDialog, setShowMatchDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
    const [locationMap, setLocationMap] = useState<Record<string, Location>>({});
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState<'breed' | 'name' | 'age'>('breed');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchLocations = async () => {
            if (favorites.length === 0) return;
            
            const uniqueZipCodes = Array.from(new Set([
                ...favorites.map(dog => dog.zip_code),
                ...(matchedDog ? [matchedDog.zip_code] : [])
            ]));
            
            try {
                const locations = await getLocations(uniqueZipCodes);
                const locationMapData = locations.reduce((acc, location) => {
                    acc[location.zip_code] = location;
                    return acc;
                }, {} as Record<string, Location>);
                setLocationMap(locationMapData);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        fetchLocations();
    }, [favorites, matchedDog]);

    const getLocationString = (zipCode: string) => {
        const location = locationMap[zipCode];
        if (!location) return zipCode;
        return `${location.city}, ${location.state}`;
    };

    const handleGenerateMatch = async () => {
        if (favorites.length === 0) return;

        try {
            const matchResult = await getMatch(favorites.map((f) => f.id));
            const matchedDogData = await getDogs([matchResult.match]);
            setMatchedDog(matchedDogData[0]);
            setShowMatchDialog(true);
        } catch (error) {
            console.error('Error generating match:', error);
        }
    };

    const handleClearAll = () => {
        setShowClearDialog(true);
    };

    const confirmClearAll = () => {
        clearFavorites();
        setShowClearDialog(false);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortFieldChange = (event: SelectChangeEvent<'breed' | 'name' | 'age'>) => {
        setSortField(event.target.value as 'breed' | 'name' | 'age');
        setPage(1);
    };

    const handleSortOrderToggle = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setPage(1);
    };

    const sortedFavorites = [...favorites].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sortedFavorites.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageFavorites = sortedFavorites.slice(startIndex, endIndex);

    if (favorites.length === 0) {
        return (
            <Container className="favorites-container" maxWidth="lg">
                <Box className="favorites-empty">
                    <Typography variant="h4" component="h1" gutterBottom>
                        No Favorites Yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        You haven't added any dogs to your favorites list.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/search')}
                    >
                        Browse Dogs
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container className="favorites-container" maxWidth="lg">
            <Box className="favorites-header">
                <Typography variant="h4" component="h1" className="mb-large">
                    Your Favorite Dogs
                </Typography>
                <Box className="favorites-actions">
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={12} md={4}>
                            <Box className="sort-controls">
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel htmlFor="sort-field-select" id="sort-field-label">Sort By</InputLabel>
                                    <Select
                                        labelId="sort-field-label"
                                        inputProps={{
                                            id: "sort-field-select"
                                        }}
                                        name="sort-field"
                                        value={sortField}
                                        label="Sort By"
                                        onChange={handleSortFieldChange}
                                    >
                                        <MenuItem value="breed">Breed</MenuItem>
                                        <MenuItem value="name">Name</MenuItem>
                                        <MenuItem value="age">Age</MenuItem>
                                    </Select>
                                </FormControl>
                                <IconButton
                                    onClick={handleSortOrderToggle}
                                    color="primary"
                                    aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                                >
                                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                </IconButton>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={12} md={8}>
                            <Box className="action-buttons">
                                <Button
                                    variant="contained"
                                    onClick={handleGenerateMatch}
                                    disabled={favorites.length === 0}
                                >
                                    Generate Match
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleClearAll}
                                    startIcon={<DeleteIcon />}
                                >
                                    Clear All
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {currentPageFavorites.map((dog) => (
                    <Grid item key={dog.id} xs={12} sm={6} md={4}>
                        <Card>
                            <Box className="image-container">
                                <CardMedia
                                    component="img"
                                    image={dog.img}
                                    alt={dog.name}
                                />
                                <Box
                                    className="image-overlay"
                                    onClick={() => setSelectedImage({ url: dog.img, name: dog.name })}
                                >
                                    <Typography variant="body1" className="image-overlay-text">
                                        Click to enlarge
                                    </Typography>
                                </Box>
                            </Box>
                            <CardContent className="dog-card-content">
                                <Box className="dog-card-header">
                                    <Typography gutterBottom variant="h6" component="div">
                                        {dog.name}
                                    </Typography>
                                    <IconButton
                                        onClick={() => removeFavorite(dog.id)}
                                        color="secondary"
                                    >
                                        <FavoriteIcon />
                                    </IconButton>
                                </Box>
                                <Box className="dog-card-info">
                                    <Typography variant="body2" color="text.secondary">
                                        Breed: {dog.breed}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Age: {dog.age} years
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Location: {getLocationString(dog.zip_code)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {totalPages > 1 && (
                <Box className="favorites-pagination">
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}

            <Dialog 
                open={showMatchDialog} 
                onClose={() => setShowMatchDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="match-dialog-title">
                    Your Perfect Match!
                </DialogTitle>
                {matchedDog && (
                    <>
                        <DialogContent>
                            <Box className="match-dialog-content">
                                <Card className="match-dialog-card">
                                    <CardMedia
                                        component="img"
                                        image={matchedDog.img}
                                        alt={matchedDog.name}
                                    />
                                    <CardContent>
                                        <Typography variant="h6">
                                            Meet {matchedDog.name}!
                                        </Typography>
                                        <Typography variant="body1">
                                            Breed: {matchedDog.breed}
                                        </Typography>
                                        <Typography variant="body1">
                                            Age: {matchedDog.age} years
                                        </Typography>
                                        <Typography variant="body1">
                                            Location: {getLocationString(matchedDog.zip_code)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </DialogContent>
                        <DialogActions className="match-dialog-actions">
                            <Button 
                                onClick={() => setShowMatchDialog(false)}
                                variant="contained"
                                color="primary"
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog
                open={showClearDialog}
                onClose={() => setShowClearDialog(false)}
            >
                <DialogTitle>Clear All Favorites?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove all dogs from your favorites? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowClearDialog(false)}>Cancel</Button>
                    <Button onClick={confirmClearAll} color="error" variant="contained">
                        Clear All
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(selectedImage)}
                onClose={() => setSelectedImage(null)}
                maxWidth="lg"
                PaperProps={{
                    className: "transparent-dialog"
                }}
            >
                {selectedImage && (
                    <Box className="fullsize-image-container">
                        <IconButton
                            onClick={() => setSelectedImage(null)}
                            className="close-button"
                            aria-label="Close image"
                        >
                            <CloseIcon />
                        </IconButton>
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.name}
                            className="fullsize-image"
                        />
                    </Box>
                )}
            </Dialog>
        </Container>
    );
}; 