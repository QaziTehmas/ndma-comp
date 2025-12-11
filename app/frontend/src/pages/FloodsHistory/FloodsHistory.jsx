import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { ChartContainer, StatCard } from '../../components/UI';
import { useMultipleData } from '../../hooks/useData';
import { 
  loadFloodHistory, 
  loadProvincialVictims, 
  loadHistoricalFloods,
  loadClimateTrends,
  loadProvincialImpacts,
  loadMonsoon2025Results
} from '../../services/dataLoader';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Droplets,
  Home,
  MapPin,
  BarChart3
} from 'lucide-react';
import './FloodsHistory.css';

const FloodsHistory = () => {
  const { data, loading, error } = useMultipleData({
    floodHistory: loadFloodHistory,
    provincialVictims: loadProvincialVictims,
    historicalFloods: loadHistoricalFloods,
    climateTrends: loadClimateTrends,
    provincialImpacts: loadProvincialImpacts,
    monsoon2025: loadMonsoon2025Results
  });

  const { floodHistory, provincialVictims, historicalFloods, climateTrends, provincialImpacts, monsoon2025 } = data;
  const [selectedDecade, setSelectedDecade] = useState(null);

  if (loading) {
    return <div className="floods-loading">Loading history data...</div>;
  }

  if (error) {
    return <div className="floods-error">Error loading data: {error}</div>;
  }

  // Prepare provincial data for charts
  const provincialChartData = provincialVictims?.provinces
    ? Object.entries(provincialVictims.provinces).map(([province, stats]) => ({
        province,
        affected: stats.total_affected / 1000000, // in millions
        deaths: stats.deaths,
        housesDamaged: stats.houses_damaged
      }))
    : [];

  // Enhanced provincial impacts
  const provincialImpactData = provincialImpacts?.map(p => ({
    province: p.province,
    events: p.totalEvents,
    affected: p.totalAffected / 1000000,
    casualties: p.totalCasualties,
    economicLoss: p.economicLoss,
    riskLevel: p.riskLevel
  })) || [];

  // Severity distribution colors
  const SEVERITY_COLORS = {
    'Mega': '#DC2626',
    'Major': '#F59E0B',
    'Moderate': '#3B82F6'
  };

  // Calculate severity distribution
  const severityData = historicalFloods?.reduce((acc, flood) => {
    const existing = acc.find(item => item.name === flood.severity);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: flood.severity, value: 1 });
    }
    return acc;
  }, []) || [];

  // Total statistics
  const totalHistoricalAffected = historicalFloods?.reduce((sum, f) => sum + f.affected, 0) || 0;
  const totalHistoricalCasualties = historicalFloods?.reduce((sum, f) => sum + f.casualties, 0) || 0;
  const totalHistoricalLoss = historicalFloods?.reduce((sum, f) => sum + f.economicLoss, 0) || 0;
  const megaFloods = historicalFloods?.filter(f => f.severity === 'Mega').length || 0;

  return (
    <div className="floods-history-page">
      <div className="floods-container">
        <div className="floods-header">
          <h1 className="floods-title">Pakistan Floods History: 75 Years of Data (1950-2025)</h1>
          <p className="floods-subtitle">Comprehensive analysis of flood events, impacts, and trends</p>
        </div>

        {/* Key Statistics Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-blue-900/40 rounded-xl p-6 mb-8 border border-blue-500/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{historicalFloods?.length || 0}</div>
              <div className="text-sm text-text-secondary">Major Flood Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">{(totalHistoricalAffected / 1000000).toFixed(0)}M+</div>
              <div className="text-sm text-text-secondary">People Affected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">{totalHistoricalCasualties.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Casualties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">${totalHistoricalLoss.toFixed(1)}B</div>
              <div className="text-sm text-text-secondary">Economic Loss</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{megaFloods}</div>
              <div className="text-sm text-text-secondary">Mega Floods</div>
            </div>
          </div>
        </div>

        {/* Catastrophic Events Spotlight */}
        <div className="timeline-section">
          <h2 className="section-heading">
            <AlertTriangle className="section-icon text-red-500" /> Catastrophic Mega Floods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {floodHistory?.major_events?.map((event) => (
              <div key={event.year} className="event-card bg-gradient-to-br from-red-900/20 to-background border-2 border-red-500/30">
                <div className="event-header">
                  <div className="flex items-center gap-3 mb-3">
                    <Droplets className="w-8 h-8 text-blue-400" />
                    <div>
                      <div className="event-year text-2xl">{event.year} Floods</div>
                      <div className="text-sm text-text-secondary">{event.month} • {event.region}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="stat-box bg-red-500/10 border border-red-500/30 rounded p-3">
                      <div className="stat-value stat-deaths text-2xl">{event.deaths.toLocaleString()}</div>
                      <div className="stat-label">Deaths</div>
                    </div>
                    <div className="stat-box bg-blue-500/10 border border-blue-500/30 rounded p-3">
                      <div className="stat-value text-2xl">{(event.affected / 1000000).toFixed(1)}M</div>
                      <div className="stat-label">Affected</div>
                    </div>
                    {event.economic_loss_usd && (
                      <div className="stat-box bg-green-500/10 border border-green-500/30 rounded p-3">
                        <div className="stat-value stat-loss text-2xl">${(event.economic_loss_usd / 1000000000).toFixed(1)}B</div>
                        <div className="stat-label">Loss</div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="event-description mt-4 text-text-secondary italic">{event.description}</p>
                <div className="mt-3 text-xs text-text-muted">Type: {event.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decade-wise Analysis */}
        <div className="mb-8">
          <h2 className="section-heading">
            <BarChart3 className="section-icon text-purple-500" /> Decade-wise Flood Frequency & Severity
          </h2>
          <ChartContainer title="Escalating Flood Frequency (1950-2025)">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={climateTrends?.floodFrequencyByDecade || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="decade" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" label={{ value: 'Events', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" label={{ value: 'Avg Affected (M)', angle: 90, position: 'insideRight' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="events" fill="#3B82F6" name="Number of Events" />
                <Line yAxisId="right" type="monotone" dataKey="avgAffected" stroke="#EF4444" strokeWidth={3} name="Avg Affected (Millions)" dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Provincial Comprehensive Analysis */}
        <div className="mb-8">
          <h2 className="section-heading">
            <MapPin className="section-icon text-orange-500" /> Provincial Impact Analysis (2009-2022)
          </h2>
          <div className="charts-grid">
            <ChartContainer title="Total Affected Population by Province (Millions)">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={provincialChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="province" type="category" stroke="#94a3b8" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="affected" fill="#3B82F6" name="Affected (M)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Casualties & Infrastructure Damage">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={provincialChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="province" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="deaths" fill="#EF4444" name="Deaths" />
                  <Line yAxisId="right" type="monotone" dataKey="housesDamaged" stroke="#F59E0B" strokeWidth={2} name="Houses Damaged" dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Provincial Risk Assessment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {provincialImpactData.slice(0, 6).map((province) => (
              <div
                key={province.province}
                className={`p-4 rounded-lg border-2 ${
                  province.riskLevel === 'Very High'
                    ? 'bg-red-900/20 border-red-500/50'
                    : province.riskLevel === 'High' || province.riskLevel.includes('High')
                    ? 'bg-orange-900/20 border-orange-500/50'
                    : 'bg-yellow-900/20 border-yellow-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-text-primary">{province.province}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      province.riskLevel === 'Very High'
                        ? 'bg-red-500 text-white'
                        : province.riskLevel === 'High' || province.riskLevel.includes('High')
                        ? 'bg-orange-500 text-white'
                        : 'bg-yellow-500 text-black'
                    }`}
                  >
                    {province.riskLevel}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Events:</span>
                    <span className="font-bold text-text-primary">{province.events}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Affected:</span>
                    <span className="font-bold text-text-primary">{province.affected.toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Casualties:</span>
                    <span className="font-bold text-red-400">{province.casualties.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Economic Loss:</span>
                    <span className="font-bold text-green-400">${province.economicLoss.toFixed(1)}B</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Impact Escalation */}
        <div className="economic-analysis mb-8">
          <h2 className="section-heading">
            <DollarSign className="section-icon text-green-500" /> Economic Impact Escalation
          </h2>
          
          {/* Key Economic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              value={`$${totalHistoricalLoss.toFixed(1)}B`}
              label="Total Economic Loss (1950-2025)"
              icon={<DollarSign />}
              color="green"
            />
            <StatCard
              value="995K+"
              label="Houses Damaged (Cumulative)"
              icon={<Home />}
              color="orange"
            />
            <StatCard
              value="30M+"
              label="Livestock Lost"
              icon={<Activity />}
              color="red"
            />
            <StatCard
              value="2.5M+"
              label="Acres Crops Destroyed"
              icon={<Droplets />}
              color="blue"
            />
          </div>

          {/* Economic Loss Trend Over Periods */}
          <div className="charts-grid">
            <ChartContainer title="Economic Loss Acceleration by Period">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={climateTrends?.economicImpactTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: 'Loss ($ Billion)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="totalLoss" fill="#10B981" name="Total Loss ($B)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Historical Timeline: Affected Population">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={historicalFloods?.slice(-15) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value) => `${(value / 1000000).toFixed(2)}M`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="affected"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.4}
                    name="People Affected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="mb-8">
          <h2 className="section-heading">
            <Activity className="section-icon text-yellow-500" /> Flood Severity Classification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Severity Distribution (1950-2025)">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Casualty Trends by Severity">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={climateTrends?.floodFrequencyByDecade || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="decade" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="totalCasualties" stroke="#EF4444" strokeWidth={3} name="Total Casualties" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="avgEconomicLoss" stroke="#10B981" strokeWidth={2} name="Avg Economic Loss ($B)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Key Insights for Competition */}
        <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-purple-900/30 rounded-xl p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-purple-400" />
            Critical Insights & Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-background/50 rounded-lg p-4 border border-blue-500/20">
              <h3 className="font-bold text-blue-400 mb-2">📈 Escalating Frequency</h3>
              <p className="text-text-secondary">
                Flood frequency has increased by <span className="text-text-primary font-bold">400%</span> from 1950s (3 events) to 2010s (10 events), 
                with the 2020s showing the highest average impact per event.
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-red-500/20">
              <h3 className="font-bold text-red-400 mb-2">💀 Human Cost</h3>
              <p className="text-text-secondary">
                Since 1950, floods have claimed <span className="text-text-primary font-bold">{totalHistoricalCasualties.toLocaleString()} lives</span> and 
                affected over <span className="text-text-primary font-bold">{(totalHistoricalAffected / 1000000).toFixed(0)}M people</span> across Pakistan.
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-green-500/20">
              <h3 className="font-bold text-green-400 mb-2">💰 Economic Burden</h3>
              <p className="text-text-secondary">
                Economic losses have surged from <span className="text-text-primary font-bold">$6.2B (1950-1970)</span> to 
                <span className="text-text-primary font-bold"> $52.5B (2011-2025)</span> - an <span className="text-text-primary font-bold">846% increase</span>.
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-orange-500/20">
              <h3 className="font-bold text-orange-400 mb-2">🌍 Climate Change Impact</h3>
              <p className="text-text-secondary">
                <span className="text-text-primary font-bold">3 out of 4</span> worst floods (2010, 2022, 2024) occurred after 2000, 
                indicating clear climate change intensification patterns.
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-purple-500/20">
              <h3 className="font-bold text-purple-400 mb-2">🗺️ Geographic Vulnerability</h3>
              <p className="text-text-secondary">
                <span className="text-text-primary font-bold">Sindh</span> is the most affected with 52M people impacted, 
                followed by Punjab (45M) and KP (18M) over 75 years.
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="font-bold text-yellow-400 mb-2">⚡ Mega Floods Era</h3>
              <p className="text-text-secondary">
                <span className="text-text-primary font-bold">{megaFloods} mega floods</span> have occurred in the last 50 years, 
                with each affecting 10M+ people - a phenomenon unprecedented before 1976.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodsHistory;

