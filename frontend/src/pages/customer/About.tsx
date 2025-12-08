import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AboutHero from '../../components/customer/about/AboutHero';
import AboutStats from '../../components/customer/about/AboutStats';
import AboutMission from '../../components/customer/about/AboutMission';
import AboutFeatures from '../../components/customer/about/AboutFeatures';
import AboutCTA from '../../components/customer/about/AboutCTA';

const About = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>About Us - Cashmitra | Your Trusted Device Trading Platform</title>
        <meta
          name="description"
          content="Learn about Cashmitra's mission to revolutionize device trading in India. Trusted by 50,000+ customers for buying and selling quality pre-owned devices."
        />
        <meta
          name="keywords"
          content="about cashmitra, device trading platform, buy sell phones, pre-owned devices, sustainable technology"
        />
        <meta
          property="og:title"
          content="About Cashmitra - India's Most Trusted Device Trading Platform"
        />
        <meta
          property="og:description"
          content="Discover how Cashmitra is making device trading transparent, secure, and sustainable. Join 50,000+ satisfied customers."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/about`} />
      </Helmet>

      {/* Page Content */}
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <AboutHero />

        {/* Stats Section */}
        <AboutStats />

        {/* Mission & Vision Section */}
        <AboutMission />

        {/* Features Section */}
        <AboutFeatures />

        {/* CTA Section */}
        <AboutCTA />
      </div>
    </>
  );
};

export default About;
