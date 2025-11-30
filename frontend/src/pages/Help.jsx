import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const HelpContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.grey[50]};
  padding: ${theme.spacing[8]} 0;
`;

const HelpContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const HelpHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[12]};
`;

const HelpTitle = styled.h1`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['5xl']};
  }
`;

const HelpSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[4]} ${theme.spacing[6]} ${theme.spacing[4]} ${theme.spacing[12]};
  border: 2px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.lg};
  background: ${theme.colors.white};
  transition: border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
  }

  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.tertiary};
`;

const HelpSections = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[8]};

  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[8]};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
`;

const FAQItem = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[4]};
  overflow: hidden;
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  text-align: left;
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  &:hover {
    background: ${theme.colors.grey[50]};
  }
`;

const FAQAnswer = styled.div`
  padding: 0 ${theme.spacing[6]} ${theme.spacing[4]};
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
`;

const ContactCard = styled(Card)`
  padding: ${theme.spacing[6]};
  text-align: center;
`;

const ContactIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]};
  color: ${theme.colors.primary.main};
`;

const ContactTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const ContactDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[4]};
`;

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqData = [
    {
      question: 'How do I sell my device on Cashmitra?',
      answer:
        "To sell your device, click on 'Sell' in the navigation, select your device category, choose your brand and model, answer a few questions about the condition, and get an instant quote. If you accept, we'll arrange a free pickup.",
    },
    {
      question: 'How is the price of my device calculated?',
      answer:
        'Our pricing algorithm considers factors like device model, age, condition, market demand, and current resale value. We provide competitive prices based on real-time market data.',
    },
    {
      question: 'When will I receive payment for my device?',
      answer:
        "Payment is processed within 24-48 hours after our quality check team verifies your device condition. You'll receive payment via bank transfer, UPI, or wallet credit.",
    },
    {
      question: "What if my device condition doesn't match what I selected?",
      answer:
        "If there's a discrepancy, we'll contact you with a revised quote. You can choose to accept the new price or have your device returned at no cost.",
    },
    {
      question: 'How do I track my order?',
      answer:
        "You can track your order status by clicking 'Track' in the navigation or visiting your account dashboard. You'll receive SMS and email updates at each step.",
    },
    {
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

  const toggleFAQ = index => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <HelpContainer>
      <HelpContent>
        <HelpHeader>
          <HelpTitle>How can we help you?</HelpTitle>
          <HelpSubtitle>
            Find answers to common questions or get in touch with our support team
          </HelpSubtitle>

          <SearchContainer>
            <SearchIcon size={20} />
            <SearchInput
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
        </HelpHeader>

        <HelpSections>
          <MainContent>
            <div>
              <SectionTitle>Frequently Asked Questions</SectionTitle>
              {faqData.map((faq, index) => (
                <FAQItem key={index}>
                  <FAQQuestion onClick={() => toggleFAQ(index)}>
                    {faq.question}
                    {openFAQ === index ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </FAQQuestion>
                  <FAQAnswer $isOpen={openFAQ === index}>{faq.answer}</FAQAnswer>
                </FAQItem>
              ))}
            </div>
          </MainContent>

          <Sidebar>
            <div>
              <SectionTitle>Contact Support</SectionTitle>
              {contactOptions.map((option, index) => (
                <ContactCard key={index}>
                  <ContactIcon>{option.icon}</ContactIcon>
                  <ContactTitle>{option.title}</ContactTitle>
                  <ContactDescription>{option.description}</ContactDescription>
                  <ContactDescription
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing[4],
                    }}
                  >
                    {option.available}
                  </ContactDescription>
                  <Button variant="primary" fullWidth>
                    {option.action}
                  </Button>
                </ContactCard>
              ))}
            </div>
          </Sidebar>
        </HelpSections>
      </HelpContent>
    </HelpContainer>
  );
};

export default Help;
