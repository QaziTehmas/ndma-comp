/**
 * Data Loading Service for PDME Platform
 * Centralized service to load all JSON data files from public/data directory
 */

const DATA_BASE_URL = '/data';

/**
 * Generic fetch function with error handling
 * @param {string} filename - Name of the JSON file to fetch
 * @returns {Promise<Object>} Parsed JSON data
 */
const fetchJSON = async (filename) => {
  try {
    const response = await fetch(`${DATA_BASE_URL}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
};

/**
 * Load overall disaster statistics
 * @returns {Promise<Object>} Disaster statistics data
 */
export const loadDisasterStats = async () => {
  return await fetchJSON('disaster-stats.json');
};

/**
 * Load provincial flood victims data (2009-2022)
 * @returns {Promise<Object>} Provincial victims data
 */
export const loadProvincialVictims = async () => {
  return await fetchJSON('provincial-victims.json');
};

/**
 * Load historical flood events timeline
 * @returns {Promise<Object>} Flood history data
 */
export const loadFloodHistory = async () => {
  return await fetchJSON('flood-history.json');
};

/**
 * Load Monsoon 2025 impact data
 * @returns {Promise<Object>} Monsoon 2025 results
 */
export const loadMonsoon2025 = async () => {
  return await fetchJSON('monsoon-2025-results.json');
};

/**
 * Load relief stocks inventory
 * @returns {Promise<Object>} Relief stocks data
 */
export const loadReliefStocks = async () => {
  return await fetchJSON('relief-stocks.json');
};

/**
 * Load emergency contact numbers
 * @returns {Promise<Object>} Emergency contacts data
 */
export const loadEmergencyContacts = async () => {
  return await fetchJSON('emergency-contacts.json');
};

/**
 * Load climate trends and indicators
 * @returns {Promise<Object>} Climate data
 */
export const loadClimateData = async () => {
  return await fetchJSON('climate-data.json');
};

/**
 * Load historical floods data (1950-2025)
 * @returns {Promise<Object>} Historical floods data
 */
export const loadHistoricalFloods = async () => {
  return await fetchJSON('historical-floods.json');
};

/**
 * Load provincial impacts summary
 * @returns {Promise<Object>} Provincial impacts data
 */
export const loadProvincialImpacts = async () => {
  return await fetchJSON('provincial-impacts.json');
};

/**
 * Load climate trends and frequency data
 * @returns {Promise<Object>} Climate trends data
 */
export const loadClimateTrends = async () => {
  return await fetchJSON('climate-trends.json');
};

/**
 * Load NDMA vulnerability and alert data
 * @returns {Promise<Object>} NDMA data
 */
export const loadNDMAData = async () => {
  return await fetchJSON('ndma-data.json');
};

/**
 * Load all data sources at once
 * @returns {Promise<Object>} Object containing all data sources
 */
export const loadAllData = async () => {
  try {
    const [
      disasterStats,
      provincialVictims,
      floodHistory,
      monsoon2025,
      reliefStocks,
      emergencyContacts,
      climateData,
      ndmaData
    ] = await Promise.all([
      loadDisasterStats(),
      loadProvincialVictims(),
      loadFloodHistory(),
      loadMonsoon2025(),
      loadReliefStocks(),
      loadEmergencyContacts(),
      loadClimateData(),
      loadNDMAData()
    ]);

    return {
      disasterStats,
      provincialVictims,
      floodHistory,
      monsoon2025,
      reliefStocks,
      emergencyContacts,
      climateData,
      ndmaData
    };
  } catch (error) {
    console.error('Error loading all data:', error);
    throw error;
  }
};

// Export individual loaders as named exports
export default {
  loadDisasterStats,
  loadProvincialVictims,
  loadFloodHistory,
  loadMonsoon2025,
  loadReliefStocks,
  loadEmergencyContacts,
  loadClimateData,
  loadNDMAData,
  loadHistoricalFloods,
  loadProvincialImpacts,
  loadClimateTrends,
  loadAllData
};
