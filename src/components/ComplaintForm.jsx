import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon,
  PhoneAndroid as PhoneAndroidIcon,
  CreditCard as CardIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
  AttachFile as AttachIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../services/api';
import DraftAssistant from './DraftAssistant';

const ComplaintForm = ({ onBack, onSuccess, initialComplaintType = '', mode = 'complaint' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    
    // Complaint Details
    complaintType: initialComplaintType || '',
    companyName: '',
    transactionId: '',
    issueType: mode === 'fraud' ? 'fraud' : '',
    description: '',
    amount: '',
    dateOfIncident: '',
    
    // Additional Information
    supportingDocuments: [],
    preferredContactMethod: 'email',
    urgency: mode === 'fraud' ? 'high' : 'medium',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState(null);

  // Complaint types based on Backend model
  const complaintTypes = [
    {
      value: 'mobile_money',
      label: 'Mobile Money Services',
      icon: <MobileIcon />,
      description: 'MTN Mobile Money, Airtel Money, Africell Money issues'
    },
    {
      value: 'banking',
      label: 'Banking Services',
      icon: <BankIcon />,
      description: 'Bank accounts, loans, credit cards, ATM issues'
    },
    {
      value: 'telecom',
      label: 'Telecommunications',
      icon: <PhoneAndroidIcon />,
      description: 'Mobile network, internet, data services'
    },
    {
      value: 'insurance',
      label: 'Insurance Services',
      icon: <SecurityIcon />,
      description: 'Health, life, motor, property insurance'
    },
    {
      value: 'investment',
      label: 'Investment Services',
      icon: <CardIcon />,
      description: 'Investment products, pension funds, securities'
    },
    {
      value: 'retail',
      label: 'Retail & E-commerce',
      icon: <StoreIcon />,
      description: 'Online shopping, product defects, delivery issues'
    },
    {
      value: 'transport',
      label: 'Transport Services',
      icon: <ShippingIcon />,
      description: 'Public transport, ride-sharing, logistics'
    },
    {
      value: 'other',
      label: 'Other Services',
      icon: <InfoIcon />,
      description: 'Any other consumer service not listed above'
    }
  ];

  const issueTypes = [
    { value: 'fraud', label: 'Fraud/Theft', severity: 'high' },
    { value: 'unauthorized_transaction', label: 'Unauthorized Transaction', severity: 'high' },
    { value: 'failed_transaction', label: 'Failed Transaction', severity: 'medium' },
    { value: 'wrong_amount', label: 'Wrong Amount Charged', severity: 'medium' },
    { value: 'poor_service', label: 'Poor Service Quality', severity: 'low' },
    { value: 'billing_error', label: 'Billing Error', severity: 'medium' },
    { value: 'account_blocked', label: 'Account Blocked', severity: 'high' },
    { value: 'refund_issue', label: 'Refund Not Processed', severity: 'medium' },
    { value: 'technical_issue', label: 'Technical Problem', severity: 'low' },
    { value: 'other', label: 'Other Issue', severity: 'low' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: '#4caf50', description: 'Can wait 7+ days' },
    { value: 'medium', label: 'Medium', color: '#ff9800', description: 'Needs attention within 3-7 days' },
    { value: 'high', label: 'High', color: '#f44336', description: 'Urgent - needs immediate attention' }
  ];

  const steps = [
    'Personal Information',
    'Complaint Details',
    'Additional Information',
    'Review & Submit'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\+?\d{9,15}$/.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = 'Invalid phone number format';
        }
        break;
        
      case 1: // Complaint Details
        if (!formData.complaintType) newErrors.complaintType = 'Please select a complaint type';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.issueType) newErrors.issueType = 'Please select an issue type';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.trim().length < 20) {
          newErrors.description = 'Description must be at least 20 characters';
        }
        break;
        
      case 2: // Additional Information
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCloseBanner = () => {
    setShowSuccessBanner(false);
    // Reset form for new complaint
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      complaintType: '',
      companyName: '',
      transactionId: '',
      issueType: '',
      description: '',
      amount: '',
      dateOfIncident: '',
      supportingDocuments: [],
      preferredContactMethod: 'email',
      urgency: 'medium',
      agreeToTerms: false
    });
    setActiveStep(0);
    setErrors({});
    setSubmitStatus(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Prepare complaint data according to Backend model
      const complaintData = {
        issue_type: formData.issueType,
        description: formData.description,
        company_name: formData.companyName,
        contact_details: `${formData.email}, ${formData.phone}`,
        transaction_id: formData.transactionId || null
      };
      
      console.log('Submitting complaint data:', complaintData);
      
      // Submit to Backend API using the API service
      const result = await api.submitComplaint(complaintData);
      
      console.log('Complaint submitted successfully:', result);
      
      setSubmitStatus('success');
      setSubmittedComplaintId(result.complaint_id);
      setShowSuccessBanner(true);
      setSnackbarMessage(`Complaint submitted successfully! Reference ID: ${result.complaint_id}`);
      setSnackbarOpen(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setSubmitStatus('error');
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit complaint. Please try again or contact CTDRU directly.';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info" sx={{ backgroundColor: '#F7F4EF', color: '#0B1F3A', border: '1px solid rgba(11,31,58,0.12)' }}>
        <Typography variant="body2">
          Your personal information is secure and will only be used to process your complaint and contact you regarding updates.
        </Typography>
      </Alert>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            error={!!errors.fullName}
            helperText={errors.fullName}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' },
              '& .MuiFormHelperText-root': { color: '#9B2C2C' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' },
              '& .MuiFormHelperText-root': { color: '#9B2C2C' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone || 'Include country code (e.g., +256)'}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' },
              '& .MuiFormHelperText-root': { color: errors.phone ? '#ff6b6b' : '#888888' }
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Address (Optional)"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderComplaintDetailsStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="warning" sx={{ backgroundColor: '#F7F4EF', color: '#0B1F3A', border: '1px solid rgba(11,31,58,0.12)' }}>
        <Typography variant="body2">
          Please provide accurate information. False information may delay or invalidate your complaint.
        </Typography>
      </Alert>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.complaintType} required>
            <InputLabel sx={{ color: '#5C6B7A' }}>Complaint Type</InputLabel>
            <Select
              value={formData.complaintType}
              onChange={(e) => handleInputChange('complaintType', e.target.value)}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' }
              }}
            >
              {complaintTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {type.icon}
                    <Box>
                      <Typography variant="body1" sx={{ color: '#0B1F3A' }}>
                        {type.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5C6B7A' }}>
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.complaintType && (
            <Typography variant="caption" sx={{ color: '#9B2C2C', mt: 1 }}>
              {errors.complaintType}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Company/Service Provider"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            error={!!errors.companyName}
            helperText={errors.companyName}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' },
              '& .MuiFormHelperText-root': { color: '#9B2C2C' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Transaction ID (Optional)"
            value={formData.transactionId}
            onChange={(e) => handleInputChange('transactionId', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' }
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.issueType} required>
            <InputLabel sx={{ color: '#5C6B7A' }}>Issue Type</InputLabel>
            <Select
              value={formData.issueType}
              onChange={(e) => handleInputChange('issueType', e.target.value)}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' }
              }}
            >
              {issueTypes.map((issue) => (
                <MenuItem key={issue.value} value={issue.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={issue.severity}
                      size="small"
                      sx={{
                        backgroundColor: issue.severity === 'high' ? '#f44336' : 
                                        issue.severity === 'medium' ? '#ff9800' : '#4caf50',
                        color: '#0B1F3A',
                        fontSize: '10px'
                      }}
                    />
                    <Typography variant="body1" sx={{ color: '#0B1F3A' }}>
                      {issue.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.issueType && (
            <Typography variant="caption" sx={{ color: '#9B2C2C', mt: 1 }}>
              {errors.issueType}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Amount Involved (Optional)"
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Date of Incident"
            type="date"
            value={formData.dateOfIncident}
            onChange={(e) => handleInputChange('dateOfIncident', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' }
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Detailed Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || 'Describe what happened, when, and how it affected you (minimum 20 characters)'}
            fullWidth
            multiline
            rows={4}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& fieldset': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover fieldset': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#ffffff' }
              },
              '& .MuiInputLabel-root': { color: '#5C6B7A' },
              '& .MuiFormHelperText-root': { color: errors.description ? '#ff6b6b' : '#888888' }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderAdditionalInfoStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#5C6B7A' }}>Preferred Contact Method</InputLabel>
            <Select
              value={formData.preferredContactMethod}
              onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' }
              }}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone Call</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#5C6B7A' }}>Urgency Level</InputLabel>
            <Select
              value={formData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value)}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#0B1F3A',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.28)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,31,58,0.35)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' }
              }}
            >
              {urgencyLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={level.label}
                      size="small"
                      sx={{
                        backgroundColor: level.color,
                        color: '#0B1F3A',
                        fontSize: '10px'
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#0B1F3A' }}>
                      {level.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(11,31,58,0.12)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#0B1F3A', mb: 2 }}>
                Supporting Documents (Optional)
              </Typography>
              <Typography variant="body2" sx={{ color: '#5C6B7A', mb: 2 }}>
                Upload receipts, screenshots, or other evidence to support your complaint.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AttachIcon />}
                sx={{
                  borderColor: 'rgba(11,31,58,0.28)',
                  color: '#5C6B7A',
                  '&:hover': { borderColor: 'rgba(11,31,58,0.35)', backgroundColor: 'rgba(11,31,58,0.06)' }
                }}
              >
                Attach Files
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                sx={{
                  color: '#5C6B7A',
                  '&.Mui-checked': { color: '#0B1F3A' }
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>
                I confirm that the information provided is accurate and I agree to CTDRU's terms of service and privacy policy.
              </Typography>
            }
          />
          {errors.agreeToTerms && (
            <Typography variant="caption" sx={{ color: '#9B2C2C', mt: 1 }}>
              {errors.agreeToTerms}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info" sx={{ backgroundColor: '#F7F4EF', color: '#0B1F3A', border: '1px solid rgba(11,31,58,0.12)' }}>
        <Typography variant="body2">
          Please review your complaint details carefully before submitting. You will receive a confirmation email with your complaint reference number.
        </Typography>
      </Alert>
      
      <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(11,31,58,0.12)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#0B1F3A', mb: 2 }}>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Name:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>{formData.fullName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Email:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>{formData.email}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Phone:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>{formData.phone}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Contact Method:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>{formData.preferredContactMethod}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(11,31,58,0.12)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#0B1F3A', mb: 2 }}>
            Complaint Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Type:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>
                {complaintTypes.find(t => t.value === formData.complaintType)?.label}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Company:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>{formData.companyName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Issue:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>
                {issueTypes.find(t => t.value === formData.issueType)?.label}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Urgency:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A' }}>
                {urgencyLevels.find(t => t.value === formData.urgency)?.label}
              </Typography>
            </Grid>
            {formData.transactionId && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Transaction ID:</Typography>
                <Typography variant="body1" sx={{ color: '#0B1F3A' }}>{formData.transactionId}</Typography>
              </Grid>
            )}
            {formData.amount && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Amount:</Typography>
                <Typography variant="body1" sx={{ color: '#0B1F3A' }}>UGX {formData.amount}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#5C6B7A' }}>Description:</Typography>
              <Typography variant="body1" sx={{ color: '#0B1F3A', mt: 1 }}>
                {formData.description}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#0B1F3A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Success Banner */}
      {showSuccessBanner && (
        <Box
          sx={{
            backgroundColor: '#1b5e20',
            color: '#0B1F3A',
            p: 3,
            borderBottom: '1px solid #2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckIcon sx={{ fontSize: 32, color: '#4caf50' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Complaint Submitted Successfully!
              </Typography>
              <Typography variant="body2" sx={{ color: '#e8f5e8' }}>
                Your complaint has been received and assigned reference ID: <strong>{submittedComplaintId}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: '#e8f5e8', mt: 1 }}>
                CTDRU will review your complaint and contact you within 2-3 business days.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseBanner}
                sx={{
                  mt: 2,
                  color: '#0B1F3A',
                  borderColor: '#ffffff',
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Submit Another Complaint
              </Button>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseBanner}
            sx={{
              color: '#0B1F3A',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 0.95fr) minmax(340px, 1.05fr)' },
          gap: { xs: 3, lg: 3.5 },
          alignItems: 'start',
        }}
      >
        <Box
          sx={{
            position: { lg: 'sticky' },
            top: { lg: 8 },
            alignSelf: 'start',
          }}
        >
          <DraftAssistant
            mode={mode === 'fraud' ? 'fraud' : 'complaint'}
            sideBySide
            onApplyDraft={(draft) => {
              setFormData((prev) => ({
                ...prev,
                companyName: draft.companyName || prev.companyName,
                transactionId: draft.transactionId || prev.transactionId,
                dateOfIncident: draft.dateOfIncident || prev.dateOfIncident,
                amount: draft.amount || prev.amount,
                issueType: draft.issueType || prev.issueType,
                description: draft.description || prev.description,
                urgency:
                  mode === 'fraud' || draft.issueType === 'fraud'
                    ? 'high'
                    : prev.urgency,
              }));
              setActiveStep(1);
              setSnackbarMessage('Draft applied to the complaint form. Review the details before submitting.');
              setSnackbarOpen(true);
            }}
          />
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.15rem',
              mb: 0.75,
              color: '#0B1F3A',
            }}
          >
            {mode === 'fraud' ? 'Fraud report form' : 'Complaint form'}
          </Typography>
          <Typography sx={{ color: '#5C6B7A', mb: 2.5, fontSize: '0.9rem', lineHeight: 1.55 }}>
            Complete the steps below. Use the drafting assistant beside this form, then apply the draft here.
          </Typography>

          <Box sx={{ mb: 2.5 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography variant="caption" sx={{ color: '#5C6B7A' }}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 0, md: 0 } }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
          <Step>
            <StepLabel sx={{ color: '#0B1F3A' }}>Personal Information</StepLabel>
            <StepContent>
              {renderPersonalInfoStep()}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#cccccc' }
                  }}
                >
                  Next Step
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel sx={{ color: '#0B1F3A' }}>Complaint Details</StepLabel>
            <StepContent>
              {renderComplaintDetailsStep()}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    borderColor: 'rgba(11,31,58,0.28)',
                    color: '#5C6B7A',
                    '&:hover': { borderColor: 'rgba(11,31,58,0.35)', backgroundColor: 'rgba(11,31,58,0.06)' }
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#cccccc' }
                  }}
                >
                  Next Step
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel sx={{ color: '#0B1F3A' }}>Additional Information</StepLabel>
            <StepContent>
              {renderAdditionalInfoStep()}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    borderColor: 'rgba(11,31,58,0.28)',
                    color: '#5C6B7A',
                    '&:hover': { borderColor: 'rgba(11,31,58,0.35)', backgroundColor: 'rgba(11,31,58,0.06)' }
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#cccccc' }
                  }}
                >
                  Next Step
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel sx={{ color: '#0B1F3A' }}>Review & Submit</StepLabel>
            <StepContent>
              {renderReviewStep()}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    borderColor: 'rgba(11,31,58,0.28)',
                    color: '#5C6B7A',
                    '&:hover': { borderColor: 'rgba(11,31,58,0.35)', backgroundColor: 'rgba(11,31,58,0.06)' }
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#cccccc' },
                    '&:disabled': { backgroundColor: '#666666', color: '#999999' }
                  }}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: '#000000' }} />
                      Submitting...
                    </Box>
                  ) : (
                    'Submit Complaint'
                  )}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Box>

      {/* Success/Error Status */}
      {submitStatus && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(11,31,58,0.1)', backgroundColor: '#FFFFFF' }}>
          {submitStatus === 'success' ? (
            <Alert severity="success" sx={{ backgroundColor: '#F7F4EF', color: '#0B1F3A', border: '1px solid #4caf50' }}>
              <Typography variant="body2">
                Complaint submitted successfully! You will receive a confirmation email with your reference number.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="error" sx={{ backgroundColor: '#F7F4EF', color: '#0B1F3A', border: '1px solid #f44336' }}>
              <Typography variant="body2">
                Failed to submit complaint. Please try again or contact CTDRU directly at +256-41-4230060.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default ComplaintForm;
