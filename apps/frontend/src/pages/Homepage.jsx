import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  CloudRain,
  Flame,
  Droplets,
  Phone,
  Package,
  History,
  Map,
  ArrowRight,
  Shield,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '../components/UI';
import { useData } from '../hooks/useData';
import { loadDisasterStats } from '../services/dataLoader';

const HomePage = () => {
  const { data: stats, loading } = useData(loadDisasterStats);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      title: 'Weather Monitoring',
      desc: 'Real-time tracking of weather patterns and severe conditions.',
      icon: <CloudRain className="w-6 h-6" />,
      color: 'blue',
      link: '/dashboard/weather'
    },
    {
      title: 'Fire Risk Assessment',
      desc: 'AI-driven analysis of forest fire probabilities and hotspots.',
      icon: <Flame className="w-6 h-6" />,
      color: 'orange',
      link: '/dashboard/fire-risk'
    },
    {
      title: 'Flood Prediction',
      desc: 'Early warning systems based on hydrological data.',
      icon: <Droplets className="w-6 h-6" />,
      color: 'blue',
      link: '/dashboard/flood-prediction'
    },
    {
      title: 'Analytics Dashboard',
      desc: 'Comprehensive data visualization for informed decision making.',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'green',
      link: '/dashboard/analytics'
    },
    {
      title: 'Emergency Contacts',
      desc: 'Direct access to NDMA, PDMA, and rescue services.',
      icon: <Phone className="w-6 h-6" />,
      color: 'red',
      link: '/dashboard'
    },
    {
      title: 'Relief Stocks',
      desc: 'Inventory tracking of essential relief materials.',
      icon: <Package className="w-6 h-6" />,
      color: 'yellow',
      link: '/dashboard'
    },
    {
      title: 'Historical Data',
      desc: 'Archive of past disasters for pattern analysis.',
      icon: <History className="w-6 h-6" />,
      color: 'secondary',
      link: '/history/floods'
    },
    {
      title: 'Provincial Insights',
      desc: 'Detailed vulnerability reports for each province.',
      icon: <Map className="w-6 h-6" />,
      color: 'green',
      link: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div className="absolute inset-0 bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url('/src/assets/map.png')` }}>
          {/* Light Theme Overlay: keep transparent to show the map */}
          <div className="absolute inset-0 bg-transparent dark:hidden transition-colors duration-300" />
          {/* Dark Theme Overlay: subtle darkening for readability */}
          <div className="absolute inset-0 hidden dark:block dark:bg-black/85 transition-colors duration-300" />
        </div>

        {/* Background Effects */}
        {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        </div> */}

        <div className="max-w-7xl mx-auto relative z-10 ">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 ms-1 px-4 py-2 sm:ms-8 rounded-full bg-card/50 border border-border backdrop-blur-md mb-5">
              <span className="w-2 h-2 rounded-full bg-risk-critical animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Live Disaster Monitoring System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-6 text-foreground">
              One Platform <br />
              <span className="text-primary">Every Disaster</span> <br />
              Real-Time Intelligence
            </h1>

            <p className="text-xl text-lightThemeText dark:text-darkThemeText max-w-3xl mb-10 font-body leading-relaxed">
              Empowering Pakistan with data-driven insights for disaster preparedness,
              response, and recovery. Integrated with NDMA and PDMA networks.
            </p>

            <div className="flex flex-col sm:flex-row ps-3 sm:ps-0 items-start gap-6">
              <Link
                to="/dashboard"
                className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:shadow-neon hover:-translate-y-1 flex items-center gap-2"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-card/50 hover:bg-card border border-border text-foreground rounded-xl font-semibold transition-all backdrop-blur-md hover:-translate-y-1"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}

        <div className="pt-20 px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="max-w-7xl mx-auto px-7">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                value={stats?.summary?.total_disasters || "61"}
                label="Total Disasters"
                icon={<Activity />}
                color="blue"
              />
              <StatCard
                value={stats?.summary?.total_deaths?.toLocaleString() || "6,790"}
                label="Total Deaths"
                icon={<Shield />}
                color="red"
              />
              <StatCard
                value={stats?.summary?.people_affected || "43.46M"}
                label="People Affected"
                icon={<UsersIcon />}
                color="orange"
              />
              <StatCard
                value={stats?.summary?.economic_loss || "$35B"}
                label="Economic Loss"
                icon={<DollarSignIcon />}
                color="yellow"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-light backdrop-blur-sm ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">Comprehensive Monitoring</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced tools and analytics designed to keep you informed and prepared for any situation.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link
                  to={feature.link}
                  className="block h-full p-6 rounded-2xl bg-card  hover:border-primary/50 transition-all hover:shadow-neon group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`text-${feature.color}-400`}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-8 text-foreground">Our Mission</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10 font-light">
            "To build a resilient Pakistan by leveraging technology, data, and community engagement.
            We aim to minimize the impact of natural disasters through timely information and
            proactive planning."
          </p>
          <div className="flex justify-center gap-8 opacity-50">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse delay-100" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse delay-200" />
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple icon wrappers to avoid import errors if lucide icons are missing
const UsersIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarSignIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export default HomePage;
