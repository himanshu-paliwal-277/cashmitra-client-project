import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Mail, MessageCircle, Phone, Search } from 'lucide-react';
import React, { useState } from 'react';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      id: 'faq-1',
      question: 'How do I sell my device on Cashmitra?',
      answer:
        'Click on Sell → choose category → brand → model → answer condition questions → get instant quote & free pickup.',
    },
    {
      id: 'faq-2',
      question: 'How is the price calculated?',
      answer: 'Based on model, age, condition, market demand & live resale values.',
    },
    {
      id: 'faq-3',
      question: 'When will I receive payment?',
      answer: 'Within 24–48 hours after our quality check, via UPI/Bank/Wallet.',
    },
    {
      id: 'faq-4',
      question: 'What if condition differs after pickup?',
      answer: 'Revised quote will be shared; accept or get the device returned for free.',
    },
    {
      id: 'faq-5',
      question: 'How do I track my order?',
      answer: 'Track via Dashboard → Track, plus SMS & email updates at every step.',
    },
    {
      id: 'faq-6',
      question: 'What is your return policy?',
      answer: '7-day return on purchased devices if unused & original accessories present.',
    },
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactOptions = [
    {
      icon: <MessageCircle size={24} />,
      title: 'Live Chat',
      description: 'Talk to our support instantly',
      action: 'Chat Now',
      available: '24/7 Support',
    },
    {
      icon: <Phone size={24} />,
      title: 'Phone Support',
      description: 'Speak to our executive',
      action: 'Call Now',
      available: 'Mon-Sat • 9AM–8PM',
    },
    {
      icon: <Mail size={24} />,
      title: 'Email Support',
      description: 'Response within 24 hours',
      action: 'Send Mail',
      available: '24hrs Response',
    },
  ];

  return (
    <div className="min-h-screen main-container bg-gradient-to-b from-gray-50 to-white py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-20 mt-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">How can we help you?</h1>
        <p className="text-lg text-gray-500">Browse FAQs or connect with customer care</p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-gray-200 py-3 pl-12 pr-4 text-lg
                focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          />
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FAQ */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">FAQs</h2>

          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.length ? (
              filteredFAQs.map(faq => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition"
                >
                  <AccordionTrigger className="px-6 py-4 text-lg text-left font-medium text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="text-gray-500 pt-4">No results found.</p>
            )}
          </Accordion>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contact Support</h2>

          <div className="space-y-6">
            {contactOptions.map((option, i) => (
              <Card
                key={i}
                className="p-6 text-center border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{option.title}</h3>
                <p className="text-gray-500 mb-1">{option.description}</p>
                <p className="text-sm text-gray-400 mb-4">{option.available}</p>
                <Button className="w-full">{option.action}</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
