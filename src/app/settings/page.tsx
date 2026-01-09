'use client';

import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { ZoneManager } from "@/components/user/ZoneManager";
import { AlertPreferences } from "@/components/user/AlertPreferences";
import { GeneralSettings } from "@/components/user/GeneralSettings";
import { AccountSettings } from "@/components/user/AccountSettings";

type TabId = 'zones' | 'alerts' | 'general' | 'account';

const tabs = [
  {
    id: 'zones' as TabId,
    label: 'Zonas',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Gestiona tus zonas de monitoreo'
  },
  {
    id: 'alerts' as TabId,
    label: 'Alertas',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    description: 'Configura tus preferencias de notificaciones'
  },
  {
    id: 'general' as TabId,
    label: 'General',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Ajustes generales de la aplicación'
  },
  {
    id: 'account' as TabId,
    label: 'Cuenta',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    description: 'Información de tu cuenta'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('zones');

  const renderContent = () => {
    switch (activeTab) {
      case 'zones':
        return <ZoneManager />;
      case 'alerts':
        return <AlertPreferences />;
      case 'general':
        return <GeneralSettings />;
      case 'account':
        return <AccountSettings />;
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-container w-10 h-10">
                <svg className="w-5 h-5 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
                <p className="text-muted-foreground text-sm">
                  Personaliza tu experiencia con Sentinel
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0 animate-fade-in-up stagger-1">
              <nav className="glass-panel rounded-2xl p-2 space-y-1 lg:sticky lg:top-24">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                      activeTab === tab.id
                        ? 'bg-plasma/15 text-plasma border border-plasma/25 shadow-[0_0_20px_rgba(212,181,122,0.1)]'
                        : 'text-smoke hover:text-muted hover:bg-shadow/50 border border-transparent'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className={`transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {tab.icon}
                    </span>
                    <span className="font-medium text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 animate-fade-in-up stagger-2">
              {/* Section Header */}
              <div className="mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-plasma">{currentTab?.icon}</span>
                  <h2 className="text-xl font-semibold text-foreground">{currentTab?.label}</h2>
                </div>
                <p className="text-sm text-smoke mt-1">{currentTab?.description}</p>
              </div>

              {/* Dynamic Content */}
              <div className="animate-fade-in-scale">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
