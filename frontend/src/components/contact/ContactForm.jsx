import { Send, User, Mail, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-grey-100">
        <div className="text-center py-12">
          <div className="inline-flex p-6 bg-gradient-to-br from-accent-500 to-accent-700 rounded-full shadow-2xl mb-6 animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-grey-900 mb-4">Message Sent!</h3>
          <p className="text-lg text-grey-600 max-w-md mx-auto">
            Thank you for reaching out. Our team will get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-grey-100 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full blur-3xl opacity-20 -z-10"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-grey-900 mb-3">Send us a Message</h2>
          <p className="text-grey-600">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Full Name <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400 group-focus-within:text-primary-600 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-grey-50 border-2 border-grey-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-grey-700 mb-2">
                Email Address <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400 group-focus-within:text-primary-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-grey-50 border-2 border-grey-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-grey-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400 group-focus-within:text-primary-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-grey-50 border-2 border-grey-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Subject <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400 group-focus-within:text-primary-600 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-grey-50 border-2 border-grey-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300"
                placeholder="How can we help you?"
              />
            </div>
          </div>

          {/* Message Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Message <span className="text-error-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-4 bg-grey-50 border-2 border-grey-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 resize-none"
              placeholder="Tell us more about your inquiry..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            {!isSubmitting && (
              <Send className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            )}
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-grey-500 text-center">
            By submitting this form, you agree to our Privacy Policy and Terms of Service.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
