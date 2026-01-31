'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

// Animated counter with dramatic reveal
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { 
  end: number; 
  duration?: number; 
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      // Ease out cubic for dramatic effect
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Pulsing emergency beacon
function EmergencyBeacon({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="relative w-3 h-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 rounded-full bg-sakura animate-ping opacity-75" />
      <div className="absolute inset-0 rounded-full bg-sakura" />
    </div>
  )
}

// Radar grid background effect
function RadarGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      {/* Horizontal lines */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute w-full h-px bg-plasma"
          style={{ top: `${(i + 1) * 5}%` }}
        />
      ))}
      {/* Vertical lines */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute h-full w-px bg-plasma"
          style={{ left: `${(i + 1) * 5}%` }}
        />
      ))}
      {/* Concentric circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[...Array(5)].map((_, i) => (
          <div
            key={`c-${i}`}
            className="absolute rounded-full border border-plasma"
            style={{
              width: `${(i + 1) * 300}px`,
              height: `${(i + 1) * 300}px`,
              top: `${-(i + 1) * 150}px`,
              left: `${-(i + 1) * 150}px`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Scan line animation
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-plasma/5 via-plasma/10 to-transparent animate-scan" />
    </div>
  )
}

// Glitch text effect
function GlitchText({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 text-sakura/50 animate-glitch-1 z-0" 
        aria-hidden="true"
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-mist/50 animate-glitch-2 z-0" 
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
}

// Live event ticker
function LiveTicker() {
  const events = [
    { type: 'EARTHQUAKE', location: 'Japan', magnitude: '5.2', time: '12m ago' },
    { type: 'FLOOD', location: 'Bangladesh', severity: 'High', time: '47m ago' },
    { type: 'WILDFIRE', location: 'California', acres: '2,400', time: '2h ago' },
    { type: 'CYCLONE', location: 'Philippines', category: '3', time: '4h ago' },
  ]

  return (
    <div className="overflow-hidden relative">
      <div className="flex animate-ticker">
        {[...events, ...events].map((event, i) => (
          <div 
            key={i} 
            className="flex items-center gap-4 px-8 py-3 border-r border-plasma/20 whitespace-nowrap"
          >
            <span className="text-xs font-mono text-smoke uppercase tracking-wider">{event.type}</span>
            <span className="text-sm font-semibold text-muted">{event.location}</span>
            <span className="text-xs text-plasma">{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Feature card with offset hover
function FeatureCard({ 
  icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  index: number;
}) {
  const isEven = index % 2 === 0
  
  return (
    <div 
      className={`group relative reveal-item ${isEven ? 'lg:translate-y-12' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Accent line */}
      <div className={`absolute ${isEven ? '-left-4' : '-right-4'} top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-plasma/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative glass-panel rounded-2xl p-8 hover:border-plasma/30 transition-all duration-500 group-hover:bg-shadow/80 overflow-hidden">
        {/* Ambient glow on hover */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-plasma/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10">
          {/* Number index */}
          <span className="absolute -top-2 -left-2 text-[8rem] font-black text-plasma/5 font-display leading-none select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-plasma/20 to-transparent flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-muted mb-3 font-display tracking-tight">{title}</h3>
            <p className="text-smoke leading-relaxed text-sm">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stats card with dramatic typography
function StatCard({ value, label, suffix = '', prefix = '', accent = false }: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  accent?: boolean;
}) {
  return (
    <div className="relative group">
      <div className={`text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tighter leading-none ${accent ? 'text-plasma' : 'text-muted'}`}>
        <AnimatedCounter end={value} suffix={suffix} prefix={prefix} />
      </div>
      <div className="mt-2 text-sm uppercase tracking-[0.2em] text-smoke font-medium">{label}</div>
      {/* Underline accent */}
      <div className={`mt-4 h-px w-full ${accent ? 'bg-gradient-to-r from-plasma via-plasma to-transparent' : 'bg-gradient-to-r from-smoke/30 to-transparent'}`} />
    </div>
  )
}

export default function LandingPage() {
  useAuth() // Initialize auth context
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouse)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <div className="min-h-screen bg-abyss text-muted overflow-x-hidden">
      {/* Dynamic cursor glow */}
      <div 
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 transition-transform duration-100"
        style={{
          background: 'radial-gradient(circle, rgba(212,181,122,0.03) 0%, transparent 70%)',
          left: mousePos.x - 250,
          top: mousePos.y - 250,
        }}
      />

      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-shadow/30 to-abyss" />
        <RadarGrid />
        <ScanLine />
        
        {/* Ambient orbs */}
        <div 
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-plasma/[0.03] blur-[150px] animate-ambient-glow"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-mist/[0.04] blur-[120px]"
          style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-sakura/[0.02] blur-[100px]"
        />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-noise" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500" style={{ 
        backgroundColor: scrollY > 50 ? 'rgba(13, 14, 20, 0.85)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(24px)' : 'none'
      }}>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-300">
                <Image src="/logo.svg" alt="Sentinel" fill className="object-contain" />
              </div>
              <span className="font-black text-xl tracking-[0.15em] text-plasma font-display">SENTINEL</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#live" className="text-smoke hover:text-plasma transition-colors font-medium text-sm tracking-wide">Live Feed</a>
              <a href="#features" className="text-smoke hover:text-plasma transition-colors font-medium text-sm tracking-wide">Features</a>
              <a href="#mission" className="text-smoke hover:text-plasma transition-colors font-medium text-sm tracking-wide">Mission</a>
            </div>

            <Link 
              href="/monitor"
              className="relative px-6 py-2.5 bg-plasma text-abyss font-bold rounded-lg hover:bg-plasma-hover transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 text-sm tracking-wide">LAUNCH</span>
              <div className="absolute inset-0 bg-gradient-to-r from-plasma-hover to-plasma opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric layout */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-12 pt-24 pb-12">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left content */}
            <div className="lg:col-span-7 relative z-10">
              {/* Live status badge */}
              <div className="inline-flex items-center gap-3 mb-8 reveal-item">
                <EmergencyBeacon />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-sakura">
                  MONITORING ACTIVE
                </span>
                <span className="h-4 w-px bg-smoke/30" />
                <span className="text-xs font-mono text-smoke">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Main headline - Typography as design */}
              <h1 className="font-display font-black leading-[0.85] tracking-tighter mb-8">
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-muted reveal-item" style={{ animationDelay: '100ms' }}>
                  GLOBAL
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl reveal-item" style={{ animationDelay: '200ms' }}>
                  <GlitchText className="text-plasma">DISASTER</GlitchText>
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-muted reveal-item" style={{ animationDelay: '300ms' }}>
                  INTELLIGENCE
                </span>
              </h1>

              {/* Subtitle with accent */}
              <p className="text-lg md:text-xl text-smoke max-w-xl leading-relaxed mb-12 reveal-item" style={{ animationDelay: '400ms' }}>
                Real-time aggregation and analysis of natural disasters worldwide. 
                <span className="text-muted font-semibold"> See everything. React faster.</span>
              </p>

              {/* CTA group */}
              <div className="flex flex-col sm:flex-row items-start gap-4 reveal-item" style={{ animationDelay: '500ms' }}>
                <Link 
                  href="/monitor"
                  className="group relative px-8 py-4 bg-plasma text-abyss font-bold rounded-xl text-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span>Access Live Monitor</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
                
                <a 
                  href="#features"
                  className="px-8 py-4 text-smoke hover:text-muted font-medium flex items-center gap-2 transition-colors"
                >
                  <span>Explore Features</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right side - Live stats panel */}
            <div className="lg:col-span-5 relative">
              <div className="relative reveal-item" style={{ animationDelay: '600ms' }}>
                {/* Decorative frame */}
                <div className="absolute -inset-4 border border-plasma/10 rounded-3xl" />
                <div className="absolute -inset-8 border border-plasma/5 rounded-[2rem]" />
                
                <div className="glass-panel rounded-2xl p-8 lg:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono uppercase tracking-[0.15em] text-smoke">Live Statistics</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-mono text-green-500">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <StatCard value={127} label="Active Events" accent />
                    <StatCard value={23} label="Countries Affected" />
                    <StatCard value={2} suffix="M+" label="People in Affected Areas" />
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-smoke">Last updated</span>
                      <span className="font-mono text-mist">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <section id="live" className="relative py-4 border-y border-plasma/10 bg-shadow/30 backdrop-blur-sm">
        <LiveTicker />
      </section>

      {/* Impact Section - Editorial style */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-[1600px] mx-auto">
          {/* Large decorative number */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-[30rem] font-black font-display text-plasma/[0.02] leading-none select-none pointer-events-none">
            24
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
            <div className="reveal-item">
              <span className="text-plasma font-mono text-sm uppercase tracking-[0.2em] mb-4 block">Why It Matters</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[0.9] mb-6">
                Every second<br />
                <span className="text-plasma">counts.</span>
              </h2>
              <p className="text-lg text-smoke leading-relaxed mb-8">
                In the critical hours following a disaster, access to accurate, real-time information 
                can mean the difference between life and death. Sentinel provides that edge.
              </p>
              
              {/* Quick stats inline */}
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-black font-display text-muted">500+</div>
                  <div className="text-sm text-smoke">Events/Day</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-3xl font-black font-display text-muted">195</div>
                  <div className="text-sm text-smoke">Countries</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-3xl font-black font-display text-muted">&lt;5min</div>
                  <div className="text-sm text-smoke">Update Time</div>
                </div>
              </div>
            </div>
            
            {/* Visual element - Abstract representation */}
            <div className="relative aspect-square max-w-lg mx-auto reveal-item" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 rounded-full border border-plasma/20 animate-[spin_60s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-sakura" />
              </div>
              <div className="absolute inset-8 rounded-full border border-mist/20 animate-[spin_45s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-plasma" />
              </div>
              <div className="absolute inset-16 rounded-full border border-plasma/10 animate-[spin_30s_linear_infinite]">
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-mist" />
              </div>
              <div className="absolute inset-24 rounded-full bg-gradient-to-br from-plasma/10 to-transparent flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-black font-display text-plasma">24/7</div>
                  <div className="text-sm text-smoke uppercase tracking-widest mt-2">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Section header - asymmetric */}
          <div className="grid lg:grid-cols-12 gap-8 mb-20">
            <div className="lg:col-span-8">
              <span className="text-plasma font-mono text-sm uppercase tracking-[0.2em] mb-4 block reveal-item">Capabilities</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight reveal-item" style={{ animationDelay: '100ms' }}>
                Built for the<br />
                <span className="text-gradient-plasma">modern crisis response</span>
              </h2>
            </div>
            <div className="lg:col-span-4 flex items-end reveal-item" style={{ animationDelay: '200ms' }}>
              <p className="text-smoke">
                Aggregating data from GDACS, NASA, USGS, and government agencies into one unified platform.
              </p>
            </div>
          </div>

          {/* Features grid - staggered */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              index={0}
              icon={
                <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              }
              title="3D Globe Visualization"
              description="Immersive view of global events with real-time data overlay, heat maps, and cluster analysis."
            />
            <FeatureCard
              index={1}
              icon={
                <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Instant Alerts"
              description="Push notifications with customizable severity thresholds and geographic filters."
            />
            <FeatureCard
              index={2}
              icon={
                <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="AI Analysis"
              description="Machine learning models that predict escalation patterns and assess impact zones."
            />
            <FeatureCard
              index={3}
              icon={
                <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              }
              title="Smart Filtering"
              description="Drill down by event type, magnitude, affected population, and temporal range."
            />
            <FeatureCard
              index={4}
              icon={
                <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Historical Trends"
              description="Decades of disaster data for research, planning, and pattern recognition."
            />
            <FeatureCard
              index={5}
              icon={
                <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="API Access"
              description="RESTful endpoints for integration with your own systems and workflows."
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative py-32 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="glass-panel rounded-[2rem] p-8 md:p-12 lg:p-16 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-plasma/5 to-transparent" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-mist/5 blur-[100px]" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-plasma font-mono text-sm uppercase tracking-[0.2em] mb-4 block">Our Mission</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-display tracking-tight leading-tight mb-6">
                  Democratizing access to
                  <span className="text-plasma"> critical information</span>
                </h2>
                <p className="text-lg text-smoke leading-relaxed mb-8">
                  Sentinel exists because everyone—from emergency responders to concerned citizens—deserves 
                  real-time visibility into the events shaping our world.
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-smoke">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-plasma" />
                    Open Data
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mist" />
                    Trusted Sources
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sakura" />
                    Real-time Updates
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-center lg:items-end text-right">
                <div className="text-[10rem] md:text-[12rem] font-black font-display text-plasma/20 leading-none">
                  0
                </div>
                <div className="text-xl font-semibold text-muted -mt-8">
                  Cost to access
                </div>
                <div className="text-smoke mt-2">
                  Free. Forever. For everyone.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-6 reveal-item">
            Start monitoring
            <span className="text-plasma"> now</span>
          </h2>
          <p className="text-xl text-smoke mb-12 reveal-item" style={{ animationDelay: '100ms' }}>
            No registration required. Just open and explore.
          </p>
          <Link 
            href="/monitor"
            className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-plasma to-plasma-hover text-abyss font-bold rounded-2xl text-xl hover:shadow-[0_0_80px_rgba(212,181,122,0.4)] transition-all duration-500 hover:scale-[1.02] reveal-item"
            style={{ animationDelay: '200ms' }}
          >
            <span>Launch Sentinel</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative py-12 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src="/logo.svg" alt="Sentinel" fill className="object-contain" />
              </div>
              <span className="font-bold text-lg text-plasma font-display tracking-[0.1em]">SENTINEL</span>
            </div>
            
            <p className="text-smoke text-sm">
              © {new Date().getFullYear()} Sentinel World Monitor. Built by{' '}
              <a href="https://fuentesvalenzuela.cl" target="_blank" rel="noopener noreferrer" className="text-plasma hover:text-plasma/80 transition-colors">
                Christian Fuentes
              </a>
            </p>
            
            <div className="flex items-center gap-6">
              <a href="https://github.com/christiangfv/sentinel-world-monitor" target="_blank" rel="noopener noreferrer" className="text-smoke hover:text-plasma transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom styles */}
      <style jsx global>{`
        /* Reveal animation for scroll */
        .reveal-item {
          opacity: 0;
          transform: translateY(20px);
          animation: reveal 0.8s ease-out forwards;
        }

        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scan line animation */
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        .animate-scan {
          animation: scan 8s linear infinite;
        }

        /* Ticker animation */
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-ticker {
          animation: ticker 30s linear infinite;
        }

        /* Glitch effect */
        @keyframes glitch-1 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(40% 0 40% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(60% 0 20% 0); transform: translate(-1px, 1px); }
          80% { clip-path: inset(80% 0 5% 0); transform: translate(1px, -1px); }
        }

        @keyframes glitch-2 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(60% 0 20% 0); transform: translate(2px, -2px); }
          40% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(1px, -1px); }
          80% { clip-path: inset(40% 0 40% 0); transform: translate(-1px, 1px); }
        }

        .animate-glitch-1 {
          animation: glitch-1 3s infinite;
        }

        .animate-glitch-2 {
          animation: glitch-2 3s infinite;
          animation-delay: 0.1s;
        }

        /* Noise texture */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}
