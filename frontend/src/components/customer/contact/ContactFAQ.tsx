import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How quickly will I receive a response?',
      answer:
        'We typically respond to all inquiries within 24 hours during business days. For urgent matters, you can call our customer support hotline for immediate assistance.',
    },
    {
      question: 'What information should I include in my message?',
      answer:
        "Please provide your full name, contact details, and a detailed description of your inquiry. If it's related to a specific order or device, include relevant order numbers or device details.",
    },
    {
      question: 'Can I visit your office in person?',
      answer:
        'Yes! You can visit our office during business hours (Monday-Saturday, 9AM-9PM). We recommend scheduling an appointment in advance to ensure our team is available to assist you.',
    },
    {
      question: 'Do you provide support outside business hours?',
      answer:
        "Our live chat and phone support are available 24/7. For email inquiries sent outside business hours, we'll respond on the next business day.",
    },
    {
      question: 'How can I track my submitted inquiry?',
      answer:
        "After submitting your inquiry through our contact form, you'll receive a confirmation email with a ticket number. You can use this number to track the status of your inquiry.",
    },
    {
      question: 'What if I need technical support?',
      answer:
        'For technical issues related to our platform, device evaluation, or transactions, please email tech@cashmitra.com or use the live chat feature for instant support from our technical team.',
    },
  ];

  const toggleFAQ = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-grey-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-100 mb-4">
              <HelpCircle className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Quick Answers</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-grey-900 mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="sm:text-lg text-grey-600">
              Find answers to common questions about contacting our support team
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="group relative bg-white sm:rounded-2xl rounded-lg border-2 border-grey-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Border on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${isOpen ? 'opacity-100' : ''}`}
                  ></div>

                  {/* Question Button */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 sm:px-6 sm:py-5 py-3 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span
                      className={`font-semibold text-sm sm:text-lg pr-8 transition-colors duration-300 ${isOpen ? 'text-primary-600' : 'text-grey-900'}`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen ? 'bg-gradient-to-br from-primary-500 to-primary-700' : 'bg-grey-100'
                      }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-all duration-300 ${
                          isOpen ? 'rotate-180 text-white' : 'text-grey-600'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5 pt-2">
                      <div className="border-t-2 border-grey-100 pt-4">
                        <p className="text-grey-600 leading-relaxed sm:text-md text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
                  <div
                    className={`h-1 bg-gradient-to-r from-primary-500 to-accent-500 transform origin-left transition-all duration-500 ${
                      isOpen ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Still have questions CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary-50 via-white to-accent-50 rounded-2xl p-8 border-2 border-grey-100">
            <h3 className="text-xl font-bold text-grey-900 mb-3">Still have questions?</h3>
            <p className="text-grey-600 mb-6">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;
