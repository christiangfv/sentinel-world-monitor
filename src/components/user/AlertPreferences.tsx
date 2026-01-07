'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { DisasterType, AlertPreference } from '@/lib/types';
import { DISASTER_TYPES, DISASTER_CONFIGS } from '@/lib/constants/disasters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Spinner';

interface AlertPreferencesProps {
  className?: string;
}

export function AlertPreferences({ className = '' }: AlertPreferencesProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Record<DisasterType, AlertPreference>>({} as Record<DisasterType, AlertPreference>);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<DisasterType | null>(null);

  // Cargar preferencias desde Firestore
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        // Aquí iría la llamada a la función de Firestore
        // Por ahora, valores por defecto
        const defaultPrefs: Record<DisasterType, AlertPreference> = {} as Record<DisasterType, AlertPreference>;

        DISASTER_TYPES.forEach(type => {
          defaultPrefs[type] = {
            disasterType: type,
            minSeverity: 1,
            pushEnabled: true,
            emailEnabled: false
          };
        });

        setPreferences(defaultPrefs);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.uid]);

  const handlePreferenceChange = async (
    disasterType: DisasterType,
    field: keyof AlertPreference,
    value: any
  ) => {
    try {
      setSaving(disasterType);

      // Actualizar estado local
      setPreferences(prev => ({
        ...prev,
        [disasterType]: {
          ...prev[disasterType],
          [field]: value
        }
      }));

      // Aquí iría la llamada a Firestore para guardar
      // await updateAlertPreference(user!.uid, disasterType, { [field]: value });

      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Error updating preference:', error);
      // Revertir cambio en caso de error
    } finally {
      setSaving(null);
    }
  };

  const handleSelectAll = () => {
    DISASTER_TYPES.forEach(type => {
      if (!preferences[type]?.pushEnabled) {
        handlePreferenceChange(type, 'pushEnabled', true);
      }
    });
  };

  const handleClearAll = () => {
    DISASTER_TYPES.forEach(type => {
      if (preferences[type]?.pushEnabled) {
        handlePreferenceChange(type, 'pushEnabled', false);
      }
    });
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            Debes iniciar sesión para gestionar tus preferencias de alertas
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <LoadingSpinner text="Cargando preferencias..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Preferencias de Alertas</CardTitle>
            <CardDescription>
              Configura qué tipos de desastres quieres monitorear y cómo recibir las alertas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Activar Todas
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Desactivar Todas
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {DISASTER_TYPES.map(disasterType => {
            const config = DISASTER_CONFIGS[disasterType];
            const pref = preferences[disasterType];
            const isSaving = saving === disasterType;

            if (!pref) return null;

            return (
              <div key={disasterType} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{config.nameEs}</h3>
                      <p className="text-sm text-muted-foreground">{config.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Severidad mínima */}
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Severidad mín.</div>
                      <select
                        value={pref.minSeverity}
                        onChange={(e) => handlePreferenceChange(disasterType, 'minSeverity', parseInt(e.target.value))}
                        disabled={isSaving}
                        className="text-sm border border-border rounded px-2 py-1 disabled:opacity-50"
                      >
                        {[1, 2, 3, 4].map(severity => (
                          <option key={severity} value={severity}>
                            {severity}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Push notifications */}
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Push</div>
                      <input
                        type="checkbox"
                        checked={pref.pushEnabled}
                        onChange={(e) => handlePreferenceChange(disasterType, 'pushEnabled', !pref.pushEnabled)}
                        disabled={isSaving}
                        className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
                      />
                    </div>

                    {/* Email notifications */}
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Email</div>
                      <input
                        type="checkbox"
                        checked={pref.emailEnabled}
                        onChange={(e) => handlePreferenceChange(disasterType, 'emailEnabled', !pref.emailEnabled)}
                        disabled={isSaving}
                        className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
                      />
                    </div>

                    {/* Estado */}
                    <div className="text-right">
                      {isSaving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Badge variant={pref.pushEnabled ? 'secondary' : 'outline'}>
                          {pref.pushEnabled ? 'Activo' : 'Inactivo'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Etiquetas de severidad */}
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Niveles de severidad:</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(config.severityLabels).map(([level, label]) => (
                      <Badge
                        key={level}
                        variant={parseInt(level) >= pref.minSeverity ? 'outline' : 'secondary'}
                        className="text-xs"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">💡 Consejos</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Severidad mínima:</strong> Solo recibirás alertas para eventos de esta severidad o superior</li>
            <li>• <strong>Notificaciones push:</strong> Alertas en tiempo real en tu dispositivo</li>
            <li>• <strong>Notificaciones email:</strong> Resúmenes diarios por correo electrónico</li>
            <li>• Puedes ajustar estas preferencias en cualquier momento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
