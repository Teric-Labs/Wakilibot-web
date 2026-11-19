import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../services/api';
import { tokens } from '../styles/theme';

const EvidenceUploadPage = ({ token, onDone }) => {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileName, setFileName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getEvidenceMeta(token);
        if (!cancelled) setMeta(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'This evidence link is invalid or has expired.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    setFileName(file.name);
    try {
      const result = await api.uploadEvidenceByToken(token, file, { channel: 'web_link' });
      setSuccess(
        result?.filename
          ? `Uploaded ${result.filename} to case ${result.complaint_id}.`
          : 'Evidence uploaded successfully.'
      );
    } catch (err) {
      setError(err.message || 'Upload failed. Try a clearer PDF or image under 10MB.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(165deg, ${tokens.navy} 0%, #132a4a 45%, #1a3a5c 100%)`,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ color: tokens.navy, mb: 1 }}>
            Add case evidence
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a receipt photo or PDF for your CTDRU complaint. This link does not require login.
          </Typography>

          {loading && (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={32} />
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              {success}
            </Alert>
          )}

          {meta && !loading && (
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={`Case ${meta.complaint_id?.slice(0, 8)}…`} />
                {meta.company_name && (
                  <Chip size="small" color="primary" label={meta.company_name} />
                )}
                {meta.issue_type && <Chip size="small" label={meta.issue_type} />}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Accepted: PDF, PNG, JPG, WEBP (max 10MB)
              </Typography>
              <Button
                component="label"
                variant="contained"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: tokens.navy,
                  '&:hover': { bgcolor: tokens.navyMid || tokens.navy },
                }}
              >
                {uploading ? `Uploading ${fileName || ''}…` : 'Choose file'}
                <input
                  hidden
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFile}
                />
              </Button>
            </Stack>
          )}

          {onDone && (
            <Button onClick={onDone} sx={{ textTransform: 'none' }}>
              Back to Wakilibot
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default EvidenceUploadPage;
