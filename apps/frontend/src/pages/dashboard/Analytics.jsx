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

const Analytics = () => {
  const { data, loading, error } = useMultipleData({
    historicalFloods: loadHistoricalFloods,
    provincialImpacts: loadProvincialImpacts,
    climateTrends: loadClimateTrends,
    monsoon2025: loadMonsoon2025,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading 75 years of flood data...</div>
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

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  // Economic impact trend data
  const economicTrendData = climateTrends?.economicImpactTrend || [];

  // Major floods timeline (2010-2024)
  const recentFloods = historicalFloods?.filter(f => f.year >= 2010).sort((a, b) => a.year - b.year) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Historical Flood Analytics (1950-2025)</h1>
        <p className="text-gray-400">Comprehensive analysis of 75 years of Pakistan's flood history</p>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="decade" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="events" fill="#3B82F6" name="Flood Events" />
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
                fill="#8884d8"
                dataKey="value"
              >
                {provincialPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M people`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Economic Impact Trend */}
        <ChartContainer title="Economic Impact Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={economicTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value}B`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value) => [`$${value}B`, 'Economic Loss']}
              />
              <Area
                type="monotone"
                dataKey="totalLoss"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
                name="Economic Loss"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Recent Major Floods (2010-2024) - DUAL Y-AXIS */}
        <ChartContainer title="Recent Major Floods (2010-2024)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentFloods}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis
                yAxisId="left"
                stroke="#EF4444"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                tickFormatter={(value) => `$${value}B`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value, name) => {
                  if (name === 'People Affected') {
                    return [`${(value / 1000000).toFixed(2)}M people`, name];
                  }
                  return [`$${value}B`, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="affected"
                stroke="#EF4444"
                strokeWidth={3}
                name="People Affected"
                dot={{ fill: '#EF4444', r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="economicLoss"
                stroke="#10B981"
                strokeWidth={3}
                name="Economic Loss"
                dot={{ fill: '#10B981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Provincial Risk Assessment */}
      <div className="bg-background-light rounded-lg p-6 border border-background-lighter">
        <h2 className="text-2xl font-bold text-white mb-6">Provincial Risk Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {provincialImpacts?.map((province) => (
            <div key={province.province} className="bg-background rounded-lg p-4 border border-background-lighter">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white text-lg">{province.province}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${province.riskLevel.includes('Very High') ? 'bg-risk-critical text-white' :
                  province.riskLevel.includes('High') ? 'bg-risk-high text-white' :
                    'bg-risk-medium text-white'
                  }`}>
                  {province.riskLevel}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Events:</span>
                  <span className="text-white font-semibold">{province.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">People Affected:</span>
                  <span className="text-white font-semibold">{(province.totalAffected / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Casualties:</span>
                  <span className="text-risk-critical font-semibold">{province.totalCasualties.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Economic Loss:</span>
                  <span className="text-risk-high font-semibold">${province.economicLoss}B</span>
                </div>
                <div className="mt-3 pt-3 border-t border-background-lighter">
                  <div className="text-xs text-gray-400 mb-1">High Risk Districts:</div>
                  <div className="flex flex-wrap gap-1">
                    {province.highRiskDistricts.map(district => (
                      <span key={district} className="px-2 py-1 bg-background-lighter rounded text-xs text-gray-300">
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
        <div className="bg-background-light rounded-lg p-6 border border-background-lighter">
          <h2 className="text-2xl font-bold text-white mb-6">Monsoon 2025 Case Study</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background rounded-lg p-4">
              <div className="text-3xl font-bold text-risk-critical mb-2">
                {monsoon2025?.summary?.total_deaths.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Deaths</div>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="text-3xl font-bold text-risk-high mb-2">
                {monsoon2025?.summary?.total_injured.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Injured</div>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="text-3xl font-bold text-risk-medium mb-2">
                {monsoon2025?.summary?.houses_damaged.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Houses Damaged</div>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="text-3xl font-bold text-primary mb-2">
                {(monsoon2025?.summary?.people_rescued / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-gray-400">People Rescued</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
