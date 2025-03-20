import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Stack,
    Menu,
    MenuItem,
    IconButton,
    Badge,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import '../stylesheets/Header.css';
import '../stylesheets/UtilityStyles.css';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { favorites } = useFavorites();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        await logout();
        navigate('/');
    };

    const renderNavLinks = () => (
        <Stack direction="row" spacing={3} alignItems="center">
            <Link to="/search" className="nav-link">
                <Typography variant="h6" className="medium-text">
                    Search
                </Typography>
            </Link>
            <Link to="/favorites" className="nav-link">
                <Box className="flex-row align-center gap-small">
                    <Typography variant="h6" className="medium-text">
                        Favorites
                    </Typography>
                    <Badge badgeContent={favorites.length} color="secondary">
                        <FavoriteIcon />
                    </Badge>
                </Box>
            </Link>
        </Stack>
    );

    const renderUserMenu = () => (
        <>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Typography variant="h6">{user?.name}</Typography>
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );

    return (
        <AppBar position="fixed" color="primary" elevation={2} className="main-header">
            <Toolbar className="toolbar-padding">
                {isMobile ? (
                    <Box className="flex-column full-width">
                        <Box className="flex-center">
                            <Link to="/" className="header-link">
                                <Typography
                                    variant="h4"
                                    component="div"
                                    className="header-title large-text bold-text"
                                >
                                    Homeward Bownd 🐾
                                </Typography>
                            </Link>
                        </Box>
                        {user && (
                            <Box className="nav-links-container">
                                <Stack direction="row" spacing={3} alignItems="center" className="nav-stack">
                                    {renderNavLinks()}
                                    {renderUserMenu()}
                                </Stack>
                            </Box>
                        )}
                        {!user && (
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/login"
                                className="large-text mt-medium"
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box className="flex-row space-between align-center full-width">
                        <Link to="/" className="header-link">
                            <Typography
                                variant="h4"
                                component="div"
                                className="header-title large-text bold-text"
                            >
                                Homeward Bownd 🐾
                            </Typography>
                        </Link>
                        <Stack direction="row" spacing={3} alignItems="center">
                            {user ? (
                                <>
                                    {renderNavLinks()}
                                    {renderUserMenu()}
                                </>
                            ) : (
                                <Button 
                                    color="inherit" 
                                    component={Link} 
                                    to="/login"
                                    className="large-text"
                                >
                                    Login
                                </Button>
                            )}
                        </Stack>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}; 