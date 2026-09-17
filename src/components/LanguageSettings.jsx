import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Button
} from '@mui/material';
import {
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Translate as TranslateIcon,
  BugReport as BugReportIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSettings = ({ onShowLanguageTest, onShowReduxTest }) => {
  const { selectedLanguage, updateLanguage, languageOptions, getCurrentLanguageInfo } = useLanguage();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    updateLanguage(newLanguage);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const testAPIIntegration = async () => {
    setIsTestingAPI(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing API integration with language:', selectedLanguage);
      
      const testMessage = selectedLanguage === 'lg' ? 'Oli otya, nina okusaba obuyambi' :
                         selectedLanguage === 'sw' ? 'Habari, nahitaji msaada' :
                         'Hello, I need help';
      
      const formData = new FormData();
      formData.append('query', testMessage);
      formData.append('user_id', 'test_user_language_settings');
      formData.append('language', selectedLanguage);
      
      console.log('📤 Sending test request with:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      const response = await fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response received:', data);
        
        setTestResult({
          success: true,
          message: data.answer?.substring(0, 200) + '...',
          intent: data.intent,
          taskStatus: data.task_status
        });
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        setTestResult({
          success: false,
          message: `API Error: ${response.status} - ${errorText}`
        });
      }
    } catch (error) {
      console.error('💥 Exception:', error);
      setTestResult({
        success: false,
        message: `Exception: ${error.message}`
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const currentLanguageInfo = getCurrentLanguageInfo();

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff', mb: 1 }}>
              Language Settings
            </Typography>
            <Typography variant="body2" color="#cccccc">
              Choose your preferred language for text and voice interactions
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Test API Integration">
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={testAPIIntegration}
                disabled={isTestingAPI}
                sx={{
                  color: '#4caf50',
                  borderColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderColor: '#4caf50'
                  }
                }}
              >
                {isTestingAPI ? 'Testing...' : 'Test API'}
              </Button>
            </Tooltip>
            <Stack direction="row" spacing={1}>
              {onShowLanguageTest && (
                <Tooltip title="Test Language Integration">
                  <IconButton
                    onClick={onShowLanguageTest}
                    sx={{
                      color: '#2196f3',
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <BugReportIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onShowReduxTest && (
                <Tooltip title="Test Redux Language Management">
                  <IconButton
                    onClick={onShowReduxTest}
                    sx={{
                      color: '#ff9800',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <BugReportIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Success Alert */}
        {showSuccess && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            onClose={() => setShowSuccess(false)}
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              color: '#4caf50'
            }}
          >
            <AlertTitle>Language Updated</AlertTitle>
            Your language preference has been saved and will be used for all interactions.
          </Alert>
        )}

        {/* API Test Result */}
        {testResult && (
          <Alert 
            severity={testResult.success ? "success" : "error"}
            icon={testResult.success ? <CheckCircleIcon /> : <InfoIcon />}
            onClose={() => setTestResult(null)}
            sx={{
              backgroundColor: testResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              border: `1px solid ${testResult.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
              color: testResult.success ? '#4caf50' : '#f44336'
            }}
          >
            <AlertTitle>{testResult.success ? 'API Test Successful' : 'API Test Failed'}</AlertTitle>
            {testResult.success ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Response: {testResult.message}
                </Typography>
                <Typography variant="caption" color="inherit">
                  Intent: {testResult.intent} | Status: {testResult.taskStatus}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2">
                {testResult.message}
              </Typography>
            )}
          </Alert>
        )}

        {/* Current Language Display */}
        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <LanguageIcon sx={{ color: '#4caf50', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 500 }}>
                  Current Language
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="h4">{currentLanguageInfo.flag}</Typography>
                  <Typography variant="body1" color="#cccccc">
                    {currentLanguageInfo.name}
                  </Typography>
                  <Chip 
                    label={currentLanguageInfo.code.toUpperCase()} 
                    size="small" 
                    sx={{ 
                      backgroundColor: '#333333', 
                      color: '#cccccc',
                      fontWeight: 600
                    }} 
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Language Selection */}
        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 500, mb: 2 }}>
              Select Language
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel 
                sx={{ 
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#ffffff' }
                }}
              >
                Choose Language
              </InputLabel>
              <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                label="Choose Language"
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#333333',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#444444',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffffff',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#cccccc',
                  }
                }}
              >
                {languageOptions.map((language) => (
                  <MenuItem 
                    key={language.code} 
                    value={language.code}
                    sx={{
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: '#222222'
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#333333',
                        '&:hover': {
                          backgroundColor: '#333333'
                        }
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                      <Typography variant="h5">{language.flag}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {language.name}
                        </Typography>
                        <Typography variant="caption" color="#888888">
                          {language.code.toUpperCase()}
                        </Typography>
                      </Box>
                      {language.code === selectedLanguage && (
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <InfoIcon sx={{ color: '#2196f3', fontSize: 24, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 500, mb: 1 }}>
                  How Language Selection Works
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="#cccccc">
                    • <strong>Text Messages:</strong> Your messages will be translated to English for processing, then the response will be translated back to your selected language.
                  </Typography>
                  <Typography variant="body2" color="#cccccc">
                    • <strong>Voice Messages:</strong> Audio will be transcribed in your selected language, processed, and the response will be in your preferred language.
                  </Typography>
                  <Typography variant="body2" color="#cccccc">
                    • <strong>Persistence:</strong> Your language preference is saved and will be remembered across sessions.
                  </Typography>
                  <Typography variant="body2" color="#cccccc">
                    • <strong>Fallback:</strong> If your language isn't supported for translation, responses will be in English.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Supported Languages Info */}
        <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TranslateIcon sx={{ color: '#ff9800', fontSize: 24, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 500, mb: 1 }}>
                  Translation Support
                </Typography>
                <Typography variant="body2" color="#cccccc" sx={{ mb: 2 }}>
                  Full translation support (input and output):
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {languageOptions.filter(lang => ['en', 'sw', 'lg', 'nyn', 'xog'].includes(lang.code)).map((language) => (
                    <Chip
                      key={language.code}
                      label={`${language.flag} ${language.name}`}
                      size="small"
                      sx={{
                        backgroundColor: '#4caf50',
                        color: '#ffffff',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="#cccccc" sx={{ mt: 2 }}>
                  Limited support (fallback to English):
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {languageOptions.filter(lang => ['ac', 'at'].includes(lang.code)).map((language) => (
                    <Chip
                      key={language.code}
                      label={`${language.flag} ${language.name}`}
                      size="small"
                      sx={{
                        backgroundColor: '#ff9800',
                        color: '#ffffff',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default LanguageSettings;
