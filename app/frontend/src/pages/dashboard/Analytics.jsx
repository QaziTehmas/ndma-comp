import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, StatCard } from '../../components/UI';
import { useMultipleData } from '../../hooks/useData';
import {
  loadHistoricalFloods,
  loadProvincialImpacts,
  loadClimateTrends,
  loadMonsoon2025,
} from '../../services/dataLoader';
import { Users, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Analytics = () => {
  const { data, loading, error } = useMultipleData({
    historicalFloods: loadHistoricalFloods,
    provincialImpacts: loadProvincialImpacts,
    climateTrends: loadClimateTrends,
    monsoon2025: loadMonsoon2025,
  });

  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)';
  const chartTooltipBg = isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const chartTooltipText = isDark ? '#f1f5f9' : '#0f172a';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const chartColors = [
    isDark ? '#06b6d4' : '#0284c7',
    isDark ? '#22d3ee' : '#38bdf8',
    isDark ? '#10b981' : '#16a34a',
    isDark ? '#f59e0b' : '#d97706',
    isDark ? '#f97316' : '#ea580c',
    isDark ? '#f43f5e' : '#dc2626',
    isDark ? '#8b5cf6' : '#7c3aed',
    isDark ? '#ec4899' : '#db2777',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-primary text-xl">Loading 75 years of flood data...</div>
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

  const { historicalFloods, provincialImpacts, climateTrends, monsoon2025 } = data;

  // Calculate summary statistics
  const totalAffected = historicalFloods?.reduce((sum, flood) => sum + flood.affected, 0) || 0;
  const totalEconomicLoss = historicalFloods?.reduce((sum, flood) => sum + flood.economicLoss, 0) || 0;

  // Prepare decade-wise frequency data
  const decadeData = climateTrends?.floodFrequencyByDecade || [];

  // Prepare provincial distribution for pie chart
  const provincialPieData = provincialImpacts?.map(p => ({
    name: p.province,
    value: p.totalAffected
  })) || [];


  // Economic impact trend data
  const economicTrendData = climateTrends?.economicImpactTrend || [];

  // Major floods timeline (2010-2024)
  const recentFloods = historicalFloods?.filter(f => f.year >= 2010).sort((a, b) => a.year - b.year) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Historical Flood Analytics (1950-2025)</h1>
        <p className="text-text-secondary">Comprehensive analysis of 75 years of Pakistan's flood history</p>
      </div>

      {/* Hero Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          value="75 Years"
          label="Data Coverage (1950-2025)"
          icon={<Calendar />}
          color="blue"
        />
        <StatCard
          value={`${(totalAffected / 1000000).toFixed(0)}M+`}
          label="Total People Affected"
          icon={<Users />}
          color="orange"
        />
        <StatCard
          value="20,000+"
          label="Total Casualties (All Events)"
          icon={<AlertTriangle />}
          color="red"
        />
        <StatCard
          value={`$${totalEconomicLoss.toFixed(1)}B`}
          label="Economic Losses (USD)"
          icon={<DollarSign />}
          color="green"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decade-wise Flood Frequency */}
        <ChartContainer title="Flood Frequency by Decade">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={decadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis 
                dataKey="decade" 
                stroke={chartTextColor}
                tick={{ fill: chartTextColor, fontSize: 11 }}
              />
              <YAxis 
                stroke={chartTextColor}
                tick={{ fill: chartTextColor, fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: chartTooltipBg, 
                  border: `1px solid ${chartTooltipBorder}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: chartTooltipText }}
              />
              <Legend wrapperStyle={{ color: chartTooltipText, fontSize: '12px', fontWeight: 600 }} />
              <Bar dataKey="events" fill={chartColors[0]} name="Flood Events" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Provincial Distribution */}
        <ChartContainer title="Provincial Impact Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={provincialPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill={chartColors[0]}
                dataKey="value"
              >
                {provincialPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: chartTooltipBg, 
                  border: `1px solid ${chartTooltipBorder}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: chartTooltipText }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M people`} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Economic Impact Trend */}
        <ChartContainer title="Economic Impact Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={economicTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis 
                dataKey="period" 
                stroke={chartTextColor}
                tick={{ fill: chartTextColor, fontSize: 11 }}
              />
              <YAxis 
                stroke={chartTextColor}
                tick={{ fill: chartTextColor, fontSize: 11, formatter: (value) => `$${value}B` }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: chartTooltipBg, 
                  border: `1px solid ${chartTooltipBorder}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: chartTooltipText }}
                formatter={(value) => [`$${value}B`, 'Economic Loss']}
              />
              <Area
                type="monotone"
                dataKey="totalLoss"
                stroke={chartColors[2]}
                fill={chartColors[2]}
                fillOpacity={0.3}
                name="Economic Loss"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Recent Major Floods (2010-2024) - DUAL Y-AXIS */}
        <ChartContainer title="Recent Major Floods (2010-2024)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentFloods}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis 
                dataKey="year" 
                stroke={chartTextColor}
                tick={{ fill: chartTextColor, fontSize: 11 }}
              />
              <YAxis
                yAxisId="left"
                stroke={chartColors[5]}
                tick={{ fill: chartColors[5], fontSize: 11, formatter: (value) => `${(value / 1000000).toFixed(0)}M` }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={chartColors[2]}
                tick={{ fill: chartColors[2], fontSize: 11, formatter: (value) => `$${value}B` }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: chartTooltipBg, 
                  border: `1px solid ${chartTooltipBorder}`, 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: chartTooltipText }}
                formatter={(value, name) => {
                  if (name === 'People Affected') {
                    return [`${(value / 1000000).toFixed(2)}M people`, name];
                  }
                  return [`$${value}B`, name];
                }}
              />
              <Legend wrapperStyle={{ color: chartTooltipText, fontSize: '12px', fontWeight: 600 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="affected"
                stroke={chartColors[5]}
                strokeWidth={3}
                name="People Affected"
                dot={{ fill: chartColors[5], r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="economicLoss"
                stroke={chartColors[2]}
                strokeWidth={3}
                name="Economic Loss"
                dot={{ fill: chartColors[2], r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Provincial Risk Assessment */}
      <div className="bg-background-light rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Provincial Risk Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {provincialImpacts?.map((province) => (
            <div key={province.province} className="bg-background rounded-lg p-4 border border-border-color hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-text-primary text-lg">{province.province}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${province.riskLevel.includes('Very High') ? 'bg-risk-critical text-text-primary' :
                  province.riskLevel.includes('High') ? 'bg-risk-high text-text-primary' :
                    'bg-risk-medium text-text-primary'
                  }`}>
                  {province.riskLevel}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Events:</span>
                  <span className="text-text-primary font-semibold">{province.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">People Affected:</span>
                  <span className="text-text-primary font-semibold">{(province.totalAffected / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Casualties:</span>
                  <span className="text-risk-critical font-semibold">{province.totalCasualties.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Economic Loss:</span>
                  <span className="text-risk-high font-semibold">${province.economicLoss}B</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border-color">
                  <div className="text-xs text-text-muted mb-1">High Risk Districts:</div>
                  <div className="flex flex-wrap gap-1">
                    {province.highRiskDistricts.map(district => (
                      <span key={district} className="px-2 py-1 bg-background-light rounded text-xs text-text-secondary border border-border-color">
                        {district}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monsoon 2025 Section */}
      {monsoon2025 && (
        <div className="bg-background-light rounded-xl p-6 border border-border-color shadow-lg">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Monsoon 2025 Case Study</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background rounded-lg p-4 border border-border-color hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-risk-critical mb-2">
                {monsoon2025?.summary?.total_deaths.toLocaleString()}
              </div>
              <div className="text-sm text-text-secondary">Total Deaths</div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border-color hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-risk-high mb-2">
                {monsoon2025?.summary?.total_injured.toLocaleString()}
              </div>
              <div className="text-sm text-text-secondary">Total Injured</div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border-color hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-risk-medium mb-2">
                {monsoon2025?.summary?.houses_damaged.toLocaleString()}
              </div>
              <div className="text-sm text-text-secondary">Houses Damaged</div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border-color hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary mb-2">
                {(monsoon2025?.summary?.people_rescued / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-text-secondary">People Rescued</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;