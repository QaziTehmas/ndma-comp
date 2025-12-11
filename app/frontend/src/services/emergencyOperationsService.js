/**
 * Emergency Operations Service
 * Fetches data from Node.js backend API for Emergency Operations dashboard
 */

const NODEJS_API_BASE = import.meta.env.VITE_NODEJS_API_BASE || 'http://localhost:3001';

/**
 * Generic fetch function for API calls
 */
const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${NODEJS_API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Get active incidents
 */
export const getActiveIncidents = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.province) params.append('province', filters.province);
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.severity) params.append('severity', filters.severity);

  const query = params.toString();
  return await apiFetch(`/api/emergency-operations/incidents${query ? `?${query}` : ''}`);
};

/**
 * Get response teams
 */
export const getResponseTeams = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.province) params.append('province', filters.province);
  if (filters.status) params.append('status', filters.status);
  if (filters.location) params.append('location', filters.location);

  const query = params.toString();
  return await apiFetch(`/api/emergency-operations/response-teams${query ? `?${query}` : ''}`);
};

/**
 * Get provincial vulnerabilities
 */
export const getProvincialVulnerabilities = async (province = null) => {
  const query = province ? `?province=${province}` : '';
  return await apiFetch(`/api/emergency-operations/provincial-vulnerabilities${query}`);
};

/**
 * Get NDMA warehouses
 */
export const getNDMAWarehouses = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.location) params.append('location', filters.location);
  if (filters.type) params.append('type', filters.type);

  const query = params.toString();
  return await apiFetch(`/api/emergency-operations/warehouses${query ? `?${query}` : ''}`);
};

/**
 * Get high-risk districts
 */
export const getHighRiskDistricts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.province) params.append('province', filters.province);
  if (filters.floodType) params.append('floodType', filters.floodType);
  if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);

  const query = params.toString();
  return await apiFetch(`/api/emergency-operations/high-risk-districts${query ? `?${query}` : ''}`);
};

/**
 * Get emergency operations dashboard stats
 */
export const getEmergencyOperationsStats = async () => {
  return await apiFetch('/api/emergency-operations/stats');
};

/**
 * Get all map data (incidents, teams, warehouses)
 */
export const getMapData = async () => {
  return await apiFetch('/api/emergency-operations/map-data');
};

