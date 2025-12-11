import axios from "axios";

export async function reverseGeocode(lat, lon) {
  try {
    // Use OpenStreetMap Nominatim for reverse geocoding
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse`;
    const reverseParams = {
      lat: lat,
      lon: lon,
      format: "json",
      zoom: 10,
      addressdetails: 1,
    };

    const { data } = await axios.get(reverseUrl, {
      params: reverseParams,
    });

    if (data && data.address) {
      const addr = data.address;
      const parts = [
        addr.city || addr.town || addr.village || addr.suburb || addr.county,
        addr.state || addr.region,
        addr.country,
      ].filter(Boolean);

      if (parts.length > 0) {
        return parts.join(", ");
      }
    }

    // If we have display_name, use that
    if (data && data.display_name) {
      return data.display_name;
    }

    // Fallback to coordinates
    const latStr = typeof lat === "number" ? lat.toFixed(4) : lat;
    const lonStr = typeof lon === "number" ? lon.toFixed(4) : lon;
    return `${latStr}, ${lonStr}`;
  } catch (error) {
    console.error("Geocoding error:", error);
    const latStr = typeof lat === "number" ? lat.toFixed(4) : lat;
    const lonStr = typeof lon === "number" ? lon.toFixed(4) : lon;
    return `${latStr}, ${lonStr}`;
  }
}

// Forward geocoding - search for a location by name - LIMITED TO PAKISTAN ONLY
export async function searchLocation(query) {
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search`;
    const params = {
      q: `${query}, Pakistan`, // Explicitly add Pakistan to search
      format: "json",
      limit: 5, // Get more results to filter
      addressdetails: 1,
      countrycodes: 'pk', // Limit to Pakistan country code
    };

    const { data } = await axios.get(searchUrl, { 
      params,
      headers: {
        'User-Agent': 'FloodManagementSystem/1.0'
      }
    });

    if (data && data.length > 0) {
      // Filter to ensure it's in Pakistan
      const pakistanResult = data.find(result => {
        const address = result.address || {};
        const country = (address.country || '').toLowerCase();
        const countryCode = (result.address?.country_code || '').toLowerCase();
        return country === 'pakistan' || countryCode === 'pk';
      }) || data[0]; // Fallback to first result if filtering fails

      return {
        latitude: parseFloat(pakistanResult.lat),
        longitude: parseFloat(pakistanResult.lon),
        name: pakistanResult.display_name,
      };
    }

    throw new Error("Location not found in Pakistan");
  } catch (error) {
    console.error("Location search error:", error);
    throw error;
  }
}
