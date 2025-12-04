import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import TermsHero from '../components/terms/TermsHero';
import TermsContent from '../components/terms/TermsContent';
import TermsTableOfContents from '../components/terms/TermsTableOfContents';

const Terms = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Terms & Conditions - Cashmitra | Legal Agreement</title>
        <meta
          name="description"
          content="Read Cashmitra's Terms and Conditions to understand your rights and obligations when using our device trading platform. Legal agreement for buyers and sellers."
        />
        <meta
          name="keywords"
          content="terms and conditions, legal agreement, user terms, cashmitra terms, device trading terms, buyer terms, seller terms"
        />
        <meta property="og:title" content="Terms & Conditions - Cashmitra" />
        <meta
          property="og:description"
          content="Understand your rights and obligations when using Cashmitra's device trading platform."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/terms`} />
      </Helmet>

      {/* Page Content */}
      <div className="min-h-screen bg-gradient-to-b from-white via-grey-50 to-white">
        {/* Hero Section */}
        <TermsHero />

        {/* Main Content */}
        <section className="py-12 md:py-16 main-container">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-4">
              <TermsTableOfContents />
            </div>

            {/* Terms Content - Main */}
            <div className="lg:col-span-8">
              <TermsContent />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Terms;
