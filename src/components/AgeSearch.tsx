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
    TextField,
} from '@mui/material';
import '../stylesheets/AgeSearch.css';

interface AgeFilter {
    minAge: number | '';
    maxAge: number | '';
}

interface AgeSearchProps {
    open: boolean;
    onClose: () => void;
    selectedAges: AgeFilter;
    onAgeChange: (ages: AgeFilter) => void;
}

export const AgeSearch: React.FC<AgeSearchProps> = ({
    open,
    onClose,
    selectedAges,
    onAgeChange,
}) => {
    const [minAge, setMinAge] = useState<number | ''>(selectedAges.minAge);
    const [maxAge, setMaxAge] = useState<number | ''>(selectedAges.maxAge);

    useEffect(() => {
        if (open) {
            setMinAge(selectedAges.minAge);
            setMaxAge(selectedAges.maxAge);
        }
    }, [open, selectedAges]);

    const handleMinAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMinAge(value === '' ? '' : Number(value));
    };

    const handleMaxAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMaxAge(value === '' ? '' : Number(value));
    };

    const handleDone = () => {
        onAgeChange({
            minAge,
            maxAge
        });
        onClose();
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
                Select Age Range
            </DialogTitle>
            <DialogContent>
                <Box className="age-search-content">
                    <FormControl fullWidth>
                        <TextField
                            label="Minimum Age"
                            type="number"
                            value={minAge}
                            onChange={handleMinAgeChange}
                            inputProps={{ min: 0 }}
                            fullWidth
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            label="Maximum Age"
                            type="number"
                            value={maxAge}
                            onChange={handleMaxAgeChange}
                            inputProps={{ min: 0 }}
                            fullWidth
                        />
                    </FormControl>

                    <Typography variant="body2" color="text.secondary">
                        {minAge !== '' && maxAge !== '' && minAge > maxAge
                            ? 'Minimum age cannot be greater than maximum age'
                            : 'Enter age range in years'}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button 
                    onClick={handleDone} 
                    variant="contained" 
                    disabled={minAge !== '' && maxAge !== '' && minAge > maxAge}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
};