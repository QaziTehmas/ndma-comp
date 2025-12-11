import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Github, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'About Us', path: '/about' },
    ],
    history: [
      { label: 'Floods History', path: '/history/floods' },
      { label: 'Earthquake History', path: '/history/earthquakes' },
    ],
    dashboard: [
      { label: 'Overview', path: '/dashboard' },
      { label: 'Weather Monitoring', path: '/dashboard/weather' },
      { label: 'Fire Risk', path: '/dashboard/fire-risk' },
      { label: 'Flood Prediction', path: '/dashboard/flood-prediction' },
      { label: 'Analytics', path: '/dashboard/analytics' },
    ],
  };

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, url: 'https://github.com/AbdurRahmanCodes', label: 'GitHub' },
    { icon: <Linkedin className="w-5 h-5" />, url: 'https://www.linkedin.com/in/abdur-rahmanml/', label: 'LinkedIn' },
    { icon: <Instagram className="w-5 h-5"/>, url: 'https://www.instagram.com/abdulrahman._.mani/', label: 'Instagram'}
  ];

  const contactInfo = [
    { icon: <Mail className="w-4 h-4" />, text: 'techxonomy.services@gmail.com' },
    { icon: <Phone className="w-4 h-4" />, text: '+92 333 4374533' },
    { icon: <MapPin className="w-4 h-4" />, text: 'Islamabad, Pakistan' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="brand-link">
              <div className="brand-icon">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="brand-name">PDME</span>
            </Link>
            <p className="brand-description">
              Pakistan Disaster Management Ecosystem - Leveraging technology and data analytics 
              to build resilience against natural disasters across Pakistan.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links-grid">
            {/* Platform Links */}
            <div className="footer-links-section">
              <h3 className="links-title">Platform</h3>
              <ul className="links-list">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* History Links */}
            <div className="footer-links-section">
              <h3 className="links-title">History</h3>
              <ul className="links-list">
                {footerLinks.history.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard Links */}
            <div className="footer-links-section">
              <h3 className="links-title">Dashboard</h3>
              <ul className="links-list">
                {footerLinks.dashboard.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-links-section">
              <h3 className="links-title">Contact</h3>
              <ul className="contact-list">
                {contactInfo.map((contact, index) => (
                  <li key={index} className="contact-item">
                    <span className="contact-icon">{contact.icon}</span>
                    <span className="contact-text">{contact.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Techxonomy. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#" className="bottom-link">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#" className="bottom-link">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#" className="bottom-link">Cookie Policy</a>
            </div>
            <p className="made-by">
              Built by TechXonomy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

