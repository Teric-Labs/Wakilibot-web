import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  SearchFieldIcon,
  DocumentIcon,
  EmptyDocumentsIcon,
  ViewActionIcon,
  DownloadActionIcon,
  CopyLinkActionIcon,
} from './icons';
import PanelCard, { PanelEmptyState, PanelSectionLabel } from './PanelCard';
import { tokens } from '../styles/theme';
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
 * One row in the reference library. The card body carries no buttons: opening, downloading and
 * sharing a file live behind the vertical dots on the right edge, so a Documents row is built from
 * exactly the same parts as a History row.
 */
const DocumentCard = ({ doc }) => {
  // file_url comes back relative ("/documents/download/<id>"), so it is resolved against the API
  // before a card opens it or copies it.
  const link = api.utils.resolveFileUrl(doc.url || doc.file_url || doc.download_url);
  const id = doc.id || doc.document_id;
  const [notice, setNotice] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2800);
  };

  // Viewing goes through the same endpoint as downloading rather than straight to file_url: on this
  // API a record can outlive its file, and a missing one should be reported inside the card instead
  // of opening raw JSON in a new tab.
  const handleView = async () => {
    if (!id) {
      const opened = window.open(link, '_blank', 'noopener,noreferrer');
      if (!opened) say('Pop-up blocked - allow it for this site');
      return;
    }
    setOpening(true);
    try {
      const blob = await api.downloadDocument(id);
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
    setDownloading(true);
    try {
      const blob = await api.downloadDocument(id);
      saveBlob(blob, fileNameFor(doc));
      say('Download started');
    } catch {
      say('Could not download this file');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      say('Link copied');
    } catch {
      say('Could not copy the link');
    }
  };

  return (
    <PanelCard
      glyph={DocumentIcon}
      title={doc.title || 'Untitled document'}
      meta={
        notice ||
        [doc.category || 'Consumer protection', formatUploadDate(doc.upload_date || doc.last_modified)]
          .filter(Boolean)
          .join(' · ')
      }
      description={doc.description || 'Reference document for filing and following matters.'}
      actions={[
        {
          id: 'view',
          label: opening ? 'Opening…' : 'View',
          icon: ViewActionIcon,
          onClick: handleView,
          disabled: !link || opening || downloading,
        },
        {
          id: 'download',
          label: downloading ? 'Downloading…' : 'Download',
          icon: DownloadActionIcon,
          onClick: handleDownload,
          disabled: !id || downloading || opening,
        },
        { id: 'rule', divider: true },
        {
          id: 'copy',
          label: 'Copy link',
          icon: CopyLinkActionIcon,
          onClick: handleCopy,
          disabled: !link,
        },
      ]}
    />
  );
};

const Archive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reindexing, setReindexing] = useState(false);
  const [reindexNotice, setReindexNotice] = useState(null);

  const handleReindex = async () => {
    try {
      setReindexing(true);
      setReindexNotice(null);
      await api.reindexKnowledgeBase();
      setReindexNotice('Knowledge base vector index refreshed successfully.');
      setTimeout(() => setReindexNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setError('Could not re-index knowledge base. Check agent service status.');
    } finally {
      setReindexing(false);
    }
  };

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

        <Button
          variant="outlined"
          size="small"
          onClick={handleReindex}
          disabled={reindexing}
          sx={{
            borderColor: tokens.line,
            color: tokens.navy,
            fontSize: '0.75rem',
            textTransform: 'none',
            borderRadius: '16px',
            px: 1.5,
            py: 0.4,
            '&:hover': {
              borderColor: tokens.navy,
              backgroundColor: 'rgba(11, 31, 58, 0.04)',
            },
          }}
        >
          {reindexing ? (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <CircularProgress size={12} color="inherit" />
              <span>Re-indexing…</span>
            </Stack>
          ) : (
            'Re-index Knowledge'
          )}
        </Button>
      </Box>

      {reindexNotice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {reindexNotice}
        </Alert>
      )}

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

      <Stack spacing={1.5}>
        {documents.map((doc) => (
          <DocumentCard key={doc.id || doc.document_id || doc.title} doc={doc} />
        ))}
      </Stack>
    </Box>
  );
};

export default Archive;
