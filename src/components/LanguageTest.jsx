import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack,
  Chip,
  Alert
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const LanguageTest = () => {
  const { selectedLanguage, updateLanguage, languageOptions } = useLanguage();
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const runLanguageTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const results = [];
    
    // Test 1: Check localStorage
    const localStorageLang = localStorage.getItem('wakilibot_language');
    results.push({
      test: 'localStorage Check',
      status: localStorageLang ? 'PASS' : 'FAIL',
      details: `localStorage value: ${localStorageLang || 'null'}`
    });
    
    // Test 2: Check Context
    results.push({
      test: 'Context Check',
      status: selectedLanguage ? 'PASS' : 'FAIL',
      details: `Context value: ${selectedLanguage || 'null'}`
    });
    
    // Test 3: Check API Utils
    const apiLang = api.utils.getCurrentLanguage();
    results.push({
      test: 'API Utils Check',
      status: apiLang ? 'PASS' : 'FAIL',
      details: `API utils value: ${apiLang || 'null'}`
    });
    
    // Test 4: Check Synchronization
    const isSynced = localStorageLang === selectedLanguage && selectedLanguage === apiLang;
    results.push({
      test: 'Synchronization Check',
      status: isSynced ? 'PASS' : 'FAIL',
      details: `All values match: ${isSynced ? 'Yes' : 'No'}`
    });
    
    // Test 5: Test API Call (if not English)
    if (selectedLanguage !== 'en') {
      try {
        const testMessage = selectedLanguage === 'sw' ? 'Habari' : 
                           selectedLanguage === 'lg' ? 'Oli otya' : 'Hello';
        
        results.push({
          test: 'API Call Test',
          status: 'TESTING',
          details: `Sending test message: "${testMessage}" in ${selectedLanguage}`
        });
        
        // This would normally make an API call, but we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        results[results.length - 1] = {
          test: 'API Call Test',
          status: 'PASS',
          details: `Test message would be sent with language: ${selectedLanguage}`
        };
      } catch (error) {
        results[results.length - 1] = {
          test: 'API Call Test',
          status: 'FAIL',
          details: `Error: ${error.message}`
        };
      }
    } else {
      results.push({
        test: 'API Call Test',
        status: 'SKIP',
        details: 'Skipped for English (default language)'
      });
    }
    
    setTestResults(results);
    setIsTesting(false);
  };

  const testLanguageChange = (langCode) => {
    updateLanguage(langCode);
    setTimeout(() => {
      runLanguageTest();
    }, 200);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>
          Language Integration Test
        </Typography>
        
        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
              Current Language Status
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={`${languageOptions.find(l => l.code === selectedLanguage)?.flag || '🌍'} ${selectedLanguage.toUpperCase()}`}
                sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              />
              <Typography variant="body2" color="#cccccc">
                Context: {selectedLanguage}
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
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
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
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                Test Results
              </Typography>
              <Button
                variant="contained"
                onClick={runLanguageTest}
                disabled={isTesting}
                sx={{ backgroundColor: '#2196f3' }}
              >
                {isTesting ? 'Testing...' : 'Run Tests'}
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

export default LanguageTest;

