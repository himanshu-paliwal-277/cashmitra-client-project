import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: MapPin,
      title: 'Visit Our Office',
      details: ['123 Business Park, Sector 18', 'Gurugram, Haryana 122001', 'India'],
      color: 'primary',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 9876543210', '+91 9876543211', 'Mon-Sun: 9AM - 9PM'],
      color: 'accent',
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['support@cashmitra.com', 'sales@cashmitra.com', 'We reply within 24 hours'],
      color: 'info',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Monday - Saturday: 9AM - 9PM', 'Sunday: 10AM - 6PM', 'Public Holidays: Closed'],
      color: 'warning',
    },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: '#', color: 'from-blue-500 to-blue-700' },
    { icon: Twitter, label: 'Twitter', url: '#', color: 'from-sky-500 to-sky-700' },
    { icon: Instagram, label: 'Instagram', url: '#', color: 'from-pink-500 to-pink-700' },
    { icon: Linkedin, label: 'LinkedIn', url: '#', color: 'from-blue-600 to-blue-800' },
  ];

  return (
    <div className="space-y-8">
      {/* Contact Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {contactDetails.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 border-2 border-grey-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}
              ></div>

              <div className="relative">
                {/* Icon */}
                <div
                  className={`inline-flex p-4 bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 rounded-xl shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-grey-900 mb-3">{item.title}</h3>

                {/* Details */}
                <div className="space-y-1">
                  {item.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-grey-600 leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>

              {/* Bottom Accent */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${item.color}-500 to-${item.color}-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl`}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Map Placeholder */}
      <div className="relative bg-white rounded-2xl p-6 border-2 border-grey-100 shadow-lg overflow-hidden group">
        <h3 className="text-xl font-bold text-grey-900 mb-4">Find Us on Map</h3>

        {/* Map Container */}
        <div className="relative h-64 md:h-96 bg-gradient-to-br from-grey-100 to-grey-200 rounded-xl overflow-hidden">
          {/* Placeholder for actual map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <p className="text-grey-600 font-medium">Interactive Map</p>
              <p className="text-sm text-grey-500">123 Business Park, Gurugram</p>
            </div>
          </div>

          {/* You can integrate Google Maps or Mapbox here */}
          <iframe
            title="Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14030.834434445278!2d77.02664!3d28.4595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d22fe277d0001%3A0x0!2zMjjCsDI3JzM0LjIiTiA3N8KwMDEnMzUuOSJF!5e0!3m2!1sen!2sin!4v1234567890"
            className="absolute inset-0 w-full h-full border-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            // @ts-expect-error
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        {/* Get Directions Button */}
        <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
          <MapPin className="w-5 h-5" />
          Get Directions
        </button>
      </div>

      {/* Social Media */}
      <div className="bg-gradient-to-br from-grey-50 to-white rounded-2xl p-8 border-2 border-grey-100 shadow-lg">
        <h3 className="text-xl font-bold text-grey-900 mb-6 text-center">
          Follow Us on Social Media
        </h3>

        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${social.color} rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                ></div>
                <div
                  className={`relative inline-flex p-4 bg-gradient-to-br ${social.color} rounded-xl shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </a>
            );
          })}
        </div>

        <p className="text-sm text-grey-600 text-center mt-6">
          Stay updated with the latest news, offers, and product launches
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;
