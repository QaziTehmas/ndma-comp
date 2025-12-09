import React, { useState } from 'react';
import { AlertBanner, ChartContainer, StatCard } from '../../components/UI';
import { useMultipleData } from '../../hooks/useData';
import {
  loadNDMAData,
  loadEmergencyContacts,
  loadFloodHistory,
  loadDisasterStats,
  loadProvincialImpacts,
  loadMonsoon2025Results,
} from '../../services/dataLoader';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Phone,
  AlertTriangle,
  TrendingUp,
  Users,
  Home,
  Activity,
} from 'lucide-react';

const DashboardOverview = () => {
  const { data, loading, error } = useMultipleData({
    ndma: loadNDMAData,
    contacts: loadEmergencyContacts,
    floodHistory: loadFloodHistory,
    disasterStats: loadDisasterStats,
    provincialImpacts: loadProvincialImpacts,
    monsoon2025: loadMonsoon2025Results,
  });

  // Sample weather data for 6 cities
  const weatherData = [
    {
      city: 'Islamabad',
      temp: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      wind: 12,
      icon: <Cloud />,
    },
    {
      city: 'Lahore',
      temp: 32,
      condition: 'Sunny',
      humidity: 55,
      wind: 8,
      icon: <Sun />,
    },
    {
      city: 'Karachi',
      temp: 30,
      condition: 'Humid',
      humidity: 75,
      wind: 15,
      icon: <Wind />,
    },
    {
      city: 'Peshawar',
      temp: 26,
      condition: 'Rainy',
      humidity: 80,
      wind: 10,
      icon: <CloudRain />,
    },
    {
      city: 'Quetta',
      temp: 22,
      condition: 'Clear',
      humidity: 40,
      wind: 6,
      icon: <Sun />,
    },
    {
      city: 'Gilgit',
      temp: 18,
      condition: 'Cloudy',
      humidity: 70,
      wind: 14,
      icon: <Cloud />,
    },
  ];

  const [selectedProvince, setSelectedProvince] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-risk-critical text-xl">Error: {error}</div>
      </div>
    );
  }

  const { ndma, contacts, floodHistory, disasterStats, provincialImpacts, monsoon2025 } = data;

  // Calculate total historical impact
  const totalAffectedHistorical = provincialImpacts?.reduce((sum, p) => sum + p.totalAffected, 0) || 0;
  const totalCasualtiesHistorical = provincialImpacts?.reduce((sum, p) => sum + p.totalCasualties, 0) || 0;
  const totalEconomicLoss = provincialImpacts?.reduce((sum, p) => sum + p.economicLoss, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard Overview</h1>
        <p className="text-text-secondary">Real-time disaster monitoring and alerts for Pakistan</p>
      </div>

      {/* Critical Statistics - Competition Highlight */}
      <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-background border border-blue-500/30 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Pakistan Flood Impact Overview</h2>
            <p className="text-text-secondary text-sm">Historical data spanning 75+ years (1950-2025)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            value={`${(totalAffectedHistorical / 1000000).toFixed(0)}M+`}
            label="Total People Affected"
            icon={<Users />}
            color="blue"
          />
          <StatCard
            value={totalCasualtiesHistorical?.toLocaleString() || '0'}
            label="Total Casualties"
            icon={<Activity />}
            color="red"
          />
          <StatCard
            value={`$${totalEconomicLoss?.toFixed(1)}B`}
            label="Economic Loss"
            icon={<TrendingUp />}
            color="green"
          />
          <StatCard
            value={monsoon2025?.summary?.houses_damaged?.toLocaleString() || '0'}
            label="Houses Damaged (2025)"
            icon={<Home />}
            color="orange"
          />
        </div>

        {/* 2025 Monsoon Alert */}
        {monsoon2025 && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-400 mb-2">Monsoon 2025 Impact ({monsoon2025.period})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-text-muted">Deaths</div>
                    <div className="text-xl font-bold text-text-primary">{monsoon2025.summary.total_deaths}</div>
                  </div>
                  <div>
                    <div className="text-text-muted">Injured</div>
                    <div className="text-xl font-bold text-text-primary">{monsoon2025.summary.total_injured}</div>
                  </div>
                  <div>
                    <div className="text-text-muted">Rescued</div>
                    <div className="text-xl font-bold text-text-primary">{monsoon2025.summary.people_rescued.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-text-muted">Active Camps</div>
                    <div className="text-xl font-bold text-text-primary">{monsoon2025.summary.active_relief_camps}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Alerts */}
      {ndma?.current_alerts && ndma.current_alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-risk-high" />
            Active Alerts
          </h2>
          {ndma.current_alerts.map((alert, index) => (
            <AlertBanner
              key={index}
              severity={alert.severity.toLowerCase()}
              title={`${alert.alert_type} - ${alert.district}, ${alert.province}`}
              message={`${alert.message} (Issued: ${alert.issued_date})`}
            />
          ))}
        </div>
      )}

      {/* Pakistan Map and Province Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <ChartContainer title="Pakistan Risk Map">
            <div className="bg-background rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ndma?.provinces && Object.entries(ndma.provinces).map(([province, info]) => (
                  <button
                    key={province}
                    onClick={() => setSelectedProvince(province)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300
                      ${
                        info.alert_level === 'High'
                          ? 'border-risk-high bg-risk-high/10 hover:bg-risk-high/20'
                          : info.alert_level === 'Medium'
                          ? 'border-risk-medium bg-risk-medium/10 hover:bg-risk-medium/20'
                          : 'border-risk-low bg-risk-low/10 hover:bg-risk-low/20'
                      }
                      ${selectedProvince === province ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <h3 className="font-bold text-text-primary mb-1">{province}</h3>
                    <p className={`text-sm font-semibold ${
                      info.alert_level === 'High' ? 'text-risk-high' :
                      info.alert_level === 'Medium' ? 'text-risk-medium' :
                      'text-risk-low'
                    }`}>
                      {info.alert_level} Risk
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {(info.population_at_risk / 1000000).toFixed(1)}M at risk
                    </p>
                  </button>
                ))}
              </div>

              {/* Selected Province Details */}
              {selectedProvince && ndma?.provinces[selectedProvince] && (
                <div className="mt-6 p-4 bg-background-light rounded-lg border border-background-lighter">
                  <h3 className="text-lg font-bold text-text-primary mb-3">{selectedProvince} - Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Alert Level: </span>
                      <span className="font-semibold text-text-primary">
                        {ndma.provinces[selectedProvince].alert_level}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Population at Risk: </span>
                      <span className="font-semibold text-text-primary">
                        {ndma.provinces[selectedProvince].population_at_risk.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Vulnerable Districts: </span>
                      <span className="text-text-primary">
                        {ndma.provinces[selectedProvince].vulnerable_districts.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">High Risk Areas: </span>
                      <span className="text-text-primary">
                        {ndma.provinces[selectedProvince].high_risk_areas.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>
        </div>

        {/* Emergency Contacts Panel */}
        <div>
          <ChartContainer title="Emergency Contacts">
            <div className="space-y-4">
              {/* National Contacts */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase">National</h4>
                <div className="space-y-2">
                  {contacts?.national && Object.entries(contacts.national).map(([name, number]) => (
                    <a
                      key={name}
                      href={`tel:${number}`}
                      className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background-lighter transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-primary group-hover:text-primary-light" />
                        <span className="text-sm text-text-primary">{name.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-sm font-mono text-text-secondary group-hover:text-text-primary">
                        {number}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Provincial Contacts */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase">Provincial PDMAs</h4>
                <div className="space-y-2">
                  {contacts?.provincial && Object.entries(contacts.provincial).map(([province, info]) => (
                    <div key={province} className="p-3 bg-background rounded-lg">
                      <div className="font-semibold text-text-primary text-sm mb-2">{province}</div>
                      {Object.entries(info).map(([service, number]) => (
                        <a
                          key={service}
                          href={`tel:${number}`}
                          className="flex items-center justify-between text-xs py-1 hover:text-primary transition-colors"
                        >
                          <span className="text-text-secondary">{service.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-text-muted">{number}</span>
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* 6-City Weather Cards */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">Current Weather</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {weatherData.map((weather) => (
            <div
              key={weather.city}
              style={{ background: 'var(--weather-card-gradient)' }}
              className="rounded-lg p-4 text-text-primary shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{weather.city}</h3>
                <div className="text-2xl opacity-80">{weather.icon}</div>
              </div>
              <div className="text-3xl font-bold mb-2">{weather.temp}°C</div>
              <div className="text-sm opacity-90 mb-3">{weather.condition}</div>
              <div className="flex items-center justify-between text-xs opacity-75">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather.wind} km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
