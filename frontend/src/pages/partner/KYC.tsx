import { useState, useEffect } from 'react';
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
import partnerService from '../../services/partnerService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

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
  documents: DocumentData;
}

function PartnerKYC() {
  const { partner } = usePartnerAuth() as any;
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const response = await partnerService.getProfile();

      if (response.success) {
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
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType: keyof DocumentData, file: File) => {
    try {
      setUploading(true);

      // Upload file to server
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Failed to upload file');
      }

      const fileUrl = uploadResult.data.url;

      const updatedDocuments = {
        ...documents,
        [documentType]: fileUrl,
      };

      const response = await partnerService.uploadDocuments(updatedDocuments);

      if (response.success) {
        setDocuments(updatedDocuments);
        setProfile(response.data);
      }
    } catch (err: any) {
      console.error('Error uploading document:', err);
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getVerificationStatus = () => {
    if (!profile) return 'not_started';
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
          description:
            'Some documents need to be resubmitted. Please check the requirements and try again.',
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
      title: 'Verification',
      description: 'Submit for verification',
      icon: <Shield size={20} />,
      completed: getVerificationStatus() === 'approved',
    },
  ];

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
  }) => (
    <div className="border border-slate-200 rounded-lg p-6">
      <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-600 mb-4">{description}</p>

      {currentUrl ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-sm font-medium text-green-700">Document uploaded</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1 text-green-600 hover:text-green-800">
              <Eye size={16} />
            </button>
            <button className="p-1 text-green-600 hover:text-green-800">
              <Download size={16} />
            </button>
          </div>
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
            <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
          </label>
        </div>
      )}
    </div>
  );

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
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={20} />
            Resubmit Documents
          </button>
        )}
      </div>

      {/* Progress Steps */}
      {(getVerificationStatus() === 'pending' || getVerificationStatus() === 'rejected') && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div>
            {steps.map((step, index) => (
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
                  description="Upload Aadhar Card, PAN Card, or Passport"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-6 text-center">
              <Shield size={64} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready for Verification</h3>
              <p className="text-slate-600 mb-6">
                Review your information and submit for verification. Our team will review your
                documents within 2-3 business days.
              </p>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-slate-900 mb-2">Documents Submitted:</h4>
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

              <button
                onClick={async () => {
                  try {
                    setUploading(true);
                    const response = await partnerService.uploadDocuments({
                      ...documents,
                      verificationStatus: 'submitted',
                    });
                    if (response.success) {
                      setProfile(response.data);
                      alert('Documents submitted successfully for verification!');
                    }
                  } catch (err: any) {
                    alert(err.message || 'Failed to submit documents');
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={
                  uploading ||
                  !documents.gstCertificate ||
                  !documents.shopLicense ||
                  !documents.ownerIdProof
                }
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Submit for Verification
                  </>
                )}
              </button>
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
