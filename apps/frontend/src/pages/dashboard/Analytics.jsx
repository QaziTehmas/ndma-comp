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
  loadDisasterStats,
  loadProvincialVictims,
  loadFloodHistory,
  loadClimateData,
  loadMonsoon2025,
} from '../../services/dataLoader';
import { TrendingUp, TrendingDown, Droplets, Thermometer, Wind, Trees } from 'lucide-react';

import { useTheme } from '../../hooks/useTheme';

const Analytics = () => {
  const { themeColors } = useTheme();
  const { data, loading, error } = useMultipleData({
    disasterStats: loadDisasterStats,
    provincialVictims: loadProvincialVictims,
    floodHistory: loadFloodHistory,
    climateData: loadClimateData,
    monsoon2025: loadMonsoon2025,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-primary text-xl">Loading analytics...</div>
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

  const { disasterStats, provincialVictims, floodHistory, climateData, monsoon2025 } = data;

  // Prepare disaster types pie chart data
  const disasterTypeData = disasterStats?.disaster_types
    ? Object.entries(disasterStats.disaster_types).map(([type, count]) => ({
        name: type,
        value: count,
      }))
    : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Prepare provincial impact bar chart data
  const provincialData = provincialVictims?.provinces
    ? Object.entries(provincialVictims.provinces).map(([province, info]) => ({
        province,
        affected: info.total_affected,
        deaths: info.deaths,
      }))
    : [];

  // Prepare timeline data from flood history
  const timelineData = floodHistory?.major_events
    ? floodHistory.major_events.map((event) => ({
        year: event.year,
        deaths: event.deaths,
        affected: event.affected / 1000000, // Convert to millions
      }))
    : [];

  // Calculate climate indicators
  const avgTempGrowth = climateData?.temperature_trends?.monthly_growth_percent
    ? (
        climateData.temperature_trends.monthly_growth_percent.reduce(
          (sum, item) => sum + item.growth,
          0
        ) / climateData.temperature_trends.monthly_growth_percent.length
      ).toFixed(2)
    : 0;

  const totalRainfall = climateData?.precipitation_patterns?.monthly_average_mm
    ? climateData.precipitation_patterns.monthly_average_mm.reduce(
        (sum, item) => sum + item.rainfall,
        0
      )
    : 0;

  const latestCO2 = climateData?.co2_emissions
    ? climateData.co2_emissions[climateData.co2_emissions.length - 1]?.metric_tons_per_capita
    : 0;

  const forestLoss = climateData?.forest_cover?.annual_loss_percent || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics Dashboard</h1>
        <p className="text-text-secondary">Comprehensive disaster and climate data analysis</p>
      </div>

      {/* Climate Indicators Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          value={`${avgTempGrowth}%`}
          label="Avg. Temperature Growth"
          icon={<Thermometer />}
          color="red"
        />
        <StatCard
          value={`${totalRainfall}mm`}
          label="Annual Rainfall"
          icon={<Droplets />}
          color="blue"
        />
        <StatCard
          value={`${latestCO2}`}
          label="CO₂ Per Capita (tons)"
          icon={<Wind />}
          color="orange"
        />
        <StatCard
          value={`${Math.abs(forestLoss)}%`}
          label="Annual Forest Loss"
          icon={<Trees />}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Types Pie Chart */}
        <ChartContainer title="Disaster Types Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={disasterTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {disasterTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, color: themeColors.tooltipText }}
                itemStyle={{ color: themeColors.tooltipText }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Provincial Impact Bar Chart */}
        <ChartContainer title="Provincial Flood Impact (2009-2022)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={provincialData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
              <XAxis dataKey="province" stroke={themeColors.axis} />
              <YAxis stroke={themeColors.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, color: themeColors.tooltipText }}
                labelStyle={{ color: themeColors.tooltipText }}
              />
              <Legend />
              <Bar dataKey="deaths" fill="#EF4444" name="Deaths" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Timeline Visualization */}
        <ChartContainer title="Major Floods Timeline (1992-2025)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
              <XAxis dataKey="year" stroke={themeColors.axis} />
              <YAxis stroke={themeColors.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, color: themeColors.tooltipText }}
                labelStyle={{ color: themeColors.tooltipText }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="deaths"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Deaths"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Temperature Trends */}
        <ChartContainer title="Monthly Temperature Growth (%)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={climateData?.temperature_trends?.monthly_growth_percent || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
              <XAxis dataKey="month" stroke={themeColors.axis} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke={themeColors.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, color: themeColors.tooltipText }}
                labelStyle={{ color: themeColors.tooltipText }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="growth"
                stroke="#F97316"
                strokeWidth={2}
                name="Growth %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Monsoon 2025 Case Study */}
      <div className="bg-background-light rounded-lg p-6 border border-background-lighter">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Monsoon 2025 Case Study</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-background rounded-lg p-4">
            <div className="text-3xl font-bold text-risk-critical mb-2">
              {monsoon2025?.summary?.total_deaths.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Total Deaths</div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="text-3xl font-bold text-risk-high mb-2">
              {monsoon2025?.summary?.total_injured.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Total Injured</div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="text-3xl font-bold text-risk-medium mb-2">
              {monsoon2025?.summary?.houses_damaged.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Houses Damaged</div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="text-3xl font-bold text-primary mb-2">
              {(monsoon2025?.summary?.people_rescued / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-text-secondary">People Rescued</div>
          </div>
        </div>

        {/* Provincial Breakdown */}
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-4">Provincial Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monsoon2025?.by_province &&
              Object.entries(monsoon2025.by_province).map(([province, stats]) => (
                <div key={province} className="bg-background rounded-lg p-4 border border-background-lighter">
                  <h4 className="font-bold text-text-primary mb-3">{province}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Deaths:</span>
                      <span className="text-risk-critical font-semibold">{stats.deaths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Injured:</span>
                      <span className="text-risk-high font-semibold">{stats.injured}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Houses:</span>
                      <span className="text-risk-medium font-semibold">{stats.houses_damaged}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Disasters by Year */}
      <ChartContainer title="Disasters by Year (2015-2025)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={disasterStats?.disasters_by_year || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis dataKey="year" stroke={themeColors.axis} />
            <YAxis stroke={themeColors.axis} />
            <Tooltip
              contentStyle={{ backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, color: themeColors.tooltipText }}
              labelStyle={{ color: themeColors.tooltipText }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Number of Disasters" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default Analytics;
