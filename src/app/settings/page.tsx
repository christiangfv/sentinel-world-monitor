import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { ZoneManager } from "@/components/user/ZoneManager";
import { AlertPreferences } from "@/components/user/AlertPreferences";
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
            <ZoneManager />

            {/* Preferencias de alertas */}
            <AlertPreferences />

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
