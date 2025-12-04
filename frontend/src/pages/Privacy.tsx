import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PrivacyHero from '../components/privacy/PrivacyHero';
import PrivacyContent from '../components/privacy/PrivacyContent';
import PrivacyTableOfContents from '../components/privacy/PrivacyTableOfContents';

const Privacy = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Privacy Policy - Cashmitra | Your Data Protection</title>
        <meta
          name="description"
          content="Read Cashmitra's Privacy Policy to understand how we collect, use, and protect your personal information. Your privacy is our priority."
        />
        <meta
          name="keywords"
          content="privacy policy, data protection, personal information, cashmitra privacy, user privacy"
        />
        <meta property="og:title" content="Privacy Policy - Cashmitra" />
        <meta
          property="og:description"
          content="Learn how Cashmitra protects your personal data and respects your privacy rights."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/privacy`} />
      </Helmet>

      {/* Page Content */}
      <div className="min-h-screen bg-gradient-to-b from-white via-grey-50 to-white">
        {/* Hero Section */}
        <PrivacyHero />

        {/* Main Content */}
        <section className="py-12 md:py-16 main-container">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-4">
              <PrivacyTableOfContents />
            </div>

            {/* Privacy Content - Main */}
            <div className="lg:col-span-8">
              <PrivacyContent />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Privacy;
