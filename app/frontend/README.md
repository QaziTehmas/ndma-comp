# PDME Frontend

Pakistan Disaster Management Ecosystem (PDME) - Frontend Application

## Overview

This is the frontend application for the PDME platform, built with React and Vite. The application provides real-time disaster monitoring, flood prediction, weather tracking, and community engagement features for disaster management in Pakistan.

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js / Recharts** - Data visualization
- **ArcGIS Maps SDK** - Interactive mapping
- **Leaflet** - Map components
- **Framer Motion** - Animation library
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── public/                 # Static assets served directly
│   ├── data/              # JSON data files
│   ├── reservoirs/        # Reservoir images
│   └── team/              # Team member photos
├── src/
│   ├── assets/            # Imported assets (images, icons)
│   ├── components/        # Reusable UI components
│   │   ├── about/         # About page components
│   │   ├── Auth/          # Authentication components
│   │   ├── community/     # Community features
│   │   ├── dashboard/     # Dashboard components
│   │   ├── history/       # History slide components
│   │   ├── UI/            # Generic UI components
│   │   └── ...
│   ├── config/            # Configuration files
│   ├── context/           # React context providers
│   ├── data/              # Static data and constants
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Third-party library setup
│   ├── pages/             # Page components
│   │   ├── dashboard/     # Dashboard pages
│   │   └── history/       # History pages
│   ├── services/          # API services and data fetching
│   └── utils/             # Utility functions
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

## Features

- **Real-time Weather Monitoring** - Live weather data and forecasts
- **Flood Prediction** - AI-powered flood risk assessment
- **Fire Risk Assessment** - Forest fire probability analysis
- **Water Analysis** - Reservoir and water level monitoring
- **Interactive Maps** - ArcGIS-powered mapping with location search
- **Community Platform** - User-generated reports and posts
- **Historical Data** - Flood and earthquake history visualization
- **Analytics Dashboard** - Comprehensive data visualization
- **Dark/Light Theme** - Theme switching support

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Environment Configuration

The application uses environment variables for API configuration. Ensure your backend API is running and accessible at the configured endpoint (default: `http://localhost:8000`).

## Key Directories

- **`src/components/`** - Reusable React components organized by feature
- **`src/pages/`** - Page-level components and routes
- **`src/services/`** - API integration and data fetching logic
- **`src/hooks/`** - Custom React hooks for shared logic
- **`src/utils/`** - Helper functions and utilities
- **`src/context/`** - React Context providers (Auth, Theme)

## Code Organization

- Components are organized by feature/domain
- Each component has its own file with co-located CSS when needed
- Services handle all API communication
- Custom hooks encapsulate reusable stateful logic
- Utils contain pure functions and helpers

## Deployment

The application is configured for deployment on Vercel. The `vercel.json` file contains routing configuration for SPA support.

## License

This project is part of the NDMA Competition submission.
