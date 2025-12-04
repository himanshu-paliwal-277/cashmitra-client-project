import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';
import ContactFAQ from '../components/contact/ContactFAQ';

const Contact = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Contact Us - Cashmitra | Get in Touch with Our Team</title>
        <meta
          name="description"
          content="Contact Cashmitra for any questions about buying or selling devices. Our support team is available 24/7 to assist you. Call, email, or visit us today."
        />
        <meta
          name="keywords"
          content="contact cashmitra, customer support, device trading help, sell phone contact, buy phone contact"
        />
        <meta property="og:title" content="Contact Cashmitra - We're Here to Help" />
        <meta
          property="og:description"
          content="Get in touch with our team. Available 24/7 via phone, email, or live chat. We're here to answer all your questions."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/contact`} />
      </Helmet>

      {/* Page Content */}
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <ContactHero />

        {/* Form & Info Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="main-container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div>
                <ContactForm />
              </div>

              {/* Contact Info */}
              <div>
                <ContactInfo />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <ContactFAQ />
      </div>
    </>
  );
};

export default Contact;
