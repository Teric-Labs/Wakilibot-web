import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  SearchFieldIcon,
  DocumentIcon,
  EmptyDocumentsIcon,
  ViewActionIcon,
  DownloadActionIcon,
  CopyLinkActionIcon,
} from './icons';
import { PanelEmptyState, PanelSectionLabel, uppercaseLabelSx, PanelGlyphBadge } from './PanelCard';
import { tokens, radii } from '../styles/theme';
import api from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'legislation', label: 'Legislation' },
  { id: 'regulations', label: 'Regulations' },
  { id: 'handbook', label: 'Handbooks' },
  { id: 'procedures', label: 'Procedures' },
];

const EXTENSIONS = [
  ['pdf', '.pdf'],
  ['word', '.docx'],
  ['document', '.docx'],
  ['excel', '.xlsx'],
  ['presentation', '.pptx'],
  ['text', '.txt'],
];

const fileNameFor = (doc) => {
  const base = String(doc.title || 'document').replace(/[^\w\s-]+/g, '').trim() || 'document';
  if (base.includes('.')) return base;
  const type = String(doc.file_type || doc.mime_type || '').toLowerCase();
  const match = EXTENSIONS.find(([needle]) => type.includes(needle));
  return `${base}${match ? match[1] : ''}`;
};

const fileKindLabel = (doc) => {
  const type = String(doc.file_type || doc.mime_type || doc.title || '').toLowerCase();
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('word') || type.includes('docx')) return 'Word';
  if (type.includes('sheet') || type.includes('xls')) return 'Spreadsheet';
  if (type.includes('presentation') || type.includes('ppt')) return 'Slides';
  if (type.includes('text') || type.includes('.txt')) return 'Text';
  return 'Document';
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const formatUploadDate = (value) => {
  const millis = api.utils.toMillis(value);
  if (millis === null) return null;
  return new Date(millis).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Professional document tile for the library grid.
 * Keeps CTDR-U brand language: square card, Fraunces title, navy/gold accents.
 */
const DocumentCard = ({ doc }) => {
  const link = api.utils.resolveFileUrl(doc.url || doc.file_url || doc.download_url);
  const id = doc.id || doc.document_id;
  const isPublicFile = Boolean(link && /^https?:\/\//i.test(link));
  const [notice, setNotice] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);
  const timer = useRef(null);
  const uploaded = formatUploadDate(doc.upload_date || doc.last_modified);
  const kind = fileKindLabel(doc);
  const category = doc.category || 'Consumer protection';

  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2800);
  };

  const handleView = async () => {
    if (!link) {
      say('This file is no longer on the server');
      return;
    }
    if (isPublicFile || !id) {
      const opened = window.open(link, '_blank', 'noopener,noreferrer');
      if (!opened) say('Pop-up blocked - allow it for this site');
      return;
    }
    setOpening(true);
    try {
      const blob = await api.downloadDocument(id, link);
      const url = URL.createObjectURL(blob);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) say('Pop-up blocked - allow it for this site');
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch {
      say('This file is no longer on the server');
    } finally {
      setOpening(false);
    }
  };

  const handleDownload = async () => {
    if (!link && !id) {
      say('Could not download this file');
      return;
    }
    setDownloading(true);
    try {
      if (isPublicFile) {
        const opened = window.open(link, '_blank', 'noopener,noreferrer');
        if (!opened) say('Pop-up blocked - allow it for this site');
        else say('Opened file in a new tab');
        return;
      }
      const blob = await api.downloadDocument(id, link);
      saveBlob(blob, fileNameFor(doc));
      say('Download started');
    } catch {
      say('Could not download this file');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!link) {
      say('No link available');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      say('Link copied');
    } catch {
      say('Could not copy the link');
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${tokens.line}`,
        borderRadius: radii.card,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(11,31,58,0.03)',
        transition: 'border-color .18s ease, box-shadow .18s ease, transform .18s ease',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'rgba(11,31,58,0.28)',
          transform: 'translateY(-3px)',
          boxShadow: '0 22px 40px -26px rgba(11,31,58,0.5)',
        },
      }}
    >
      <Box
        sx={{
          px: 2.25,
          pt: 2.25,
          pb: 1.75,
          borderBottom: `1px solid ${tokens.line}`,
          background:
            'linear-gradient(180deg, rgba(11,31,58,0.04) 0%, rgba(255,255,255,0) 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <PanelGlyphBadge glyph={DocumentIcon} tone="gold" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mb: 0.85 }}>
            <Chip
              size="small"
              label={kind}
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: radii.card,
                backgroundColor: 'rgba(184,134,11,0.12)',
                color: tokens.gold,
                border: '1px solid rgba(184,134,11,0.28)',
              }}
            />
            <Chip
              size="small"
              label={category}
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                borderRadius: radii.card,
                backgroundColor: tokens.paper,
                color: tokens.navyMid,
                border: `1px solid ${tokens.line}`,
                maxWidth: 140,
                '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />
          </Stack>
          <Typography
            sx={{
              color: tokens.navy,
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.05rem',
              letterSpacing: '-0.015em',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
          >
            {doc.title || 'Untitled document'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2.25, py: 1.75, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            color: tokens.muted,
            fontSize: '0.86rem',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {doc.description || 'Reference document for filing and following CTDRU matters.'}
        </Typography>

        <Typography sx={{ ...uppercaseLabelSx, mt: 1.5 }}>
          {notice || (uploaded ? `Published ${uploaded}` : 'Reference library')}
        </Typography>
      </Box>

      <Box
        sx={{
          px: 1.75,
          py: 1.35,
          borderTop: `1px solid ${tokens.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          backgroundColor: tokens.paperElevated,
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={handleView}
          disabled={!link || opening || downloading}
          startIcon={<ViewActionIcon />}
          sx={{
            flex: 1,
            borderRadius: radii.card,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            backgroundColor: tokens.navy,
            '&:hover': { backgroundColor: tokens.navyMid, boxShadow: 'none' },
          }}
        >
          {opening ? 'Opening…' : 'Open'}
        </Button>
        <Tooltip title={downloading ? 'Downloading…' : 'Download'}>
          <span>
            <IconButton
              size="small"
              onClick={handleDownload}
              disabled={(!id && !link) || downloading || opening}
              aria-label="Download document"
              sx={{
                borderRadius: radii.card,
                border: `1px solid ${tokens.line}`,
                color: tokens.navy,
                backgroundColor: '#fff',
                '&:hover': { borderColor: tokens.navy, backgroundColor: '#fff' },
              }}
            >
              <DownloadActionIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Copy link">
          <span>
            <IconButton
              size="small"
              onClick={handleCopy}
              disabled={!link}
              aria-label="Copy document link"
              sx={{
                borderRadius: radii.card,
                border: `1px solid ${tokens.line}`,
                color: tokens.navy,
                backgroundColor: '#fff',
                '&:hover': { borderColor: tokens.navy, backgroundColor: '#fff' },
              }}
            >
              <CopyLinkActionIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

const Archive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
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
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const t = setTimeout(loadDocuments, 300);
    return () => clearTimeout(t);
  }, [loadDocuments]);

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Search documents"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchFieldIcon style={{ color: tokens.muted }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: selectedCategory === cat.id ? tokens.navy : '#FFFFFF',
                color: selectedCategory === cat.id ? '#fff' : tokens.navy,
                borderColor: selectedCategory === cat.id ? tokens.navy : tokens.line,
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      </Box>

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
        <PanelEmptyState
          glyph={EmptyDocumentsIcon}
          title="No documents here yet"
          note={
            searchTerm
              ? 'Nothing matches that search. Try a different word or clear the filter above.'
              : 'Reference guides appear here as CTDRU publishes them.'
          }
        />
      )}

      {!loading && documents.length > 0 && (
        <PanelSectionLabel>
          {`${documents.length} ${documents.length === 1 ? 'document' : 'documents'}`}
        </PanelSectionLabel>
      )}

      {!loading && documents.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: { xs: 1.75, md: 2.25 },
            alignItems: 'stretch',
          }}
        >
          {documents.map((doc) => (
            <DocumentCard key={doc.id || doc.document_id || doc.title} doc={doc} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Archive;
