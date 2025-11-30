import { CheckCircle, AlertTriangle, Info, Mail, Phone } from 'lucide-react';

const TermsContent = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: [
        "By accessing and using Cashmitra's services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.",
        'These terms constitute a legally binding agreement between you and Cashmitra. Your continued use of our platform indicates your acceptance of any updates or modifications to these terms.',
      ],
      list: [
        'You must be at least 18 years old to use our services',
        'You must provide accurate and complete information',
        'You are responsible for maintaining the confidentiality of your account',
        'You agree to comply with all applicable laws and regulations',
      ],
    },
    {
      id: 'user-accounts',
      title: '2. User Accounts and Registration',
      content: [
        'To access certain features of our platform, you must register for an account. You agree to provide accurate, current, and complete information during registration.',
        'You are responsible for safeguarding your account credentials and for all activities that occur under your account.',
      ],
      list: [
        'One account per user - multiple accounts are not permitted',
        'You must verify your email address and phone number',
        'Account sharing is strictly prohibited',
        'We reserve the right to suspend or terminate accounts that violate our terms',
        'You must immediately notify us of any unauthorized access',
      ],
      important:
        'Never share your account credentials with anyone. Cashmitra will never ask for your password via email or phone.',
    },
    {
      id: 'device-selling',
      title: '3. Selling Devices',
      content: [
        'When selling devices through Cashmitra, you agree to provide accurate information about the device condition, specifications, and ownership.',
        'All devices must be legally owned by you with no outstanding payments, liens, or encumbrances.',
      ],
      list: [
        'Device must be in the condition described during evaluation',
        'All personal data must be removed from the device before handover',
        'Find My iPhone/Android Device Protection must be disabled',
        'Original purchase proof may be required for high-value devices',
        'Stolen or blacklisted devices will be rejected and reported',
        'Final price is subject to physical verification of the device',
        'Payment will be processed within 24-48 hours of device verification',
      ],
      warning:
        'Selling stolen or fraudulently obtained devices is illegal and will result in immediate account termination and legal action.',
    },
    {
      id: 'device-buying',
      title: '4. Buying Devices',
      content: [
        'When purchasing devices from Cashmitra, you agree to our quality standards and warranty terms.',
        'All devices undergo thorough testing and quality checks before being listed for sale.',
      ],
      list: [
        'All devices come with a 7-day replacement guarantee',
        'Devices are sold with clear grading (Excellent, Good, Fair)',
        'You have the right to inspect the device before final payment',
        'Return policy applies only to devices with undisclosed defects',
        'Warranty does not cover physical damage after purchase',
        'Extended warranty options are available for purchase',
      ],
    },
    {
      id: 'pricing-payment',
      title: '5. Pricing and Payment',
      content: [
        'All prices displayed on our platform are in Indian Rupees (INR) and include applicable taxes unless otherwise stated.',
        'We reserve the right to modify prices at any time without prior notice.',
      ],
      list: [
        'Quoted prices for selling are valid for 7 days',
        'Final selling price may vary based on physical inspection',
        'Payment methods: UPI, Bank Transfer, Cash (at stores)',
        'Refunds will be processed within 7-10 business days',
        'Transaction fees may apply for certain payment methods',
        'Promotional offers are subject to specific terms and conditions',
      ],
    },
    {
      id: 'warranties',
      title: '6. Warranties and Returns',
      content: [
        'For purchased devices, we provide quality assurance and warranty coverage as specified for each product.',
        'Warranty claims must be made within the specified warranty period.',
      ],
      list: [
        'Standard 7-day replacement guarantee on all purchases',
        'Extended warranty available for 6 months or 12 months',
        'Warranty covers manufacturing defects only',
        'Physical damage, liquid damage, and unauthorized repairs void warranty',
        'Return requests must be initiated within 48 hours of delivery',
        'Device must be returned in original condition with all accessories',
        'Restocking fee may apply for non-defective returns',
      ],
      important:
        'Please inspect your device immediately upon receipt and report any issues within 48 hours.',
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property Rights',
      content: [
        'All content, features, and functionality on the Cashmitra platform are owned by us and are protected by copyright, trademark, and other intellectual property laws.',
        'You may not reproduce, distribute, modify, or create derivative works without our explicit written permission.',
      ],
      list: [
        'Cashmitra logo and branding are registered trademarks',
        'Platform design, layout, and user interface are proprietary',
        'User-generated content remains the property of the user',
        'We retain the right to use testimonials and reviews for marketing',
        'Unauthorized use of our intellectual property may result in legal action',
      ],
    },
    {
      id: 'user-conduct',
      title: '8. User Conduct and Prohibited Activities',
      content: [
        'You agree to use our services only for lawful purposes and in accordance with these terms.',
        'The following activities are strictly prohibited on our platform:',
      ],
      list: [
        'Selling stolen, counterfeit, or illegally obtained devices',
        'Providing false or misleading information about devices',
        'Attempting to manipulate pricing or evaluation systems',
        'Harassing or threatening other users or staff',
        'Using automated systems or bots to access the platform',
        'Attempting to hack, disrupt, or compromise platform security',
        'Engaging in fraudulent activities or money laundering',
        'Violating any applicable laws or regulations',
      ],
      warning:
        'Violation of these terms may result in immediate account suspension, legal action, and reporting to law enforcement authorities.',
    },
    {
      id: 'limitation-liability',
      title: '9. Limitation of Liability',
      content: [
        'To the fullest extent permitted by law, Cashmitra shall not be liable for any indirect, incidental, special, consequential, or punitive damages.',
        'Our total liability for any claim arising from your use of our services shall not exceed the amount paid by you in the six months preceding the claim.',
      ],
      list: [
        'We are not liable for data loss from devices',
        'We are not responsible for third-party service failures',
        'Platform availability is not guaranteed 24/7',
        'Price fluctuations are beyond our control',
        'We are not liable for delays due to force majeure events',
        'Maximum liability limited to transaction value',
      ],
    },
    {
      id: 'dispute-resolution',
      title: '10. Dispute Resolution and Governing Law',
      content: [
        'These terms shall be governed by and construed in accordance with the laws of India.',
        'Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of courts in Gurugram, Haryana.',
      ],
      list: [
        'First attempt to resolve disputes through customer support',
        'Mediation may be required before legal proceedings',
        'Arbitration clause applies for claims under ₹5,00,000',
        'Class action lawsuits are not permitted',
        'Legal proceedings must be initiated within 1 year of dispute',
        'Language of legal proceedings shall be English',
      ],
    },
    {
      id: 'termination',
      title: '11. Account Termination',
      content: [
        'We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.',
        'You may also terminate your account at any time by contacting our support team.',
      ],
      list: [
        'Immediate termination for fraudulent activities',
        'Warning issued for minor violations before termination',
        'Pending transactions will be completed before account closure',
        'Refunds processed according to our refund policy',
        'Deleted accounts cannot be recovered',
        'You may create a new account after resolution of violations',
      ],
    },
    {
      id: 'changes-updates',
      title: '12. Changes to Terms',
      content: [
        'We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material changes via email or platform notification.',
        'Your continued use of our services after changes constitutes acceptance of the modified terms.',
      ],
      list: [
        'Users will be notified 15 days before major changes',
        'Minor updates may be made without prior notice',
        'Current version date is always displayed on this page',
        'Previous versions available upon request',
        'Users can opt out by closing their account within 30 days',
      ],
    },
    {
      id: 'contact',
      title: '13. Contact Information',
      content: [
        'If you have any questions about these Terms and Conditions, please contact us through any of the following channels:',
      ],
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      {sections.map(section => (
        <div
          key={section.id}
          id={section.id}
          className="scroll-mt-24 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-grey-100 hover:shadow-xl transition-all duration-300"
        >
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-grey-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gradient-to-r from-primary-500 to-accent-500">
            {section.title}
          </h2>

          {/* Content Paragraphs */}
          {section.content && (
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {section.content.map((paragraph, idx) => (
                <p key={idx} className="text-sm sm:text-base text-grey-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* List Items */}
          {section.list && (
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {section.list.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-grey-700"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Important Note */}
          {section.important && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-1">
                    Important
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800">{section.important}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Note */}
          {section.warning && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-red-900 mb-1">Warning</h4>
                  <p className="text-xs sm:text-sm text-red-800">{section.warning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section (Special Case) */}
          {section.id === 'contact' && (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
              {/* Email Card */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 sm:p-6 border-2 border-primary-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-grey-900">Email Us</h4>
                </div>
                <p className="text-xs sm:text-sm text-grey-600 mb-2">
                  For legal and terms inquiries:
                </p>
                <a
                  href="mailto:legal@cashmitra.com"
                  className="text-sm sm:text-base text-primary-600 font-semibold hover:underline"
                >
                  legal@cashmitra.com
                </a>
              </div>

              {/* Phone Card */}
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl p-4 sm:p-6 border-2 border-accent-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-grey-900">Call Us</h4>
                </div>
                <p className="text-xs sm:text-sm text-grey-600 mb-2">Customer support helpline:</p>
                <a
                  href="tel:+919876543210"
                  className="text-sm sm:text-base text-accent-600 font-semibold hover:underline"
                >
                  +91 9876543210
                </a>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Final Agreement Notice */}
      <div className="bg-gradient-to-br from-grey-900 to-grey-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Agreement Acknowledgment</h3>
        <p className="text-sm sm:text-base text-grey-300 max-w-2xl mx-auto leading-relaxed">
          By using Cashmitra's services, you acknowledge that you have read, understood, and agree
          to be bound by these Terms and Conditions. If you do not agree to these terms, please
          discontinue use of our platform immediately.
        </p>
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
          <span className="text-xs sm:text-sm font-semibold">Effective from January 15, 2025</span>
        </div>
      </div>
    </div>
  );
};

export default TermsContent;
