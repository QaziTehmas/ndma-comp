// Use relative URL to go through Vite proxy in development, or absolute URL in production
const BACKEND_URL = import.meta.env.DEV ? '' : 'http://localhost:8000';

export async function predictFlood(predictionData) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/flood-prediction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get prediction';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (e2) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error predicting flood:', error);
    throw error;
  }
}

