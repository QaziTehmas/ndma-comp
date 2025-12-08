import React from "react";
import {
  Code,
  Brain,
  Database,
  Cpu,
  Github,
  Linkedin,
  Mail,
  Layout,
  Palette,
  BarChart3,
  Map,
  Server,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import "./AboutUs.css";

const AboutUs = () => {
  const team = [
    {
      name: "Muhammad Zain Nasir",
      role: "Full Stack Web Developer",
      icon: <Code className="w-6 h-6" />,
      color: "blue",
      image: "/team/mzain.jpg",
      socials: {
        github: "https://github.com/mzainnasir010",
        linkedin: "https://www.linkedin.com/in/muhammad-zain-nasir-811303365",
        email: "zainnasir6921@gmail.com",
      },
    },
    {
      name: "Abdul Moeez",
      role: "Full Stack Web Developer",
      icon: <Code className="w-6 h-6" />,
      color: "green",
      image: "/team/mmoeez.jpeg",
      socials: {
        github: "https://github.com/LuizSuarez",
        linkedin: "https://www.linkedin.com/in/abdul-moeez-025417365?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "abdul.moeezx9@gmail.com",
      },
    },
    {
      name: "Qazi Tehmas",
      role: "Full Stack Web Developer",
      icon: <Code className="w-6 h-6" />,
      color: "cyan",
      image: "/team/mqazi.jpg",
      socials: {
        github: "https://github.com/QaziTehmas/",
        linkedin: "https://www.linkedin.com/in/qazitehmas/",
        email: "qazitehmas1012@gmail.com",
      },
    },
    {
      name: "Abdur Rahman",
      role: "Data Scientist",
      icon: <Database className="w-6 h-6" />,
      color: "orange",
      image: "/team/mrahman1.jpeg",
      socials: {
        github: "https://github.com/AbdurRahmanCodes",
        linkedin: "https://www.linkedin.com/in/abdur-rahmanml/",
        email: "abdurrahman82733@gmail.com",
      },
    },
    {
      name: "Ammar Manzoor",
      role: "AI Engineer",
      icon: <Brain className="w-6 h-6" />,
      color: "pink",
      image: "/team/mammar.jpg",
      socials: {
        github: "github.com/ammarr-x1",
        linkedin: "https://linkedin.com/in/ammar-x1",
        email: "ammarmanzoor02@gmail.com",
      },
    },
    {
      name: "Affan Shafiq",
      role: "AI Engineer",
      icon: <Cpu className="w-6 h-6" />,
      color: "indigo",
      image: "/team/maffan.jpg",
      socials: {
        github: "https://github.com/Affan-Shafiq",
        linkedin: "https://www.linkedin.com/in/affan-shafiq-8b45132a6/",
        email: "affanshafiq30@gmail.com ",
      },
    },
    {
      name: "Muhammad Ahsan Aftab",
      role: "AI Engineer",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
      image: "/team/mahsan.jpg",
      socials: {
        github: "https://github.com/Ahsan361",
        linkedin: "https://www.linkedin.com/in/muhammad-ahsan-aftab-7085ba2a7/",
        email: "ahsanaftab077@gmail.com",
      },
    },
  ];

  const techStack = [
    {
      name: "React.js",
      category: "Frontend",
      icon: <Layout className="w-5 h-5" />,
    },
    {
      name: "Tailwind CSS",
      category: "Styling",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      name: "Recharts",
      category: "Visualization",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: "Leaflet.js",
      category: "Mapping",
      icon: <Map className="w-5 h-5" />,
    },
    {
      name: "Python/Flask",
      category: "Backend",
      icon: <Server className="w-5 h-5" />,
    },
    {
      name: "Machine Learning",
      category: "AI/ML",
      icon: <Brain className="w-5 h-5" />,
    },
    {
      name: "PostgreSQL",
      category: "Database",
      icon: <Database className="w-5 h-5" />,
    },
    {
      name: "Vite",
      category: "Build Tool",
      icon: <Wrench className="w-5 h-5" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="about-header"
        >
          <h1 className="about-title">
            About <span className="text-primary">TechXonomy</span>
          </h1>
          <p className="about-subtitle">
            A team of passionate developers and engineers building innovative
            solutions for disaster management in Pakistan.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mission-card"
        >
          <div className="mission-glow" />

          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <div>
              <p className="mission-text">
                The Pakistan Disaster Management Ecosystem (PDME) is our
                contribution to making Pakistan more resilient against natural
                disasters. We believe that technology, when combined with
                accurate data and intelligent analysis, can save lives.
              </p>
              <p className="mission-text">
                Our platform integrates decades of historical disaster data,
                real-time monitoring, climate analytics, and AI-powered
                predictions to provide authorities with actionable intelligence.
              </p>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value text-primary">24/7</div>
                <div className="stat-label">Monitoring</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-secondary">100%</div>
                <div className="stat-label">Data Driven</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-risk-medium">AI</div>
                <div className="stat-label">Powered</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-risk-low">Open</div>
                <div className="stat-label">Access</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <div className="team-section">
          <h2 className="section-title">Meet Our Team</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="team-grid"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="team-card"
              >
                <div className="team-image-wrapper">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-image"
                  />
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>

                <div className="team-socials">
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="social-icon" />
                  </a>

                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="social-icon" />
                  </a>

                  <a href={`mailto:${member.socials.email}`}>
                    <Mail className="social-icon" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech Stack */}
        <div className="tech-stack-section">
          <h2 className="section-title">Technology Stack</h2>

          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="tech-card"
              >
                <div className="tech-icon">{tech.icon}</div>

                <div className="tech-name">{tech.name}</div>

                <div className="tech-category">{tech.category}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default AboutUs;
