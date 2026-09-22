import axios from 'axios';
import { store } from '../store';

const API_BASE_URL = process.env.REACT_APP_AGENT_API_URL || 'https://wakilibot-agent.onrender.com';
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'https://wakilibot-main.onrender.com';

// Get current language from Redux store
const getCurrentLanguageFromStore = () => {
  try {
    const state = store.getState();
    const language = state.language?.selectedLanguage || 'en';
    console.log('🌍 [API DEBUG] getCurrentLanguageFromStore() returned:', language);
    return language;
  } catch (error) {
    console.warn('🌍 [API DEBUG] Error accessing Redux store:', error);
    return getCurrentLanguageFallback();
  }
};

// Fallback language getter (should use Redux store when available)
const getCurrentLanguageFallback = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      const language = localStorage.getItem('wakilibot_language') || 'en';
      console.log('🌍 [API DEBUG] getCurrentLanguageFallback() returned:', language);
      return language;
    }
  } catch (error) {
    console.warn('🌍 [API DEBUG] Error accessing localStorage:', error);
  }
  console.log('🌍 [API DEBUG] getCurrentLanguageFallback() fallback to: en');
  return 'en';
};

// Generate a unique user ID for this session
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Store user ID in session storage for persistence
const getUserId = () => {
  let userId = sessionStorage.getItem('ctdru_user_id');
  if (!userId) {
    userId = generateUserId();
    sessionStorage.setItem('ctdru_user_id', userId);
  }
  return userId;
};

// Store conversation ID in session storage for persistence
const getConversationId = () => {
  return sessionStorage.getItem('ctdru_conversation_id');
};

const setConversationId = (conversationId) => {
  if (conversationId) {
    sessionStorage.setItem('ctdru_conversation_id', conversationId);
  }
};

const clearConversationId = () => {
  sessionStorage.removeItem('ctdru_conversation_id');
};

// Get the appropriate user ID (authenticated user from localStorage or session user)
const getAppropriateUserId = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('wakilibot_user'));
    if (storedUser && storedUser.user_id) {
      console.log('Using authenticated user ID:', storedUser.user_id);
      return storedUser.user_id;
    }
  } catch (error) {
    console.warn('Could not parse stored user data:', error);
  }
  
  const sessionUserId = getUserId();
  console.log('Using session user ID:', sessionUserId);
  return sessionUserId;
};

const api = {
  // Send text message to the agent (Main conversation endpoint)
  sendMessage: async (message, conversationId = null, language = null, onStream = null) => {
    console.log('🌍 [API DEBUG] sendMessage called with:');
    console.log('   - message:', message);
    console.log('   - conversationId:', conversationId);
    console.log('   - language parameter:', language);
    console.log('   - localStorage language:', localStorage.getItem('wakilibot_language'));
    
    const formData = new FormData();
    formData.append('query', message);
    
    // Use authenticated user ID from localStorage if available, otherwise fallback to session user ID
    const userId = getAppropriateUserId();
    formData.append('user_id', userId);
    
    // Get current language from provided parameter or Redux store
    const currentLanguage = language || getCurrentLanguageFromStore();
    console.log('🌍 [API DEBUG] sendMessage - Final language to use:', currentLanguage);
    console.log('🌍 [API DEBUG] sendMessage - localStorage value:', localStorage.getItem('wakilibot_language'));
    formData.append('language', currentLanguage);
    
    // Use stored conversation ID if not provided
    const currentConversationId = conversationId || getConversationId();
    if (currentConversationId) {
      formData.append('conversation_id', currentConversationId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/conversations`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store conversation ID if returned
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Send streaming message (simulated streaming for now)
  sendMessageStream: async (message, conversationId = null, language = null, onChunk = null) => {
    console.log('🌍 [API DEBUG] sendMessageStream called with:');
    console.log('   - message:', message);
    console.log('   - conversationId:', conversationId);
    console.log('   - language parameter:', language);
    console.log('   - localStorage language:', localStorage.getItem('wakilibot_language'));
    
    const formData = new FormData();
    formData.append('query', message);
    
    // Use authenticated user ID from localStorage if available, otherwise fallback to session user ID
    const userId = getAppropriateUserId();
    formData.append('user_id', userId);
    
    // Get current language from provided parameter or Redux store
    const currentLanguage = language || getCurrentLanguageFromStore();
    console.log('🌍 [API DEBUG] sendMessageStream - Final language to use:', currentLanguage);
    console.log('🌍 [API DEBUG] sendMessageStream - localStorage value:', localStorage.getItem('wakilibot_language'));
    formData.append('language', currentLanguage);
    
    // Use stored conversation ID if not provided
    const currentConversationId = conversationId || getConversationId();
    if (currentConversationId) {
      formData.append('conversation_id', currentConversationId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/conversations`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streaming API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store conversation ID if returned
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Simulate character-by-character streaming like ChatGPT
      if (onChunk && data.answer) {
        const fullText = data.answer;
        let currentText = '';
        
        for (let i = 0; i < fullText.length; i++) {
          currentText += fullText[i];
          const isComplete = i === fullText.length - 1;
          onChunk(currentText, isComplete, data);
          
          // Variable delay for natural typing effect
          let delay = 30; // Base delay
          
          // Faster for spaces
          if (fullText[i] === ' ') {
            delay = 20;
          }
          // Slower for punctuation
          else if (/[.!?]/.test(fullText[i])) {
            delay = 200;
          }
          // Medium for commas
          else if (fullText[i] === ',') {
            delay = 100;
          }
          // Faster for common characters
          else if (/[aeiou]/.test(fullText[i].toLowerCase())) {
            delay = 25;
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return data;
    } catch (error) {
      console.error('Error sending streaming message:', error);
      throw error;
    }
  },

  // Get user session information
  getUserSession: async (userId = null) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sessions/${userId || getUserId()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting user session:', error);
      throw error;
    }
  },

  // Get system health status
  getHealthStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error getting health status:', error);
      throw error;
    }
  },

  // Get service information
  getServiceInfo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting service info:', error);
      throw error;
    }
  },

  // Get user conversations
  getUserConversations: async (userId = null, limit = 50) => {
    try {
      const targetUserId = userId || getAppropriateUserId();
      const response = await axios.get(`${API_BASE_URL}/agents/conversations/${targetUserId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Get conversation history
  getConversationHistory: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents/conversations/${conversationId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  },

  // Send audio file for voice chat processing
  sendVoiceMessage: async (audioBlob, language = null) => {
    try {
      const userId = getAppropriateUserId();
      const conversationId = getConversationId();
      
      // Get current language from provided parameter or fallback
      const currentLanguage = language || getCurrentLanguageFallback();
      console.log('🎤 [API DEBUG] sendVoiceMessage - Using language:', currentLanguage);
      console.log('🎤 [API DEBUG] sendVoiceMessage - localStorage value:', localStorage.getItem('wakilibot_language'));
      
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'voice_message.webm');
      formData.append('language', currentLanguage);
      formData.append('user_id', userId);
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }

      console.log('🎤 [API DEBUG] Sending voice message to API...');
      console.log('🎤 [API DEBUG] Audio blob size:', audioBlob.size);
      console.log('🎤 [API DEBUG] Language:', currentLanguage);
      console.log('🎤 [API DEBUG] User ID:', userId);

      const response = await axios.post(
        `${API_BASE_URL}/voicechat`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for voice processing
        }
      );
      
      console.log('🎤 [API DEBUG] Voice message response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('🎤 [API DEBUG] Error sending voice message:', error);
      throw error;
    }
  },

  // Process voice input (legacy method - kept for backward compatibility)
  processVoice: async (audioBlob) => {
    const formData = new FormData();
    
    // Use authenticated user ID from localStorage if available, otherwise fallback to session user ID
    const userId = getAppropriateUserId();
    formData.append('user_id', userId);
    formData.append('audio_file', audioBlob, 'recording.wav');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/process_voice`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing voice:', error);
      throw error;
    }
  },

  // Submit complaint to Backend API
  submitComplaint: async (complaintData) => {
    try {
      console.log('API: Submitting complaint to Backend:', complaintData);
      console.log('API: Backend URL:', `${BACKEND_API_URL}/complaints`);
      
      const response = await axios.post(`${BACKEND_API_URL}/complaints`, complaintData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      console.log('API: Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error submitting complaint:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      console.error('API: Error headers:', error.response?.headers);
      throw error;
    }
  },

  // Get complaint status from Backend API
  getComplaintStatus: async (complaintId) => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/complaints/${complaintId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting complaint status:', error);
      throw error;
    }
  },

  // Submit incident to Backend API
  submitIncident: async (incidentData) => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/incidents`, incidentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting incident:', error);
      throw error;
    }
  },

  // Get incident status from Backend API
  getIncidentStatus: async (incidentId) => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/incidents/${incidentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting incident status:', error);
      throw error;
    }
  },

  // Authentication endpoints
  registerUser: async (userData) => {
    try {
      console.log('API: Registering user:', userData);
      const response = await axios.post(`${BACKEND_API_URL}/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      console.log('API: Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error registering user:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  loginUser: async (loginData) => {
    try {
      console.log('API: Logging in user:', loginData);
      const response = await axios.post(`${BACKEND_API_URL}/auth/login`, loginData, {
          headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      console.log('API: Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error logging in user:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    try {
      console.log('API: Getting user profile:', userId);
      const response = await axios.get(`${BACKEND_API_URL}/auth/user/${userId}`, {
        timeout: 10000, // 10 second timeout
      });
      
      console.log('API: User profile retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error getting user profile:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  // Document Management endpoints (Backend service)
  // Get all documents with pagination and filtering
  getDocuments: async (params = {}) => {
    try {
      const {
        page = 1,
        page_size = 20,
        category = null,
        search = null,
        sort_by = 'upload_date',
        sort_order = 'desc'
      } = params;

      let url = `${BACKEND_API_URL}/documents?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_order=${sort_order}`;
      
      if (category && category !== 'all') {
        url += `&category=${category}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log('API: Fetching documents from:', url);
      const response = await axios.get(url, {
        timeout: 10000,
      });
      
      console.log('API: Documents fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching documents:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId) => {
    try {
      console.log('API: Fetching document:', documentId);
      const response = await axios.get(`${BACKEND_API_URL}/documents/${documentId}`, {
        timeout: 10000,
      });
      
      console.log('API: Document fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching document:', error);
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (file, documentData) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', documentData.title);
      formData.append('description', documentData.description);
      formData.append('category', documentData.category);
      formData.append('tags', documentData.tags || '');
      formData.append('user_id', getAppropriateUserId());

      console.log('API: Uploading document:', documentData.title);
      const response = await axios.post(`${BACKEND_API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file upload
      });
      
      console.log('API: Document uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error uploading document:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  // Update document
  updateDocument: async (documentId, updateData) => {
    try {
      console.log('API: Updating document:', documentId, updateData);
      const response = await axios.put(`${BACKEND_API_URL}/documents/${documentId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('API: Document updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      console.log('API: Deleting document:', documentId);
      const response = await axios.delete(`${BACKEND_API_URL}/documents/${documentId}`, {
        timeout: 10000,
      });
      
      console.log('API: Document deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error deleting document:', error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId) => {
    try {
      console.log('API: Downloading document:', documentId);
      const response = await axios.get(`${BACKEND_API_URL}/documents/download/${documentId}`, {
        responseType: 'blob',
        timeout: 30000, // 30 seconds for file download
      });
      
      console.log('API: Document downloaded successfully');
      return response.data;
    } catch (error) {
      console.error('API: Error downloading document:', error);
      throw error;
    }
  },

  // Get document statistics
  getDocumentStats: async () => {
    try {
      console.log('API: Fetching document statistics');
      const response = await axios.get(`${BACKEND_API_URL}/documents/stats/overview`, {
        timeout: 10000,
      });
      
      console.log('API: Document statistics fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching document statistics:', error);
      throw error;
    }
  },

  // Password Reset endpoints (Backend service)
  resetPassword: async (email, newPassword, confirmPassword) => {
    try {
      console.log('API: Resetting password for:', email);
      const response = await axios.post(`${BACKEND_API_URL}/auth/reset-password`, {
        email: email,
        new_password: newPassword,
        confirm_password: confirmPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('API: Password reset successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error resetting password:', error);
      throw error;
    }
  },

  changePassword: async (email, currentPassword, newPassword) => {
    try {
      console.log('API: Changing password for:', email);
      const response = await axios.post(`${BACKEND_API_URL}/auth/change-password`, {
        email: email,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('API: Password changed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error changing password:', error);
      throw error;
    }
  },

  // Utility functions
  utils: {
    // Get current user ID (authenticated user from localStorage or session user)
    getCurrentUserId: () => getAppropriateUserId(),
    
    // Get session user ID (legacy function)
    getSessionUserId: () => getUserId(),
    
    // Get current conversation ID
    getCurrentConversationId: () => getConversationId(),
    
    // Get current language with debug info (Redux method)
    getCurrentLanguage: () => {
      const lang = getCurrentLanguageFromStore();
      console.log('🌍 [API UTILS] getCurrentLanguage() called, returning:', lang);
      return lang;
    },
    
    // Generate new user ID
    generateNewUserId: () => {
      const newUserId = generateUserId();
      sessionStorage.setItem('ctdru_user_id', newUserId);
      return newUserId;
    },

    // Clear user session
    clearUserSession: () => {
      sessionStorage.removeItem('ctdru_user_id');
    },

    // Clear conversation
    clearConversation: () => {
      clearConversationId();
    },

    // Start new conversation
    startNewConversation: () => {
      clearConversationId();
      return getUserId();
    },

    // Local Storage utilities for persistent login
    // Store authenticated user data
    storeUserData: (userData) => {
      try {
        localStorage.setItem('wakilibot_user', JSON.stringify(userData));
        console.log('User data stored in localStorage:', userData);
      } catch (error) {
        console.error('Error storing user data:', error);
      }
    },

    // Get stored user data
    getStoredUserData: () => {
      try {
        const userData = localStorage.getItem('wakilibot_user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
      }
    },

    // Clear stored user data (logout)
    clearStoredUserData: () => {
      try {
        localStorage.removeItem('wakilibot_user');
        console.log('User data cleared from localStorage');
      } catch (error) {
        console.error('Error clearing user data:', error);
      }
    },

    // Check if user is logged in
    isUserLoggedIn: () => {
      const userData = api.utils.getStoredUserData();
      return userData && userData.user_id;
    },

    // Get current authenticated user
    getCurrentUser: () => {
      return api.utils.getStoredUserData();
    },

    // Format response time
    formatResponseTime: (timeInSeconds) => {
      if (timeInSeconds < 1) {
        return `${(timeInSeconds * 1000).toFixed(0)}ms`;
      }
      return `${timeInSeconds.toFixed(2)}s`;
    },

    // Check if response is cached
    isResponseCached: (response) => {
      return response?.performance?.cached === true;
    },

    // Get task status
    getTaskStatus: (response) => {
      return response?.task_status || 'unknown';
    },

    // Get intent from response
    getIntent: (response) => {
      return response?.intent || 'unknown';
    },

    // Clean text for TTS generation
    cleanTextForTTS: (text) => {
      if (!text || typeof text !== 'string') {
        return '';
      }

      let cleaned = text;

      // Remove markdown formatting
      cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
      cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Italic
      cleaned = cleaned.replace(/`(.*?)`/g, '$1'); // Code
      cleaned = cleaned.replace(/```[\s\S]*?```/g, ''); // Code blocks
      cleaned = cleaned.replace(/#{1,6}\s*/g, ''); // Headers

      // Remove URLs
      cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
      cleaned = cleaned.replace(/www\.[^\s]+/g, '');

      // Remove email addresses
      cleaned = cleaned.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '');

      // Remove phone numbers (various formats)
      cleaned = cleaned.replace(/\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, '');

      // Remove special symbols and keep only letters, numbers, spaces, and basic punctuation
      cleaned = cleaned.replace(/[^\w\s.,!?;:'"()-]/g, ' ');

      // Remove multiple consecutive spaces
      cleaned = cleaned.replace(/\s+/g, ' ');

      // Remove leading/trailing spaces and punctuation
      cleaned = cleaned.trim();

      // Remove common problematic patterns
      cleaned = cleaned.replace(/[{}[\]\\|`~]/g, '');
      cleaned = cleaned.replace(/[<>]/g, '');

      // Remove emoji and special Unicode characters
      cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

      // Clean up any remaining artifacts
      cleaned = cleaned.replace(/[^\w\s.,!?;:'"()-]/g, '');
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      // Ensure we don't have empty result
      if (!cleaned || cleaned.length === 0) {
        cleaned = 'Text converted to speech';
      }

      console.log('🔊 [TTS DEBUG] Original text:', text.substring(0, 100) + '...');
      console.log('🔊 [TTS DEBUG] Cleaned text:', cleaned.substring(0, 100) + '...');

      return cleaned;
    }
  }
};

// TTS (Text-to-Speech) functionality
const TTS_API_URL = process.env.REACT_APP_TTS_API_URL || 'https://tts.atekervoices.com';
// PCM format the streaming endpoint returns (see /openapi.json: "raw PCM 16-bit 16kHz")
const TTS_SAMPLE_RATE = 16000;

// Add TTS function to the main api object
// Returns raw PCM audio bytes (not a file URL) - see components/MessageBubble.jsx
// for how it's decoded and played via the Web Audio API.
api.generateTTS = async (text) => {
  try {
    // Validate text input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text is required for TTS generation');
    }

    // Clean text for TTS - remove symbols and unknown characters
    const cleanedText = api.utils.cleanTextForTTS(text);

    // Limit text length to prevent API issues
    const maxLength = 5000;
    const processedText = cleanedText.length > maxLength ? cleanedText.substring(0, maxLength) + '...' : cleanedText;

    console.log('🔊 [TTS DEBUG] Generating TTS for text:', processedText.substring(0, 50) + '...');

    const response = await fetch(`${TTS_API_URL}/v1/audio/speech/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: processedText }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`TTS service error: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
    }

    const pcm = await response.arrayBuffer();
    console.log('🔊 [TTS DEBUG] TTS PCM bytes received:', pcm.byteLength);

    if (!pcm || pcm.byteLength === 0) {
      throw new Error('Invalid TTS response: empty audio data');
    }

    return { pcm, sampleRate: TTS_SAMPLE_RATE };
  } catch (error) {
    console.error('🔊 [TTS DEBUG] Error generating TTS:', error);
    throw error instanceof Error ? error : new Error(`TTS generation failed: ${error}`);
  }
};

export default api;