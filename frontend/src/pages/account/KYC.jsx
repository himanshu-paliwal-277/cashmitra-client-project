import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Camera,
  FileText,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  RefreshCw,
  Eye,
  Download,
  X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const KYCContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const KYCHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const PageSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const StatusCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  text-align: center;

  ${props => {
    switch (props.status) {
      case 'verified':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.success.light} 0%, ${props.theme.colors.success.main} 100%);
          color: white;
        `;
      case 'pending':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.warning.light} 0%, ${props.theme.colors.warning.main} 100%);
          color: white;
        `;
      case 'rejected':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.error.light} 0%, ${props.theme.colors.error.main} 100%);
          color: white;
        `;
      default:
        return `
          background: ${props.theme.colors.background.primary};
          border: 2px dashed ${props.theme.colors.border.primary};
        `;
    }
  }}
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.lg};
`;

const StatusTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatusDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  opacity: 0.9;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: white;
  border-radius: ${props => props.theme.borderRadius.full};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StepsContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StepCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
  transition: all 0.2s ease;

  ${props => {
    if (props.completed) {
      return `
        background: ${props.theme.colors.success.light};
        border-color: ${props.theme.colors.success.main};
      `;
    }
    if (props.active) {
      return `
        border-color: ${props.theme.colors.primary.main};
        box-shadow: 0 0 0 3px ${props.theme.colors.primary.light};
      `;
    }
    return '';
  }}
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  flex-shrink: 0;

  ${props => {
    if (props.completed) {
      return `
        background: ${props.theme.colors.success.main};
        color: white;
      `;
    }
    if (props.active) {
      return `
        background: ${props.theme.colors.primary.main};
        color: white;
      `;
    }
    return `
      background: ${props.theme.colors.background.secondary};
      color: ${props.theme.colors.text.secondary};
    `;
  }}
`;

const StepInfo = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StepDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const StepContent = styled.div`
  margin-left: 56px;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    margin-left: 0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.light};
  }

  &:disabled {
    background: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.light};
  }

  &.has-file {
    border-color: ${props => props.theme.colors.success.main};
    background: ${props => props.theme.colors.success.light};
  }
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const UploadText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const UploadSubtext = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const DocumentsList = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.primary.light};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DocumentStatus = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const DocumentActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary.light};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const StepActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const KYC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState('not_started'); // not_started, pending, verified, rejected
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      fatherName: '',
      motherName: '',
    },
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    documents: {
      aadhar: null,
      pan: null,
      bankStatement: null,
      photo: null,
    },
  });

  const steps = [
    {
      id: 1,
      title: 'Personal Information',
      description: 'Provide your basic personal details',
      icon: <User size={20} />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: 'Contact Information',
      description: 'Add your contact and address details',
      icon: <MapPin size={20} />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: 'Document Upload',
      description: 'Upload required identity documents',
      icon: <FileText size={20} />,
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: 'Verification',
      description: 'Review and submit for verification',
      icon: <Shield size={20} />,
      completed: kycStatus === 'verified',
    },
  ];

  const getStatusInfo = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          icon: <CheckCircle size={40} />,
          title: 'KYC Verified',
          description:
            'Your identity has been successfully verified. You can now access all features.',
          progress: 100,
        };
      case 'pending':
        return {
          icon: <Clock size={40} />,
          title: 'Verification Pending',
          description:
            "Your documents are under review. We'll notify you once verification is complete.",
          progress: 75,
        };
      case 'rejected':
        return {
          icon: <AlertCircle size={40} />,
          title: 'Verification Failed',
          description:
            'Some documents need to be resubmitted. Please check the requirements and try again.',
          progress: 50,
        };
      default:
        return {
          icon: <Shield size={40} />,
          title: 'Complete Your KYC',
          description:
            'Verify your identity to unlock all features and increase transaction limits.',
          progress: (currentStep - 1) * 25,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setKycStatus('pending');
    // Simulate verification process
    setTimeout(() => {
      setKycStatus('verified');
    }, 3000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormGrid>
            <FormGroup>
              <Label>Full Name *</Label>
              <Input
                type="text"
                value={formData.personalInfo.fullName}
                onChange={e => handleInputChange('personalInfo', 'fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </FormGroup>

            <FormGroup>
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                value={formData.personalInfo.dateOfBirth}
                onChange={e => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Gender *</Label>
              <Select
                value={formData.personalInfo.gender}
                onChange={e => handleInputChange('personalInfo', 'gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Father's Name</Label>
              <Input
                type="text"
                value={formData.personalInfo.fatherName}
                onChange={e => handleInputChange('personalInfo', 'fatherName', e.target.value)}
                placeholder="Enter father's name"
              />
            </FormGroup>

            <FormGroup className="full-width">
              <Label>Mother's Name</Label>
              <Input
                type="text"
                value={formData.personalInfo.motherName}
                onChange={e => handleInputChange('personalInfo', 'motherName', e.target.value)}
                placeholder="Enter mother's name"
              />
            </FormGroup>
          </FormGrid>
        );

      case 2:
        return (
          <FormGrid>
            <FormGroup>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={formData.contactInfo.email}
                onChange={e => handleInputChange('contactInfo', 'email', e.target.value)}
                placeholder="Enter email address"
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={e => handleInputChange('contactInfo', 'phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </FormGroup>

            <FormGroup className="full-width">
              <Label>Address *</Label>
              <Input
                type="text"
                value={formData.contactInfo.address}
                onChange={e => handleInputChange('contactInfo', 'address', e.target.value)}
                placeholder="Enter complete address"
              />
            </FormGroup>

            <FormGroup>
              <Label>City *</Label>
              <Input
                type="text"
                value={formData.contactInfo.city}
                onChange={e => handleInputChange('contactInfo', 'city', e.target.value)}
                placeholder="Enter city"
              />
            </FormGroup>

            <FormGroup>
              <Label>State *</Label>
              <Select
                value={formData.contactInfo.state}
                onChange={e => handleInputChange('contactInfo', 'state', e.target.value)}
              >
                <option value="">Select State</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="delhi">Delhi</option>
                <option value="karnataka">Karnataka</option>
                <option value="tamil-nadu">Tamil Nadu</option>
                <option value="gujarat">Gujarat</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>PIN Code *</Label>
              <Input
                type="text"
                value={formData.contactInfo.pincode}
                onChange={e => handleInputChange('contactInfo', 'pincode', e.target.value)}
                placeholder="Enter PIN code"
              />
            </FormGroup>
          </FormGrid>
        );

      case 3:
        return (
          <div>
            <FormGrid>
              <FormGroup>
                <Label>Aadhar Card *</Label>
                <UploadArea>
                  <UploadIcon>
                    <Upload size={24} />
                  </UploadIcon>
                  <UploadText>Upload Aadhar Card</UploadText>
                  <UploadSubtext>PDF, JPG, PNG (Max 5MB)</UploadSubtext>
                </UploadArea>
              </FormGroup>

              <FormGroup>
                <Label>PAN Card *</Label>
                <UploadArea>
                  <UploadIcon>
                    <Upload size={24} />
                  </UploadIcon>
                  <UploadText>Upload PAN Card</UploadText>
                  <UploadSubtext>PDF, JPG, PNG (Max 5MB)</UploadSubtext>
                </UploadArea>
              </FormGroup>

              <FormGroup>
                <Label>Bank Statement</Label>
                <UploadArea>
                  <UploadIcon>
                    <Upload size={24} />
                  </UploadIcon>
                  <UploadText>Upload Bank Statement</UploadText>
                  <UploadSubtext>PDF (Last 3 months)</UploadSubtext>
                </UploadArea>
              </FormGroup>

              <FormGroup>
                <Label>Profile Photo *</Label>
                <UploadArea>
                  <UploadIcon>
                    <Camera size={24} />
                  </UploadIcon>
                  <UploadText>Upload Photo</UploadText>
                  <UploadSubtext>JPG, PNG (Max 2MB)</UploadSubtext>
                </UploadArea>
              </FormGroup>
            </FormGrid>

            <DocumentsList>
              <DocumentItem>
                <DocumentIcon>
                  <FileText size={20} />
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentName>aadhar_card.pdf</DocumentName>
                  <DocumentStatus>Uploaded • 2.3 MB</DocumentStatus>
                </DocumentInfo>
                <DocumentActions>
                  <ActionButton>
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton>
                    <Download size={16} />
                  </ActionButton>
                  <ActionButton>
                    <X size={16} />
                  </ActionButton>
                </DocumentActions>
              </DocumentItem>
            </DocumentsList>
          </div>
        );

      case 4:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Shield size={80} style={{ color: '#10B981', marginBottom: '24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Ready for Verification
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#6B7280',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px',
              }}
            >
              Please review all the information you've provided. Once submitted, our team will
              verify your documents within 24-48 hours.
            </p>
            <Button variant="primary" size="lg" onClick={handleSubmit}>
              Submit for Verification
              <ArrowRight size={20} />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (kycStatus === 'verified' || kycStatus === 'pending') {
    return (
      <KYCContainer>
        <Container>
          <StatusCard status={kycStatus}>
            <StatusIcon>{statusInfo.icon}</StatusIcon>
            <StatusTitle>{statusInfo.title}</StatusTitle>
            <StatusDescription>{statusInfo.description}</StatusDescription>
            <ProgressBar>
              <ProgressFill progress={statusInfo.progress} />
            </ProgressBar>
            {kycStatus === 'pending' && (
              <Button
                variant="ghost"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <RefreshCw size={16} />
                Check Status
              </Button>
            )}
          </StatusCard>
        </Container>
      </KYCContainer>
    );
  }

  return (
    <KYCContainer>
      <Container>
        <KYCHeader>
          <PageTitle>KYC Verification</PageTitle>
          <PageSubtitle>
            Complete your Know Your Customer (KYC) verification to unlock all features and increase
            your transaction limits.
          </PageSubtitle>
        </KYCHeader>

        <StatusCard>
          <StatusIcon>{statusInfo.icon}</StatusIcon>
          <StatusTitle>{statusInfo.title}</StatusTitle>
          <StatusDescription>{statusInfo.description}</StatusDescription>
          <ProgressBar>
            <ProgressFill progress={statusInfo.progress} />
          </ProgressBar>
        </StatusCard>

        <StepsContainer>
          {steps.map(step => (
            <StepCard key={step.id} active={step.id === currentStep} completed={step.completed}>
              <StepHeader>
                <StepNumber active={step.id === currentStep} completed={step.completed}>
                  {step.completed ? <CheckCircle size={20} /> : step.id}
                </StepNumber>
                <StepInfo>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </StepInfo>
              </StepHeader>

              {step.id === currentStep && (
                <StepContent>
                  {renderStepContent()}

                  <StepActions>
                    {currentStep > 1 && (
                      <Button variant="ghost" onClick={handlePrevStep}>
                        Previous
                      </Button>
                    )}
                    {currentStep < 4 && (
                      <Button variant="primary" onClick={handleNextStep}>
                        Next Step
                        <ArrowRight size={16} />
                      </Button>
                    )}
                  </StepActions>
                </StepContent>
              )}
            </StepCard>
          ))}
        </StepsContainer>
      </Container>
    </KYCContainer>
  );
};

export default KYC;
