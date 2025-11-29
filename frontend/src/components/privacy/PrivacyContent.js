import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

const PrivacyContent = () => {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: [
        'Welcome to Cashmitra. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website or use our services.',
        'This policy also tells you about your privacy rights and how the law protects you. Please read this privacy policy carefully before using our services.'
      ]
    },
    {
      id: 'data-collection',
      title: '2. Information We Collect',
      content: [
        'We collect different types of information for various purposes to provide and improve our service to you:'
      ],
      list: [
        '<strong>Personal Data:</strong> Name, email address, phone number, postal address',
        '<strong>Device Information:</strong> Device model, IMEI number, condition details, accessories',
        '<strong>Transaction Data:</strong> Payment details, purchase history, pricing information',
        '<strong>Technical Data:</strong> IP address, browser type, operating system, device identifiers',
        '<strong>Usage Data:</strong> How you interact with our website and services',
        '<strong>Location Data:</strong> Pickup and delivery addresses for device transactions'
      ]
    },
    {
      id: 'data-usage',
      title: '3. How We Use Your Information',
      content: [
        'We use the information we collect in the following ways:'
      ],
      list: [
        'To process your device buying and selling transactions',
        'To provide customer support and respond to your inquiries',
        'To send you service-related notifications and updates',
        'To improve our website, services, and user experience',
        'To detect, prevent, and address fraud or technical issues',
        'To comply with legal obligations and enforce our terms',
        'To send promotional content (with your consent)',
        'To analyze usage patterns and optimize our services'
      ]
    },
    {
      id: 'data-sharing',
      title: '4. Information Sharing and Disclosure',
      content: [
        'We may share your information with:'
      ],
      list: [
        '<strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, logistics partners, cloud storage providers)',
        '<strong>Partner Stores:</strong> Verified retail partners involved in device transactions',
        '<strong>Legal Authorities:</strong> When required by law or to protect our rights',
        '<strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition',
      ],
      note: 'We do not sell your personal information to third parties for marketing purposes.'
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      content: [
        'We implement appropriate technical and organizational measures to protect your personal data:',
      ],
      list: [
        '256-bit SSL encryption for all data transmission',
        'Secure data centers with restricted access',
        'Regular security audits and vulnerability assessments',
        'Employee training on data protection best practices',
        'Two-factor authentication for sensitive operations',
        'Regular backup and disaster recovery procedures'
      ]
    },
    {
      id: 'your-rights',
      title: '6. Your Privacy Rights',
      content: [
        'You have the following rights regarding your personal data:'
      ],
      list: [
        '<strong>Right to Access:</strong> Request a copy of your personal data',
        '<strong>Right to Rectification:</strong> Correct inaccurate or incomplete data',
        '<strong>Right to Erasure:</strong> Request deletion of your personal data',
        '<strong>Right to Restriction:</strong> Limit how we use your data',
        '<strong>Right to Data Portability:</strong> Receive your data in a structured format',
        '<strong>Right to Object:</strong> Object to processing of your data',
        '<strong>Right to Withdraw Consent:</strong> Withdraw consent at any time'
      ]
    },
    {
      id: 'cookies',
      title: '7. Cookies and Tracking',
      content: [
        'We use cookies and similar tracking technologies to enhance your experience:',
      ],
      list: [
        '<strong>Essential Cookies:</strong> Required for website functionality',
        '<strong>Analytics Cookies:</strong> Help us understand how you use our site',
        '<strong>Marketing Cookies:</strong> Used to deliver relevant advertisements',
        '<strong>Preference Cookies:</strong> Remember your settings and preferences'
      ],
      note: 'You can control cookie settings through your browser preferences.'
    },
    {
      id: 'third-party',
      title: '8. Third-Party Links',
      content: [
        'Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read their privacy policies before providing any information.'
      ]
    },
    {
      id: 'children',
      title: '9. Children\'s Privacy',
      content: [
        'Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.'
      ]
    },
    {
      id: 'data-retention',
      title: '10. Data Retention',
      content: [
        'We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.',
        'Transaction records are typically retained for 7 years for legal and accounting purposes. Marketing data is retained until you opt out.'
      ]
    },
    {
      id: 'international',
      title: '11. International Data Transfers',
      content: [
        'Your information may be transferred to and maintained on servers located outside of your country. We ensure appropriate safeguards are in place to protect your data during international transfers.'
      ]
    },
    {
      id: 'updates',
      title: '12. Changes to This Policy',
      content: [
        'We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.',
        'We encourage you to review this policy periodically for any changes.'
      ]
    },
    {
      id: 'contact',
      title: '13. Contact Us',
      content: [
        'If you have any questions about this privacy policy or our data practices, please contact us:'
      ],
      contact: {
        email: 'privacy@cashmitra.com',
        phone: '+91 9876543210',
        address: '123 Business Park, Sector 18, Gurugram, Haryana 122001, India'
      }
    }
  ];

  return (
    <div className="space-y-12">
      {sections.map((section, index) => (
        <div
          key={section.id}
          id={section.id}
          className="scroll-mt-24 group"
        >
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-grey-100 hover:shadow-xl transition-all duration-300">
            {/* Section Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-grey-900 mb-4 flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {index + 1}
              </span>
              {section.title.replace(/^\d+\.\s*/, '')}
            </h2>

            {/* Content */}
            <div className="space-y-4 text-grey-700 leading-relaxed">
              {section.content.map((paragraph, idx) => (
                <p key={idx} className="text-base md:text-lg">
                  {paragraph}
                </p>
              ))}

              {/* List */}
              {section.list && (
                <ul className="space-y-3 mt-4">
                  {section.list.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              )}

              {/* Note */}
              {section.note && (
                <div className="mt-4 p-4 bg-info-50 border-l-4 border-info-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-info-900">{section.note}</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {section.contact && (
                <div className="mt-6 p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-white text-xs">✉</span>
                      </div>
                      <div>
                        <div className="text-xs text-grey-600">Email</div>
                        <div className="font-semibold text-grey-900">{section.contact.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                        <span className="text-white text-xs">📞</span>
                      </div>
                      <div>
                        <div className="text-xs text-grey-600">Phone</div>
                        <div className="font-semibold text-grey-900">{section.contact.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-500 to-info-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">📍</span>
                      </div>
                      <div>
                        <div className="text-xs text-grey-600">Address</div>
                        <div className="font-semibold text-grey-900">{section.contact.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Bottom Notice */}
      <div className="bg-gradient-to-r from-warning-50 to-warning-100 border-l-4 border-warning-500 rounded-r-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-warning-900 mb-2">Important Notice</h3>
            <p className="text-sm text-warning-800 leading-relaxed">
              By using our services, you acknowledge that you have read and understood this Privacy Policy
              and agree to the collection, use, and disclosure of your information as described herein.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyContent;
