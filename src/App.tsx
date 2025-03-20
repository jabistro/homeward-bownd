import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Header } from './components/Header';
import { Welcome } from './components/Welcome';
import { Search } from './components/Search';
import { Favorites } from './components/Favorites';
import { ScrollToTop } from './components/ScrollToTop';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import './stylesheets/App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box className="app-container">
      <ScrollToTop />
      <Header />
      <Box component="main" className="main-content">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/search" replace /> : <Login />} 
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
