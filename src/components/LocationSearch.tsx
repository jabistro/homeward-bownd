import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Checkbox,
    ListItemText,
    Chip,
} from '@mui/material';
import { searchLocations } from '../services/api';
import { STATES } from '../utils/constants';
import '../stylesheets/LocationSearch.css';

interface LocationFilter {
    state: (typeof STATES)[number] | '';
    cities: { city: string; zipCodes: string[] }[];
}

interface LocationSearchProps {
    open: boolean;
    onClose: () => void;
    selectedLocations: LocationFilter;
    onLocationChange: (locations: LocationFilter) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
    open,
    onClose,
    selectedLocations,
    onLocationChange,
}) => {
    const [selectedState, setSelectedState] = useState<(typeof STATES)[number] | ''>(selectedLocations.state);
    const [cities, setCities] = useState<{ city: string; zipCodes: string[] }[]>([]);
    const [selectedCities, setSelectedCities] = useState<{ city: string; zipCodes: string[] }[]>(selectedLocations.cities);
    const [loading, setLoading] = useState(false);
    const [allCitiesSelected, setAllCitiesSelected] = useState(selectedLocations.cities.length === 0 && !!selectedLocations.state);

    useEffect(() => {
        if (open) {
            setSelectedState(selectedLocations.state);
            setSelectedCities(selectedLocations.cities);
            setAllCitiesSelected(selectedLocations.cities.length === 0 && !!selectedLocations.state);
        }
    }, [open, selectedLocations]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedState) {
                setCities([]);
                return;
            }

            setLoading(true);
            try {
                const results = await searchLocations({
                    states: [selectedState],
                    size: 100,
                });

                const cityMap = results.results.reduce((acc, location) => {
                    if (!acc[location.city]) {
                        acc[location.city] = {
                            city: location.city,
                            zipCodes: [location.zip_code]
                        };
                    } else {
                        acc[location.city].zipCodes.push(location.zip_code);
                    }
                    return acc;
                }, {} as Record<string, { city: string; zipCodes: string[] }>);

                const sortedCities = Object.values(cityMap).sort((a, b) => 
                    a.city.localeCompare(b.city)
                );

                setCities(sortedCities);
            } catch (error) {
                console.error('Error fetching cities:', error);
                setCities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, [selectedState]);

    const handleStateChange = (event: SelectChangeEvent<(typeof STATES)[number] | ''>) => {
        const newState = event.target.value as (typeof STATES)[number] | '';
        setSelectedState(newState);
        setSelectedCities([]);
        setAllCitiesSelected(false);
    };

    const handleCityChange = (event: SelectChangeEvent<string[]>) => {
        const selectedCityNames = event.target.value as string[];
        
        if (selectedCityNames.includes('ALL')) {
            setSelectedCities([]);
            setAllCitiesSelected(true);
            return;
        }
        
        const newSelectedCities = cities.filter(city => 
            selectedCityNames.includes(city.city)
        );
        setSelectedCities(newSelectedCities);
        setAllCitiesSelected(false);
    };

    const handleDone = () => {
        if (selectedState && (selectedCities.length > 0 || allCitiesSelected)) {
            onLocationChange({
                state: selectedState,
                cities: selectedCities
            });
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleCancel} 
            maxWidth="sm" 
            fullWidth
        >
            <DialogTitle>
                Select Location
            </DialogTitle>
            <DialogContent>
                <Box className="location-search-content">
                    <FormControl fullWidth>
                        <InputLabel htmlFor="state-select-input" id="state-select-label">State</InputLabel>
                        <Select
                            labelId="state-select-label"
                            id="state-select"
                            inputProps={{
                                id: "state-select-input",
                                type: "select"
                            }}
                            value={selectedState}
                            onChange={handleStateChange}
                            label="State"
                            name="state"
                            aria-label="Select state"
                        >
                            <MenuItem value="">
                                <em>Select a state</em>
                            </MenuItem>
                            {STATES.map((state) => (
                                <MenuItem key={state} value={state}>
                                    {state}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedState && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="city-select-input" id="city-select-label">Cities in {selectedState}</InputLabel>
                                <Select
                                    labelId="city-select-label"
                                    id="city-select"
                                    inputProps={{
                                        id: "city-select-input",
                                        type: "select"
                                    }}
                                    multiple
                                    value={allCitiesSelected ? ['ALL'] : selectedCities.map(city => city.city)}
                                    onChange={handleCityChange}
                                    label={`Cities in ${selectedState}`}
                                    name="cities"
                                    aria-label={`Select cities in ${selectedState}`}
                                    renderValue={(selected) => (
                                        <Box className="city-chips-container">
                                            {allCitiesSelected ? (
                                                <Chip 
                                                    key="all" 
                                                    label="All cities" 
                                                    size="small"
                                                />
                                            ) : (
                                                selected.map((cityName) => (
                                                    <Chip 
                                                        key={cityName} 
                                                        label={cityName} 
                                                        size="small"
                                                    />
                                                ))
                                            )}
                                        </Box>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            className: "city-select-menu"
                                        }
                                    }}
                                >
                                    <MenuItem value="ALL">
                                        <Checkbox 
                                            checked={allCitiesSelected}
                                            id="select-all-cities"
                                            inputProps={{
                                                'aria-labelledby': 'all-cities-text'
                                            }}
                                        />
                                        <ListItemText 
                                            primary="All cities" 
                                            id="all-cities-text"
                                        />
                                    </MenuItem>
                                    {loading ? (
                                        <MenuItem disabled>Loading cities...</MenuItem>
                                    ) : cities.length > 0 ? (
                                        cities.map((city) => (
                                            <MenuItem 
                                                key={city.city} 
                                                value={city.city}
                                                disabled={allCitiesSelected}
                                            >
                                                <Checkbox 
                                                    checked={selectedCities.some(sc => sc.city === city.city)}
                                                    id={`select-city-${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                                                    inputProps={{
                                                        'aria-labelledby': `city-text-${city.city.toLowerCase().replace(/\s+/g, '-')}`
                                                    }}
                                                />
                                                <ListItemText 
                                                    primary={city.city}
                                                    id={`city-text-${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                                                />
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No cities found</MenuItem>
                                    )}
                                </Select>
                            </FormControl>

                            <Typography variant="body2" color="text.secondary">
                                {allCitiesSelected 
                                    ? `All cities in ${selectedState} selected`
                                    : selectedCities.length > 0
                                        ? `Selected ${selectedCities.length} ${selectedCities.length === 1 ? 'city' : 'cities'} in ${selectedState}`
                                        : 'Please select cities'}
                            </Typography>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button 
                    onClick={handleDone} 
                    variant="contained" 
                    disabled={!selectedState || (!allCitiesSelected && selectedCities.length === 0)}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 