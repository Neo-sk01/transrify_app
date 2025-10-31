import * as Location from 'expo-location';
import { getCurrentLocation, calculateDistance, formatDistance } from '../src/lib/geo';

// Get mocked functions
const mockGetForegroundPermissionsAsync = Location.getForegroundPermissionsAsync as jest.MockedFunction<
  typeof Location.getForegroundPermissionsAsync
>;
const mockGetCurrentPositionAsync = Location.getCurrentPositionAsync as jest.MockedFunction<
  typeof Location.getCurrentPositionAsync
>;

describe('Geolocation helpers', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two nearby points', () => {
      // San Francisco coordinates (approximately 1 km apart)
      const lat1 = 37.7749;
      const lng1 = -122.4194;
      const lat2 = 37.7849;
      const lng2 = -122.4194;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance should be approximately 1113 meters (1.113 km)
      expect(distance).toBeGreaterThan(1100);
      expect(distance).toBeLessThan(1130);
    });

    it('should calculate distance between two distant points', () => {
      // San Francisco to Los Angeles (approximately 559 km)
      const lat1 = 37.7749;
      const lng1 = -122.4194;
      const lat2 = 34.0522;
      const lng2 = -118.2437;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance should be approximately 559,000 meters
      expect(distance).toBeGreaterThan(550000);
      expect(distance).toBeLessThan(570000);
    });

    it('should return zero for identical coordinates', () => {
      const lat = 37.7749;
      const lng = -122.4194;

      const distance = calculateDistance(lat, lng, lat, lng);

      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      // Sydney to Melbourne (approximately 714 km)
      const lat1 = -33.8688;
      const lng1 = 151.2093;
      const lat2 = -37.8136;
      const lng2 = 144.9631;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance should be approximately 714,000 meters
      expect(distance).toBeGreaterThan(700000);
      expect(distance).toBeLessThan(730000);
    });

    it('should handle coordinates across the equator', () => {
      // Singapore to Jakarta (approximately 890 km)
      const lat1 = 1.3521;
      const lng1 = 103.8198;
      const lat2 = -6.2088;
      const lng2 = 106.8456;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance should be approximately 890,000 meters
      expect(distance).toBeGreaterThan(880000);
      expect(distance).toBeLessThan(910000);
    });
  });

  describe('formatDistance', () => {
    it('should format distances less than 1000 meters in meters', () => {
      expect(formatDistance(0)).toBe('0 m');
      expect(formatDistance(50)).toBe('50 m');
      expect(formatDistance(150)).toBe('150 m');
      expect(formatDistance(500)).toBe('500 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('should round meters to nearest integer', () => {
      expect(formatDistance(150.4)).toBe('150 m');
      expect(formatDistance(150.5)).toBe('151 m');
      expect(formatDistance(150.9)).toBe('151 m');
    });

    it('should format distances 1000 meters or more in kilometers', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1500)).toBe('1.5 km');
      expect(formatDistance(2000)).toBe('2.0 km');
      expect(formatDistance(5000)).toBe('5.0 km');
      expect(formatDistance(10000)).toBe('10.0 km');
    });

    it('should format kilometers with one decimal place', () => {
      expect(formatDistance(1234)).toBe('1.2 km');
      expect(formatDistance(1567)).toBe('1.6 km');
      expect(formatDistance(12345)).toBe('12.3 km');
      expect(formatDistance(123456)).toBe('123.5 km');
    });

    it('should handle edge case at 1000 meters boundary', () => {
      expect(formatDistance(999)).toBe('999 m');
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1001)).toBe('1.0 km');
    });
  });

  describe('getCurrentLocation', () => {
    it('should return location when permission is granted', async () => {
      // Mock permission granted
      mockGetForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      // Mock location data
      mockGetCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const location = await getCurrentLocation();

      expect(location).toEqual({
        lat: 37.7749,
        lng: -122.4194,
      });

      expect(mockGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Balanced,
      });
    });

    it('should throw error when permission is denied', async () => {
      // Mock permission denied
      mockGetForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      } as any);

      await expect(getCurrentLocation()).rejects.toThrow('Failed to get location: Location permission not granted');

      expect(mockGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('should throw error when permission check fails', async () => {
      // Mock permission check failure
      mockGetForegroundPermissionsAsync.mockRejectedValueOnce(new Error('Permission check failed'));

      await expect(getCurrentLocation()).rejects.toThrow('Failed to get location: Permission check failed');

      expect(mockGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('should throw error when location retrieval fails', async () => {
      // Mock permission granted
      mockGetForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      // Mock location retrieval failure
      mockGetCurrentPositionAsync.mockRejectedValueOnce(new Error('Location unavailable'));

      await expect(getCurrentLocation()).rejects.toThrow('Failed to get location: Location unavailable');

      expect(mockGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle unknown errors gracefully', async () => {
      // Mock permission granted
      mockGetForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      // Mock unknown error (not an Error instance)
      mockGetCurrentPositionAsync.mockRejectedValueOnce('Unknown error');

      await expect(getCurrentLocation()).rejects.toThrow('Failed to get location: Unknown error');

      expect(mockGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should calculate and format distance between current location and target', async () => {
      // Mock current location (San Francisco)
      mockGetForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockGetCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const currentLocation = await getCurrentLocation();

      // Target location (approximately 1 km away)
      const targetLat = 37.7849;
      const targetLng = -122.4194;

      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        targetLat,
        targetLng
      );

      const formattedDistance = formatDistance(distance);

      expect(formattedDistance).toBe('1.1 km');
    });

    it('should handle nearby location within meters range', async () => {
      // Mock current location
      mockGetForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      mockGetCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const currentLocation = await getCurrentLocation();

      // Target location (approximately 500 meters away)
      const targetLat = 37.7794;
      const targetLng = -122.4194;

      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        targetLat,
        targetLng
      );

      const formattedDistance = formatDistance(distance);

      expect(formattedDistance).toMatch(/^\d+ m$/);
      expect(distance).toBeLessThan(1000);
    });
  });
});
