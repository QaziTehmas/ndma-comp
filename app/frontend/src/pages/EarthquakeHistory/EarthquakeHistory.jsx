import React from 'react';
import { Activity, Map, Shield, AlertTriangle } from 'lucide-react';
import './EarthquakeHistory.css';

const EarthquakeHistory = () => {
  // Static data for earthquakes since we don't have a specific JSON for it
  const earthquakes = [
    {
      year: 2005,
      location: 'Kashmir & NWFP',
      magnitude: 7.6,
      deaths: '87,350+',
      description: 'The deadliest earthquake in Pakistan\'s history. Muzaffarabad was the epicenter. Millions were left homeless.'
    },
    {
      year: 2013,
      location: 'Balochistan (Awaran)',
      magnitude: 7.7,
      deaths: '825+',
      description: 'A powerful quake that created a new island (Zalzala Koh) off the coast of Gwadar.'
    },
    {
      year: 2015,
      location: 'Hindu Kush Region',
      magnitude: 7.5,
      deaths: '280+',
      description: 'Centered in Afghanistan but caused significant damage in KP and Gilgit-Baltistan.'
    },
    {
      year: 2019,
      location: 'Mirpur, AJK',
      magnitude: 5.6,
      deaths: '40+',
      description: 'Shallow earthquake causing severe infrastructure damage in Mirpur city and Jatlan.'
    }
  ];

  const guidelines = [
    {
      title: 'Drop, Cover, and Hold On',
      desc: 'If indoors, drop to the ground, take cover under a sturdy table, and hold on until shaking stops.',
      icon: <Activity className="guideline-icon-orange" />
    },
    {
      title: 'Stay Away from Glass',
      desc: 'Move away from windows, mirrors, and anything that could shatter or fall on you.',
      icon: <AlertTriangle className="guideline-icon-red" />
    },
    {
      title: 'Prepare an Emergency Kit',
      desc: 'Keep water, non-perishable food, flashlight, and first aid kit ready at all times.',
      icon: <Shield className="guideline-icon-green" />
    }
  ];

  return (
    <div className="earthquake-history-page">
      <div className="earthquake-container">
        <div className="earthquake-header">
          <h1 className="earthquake-title">Earthquake History</h1>
          <p className="earthquake-subtitle">Seismic activity records and safety guidelines</p>
        </div>

        {/* 2005 Kashmir Earthquake Highlight */}
        <div className="kashmir-highlight">
          <div className="kashmir-content">
            <div className="devastating-badge">
              MOST DEVASTATING
            </div>
            <h2 className="kashmir-title">2005 Kashmir Earthquake</h2>
            <div className="kashmir-stats">
              <div>
                <div className="stat-subtitle">Magnitude</div>
                <div className="stat-number">7.6</div>
              </div>
              <div>
                <div className="stat-subtitle">Total Deaths</div>
                <div className="stat-number">87,350</div>
              </div>
              <div>
                <div className="stat-subtitle">Homeless</div>
                <div className="stat-number">3.5M+</div>
              </div>
            </div>
            <p className="kashmir-description">
              On October 8, 2005, a massive earthquake struck the Kashmir region and North-West Frontier Province (now KP). 
              It remains the deadliest earthquake in the history of the South Asian subcontinent.
            </p>
          </div>
          <Activity className="kashmir-icon" />
        </div>

        {/* Timeline */}
        <div className="earthquake-content-grid">
          <div>
            <h2 className="content-section-title">Major Seismic Events</h2>
            <div className="events-list">
              {earthquakes.map((quake) => (
                <div key={quake.year} className="event-item">
                  <div className="event-item-header">
                    <h3 className="event-location">{quake.location}</h3>
                    <span className="event-year">{quake.year}</span>
                  </div>
                  <div className="event-details">
                    <span className="event-magnitude">Mag: {quake.magnitude}</span>
                    <span className="event-deaths">Deaths: {quake.deaths}</span>
                  </div>
                  <p className="event-text">{quake.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seismic Zones Map Placeholder */}
          <div className="seismic-zones-card">
            <h2 className="content-section-title">Seismic Zones of Pakistan</h2>
            <div className="map-placeholder">
              <div className="map-content">
                <Map className="map-icon" />
                <h3 className="map-title">Seismic Zone Map Visualization</h3>
                <p className="map-description">
                  Pakistan lies on the boundary of the Indian and Eurasian tectonic plates, 
                  making it highly prone to seismic activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preparedness Guidelines */}
        <div className="preparedness-section">
          <h2 className="content-section-title">Earthquake Preparedness</h2>
          <div className="guidelines-grid">
            {guidelines.map((guide, index) => (
              <div key={index} className="guideline-card">
                <div className="guideline-icon-wrapper">
                  {guide.icon}
                </div>
                <h3 className="guideline-title">{guide.title}</h3>
                <p className="guideline-description">{guide.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeHistory;

