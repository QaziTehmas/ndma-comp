/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import HeatmapRenderer from "@arcgis/core/renderers/HeatmapRenderer";
import Home from "@arcgis/core/widgets/Home";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Zoom from "@arcgis/core/widgets/Zoom";
import { zoomToCountry } from "../../utils/mapHelpers";
import { fetchEarthquakes } from "../../services/earthquakeService";
import "./FloodMap.css";
import MapLegend from "./MapLegend";
import BasemapSwitcher from "./BasemapSwitcher";
import "@arcgis/core/assets/esri/themes/light/main.css";
// import "@arcgis/core/assets/esri/themes/dark/main.css";

function FloodMap({ onLayerLoad, onViewLoad, onCountryClick, onPointSelect }) {
  const mapDiv = useRef(null);
  const viewRef = useRef(null);
  const mapRef = useRef(null);
  const isInitialized = useRef(false);
  const pointGraphicsLayerRef = useRef(null);
  const earthquakeLayerRef = useRef(null);
  const floodLayerRef = useRef(null);
  const [basemapId, setBasemapId] = useState("streets-vector");
  const [showFlood, setShowFlood] = useState(true);
  const [showQuakes, setShowQuakes] = useState(true);

  useEffect(() => {
    if (!mapDiv.current || isInitialized.current) return;

    isInitialized.current = true;
    let isMounted = true;
    let resizeObserver = null;

    const map = new Map({ basemap: basemapId });

    mapRef.current = map;

    // Create a graphics layer for point markers
    const pointGraphicsLayer = new GraphicsLayer({
      id: "pointLayer",
      title: "Analysis Points",
    });
    pointGraphicsLayer.visible = true;
    map.add(pointGraphicsLayer);
    pointGraphicsLayerRef.current = pointGraphicsLayer;

    // Create earthquake heatmap layer
    const createEarthquakeLayer = async () => {
      try {
        const earthquakeData = await fetchEarthquakes(30, 2.5);

        // Create a blob URL for the GeoJSON data
        const blob = new Blob([JSON.stringify(earthquakeData)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const quakeHeatRenderer = new HeatmapRenderer({
          field: "mag",
          radius: 20,
          maxDensity: 0.06,
          colorStops: [
            { ratio: 0, color: "rgba(0,0,0,0)" },
            { ratio: 0.2, color: "rgba(0,150,255,0.35)" },
            { ratio: 0.5, color: "rgba(255,200,0,0.45)" },
            { ratio: 0.8, color: "rgba(255,120,0,0.7)" },
            { ratio: 1, color: "rgba(255,30,30,1)" },
          ],
        });

        const earthquakeLayer = new GeoJSONLayer({
          url: url,
          title: "Recent Earthquakes",
          id: "earthquakeLayer",
          renderer: quakeHeatRenderer,
          opacity: 0.7,
          popupEnabled: false,
        });

        earthquakeLayer.visible = showQuakes;
        map.add(earthquakeLayer);
        earthquakeLayerRef.current = earthquakeLayer;
      } catch (error) {
        console.error("Failed to load earthquake data:", error);
      }
    };

    createEarthquakeLayer();

    const floodLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/UDCw00RKDRKPqASe/arcgis/rest/services/FLOODS_PONTS22/FeatureServer/0",
      id: "floodLayer",
      title: "Flood Points",
      outFields: ["*"],
      popupEnabled: true,
      popupTemplate: {
        title: "Flood Observation #{OBJECTID}",
        content:
          "<ul style='margin:0;padding-left:1rem'>" +
          "<li><b>Latitude:</b> {Latitude}</li>" +
          "<li><b>Longitude:</b> {Longitude}</li>" +
          "<li><b>Date:</b> {date}</li>" +
          "<li><b>Duration (days):</b> {flood_duration}</li>" +
          "<li><b>Intensity:</b> {flood_intensity}</li>" +
          "</ul>",
      },
    });
    floodLayer.visible = showFlood;
    map.add(floodLayer);
    floodLayerRef.current = floodLayer;

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [0, 20],
      zoom: 2,
      ui: {
        components: ["attribution"],
      },
      constraints: {
        rotationEnabled: false,
        minZoom: 2,
        maxZoom: 18,
      },
    });

    viewRef.current = view;

    view
      .when(() => {
        // Remove default attribution
        view.ui.remove("attribution");

        // Observe the map container for size changes and notify the view to resize
        if (mapDiv.current && view) {
          try {
            resizeObserver = new ResizeObserver(() => {
              try {
                view.resize();
              } catch (e) {
                // ignore resize errors
              }
            });
            resizeObserver.observe(mapDiv.current);
          } catch (e) {
            // ResizeObserver may not be supported in some environments
          }
        }
        // Add Zoom widget (+ and - buttons)
        const zoomWidget = new Zoom({
          view: view,
        });
        view.ui.add(zoomWidget, {
          position: "top-left",
        });

        // Add Home widget
        const homeWidget = new Home({
          view: view,
        });
        view.ui.add(homeWidget, {
          position: "top-left",
        });

        // Add Scale Bar widget
        const scaleBar = new ScaleBar({
          view: view,
          unit: "metric",
        });
        view.ui.add(scaleBar, {
          position: "bottom-left",
        });

        view.on("click", (event) => {
          // Get the coordinates from the click event
          const mapPoint = view.toMap({ x: event.x, y: event.y });
          const lat = mapPoint.latitude;
          const lon = mapPoint.longitude;

          // Check if user clicked on an existing feature or empty space
          view.hitTest(event).then((response) => {
            const results = response?.results || [];
            // 1) Ignore clicks on existing analysis point
            const pointLayerHit = results.some(
              (r) => r.graphic.layer && r.graphic.layer.id === "pointLayer"
            );
            if (pointLayerHit) return;

            // 2) Ignore clicks on earthquake heatmap layer
            const quakeLayerHit = results.some(
              (r) => r.graphic.layer && r.graphic.layer.id === "earthquakeLayer"
            );
            // We intentionally do nothing special for quake hits; fall through to add point

            // 2.5) If a flood feature was clicked, show popup and select it
            const floodHit = results.find(
              (r) => r.graphic?.layer && r.graphic.layer.id === "floodLayer"
            );
            if (floodHit) {
              const featPoint = floodHit.graphic.geometry;
              // Only open the popup. Do not place analysis marker to avoid overlap.
              view.popup.open({
                features: [floodHit.graphic],
                location: featPoint,
              });
              return;
            }

            // 3) Handle country clicks only when a feature has COUNTRY attribute
            const countryHit = results.find(
              (r) =>
                r.graphic?.attributes &&
                Object.prototype.hasOwnProperty.call(
                  r.graphic.attributes,
                  "COUNTRY"
                )
            );
            if (countryHit) {
              const countryName = countryHit.graphic.attributes.COUNTRY;
              if (onCountryClick && countryName) onCountryClick(countryName);
              zoomToCountry(view, countryHit.graphic.geometry).catch((error) =>
                console.error("Error zooming to clicked country:", error)
              );
              return;
            }

            pointGraphicsLayer.removeAll();

            const haloSymbol = {
              type: "simple-marker",
              style: "circle",
              color: [0, 122, 194, 0.25],
              size: "32px",
              outline: null,
            };

            const pointSymbol = {
              type: "simple-marker",
              style: "circle",
              color: [0, 122, 194],
              size: "18px",
              outline: {
                color: [255, 255, 255],
                width: 1.5,
              },
            };

            const haloGraphic = new Graphic({
              geometry: mapPoint,
              symbol: haloSymbol,
            });

            const pointGraphic = new Graphic({
              geometry: mapPoint,
              symbol: pointSymbol,
              attributes: {
                latitude: lat,
                longitude: lon,
              },
            });

            pointGraphicsLayer.addMany([haloGraphic, pointGraphic]);

            if (onPointSelect) {
              onPointSelect({ latitude: lat, longitude: lon });
            }
          });
        });

        if (onViewLoad) {
          onViewLoad(view);
        }
      })
      .catch((error) => {
        console.error("Error initializing view:", error);
      });

    return () => {
      isMounted = false;
      isInitialized.current = false;

      if (viewRef.current) {
        viewRef.current.container = null;
        viewRef.current.destroy();
        viewRef.current = null;
      }
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch (e) {
          console.log("ResizeObserver disconnect error:", e);
        }
        resizeObserver = null;
      }
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle basemap switching from overlay buttons
  const handleBasemapChange = (id) => {
    setBasemapId(id);
    if (mapRef.current) {
      mapRef.current.basemap = id;
    }
  };

  const handleLayerToggle = (key) => {
    if (key === "flood") {
      const next = !showFlood;
      setShowFlood(next);
      if (floodLayerRef.current) floodLayerRef.current.visible = next;
    }
    if (key === "quakes") {
      const next = !showQuakes;
      setShowQuakes(next);
      if (earthquakeLayerRef.current) earthquakeLayerRef.current.visible = next;
    }
  };

  return (
    <div ref={mapDiv} className="map-view">
      {/* Overlays */}
      <MapLegend
        showFlood={showFlood}
        showQuakes={showQuakes}
        onToggle={handleLayerToggle}
      />
      <BasemapSwitcher current={basemapId} onChange={handleBasemapChange} />
    </div>
  );
}

export default FloodMap;
