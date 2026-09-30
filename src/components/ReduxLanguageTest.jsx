import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectLanguage, 
  selectIsInitialized, 
  selectLanguageOptions, 
  selectCurrentLanguageInfo,
  setLanguage,
  resetLanguage 
} from '../store/slices/languageSlice';
import { store } from '../store';

const ReduxLanguageTest = () => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector(selectLanguage);
  const isInitialized = useSelector(selectIsInitialized);
  const languageOptions = useSelector(selectLanguageOptions);
  const currentLanguageInfo = useSelector(selectCurrentLanguageInfo);
  
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const runReduxTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const results = [];
    
    // Test 1: Check Redux state
    const reduxState = store.getState();
    results.push({
      test: 'Redux State Check',
      status: reduxState.language ? 'PASS' : 'FAIL',
      details: `Redux state available: ${reduxState.language ? 'Yes' : 'No'}`
    });
    
    // Test 2: Check selected language
    results.push({
      test: 'Selected Language Check',
      status: selectedLanguage ? 'PASS' : 'FAIL',
      details: `Selected language: ${selectedLanguage || 'null'}`
    });
    
    // Test 3: Check initialization
    results.push({
      test: 'Initialization Check',
      status: isInitialized ? 'PASS' : 'FAIL',
      details: `Is initialized: ${isInitialized ? 'Yes' : 'No'}`
    });
    
    // Test 4: Check language info
    results.push({
      test: 'Language Info Check',
      status: currentLanguageInfo ? 'PASS' : 'FAIL',
      details: `Language info: ${currentLanguageInfo?.name || 'null'} (${currentLanguageInfo?.code || 'null'})`
    });
    
    // Test 5: Check localStorage sync
    const localStorageLang = localStorage.getItem('wakilibot_language');
    const isSynced = selectedLanguage === localStorageLang;
    results.push({
      test: 'localStorage Sync Check',
      status: isSynced ? 'PASS' : 'FAIL',
      details: `Redux: ${selectedLanguage}, localStorage: ${localStorageLang}, Synced: ${isSynced ? 'Yes' : 'No'}`
    });
    
    // Test 6: Test API integration
    if (selectedLanguage !== 'en') {
      try {
        const testMessage = selectedLanguage === 'lg' ? 'Oli otya, nina okusaba obuyambi' : 
                           selectedLanguage === 'sw' ? 'Habari, nahitaji msaada' : 'Hello, I need help';
        
        results.push({
          test: 'API Integration Test',
          status: 'TESTING',
          details: `Testing with message: "${testMessage}" in ${selectedLanguage}`
        });
        
        const formData = new FormData();
        formData.append('query', testMessage);
        formData.append('user_id', 'redux_test_user');
        formData.append('language', selectedLanguage);
        
        const response = await fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          results[results.length - 1] = {
            test: 'API Integration Test',
            status: 'PASS',
            details: `API responded with language: ${selectedLanguage}, Answer: ${data.answer?.substring(0, 50)}...`
          };
        } else {
          results[results.length - 1] = {
            test: 'API Integration Test',
            status: 'FAIL',
            details: `API Error: ${response.status}`
          };
        }
      } catch (error) {
        results[results.length - 1] = {
          test: 'API Integration Test',
          status: 'FAIL',
          details: `Exception: ${error.message}`
        };
      }
    } else {
      results.push({
        test: 'API Integration Test',
        status: 'SKIP',
        details: 'Skipped for English (default language)'
      });
    }
    
    setTestResults(results);
    setIsTesting(false);
  };

  const testLanguageChange = (langCode) => {
    console.log('🧪 [REDUX TEST] Changing language to:', langCode);
    dispatch(setLanguage(langCode));
    setTimeout(() => {
      runReduxTest();
    }, 500);
  };

  const testReset = () => {
    console.log('🧪 [REDUX TEST] Resetting language to English');
    dispatch(resetLanguage());
    setTimeout(() => {
      runReduxTest();
    }, 500);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>
          Redux Language Management Test
        </Typography>
        
        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
              Current Redux State
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={`${currentLanguageInfo?.flag || '🌍'} ${selectedLanguage?.toUpperCase() || 'NONE'}`}
                  sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
                />
                <Typography variant="body2" color="#cccccc">
                  Selected: {selectedLanguage}
                </Typography>
                <Typography variant="body2" color="#cccccc">
                  Initialized: {isInitialized ? 'Yes' : 'No'}
                </Typography>
              </Stack>
              <Typography variant="body2" color="#cccccc">
                Language Info: {currentLanguageInfo?.name || 'Unknown'} ({currentLanguageInfo?.code || 'N/A'})
              </Typography>
              <Typography variant="body2" color="#cccccc">
                localStorage: {localStorage.getItem('wakilibot_language')}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
              Test Language Changes
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {languageOptions.slice(0, 4).map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? 'contained' : 'outlined'}
                  onClick={() => testLanguageChange(lang.code)}
                  sx={{
                    backgroundColor: selectedLanguage === lang.code ? '#4caf50' : 'transparent',
                    borderColor: '#333333',
                    color: selectedLanguage === lang.code ? '#ffffff' : '#cccccc',
                    '&:hover': {
                      backgroundColor: selectedLanguage === lang.code ? '#45a049' : '#222222'
                    }
                  }}
                >
                  {lang.flag} {lang.name}
                </Button>
              ))}
            </Stack>
            <Button
              variant="outlined"
              onClick={testReset}
              sx={{
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  borderColor: '#f44336'
                }
              }}
            >
              Reset to English
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                Redux Test Results
              </Typography>
              <Button
                variant="contained"
                onClick={runReduxTest}
                disabled={isTesting}
                sx={{ backgroundColor: '#2196f3' }}
              >
                {isTesting ? 'Testing...' : 'Run Redux Tests'}
              </Button>
            </Stack>

            {testResults.length > 0 && (
              <Stack spacing={1}>
                {testResults.map((result, index) => (
                  <Alert
                    key={index}
                    severity={
                      result.status === 'PASS' ? 'success' :
                      result.status === 'FAIL' ? 'error' :
                      result.status === 'TESTING' ? 'info' : 'warning'
                    }
                    sx={{
                      backgroundColor: result.status === 'PASS' ? 'rgba(76, 175, 80, 0.1)' :
                                     result.status === 'FAIL' ? 'rgba(244, 67, 54, 0.1)' :
                                     result.status === 'TESTING' ? 'rgba(33, 150, 243, 0.1)' :
                                     'rgba(255, 152, 0, 0.1)',
                      border: `1px solid ${
                        result.status === 'PASS' ? 'rgba(76, 175, 80, 0.3)' :
                        result.status === 'FAIL' ? 'rgba(244, 67, 54, 0.3)' :
                        result.status === 'TESTING' ? 'rgba(33, 150, 243, 0.3)' :
                        'rgba(255, 152, 0, 0.3)'
                      }`
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {result.test}: {result.status}
                    </Typography>
                    <Typography variant="body2" color="#cccccc">
                      {result.details}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ReduxLanguageTest;

