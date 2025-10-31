import * as Location from 'expo-location';

/**
 * Get current device location with balanced accuracy
 * @returns Promise with latitude and longitude coordinates
 * @throws Error if location permission is denied or location unavailable
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  try {
    // Check if location permission is granted
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }
    
    // Get current position with balanced accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    // Handle location errors gracefully
    if (error instanceof Error) {
      throw new Error(`Failed to get location: ${error.message}`);
    }
    throw new Error('Failed to get location: Unknown error');
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // Convert to radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "150 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    // Display in meters for distances less than 1 km
    return `${Math.round(meters)} m`;
  } else {
    // Display in kilometers for distances 1 km or more
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(1)} km`;
  }
}
