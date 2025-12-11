/**
 * Water Data Service
 * Simulates the backend logic for processing IRSA River/Dam reports.
 * Used to provide realistic data for the Flood Monitoring Dashboard.
 */

// Flood Risk Thresholds (Based on IRSA Historical Data)
const TARBELA_THRESHOLDS = {
    normal: 1520,   // < 1520
    warning: 1550,  // 1520-1550
    danger: 1570,   // 1550-1570
    // extreme > 1570
};

const MANGLA_THRESHOLDS = {
    normal: 1220,   // < 1220
    warning: 1242,  // 1220-1242
    danger: 1250,   // 1242-1250
    // extreme > 1250
};

const RIM_THRESHOLDS = {
    normal: 100000,   // < 100k
    warning: 200000,  // 100k-200k
    danger: 400000,   // 200k-400k
    // extreme > 400k
};

// --- DATA LOCATIONS (Fixed Coordinates) ---

export const DAM_LOCATIONS = [
    {
        id: 'tarbela',
        name: 'Tarbela Dam',
        river: 'Indus River',
        latitude: 34.0869,
        longitude: 72.6989,
        deadLevel: 1402,
        maxLevel: 1550,
        type: 'dam'
    },
    {
        id: 'mangla',
        name: 'Mangla Dam',
        river: 'Jhelum River',
        latitude: 33.1450,
        longitude: 73.6521,
        deadLevel: 1050,
        maxLevel: 1242,
        type: 'dam'
    }
];

export const BARRAGE_LOCATIONS = [
    { id: 'kalabagh', name: 'Kalabagh Barrage', river: 'Indus River', latitude: 32.9556, longitude: 71.5542, type: 'barrage' },
    { id: 'chashma', name: 'Chashma Barrage', river: 'Indus River', latitude: 32.4339, longitude: 71.3936, type: 'barrage' },
    { id: 'taunsa', name: 'Taunsa Barrage', river: 'Indus River', latitude: 30.7042, longitude: 70.8394, type: 'barrage' },
    { id: 'guddu', name: 'Guddu Barrage', river: 'Indus River', latitude: 28.4187, longitude: 69.7044, type: 'barrage' },
    { id: 'sukkur', name: 'Sukkur Barrage', river: 'Indus River', latitude: 27.7019, longitude: 68.8507, type: 'barrage' },
    { id: 'kotri', name: 'Kotri Barrage', river: 'Indus River', latitude: 25.4325, longitude: 68.3090, type: 'barrage' }
];

export const RIVER_STATIONS = [
    { id: 'nowshera', name: 'Kabul @ Nowshera', river: 'Kabul River', latitude: 34.0167, longitude: 71.9725, type: 'station' },
    { id: 'marala', name: 'Chenab @ Marala', river: 'Chenab River', latitude: 32.6667, longitude: 74.4500, type: 'station' }
];

/**
 * Assess risk level based on value and thresholds
 * @returns {string} 'NORMAL', 'WARNING', 'DANGER', 'EXTREME'
 */
export function assessRisk(value, thresholds) {
    if (value >= thresholds.danger + (thresholds.danger * 0.1)) return 'EXTREME'; // heuristic for extreme
    if (value >= thresholds.danger) return 'DANGER';
    if (value >= thresholds.warning) return 'WARNING';
    return 'NORMAL';
}

/**
 * Get color for risk level
 */
export function getRiskColor(level) {
    switch (level) {
        case 'EXTREME': return '#7f1d1d'; // Dark Red
        case 'DANGER': return '#dc2626';  // Red
        case 'WARNING': return '#f59e0b'; // Amber
        case 'NORMAL': return '#10b981';  // Emerald
        default: return '#9ca3af';
    }
}

/**
 * Simulate fetching real-time flood data OR fetch from local Python backend
 * Hybrid Approach: Tries localhost:8000 first, falls back to simulation.
 */
export async function fetchFloodData() {
    try {
        // 1. Try Local Python Backend (Real/Cached Data)
        const response = await fetch('http://localhost:8000/api/flood-data', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("🌊 Using Real/Cached Data from Backend:", data.source);
            return data;
        } else {
            throw new Error("Backend not responding OK");
        }
    } catch (err) {
        console.warn("⚠️ Backend unreachable (using simulation):", err);
        // 2. Fallback to Simulation

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 600));

        // Base values (Updated to match User's 05.12.2025 Report)
        // Add minimal random fluctuation
        const fluctuation = () => (Math.random() * 0.1) - 0.05;
        const flowFluct = () => (Math.random() * 20) - 10;

        const tarbelaLevel = 1491.26 + fluctuation();
        const manglaLevel = 1214.70 + fluctuation();

        const data = {
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toISOString(),
            source: "SIMULATED (Frontend Fallback)",
            overall_risk: "NORMAL",
            risks: {
                // --- DAMS ---
                tarbela: {
                    level: tarbelaLevel,
                    capacity_percent: ((tarbelaLevel - 1402) / (1550 - 1402)) * 100,
                    inflow: 21600 + flowFluct(),
                    outflow: 33000 + flowFluct(),
                    risk: assessRisk(tarbelaLevel, TARBELA_THRESHOLDS)
                },
                mangla: {
                    level: manglaLevel,
                    capacity_percent: ((manglaLevel - 1050) / (1242 - 1050)) * 100,
                    inflow: 3144 + flowFluct(), // Corrected to report
                    outflow: 33000 + flowFluct(),
                    risk: assessRisk(manglaLevel, MANGLA_THRESHOLDS)
                },

                // --- RIM STATIONS ---
                rim_stations: {
                    total_inflow: 39865 + flowFluct(),
                    risk: assessRisk(39865, RIM_THRESHOLDS)
                }
            }
        };

        // --- SIMULATED BARRAGE DATA (Based on Report) ---
        const barrageData = {};
        const stationData = {};

        // Stations
        stationData['nowshera'] = { inflow: 7400 + flowFluct(), outflow: 7400 + flowFluct(), risk: 'NORMAL' };
        stationData['marala'] = { inflow: 7721 + flowFluct(), outflow: 1813 + flowFluct(), risk: 'NORMAL' };

        // Barrages
        barrageData['kalabagh'] = { inflow: 38249 + flowFluct(), outflow: 31749 + flowFluct(), risk: 'NORMAL' };
        barrageData['chashma'] = { inflow: 45000 + flowFluct(), outflow: 42000 + flowFluct(), risk: 'NORMAL' }; // Est
        barrageData['taunsa'] = { inflow: 51159 + flowFluct(), outflow: 44659 + flowFluct(), risk: 'NORMAL' };
        barrageData['guddu'] = { inflow: 55145 + flowFluct(), outflow: 47625 + flowFluct(), risk: 'NORMAL' };
        barrageData['sukkur'] = { inflow: 43220 + flowFluct(), outflow: 14550 + flowFluct(), risk: 'NORMAL' };
        barrageData['kotri'] = { inflow: 10400 + flowFluct(), outflow: 1245 + flowFluct(), risk: 'NORMAL' };

        // Add to response
        data.risks.barrages = barrageData;
        data.risks.stations = stationData;

        // Derived overall risk (Check all points)
        const allRisks = [
            data.risks.tarbela.risk,
            data.risks.mangla.risk,
            data.risks.rim_stations.risk,
            ...Object.values(barrageData).map(d => d.risk)
        ];

        if (allRisks.includes('EXTREME')) data.overall_risk = 'EXTREME';
        else if (allRisks.includes('DANGER')) data.overall_risk = 'DANGER';
        else if (allRisks.includes('WARNING')) data.overall_risk = 'WARNING';

        return data;
    }
}
