'use client'

import { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export function EarthquakeIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#D4B57A" strokeWidth="2"/>
      <path d="M12 28 L18 20 L24 32 L30 16 L36 36 L44 28" stroke="#D4B57A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function TsunamiIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#7088A0" strokeWidth="2"/>
      <path d="M8 30 Q14 22 20 30 Q26 38 32 30 Q38 22 44 30 Q50 38 56 30" stroke="#7088A0" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10 38 Q16 30 22 38 Q28 46 34 38 Q40 30 46 38" stroke="#7088A0" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

export function VolcanoIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#A07888" strokeWidth="2"/>
      <path d="M14 44 L24 24 L28 28 L32 24 L42 44 Z" fill="#0D0E14" stroke="#A07888" strokeWidth="2"/>
      <ellipse cx="28" cy="24" rx="4" ry="2" fill="#D4B57A"/>
      <circle cx="28" cy="16" r="3" fill="#D4B57A" opacity="0.7"/>
      <circle cx="24" cy="12" r="2" fill="#D4B57A" opacity="0.5"/>
      <circle cx="33" cy="14" r="1.5" fill="#D4B57A" opacity="0.4"/>
    </svg>
  )
}

export function WildfireIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#D4B57A" strokeWidth="2"/>
      <path d="M28 44 C20 44 16 36 16 30 C16 24 20 20 24 18 C22 22 24 26 28 26 C26 22 28 16 32 12 C32 20 36 22 38 26 C40 30 40 36 36 40 C34 42 32 44 28 44 Z" fill="#D4B57A"/>
      <path d="M28 44 C24 44 22 40 22 36 C22 32 24 30 26 28 C25 31 26 33 28 33 C27 31 28 28 30 26 C30 30 32 32 33 34 C34 36 34 40 32 42 C31 43 30 44 28 44 Z" fill="#E8E8F0" opacity="0.8"/>
    </svg>
  )
}

export function FloodIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#7088A0" strokeWidth="2"/>
      <path d="M8 24 Q14 18 20 24 Q26 30 32 24 Q38 18 44 24" stroke="#7088A0" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 32 Q14 26 20 32 Q26 38 32 32 Q38 26 44 32" stroke="#7088A0" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 40 Q14 34 20 40 Q26 46 32 40 Q38 34 44 40" stroke="#7088A0" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

export function StormIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#8890A0" strokeWidth="2"/>
      <circle cx="28" cy="28" r="8" fill="none" stroke="#8890A0" strokeWidth="2"/>
      <line x1="28" y1="8" x2="28" y2="16" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="40" x2="28" y2="48" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="28" x2="16" y2="28" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="28" x2="48" y2="28" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="14" x2="20" y2="20" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="36" x2="42" y2="42" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="42" x2="20" y2="36" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="20" x2="42" y2="14" stroke="#8890A0" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function LandslideIcon({ size = 56, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="28" cy="28" r="24" fill="#1A1B22" stroke="#8890A0" strokeWidth="2"/>
      <path d="M16 16 L40 16 L28 44 Z" fill="none" stroke="#8890A0" strokeWidth="2"/>
      <circle cx="28" cy="24" r="3" fill="#8890A0"/>
      <circle cx="24" cy="32" r="2.5" fill="#8890A0" opacity="0.8"/>
      <circle cx="32" cy="32" r="2.5" fill="#8890A0" opacity="0.8"/>
      <circle cx="28" cy="38" r="2" fill="#8890A0" opacity="0.6"/>
    </svg>
  )
}

// Logo principal de Sentinel
export function SentinelLogo({ size = 40, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="90" cy="65" r="55" stroke="#D4B57A" strokeWidth="1" opacity="0.1"/>
      <circle cx="90" cy="65" r="40" stroke="#D4B57A" strokeWidth="1.5" opacity="0.2"/>
      <circle cx="90" cy="65" r="25" stroke="#D4B57A" strokeWidth="2" opacity="0.35"/>
      <path d="M90 22 C90 22 148 38 148 88 C148 135 118 162 90 172 C62 162 32 135 32 88 C32 38 90 22 90 22 Z"
            fill="url(#shield-gradient)" stroke="#D4B57A" strokeWidth="2"/>
      <path d="M80 165 L84 100 L96 100 L100 165" fill="#0D0E14" stroke="#7088A0" strokeWidth="1.5"/>
      <rect x="78" y="94" width="24" height="10" rx="2" fill="#1A1B22" stroke="#7088A0" strokeWidth="1.5"/>
      <circle cx="90" cy="65" r="16" fill="url(#light-gradient)"/>
      <circle cx="90" cy="65" r="8" fill="#D4B57A"/>
      <circle cx="90" cy="65" r="3" fill="#E8E8F0"/>
      <line x1="90" y1="42" x2="90" y2="32" stroke="#D4B57A" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <line x1="108" y1="50" x2="115" y2="43" stroke="#D4B57A" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="72" y1="50" x2="65" y2="43" stroke="#D4B57A" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M78 135 L86 145 L104 125" stroke="#A07888" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="shield-gradient" x1="90" y1="22" x2="90" y2="172" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A1B22"/>
          <stop offset="100%" stopColor="#0D0E14"/>
        </linearGradient>
        <radialGradient id="light-gradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#E8E8F0"/>
          <stop offset="40%" stopColor="#D4B57A"/>
          <stop offset="100%" stopColor="#A07888" stopOpacity="0.5"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

// Mapa de iconos por tipo de desastre
export const DisasterIconMap = {
  earthquake: EarthquakeIcon,
  tsunami: TsunamiIcon,
  volcano: VolcanoIcon,
  wildfire: WildfireIcon,
  flood: FloodIcon,
  storm: StormIcon,
  landslide: LandslideIcon,
} as const

export type DisasterIconType = keyof typeof DisasterIconMap
