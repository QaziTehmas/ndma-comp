import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import PDMENavbar from './components/PDMENavbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import HomePage from './pages/HomePage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import Analytics from './pages/dashboard/Analytics';
import WeatherMonitoring from './pages/dashboard/WeatherMonitoring';
import WaterAnalysis from './pages/dashboard/WaterAnalysis';
import FireRisk from './pages/dashboard/FireRisk';
import FloodPrediction from './pages/dashboard/FloodPrediction';
import AboutUs from './pages/AboutUs';
import FloodsHistory from './pages/history/FloodsHistory';
import EarthquakeHistory from './pages/history/EarthquakeHistory';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      {!isDashboard && <PDMENavbar />}
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Dashboard with nested routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="weather" element={<WeatherMonitoring />} />
          <Route path="fire-risk" element={<FireRisk />} />
          <Route path="flood-prediction" element={<FloodPrediction />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="water-analysis" element={<WaterAnalysis />} />
        </Route>

        {/* About Us */}
        <Route path="/about" element={<AboutUs />} />

        {/* History */}
        <Route path="/history/floods" element={<FloodsHistory />} />
        <Route path="/history/earthquakes" element={<EarthquakeHistory />} />

        {/* 404 */}
        <Route path="*" element={<div className="p-6 text-white min-h-screen text-center">404 - Page Not Found</div>} />
      </Routes>
      {!isDashboard && <Footer />}
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;