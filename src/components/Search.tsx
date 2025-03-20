import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Pagination,
    CircularProgress,
    SelectChangeEvent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
} from '@mui/material';
import { Favorite, FavoriteBorder, Close } from '@mui/icons-material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { getBreeds, searchDogs, getDogs, getMatch, getLocations, searchLocations } from '../services/api';
import { Dog, Location } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import '../stylesheets/Search.css';
import '../stylesheets/UtilityStyles.css';
import { LocationSearch } from './LocationSearch';
import { AgeSearch } from './AgeSearch';
import { STATES } from '../utils/constants';

interface LocationFilter {
    state: (typeof STATES)[number] | '';
    cities: { city: string; zipCodes: string[] }[];
}

interface AgeFilter {
    minAge: number | '';
    maxAge: number | '';
}

export const Search: React.FC = () => {
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreed, setSelectedBreed] = useState<string>('');
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersLoaded, setFiltersLoaded] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState<'breed' | 'name' | 'age'>('breed');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
    const [showMatchDialog, setShowMatchDialog] = useState(false);
    const [locationMap, setLocationMap] = useState<Record<string, Location>>({});
    const { favorites, addFavorite, removeFavorite } = useFavorites();
    const [locationFilter, setLocationFilter] = useState<LocationFilter>({ state: '', cities: [] });
    const [ageFilter, setAgeFilter] = useState<AgeFilter>({ minAge: '', maxAge: '' });
    const [showLocationSearch, setShowLocationSearch] = useState(false);
    const [showAgeSearch, setShowAgeSearch] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

    useEffect(() => {
        const fetchBreeds = async () => {
            try {
                const breedList = await getBreeds();
                setBreeds(breedList);
            } catch (error) {
                console.error('Error fetching breeds:', error);
            }
        };
        fetchBreeds();
    }, []);

    useEffect(() => {
        const savedLocationFilter = localStorage.getItem('locationFilter');
        const savedAgeFilter = localStorage.getItem('ageFilter');
        
        if (savedLocationFilter) {
            const parsedLocationFilter = JSON.parse(savedLocationFilter);
            if (parsedLocationFilter.state || parsedLocationFilter.cities.length > 0) {
                setLocationFilter(parsedLocationFilter);
            } else {
                localStorage.removeItem('locationFilter');
            }
        }
        if (savedAgeFilter) {
            const parsedAgeFilter = JSON.parse(savedAgeFilter);
            if (parsedAgeFilter.minAge !== '' || parsedAgeFilter.maxAge !== '') {
                setAgeFilter(parsedAgeFilter);
            } else {
                localStorage.removeItem('ageFilter');
            }
        }
        setFiltersLoaded(true);
    }, []);

    useEffect(() => {
        if (locationFilter.state || locationFilter.cities.length > 0) {
            localStorage.setItem('locationFilter', JSON.stringify(locationFilter));
        } else {
            localStorage.removeItem('locationFilter');
        }
    }, [locationFilter]);

    useEffect(() => {
        if (ageFilter.minAge !== '' || ageFilter.maxAge !== '') {
            localStorage.setItem('ageFilter', JSON.stringify(ageFilter));
        } else {
            localStorage.removeItem('ageFilter');
        }
    }, [ageFilter]);

    useEffect(() => {
        if (!filtersLoaded) return;

        const fetchDogs = async () => {
            setLoading(true);
            try {
                const zipCodes = locationFilter.cities.length > 0
                    ? locationFilter.cities.flatMap(city => city.zipCodes)
                    : locationFilter.state
                        ? (await searchLocations({
                            states: [locationFilter.state],
                            size: 100
                        })).results.map(loc => loc.zip_code)
                        : undefined;

                const searchParams = {
                    breeds: selectedBreed ? [selectedBreed] : undefined,
                    zipCodes,
                    ageMin: ageFilter.minAge !== '' ? ageFilter.minAge : undefined,
                    ageMax: ageFilter.maxAge !== '' ? ageFilter.maxAge : undefined,
                    size: 20,
                    sort: `${sortField}:${sortOrder}`,
                    from: ((page - 1) * 20).toString(),
                };
                const searchResult = await searchDogs(searchParams);
                const dogsList = await getDogs(searchResult.resultIds);
                setDogs(dogsList);
                setTotalPages(Math.ceil(searchResult.total / 20));

                const uniqueZipCodes = Array.from(new Set(dogsList.map(dog => dog.zip_code)));
                const locations = await getLocations(uniqueZipCodes);
                const locationMapData = locations.reduce((acc, location) => {
                    acc[location.zip_code] = location;
                    return acc;
                }, {} as Record<string, Location>);
                setLocationMap(locationMapData);
            } catch (error) {
                console.error('Error fetching dogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDogs();
    }, [selectedBreed, sortField, sortOrder, page, locationFilter, ageFilter, filtersLoaded]);

    const handleBreedChange = (event: SelectChangeEvent<string>) => {
        setSelectedBreed(event.target.value);
        setSortField(event.target.value ? 'name' : 'breed');
        setPage(1);
    };

    const handleSortFieldChange = (event: SelectChangeEvent<'breed' | 'name' | 'age'>) => {
        setSortField(event.target.value as 'breed' | 'name' | 'age');
        setPage(1);
    };

    const handleSortOrderToggle = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleFavorite = (dog: Dog) => {
        const isFavorite = favorites.some((f) => f.id === dog.id);
        if (isFavorite) {
            removeFavorite(dog.id);
        } else {
            addFavorite(dog);
        }
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

    const getLocationString = (zipCode: string) => {
        const location = locationMap[zipCode];
        if (!location) return zipCode;
        return `${location.city}, ${location.state}`;
    };

    const getLocationFilterLabel = () => {
        if (!locationFilter.state) return 'Location';
        
        if (locationFilter.cities.length === 0) {
            return `All cities in ${locationFilter.state}`;
        }

        return `${locationFilter.cities.length} ${locationFilter.cities.length === 1 ? 'city' : 'cities'} in ${locationFilter.state}`;
    };

    const getAgeFilterLabel = () => {
        if (!ageFilter.minAge && !ageFilter.maxAge) return 'Age';
        
        if (ageFilter.minAge && ageFilter.maxAge) {
            return `${ageFilter.minAge}-${ageFilter.maxAge} years`;
        }
        
        if (ageFilter.minAge) {
            return `Min ${ageFilter.minAge} years`;
        }
        
        return `Max ${ageFilter.maxAge} years`;
    };

    const handleClearAllFilters = () => {
        setLocationFilter({ state: '', cities: [] });
        setAgeFilter({ minAge: '', maxAge: '' });
        localStorage.removeItem('locationFilter');
        localStorage.removeItem('ageFilter');
    };

    if (loading) {
        return (
            <Box className="search-loading">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container className="search-container" maxWidth="lg">
            <Box className="search-header">
                <Box className="flex-row space-between mb-large">
                    <Typography variant="h4" component="h1">
                        Find Your Perfect Dog
                    </Typography>
                    <Box className="flex-row gap-small">
                        <Button
                            variant="contained"
                            onClick={handleGenerateMatch}
                            disabled={favorites.length === 0}
                        >
                            Generate Match
                        </Button>
                    </Box>
                </Box>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel 
                                id="breed-select-label"
                                htmlFor="breed-select-input"
                            >
                                Breed
                            </InputLabel>
                            <Select
                                labelId="breed-select-label"
                                id="breed-select"
                                value={selectedBreed}
                                label="Breed"
                                onChange={handleBreedChange}
                                inputProps={{
                                    id: "breed-select-input",
                                    name: "breed-select"
                                }}
                            >
                                <MenuItem value="">All Breeds</MenuItem>
                                {breeds.map((breed) => (
                                    <MenuItem key={breed} value={breed}>
                                        {breed}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box className="sort-controls">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel 
                                    id="sort-field-label"
                                    htmlFor="sort-field-input"
                                >
                                    Sort By
                                </InputLabel>
                                <Select
                                    labelId="sort-field-label"
                                    id="sort-field"
                                    value={sortField}
                                    label="Sort By"
                                    onChange={handleSortFieldChange}
                                    inputProps={{
                                        id: "sort-field-input",
                                        name: "sort-field"
                                    }}
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
                    <Grid item xs={12} sm={3}>
                        <Box className="flex-row gap-small">
                            <Button
                                variant="outlined"
                                onClick={() => setShowLocationSearch(true)}
                                fullWidth
                                color={locationFilter.state ? 'primary' : 'inherit'}
                                id="location-filter-button"
                                aria-label="Open location filter"
                                aria-haspopup="dialog"
                                aria-expanded={showLocationSearch}
                            >
                                {getLocationFilterLabel()}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setShowAgeSearch(true)}
                                fullWidth
                                color={ageFilter.minAge || ageFilter.maxAge ? 'primary' : 'inherit'}
                                id="age-filter-button"
                                aria-label="Open age filter"
                                aria-haspopup="dialog"
                                aria-expanded={showAgeSearch}
                            >
                                {getAgeFilterLabel()}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {(locationFilter.state || ageFilter.minAge || ageFilter.maxAge) && (
                    <Box className="mt-medium">
                        <Typography variant="subtitle2" gutterBottom>
                            Active Filters:
                        </Typography>
                        <Box className="location-chips">
                            {locationFilter.state && (
                                locationFilter.cities.length === 0 ? (
                                    <Chip
                                        label={`All cities in ${locationFilter.state}`}
                                        onDelete={() => setLocationFilter({ state: '', cities: [] })}
                                        size="small"
                                        aria-label={`Remove filter for all cities in ${locationFilter.state}`}
                                    />
                                ) : (
                                    <>
                                        {locationFilter.cities.map((city) => (
                                            <Chip
                                                key={city.city}
                                                label={`${city.city}, ${locationFilter.state}`}
                                                onDelete={() => {
                                                    const remainingCities = locationFilter.cities.filter(
                                                        c => c.city !== city.city
                                                    );
                                                    if (remainingCities.length === 0) {
                                                        setLocationFilter({ state: '', cities: [] });
                                                    } else {
                                                        setLocationFilter(prev => ({
                                                            ...prev,
                                                            cities: remainingCities
                                                        }));
                                                    }
                                                }}
                                                size="small"
                                                aria-label={`Remove ${city.city} filter`}
                                            />
                                        ))}
                                    </>
                                )
                            )}
                            {ageFilter.minAge !== '' && (
                                <Chip
                                    label={`Min ${ageFilter.minAge} years`}
                                    onDelete={() => setAgeFilter(prev => ({ ...prev, minAge: '' }))}
                                    size="small"
                                    aria-label="Remove minimum age filter"
                                />
                            )}
                            {ageFilter.maxAge !== '' && (
                                <Chip
                                    label={`Max ${ageFilter.maxAge} years`}
                                    onDelete={() => setAgeFilter(prev => ({ ...prev, maxAge: '' }))}
                                    size="small"
                                    aria-label="Remove maximum age filter"
                                />
                            )}
                            {(locationFilter.state || ageFilter.minAge || ageFilter.maxAge) && (
                                <Chip
                                    label="Clear All"
                                    onDelete={handleClearAllFilters}
                                    size="small"
                                    color="error"
                                    aria-label="Clear all filters"
                                />
                            )}
                        </Box>
                    </Box>
                )}
            </Box>

            {dogs.length === 0 ? (
                <Box className="flex-column text-center mt-large">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No dogs found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {locationFilter.state 
                            ? `We couldn't find any dogs in ${locationFilter.cities.length > 0 
                                ? `${locationFilter.cities.map(c => c.city).join(', ')}` 
                                : `${locationFilter.state}`}${selectedBreed ? ` of breed ${selectedBreed}` : ''}`
                            : selectedBreed 
                                ? `We couldn't find any dogs of breed ${selectedBreed}`
                                : 'No dogs match your current filters'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="mt-small">
                        Try adjusting your filters to see more results
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {dogs.map((dog) => (
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
                                <CardContent>
                                    <Box className="flex-row space-between align-center">
                                        <Typography gutterBottom variant="h6" component="div" id={`dog-name-${dog.id}`}>
                                            {dog.name}
                                        </Typography>
                                        <IconButton
                                            onClick={() => handleToggleFavorite(dog)}
                                            aria-label={`${favorites.some((f) => f.id === dog.id) ? 'Remove' : 'Add'} ${dog.name} ${favorites.some((f) => f.id === dog.id) ? 'from' : 'to'} favorites`}
                                            size="small"
                                            aria-labelledby={`dog-name-${dog.id}`}
                                        >
                                            {favorites.some((f) => f.id === dog.id) ? (
                                                <Favorite color="error" />
                                            ) : (
                                                <FavoriteBorder />
                                            )}
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Breed: {dog.breed}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Age: {dog.age} years
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Location: {getLocationString(dog.zip_code)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Box className="search-pagination">
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

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

            <LocationSearch
                open={showLocationSearch}
                onClose={() => setShowLocationSearch(false)}
                selectedLocations={locationFilter}
                onLocationChange={setLocationFilter}
            />

            <AgeSearch
                open={showAgeSearch}
                onClose={() => setShowAgeSearch(false)}
                selectedAges={ageFilter}
                onAgeChange={setAgeFilter}
            />

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
                            <Close />
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