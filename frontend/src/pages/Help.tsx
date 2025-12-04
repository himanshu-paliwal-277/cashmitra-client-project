import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { MessageCircle, Phone, Mail, Search } from 'lucide-react';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      id: 'faq-1',
      question: 'How do I sell my device on Cashmitra?',
      answer:
        "To sell your device, click on 'Sell' in the navigation, select your device category, choose your brand and model, answer a few questions about the condition, and get an instant quote. If you accept, we'll arrange a free pickup.",
    },
    {
      id: 'faq-2',
      question: 'How is the price of my device calculated?',
      answer:
        'Our pricing algorithm considers factors like device model, age, condition, market demand, and current resale value. We provide competitive prices based on real-time market data.',
    },
    {
      id: 'faq-3',
      question: 'When will I receive payment for my device?',
      answer:
        "Payment is processed within 24-48 hours after our quality check team verifies your device condition. You'll receive payment via bank transfer, UPI, or wallet credit.",
    },
    {
      id: 'faq-4',
      question: "What if my device condition doesn't match what I selected?",
      answer:
        "If there's a discrepancy, we'll contact you with a revised quote. You can choose to accept the new price or have your device returned at no cost.",
    },
    {
      id: 'faq-5',
      question: 'How do I track my order?',
      answer:
        "You can track your order status by clicking 'Track' in the navigation or visiting your account dashboard. You'll receive SMS and email updates at each step.",
    },
    {
      id: 'faq-6',
      question: 'What is your return policy?',
      answer:
        'We offer a 7-day return policy for purchased devices. Items must be in original condition with all accessories and packaging.',
    },
  ];

  const contactOptions = [
    {
      icon: <MessageCircle size={24} />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      available: 'Available 24/7',
    },
    {
      icon: <Phone size={24} />,
      title: 'Phone Support',
      description: 'Call us for immediate help',
      action: 'Call Now',
      available: 'Mon-Sat 9AM-8PM',
    },
    {
      icon: <Mail size={24} />,
      title: 'Email Support',
      description: 'Send us your questions',
      action: 'Send Email',
      available: 'Response within 24hrs',
    },
  ];

  return (
    <div className="min-h-screen bg-grey-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 transition-all">
            How can we help you?
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border-2 border-grey-200 rounded-xl text-lg bg-white 
                       transition-all duration-fast focus:outline-none focus:border-primary 
                       placeholder:text-text-secondary hover:border-grey-300 shadow-sm focus:shadow-md"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqData.map(faq => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="bg-white border border-grey-200 rounded-lg overflow-hidden shadow-sm 
                           hover:shadow-md transition-shadow duration-fast"
                >
                  <AccordionTrigger
                    className="px-6 py-4 text-lg font-medium text-text-primary 
                                              hover:bg-grey-50 transition-colors duration-fast text-left"
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-text-secondary leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Support Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              Contact Support
            </h2>

            <div className="space-y-6">
              {contactOptions.map((option, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-all duration-fast 
                           border-grey-200 hover:border-primary-light"
                >
                  <div
                    className="w-16 h-16 bg-primary-100 rounded-full flex items-center 
                                justify-center mx-auto mb-4 text-primary transition-transform 
                                duration-fast hover:scale-110"
                  >
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{option.title}</h3>
                  <p className="text-text-secondary mb-2">{option.description}</p>
                  <p className="text-sm text-text-secondary mb-4">{option.available}</p>
                  <Button variant="primary" fullWidth>
                    {option.action}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
