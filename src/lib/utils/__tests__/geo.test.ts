import {
  calculateDistance,
  isValidCoordinates,
  formatCoordinates,
  generateGeohash,
  isPointInRadius
} from '../geo'

describe('Geo Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // Santiago to Valparaíso (aproximadamente 120km)
      const distance = calculateDistance(-33.45, -70.65, -33.05, -71.62)
      expect(distance).toBeGreaterThan(100)
      expect(distance).toBeLessThan(150)
    })

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(-33.45, -70.65, -33.45, -70.65)
      expect(distance).toBe(0)
    })
  })

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(-33.45, -70.65)).toBe(true)
      expect(isValidCoordinates(0, 0)).toBe(true)
      expect(isValidCoordinates(90, 180)).toBe(true)
      expect(isValidCoordinates(-90, -180)).toBe(true)
    })

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false) // lat > 90
      expect(isValidCoordinates(-91, 0)).toBe(false) // lat < -90
      expect(isValidCoordinates(0, 181)).toBe(false) // lng > 180
      expect(isValidCoordinates(0, -181)).toBe(false) // lng < -180
      expect(isValidCoordinates(NaN, 0)).toBe(false)
      expect(isValidCoordinates(0, NaN)).toBe(false)
    })
  })

  describe('formatCoordinates', () => {
    it('should format coordinates with default precision', () => {
      const result = formatCoordinates(-33.456789, -70.654321)
      expect(result).toBe('-33.4568, -70.6543')
    })

    it('should format coordinates with custom precision', () => {
      const result = formatCoordinates(-33.456789, -70.654321, 2)
      expect(result).toBe('-33.46, -70.65')
    })
  })

  describe('generateGeohash', () => {
    it('should generate a geohash string', () => {
      const geohash = generateGeohash(-33.45, -70.65)
      expect(typeof geohash).toBe('string')
      expect(geohash.length).toBeGreaterThan(0)
      // Should contain coordinates in mock format
      expect(geohash).toContain('-33.45')
      expect(geohash).toContain('-70.65')
    })

    it('should generate different geohashes for different locations', () => {
      const hash1 = generateGeohash(-33.45, -70.65)
      const hash2 = generateGeohash(-33.05, -71.62)
      expect(hash1).not.toBe(hash2)
      expect(hash1).toContain('-33.45')
      expect(hash2).toContain('-33.05')
    })
  })

  describe('isPointInRadius', () => {
    it('should return true for point within radius', () => {
      // Punto cercano al centro
      const result = isPointInRadius(-33.44, -70.64, -33.45, -70.65, 10)
      expect(result).toBe(true)
    })

    it('should return false for point outside radius', () => {
      // Punto lejano al centro
      const result = isPointInRadius(-30.0, -67.0, -33.45, -70.65, 10)
      expect(result).toBe(false)
    })

    it('should return true for point at center', () => {
      const result = isPointInRadius(-33.45, -70.65, -33.45, -70.65, 10)
      expect(result).toBe(true)
    })
  })
})
