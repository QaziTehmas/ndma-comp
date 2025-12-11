import React, { useState, useEffect } from 'react';
import { useMultipleData } from '../../hooks/useData';
import {
  getActiveIncidents,
  getResponseTeams,
  getProvincialVulnerabilities,
  getNDMAWarehouses,
  getHighRiskDistricts,
  getEmergencyOperationsStats,
  getMapData,
} from '../../services/emergencyOperationsService';
import {
  AlertTriangle,
  Users,
  Home,
  Activity,
  MapPin,
  Phone,
  Search,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StatCard } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';

// Pakistan map bounds for coordinate conversion
const PAKISTAN_BOUNDS = {
  north: 37.0841,
  south: 23.6345,
  east: 77.8375,
  west: 60.8742,
  width: 800,
  height: 600,
};

// Convert lat/lng to SVG coordinates
const latLngToSVG = (lat, lng) => {
  const x = ((lng - PAKISTAN_BOUNDS.west) / (PAKISTAN_BOUNDS.east - PAKISTAN_BOUNDS.west)) * PAKISTAN_BOUNDS.width;
  const y = ((PAKISTAN_BOUNDS.north - lat) / (PAKISTAN_BOUNDS.north - PAKISTAN_BOUNDS.south)) * PAKISTAN_BOUNDS.height;
  return { x, y };
};

// Static Pakistan Map Component
const StaticPakistanMap = ({ incidents, responseTeams, warehouses }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Pakistan Outline - Simplified */}
      <path
        d="M 150 50 L 200 80 L 250 100 L 300 120 L 350 130 L 400 140 L 500 150 L 600 160 L 650 170 L 700 180 L 720 200 L 700 250 L 680 300 L 650 350 L 600 400 L 550 450 L 500 480 L 450 500 L 400 510 L 350 520 L 300 530 L 250 540 L 200 550 L 150 560 L 120 550 L 100 500 L 90 450 L 100 400 L 120 350 L 130 300 L 140 250 L 145 200 L 150 150 L 150 100 Z"
        fill={isDark ? '#1e293b' : '#e2e8f0'}
        stroke={isDark ? '#475569' : '#94a3b8'}
        strokeWidth="2"
      />

      {/* Major Cities/Regions Labels */}
      <text x="400" y="200" fontSize="14" fill={isDark ? '#cbd5e1' : '#475569'} textAnchor="middle" fontWeight="bold">
        Islamabad
      </text>
      <text x="450" y="250" fontSize="14" fill={isDark ? '#cbd5e1' : '#475569'} textAnchor="middle" fontWeight="bold">
        Lahore
      </text>
      <text x="350" y="350" fontSize="14" fill={isDark ? '#cbd5e1' : '#475569'} textAnchor="middle" fontWeight="bold">
        Karachi
      </text>
      <text x="300" y="200" fontSize="14" fill={isDark ? '#cbd5e1' : '#475569'} textAnchor="middle" fontWeight="bold">
        Peshawar
      </text>
      <text x="200" y="300" fontSize="14" fill={isDark ? '#cbd5e1' : '#475569'} textAnchor="middle" fontWeight="bold">
        Quetta
      </text>

      {/* Incident Markers (Red) */}
      {incidents.map((incident, idx) => {
        const { x, y } = latLngToSVG(Number(incident.latitude), Number(incident.longitude));
        return (
          <g key={`incident-${idx}`}>
            <circle cx={x} cy={y} r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
            <circle cx={x} cy={y} r="12" fill="#ef4444" opacity="0.3" />
            <title>
              {incident.type} - {incident.district}, {incident.province} - Severity: {incident.severity}
            </title>
          </g>
        );
      })}

      {/* Response Team Markers (Blue) */}
      {responseTeams.map((team, idx) => {
        const { x, y } = latLngToSVG(Number(team.latitude), Number(team.longitude));
        return (
          <g key={`team-${idx}`}>
            <circle cx={x} cy={y} r="7" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <circle cx={x} cy={y} r="11" fill="#3b82f6" opacity="0.3" />
            <title>
              {team.name} - {team.currentLocation} - Status: {team.status}
            </title>
          </g>
        );
      })}

      {/* Warehouse Markers (Yellow) */}
      {warehouses.map((warehouse, idx) => {
        const { x, y } = latLngToSVG(Number(warehouse.latitude), Number(warehouse.longitude));
        return (
          <g key={`warehouse-${idx}`}>
            <circle cx={x} cy={y} r="6" fill="#eab308" stroke="white" strokeWidth="2" />
            <circle cx={x} cy={y} r="10" fill="#eab308" opacity="0.3" />
            <title>
              {warehouse.name} - {warehouse.location} - Type: {warehouse.type}
            </title>
          </g>
        );
      })}

      {/* Province Labels */}
      <text x="450" y="220" fontSize="12" fill={isDark ? '#64748b' : '#94a3b8'} textAnchor="middle">
        Punjab
      </text>
      <text x="350" y="380" fontSize="12" fill={isDark ? '#64748b' : '#94a3b8'} textAnchor="middle">
        Sindh
      </text>
      <text x="300" y="180" fontSize="12" fill={isDark ? '#64748b' : '#94a3b8'} textAnchor="middle">
        KP
      </text>
      <text x="200" y="320" fontSize="12" fill={isDark ? '#64748b' : '#94a3b8'} textAnchor="middle">
        Balochistan
      </text>
    </svg>
  );
};

const EmergencyOperations = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [filters, setFilters] = useState({
    province: '',
    type: '',
    status: '',
    severity: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [expandedProvince, setExpandedProvince] = useState(null);

  // Load all data
  const { data, loading, error, refetch } = useMultipleData({
    incidents: () => getActiveIncidents(filters),
    teams: () => getResponseTeams({ province: filters.province }),
    vulnerabilities: () => getProvincialVulnerabilities(),
    warehouses: () => getNDMAWarehouses(),
    districts: () => getHighRiskDistricts({ province: filters.province }),
    stats: () => getEmergencyOperationsStats(),
    mapData: () => getMapData(),
  });

  // Auto-refresh every 5 minutes during Monsoon season
  useEffect(() => {
    const now = new Date();
    const monsoonStart = new Date('2025-06-26');
    const monsoonEnd = new Date('2025-09-15');
    
    if (now >= monsoonStart && now <= monsoonEnd) {
      const interval = setInterval(() => {
        refetch();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [refetch]);

  const getRiskColor = (level) => {
    if (level?.includes('Very High')) return 'bg-red-600';
    if (level?.includes('High')) return 'bg-orange-500';
    if (level?.includes('Medium')) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (severity === 'High') return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    if (severity === 'Medium') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-green-600 bg-green-50 dark:bg-green-900/20';
  };

  const getFloodTypeColor = (type) => {
    if (type === 'Riverine') return 'bg-blue-500';
    if (type === 'Flash') return 'bg-orange-500';
    if (type === 'Urban') return 'bg-purple-500';
    if (type === 'GLOF') return 'bg-teal-500';
    return 'bg-gray-500';
  };

  const filteredIncidents = data?.incidents?.filter(incident => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        incident.district.toLowerCase().includes(search) ||
        incident.province.toLowerCase().includes(search) ||
        incident.type.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  const filteredDistricts = data?.districts?.filter(district => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        district.district.toLowerCase().includes(search) ||
        district.province.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-primary text-xl">Loading Emergency Operations Center...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Emergency Operations Center</h1>
          <p className="text-text-secondary mt-1">Monsoon 2025 Real-time Disaster Monitoring & Response</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-background-secondary text-text-primary rounded-lg hover:bg-background-light border border-border-color flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Incidents"
          value={data?.stats?.activeIncidents || 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={null}
          className="bg-red-50 dark:bg-red-900/20"
        />
        <StatCard
          title="Response Teams"
          value={data?.stats?.responseTeamsDeployed || 0}
          icon={<Users className="w-6 h-6" />}
          trend={null}
          className="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title="Relief Camps"
          value={data?.stats?.reliefCampsOperational || 0}
          icon={<Home className="w-6 h-6" />}
          trend={null}
          className="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="People Evacuated"
          value={(data?.stats?.peopleEvacuated || 0).toLocaleString()}
          icon={<Activity className="w-6 h-6" />}
          trend={null}
          className="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-background-secondary rounded-lg p-4 border border-border-color">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search incidents or districts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filters.province}
            onChange={(e) => setFilters({ ...filters, province: e.target.value })}
            className="px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Provinces</option>
            <option value="Punjab">Punjab</option>
            <option value="Sindh">Sindh</option>
            <option value="Khyber Pakhtunkhwa">KP</option>
            <option value="Balochistan">Balochistan</option>
            <option value="Gilgit-Baltistan">GB</option>
            <option value="Azad Jammu & Kashmir">AJK</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="Riverine Flood">Riverine Flood</option>
            <option value="Flash Flood">Flash Flood</option>
            <option value="Urban Flooding">Urban Flooding</option>
            <option value="GLOF">GLOF</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Provincial Vulnerabilities */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-background-secondary rounded-lg p-4 border border-border-color">
            <h2 className="text-xl font-bold text-text-primary mb-4">Provincial Vulnerability</h2>
            <div className="space-y-3">
              {data?.vulnerabilities?.map((vuln) => (
                <div
                  key={vuln.province}
                  className="bg-background rounded-lg p-4 border border-border-color cursor-pointer hover:bg-background-light transition-colors"
                  onClick={() => setExpandedProvince(expandedProvince === vuln.province ? null : vuln.province)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{vuln.province}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getRiskColor(vuln.riskLevel)}`}>
                          {vuln.riskLevel}
                        </span>
                        <span className="text-text-secondary text-sm">
                          {vuln.vulnerableDistricts} districts
                        </span>
                      </div>
                    </div>
                    {expandedProvince === vuln.province ? (
                      <ChevronUp className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  {expandedProvince === vuln.province && (
                    <div className="mt-4 space-y-2 text-sm text-text-secondary">
                      <div>
                        <strong>Rainfall Outlook:</strong> {vuln.rainfallOutlook}
                      </div>
                      <div>
                        <strong>Flood Types:</strong> {Array.isArray(vuln.floodTypes) ? vuln.floodTypes.join(', ') : ''}
                      </div>
                      {vuln.pdmaContact && (
                        <div className="mt-3 pt-3 border-t border-border-color">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{vuln.pdmaContact.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* High-Risk Districts */}
          <div className="bg-background-secondary rounded-lg p-4 border border-border-color">
            <h2 className="text-xl font-bold text-text-primary mb-4">High-Risk Districts</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDistricts.slice(0, 20).map((district) => (
                <div
                  key={`${district.district}-${district.province}`}
                  className="bg-background rounded-lg p-3 border border-border-color"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-text-primary">{district.district}</h4>
                      <p className="text-sm text-text-secondary">{district.province}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`w-3 h-3 rounded-full ${getFloodTypeColor(district.floodType)}`}></span>
                      <span className="text-xs text-text-muted">{district.floodType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Map and Incidents */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map */}
          <div className="bg-background-secondary rounded-lg border border-border-color overflow-hidden">
            <div className="p-4 border-b border-border-color flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-primary">Resource Deployment Map</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-text-secondary">Incidents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-text-secondary">Response Teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-text-secondary">Warehouses</span>
                </div>
              </div>
            </div>
            {/* Static Map */}
            <div className="w-full h-96 relative bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
              <StaticPakistanMap 
                incidents={data?.mapData?.incidents || []}
                responseTeams={data?.mapData?.responseTeams || []}
                warehouses={data?.mapData?.warehouses || []}
              />
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-background-secondary rounded-lg p-4 border border-border-color">
            <h2 className="text-xl font-bold text-text-primary mb-4">Active Incidents</h2>
            <div className="space-y-3">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`bg-background rounded-lg p-4 border border-border-color cursor-pointer hover:bg-background-light transition-colors ${
                    selectedIncident === incident.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedIncident(selectedIncident === incident.id ? null : incident.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary">{incident.type}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm">
                        {incident.district}, {incident.province}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-text-secondary">
                        <span>Affected: {incident.affected?.toLocaleString() || 0}</span>
                        <span>Casualties: {incident.casualties || 0}</span>
                        <span>Evacuated: {incident.evacuated?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <MapPin className="w-5 h-5 text-text-muted" />
                  </div>
                  {selectedIncident === incident.id && incident.description && (
                    <div className="mt-4 pt-4 border-t border-border-color text-sm text-text-secondary">
                      <p>{incident.description}</p>
                      {incident.responseActions && Array.isArray(incident.responseActions) && (
                        <div className="mt-3">
                          <strong className="text-text-primary">Response Actions:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {incident.responseActions.map((action, idx) => (
                              <li key={idx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {filteredIncidents.length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                  No incidents found matching the filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyOperations;
