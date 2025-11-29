import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Eye,
  Download,
  User,
  Building,
  FileText,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  Star,
  ArrowRight,
  X
} from 'lucide-react';

const KYCContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const StatusCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.status) {
      case 'verified': return '#D1FAE5';
      case 'pending': return '#FEF3C7';
      case 'rejected': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'verified': return '#065F46';
      case 'pending': return '#92400E';
      case 'rejected': return '#991B1B';
      default: return '#374151';
    }
  }};
`;

const StatusTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatusDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background: ${props => props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: 1px solid ${props => props.theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ProgressTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const StepCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
  background: ${props => props.completed ? '#F0FDF4' : 'white'};
  border-color: ${props => props.completed ? '#10B981' : props.theme.colors.border};
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StepIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.completed ? '#10B981' : props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StepInfo = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const StepDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const StepStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return props.theme.colors.textSecondary;
    }
  }};
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const FormHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const FormContent = styled.div`
  padding: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.background};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.background};
    cursor: not-allowed;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.background};
  }
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const UploadText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const DocumentList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DocumentItem = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
`;

const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const DocumentName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

function PartnerKYC() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState('pending'); // 'not_started', 'pending', 'verified', 'rejected'
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 9876543210',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    address: '123 MG Road, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001'
  });
  
  const [businessInfo, setBusinessInfo] = useState({
    businessName: 'Kumar Electronics',
    businessType: 'retail',
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    businessAddress: '456 Commercial Street, Bangalore',
    yearsInBusiness: '5'
  });

  const steps = [
    {
      id: 1,
      title: 'Personal Information',
      description: 'Basic personal details and contact information',
      icon: <User size={20} />,
      status: 'completed',
      completed: true
    },
    {
      id: 2,
      title: 'Business Information',
      description: 'Business details and registration information',
      icon: <Building size={20} />,
      status: 'completed',
      completed: true
    },
    {
      id: 3,
      title: 'Document Upload',
      description: 'Upload required documents for verification',
      icon: <FileText size={20} />,
      status: 'pending',
      completed: false
    },
    {
      id: 4,
      title: 'Verification',
      description: 'Final verification and approval process',
      icon: <Shield size={20} />,
      status: 'not_started',
      completed: false
    }
  ];

  const documents = [
    {
      name: 'Aadhar Card',
      uploaded: true,
      status: 'verified'
    },
    {
      name: 'PAN Card',
      uploaded: true,
      status: 'verified'
    },
    {
      name: 'GST Certificate',
      uploaded: true,
      status: 'pending'
    },
    {
      name: 'Bank Statement',
      uploaded: false,
      status: 'not_uploaded'
    },
    {
      name: 'Business License',
      uploaded: false,
      status: 'not_uploaded'
    },
    {
      name: 'Profile Photo',
      uploaded: true,
      status: 'verified'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle size={40} />;
      case 'pending': return <Clock size={40} />;
      case 'rejected': return <AlertCircle size={40} />;
      default: return <Shield size={40} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified': return {
        title: 'KYC Verified',
        description: 'Your account has been successfully verified. You can now access all partner features.'
      };
      case 'pending': return {
        title: 'KYC Under Review',
        description: 'Your documents are being reviewed. This process usually takes 2-3 business days.'
      };
      case 'rejected': return {
        title: 'KYC Rejected',
        description: 'Some documents need to be resubmitted. Please check the requirements and try again.'
      };
      default: return {
        title: 'Complete Your KYC',
        description: 'Please complete your KYC verification to access all partner features.'
      };
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <KYCContainer>
      <Header>
        <Title>KYC Verification</Title>
        <Subtitle>Complete your verification to unlock all partner features</Subtitle>
      </Header>

      <StatusCard>
        <StatusIcon status={kycStatus}>
          {getStatusIcon(kycStatus)}
        </StatusIcon>
        <StatusTitle>{getStatusText(kycStatus).title}</StatusTitle>
        <StatusDescription>{getStatusText(kycStatus).description}</StatusDescription>
        {kycStatus === 'rejected' && (
          <Button>
            <ArrowRight size={20} />
            Resubmit Documents
          </Button>
        )}
      </StatusCard>

      <ProgressSection>
        <ProgressHeader>
          <ProgressTitle>Verification Progress</ProgressTitle>
          <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {completedSteps} of {steps.length} completed
          </span>
        </ProgressHeader>
        
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        
        <StepsContainer>
          {steps.map((step) => (
            <StepCard key={step.id} completed={step.completed}>
              <StepHeader>
                <StepIcon completed={step.completed}>
                  {step.completed ? <CheckCircle size={20} /> : step.icon}
                </StepIcon>
                <StepInfo>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </StepInfo>
              </StepHeader>
              <StepStatus status={step.status}>
                {step.status === 'completed' && <CheckCircle size={16} />}
                {step.status === 'pending' && <Clock size={16} />}
                {step.status === 'rejected' && <AlertCircle size={16} />}
                {step.status.charAt(0).toUpperCase() + step.status.slice(1).replace('_', ' ')}
              </StepStatus>
            </StepCard>
          ))}
        </StepsContainer>
      </ProgressSection>

      <FormSection>
        <FormHeader>
          <FormTitle>Personal Information</FormTitle>
          <Button variant="outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            Edit
          </Button>
        </FormHeader>
        <FormContent>
          <FormGrid>
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={personalInfo.fullName}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={personalInfo.email}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={personalInfo.phone}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={personalInfo.dateOfBirth}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Gender</Label>
              <Select value={personalInfo.gender} disabled>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>City</Label>
              <Input
                type="text"
                value={personalInfo.city}
                disabled
              />
            </FormGroup>
          </FormGrid>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormHeader>
          <FormTitle>Business Information</FormTitle>
          <Button variant="outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            Edit
          </Button>
        </FormHeader>
        <FormContent>
          <FormGrid>
            <FormGroup>
              <Label>Business Name</Label>
              <Input
                type="text"
                value={businessInfo.businessName}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Business Type</Label>
              <Select value={businessInfo.businessType} disabled>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="service">Service Provider</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>GST Number</Label>
              <Input
                type="text"
                value={businessInfo.gstNumber}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>PAN Number</Label>
              <Input
                type="text"
                value={businessInfo.panNumber}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Years in Business</Label>
              <Input
                type="text"
                value={businessInfo.yearsInBusiness}
                disabled
              />
            </FormGroup>
          </FormGrid>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormHeader>
          <FormTitle>Document Upload</FormTitle>
          <Button variant="outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            <Upload size={16} />
            Upload New
          </Button>
        </FormHeader>
        <FormContent>
          <DocumentList>
            {documents.map((doc, index) => (
              <DocumentItem key={index}>
                <DocumentIcon>
                  {doc.uploaded ? <FileText size={20} /> : <Upload size={20} />}
                </DocumentIcon>
                <DocumentName>{doc.name}</DocumentName>
                <StepStatus status={doc.status}>
                  {doc.status === 'verified' && <CheckCircle size={12} />}
                  {doc.status === 'pending' && <Clock size={12} />}
                  {doc.status === 'not_uploaded' && <Upload size={12} />}
                  {doc.status === 'verified' ? 'Verified' : 
                   doc.status === 'pending' ? 'Pending' : 'Upload'}
                </StepStatus>
                {doc.uploaded && (
                  <DocumentActions>
                    <IconButton>
                      <Eye size={14} />
                    </IconButton>
                    <IconButton>
                      <Download size={14} />
                    </IconButton>
                    <IconButton>
                      <X size={14} />
                    </IconButton>
                  </DocumentActions>
                )}
              </DocumentItem>
            ))}
          </DocumentList>
          
          {!documents.every(doc => doc.uploaded) && (
            <UploadArea style={{ marginTop: '2rem' }}>
              <UploadIcon>
                <Upload size={24} />
              </UploadIcon>
              <UploadText>
                <strong>Click to upload</strong> or drag and drop<br />
                PDF, JPG, PNG up to 10MB
              </UploadText>
            </UploadArea>
          )}
        </FormContent>
      </FormSection>
    </KYCContainer>
  );
}

export default PartnerKYC;