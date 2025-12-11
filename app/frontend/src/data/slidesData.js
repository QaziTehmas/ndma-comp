// Import all assets
import slide1Bg from "../assets/history/slide1-bg.jpg";
import slide1Img from "../assets/history/slide1-img.jpg";
import damFailure from "../assets/history/dam-failure.jpg";
import flashFlood from "../assets/history/flash-flood.jpg";
import riverFlood from "../assets/history/river-flood.jpg";
import coastalFlood from "../assets/history/coastal-flooding.jpg";
import slide3Bg from "../assets/history/slide3-bg.jpg";
import slide4Bg from "../assets/history/slide4-bg.png";
import chartImg from "../assets/history/chart.png";
import hapiImg from "../assets/history/hapi.jpg";
import hapiSlideBg from "../assets/history/hapi-slide-bg.jpg";
import ourSolutionBg from "../assets/history/our-solution-slide-bg.jpg";
import arcgisPro from "../assets/history/arcgis-pro.png";
import reactIcon from "../assets/react.svg";
import scikitIcon from "../assets/history/scikit-learn.svg";
import jsPdfIcon from "../assets/history/jsPDF.svg";
import thankyouBg from "../assets/history/thankyou-bg.jpg";
import preventionBg from "../assets/history/prevention.jpg";

export const TOTAL_SLIDES = 10;

export const SLIDES_CONFIG = [
  {
    id: 0,
    className: "slide-5",
    bgImage: hapiSlideBg,
    title: "Hapi — God of the Nile's Flood",
    content: "hapi",
  },
  {
    id: 1,
    className: "slide-1",
    bgImage: slide1Bg,
    title: "What Is a Flood?",
    content: "intro",
  },
  {
    id: 2,
    className: "slide-2",
    bgImage: damFailure,
    title: "Types of Floods",
    subtitle: "Common flood types and typical causes",
    content: "types",
  },
  {
    id: 3,
    className: "gallery",
    bgImage: slide3Bg,
    title: "Flood Examples",
    content: "gallery",
  },
  {
    id: 4,
    className: "slide-3",
    bgImage: slide4Bg,
    title: "Climate Change Impact",
    content: "climate",
  },
  {
    id: 5,
    className: "slide-4",
    title: "Historical Impact",
    subtitle: "Devastating Flood Events Through Time",
    content: "historical",
  },
  {
    id: 6,
    className: "slide-prevention",
    bgImage: preventionBg,
    title: "Flood Prevention",
    subtitle: "How communities can prepare",
    content: "prevention",
  },
  {
    id: 7,
    className: "slide-6",
    bgImage: ourSolutionBg,
    title: "Our Mission & Solutions",
    subtitle:
      "Eye of Hapi — real-time awareness, prediction & community support",
    content: "mission",
  },
  {
    id: 8,
    className: "slide-8",
    title: "Technologies",
    subtitle: "Tools & libraries used to build Eye of Hapi",
    content: "technologies",
  },
  {
    id: 9,
    className: "slide-9",
    bgImage: thankyouBg,
    content: "thankyou",
  },
];

export const FLOOD_TYPES = [
  {
    title: "River (Fluvial) Floods",
    description:
      "Occur when rivers overflow due to heavy rainfall or snowmelt, inundating adjacent floodplains.",
  },
  {
    title: "Coastal Floods",
    description:
      "Caused by storm surge, high tides, and rising sea levels, affecting coastal communities.",
  },
  {
    title: "Flash Floods",
    description:
      "Rapid flooding following intense short-duration rainfall or dam failures, with little warning time.",
  },
  {
    title: "Urban (Pluvial) Floods",
    description:
      "Result from overwhelmed drainage in built environments, where impermeable surfaces prevent absorption.",
  },
];

export const GALLERY_IMAGES = [
  { src: flashFlood, caption: "Flash Flood" },
  { src: riverFlood, caption: "River Flood" },
  { src: damFailure, caption: "Dam Failure" },
  { src: coastalFlood, caption: "Coastal Flooding" },
];

export const HISTORICAL_EVENTS = [
  "1931 China Floods - Over 1 million casualties, worst natural disaster",
  "1953 North Sea Flood - 2,551 deaths across Netherlands and UK",
  "2010 Pakistan Floods - 20 million people affected, $10B damage",
  "2011 Thailand Floods - 815 deaths, economic impact of $45 billion",
  "2013 European Floods - €12 billion in damages across Central Europe",
];

export const MISSION_SOLUTIONS = [
  {
    title: "Interactive Map",
    description:
      "View live weather details, local observations, and location-specific conditions.",
  },
  {
    title: "Real-time Monitoring",
    description:
      "Continuous weather and sensor data for immediate situational awareness.",
  },
  {
    title: "Flood Risk Prediction",
    description:
      "Model-based probability levels for each location, from very low to very high.",
  },
  {
    title: "Community Reporting",
    description:
      "Share posts, photos, and on-ground updates to support neighbors and responders.",
  },
  {
    title: "Reports & Visualizations",
    description:
      "Exportable charts, summaries, and historical trends for analysis.",
  },
];

export const TECH_STACK = [
  { icon: reactIcon, label: "React" },
  { icon: "/vite.svg", label: "Vite" },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    label: "JavaScript",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    label: "CSS",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    label: "Node.js",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
    label: "Express",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    label: "PostgreSQL",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    label: "Python",
  },
  {
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
    label: "Pandas",
  },
  { icon: scikitIcon, label: "scikit-learn" },
  { icon: jsPdfIcon, label: "jsPDF / Reports" },
  { icon: arcgisPro, label: "ArcGIS Pro / ArcGIS Online" },
];

// Re-export assets for use in slide components
export {
  slide1Img,
  chartImg,
  hapiImg,
  flashFlood,
  riverFlood,
  damFailure,
  coastalFlood,
};
