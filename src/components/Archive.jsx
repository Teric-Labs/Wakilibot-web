import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import { tokens } from '../styles/theme';
import api from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'legislation', label: 'Legislation' },
  { id: 'regulations', label: 'Regulations' },
  { id: 'handbook', label: 'Handbooks' },
  { id: 'procedures', label: 'Procedures' },
];

const Archive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDocuments({
        page: 1,
        page_size: 24,
        category: selectedCategory === 'all' ? null : selectedCategory,
        search: searchTerm || null,
        sort_by: 'upload_date',
        sort_order: 'desc',
      });
      setDocuments(response.documents || []);
    } catch (err) {
      console.error(err);
      setError('Could not load documents. Try again shortly.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadDocuments, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory]);

  return (
    <Box>
      <Typography sx={{ color: tokens.muted, mb: 3, lineHeight: 1.6, maxWidth: 560 }}>
        Consumer-protection guides, forms, and reference documents.
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search documents"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: tokens.muted, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            onClick={() => setSelectedCategory(cat.id)}
            variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
            sx={{
              backgroundColor: selectedCategory === cat.id ? tokens.navy : 'transparent',
              color: selectedCategory === cat.id ? '#fff' : tokens.navy,
              borderColor: 'rgba(11,31,58,0.18)',
              fontWeight: 500,
            }}
          />
        ))}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && documents.length === 0 && (
        <Typography sx={{ color: tokens.muted, py: 4 }}>No documents found.</Typography>
      )}

      <Stack spacing={1.5}>
        {documents.map((doc) => (
          <Box
            key={doc.id || doc.document_id || doc.title}
            sx={{
              display: 'flex',
              gap: 1.75,
              alignItems: 'flex-start',
              p: 2,
              borderRadius: 2,
              border: '1px solid rgba(11,31,58,0.1)',
              backgroundColor: '#FFFFFF',
              '&:hover': { backgroundColor: tokens.paper },
            }}
          >
            <DescriptionIcon sx={{ color: tokens.navyMid, mt: 0.25 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, color: tokens.navy, mb: 0.35 }}>
                {doc.title || 'Untitled document'}
              </Typography>
              <Typography sx={{ color: tokens.muted, fontSize: '0.88rem', lineHeight: 1.5, mb: 1 }}>
                {doc.description || doc.category || 'Consumer protection document'}
              </Typography>
              {(doc.url || doc.file_url || doc.download_url) && (
                <Button
                  size="small"
                  href={doc.url || doc.file_url || doc.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: 'none', px: 0, fontWeight: 600 }}
                >
                  Open
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Archive;
