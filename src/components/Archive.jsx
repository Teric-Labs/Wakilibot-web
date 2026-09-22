import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
  Fab
} from '@mui/material';
import {
  Description as DocumentIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  Article as ArticleIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../services/api';

const Archive = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentStats, setDocumentStats] = useState(null);
  const [, setCurrentPage] = useState(1);
  const [, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'handbook',
    tags: '',
    file: null
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'handbook',
    tags: ''
  });

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'legislation', label: 'Legislation' },
    { id: 'regulations', label: 'Regulations' },
    { id: 'standards', label: 'Standards' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'handbook', label: 'Handbooks' }
  ];

  // Load documents from API
  const loadDocuments = useCallback(async (page = 1, category = selectedCategory, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        page_size: 12,
        category: category === 'all' ? null : category,
        search: search || null,
        sort_by: 'upload_date',
        sort_order: 'desc'
      };

      console.log('Loading documents with params:', params);
      const response = await api.getDocuments(params);

      setDocuments(response.documents || []);
      setTotalPages(response.total_pages || 1);
      setTotalCount(response.total_count || 0);
      setCurrentPage(response.page || 1);

      console.log('Documents loaded successfully:', response);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  // Load document statistics
  const loadDocumentStats = async () => {
    try {
      const stats = await api.getDocumentStats();
      setDocumentStats(stats);
    } catch (err) {
      console.error('Error loading document stats:', err);
    }
  };

  // Load documents on component mount and when filters change
  useEffect(() => {
    loadDocuments();
    loadDocumentStats();
  }, [loadDocuments]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' || selectedCategory !== 'all') {
        loadDocuments(1, selectedCategory, searchTerm);
      } else {
        loadDocuments();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, loadDocuments]);

  // Handle document download
  const handleDownload = async (document) => {
    try {
      console.log('Downloading document:', document.title);
      const blob = await api.downloadDocument(document.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename || `${document.title}.${document.file_type?.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage(`Downloaded ${document.title}`);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
    }
  };

  // Handle document view
  const handleView = async (document) => {
    try {
      console.log('Viewing document:', document.title);
      // For now, just download the document
      // In a real app, this would open a document viewer
      await handleDownload(document);
    } catch (err) {
      console.error('Error viewing document:', err);
      setError('Failed to view document. Please try again.');
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title.trim()) {
      setError('Please select a file and enter a title.');
      return;
    }

    try {
      setUploading(true);
      const response = await api.uploadDocument(uploadForm.file, {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        tags: uploadForm.tags
      });

      console.log('Document uploaded successfully:', response);
      setSuccessMessage(`Document "${uploadForm.title}" uploaded successfully!`);
      setShowUploadDialog(false);
      setUploadForm({
        title: '',
        description: '',
        category: 'handbook',
        tags: '',
        file: null
      });
      
      // Reload documents
      loadDocuments();
      loadDocumentStats();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle document edit
  const handleEdit = async () => {
    if (!editingDocument || !editForm.title.trim()) {
      setError('Please enter a title.');
      return;
    }

    try {
      setUploading(true);
      await api.updateDocument(editingDocument.id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        tags: editForm.tags
      });

      console.log('Document updated successfully');
      setSuccessMessage(`Document "${editForm.title}" updated successfully!`);
      setShowEditDialog(false);
      setEditingDocument(null);
      
      // Reload documents
      loadDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle document delete
  const handleDelete = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      await api.deleteDocument(document.id);
      console.log('Document deleted successfully');
      setSuccessMessage(`Document "${document.title}" deleted successfully!`);
      
      // Reload documents
      loadDocuments();
      loadDocumentStats();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  // Open edit dialog
  const openEditDialog = (document) => {
    setEditingDocument(document);
    setEditForm({
      title: document.title,
      description: document.description,
      category: document.category,
      tags: document.tags ? document.tags.join(', ') : ''
    });
    setShowEditDialog(true);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'legislation': return <GavelIcon />;
      case 'regulations': return <SecurityIcon />;
      case 'standards': return <TrendingUpIcon />;
      case 'procedures': return <AssignmentIcon />;
      case 'requirements': return <DocumentIcon />;
      case 'handbook': return <ArticleIcon />;
      default: return <DocumentIcon />;
    }
  };

  // Get category count from stats
  const getCategoryCount = (categoryId) => {
    if (!documentStats || categoryId === 'all') return totalCount;
    return documentStats.documents_by_category?.[categoryId] || 0;
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #333333',
          backgroundColor: '#111111'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Legal Documents Archive
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => loadDocuments()}
              sx={{
                color: '#cccccc',
                backgroundColor: '#333333',
                '&:hover': { backgroundColor: '#444444' }
              }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              onClick={onBack}
              sx={{
                color: '#cccccc',
                '&:hover': { backgroundColor: '#333333' }
              }}
            >
              ← Back
            </IconButton>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#222222',
                color: '#ffffff',
                '& fieldset': {
                  borderColor: '#444444',
                },
                '&:hover fieldset': {
                  borderColor: '#666666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
                '&::placeholder': {
                  color: '#888888',
                  opacity: 1
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#888888' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            sx={{
              color: '#cccccc',
              backgroundColor: '#333333',
              '&:hover': { backgroundColor: '#444444' }
            }}
          >
            <FilterIcon />
          </IconButton>
          <IconButton
            sx={{
              color: '#cccccc',
              backgroundColor: '#333333',
              '&:hover': { backgroundColor: '#444444' }
            }}
          >
            <SortIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Categories */}
      <Box sx={{ p: 2, backgroundColor: '#111111', borderBottom: '1px solid #333333' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={`${category.label} (${getCategoryCount(category.id)})`}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: selectedCategory === category.id ? '#333333' : 'transparent',
                color: selectedCategory === category.id ? '#ffffff' : '#cccccc',
                borderColor: '#444444',
                fontSize: '12px',
                height: '28px',
                '&:hover': {
                  backgroundColor: '#333333',
                  color: '#ffffff'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Documents List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ backgroundColor: '#111111', border: '1px solid #333333', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" height={20} />
                        <Skeleton variant="text" width="60%" height={16} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="100%" height={16} />
                    <Skeleton variant="text" width="90%" height={16} />
                    <Skeleton variant="text" width="70%" height={16} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {documents.map((document) => (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <Card
                  sx={{
                    backgroundColor: '#111111',
                    border: '1px solid #333333',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#444444',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: '#333333',
                          color: '#ffffff',
                          width: 40,
                          height: 40
                        }}
                      >
                        {getCategoryIcon(document.category)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#ffffff',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {document.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#888888',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {document.category} • {document.file_type} • {document.file_size_mb}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#cccccc',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {document.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#888888',
                          fontSize: '11px'
                        }}
                      >
                        {new Date(document.upload_date).toLocaleDateString()} • {document.download_count} downloads
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Document">
                        <IconButton
                          size="small"
                          onClick={() => handleView(document)}
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            '&:hover': {
                              backgroundColor: '#444444',
                              color: '#ffffff'
                            }
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Document">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(document)}
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            '&:hover': {
                              backgroundColor: '#444444',
                              color: '#ffffff'
                            }
                          }}
                        >
                          <DownloadIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Document">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(document)}
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            '&:hover': {
                              backgroundColor: '#444444',
                              color: '#ffffff'
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Document">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(document)}
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                              color: '#ffffff'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && documents.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#888888'
            }}
          >
            <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No documents found
            </Typography>
            <Typography variant="body2">
              Try adjusting your search terms or category filter
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Action Button for Upload */}
      <Fab
        color="primary"
        aria-label="upload"
        onClick={() => setShowUploadDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#333333',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#444444'
          }
        }}
      >
        <UploadIcon />
      </Fab>

      {/* Upload Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111111',
            color: '#ffffff',
            border: '1px solid #333333'
          }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid #333333' }}>
          Upload New Document
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Document Title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#444444' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
            
            <TextField
              label="Description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#444444' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#cccccc' }}>Category</InputLabel>
              <Select
                value={uploadForm.category}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                sx={{
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
                  '& .MuiSvgIcon-root': { color: '#cccccc' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#111111',
                      border: '1px solid #333333',
                      borderRadius: 2,
                    },
                  },
                }}
              >
                {categories.slice(1).map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ color: '#ffffff' }}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Tags (comma-separated)"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
              fullWidth
              placeholder="e.g., consumer rights, banking, regulations"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#444444' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
            
            <Box sx={{ mt: 1 }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{
                    borderColor: '#444444',
                    color: '#cccccc',
                    '&:hover': {
                      borderColor: '#666666',
                      backgroundColor: '#333333'
                    }
                  }}
                >
                  {uploadForm.file ? uploadForm.file.name : 'Select File'}
                </Button>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #333333', p: 2 }}>
          <Button
            onClick={() => setShowUploadDialog(false)}
            sx={{ color: '#cccccc' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}
            sx={{
              backgroundColor: '#333333',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#444444' },
              '&:disabled': { backgroundColor: '#222222', color: '#666666' }
            }}
          >
            {uploading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111111',
            color: '#ffffff',
            border: '1px solid #333333'
          }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid #333333' }}>
          Edit Document
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Document Title"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#444444' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
            
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#444444' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#cccccc' }}>Category</InputLabel>
              <Select
                value={editForm.category}
                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                sx={{
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
                  '& .MuiSvgIcon-root': { color: '#cccccc' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#111111',
                      border: '1px solid #333333',
                      borderRadius: 2,
                    },
                  },
                }}
              >
                {categories.slice(1).map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ color: '#ffffff' }}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Tags (comma-separated)"
              value={editForm.tags}
              onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
              fullWidth
              placeholder="e.g., consumer rights, banking, regulations"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#444444' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #333333', p: 2 }}>
          <Button
            onClick={() => setShowEditDialog(false)}
            sx={{ color: '#cccccc' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            disabled={uploading || !editForm.title.trim()}
            sx={{
              backgroundColor: '#333333',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#444444' },
              '&:disabled': { backgroundColor: '#222222', color: '#666666' }
            }}
          >
            {uploading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error/Success Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{
            backgroundColor: '#d32f2f',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ffffff' }
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{
            backgroundColor: '#2e7d32',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ffffff' }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Archive;
