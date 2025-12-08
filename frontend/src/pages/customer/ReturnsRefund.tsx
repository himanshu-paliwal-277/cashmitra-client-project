import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ReturnsHero from '../../components/customer/returns/ReturnsHero';
import ReturnsContent from '../../components/customer/returns/ReturnsContent';
import ReturnsTableOfContents from '../../components/customer/returns/ReturnsTableOfContents';

const ReturnsRefund = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Returns & Refund Policy - Cashmitra | Easy Returns Process</title>
        <meta
          name="description"
          content="Learn about Cashmitra's hassle-free returns and refund policy. 7-day return window, easy process, and full refunds for eligible products. Shop with confidence."
        />
        <meta
          name="keywords"
          content="returns policy, refund policy, return process, cashmitra returns, device return, refund timeline, replacement policy, return eligibility"
        />
        <meta property="og:title" content="Returns & Refund Policy - Cashmitra" />
        <meta
          property="og:description"
          content="Easy returns and refunds at Cashmitra. 7-day return window with hassle-free process and full refunds."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/returns`} />
      </Helmet>

      {/* Page Content */}
      <div className="min-h-screen bg-gradient-to-b from-white via-grey-50 to-white">
        {/* Hero Section */}
        <ReturnsHero />

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="main-container">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Table of Contents - Sidebar */}
              <div className="lg:col-span-4">
                <ReturnsTableOfContents />
              </div>

              {/* Returns Content - Main */}
              <div className="lg:col-span-8">
                <ReturnsContent />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReturnsRefund;
