import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Camera,
  FileText,
  User,
  MapPin,
  ArrowRight,
  RefreshCw,
  Eye,
  Download,
  X,
  ArrowLeft,
  Info,
} from 'lucide-react';

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
      icon: User,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: 'Contact Information',
      description: 'Add your contact and address details',
      icon: MapPin,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: 'Document Upload',
      description: 'Upload required identity documents',
      icon: FileText,
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: 'Verification',
      description: 'Review and submit for verification',
      icon: Shield,
      completed: kycStatus === 'verified',
    },
  ];

  const getStatusInfo = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          icon: CheckCircle,
          title: 'KYC Verified',
          description:
            'Your identity has been successfully verified. You can now access all features.',
          progress: 100,
          color: 'green',
        };
      case 'pending':
        return {
          icon: Clock,
          title: 'Verification Pending',
          description:
            "Your documents are under review. We'll notify you once verification is complete.",
          progress: 75,
          color: 'yellow',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          title: 'Verification Failed',
          description:
            'Some documents need to be resubmitted. Please check the requirements and try again.',
          progress: 50,
          color: 'red',
        };
      default:
        return {
          icon: Shield,
          title: 'Complete Your KYC',
          description:
            'Verify your identity to unlock all features and increase transaction limits.',
          progress: (currentStep - 1) * 25,
          color: 'blue',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.personalInfo.fullName}
                onChange={e => handleInputChange('personalInfo', 'fullName', e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.personalInfo.dateOfBirth}
                onChange={e => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.personalInfo.gender}
                onChange={e => handleInputChange('personalInfo', 'gender', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Father&apos;s Name
              </label>
              <input
                type="text"
                value={formData.personalInfo.fatherName}
                onChange={e => handleInputChange('personalInfo', 'fatherName', e.target.value)}
                placeholder="Enter father's name"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mother&apos;s Name
              </label>
              <input
                type="text"
                value={formData.personalInfo.motherName}
                onChange={e => handleInputChange('personalInfo', 'motherName', e.target.value)}
                placeholder="Enter mother's name"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={e => handleInputChange('contactInfo', 'email', e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={e => handleInputChange('contactInfo', 'phone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactInfo.address}
                onChange={e => handleInputChange('contactInfo', 'address', e.target.value)}
                placeholder="Enter complete address"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactInfo.city}
                onChange={e => handleInputChange('contactInfo', 'city', e.target.value)}
                placeholder="Enter city"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contactInfo.state}
                onChange={e => handleInputChange('contactInfo', 'state', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select State</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="delhi">Delhi</option>
                <option value="karnataka">Karnataka</option>
                <option value="tamil-nadu">Tamil Nadu</option>
                <option value="gujarat">Gujarat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactInfo.pincode}
                onChange={e => handleInputChange('contactInfo', 'pincode', e.target.value)}
                placeholder="Enter PIN code"
                maxLength="6"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Aadhar Card <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Upload Aadhar Card</p>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PAN Card <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Upload PAN Card</p>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bank Statement
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Upload Bank Statement</p>
                  <p className="text-xs text-slate-500">PDF (Last 3 months)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profile Photo <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                    <Camera className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Upload Photo</p>
                  <p className="text-xs text-slate-500">JPG, PNG (Max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Sample uploaded document */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 mb-1">aadhar_card.pdf</p>
                  <p className="text-sm text-slate-600">Uploaded • 2.3 MB</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-white hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                    <Eye className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="w-10 h-10 bg-white hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                    <Download className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="w-10 h-10 bg-white hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready for Verification</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Please review all the information you&apos;ve provided. Once submitted, our team will
              verify your documents within 24-48 hours.
            </p>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Submit for Verification
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Status screens for verified/pending
  if (kycStatus === 'verified' || kycStatus === 'pending') {
    const bgGradient =
      kycStatus === 'verified' ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div
            className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-2xl p-8 sm:p-12 text-center text-white`}
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <StatusIcon className="w-12 h-12" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">{statusInfo.title}</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">{statusInfo.description}</p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-3 mb-8 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${statusInfo.progress}%` }}
              ></div>
            </div>

            {kycStatus === 'pending' && (
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border-2 border-white/30">
                <RefreshCw className="w-5 h-5" />
                Check Status
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">KYC Verification</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Complete your Know Your Customer (KYC) verification to unlock all features and increase
            your transaction limits.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center border-2 border-slate-200">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StatusIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{statusInfo.title}</h2>
          <p className="text-slate-600 mb-6">{statusInfo.description}</p>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${statusInfo.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.completed;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg'
                          : isActive
                            ? 'bg-blue-600 text-white shadow-lg scale-110'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 font-medium hidden sm:block ${isActive ? 'text-blue-600' : 'text-slate-600'}`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                {(() => {
                  const CurrentStepIcon = steps[currentStep - 1].icon;
                  return <CurrentStepIcon className="w-6 h-6" />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{steps[currentStep - 1].title}</h3>
                <p className="text-blue-100 text-sm">{steps[currentStep - 1].description}</p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 sm:p-8">
            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  All fields marked with <span className="text-red-500 font-bold">*</span> are
                  mandatory. Please ensure all information is accurate.
                </p>
              </div>
            </div>

            {renderStepContent()}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex flex-wrap gap-4 justify-center items-center mt-8 pt-6 border-t-2 border-slate-200">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
                <button
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYC;
