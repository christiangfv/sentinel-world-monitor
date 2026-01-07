import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
            <p className="text-muted-foreground">
              Personaliza tu experiencia con Sentinel
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Zonas de monitoreo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📍 Zonas de Monitoreo
                </CardTitle>
                <CardDescription>
                  Configura las áreas geográficas que quieres monitorear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p>No tienes zonas configuradas</p>
                  <Button className="mt-4">
                    Agregar Primera Zona
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Próximamente:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Seleccionar ubicación en mapa interactivo</li>
                    <li>• Configurar radio de alerta (km)</li>
                    <li>• Nombrar zonas personalizadas</li>
                    <li>• Activar/desactivar zonas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preferencias de alertas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔔 Preferencias de Alertas
                </CardTitle>
                <CardDescription>
                  Configura qué tipos de eventos quieres monitorear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🌍</span>
                      <div>
                        <div className="font-medium">Sismos</div>
                        <div className="text-xs text-muted-foreground">
                          Terremotos y actividad sísmica
                        </div>
                      </div>
                    </div>
                    <Badge variant="severity1">Severidad 1+</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🌊</span>
                      <div>
                        <div className="font-medium">Tsunamis</div>
                        <div className="text-xs text-muted-foreground">
                          Alertas de tsunami
                        </div>
                      </div>
                    </div>
                    <Badge variant="severity1">Severidad 1+</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔥</span>
                      <div>
                        <div className="font-medium">Incendios</div>
                        <div className="text-xs text-muted-foreground">
                          Incendios forestales
                        </div>
                      </div>
                    </div>
                    <Badge variant="severity1">Severidad 1+</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💧</span>
                      <div>
                        <div className="font-medium">Inundaciones</div>
                        <div className="text-xs text-muted-foreground">
                          Inundaciones y crecidas
                        </div>
                      </div>
                    </div>
                    <Badge variant="severity1">Severidad 1+</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Configurar Preferencias Detalladas
                </Button>
              </CardContent>
            </Card>

            {/* Configuración general */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚙️ Configuración General
                </CardTitle>
                <CardDescription>
                  Ajustes generales de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Idioma</span>
                    <Badge>Español</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tema</span>
                    <Badge>Sistema</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Sonido</span>
                    <Badge variant="secondary">Activado</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Notificaciones Push</span>
                    <Badge variant="secondary">Activadas</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Editar Configuración
                </Button>
              </CardContent>
            </Card>

            {/* Información de la cuenta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👤 Cuenta
                </CardTitle>
                <CardDescription>
                  Información de tu cuenta de usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">usuario@ejemplo.com</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Miembro desde</div>
                    <div className="font-medium">Enero 2025</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <Badge variant="secondary">Activo</Badge>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Cambiar Contraseña
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                    Eliminar Cuenta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
