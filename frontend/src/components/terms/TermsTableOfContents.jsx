import { useState, useEffect } from 'react';
import { List, ChevronRight } from 'lucide-react';

const TermsTableOfContents = () => {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'user-accounts', title: 'User Accounts' },
    { id: 'device-selling', title: 'Selling Devices' },
    { id: 'device-buying', title: 'Buying Devices' },
    { id: 'pricing-payment', title: 'Pricing & Payment' },
    { id: 'warranties', title: 'Warranties & Returns' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'user-conduct', title: 'User Conduct' },
    { id: 'limitation-liability', title: 'Limitation of Liability' },
    { id: 'dispute-resolution', title: 'Dispute Resolution' },
    { id: 'termination', title: 'Account Termination' },
    { id: 'changes-updates', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Us' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = id => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="lg:sticky lg:top-24">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-grey-100">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-grey-100">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
            <List className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-grey-900">Table of Contents</h3>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 max-h-[60vh] lg:max-h-none overflow-y-auto">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-2 sm:gap-3 group ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-primary-50 to-accent-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                  : 'hover:bg-grey-50 text-grey-700 border-l-4 border-transparent'
              }`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                    : 'bg-grey-100 text-grey-600 group-hover:bg-primary-100 group-hover:text-primary-600'
                }`}
              >
                {index + 1}
              </span>
              <span className="flex-1 text-xs sm:text-sm leading-tight">{section.title}</span>
              <ChevronRight
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 ${
                  activeSection === section.id
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Quick Action */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-grey-100">
          <a
            href="#contact"
            className="block w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center text-xs sm:text-base font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Have Questions?
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsTableOfContents;
