import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Eye,
  Download,
  User,
  FileText,
  ArrowRight,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import partnerService from '../../services/partnerService';
import { API_BASE_URL } from '../../utils/api';

interface DocumentData {
  gstCertificate: string;
  shopLicense: string;
  ownerIdProof: string;
  additionalDocuments: string[];
}

interface PartnerProfile {
  _id: string;
  shopName: string;
  shopEmail: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'submitted';
  verificationNotes?: string;
  documents: DocumentData;
}

function PartnerKYC() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [documents, setDocuments] = useState<DocumentData>({
    gstCertificate: '',
    shopLicense: '',
    ownerIdProof: '',
    additionalDocuments: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getProfile();

      if (response.success) {
        console.log('Profile fetched:', response.data);
        setProfile(response.data);
        setDocuments(
          response.data.documents || {
            gstCertificate: '',
            shopLicense: '',
            ownerIdProof: '',
            additionalDocuments: [],
          }
        );
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType: keyof DocumentData, file: File) => {
    try {
      setUploading(true);

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, JPG, JPEG, and PNG files are allowed');
      }

      // Upload file to server
      const formData = new FormData();
      formData.append('document', file);

      const uploadResponse = await axios.post(`${API_BASE_URL}/upload/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || 'Failed to upload file');
      }

      const fileUrl = uploadResponse.data.data.url;

      const updatedDocuments = {
        ...documents,
        [documentType]: fileUrl,
      };

      // Check if all required documents are now uploaded
      const allDocumentsUploaded = !!(
        updatedDocuments.gstCertificate &&
        updatedDocuments.shopLicense &&
        updatedDocuments.ownerIdProof
      );

      // If resubmitting (status was rejected), reset to pending first, then submit if all docs are uploaded
      const isResubmission = getVerificationStatus() === 'rejected';
      const newStatus = isResubmission
        ? allDocumentsUploaded
          ? 'submitted'
          : 'pending'
        : allDocumentsUploaded
          ? 'submitted'
          : 'pending';

      // Only send documents that have URLs to avoid validation errors
      const dataToSend: any = {};
      if (updatedDocuments.gstCertificate) {
        dataToSend.gstCertificate = updatedDocuments.gstCertificate;
      }
      if (updatedDocuments.shopLicense) {
        dataToSend.shopLicense = updatedDocuments.shopLicense;
      }
      if (updatedDocuments.ownerIdProof) {
        dataToSend.ownerIdProof = updatedDocuments.ownerIdProof;
      }
      if (updatedDocuments.additionalDocuments && updatedDocuments.additionalDocuments.length > 0) {
        dataToSend.additionalDocuments = updatedDocuments.additionalDocuments;
      }

      // Only add verification status if all documents are uploaded
      if (allDocumentsUploaded) {
        dataToSend.verificationStatus = newStatus;
      }

      const response = await partnerService.uploadDocuments(dataToSend);

      if (response.success) {
        // Update documents from backend response
        const backendDocuments = response.data.documents || {};
        setDocuments(backendDocuments);

        // Check if all documents are present in backend response
        const allBackendDocsPresent = !!(
          backendDocuments.gstCertificate &&
          backendDocuments.shopLicense &&
          backendDocuments.ownerIdProof
        );

        // If we're in resubmission mode and all docs are present, but status is still rejected,
        // we need to submit for review
        if (
          isResubmission &&
          allBackendDocsPresent &&
          response.data.verificationStatus === 'rejected'
        ) {
          console.log('All documents present during resubmission, submitting for review...');

          // Submit for review with all documents
          try {
            const submitResponse = await partnerService.uploadDocuments({
              ...backendDocuments,
              verificationStatus: 'submitted',
            });

            if (submitResponse.success) {
              setProfile(submitResponse.data);
              toast.success(
                'All documents resubmitted successfully! Your KYC has been submitted for review again.'
              );
              // Refresh profile to get updated status
              setTimeout(() => {
                fetchProfile();
              }, 1000);
            } else {
              setProfile(response.data);
              toast.success(
                `${documentType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} uploaded successfully! Please upload remaining documents.`
              );
            }
          } catch (submitErr) {
            console.error('Error submitting for review:', submitErr);
            setProfile(response.data);
            toast.success(
              `${documentType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} uploaded successfully! Please upload remaining documents.`
            );
          }
        } else {
          setProfile(response.data);

          // Show success message based on whether it was auto-submitted
          if (allBackendDocsPresent && response.data.verificationStatus === 'submitted') {
            if (isResubmission) {
              toast.success(
                'All documents resubmitted successfully! Your KYC has been submitted for review again.'
              );
            } else {
              toast.success(
                'All documents uploaded successfully! Your KYC has been automatically submitted for review.'
              );
            }
            // Refresh profile to get updated status
            setTimeout(() => {
              fetchProfile();
            }, 1000);
          } else {
            toast.success(
              `${documentType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} uploaded successfully!`
            );
          }
        }
      }
    } catch (err: any) {
      console.error('Error uploading document:', err);
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleResubmitDocuments = async () => {
    try {
      console.log('Starting resubmit process...');
      console.log('Current documents:', documents);

      // Show loading state briefly for user feedback
      setUploading(true);

      // Clear documents locally so user can upload fresh ones
      const clearedDocuments = {
        gstCertificate: '',
        shopLicense: '',
        ownerIdProof: '',
        additionalDocuments: [],
      };
      setDocuments(clearedDocuments);

      // Reset verification status to pending and clear documents in backend
      const response = await partnerService.uploadDocuments({
        gstCertificate: '',
        shopLicense: '',
        ownerIdProof: '',
        additionalDocuments: [],
        verificationStatus: 'pending',
      });

      if (response.success) {
        setProfile(response.data);
        console.log('Updated profile via API to pending with cleared documents:', response.data);
      } else {
        // Fallback: update locally
        if (profile) {
          const updatedProfile = {
            ...profile,
            verificationStatus: 'pending' as const,
            documents: clearedDocuments,
          };
          setProfile(updatedProfile);
        }
      }

      setCurrentStep(2);
      toast.success('Ready to resubmit documents. Please upload your documents again.');
    } catch (err: any) {
      console.error('Error in resubmit process:', err);

      // Fallback: update locally
      if (profile) {
        const clearedDocuments = {
          gstCertificate: '',
          shopLicense: '',
          ownerIdProof: '',
          additionalDocuments: [],
        };
        const updatedProfile = {
          ...profile,
          verificationStatus: 'pending' as const,
          documents: clearedDocuments,
        };
        setProfile(updatedProfile);
        setDocuments(clearedDocuments);
      }
      setCurrentStep(2);
      toast.success('Ready to resubmit documents. Please upload your documents again.');
    } finally {
      setUploading(false);
    }
  };

  const getVerificationStatus = () => {
    if (!profile) return 'not_started';
    console.log('Profile verification status:', profile.verificationStatus);
    return profile.verificationStatus;
  };

  const getStatusInfo = () => {
    const status = getVerificationStatus();
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle size={48} className="text-green-500" />,
          title: 'KYC Verified',
          description:
            'Your account has been successfully verified. You can now access all partner features.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'submitted':
        return {
          icon: <Clock size={48} className="text-yellow-500" />,
          title: 'KYC Under Review',
          description:
            'Your documents are being reviewed. This process usually takes 2-3 business days.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'rejected':
        return {
          icon: <AlertCircle size={48} className="text-red-500" />,
          title: 'KYC Rejected',
          description: profile?.verificationNotes
            ? `Rejection reason: ${profile.verificationNotes}. Please review the feedback and resubmit your documents.`
            : 'Some documents need to be resubmitted. Please check the requirements and try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <Shield size={48} className="text-blue-500" />,
          title: 'Complete Your KYC',
          description: 'Please complete your KYC verification to access all partner features.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Profile Review',
      description: 'Review your profile information',
      icon: <User size={20} />,
      completed: !!profile?.shopName,
    },
    {
      id: 2,
      title: 'Document Upload',
      description: 'Upload required documents',
      icon: <FileText size={20} />,
      completed: !!(documents.gstCertificate && documents.shopLicense && documents.ownerIdProof),
    },
    {
      id: 3,
      title: 'Auto-Verification',
      description: 'Automatic submission when complete',
      icon: <Shield size={20} />,
      completed: getVerificationStatus() === 'approved',
    },
  ];

  // Auto-advance to step 3 when all documents are uploaded
  useEffect(() => {
    const allDocumentsUploaded = !!(
      documents.gstCertificate &&
      documents.shopLicense &&
      documents.ownerIdProof
    );
    if (allDocumentsUploaded && currentStep < 3) {
      setCurrentStep(3);
    }
  }, [documents, currentStep]);

  // Initialize currentStep based on completion status
  useEffect(() => {
    if (profile && documents) {
      const allDocumentsUploaded = !!(
        documents.gstCertificate &&
        documents.shopLicense &&
        documents.ownerIdProof
      );
      if (allDocumentsUploaded) {
        setCurrentStep(3);
      } else if (profile.shopName) {
        setCurrentStep(2);
      }
    }
  }, [profile, documents]);

  const DocumentUploadCard = ({
    title,
    documentType,
    currentUrl,
    description,
  }: {
    title: string;
    documentType: keyof DocumentData;
    currentUrl: string;
    description: string;
  }) => {
    const status = getVerificationStatus();
    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';
    const canReplace = !isApproved; // Can replace unless approved

    return (
      <div className="border border-slate-200 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-600 mb-4">{description}</p>

        {currentUrl ? (
          <div className="space-y-3">
            {/* Current Document Display */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                isApproved
                  ? 'bg-green-50 border border-green-200'
                  : isRejected
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {isApproved ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : isRejected ? (
                  <AlertCircle size={20} className="text-red-500" />
                ) : (
                  <Clock size={20} className="text-blue-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isApproved ? 'text-green-700' : isRejected ? 'text-red-700' : 'text-blue-700'
                  }`}
                >
                  {isApproved
                    ? 'Document verified'
                    : isRejected
                      ? 'Document rejected - needs resubmission'
                      : 'Document uploaded'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(currentUrl, '_blank')}
                  className={`p-1 hover:opacity-80 ${
                    isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-blue-600'
                  }`}
                  title="View Document"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentUrl;
                    link.download = `${title.replace(/\s+/g, '_')}.jpg`;
                    link.click();
                  }}
                  className={`p-1 hover:opacity-80 ${
                    isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-blue-600'
                  }`}
                  title="Download Document"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Replace Document Option */}
            {canReplace && (
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isRejected
                    ? 'border-red-300 bg-red-50 hover:border-red-400'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                }`}
              >
                <input
                  type="file"
                  id={`${documentType}_replace`}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const message = isRejected
                        ? `Are you sure you want to resubmit the ${title}? This will update your KYC submission.`
                        : `Are you sure you want to replace the ${title}? This will update your current document.`;

                      if (confirm(message)) {
                        handleDocumentUpload(documentType, file);
                      }
                    }
                  }}
                />
                <label htmlFor={`${documentType}_replace`} className="cursor-pointer">
                  <RefreshCw
                    size={24}
                    className={`mx-auto mb-2 ${isRejected ? 'text-red-500' : 'text-gray-500'}`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      isRejected ? 'text-red-700' : 'text-gray-700'
                    }`}
                  >
                    {isRejected ? 'Resubmit document' : 'Replace document'}
                  </p>
                  <p className={`text-xs ${isRejected ? 'text-red-600' : 'text-gray-500'}`}>
                    Click to upload a new version (PDF, JPG, PNG up to 10MB)
                  </p>
                </label>
              </div>
            )}

            {/* Show message for approved documents */}
            {isApproved && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Document verified and approved. Changes not allowed.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id={documentType}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  handleDocumentUpload(documentType, file);
                }
              }}
            />
            <label htmlFor={documentType} className="cursor-pointer">
              <Upload size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">Click to upload</p>
              <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
            </label>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading KYC information...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">KYC Verification</h1>
        <p className="text-slate-600">Complete your verification to unlock all partner features</p>
      </div>

      {/* Status Card */}
      <div
        className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-8 mb-8 text-center`}
      >
        <div className="mb-4 flex justify-center items-center">{statusInfo.icon}</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{statusInfo.title}</h2>
        <p className="text-slate-600 mb-4">{statusInfo.description}</p>

        {getVerificationStatus() === 'rejected' && (
          <>
            {profile?.verificationNotes && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Rejection Reason
                </h4>
                <p className="text-red-700 text-sm">{profile.verificationNotes}</p>
              </div>
            )}
            <button
              onClick={handleResubmitDocuments}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw size={20} />
              Resubmit Documents
            </button>
          </>
        )}
      </div>

      {/* Progress Steps */}
      {(getVerificationStatus() === 'pending' || getVerificationStatus() === 'rejected') && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div>
            {steps.map(step => (
              <div
                key={step.id}
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep === step.id
                    ? 'text-blue-600'
                    : step.completed
                      ? 'text-green-600'
                      : 'text-slate-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step.completed ? <CheckCircle size={20} /> : step.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      {(getVerificationStatus() === 'pending' || getVerificationStatus() === 'rejected') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {currentStep === 1 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={profile?.shopName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Shop Email
                  </label>
                  <input
                    type="email"
                    value={profile?.shopEmail || ''}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your profile information is automatically populated from
                  your registration. If you need to make changes, please contact support.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Upload</h3>
              <div className="grid gap-6">
                <DocumentUploadCard
                  title="GST Certificate"
                  documentType="gstCertificate"
                  currentUrl={documents.gstCertificate}
                  description="Upload your valid GST registration certificate"
                />
                <DocumentUploadCard
                  title="Shop License"
                  documentType="shopLicense"
                  currentUrl={documents.shopLicense}
                  description="Upload your shop/trade license or establishment certificate"
                />
                <DocumentUploadCard
                  title="Owner ID Proof"
                  documentType="ownerIdProof"
                  currentUrl={documents.ownerIdProof}
                  description="Upload Aadhaar Card, PAN Card, or Passport"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-6 text-center">
              <Shield size={64} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {getVerificationStatus() === 'pending'
                  ? 'Upload Documents to Submit'
                  : getVerificationStatus() === 'submitted'
                    ? 'KYC Under Review'
                    : getVerificationStatus() === 'approved'
                      ? 'KYC Verified'
                      : 'KYC Rejected'}
              </h3>
              <p className="text-slate-600 mb-6">
                {getVerificationStatus() === 'pending'
                  ? 'Upload all required documents in Step 2. Your KYC will be automatically submitted for review once all documents are uploaded.'
                  : getVerificationStatus() === 'submitted'
                    ? 'Your documents have been automatically submitted and are under review. We will notify you once the verification is complete.'
                    : getVerificationStatus() === 'approved'
                      ? 'Your KYC verification has been approved. You now have full access to all partner features.'
                      : 'Your KYC verification was rejected. Please review the feedback and resubmit your documents.'}
              </p>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-slate-900 mb-2">
                  {getVerificationStatus() === 'pending'
                    ? 'Required Documents:'
                    : 'Documents Status:'}
                </h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    {documents.gstCertificate ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    GST Certificate
                  </div>
                  <div className="flex items-center gap-2">
                    {documents.shopLicense ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    Shop License
                  </div>
                  <div className="flex items-center gap-2">
                    {documents.ownerIdProof ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    Owner ID Proof
                  </div>
                </div>
              </div>

              {getVerificationStatus() === 'pending' && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                    <Shield size={20} />
                    <span>
                      {documents.gstCertificate && documents.shopLicense && documents.ownerIdProof
                        ? 'All documents uploaded! KYC automatically submitted for review.'
                        : 'Upload all required documents to automatically submit for verification'}
                    </span>
                  </div>
                </div>
              )}

              {getVerificationStatus() === 'submitted' && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-50 text-yellow-600 rounded-lg border border-yellow-200">
                    <Clock size={20} />
                    <span>KYC automatically submitted and under review</span>
                  </div>
                </div>
              )}

              {getVerificationStatus() === 'approved' && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-lg border border-green-200">
                    <CheckCircle size={20} />
                    <span>KYC verification completed successfully</span>
                  </div>
                </div>
              )}

              {getVerificationStatus() === 'rejected' && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
                    <AlertCircle size={20} />
                    <span>KYC verification rejected - please resubmit documents</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {currentStep < 3 && (
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={24} />
            <span className="text-slate-700">Uploading document...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerKYC;
