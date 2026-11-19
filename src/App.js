import React, { useMemo, useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HowItWorksPage from './components/HowItWorksPage';
import AboutUsPage from './components/AboutUsPage';
import EvidenceUploadPage from './components/EvidenceUploadPage';
import { store, persistor } from './store';
import baseTheme from './styles/theme';
import api from './services/api';

const readEvidenceTokenFromLocation = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('evidence_token');
    if (fromQuery) return fromQuery;
    const pathMatch = window.location.pathname.match(/\/evidence\/([^/]+)/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
  } catch {
    return null;
  }
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [evidenceToken, setEvidenceToken] = useState(() => readEvidenceTokenFromLocation());

  useEffect(() => {
    if (evidenceToken) {
      setCurrentPage('evidence');
      return;
    }

    // Perform background health check on agent and main backend services when web app loads
    api.performBackgroundHealthCheck().catch((err) => {
      console.warn('[App] Background health check error:', err);
    });

    const storedUser = api.utils.getStoredUserData();
    if (storedUser?.user_id && !storedUser?.isGuest) {
      setUser(storedUser);
      setCurrentPage('chat');
      return;
    }
    // Restore guest session if they refreshed mid-chat
    try {
      const guest = JSON.parse(sessionStorage.getItem('wakilibot_guest') || 'null');
      const resumeGuest = sessionStorage.getItem('wakilibot_resume_guest') === '1';
      if (resumeGuest && guest?.isGuest) {
        setUser(guest);
        setCurrentPage('chat');
      }
    } catch {
      /* ignore */
    }
  }, [evidenceToken]);

  const theme = useMemo(() => baseTheme, []);

  const enterChat = (userData) => {
    setUser(userData);
    setCurrentPage('chat');
    if (userData?.isGuest) {
      sessionStorage.setItem('wakilibot_resume_guest', '1');
    } else {
      sessionStorage.removeItem('wakilibot_resume_guest');
      api.utils.clearGuestUser?.();
    }
  };

  const handleLogin = (userData) => enterChat(userData);

  const handleSignup = (userData) => enterChat(userData);

  const handleContinueAsGuest = () => {
    const guest = api.utils.ensureGuestUser();
    enterChat(guest);
  };

  const handleLogout = () => {
    api.utils.clearStoredUserData();
    api.utils.clearUserSession();
    api.utils.clearConversation();
    api.utils.clearGuestUser?.();
    sessionStorage.removeItem('wakilibot_resume_guest');
    setUser(null);
    setCurrentPage('landing');
  };

  const handleShowLogin = () => setCurrentPage('login');
  const handleShowSignup = () => setCurrentPage('signup');
  const handleBackToLanding = () => setCurrentPage('landing');
  const handleHome = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleShowHowItWorks = () => setCurrentPage('how-it-works');
  const handleShowAboutUs = () => setCurrentPage('about-us');

  const leaveEvidencePage = () => {
    setEvidenceToken(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('evidence_token');
    window.history.replaceState({}, '', url.pathname === '/evidence' ? '/' : url.pathname + url.search);
    setCurrentPage('landing');
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {currentPage === 'evidence' && evidenceToken && (
            <EvidenceUploadPage token={evidenceToken} onDone={leaveEvidencePage} />
          )}
          {currentPage === 'landing' && (
            <LandingPage
              onHome={handleHome}
              onLogin={handleShowLogin}
              onSignup={handleShowSignup}
              onStartChat={handleContinueAsGuest}
              onHowItWorks={handleShowHowItWorks}
              onAboutUs={handleShowAboutUs}
            />
          )}
          {currentPage === 'login' && (
            <LoginPage
              onLogin={handleLogin}
              onBack={handleBackToLanding}
              onSwitchToSignup={handleShowSignup}
              onContinueAsGuest={handleContinueAsGuest}
            />
          )}
          {currentPage === 'signup' && (
            <SignupPage
              onSignup={handleSignup}
              onBack={handleBackToLanding}
              onSwitchToLogin={handleShowLogin}
              onContinueAsGuest={handleContinueAsGuest}
            />
          )}
          {currentPage === 'chat' && (
            <ChatInterface
              user={user}
              onLogout={handleLogout}
              onLogin={handleShowLogin}
              onSignup={handleShowSignup}
            />
          )}
          {currentPage === 'how-it-works' && (
            <HowItWorksPage
              onBack={handleBackToLanding}
              onLogin={handleShowLogin}
              onSignup={handleShowSignup}
              onStartChat={handleContinueAsGuest}
              onAboutUs={handleShowAboutUs}
            />
          )}
          {currentPage === 'about-us' && (
            <AboutUsPage
              onBack={handleBackToLanding}
              onLogin={handleShowLogin}
              onSignup={handleShowSignup}
              onStartChat={handleContinueAsGuest}
              onHowItWorks={handleShowHowItWorks}
            />
          )}
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
