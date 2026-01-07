import {
  magnitudeToSeverity,
  getSeverityColor,
  getSeverityLabel
} from '../severity'
import { DISASTER_CONFIGS } from '../../constants/disasters'

describe('Severity Utils', () => {
  describe('magnitudeToSeverity', () => {
    it('should return severity 1 for magnitude < 4.0', () => {
      expect(magnitudeToSeverity(3.5)).toBe(1)
      expect(magnitudeToSeverity(4.0)).toBe(2) // >= 4.0
    })

    it('should return severity 2 for magnitude 4.0-5.0', () => {
      expect(magnitudeToSeverity(4.0)).toBe(2)
      expect(magnitudeToSeverity(4.5)).toBe(2)
      expect(magnitudeToSeverity(5.0)).toBe(3) // >= 5.0
    })

    it('should return severity 3 for magnitude 5.0-6.0', () => {
      expect(magnitudeToSeverity(5.0)).toBe(3)
      expect(magnitudeToSeverity(5.5)).toBe(3)
      expect(magnitudeToSeverity(6.0)).toBe(4) // >= 6.0
    })

    it('should return severity 4 for magnitude >= 6.0', () => {
      expect(magnitudeToSeverity(6.0)).toBe(4)
      expect(magnitudeToSeverity(7.0)).toBe(4)
      expect(magnitudeToSeverity(8.0)).toBe(4)
    })
  })

  describe('getSeverityColor', () => {
    it('should return correct color for each severity level', () => {
      expect(getSeverityColor(1)).toBe('#22c55e') // green
      expect(getSeverityColor(2)).toBe('#eab308') // yellow
      expect(getSeverityColor(3)).toBe('#f97316') // orange
      expect(getSeverityColor(4)).toBe('#ef4444') // red
    })
  })

  describe('getSeverityLabel', () => {
    it('should return correct label for earthquake severity', () => {
      expect(getSeverityLabel('earthquake', 1)).toBe('Menor (< 4.0)')
      expect(getSeverityLabel('earthquake', 2)).toBe('Leve (4.0 - 5.0)')
      expect(getSeverityLabel('earthquake', 3)).toBe('Moderado (5.0 - 6.0)')
      expect(getSeverityLabel('earthquake', 4)).toBe('Severo (> 6.0)')
    })

    it('should return correct label for tsunami severity', () => {
      expect(getSeverityLabel('tsunami', 1)).toBe('Vigilancia')
      expect(getSeverityLabel('tsunami', 2)).toBe('Aviso')
      expect(getSeverityLabel('tsunami', 3)).toBe('Alerta')
      expect(getSeverityLabel('tsunami', 4)).toBe('Alerta Máxima')
    })

    it('should return correct label for volcano severity', () => {
      expect(getSeverityLabel('volcano', 1)).toBe('Verde')
      expect(getSeverityLabel('volcano', 2)).toBe('Amarillo')
      expect(getSeverityLabel('volcano', 3)).toBe('Naranja')
      expect(getSeverityLabel('volcano', 4)).toBe('Rojo')
    })
  })

  describe('DISASTER_CONFIGS', () => {
    it('should have all required disaster types', () => {
      const expectedTypes = [
        'earthquake',
        'tsunami',
        'volcano',
        'wildfire',
        'flood',
        'storm',
        'landslide'
      ]

      expectedTypes.forEach(type => {
        expect(DISASTER_CONFIGS).toHaveProperty(type)
        expect(DISASTER_CONFIGS[type]).toHaveProperty('id')
        expect(DISASTER_CONFIGS[type]).toHaveProperty('name')
        expect(DISASTER_CONFIGS[type]).toHaveProperty('nameEs')
        expect(DISASTER_CONFIGS[type]).toHaveProperty('icon')
        expect(DISASTER_CONFIGS[type]).toHaveProperty('color')
        expect(DISASTER_CONFIGS[type]).toHaveProperty('severityLabels')
      })
    })

    it('should have severity labels for all levels', () => {
      Object.values(DISASTER_CONFIGS).forEach(config => {
        expect(config.severityLabels).toHaveProperty('1')
        expect(config.severityLabels).toHaveProperty('2')
        expect(config.severityLabels).toHaveProperty('3')
        expect(config.severityLabels).toHaveProperty('4')
      })
    })
  })
})
