import React, { useState, useMemo, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import FeaturesPage from './components/FeaturesPage';
import HowItWorksPage from './components/HowItWorksPage';
import AboutUsPage from './components/AboutUsPage';
import ConversationDebugger from './components/ConversationDebugger';
import { store, persistor } from './store';
import baseTheme from './styles/theme';
import api from './services/api';

const App = () => {
  // Set dark mode by default for black background
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'signup', 'features', 'how-it-works', 'about-us', 'chat', or 'debug'
  const [user, setUser] = useState(null);

  // Check for persistent login on app load
  useEffect(() => {
    const checkPersistentLogin = () => {
      const storedUser = api.utils.getStoredUserData();
      if (storedUser && storedUser.user_id) {
        console.log('Found stored user, logging in automatically:', storedUser);
        setUser(storedUser);
        setCurrentPage('chat');
      }
    };

    checkPersistentLogin();
  }, []);

  // Create a dark theme with black background and white text
  const theme = useMemo(() => {
    const updatedTheme = createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: 'dark',
        background: {
          default: '#000000', // Pure black background
          paper: '#111111',   // Slightly lighter black for cards
        },
        text: {
          primary: '#ffffff',   // Pure white text
          secondary: '#cccccc', // Light gray for secondary text
        },
        divider: '#333333',    // Dark gray for dividers
        primary: {
          main: '#ffffff',     // White primary color
        },
        secondary: {
          main: '#cccccc',     // Light gray secondary
        },
      },
    });
    return updatedTheme;
  }, [darkMode]);

  const handleLogin = (userData) => {
    // User data is already stored in localStorage by the login component
    console.log('Login successful:', userData);
    setUser(userData);
    setCurrentPage('chat');
  };

  const handleSignup = (userData) => {
    // User data is already stored in localStorage by the signup component
    console.log('Signup successful:', userData);
    setUser(userData);
    setCurrentPage('chat');
  };

  const handleLogout = () => {
    console.log('Logging out user');
    // Clear stored user data
    api.utils.clearStoredUserData();
    // Clear session data
    api.utils.clearUserSession();
    api.utils.clearConversation();
    // Reset app state
    setUser(null);
    setCurrentPage('landing');
  };

  const handleShowLogin = () => {
    setCurrentPage('login');
  };

  const handleShowSignup = () => {
    setCurrentPage('signup');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleHome = () => {
    // For landing page, just scroll to top or refresh
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowDebug = () => {
    setCurrentPage('debug');
  };

  const handleShowFeatures = () => {
    setCurrentPage('features');
  };

  const handleShowHowItWorks = () => {
    setCurrentPage('how-it-works');
  };

  const handleShowAboutUs = () => {
    setCurrentPage('about-us');
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {currentPage === 'landing' && (
          <LandingPage 
            onHome={handleHome}
            onLogin={handleShowLogin}
            onSignup={handleShowSignup}
            onFeatures={handleShowFeatures}
            onHowItWorks={handleShowHowItWorks}
            onAboutUs={handleShowAboutUs}
            onDebug={handleShowDebug}
          />
        )}
        {currentPage === 'login' && (
          <LoginPage 
            onLogin={handleLogin}
            onBack={handleBackToLanding}
            onSwitchToSignup={handleShowSignup}
            onFeatures={handleShowFeatures}
            onHowItWorks={handleShowHowItWorks}
            onAboutUs={handleShowAboutUs}
          />
        )}
        {currentPage === 'signup' && (
          <SignupPage 
            onSignup={handleSignup}
            onBack={handleBackToLanding}
            onSwitchToLogin={handleShowLogin}
            onFeatures={handleShowFeatures}
            onHowItWorks={handleShowHowItWorks}
            onAboutUs={handleShowAboutUs}
          />
        )}
        {currentPage === 'chat' && (
          <ChatInterface 
            user={user}
            onLogout={handleLogout}
          />
        )}
                {currentPage === 'features' && (
                  <FeaturesPage 
                    onBack={handleBackToLanding}
                    onLogin={handleShowLogin}
                    onSignup={handleShowSignup}
                    onHowItWorks={handleShowHowItWorks}
                    onAboutUs={handleShowAboutUs}
                  />
                )}
        {currentPage === 'how-it-works' && (
          <HowItWorksPage 
            onBack={handleBackToLanding}
            onLogin={handleShowLogin}
            onSignup={handleShowSignup}
            onFeatures={handleShowFeatures}
            onAboutUs={handleShowAboutUs}
          />
        )}
        {currentPage === 'about-us' && (
          <AboutUsPage 
            onBack={handleBackToLanding}
            onLogin={handleShowLogin}
            onSignup={handleShowSignup}
            onFeatures={handleShowFeatures}
            onHowItWorks={handleShowHowItWorks}
          />
        )}
        {currentPage === 'debug' && (
          <ConversationDebugger />
        )}
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;