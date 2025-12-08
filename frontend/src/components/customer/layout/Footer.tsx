import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Truck,
  RotateCcw,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-4 mt-auto main-container">
      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {/* Company Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <img src="/main-logo.png" alt="Cashmitra Logo" className="h-8 w-auto lg:h-10" />
            <span>Cashmitra</span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            India's most trusted platform for buying and selling refurbished electronics. Get the
            best prices from verified partners.
          </p>

          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <Phone size={16} /> <span>1800-123-4567</span>
          </div>

          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <Mail size={16} /> <span>support@cashmitra.com</span>
          </div>

          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <MapPin size={16} /> <span>Bangalore, Karnataka, India</span>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            {[
              { icon: <Facebook size={20} />, url: 'https://facebook.com' },
              { icon: <Twitter size={20} />, url: 'https://twitter.com' },
              { icon: <Instagram size={20} />, url: 'https://instagram.com' },
              { icon: <Youtube size={20} />, url: 'https://youtube.com' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition transform hover:-translate-y-1"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Sell */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Sell</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/sell">
                Sell Mobile
              </Link>
            </li>
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/sell">
                Sell Tablet
              </Link>
            </li>
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/sell">
                Sell Laptop
              </Link>
            </li>
            {/* <li>
              <Link
                className="text-gray-300 text-sm hover:text-primary-light"
                to="/sell/price-calculator"
              >
                Price Calculator
              </Link>
            </li> */}
            {/* <li>
              <Link
                className="text-gray-300 text-sm hover:text-primary-light"
                to="/sell/how-it-works"
              >
                How It Works
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Buy */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Buy</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                className="text-gray-300 text-sm hover:text-primary-light"
                to="/buy?category=mobile"
              >
                Buy Mobile
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-300 text-sm hover:text-primary-light"
                to="/buy?category=tablet"
              >
                Buy Tablet
              </Link>
            </li>
            <li>
              <Link
                className="text-gray-300 text-sm hover:text-primary-light"
                to="/buy?category=laptop"
              >
                Buy Laptop
              </Link>
            </li>
            {/* <li>
              <Link
                className="text-gray-300 text-sm hover:text-primary-light"
                to="/buy/refurbished"
              >
                Refurbished Devices
              </Link>
            </li> */}
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/buy/warranty">
                Warranty Info
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Support</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/help">
                Help Center
              </Link>
            </li>
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/contact">
                Contact Us
              </Link>
            </li>
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/account/orders">
                Track Order
              </Link>
            </li> */}
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/returns-refund">
                Returns & Refunds
              </Link>
            </li>
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/faq">
                FAQ
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Company</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/about">
                About Us
              </Link>
            </li>
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/careers">
                Careers
              </Link>
            </li> */}
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/partner">
                Partner With Us
              </Link>
            </li> */}
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/press">
                Press
              </Link>
            </li> */}
            {/* <li>
              <Link className="text-gray-300 text-sm hover:text-primary-light" to="/blog">
                Blog
              </Link>
            </li> */}
          </ul>
        </div>
      </div>

      {/* ===== TRUST BADGES ===== */}
      <div className="flex flex-wrap gap-4 mt-6">
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md text-xs text-gray-300">
          <Shield size={16} /> 100% Safe & Secure
        </div>
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md text-xs text-gray-300">
          <Award size={16} /> Quality Certified
        </div>
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md text-xs text-gray-300">
          <Truck size={16} /> Free Pickup & Delivery
        </div>
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md text-xs text-gray-300">
          <RotateCcw size={16} /> 7-Day Return Policy
        </div>
      </div>

      {/* ===== BOTTOM ===== */}
      <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">© 2024 Cashmitra. All rights reserved.</p>

        <div className="flex flex-wrap gap-6">
          <Link className="text-gray-400 text-sm hover:text-primary-light" to="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-gray-400 text-sm hover:text-primary-light" to="/terms">
            Terms of Service
          </Link>
          {/* <Link className="text-gray-400 text-sm hover:text-primary-light" to="/cookies">
            Cookie Policy
          </Link> */}
          {/* <Link className="text-gray-400 text-sm hover:text-primary-light" to="/security">
            Security
          </Link> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
