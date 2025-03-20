import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
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
  const basename = process.env.NODE_ENV === 'production' ? '/homeward-bownd' : '/';

  return (
    <Router basename={basename}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <FavoritesProvider>
            <div className="App">
              <Header />
              <ScrollToTop />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/search" element={<Search />} />
                  <Route 
                    path="/favorites" 
                    element={
                      <ProtectedRoute>
                        <Favorites />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </main>
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
